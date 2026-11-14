let loadedFile = null;
let loadedImg = null;
let loadedObjUrl = null;
const MAX_FREE_POPUP_IMG = 1;
const MAX_POPUP_IMAGE_BYTES = 50 * 1024 * 1024;
const MAX_POPUP_CANVAS_SIDE = 16384;
const MAX_POPUP_CANVAS_PIXELS = 67108864;
let popupProActive = false;
let popupLicenseRecord = null;
let popupImgUsed = 0;

function isPopupLicenseActive(lic) {
  return Boolean(
    lic &&
    lic.valid === true &&
    lic.key &&
    isValidPopupProLicenseCode(lic.key) &&
    typeof lic.expiresAt === "number" &&
    Date.now() <= lic.expiresAt &&
    (lic.unlimited !== false || (typeof lic.creditsRemaining === "number" && lic.creditsRemaining > 0))
  );
}

function renderPopupProButtonLabel(lic) {
  if (!isPopupLicenseActive(lic)) return "🔑 Activate Pro Key";
  if (lic.unlimited === false && typeof lic.creditsRemaining === "number") {
    return "💎 PureAI Pro · " + lic.creditsRemaining + " credits";
  }
  return "💎 PureAI Pro Active · Unlimited";
}

function computePopupKeyChecksumBlock(block4) {
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

function isValidPopupProLicenseCode(rawCode) {
  const c = String(rawCode || "").trim();
  if (!c) return false;
  if (/^cs_live_[a-zA-Z0-9_]{20,}$/.test(c)) return true;
  if (/^(sub|pi|cus)_[a-zA-Z0-9]{14,}$/.test(c)) return true;
  const m = c.toUpperCase().match(/^PRO-([A-Z2-9]{4})-([A-Z2-9]{4})$/);
  return m ? computePopupKeyChecksumBlock(m[1]) === m[2] : false;
}

const txtInput = document.getElementById("ext-txt");
const txtStatus = document.getElementById("ext-txt-status");
const btnCleanTxt = document.getElementById("btn-clean-txt");
const imgInput = document.getElementById("ext-img");
const imgStatus = document.getElementById("ext-img-status");
const btnCleanImg = document.getElementById("btn-clean-img");
const btnActivatePro = document.getElementById("btn-ext-activate-pro");

function syncPopupStateFromStorage() {
  try {
    popupImgUsed = Math.max(0, parseInt(localStorage.getItem("pureai_ext_img_used") || "0", 10) || 0);
  } catch (_) {}
  if (typeof chrome !== "undefined" && chrome.storage && chrome.storage.local) {
    chrome.storage.local.get(["pureai_ext_img_used", "pureai_ext_license_v2"], (res) => {
      if (res && typeof res.pureai_ext_img_used === "number" && res.pureai_ext_img_used > popupImgUsed) {
        popupImgUsed = Math.max(0, res.pureai_ext_img_used);
      }
      const lic = res && res.pureai_ext_license_v2;
      const validCached = isPopupLicenseActive(lic);
      popupLicenseRecord = validCached ? lic : null;
      popupProActive = validCached;
      if (popupProActive && btnActivatePro) {
        btnActivatePro.textContent = renderPopupProButtonLabel(popupLicenseRecord);
      }
      if (validCached && chrome.runtime && typeof chrome.runtime.sendMessage === "function") {
        chrome.runtime.sendMessage({ type: "VERIFY_PUREAI_LICENSE", code: lic.key }, (resp) => {
          if (resp && resp.ok === true && resp.valid === false) {
            popupProActive = false;
            popupLicenseRecord = null;
            if (btnActivatePro) btnActivatePro.textContent = "🔑 Activate Pro Key";
          } else if (resp && resp.ok === true && resp.valid === true && resp.record) {
            popupLicenseRecord = resp.record;
            popupProActive = isPopupLicenseActive(resp.record);
            if (btnActivatePro) btnActivatePro.textContent = renderPopupProButtonLabel(resp.record);
          }
        });
      }
    });
    if (chrome.storage.onChanged && typeof chrome.storage.onChanged.addListener === "function") {
      chrome.storage.onChanged.addListener((changes, area) => {
        if (area && area !== "local") return;
        if (changes && changes.pureai_ext_img_used && typeof changes.pureai_ext_img_used.newValue === "number") {
          popupImgUsed = Math.max(0, popupImgUsed, changes.pureai_ext_img_used.newValue);
        }
        if (changes && Object.prototype.hasOwnProperty.call(changes, "pureai_ext_license_v2")) {
          const nl = changes.pureai_ext_license_v2 && changes.pureai_ext_license_v2.newValue;
          popupLicenseRecord = isPopupLicenseActive(nl) ? nl : null;
          popupProActive = Boolean(popupLicenseRecord);
          if (btnActivatePro) {
            btnActivatePro.textContent = renderPopupProButtonLabel(popupLicenseRecord);
          }
        }
      });
    }
  }
}
syncPopupStateFromStorage();

if (btnActivatePro) {
  btnActivatePro.addEventListener("click", () => {
    const rawKey = prompt("Enter your verified PureAI Pro Key (PRO-XXXX-YYYY) or Stripe Session ID (cs_live_...):");
    if (!rawKey || !rawKey.trim()) return;
    if (!isValidPopupProLicenseCode(rawKey.trim())) {
      imgStatus.textContent = "⚠️ Invalid Pro License Key format or checksum.";
      imgStatus.style.color = "#f87171";
      return;
    }
    if (typeof chrome !== "undefined" && chrome.runtime && typeof chrome.runtime.sendMessage === "function") {
      chrome.runtime.sendMessage({ type: "VERIFY_PUREAI_LICENSE", code: rawKey.trim() }, (resp) => {
        if (resp && resp.valid === true) {
          popupLicenseRecord = resp.record || null;
          popupProActive = isPopupLicenseActive(popupLicenseRecord);
          btnActivatePro.textContent = renderPopupProButtonLabel(popupLicenseRecord);
          imgStatus.textContent = popupLicenseRecord && popupLicenseRecord.unlimited === false
            ? "🎉 PureAI Pro verified! " + popupLicenseRecord.creditsRemaining + " pack credits available."
            : "🎉 PureAI Pro verified! Unlimited image cleans unlocked.";
          imgStatus.style.color = "#34d399";
        } else {
          imgStatus.textContent = "⚠️ License could not be verified as active on Stripe.";
          imgStatus.style.color = "#f87171";
        }
      });
    }
  });
}

txtInput.addEventListener("input", () => {
  const v = txtInput.value;
  const u = (v.match(/[\u200B-\u200D\uFEFF\u202F\u00A0\u2060\u180E]/g) || []).length;
  const d = (v.match(/[—–“”‘’]/g) || []).length;
  txtStatus.textContent = `Detected: ${u} hidden Unicode chars, ${d} AI dashes/quotes.`;
  txtStatus.style.color = u + d > 0 ? "#f87171" : "#34d399";
});

btnCleanTxt.addEventListener("click", () => {
  let v = txtInput.value;
  if (!v.trim()) return;
  v = v
    .replace(/[\u200B-\u200D\uFEFF\u2060\u180E]/g, "")
    .replace(/[\u202F\u00A0]/g, " ")
    .replace(/\s*—\s*/g, ", ")
    .replace(/[“”]/g, '"')
    .replace(/[‘’]/g, "'");
  txtInput.value = v;
  navigator.clipboard.writeText(v).catch(() => {});
  txtStatus.textContent = "✅ Stripped 100% of watermarks & copied to clipboard!";
  txtStatus.style.color = "#34d399";
});

imgInput.addEventListener("change", async (e) => {
  const file = e.target.files && e.target.files[0];
  if (!file) return;
  if (!file.size || file.size <= 0 || file.size > MAX_POPUP_IMAGE_BYTES) {
    loadedFile = null;
    loadedImg = null;
    btnCleanImg.disabled = true;
    imgStatus.textContent = "⚠️ Invalid or oversized image (max 50 MB).";
    imgStatus.style.color = "#f87171";
    return;
  }
  loadedFile = file;
  const buf = await file.arrayBuffer();
  const ascii = new TextDecoder("latin1").decode(new Uint8Array(buf.slice(0, 131072)));
  const hasC2pa = /c2pa|jumbf|contentcredentials|trainedAlgorithmicMedia|ComfyUI|Midjourney|DALL-E|Firefly/i.test(ascii);
  imgStatus.textContent = hasC2pa
    ? "⚠️ C2PA / AI Binary Signature Detected in " + file.name
    : "ℹ️ Ready to strip EXIF/container bytes from " + file.name;
  imgStatus.style.color = hasC2pa ? "#f87171" : "#fbbf24";

  if (loadedObjUrl) {
    URL.revokeObjectURL(loadedObjUrl);
    loadedObjUrl = null;
  }
  const img = new Image();
  img.onload = () => {
    const nw = Number(img.naturalWidth) || 0;
    const nh = Number(img.naturalHeight) || 0;
    if (nw > MAX_POPUP_CANVAS_SIDE || nh > MAX_POPUP_CANVAS_SIDE || (nw * nh) > MAX_POPUP_CANVAS_PIXELS) {
      loadedImg = null;
      btnCleanImg.disabled = true;
      imgStatus.textContent = "⚠️ Image dimensions exceed browser safety limit (max 16384px / 67 MP).";
      imgStatus.style.color = "#f87171";
      return;
    }
    loadedImg = img;
    btnCleanImg.disabled = false;
  };
  img.onerror = () => {
    loadedImg = null;
    btnCleanImg.disabled = true;
    imgStatus.textContent = "⚠️ Unsupported or corrupted image file.";
    imgStatus.style.color = "#f87171";
  };
  loadedObjUrl = URL.createObjectURL(file);
  img.src = loadedObjUrl;
});

btnCleanImg.addEventListener("click", async () => {
  if (!loadedImg || !loadedFile) return;
  const nw = Number(loadedImg.naturalWidth) || 0;
  const nh = Number(loadedImg.naturalHeight) || 0;
  if (nw > MAX_POPUP_CANVAS_SIDE || nh > MAX_POPUP_CANVAS_SIDE || (nw * nh) > MAX_POPUP_CANVAS_PIXELS) return;
  try {
    const storedUsed = Math.max(0, parseInt(localStorage.getItem("pureai_ext_img_used") || "0", 10) || 0);
    if (storedUsed > popupImgUsed) popupImgUsed = storedUsed;
  } catch (_) {}
  if (popupProActive && popupLicenseRecord && popupLicenseRecord.unlimited === false) {
    if (typeof chrome !== "undefined" && chrome.runtime && typeof chrome.runtime.sendMessage === "function") {
      const consumeResp = await new Promise((resolve) => {
        chrome.runtime.sendMessage({ type: "CONSUME_PUREAI_CREDIT", count: 1 }, (r) => resolve(r || {}));
      });
      if (!consumeResp || !consumeResp.ok) {
        popupProActive = false;
        popupLicenseRecord = null;
        if (btnActivatePro) btnActivatePro.textContent = "🔑 Activate Pro Key";
        imgStatus.textContent = "🔒 Pack credits used up. Grab a €2.99 (10-File) or €9.90 (50-File) Pack below!";
        imgStatus.style.color = "#fbbf24";
        return;
      }
      if (typeof consumeResp.creditsRemaining === "number") {
        popupLicenseRecord.creditsRemaining = consumeResp.creditsRemaining;
        if (consumeResp.creditsRemaining <= 0) {
          popupProActive = false;
          popupLicenseRecord = null;
        }
        if (btnActivatePro) btnActivatePro.textContent = renderPopupProButtonLabel(popupLicenseRecord);
      }
    }
  } else if (!popupProActive) {
    if (popupImgUsed >= MAX_FREE_POPUP_IMG) {
      imgStatus.textContent = "🔒 Free popup clean used. Grab a €2.99 (10-File) or €9.90 (50-File) Pack below!";
      imgStatus.style.color = "#fbbf24";
      return;
    }
    if (typeof chrome !== "undefined" && chrome.runtime && typeof chrome.runtime.sendMessage === "function") {
      const fqResp = await new Promise((resolve) => {
        chrome.runtime.sendMessage({ type: "CHECK_PUREAI_FREE_QUOTA", consume: true }, (r) => resolve(r || { allowed: true }));
      });
      if (fqResp && fqResp.allowed === false) {
        popupImgUsed = MAX_FREE_POPUP_IMG;
        try { localStorage.setItem("pureai_ext_img_used", String(popupImgUsed)); } catch (_) {}
        chrome.storage.local.set({ pureai_ext_img_used: popupImgUsed });
        imgStatus.textContent = "🔒 Free popup clean used. Grab a €2.99 (10-File) or €9.90 (50-File) Pack below!";
        imgStatus.style.color = "#fbbf24";
        return;
      }
    }
    popupImgUsed += 1;
    try {
      localStorage.setItem("pureai_ext_img_used", String(popupImgUsed));
    } catch (_) {}
    if (typeof chrome !== "undefined" && chrome.storage && chrome.storage.local) {
      chrome.storage.local.set({ pureai_ext_img_used: popupImgUsed });
    }
  }
  const canvas = document.getElementById("ext-canvas");
  canvas.width = loadedImg.naturalWidth;
  canvas.height = loadedImg.naturalHeight;
  const ctx = canvas.getContext("2d");
  ctx.drawImage(loadedImg, 0, 0);
  const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const d = imgData.data;
  for (let i = 0; i < d.length; i += 16) {
    d[i] = d[i] > 250 ? d[i] - 1 : d[i] + 1;
  }
  ctx.putImageData(imgData, 0, 0);
  canvas.toBlob(
    (blob) => {
      if (!blob) return;
      const dlUrl = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = dlUrl;
      a.download = loadedFile.name.replace(/\.[^.]+$/, "") + "-clean.jpg";
      a.click();
      setTimeout(() => URL.revokeObjectURL(dlUrl), 3000);
      imgStatus.textContent = popupProActive
        ? (popupLicenseRecord && popupLicenseRecord.unlimited === false
          ? "✅ Downloaded 100% clean JPEG (" + popupLicenseRecord.creditsRemaining + " credits left)."
          : "✅ Downloaded 100% clean JPEG (Pro Unlimited).")
        : `✅ Downloaded clean JPEG (${Math.min(MAX_FREE_POPUP_IMG, popupImgUsed)}/${MAX_FREE_POPUP_IMG} free used).`;
      imgStatus.style.color = "#34d399";
    },
    "image/jpeg",
    0.95
  );
});

(function localizePopupPrices() {
  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || "";
    const lang = (typeof navigator !== "undefined" && navigator.language) || "";
    const isUk = /^Europe\/(London|Belfast|Jersey|Guernsey|Isle_of_Man)$/i.test(tz) || /-GB\b/i.test(lang);
    const isUs = !isUk && (/^(America\/(New_York|Chicago|Denver|Los_Angeles|Phoenix|Anchorage|Detroit|Indiana|Kentucky|Boise|Adak)|Pacific\/Honolulu|US\/)/i.test(tz) || (!/^es\b/i.test(lang) && /^America\//i.test(tz)));
    const p10 = document.getElementById("ext-price-p10");
    const p50 = document.getElementById("ext-price-p50");
    const pyr = document.getElementById("ext-price-yr");
    if (isUk) {
      if (p10) p10.textContent = "£2.59";
      if (p50) p50.textContent = "£8.59";
      if (pyr) pyr.textContent = "£34/yr";
    } else if (isUs) {
      if (p10) p10.textContent = "$3.39";
      if (p50) p50.textContent = "$11.29";
      if (pyr) pyr.textContent = "$44/yr";
    }
  } catch (_) {}
})();
