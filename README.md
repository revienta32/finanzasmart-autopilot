# 🧬 PureAI Studio (`https://pureaistudios.com/`)

**100% Client-Side Image, Video & Text Metadata Sanitizer (C2PA / EXIF / MP4 / Unicode)**

- 🌐 **Web Studio:** [https://pureaistudios.com/](https://pureaistudios.com/)
- 🧩 **Chrome Extension (Manifest V3):** [chrome-extension-pureai.zip](chrome-extension-pureai.zip)
- ⚖️ **Legal & Privacy:** [terms.html](terms.html) · [privacy-policy.html](privacy-policy.html)

## 🛠️ Core Capabilities (Zero Server Uploads)
1. **Binary C2PA / JUMBF / IPTC Image Scrubber:** Re-encodes clean pixel buffers locally in the browser (`Canvas` / `ArrayBuffer`).
2. **MP4 Video Metadata Container Cleaner:** Neutralizes C2PA/XMP container metadata while preserving `mdat` H.264/AAC media streams intact.
3. **Camera EXIF `APP1` Header Injector (Pro):** Applies technical `APP1` (`0xFFE1`) headers (iPhone 16 Pro, Sony A7 IV, Canon EOS R5) to JPEG outputs.
4. **Multi-File `.ZIP` Batch Processor (Pro):** Processes up to 50 files locally into a single `.ZIP` archive.
5. **Invisible Unicode Watermark & Formatting Cleaner:** Strips `U+202F`, `U+200B`, `U+00A0`, and `U+FEFF` characters with a real-time X-Ray viewer.
6. **JSON Technical Audit Report (Pro):** Exports a verifiable SHA-256 sanitization report.
