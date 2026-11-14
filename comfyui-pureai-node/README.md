# 🛡️ ComfyUI PureAI Metadata Shield — Strip Workflow JSON, Prompts & C2PA Locally

Every standard `Save Image` node in **ComfyUI** embeds your entire node graph (`workflow`), positive/negative prompts (`prompt`), seed numbers, and LoRA model weights inside hidden PNG `tEXt` chunks—allowing anyone who downloads your image to drag it into ComfyUI and clone your exact setup, while triggering **"Made with AI" / "AI Info"** flags on Instagram, TikTok, and stock agencies.

**`PureAIMetadataShieldSave`** exports a 100% clean JPEG or PNG pixel buffer directly inside ComfyUI with **zero embedded workflow chunks** and optional imperceptible optical sensor micro-grain.

---

## ✨ Need Apple iPhone 16 Pro EXIF, MP4 Video Cleaning (Sora/Kling/Runway), or Bulk `.ZIP`?

Use the companion **100% Client-Side Web Studio** (zero cloud upload — runs locally in your browser):
👉 **[Open PureAI Studio (Free C2PA Threat Scanner + Camera EXIF Injector)](https://pureaistudios.com/clean-ai-studio.html?utm_source=github&utm_medium=comfyui_node)**

- 📱 **Binary Camera EXIF Profiles:** Inject valid `APP1 (Exif)` headers (`Apple iPhone 16 Pro`, `Sony Alpha A7 IV`, `Canon EOS R5`) + optional GPS city coordinates.
- 🎬 **MP4 AI Video Scrubber:** Strip C2PA / `uuid` / `udta` provenance boxes from **Wan, Kling, Runway, Luma, and Sora** `.MP4` videos locally in seconds.
- 📦 **Bulk Mixed Batch `.ZIP`:** Drag & drop up to 100 photos and `.MP4` videos at once.
- 🧩 **[Official Chrome Extension](https://chromewebstore.google.com/detail/pureai-studio-%E2%80%94-c2pa-meta/pdebjlkmjdhpgiigepojdcpfbfimcgmo)**

---

## 🚀 Installation in ComfyUI

Clone this folder into your `ComfyUI/custom_nodes/` directory:

```bash
cd ComfyUI/custom_nodes
git clone https://github.com/revienta32/comfyui-pureai-metadata-shield.git
```

Restart ComfyUI and search for:
**`🛡️ Save Clean Image (0% Workflow & C2PA — PureAI Studio)`** (under `image/privacy`).
