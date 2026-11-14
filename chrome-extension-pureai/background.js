const STUDIO_URL = "https://pureaistudios.com/clean-ai-studio.html";
const VERIFY_URL = "https://pureai-stripe-webhook.pureaistudio-app.workers.dev/verify-license";
const CONSUME_URL = "https://pureai-stripe-webhook.pureaistudio-app.workers.dev/consume-credit";
const FREE_QUOTA_URL = "https://pureai-stripe-webhook.pureaistudio-app.workers.dev/check-free-quota";

function isSafeHttpsImageUrl(rawUrl) {
  if (!rawUrl || typeof rawUrl !== "string" || rawUrl.length > 2048) return false;
  try {
    const u = new URL(rawUrl);
    if (u.protocol !== "https:" || u.username || u.password) return false;
    const h = (u.hostname || "").toLowerCase();
    if (!h || h === "localhost" || /\.(local|localhost|internal|arpa|home|lan)$/i.test(h)) return false;
    if (h.startsWith("[") || h.includes(":")) return false;
    if (/^(127\.|0\.|10\.|192\.168\.|169\.254\.|100\.(6[4-9]|[7-9]\d|1[01]\d|12[0-7])\.|172\.(1[6-9]|2\d|3[01])\.)/.test(h)) return false;
    return true;
  } catch (_) {
    return false;
  }
}

function getOrCreateExtInstallId() {
  return new Promise((resolve) => {
    chrome.storage.local.get(["pureai_ext_install_id"], (res) => {
      if (res && typeof res.pureai_ext_install_id === "string" && /^[a-zA-Z0-9_-]{12,48}$/.test(res.pureai_ext_install_id)) {
        resolve(res.pureai_ext_install_id);
        return;
      }
      const alphabet = "abcdefghjkmnpqrstuvwxyz23456789";
      let id = "ext_";
      for (let i = 0; i < 20; i++) {
        id += alphabet.charAt(Math.floor(Math.random() * alphabet.length));
      }
      chrome.storage.local.set({ pureai_ext_install_id: id }, () => resolve(id));
    });
  });
}

chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.removeAll(() => {
    chrome.contextMenus.create({
      id: "pureai-clean-image",
      title: "🧹 Clean C2PA / Inject iPhone 16 Pro EXIF with PureAI Studio",
      contexts: ["image"]
    });
    chrome.contextMenus.create({
      id: "pureai-clean-selection",
      title: "✍️ Scrub ChatGPT Watermarks (U+202F) with PureAI Studio",
      contexts: ["selection"]
    });
  });
});

chrome.contextMenus.onClicked.addListener((info) => {
  if (info.menuItemId === "pureai-clean-image" && isSafeHttpsImageUrl(info.srcUrl)) {
    chrome.tabs.create({
      url: STUDIO_URL + "?ext_img=" + encodeURIComponent(info.srcUrl)
    });
  } else if (info.menuItemId === "pureai-clean-selection" && info.selectionText) {
    chrome.tabs.create({
      url: STUDIO_URL + "?ext_txt=" + encodeURIComponent(info.selectionText.slice(0, 1800))
    });
  }
});

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (!message) return false;
  if (message.type === "CONSUME_PUREAI_CREDIT") {
    chrome.storage.local.get(["pureai_ext_license_v2"], async (res) => {
      const lic = res && res.pureai_ext_license_v2;
      if (!lic || !lic.valid || !lic.key) {
        sendResponse({ ok: false, reason: "missing_license" });
        return;
      }
      if (lic.unlimited !== false) {
        sendResponse({ ok: true, unlimited: true, creditsRemaining: null });
        return;
      }
      const opId = typeof message.opId === "string" && message.opId
        ? message.opId.slice(0, 80)
        : ("ext_" + Date.now() + "_" + Math.random().toString(36).slice(2, 8));
      try {
        const resp = await fetch(CONSUME_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json", Accept: "application/json" },
          body: JSON.stringify({ code: lic.key, count: Math.max(1, Number(message.count) || 1), opId })
        });
        const data = await resp.json().catch(() => ({}));
        if (resp.status === 200 && data && data.ok) {
          const nextCredits = typeof data.creditsRemaining === "number" ? data.creditsRemaining : Math.max(0, (Number(lic.creditsRemaining) || 1) - 1);
          const updated = { ...lic, creditsRemaining: nextCredits, status: data.status || lic.status, verifiedAt: Date.now() };
          if (nextCredits <= 0) {
            chrome.storage.local.remove(["pureai_ext_license_v2", "pureai_ext_pro"], () => {
              sendResponse({ ok: true, status: resp.status, unlimited: false, creditsRemaining: 0 });
            });
          } else {
            chrome.storage.local.set({ pureai_ext_license_v2: updated }, () => {
              sendResponse({ ok: true, status: resp.status, unlimited: false, creditsRemaining: nextCredits });
            });
          }
          return;
        }
        if (resp.status === 403 || resp.status === 404 || (data && data.ok === false)) {
          chrome.storage.local.remove(["pureai_ext_license_v2", "pureai_ext_pro"], () => {
            sendResponse({ ok: false, status: resp.status, unlimited: false, creditsRemaining: 0, reason: (data && data.reason) || "insufficient_credits" });
          });
          return;
        }
        sendResponse({ ok: true, status: resp.status, unlimited: false, creditsRemaining: lic.creditsRemaining });
      } catch (_) {
        sendResponse({ ok: true, offlineFallback: true, unlimited: false, creditsRemaining: lic.creditsRemaining });
      }
    });
    return true;
  }
  if (message.type === "CHECK_PUREAI_FREE_QUOTA") {
    (async () => {
      try {
        const resp = await fetch(FREE_QUOTA_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json", Accept: "application/json" },
          body: JSON.stringify({ consume: Boolean(message.consume) })
        });
        const data = await resp.json().catch(() => ({}));
        if (resp.status === 200 && data && typeof data.allowed === "boolean") {
          sendResponse({ ok: true, allowed: data.allowed, used: data.used });
          return;
        }
      } catch (_) {}
      sendResponse({ ok: true, allowed: true, offlineFallback: true });
    })();
    return true;
  }
  if (message.type !== "VERIFY_PUREAI_LICENSE") return false;
  const code = String(message.code || "").trim();
  if (!code || code.length < 8 || code.length > 128) {
    sendResponse({ ok: false, valid: false, reason: "invalid_code_format" });
    return false;
  }
  (async () => {
    try {
      const did = await getOrCreateExtInstallId();
      const resp = await fetch(
        VERIFY_URL + "?code=" + encodeURIComponent(code) + "&did=" + encodeURIComponent(did),
        { method: "GET", headers: { Accept: "application/json" } }
      );
      const data = await resp.json().catch(() => ({}));
      if (resp.status === 200 && data && data.valid === true) {
        const record = {
          valid: true,
          key: data.proKey || code,
          status: data.status || "ACTIVE",
          planType: data.planType || null,
          unlimited: data.unlimited !== false,
          creditsRemaining: typeof data.creditsRemaining === "number" ? data.creditsRemaining : null,
          expiresAt: data.expiresAt || (Date.now() + 32 * 24 * 3600 * 1000),
          verifiedAt: Date.now()
        };
        chrome.storage.local.set({ pureai_ext_license_v2: record, pureai_ext_pro: false }, () => {
          sendResponse({ ok: true, valid: true, record });
        });
        return;
      }
      if (resp.status === 404 || resp.status === 403 || (data && data.valid === false)) {
        chrome.storage.local.remove(["pureai_ext_license_v2", "pureai_ext_pro"], () => {
          sendResponse({ ok: true, valid: false, status: resp.status, reason: (data && data.reason) || "license_invalid" });
        });
        return;
      }
      sendResponse({ ok: false, valid: false, reason: "unexpected_server_response" });
    } catch (_) {
      sendResponse({ ok: false, valid: false, reason: "network_unreachable" });
    }
  })();
  return true;
});
