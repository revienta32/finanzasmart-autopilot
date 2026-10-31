/**
 * TELEMETRÍA CON CONSENTIMIENTO PREVIO (OPT-IN ESTRICTO), MINIMIZACIÓN DE DATOS Y SOPORTE - PureAI Studio
 * 1. Cumple Art. 22.2 LSSI-CE y Art. 5.1.c RGPD (Minimización): por defecto NO transmite eventos automáticos de navegación,
 *    User-Agent, zona horaria ni huellas de dispositivo a servidores externos; los eventos se guardan solo localmente en sessionStorage.
 * 2. Solo si el usuario otorga consentimiento expreso (pureai_telemetry_consent === "granted") o envía voluntariamente el formulario
 *    de soporte marcando la casilla de privacidad, se transmite el evento minimizado con enmascaramiento PII (maskSensitiveSupportText).
 */
(function () {
  const BUS_URL = (typeof window !== "undefined" && window.PUREAI_TELEMETRY_ENDPOINT) || "/telemetry";
  const pageName = (window.location.pathname.split("/").pop() || "index.html") + (window.location.hash || "");

  function maskSensitiveSupportText(raw) {
    return String(raw || "")
      .replace(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g, "[EMAIL_MASKED]")
      .replace(/\bPRO-[A-Z0-9]{4}-[A-Z0-9]{4}\b/gi, "PRO-****-****")
      .replace(/\b(cs_live_|cs_test_|sub_|pi_)[a-zA-Z0-9]{10,}\b/g, "$1***MASKED***");
  }

  function classifyTrafficChannel(referrerStr, searchStr) {
    const q = String(searchStr || "").toLowerCase();
    const ref = String(referrerStr || "").toLowerCase();
    if (/[?&](ext_img|ext_txt)=/.test(q) || q.includes("utm_source=extension")) return "chrome_extension";
    if (/[?&]aff=[a-z0-9_.-]+/.test(q)) return "affiliate_partner";
    if (q.includes("utm_source=reddit") || ref.includes("reddit.com") || ref.includes("redd.it")) return "social_reddit";
    if (q.includes("utm_source=youtube") || ref.includes("youtube.com") || ref.includes("youtu.be")) return "social_youtube";
    if (q.includes("utm_source=tiktok") || ref.includes("tiktok.com")) return "social_tiktok";
    if (/google\.|bing\.com|duckduckgo\.com|yahoo\.com|ecosia\.org|yandex\.|baidu\.com/.test(ref)) return "organic_search";
    if (ref && !ref.includes("pureaistudios.com") && !ref.includes("localhost")) return "referral_other";
    return "direct";
  }

  function getIsoCohortWeek(d) {
    const dt = d instanceof Date ? new Date(d.getTime()) : new Date();
    dt.setUTCDate(dt.getUTCDate() + 4 - (dt.getUTCDay() || 7));
    const yearStart = new Date(Date.UTC(dt.getUTCFullYear(), 0, 1));
    const weekNo = Math.ceil((((dt - yearStart) / 86400000) + 1) / 7);
    return dt.getUTCFullYear() + "-W" + String(weekNo).padStart(2, "0");
  }

  function hasTelemetryConsent() {
    try {
      return localStorage.getItem("pureai_telemetry_consent") === "granted";
    } catch (_) {
      return false;
    }
  }

  function setTelemetryConsent(granted) {
    try {
      localStorage.setItem("pureai_telemetry_consent", granted ? "granted" : "denied");
    } catch (_) {}
  }

  function getAnonymousAnalyticsContext() {
    const todayStr = new Date().toISOString().slice(0, 10);
    const currentWeek = getIsoCohortWeek(new Date());
    let isReturning = false;
    let cohortWeek = currentWeek;
    try {
      const storedFirstDay = localStorage.getItem("pureai_first_day");
      const storedCohort = localStorage.getItem("pureai_cohort_week");
      if (storedFirstDay) {
        if (storedFirstDay !== todayStr) isReturning = true;
      } else {
        localStorage.setItem("pureai_first_day", todayStr);
      }
      if (storedCohort) {
        cohortWeek = storedCohort;
      } else {
        localStorage.setItem("pureai_cohort_week", currentWeek);
      }
    } catch (_) {}

    const lang = ((typeof navigator !== "undefined" && navigator.language) || "en").slice(0, 2).toLowerCase();
    const channel = classifyTrafficChannel(typeof document !== "undefined" ? document.referrer : "", window.location.search || "");
    let userTier = isReturning ? "free_returning" : "free_new";
    try {
      if (localStorage.getItem("pureai_studio_pro") === "true") {
        userTier = "pro_active";
      } else if (parseInt(localStorage.getItem("pureai_img_used") || "0", 10) >= 3) {
        userTier = "free_exhausted";
      }
    } catch (_) {}

    // Minimización estricta (RGPD Art. 5.1.c): no incluye User-Agent, ni zona horaria exacta, ni huella de dispositivo
    return { lang, channel, isReturning, cohortWeek, userTier };
  }

  if (typeof window !== "undefined") {
    window.maskSensitiveSupportText = maskSensitiveSupportText;
    window.classifyTrafficChannel = classifyTrafficChannel;
    window.getIsoCohortWeek = getIsoCohortWeek;
    window.hasPureAiTelemetryConsent = hasTelemetryConsent;
    window.setPureAiTelemetryConsent = setTelemetryConsent;
  }

  function recordLocalFunnelEvent(minimizedEvent) {
    try {
      const raw = sessionStorage.getItem("pureai_local_funnel_log") || "[]";
      const list = JSON.parse(raw);
      list.push(minimizedEvent);
      if (list.length > 50) list.shift();
      sessionStorage.setItem("pureai_local_funnel_log", JSON.stringify(list));
    } catch (_) {}
  }

  function sendTelemetry(payload, options) {
    try {
      const ctx = getAnonymousAnalyticsContext();
      const minimized = {
        ...ctx,
        ...payload,
        page: pageName,
        ts: new Date().toISOString()
      };
      // Eliminar cualquier campo sensible o de huella si algún llamador lo pasara
      delete minimized.ua;
      delete minimized.countryTz;
      delete minimized.deviceFp;

      recordLocalFunnelEvent(minimized);

      const isExplicitUserSupportAction = Boolean(options && options.explicitUserConsent === true);
      if (!isExplicitUserSupportAction && !hasTelemetryConsent()) {
        return false;
      }

      fetch(BUS_URL, {
        method: "POST",
        body: JSON.stringify(minimized)
      }).catch(() => {});
      return true;
    } catch (_) {
      return false;
    }
  }

  if (typeof window !== "undefined") {
    window.sendPureAiAnalyticsEvent = sendTelemetry;
  }

  // 1. Atribución de Afiliados 40% (?aff=...)
  const affMatch = (window.location.search || "").match(/[?&]aff=([a-zA-Z0-9_.-]{2,36})/);
  if (affMatch && affMatch[1]) {
    try { localStorage.setItem("pureai_aff_partner", affMatch[1]); } catch (_) {}
  }
  const activeAff = (() => { try { return localStorage.getItem("pureai_aff_partner") || ""; } catch (_) { return ""; } })();
  if (activeAff && document.querySelectorAll) {
    document.querySelectorAll('a[href*="buy.stripe.com"]').forEach((a) => {
      if (a.href && !a.href.includes("client_reference_id=")) {
        a.href += (a.href.includes("?") ? "&" : "?") + "client_reference_id=aff_" + encodeURIComponent(activeAff);
      }
    });
  }

  const sessionKey = "fs_visited_" + pageName;
  if (!sessionStorage.getItem(sessionKey)) {
    sessionStorage.setItem(sessionKey, "1");
    const ctx = getAnonymousAnalyticsContext();
    sendTelemetry({
      type: "pageview",
      event_name: "session_start",
      aff: activeAff || undefined,
      isReturning: ctx.isReturning,
      cohortWeek: ctx.cohortWeek,
      channel: ctx.channel
    });
  }

  // 2. Registrar eventos de embudo en el buffer local (y solo en red si existe consentimiento opt-in)
  document.addEventListener("change", (e) => {
    const inp = e.target;
    if (!inp || !inp.id) return;
    if (inp.id === "img-input" || inp.id === "seo-quick-img" || inp.id === "quick-img-inp") {
      sendTelemetry({ type: "app_action", event_name: "file_selected", target: "user_uploaded_photo", isDemo: false });
    } else if (inp.id === "doc-input") {
      sendTelemetry({ type: "app_action", event_name: "file_selected", target: "user_uploaded_doc", isDemo: false });
    }
  });

  document.addEventListener("click", (e) => {
    const btn = e.target.closest("button");
    if (btn && btn.id) {
      if (btn.id === "btn-pwa-install") sendTelemetry({ type: "app_action", event_name: "lead_captured", target: "pwa_install_click" });
      else if (btn.id === "btn-scrub-img" || btn.id === "btn-inline-scrub") sendTelemetry({ type: "app_action", target: "image_scrub_download" });
      else if (btn.id === "btn-verify-clean") sendTelemetry({ type: "app_action", target: "forensic_verify_click" });
      else if (btn.id === "ui-btn-sample-img") sendTelemetry({ type: "app_action", target: "demo_photo_tested", isDemo: true });
      else if (btn.id === "ui-btn-scrub-txt") sendTelemetry({ type: "app_action", event_name: "tool_completed", tool_id: "txt_invisible_cleaner", isDemo: false, target: "text_watermark_scrub" });
      else if (btn.id === "ui-btn-humanize") sendTelemetry({ type: "app_action", event_name: "tool_completed", tool_id: "txt_invisible_cleaner", isDemo: false, target: "pro_humanizer_click" });
    }
    const link = e.target.closest("a");
    if (!link || !link.href) return;
    if (link.href.includes("buy.stripe.com")) {
      const planSelected = link.href.includes("5kQ28sfaa0Yt5zqfXI0000d") ? "PRO_ANNUAL_3900" : "PRO_MONTHLY_499";
      sendTelemetry({
        type: "click_checkout",
        event_name: "checkout_clicked",
        target: "stripe_checkout",
        plan_selected: planSelected
      });
    } else if (link.href.includes("chromewebstore.google.com") || link.href.includes("chrome-extension-pureai.zip")) {
      sendTelemetry({ type: "app_action", event_name: "lead_captured", tool_id: "chrome_ext_bridge", target: "chrome_extension_download" });
    }
  });

  // 3. Widget flotante de soporte con casilla de consentimiento explícito e información de privacidad
  const widgetHtml = `
    <div id="fs-bug-widget" style="position:fixed;bottom:16px;right:16px;z-index:9999;font-family:system-ui,sans-serif;">
      <button type="button" id="fs-bug-toggle" style="background:#1e293b;color:#f8fafc;border:1px solid #10b981;padding:0.55rem 0.9rem;border-radius:99px;font-size:0.8rem;font-weight:700;cursor:pointer;box-shadow:0 4px 12px rgba(0,0,0,0.4);">
        🛠️ ¿Algún fallo o sugerencia?
      </button>
      <div id="fs-bug-modal" hidden style="position:absolute;bottom:46px;right:0;width:310px;background:#1e293b;border:1px solid #334155;border-radius:0.75rem;padding:1rem;box-shadow:0 10px 25px rgba(0,0,0,0.6);color:#f8fafc;">
        <strong style="display:block;font-size:0.88rem;margin-bottom:0.35rem;">🛠️ Reportar fallo o pedir mejora</strong>
        <p style="font-size:0.74rem;color:#94a3b8;margin-bottom:0.5rem;">No incluyas datos sensibles; los emails y claves se enmascaran automáticamente antes del envío:</p>
        <textarea id="fs-bug-text" rows="3" placeholder="Ej: Duda sobre formato MP4 o sugerencia de mejora..." style="width:100%;background:#0f172a;color:#f8fafc;border:1px solid #334155;border-radius:0.4rem;padding:0.5rem;font-size:0.8rem;margin-bottom:0.45rem;resize:vertical;"></textarea>
        <label style="display:flex;align-items:flex-start;gap:6px;font-size:0.7rem;color:#cbd5e1;margin-bottom:0.45rem;cursor:pointer;">
          <input type="checkbox" id="fs-bug-consent" style="margin-top:2px;" />
          <span>Acepto enviar este mensaje a soporte conforme a la <a href="privacy-policy.html" target="_blank" style="color:#6ee7b7;">Política de Privacidad</a>.</span>
        </label>
        <label style="display:flex;align-items:flex-start;gap:6px;font-size:0.68rem;color:#94a3b8;margin-bottom:0.55rem;cursor:pointer;">
          <input type="checkbox" id="fs-telemetry-optin-chk" style="margin-top:2px;" />
          <span>Permitir telemetría técnica anónima (Opt-In voluntario, desactivado por defecto).</span>
        </label>
        <div style="display:flex;justify-content:space-between;align-items:center;gap:0.5rem;">
          <button type="button" id="fs-bug-send" style="background:#10b981;color:#052e16;border:none;padding:0.45rem 0.8rem;border-radius:0.4rem;font-weight:700;font-size:0.78rem;cursor:pointer;flex:1;">Enviar a Soporte</button>
          <button type="button" id="fs-bug-close" style="background:transparent;color:#94a3b8;border:1px solid #334155;padding:0.45rem 0.6rem;border-radius:0.4rem;font-size:0.78rem;cursor:pointer;">Cerrar</button>
        </div>
        <small id="fs-bug-ok" hidden style="display:block;color:#34d399;font-size:0.75rem;margin-top:0.45rem;text-align:center;">¡Recibido! Nuestro equipo lo revisará.</small>
      </div>
    </div>
  `;

  const container = document.createElement("div");
  container.className = "no-print";
  container.innerHTML = widgetHtml;
  if (document.body) {
    document.body.appendChild(container);
  }

  const toggleBtn = document.getElementById("fs-bug-toggle");
  const modal = document.getElementById("fs-bug-modal");
  const closeBtn = document.getElementById("fs-bug-close");
  const sendBtn = document.getElementById("fs-bug-send");
  const txtArea = document.getElementById("fs-bug-text");
  const consentChk = document.getElementById("fs-bug-consent");
  const optinChk = document.getElementById("fs-telemetry-optin-chk");
  const okMsg = document.getElementById("fs-bug-ok");

  if (optinChk) {
    optinChk.checked = hasTelemetryConsent();
    optinChk.addEventListener("change", () => {
      setTelemetryConsent(Boolean(optinChk.checked));
    });
  }

  if (toggleBtn && modal && closeBtn && sendBtn && txtArea && okMsg) {
    toggleBtn.addEventListener("click", () => {
      modal.hidden = !modal.hidden;
    });
    closeBtn.addEventListener("click", () => {
      modal.hidden = true;
    });
    sendBtn.addEventListener("click", () => {
      const msg = (txtArea.value || "").trim();
      if (msg.length < 4) return;
      if (consentChk && !consentChk.checked) return;
      sendTelemetry(
        { type: "user_bug_report", msg: maskSensitiveSupportText(msg).slice(0, 400) },
        { explicitUserConsent: true }
      );
      txtArea.value = "";
      okMsg.hidden = false;
      setTimeout(() => {
        okMsg.hidden = true;
        modal.hidden = true;
      }, 2200);
    });
  }

  // 4. Barra Flotante de Conversión (Sticky CTA) en las Landings SEO (solo planes Pro Mensual y Anual vigentes)
  const isMainStudio = /clean-ai-studio\.html|index\.html/i.test(pageName);
  if (!isMainStudio && typeof document !== "undefined" && document.body && !document.getElementById("pa-sticky-seo-bar")) {
    const stickyBar = document.createElement("div");
    stickyBar.id = "pa-sticky-seo-bar";
    stickyBar.className = "no-print";
    stickyBar.style.cssText =
      "position:fixed;bottom:0;left:0;right:0;z-index:9990;background:linear-gradient(90deg,rgba(14,9,28,0.96),rgba(24,14,46,0.96));backdrop-filter:blur(14px);border-top:1px solid rgba(0,229,163,0.4);padding:10px 16px;display:flex;justify-content:center;align-items:center;gap:12px;flex-wrap:wrap;font-family:system-ui,sans-serif;box-shadow:0 -10px 30px rgba(0,0,0,0.6);";
    stickyBar.innerHTML = `
      <span style="color:#f8fafc;font-size:0.82rem;font-weight:700;">🛡️ <strong>PureAI Studio:</strong> Limpia metadatos C2PA/EXIF y caracteres invisibles Unicode 100% en tu navegador</span>
      <a href="clean-ai-studio.html" style="background:linear-gradient(135deg,#00e5a3,#06b6d4);color:#042f1e;text-decoration:none;padding:6px 14px;border-radius:8px;font-size:0.78rem;font-weight:900;">🚀 Probar Gratis (3 Fotos)</a>
      <a href="https://buy.stripe.com/aFaaEY0fgcHbd1SeTE0000c" target="_blank" rel="noopener" style="background:rgba(168,85,247,0.2);border:1px solid #a855f7;color:#e9d5ff;text-decoration:none;padding:5px 12px;border-radius:8px;font-size:0.76rem;font-weight:800;">🔥 Pro Mensual -50% (4,99 €)</a>
      <a href="https://buy.stripe.com/5kQ28sfaa0Yt5zqfXI0000d" target="_blank" rel="noopener" style="background:rgba(56,189,248,0.18);border:1px solid #38bdf8;color:#bae6fd;text-decoration:none;padding:5px 12px;border-radius:8px;font-size:0.76rem;font-weight:800;">💎 Pro Anual (39 €/año)</a>
    `;
    document.body.appendChild(stickyBar);
  }
})();
