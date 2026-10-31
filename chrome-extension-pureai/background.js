const STUDIO_URL = "https://pureaistudios.com/clean-ai-studio.html";

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
  if (info.menuItemId === "pureai-clean-image" && info.srcUrl) {
    chrome.tabs.create({
      url: STUDIO_URL + "?ext_img=" + encodeURIComponent(info.srcUrl)
    });
  } else if (info.menuItemId === "pureai-clean-selection" && info.selectionText) {
    chrome.tabs.create({
      url: STUDIO_URL + "?ext_txt=" + encodeURIComponent(info.selectionText.slice(0, 1800))
    });
  }
});
