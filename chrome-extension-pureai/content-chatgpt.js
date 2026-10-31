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
    if (/^cs_(live|test)_[a-zA-Z0-9]{20,}$/.test(code)) return true;
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

  let cachedExtPro = localStorage.getItem("pureai_ext_pro") === "true";
  if (typeof chrome !== "undefined" && chrome.storage && chrome.storage.local) {
    chrome.storage.local.get(["pureai_ext_pro"], (res) => {
      if (res && res.pureai_ext_pro === true) {
        cachedExtPro = true;
      }
    });
  }

  function isProUnlocked() {
    return cachedExtPro || localStorage.getItem("pureai_ext_pro") === "true";
  }

  function getUsedToday() {
    return parseInt(localStorage.getItem(getTodayKey()) || "0", 10) || 0;
  }

  function incrementUsedToday() {
    const next = getUsedToday() + 1;
    localStorage.setItem(getTodayKey(), String(next));
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
    box = document.createElement("div");
    box.className = "pureai-inline-upsell";
    box.style.cssText =
      "display:flex;gap:6px;align-items:center;flex-wrap:wrap;background:#140e26;border:1px solid #a855f7;border-radius:10px;padding:6px 10px;font-size:11px;color:#f8fafc;";
    box.innerHTML = `
      <span>🔒 <strong>3/3 textos gratis hoy agotados:</strong></span>
      <a href="https://buy.stripe.com/aFaaEY0fgcHbd1SeTE0000c" target="_blank" rel="noopener" style="background:#00e5a3;color:#042f1e;padding:3px 8px;border-radius:6px;font-weight:800;text-decoration:none;">🔥 Pro Mensual -50% (4,99 €)</a>
      <a href="https://buy.stripe.com/5kQ28sfaa0Yt5zqfXI0000d" target="_blank" rel="noopener" style="background:#38bdf8;color:#082f49;padding:3px 8px;border-radius:6px;font-weight:800;text-decoration:none;">💎 Pro Anual (39 €/año)</a>
      <button type="button" class="pureai-key-btn" style="background:#1e293b;color:#cbd5e1;border:1px solid #475569;padding:3px 7px;border-radius:6px;cursor:pointer;font-size:11px;">🔑 Activar Clave Pro</button>
    `;
    box.querySelector(".pureai-key-btn").addEventListener("click", async () => {
      const k = prompt("Introduce tu Clave Multi-Dispositivo verificada (PRO-XXXX-YYYY) o ID de Sesión de Stripe (cs_live_...):");
      if (isValidProLicenseCode(k)) {
        try {
          const resp = await fetch("https://pureai-stripe-webhook.pureaistudio-app.workers.dev/verify-license?code=" + encodeURIComponent(k.trim()), {
            method: "GET",
            headers: { Accept: "application/json" }
          });
          const ct = (resp.headers && resp.headers.get && resp.headers.get("content-type")) || "";
          if (ct.includes("application/json")) {
            const data = await resp.json();
            if (resp.status === 404 || data.valid === false) {
              alert("⚠️ Esta clave no figura como pagada o activa en el servidor de Stripe.");
              return;
            }
          }
        } catch (_) {}
        cachedExtPro = true;
        localStorage.setItem("pureai_ext_pro", "true");
        if (typeof chrome !== "undefined" && chrome.storage && chrome.storage.local) {
          chrome.storage.local.set({ pureai_ext_pro: true });
        }
        box.remove();
        alert("🎉 PureAI Studio Pro verificado y activado en ChatGPT y Claude sin límites.");
      } else if (k) {
        alert("⚠️ Clave inválida. Introduce una clave legítima PRO-XXXX-YYYY o tu session_id de Stripe (cs_live_...).");
      }
    });
    barEl.appendChild(box);
  }

  function injectPureAiButtons() {
    const messages = document.querySelectorAll(
      '[data-message-author-role="assistant"], .font-claude-message'
    );
    messages.forEach((msgEl) => {
      if (msgEl.dataset.pureaiInjected === "1") return;
      msgEl.dataset.pureaiInjected = "1";

      const bar = document.createElement("div");
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
        const clean = scrubAndHumanizeText(msgEl.innerText || msgEl.textContent || "");
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
