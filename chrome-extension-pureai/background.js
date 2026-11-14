const STUDIO_URL = "https://pureaistudios.com/clean-ai-studio.html";
const VERIFY_URL = "https://pureai-stripe-webhook.pureaistudio-app.workers.dev/verify-license";

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
  if (!message || message.type !== "VERIFY_PUREAI_LICENSE") return false;
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
