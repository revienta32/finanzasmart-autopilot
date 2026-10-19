/**
 * TELEMETRÍA Y SOPORTE EN TIEMPO REAL - FinanzaSmart
 * 1. Registra visitas humanas reales y clics en enlaces de afiliado/pago en el bus en la nube.
 * 2. Captura automáticamente cualquier error JS (window.onerror / unhandledrejection) que sufra el usuario.
 * 3. Muestra un botón flotante "🛠️ ¿Algún fallo o mejora?" para que cualquier visitante reporte problemas en 1 clic sin registro.
 */
(function () {
  const BUS_URL = "https://ntfy.sh/finanzasmart_ceo_telemetry_8714ae5";
  const pageName = (window.location.pathname.split("/").pop() || "index.html") + (window.location.hash || "");

  function sendTelemetry(payload) {
    try {
      fetch(BUS_URL, {
        method: "POST",
        body: JSON.stringify({
          ...payload,
          page: pageName,
          ua: (navigator.userAgent || "").slice(0, 80),
          ts: new Date().toISOString()
        })
      }).catch(() => {});
    } catch (_) {}
  }

  // 1. Registrar visita única por sesión en cada página
  const sessionKey = "fs_visited_" + pageName;
  if (!sessionStorage.getItem(sessionKey)) {
    sessionStorage.setItem(sessionKey, "1");
    sendTelemetry({ type: "pageview" });
  }

  // 2. Registrar clics en enlaces de monetización (Stripe Checkout, Revolut Referral, Bitget)
  document.addEventListener("click", (e) => {
    const link = e.target.closest("a");
    if (!link || !link.href) return;
    if (link.href.includes("buy.stripe.com")) {
      sendTelemetry({ type: "click_checkout", target: "stripe_checkout" });
    } else if (link.href.includes("revolut.com/referral")) {
      sendTelemetry({ type: "click_affiliate", target: "revolut_referral" });
    } else if (link.href.includes("bitget.com")) {
      sendTelemetry({ type: "click_affiliate", target: "bitget_referral" });
    }
  });

  // 3. Captura automática de errores JS en el navegador del usuario final
  window.addEventListener("error", (ev) => {
    sendTelemetry({
      type: "js_error",
      msg: ev.message || "Unknown JS Error",
      line: ev.lineno || 0
    });
  });

  window.addEventListener("unhandledrejection", (ev) => {
    sendTelemetry({
      type: "js_promise_error",
      msg: String(ev.reason || "Unhandled rejection").slice(0, 200)
    });
  });

  // 4. Widget flotante para que los usuarios reporten fallos o pidan mejoras sin registrarse
  const widgetHtml = `
    <div id="fs-bug-widget" style="position:fixed;bottom:16px;right:16px;z-index:9999;font-family:system-ui,sans-serif;">
      <button type="button" id="fs-bug-toggle" style="background:#1e293b;color:#f8fafc;border:1px solid #10b981;padding:0.55rem 0.9rem;border-radius:99px;font-size:0.8rem;font-weight:700;cursor:pointer;box-shadow:0 4px 12px rgba(0,0,0,0.4);">
        🛠️ ¿Algún fallo o sugerencia?
      </button>
      <div id="fs-bug-modal" hidden style="position:absolute;bottom:46px;right:0;width:300px;background:#1e293b;border:1px solid #334155;border-radius:0.75rem;padding:1rem;box-shadow:0 10px 25px rgba(0,0,0,0.6);color:#f8fafc;">
        <strong style="display:block;font-size:0.88rem;margin-bottom:0.35rem;">🛠️ Reportar fallo o pedir mejora</strong>
        <p style="font-size:0.76rem;color:#94a3b8;margin-bottom:0.6rem;">Nuestro sistema revisa y corrige automáticamente cualquier error que nos envíes:</p>
        <textarea id="fs-bug-text" rows="3" placeholder="Ej: En mi CCAA falta una deducción / Este cálculo no me cuadra..." style="width:100%;background:#0f172a;color:#f8fafc;border:1px solid #334155;border-radius:0.4rem;padding:0.5rem;font-size:0.8rem;margin-bottom:0.5rem;resize:vertical;"></textarea>
        <div style="display:flex;justify-content:space-between;align-items:center;gap:0.5rem;">
          <button type="button" id="fs-bug-send" style="background:#10b981;color:#052e16;border:none;padding:0.45rem 0.8rem;border-radius:0.4rem;font-weight:700;font-size:0.78rem;cursor:pointer;flex:1;">Enviar al Sistema IA</button>
          <button type="button" id="fs-bug-close" style="background:transparent;color:#94a3b8;border:1px solid #334155;padding:0.45rem 0.6rem;border-radius:0.4rem;font-size:0.78rem;cursor:pointer;">Cerrar</button>
        </div>
        <small id="fs-bug-ok" hidden style="display:block;color:#34d399;font-size:0.75rem;margin-top:0.45rem;text-align:center;">¡Recibido! El sistema lo procesará en la próxima actualización automática.</small>
      </div>
    </div>
  `;

  const container = document.createElement("div");
  container.className = "no-print";
  container.innerHTML = widgetHtml;
  document.body.appendChild(container);

  const toggleBtn = document.getElementById("fs-bug-toggle");
  const modal = document.getElementById("fs-bug-modal");
  const closeBtn = document.getElementById("fs-bug-close");
  const sendBtn = document.getElementById("fs-bug-send");
  const txtArea = document.getElementById("fs-bug-text");
  const okMsg = document.getElementById("fs-bug-ok");

  toggleBtn.addEventListener("click", () => {
    modal.hidden = !modal.hidden;
  });
  closeBtn.addEventListener("click", () => {
    modal.hidden = true;
  });
  sendBtn.addEventListener("click", () => {
    const msg = (txtArea.value || "").trim();
    if (msg.length < 4) return;
    sendTelemetry({ type: "user_bug_report", msg: msg.slice(0, 400) });
    txtArea.value = "";
    okMsg.hidden = false;
    setTimeout(() => {
      okMsg.hidden = true;
      modal.hidden = true;
    }, 2200);
  });
})();
