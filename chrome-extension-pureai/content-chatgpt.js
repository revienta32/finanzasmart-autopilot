/**
 * PureAI Studio Content Script (v1.2.1) — 1-Click "✨ Copiar Humanizado" inside ChatGPT & Claude
 * Includes 3 Free Daily Uses + Soft Paywall to Stripe (4,99 € Monthly FRIEND50 / 39 €/yr Annual) + Multi-Device Key (PRO-XXXX-YYYY) Unlock
 */
(function () {
  const MAX_DAILY_FREE = 3;
  const CLICHE_LIST = [
    { re: /\ben conclusión\b/gi, rep: "en definitiva" },
    { re: /\bcabe destacar que\b/gi, rep: "además" },
    { re: /\bes importante recordar que\b/gi, rep: "conviene tener claro que" },
    { re: /\bpanorama digital\b/gi, rep: "entorno actual" },
    { re: /\bmarcos innovadores\b/gi, rep: "métodos prácticos" },
    { re: /\bin conclusion,\b/gi, rep: "ultimately," },
    { re: /\bit is important to note that\b/gi, rep: "notably," },
    { re: /\bdigital landscape\b/gi, rep: "market" },
    { re: /\bdelving into\b/gi, rep: "exploring" },
    { re: /\bfurthermore\b/gi, rep: "also" }
  ];

  function computeKeyChecksumBlock(block4) {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    let h = 0x811c9dc5;
    const seed = "PUREAI2026:" + String(block4 || "").toUpperCase();
    for (let i = 0; i < seed.length; i++) {
      h ^= seed.charCodeAt(i);
      h = Math.imul(h, 0x01000193) >>> 0;
    }
    let out = "";
    for (let j = 0; j < 4; j++) {
      out += chars.charAt((h >>> (j * 5)) % chars.length);
    }
    return out;
  }

  function isValidProLicenseCode(rawCode) {
    const code = String(rawCode || "").trim();
    if (!code) return false;
    if (/^cs_live_[a-zA-Z0-9_]{20,}$/.test(code)) return true;
    if (/^(sub|pi|cus)_[a-zA-Z0-9]{14,}$/.test(code)) return true;
    const proMatch = code.toUpperCase().match(/^PRO-([A-Z2-9]{4})-([A-Z2-9]{4})$/);
    if (proMatch) {
      return computeKeyChecksumBlock(proMatch[1]) === proMatch[2];
    }
    return false;
  }

  function getTodayKey() {
    return "pureai_ext_uses_" + new Date().toISOString().slice(0, 10);
  }

  let cachedLicenseRecord = null;
  let cachedDailyUses = 0;
  try {
    localStorage.removeItem("pureai_ext_pro");
    cachedDailyUses = Math.max(0, parseInt(localStorage.getItem(getTodayKey()) || "0", 10) || 0);
  } catch (_) {}

  function getOrCreateFallbackDid() {
    try {
      const existing = localStorage.getItem("pureai_ext_fallback_did");
      if (existing && /^[a-zA-Z0-9_-]{12,48}$/.test(existing)) return existing;
      const alphabet = "abcdefghjkmnpqrstuvwxyz23456789";
      let id = "extfb_";
      for (let i = 0; i < 18; i++) id += alphabet.charAt(Math.floor(Math.random() * alphabet.length));
      localStorage.setItem("pureai_ext_fallback_did", id);
      return id;
    } catch (_) {
      return "extfb_volatile_device01";
    }
  }

  function verifyLicenseFailClosed(code) {
    const cleanCode = String(code || "").trim();
    if (!isValidProLicenseCode(cleanCode)) {
      return Promise.resolve({ valid: false, reason: "invalid_format" });
    }
    if (typeof chrome !== "undefined" && chrome.runtime && typeof chrome.runtime.sendMessage === "function") {
      return new Promise((resolve) => {
        try {
          chrome.runtime.sendMessage({ type: "VERIFY_PUREAI_LICENSE", code: cleanCode }, (resp) => {
            if (chrome.runtime.lastError || !resp) {
              resolve({ valid: false, reason: "runtime_error" });
              return;
            }
            if (resp.valid === true && resp.record) {
              cachedLicenseRecord = resp.record;
              resolve({ valid: true, record: resp.record });
            } else {
              if (resp.ok === true && resp.valid === false) cachedLicenseRecord = null;
              resolve({ valid: false, reason: resp.reason || "revoked_or_not_found" });
            }
          });
        } catch (_) {
          resolve({ valid: false, reason: "send_message_failed" });
        }
      });
    }
    if (typeof fetch !== "function") {
      return Promise.resolve({ valid: false, reason: "no_fetch" });
    }
    const fbDid = getOrCreateFallbackDid();
    return fetch("https://pureai-stripe-webhook.pureaistudio-app.workers.dev/verify-license?code=" + encodeURIComponent(cleanCode) + "&did=" + encodeURIComponent(fbDid), {
      method: "GET",
      headers: { Accept: "application/json" }
    })
      .then(async (resp) => {
        const data = await resp.json().catch(() => ({}));
        if (resp.status === 200 && data && data.valid === true) {
          const rec = {
            valid: true,
            key: data.proKey || cleanCode,
            expiresAt: data.expiresAt || (Date.now() + 32 * 24 * 3600 * 1000)
          };
          cachedLicenseRecord = rec;
          return { valid: true, record: rec };
        }
        cachedLicenseRecord = null;
        return { valid: false, reason: (data && data.reason) || "invalid_license" };
      })
      .catch(() => ({ valid: false, reason: "network_error" }));
  }

  if (typeof chrome !== "undefined" && chrome.storage && chrome.storage.local) {
    const todayStorageKey = getTodayKey();
    chrome.storage.local.get(["pureai_ext_license_v2", todayStorageKey], (res) => {
      if (res && typeof res[todayStorageKey] === "number" && res[todayStorageKey] > cachedDailyUses) {
        cachedDailyUses = Math.max(0, res[todayStorageKey]);
      }
      const lic = res && res.pureai_ext_license_v2;
      if (lic && lic.valid === true && lic.key && isValidProLicenseCode(lic.key) && typeof lic.expiresAt === "number" && Date.now() <= lic.expiresAt) {
        cachedLicenseRecord = lic;
        verifyLicenseFailClosed(lic.key);
      } else {
        cachedLicenseRecord = null;
      }
    });
    if (chrome.storage.onChanged && typeof chrome.storage.onChanged.addListener === "function") {
      chrome.storage.onChanged.addListener((changes, areaName) => {
        if (areaName && areaName !== "local") return;
        const curTodayKey = getTodayKey();
        if (changes && changes[curTodayKey] && typeof changes[curTodayKey].newValue === "number") {
          cachedDailyUses = Math.max(0, cachedDailyUses, changes[curTodayKey].newValue);
        }
        if (changes && Object.prototype.hasOwnProperty.call(changes, "pureai_ext_license_v2")) {
          const newLic = changes.pureai_ext_license_v2 && changes.pureai_ext_license_v2.newValue;
          if (newLic && newLic.valid === true && newLic.key && isValidProLicenseCode(newLic.key) && typeof newLic.expiresAt === "number" && Date.now() <= newLic.expiresAt) {
            cachedLicenseRecord = newLic;
          } else {
            cachedLicenseRecord = null;
          }
        }
      });
    }
  }

  function isProUnlocked() {
    if (!cachedLicenseRecord || cachedLicenseRecord.valid !== true) return false;
    if (typeof cachedLicenseRecord.expiresAt !== "number" || Date.now() > cachedLicenseRecord.expiresAt) {
      cachedLicenseRecord = null;
      return false;
    }
    return true;
  }

  function getUsedToday() {
    let localVal = 0;
    try {
      localVal = Math.max(0, parseInt(localStorage.getItem(getTodayKey()) || "0", 10) || 0);
    } catch (_) {}
    return Math.max(0, cachedDailyUses, localVal);
  }

  function incrementUsedToday() {
    const todayStorageKey = getTodayKey();
    const next = getUsedToday() + 1;
    cachedDailyUses = next;
    try {
      localStorage.setItem(todayStorageKey, String(next));
    } catch (_) {}
    if (typeof chrome !== "undefined" && chrome.storage && chrome.storage.local) {
      chrome.storage.local.set({ [todayStorageKey]: next });
    }
    return next;
  }

  function scrubAndHumanizeText(raw) {
    let txt = (raw || "")
      .replace(/[\u200B-\u200D\uFEFF\u2060\u180E]/g, "")
      .replace(/[\u202F\u00A0]/g, " ")
      .replace(/\s*—\s*/g, ", ")
      .replace(/[“”]/g, '"')
      .replace(/[‘’]/g, "'");
    CLICHE_LIST.forEach((item) => {
      txt = txt.replace(item.re, item.rep);
    });
    return txt.trim();
  }

  function showInlineProPrompt(barEl) {
    let box = barEl.querySelector(".pureai-inline-upsell");
    if (box) return;
    const isEsExt = typeof navigator !== "undefined" && /^es\b/i.test(navigator.language || "");
    box = document.createElement("div");
    box.className = "pureai-inline-upsell";
    box.style.cssText =
      "display:flex;gap:6px;align-items:center;flex-wrap:wrap;background:#140e26;border:1px solid #a855f7;border-radius:10px;padding:6px 10px;font-size:11px;color:#f8fafc;";
    box.innerHTML = isEsExt
      ? `
      <span>🔒 <strong>3/3 textos gratis hoy agotados:</strong></span>
      <a href="https://buy.stripe.com/9B6cN6e669uZ4vmeTE0000f" target="_blank" rel="noopener" style="background:#00e5a3;color:#042f1e;padding:3px 8px;border-radius:6px;font-weight:800;text-decoration:none;">⚡ 10 Usos (2,99 €)</a>
      <a href="https://buy.stripe.com/3cIdRae66bD74vm6n80000g" target="_blank" rel="noopener" style="background:#a855f7;color:#fff;padding:3px 8px;border-radius:6px;font-weight:800;text-decoration:none;">🔥 50 Usos (9,90 €)</a>
      <a href="https://buy.stripe.com/eVq00k7HIfTn1jabHs0000h" target="_blank" rel="noopener" style="background:#38bdf8;color:#082f49;padding:3px 8px;border-radius:6px;font-weight:800;text-decoration:none;">💎 Anual (39 €)</a>
      <button type="button" class="pureai-key-btn" style="background:#1e293b;color:#cbd5e1;border:1px solid #475569;padding:3px 7px;border-radius:6px;cursor:pointer;font-size:11px;">🔑 Activar Clave Pro</button>
    `
      : `
      <span>🔒 <strong>3/3 free daily texts used:</strong></span>
      <a href="https://buy.stripe.com/9B6cN6e669uZ4vmeTE0000f" target="_blank" rel="noopener" style="background:#00e5a3;color:#042f1e;padding:3px 8px;border-radius:6px;font-weight:800;text-decoration:none;">⚡ 10 Pass (€2.99)</a>
      <a href="https://buy.stripe.com/3cIdRae66bD74vm6n80000g" target="_blank" rel="noopener" style="background:#a855f7;color:#fff;padding:3px 8px;border-radius:6px;font-weight:800;text-decoration:none;">🔥 50 Pack (€9.90)</a>
      <a href="https://buy.stripe.com/eVq00k7HIfTn1jabHs0000h" target="_blank" rel="noopener" style="background:#38bdf8;color:#082f49;padding:3px 8px;border-radius:6px;font-weight:800;text-decoration:none;">💎 Unlimited (€39/yr)</a>
      <button type="button" class="pureai-key-btn" style="background:#1e293b;color:#cbd5e1;border:1px solid #475569;padding:3px 7px;border-radius:6px;cursor:pointer;font-size:11px;">🔑 Activate Key</button>
    `;
    box.querySelector(".pureai-key-btn").addEventListener("click", async () => {
      const k = prompt("Introduce tu Clave Multi-Dispositivo verificada (PRO-XXXX-YYYY) o ID de Sesión de Stripe (cs_live_...):");
      if (isValidProLicenseCode(k)) {
        const verification = await verifyLicenseFailClosed(k.trim());
        if (!verification || verification.valid !== true) {
          const msg = verification && verification.reason === "max_devices_exceeded"
            ? "⚠️ Esta licencia ha alcanzado el límite máximo de dispositivos permitidos."
            : "⚠️ No se pudo verificar una suscripción activa en Stripe para esta clave (comprueba tu clave o conexión).";
          alert(msg);
          return;
        }
        box.remove();
        alert("🎉 PureAI Studio Pro verificado con el servidor y activado en ChatGPT y Claude sin límites.");
      } else if (k) {
        alert("⚠️ Clave inválida. Introduce una clave legítima PRO-XXXX-YYYY o tu session_id de Stripe (cs_live_...).");
      }
    });
    barEl.appendChild(box);
  }

  function extractCleanSourceText(msgEl) {
    if (!msgEl) return "";
    if (typeof msgEl.cloneNode === "function") {
      try {
        const clone = msgEl.cloneNode(true);
        if (clone && typeof clone.querySelectorAll === "function") {
          clone.querySelectorAll(".pureai-ext-bar").forEach((n) => n.remove());
        }
        return clone.innerText || clone.textContent || "";
      } catch (_) {}
    }
    return String(msgEl.innerText || msgEl.textContent || "")
      .replace(/\s*(✨ Copiar Texto Limpio|✅ ¡Copiado[^\n]*|🔒 3\/3 textos gratis hoy agotados:[\s\S]*)$/u, "");
  }

  function injectPureAiButtons() {
    const messages = document.querySelectorAll(
      '[data-message-author-role="assistant"], .font-claude-message'
    );
    messages.forEach((msgEl) => {
      if (msgEl.dataset.pureaiInjected === "1") return;
      msgEl.dataset.pureaiInjected = "1";

      const bar = document.createElement("div");
      bar.className = "pureai-ext-bar";
      bar.style.cssText = "margin-top:8px;display:flex;gap:8px;align-items:center;flex-wrap:wrap;";

      const btn = document.createElement("button");
      btn.type = "button";
      btn.textContent = "✨ Copiar Texto Limpio";
      btn.style.cssText =
        "background:linear-gradient(135deg,#00e5a3,#06b6d4);color:#042f1e;border:none;border-radius:999px;padding:5px 12px;font-size:12px;font-weight:800;cursor:pointer;box-shadow:0 4px 12px rgba(0,229,163,0.3);";

      btn.addEventListener("click", () => {
        if (!isProUnlocked() && getUsedToday() >= MAX_DAILY_FREE) {
          showInlineProPrompt(bar);
          return;
        }
        const used = isProUnlocked() ? 0 : incrementUsedToday();
        const clean = scrubAndHumanizeText(extractCleanSourceText(msgEl));
        navigator.clipboard.writeText(clean).catch(() => {});
        btn.textContent = isProUnlocked()
          ? "✅ ¡Copiado Pro (Texto Limpio)!"
          : `✅ ¡Copiado! (${Math.max(0, MAX_DAILY_FREE - used)}/${MAX_DAILY_FREE} gratis hoy)`;
        setTimeout(() => {
          btn.textContent = "✨ Copiar Texto Limpio";
        }, 2000);
      });

      bar.appendChild(btn);
      msgEl.appendChild(bar);
    });
  }

  setInterval(injectPureAiButtons, 1800);
})();
