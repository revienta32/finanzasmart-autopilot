/**
 * CEO AUTOPILOT ENGINE - PureAI Studio
 * 1. Genera y mantiene las páginas de SEO Programático de alta intención de búsqueda (Long-Tail IA).
 * 2. Publica artículos satélite en Telegra.ph sin duplicar.
 * 3. Notifica a los buscadores (Bing, DuckDuckGo, Yandex, ChatGPT Search) mediante IndexNow API.
 */

const fs = require("fs");
const path = require("path");
const os = require("os");
const growthMatrix = require("./growth-matrix-engine");

function loadPrivateEnvIfPresent() {
  const candidates = [
    path.join(process.env.USERPROFILE || process.env.HOME || os.homedir(), ".gemini", "pureai-private-ops", ".env"),
    path.join(__dirname, ".env")
  ];
  for (const envPath of candidates) {
    try {
      if (!fs.existsSync(envPath)) continue;
      const lines = fs.readFileSync(envPath, "utf8").split(/\r?\n/);
      for (const line of lines) {
        const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
        if (m && !process.env[m[1]]) {
          process.env[m[1]] = m[2].replace(/^['"]|['"]$/g, "");
        }
      }
      break;
    } catch (_) {}
  }
}

const SITE_URL = "https://pureaistudios.com";
const INDEXNOW_KEY = "b8f4c2d1e9a74b6c8d3e2f1a0b9c8d7e";

const SEO_PAGES = [
  {
    slug: "c2pa-metadata-remover-ai-scrubber.html",
    title: "Free C2PA Metadata Remover & AI Content Credential Scrubber (2026 — 100% Client-Side)",
    h1: "🧬 Strip C2PA 'Made with AI' Credentials, JUMBF, EXIF GPS & ChatGPT Unicode Watermarks",
    lead: "Remove hidden C2PA manifests (DALL-E, Firefly, Gemini, Midjourney), ComfyUI PNG workflow chunks, EXIF GPS coordinates and invisible ChatGPT Unicode spaces (U+202F / U+200B) locally in your browser.",
    calcLink: "clean-ai-studio.html?lang=en",
    bodyHtml: `
      <p>Social platforms (Instagram, TikTok, LinkedIn) and AI detectors scan binary <strong>C2PA / JUMBF boxes</strong>, <strong>IPTC trainedAlgorithmicMedia tags</strong>, and <strong>narrow no-break spaces (U+202F)</strong> to automatically label and throttle AI-assisted images and text.</p>
      <ul style="margin: 1rem 0 1.5rem 1.25rem; color: #cbd5e1;">
        <li><strong>Binary C2PA &amp; EXIF Scrubber:</strong> Re-encodes a 100% clean pixel buffer in your browser with optional imperceptible sensor micro-grain.</li>
        <li><strong>Invisible Unicode Watermark Scrubber:</strong> Instantly detects and strips hidden zero-width and narrow no-break spaces inserted by LLMs.</li>
      </ul>
    `
  },
  {
    slug: "quitar-metadatos-ia-c2pa-exif-fotos-texto.html",
    title: "Cómo Quitar la Etiqueta 'Creado con IA' (C2PA / EXIF) en Fotos y Marcas Invisibles de ChatGPT (2026)",
    h1: "🇪🇸 Elimina Metadatos Ocultos C2PA, Coordenadas GPS EXIF y Marcas Unicode Invisibles de IA",
    lead: "Escanea y limpia gratis desde tu navegador las firmas ocultas de DALL-E, Midjourney, Firefly, Gemini y los espacios invisibles (U+202F / U+200B) de ChatGPT sin subir tus archivos a internet.",
    calcLink: "clean-ai-studio.html?lang=es",
    bodyHtml: `
      <p>Cuando subes una imagen generada o editada con IA a Instagram, TikTok o LinkedIn, la plataforma lee el bloque binario <strong>C2PA / JUMBF</strong> y le aplica automáticamente el aviso <em>"Creado con IA"</em>, reduciendo su alcance orgánico. Con <strong>PureAI Studio</strong> puedes auditar y limpiar tus imágenes y textos al instante.</p>
    `
  },
  {
    slug: "ki-metadaten-c2pa-entfernen-kostenlos.html",
    title: "C2PA KI-Metadaten, EXIF-GPS & ChatGPT-Wasserzeichen Online Entfernen Kostenlos (2026)",
    h1: "🇩🇪 Kostenloser C2PA-, EXIF- & KI-Wasserzeichen-Entferner (100% Lokal im Browser)",
    lead: "Entfernen Sie 'Mit KI erstellt'-Signaturen (C2PA / JUMBF), EXIF-Standortdaten und unsichtbare ChatGPT Unicode-Zeichen (U+202F / U+200B) ohne Server-Upload.",
    calcLink: "clean-ai-studio.html?lang=de",
    bodyHtml: `
      <p>Soziale Netzwerke und Prüfprogramme analysieren versteckte <strong>C2PA-Manifeste</strong> in Bildern sowie unsichtbare Unicode-Steuerzeichen in KI-Texten. Unser Studio bereinigt Ihre Dateien zu 100 % lokal auf Ihrem Gerät (DSGVO-konform).</p>
    `
  },
  {
    slug: "exif-camera-injector-iphone-sony-ai-photos.html",
    title: "Camera EXIF Metadata Injector Online: Add Real iPhone 16 Pro, Sony A7IV & Canon R5 EXIF to AI Photos",
    h1: "📱 Inject Technical Camera EXIF Headers (iPhone 16 Pro · Sony A7IV · Canon R5) & Strip C2PA AI Tags",
    lead: "Don't leave your scrubbed AI images with blank metadata. Replace C2PA/JUMBF AI signatures with binary APP1 EXIF camera headers locally in your browser.",
    calcLink: "clean-ai-studio.html?lang=en",
    bodyHtml: `
      <p>Simply stripping metadata leaves an image with an empty EXIF container. <strong>PureAI Studio</strong> writes a binary <code>APP1 (0xFFE1 + Exif\\0\\0 + TIFF IFD0)</code> technical header directly into your cleaned JPEG:</p>
      <ul style="margin: 1rem 0 1.5rem 1.25rem; color: #cbd5e1;">
        <li><strong>Apple iPhone 16 Pro Profile:</strong> Injects <code>Apple / iPhone 16 Pro back triple camera 6.765mm f/1.78 (iOS 18.2)</code> binary EXIF tags.</li>
        <li><strong>Sony Alpha A7 IV &amp; Canon EOS R5 Profiles:</strong> Professional full-frame studio camera headers (<code>FE 24-70mm F2.8 GM II</code> &amp; <code>RF24-70mm F2.8 L IS USM</code>).</li>
        <li><strong>1-Click Technical Verification:</strong> Re-scan your output file byte-by-byte to confirm 0 C2PA/JUMBF segments and active camera EXIF headers.</li>
      </ul>
    `
  },
  {
    slug: "remove-google-synthid-ai-pixel-watermark.html",
    title: "Remove Google SynthID, C2PA & AI Pixel Watermarks Online (2026 Frequency Disruptor)",
    h1: "🧬 Google SynthID & C2PA Dual-Layer Watermark Scrubber (Pixel Micro-Dithering + EXIF Scrubber)",
    lead: "Neutralize spatial frequency signatures and strip C2PA/JUMBF manifests 100% locally in your browser.",
    calcLink: "clean-ai-studio.html?lang=en",
    bodyHtml: `
      <p>Generators like <strong>Google Gemini / Imagen 3, Midjourney v6, and DALL-E 3</strong> use container-level <strong>C2PA/JUMBF manifests</strong> and pixel-level patterns.</p>
      <ul style="margin: 1rem 0 1.5rem 1.25rem; color: #cbd5e1;">
        <li><strong>Layer 1 (Container Purge):</strong> Strips C2PA, JUMBF, IPTC <code>trainedAlgorithmicMedia</code>, XMP, and ComfyUI workflow chunks.</li>
        <li><strong>Layer 2 (Sub-Pixel Optical Micro-Grain):</strong> Applies imperceptible optical sensor noise across RGB channels while preserving visual quality.</li>
      </ul>
    `
  },
  {
    slug: "adobe-stock-shutterstock-c2pa-ai-rejection-fix.html",
    title: "Fix Adobe Stock & Shutterstock C2PA Metadata Errors: Clean AI Credentials & Batch ZIP Exporter",
    h1: "📸 Prepare Images for Stock Agencies & E-Commerce (C2PA Scrubber + Camera EXIF Profile)",
    lead: "Prevent automatic metadata rejections caused by hidden Photoshop Generative Fill, Lightroom, Firefly, or Midjourney C2PA tags.",
    calcLink: "clean-ai-studio.html?lang=en",
    bodyHtml: `
      <p>Even a minor retouch using <strong>Photoshop Generative Fill or Lightroom AI Denoise</strong> embeds a <code>c2pa.actions</code> manifest inside your JPEG/PNG.</p>
      <ul style="margin: 1rem 0 1.5rem 1.25rem; color: #cbd5e1;">
        <li><strong>Bulk .ZIP Batch Processing:</strong> Scrub up to 50 high-resolution photos at once and download a single clean <code>.ZIP</code> archive in seconds.</li>
        <li><strong>95% sRGB Studio Quality + Camera Sensor Profiles:</strong> Preserve crisp visual fidelity while normalizing pixel grain and camera EXIF headers.</li>
      </ul>
    `
  },
  {
    slug: "midjourney-v6-flux-c2pa-metadata-remover.html",
    title: "Midjourney v6, Flux.1 & ComfyUI Metadata Remover: Strip PNG Prompt Workflows & C2PA Tags",
    h1: "🎨 Strip Midjourney v6, Flux.1, Stable Diffusion & ComfyUI Prompts + C2PA Credentials",
    lead: "Keep your proprietary AI prompts, LoRA weights, seed numbers, and ComfyUI node graphs private while removing C2PA labels in 1 click.",
    calcLink: "clean-ai-studio.html?lang=en",
    bodyHtml: `
      <p>Every PNG or JPEG exported from <strong>ComfyUI, Automatic1111, Forge, Flux.1, or Midjourney v6</strong> embeds your entire generation workflow, prompt text, LoRA models, and C2PA provenance inside hidden <code>tEXt</code>, <code>iTXt</code>, and <code>EXIF</code> chunks.</p>
      <ul style="margin: 1rem 0 1.5rem 1.25rem; color: #cbd5e1;">
        <li><strong>Protect Your Secret Prompts &amp; Workflows:</strong> Wipe embedded PNG chunk parameters so third parties cannot inspect your ComfyUI node graph.</li>
        <li><strong>Instant Browser Extension &amp; Web Studio:</strong> Clean your 1st file free or unlock 10-File Pass (€2.99 one-time) / 50 Files + Batch <code>.ZIP</code> (€9.90) + iPhone 16 Pro EXIF injection with zero subscription.</li>
      </ul>
    `
  },
  {
    slug: "remove-c2pa-metadata-mp4-video-sora-runway-kling.html",
    title: "Remove C2PA Metadata from MP4 AI Videos Online: Sora, Runway Gen-3, Kling & Reels (100% Browser)",
    h1: "🎬 Strip C2PA / UUID 'Made with AI' Metadata from .MP4 Videos (Sora · Runway · Kling · Luma)",
    lead: "Clean hidden ISO BMFF C2PA/JUMBF provenance boxes and udta tags from AI-generated MP4 videos locally in your browser—zero cloud upload required.",
    calcLink: "clean-ai-studio.html?lang=en",
    bodyHtml: `
      <p>Instagram Reels, TikTok, and YouTube Shorts inspect binary <strong>MP4 <code>uuid</code> (JUMBF/C2PA)</strong> and <strong><code>meta</code> / <code>udta</code></strong> atoms embedded by <strong>OpenAI Sora, Runway Gen-3, Kling AI, Luma Dream Machine, and Wan</strong> to apply automatic AI disclosure badges.</p>
      <ul style="margin: 1rem 0 1.5rem 1.25rem; color: #cbd5e1;">
        <li><strong>Zero-Upload MP4 Box Rebuilder:</strong> Strips C2PA/UUID provenance atoms directly in browser RAM without uploading heavy video files.</li>
        <li><strong>QuickTime Camera Metadata Option:</strong> Optionally write standard Apple iPhone 16 Pro QuickTime <code>udta</code> headers or export mixed photo + MP4 Batch <code>.ZIP</code> archives.</li>
      </ul>
    `
  },
  {
    slug: "quitar-metadatos-ia-video-mp4-reels-tiktok-sora.html",
    title: "Cómo Quitar Metadatos C2PA 'Creado con IA' en Vídeos MP4 para Instagram Reels y TikTok (Sora / Kling)",
    h1: "🎬 Limpiador de Metadatos C2PA y Cajas UUID en Vídeos .MP4 (Reels, TikTok, Sora, Kling y Runway)",
    lead: "Elimina las firmas ocultas de IA en tus vídeos MP4 directamente desde tu navegador sin subir pesados archivos de vídeo a ningún servidor externo.",
    calcLink: "clean-ai-studio.html?lang=es",
    bodyHtml: `
      <p>Generadores como <strong>Sora, Kling, Runway Gen-3, Luma y CapCut</strong> incrustan átomos binarios <code>uuid</code> (C2PA/JUMBF) y etiquetas <code>udta</code> dentro del archivo <code>.MP4</code> que disparan el aviso automático <em>"Información de IA"</em> al subir un Reel o TikTok.</p>
      <ul style="margin: 1rem 0 1.5rem 1.25rem; color: #cbd5e1;">
        <li><strong>Reconstrucción Binaria 100% Local:</strong> Limpia el contenedor MP4 al instante en tu dispositivo manteniendo intacta la pista de vídeo y audio.</li>
        <li><strong>Modo Lote Mixto (.ZIP):</strong> Limpia decenas de vídeos cortos y fotos de una sola vez con pases de pago único sin suscripción.</li>
      </ul>
    `
  },
  {
    slug: "strip-comfyui-workflow-json-png-keep-prompts-private.html",
    title: "Strip ComfyUI Workflow JSON & Prompts from PNG Images Online (Keep LoRAs & Node Graphs Private)",
    h1: "🔒 Wipe Hidden ComfyUI Workflow JSON, Positive Prompts, Seeds & LoRAs from PNG Files",
    lead: "Prevent clients and competitors from dragging your exported PNG into ComfyUI to clone your proprietary Flux.1 / SDXL node graph and LoRA weights.",
    calcLink: "clean-ai-studio.html?lang=en",
    bodyHtml: `
      <p>By default, every PNG saved in <strong>ComfyUI, Forge, or Automatic1111</strong> stores the complete JSON node graph inside hidden <code>tEXt</code> (<code>workflow</code>, <code>prompt</code>, <code>parameters</code>) chunks. Sharing that raw PNG on Discord, Reddit, Civitai, or client portals exposes your entire production pipeline.</p>
      <ul style="margin: 1rem 0 1.5rem 1.25rem; color: #cbd5e1;">
        <li><strong>100% Local Workflow Purge:</strong> Strips every <code>tEXt</code>, <code>zTXt</code>, <code>iTXt</code>, XMP, and C2PA chunk in your browser before publishing.</li>
        <li><strong>Bulk Creator Pack:</strong> Drag &amp; drop up to 100 ComfyUI renders at once and export a clean <code>.ZIP</code> with optional Sony A7IV or iPhone 16 Pro EXIF headers.</li>
      </ul>
    `
  },
  {
    slug: "fix-photoshop-lightroom-false-made-with-ai-label-instagram.html",
    title: "Fix False 'Made with AI' / 'AI Info' Label on Instagram After Photoshop or Lightroom Edits",
    h1: "📷 Why Instagram Flags Real Camera Photos as 'AI Info' After Photoshop / Lightroom (Lossless C2PA Fix)",
    lead: "Remove accidental Adobe Content Credentials (c2pa.actions) triggered by minor spot healing, AI Denoise, or Generative Expand without recompressing your JPEG.",
    calcLink: "clean-ai-studio.html?lang=en",
    bodyHtml: `
      <p>Photographers shooting on real Sony, Canon, Nikon, or iPhone cameras frequently get hit with Instagram's <strong>"AI Info"</strong> label simply because they used <strong>Lightroom Denoise</strong> or removed a tiny dust spot in <strong>Photoshop</strong>, which attaches an <code>APP11</code> C2PA manifest to the file.</p>
      <ul style="margin: 1rem 0 1.5rem 1.25rem; color: #cbd5e1;">
        <li><strong>Lossless JPEG Container Strip:</strong> Removes the binary C2PA/JUMBF segment byte-by-byte with <strong>0% pixel recompression</strong>—preserving 100% of your camera's dynamic range and sharpness.</li>
        <li><strong>Keep Camera Authenticity:</strong> Optionally preserve or apply clean Canon EOS R5, Sony A7IV, or Apple iPhone 16 Pro technical EXIF headers.</li>
      </ul>
    `
  },
  {
    slug: "quitar-aviso-informacion-ia-instagram-photoshop-lightroom.html",
    title: "Cómo Quitar el Falso Aviso 'Información de IA' en Instagram tras Editar en Photoshop o Lightroom",
    h1: "📷 Solución al Falso Positivo 'Información de IA' en Fotos Reales Editadas con Lightroom o Photoshop",
    lead: "Elimina sin pérdida de calidad (Lossless JPEG) la etiqueta C2PA oculta que Adobe añade al usar reducción de ruido o borrado puntual en tus fotografías reales.",
    calcLink: "clean-ai-studio.html?lang=es",
    bodyHtml: `
      <p>Muchos fotógrafos profesionales ven cómo Instagram marca sus sesiones reales como <em>"Creado con IA"</em> solo por haber aplicado <strong>Reducción de ruido en Lightroom</strong> o quitado un cable en <strong>Photoshop</strong>, ya que Adobe inyecta un manifiesto <code>APP11 C2PA</code> completo.</p>
      <ul style="margin: 1rem 0 1.5rem 1.25rem; color: #cbd5e1;">
        <li><strong>Modo Lossless JPEG (0% Recomprensión):</strong> Purga únicamente el segmento binario C2PA manteniendo intactos tus píxeles originales de cámara.</li>
        <li><strong>100% Privado en tu Navegador:</strong> Tus fotografías de clientes nunca se suben a la nube.</li>
      </ul>
    `
  },
  {
    slug: "clean-ai-influencer-photos-videos-fanvue-patreon-exif.html",
    title: "Batch C2PA Scrubber & iPhone 16 Pro EXIF Tool for Digital Creators, Agencies & Virtual Models",
    h1: "📱 Bulk Photo & MP4 Metadata Workflow for Virtual Creators (iPhone 16 Pro EXIF + Batch .ZIP)",
    lead: "Clean up to 100 photos and MP4 reels in one click, strip generator provenance tags, and write consistent Apple iPhone 16 Pro camera headers locally.",
    calcLink: "clean-ai-studio.html?lang=en",
    bodyHtml: `
      <ul style="margin: 1rem 0 1.5rem 1.25rem; color: #cbd5e1;">
        <li><strong>Mixed Photo + Video Batch .ZIP:</strong> Process entire weekly content calendars (JPEGs, PNGs, and MP4 reels) in seconds locally on your device.</li>
        <li><strong>Consistent Smartphone EXIF Profile:</strong> Apply realistic <code>Apple iPhone 16 Pro</code> or <code>Sony A7 IV</code> APP1 headers with optional city GPS tags.</li>
      </ul>
    `
  },
  {
    slug: "remove-exif-gps-location-before-posting-reddit-marketplace.html",
    title: "Remove Hidden EXIF GPS Coordinates & Camera Serial Numbers Before Posting Photos Online (Free)",
    h1: "🛡️ Strip Personal EXIF GPS Location & Device Metadata Before Sharing Photos Online",
    lead: "Protect your home address and personal privacy by wiping hidden latitude/longitude GPS tags from smartphone photos 100% locally in your browser.",
    calcLink: "clean-ai-studio.html?lang=en",
    bodyHtml: `
      <p>Smartphone photos contain exact <strong>GPS coordinates (<code>0x8825</code>)</strong>, capture timestamps, and device identifiers. Before uploading photos to forums, classifieds, or public repositories, audit and strip every location tag locally without uploading private images to third-party servers.</p>
    `
  },
  {
    slug: "borrar-ubicacion-gps-exif-fotos-antes-de-subir-internet.html",
    title: "Cómo Borrar la Ubicación GPS y Datos EXIF de una Foto Antes de Subirla a Internet (100% Privado)",
    h1: "🛡️ Elimina Coordenadas GPS Exactas y Metadatos Ocultos del Móvil sin Subir tus Fotos a Servidores",
    lead: "Comprueba gratis qué datos privados esconde cualquier foto de tu móvil y limpia las coordenadas GPS en 1 segundo desde tu propio navegador.",
    calcLink: "clean-ai-studio.html?lang=es",
    bodyHtml: `
      <p>Cada foto tomada con el móvil guarda latitud, longitud exacta de tu domicilio, hora y modelo de dispositivo en cabeceras <strong>EXIF GPS</strong>. Con el inspector local de PureAI Studio puedes verificar y limpiar tus imágenes sin que salgan nunca de tu teléfono u ordenador.</p>
    `
  },
  {
    slug: "c2pa-content-credentials-viewer-debugger-online-free.html",
    title: "Free Online C2PA Content Credentials Viewer & JUMBF Binary Inspector (Zero Upload)",
    h1: "🔎 Inspect C2PA Manifests, JUMBF Boxes, SynthID Risk & EXIF Headers Locally in Your Browser",
    lead: "Drop any JPEG, PNG, WebP, or MP4 file to instantly audit embedded AI Content Credentials, Adobe c2pa.actions, ComfyUI PNG chunks, and EXIF tags for free.",
    calcLink: "clean-ai-studio.html?lang=en",
    bodyHtml: `
      <p>Unlike cloud C2PA verifiers that upload confidential agency assets to remote servers, <strong>PureAI Studio's Forensic Inspector</strong> parses binary <code>JUMBF / c2pa</code> boxes, XMP <code>DigitalSourceType</code>, PNG text chunks, and MP4 <code>uuid</code> atoms 100% locally—completely free and unlimited.</p>
    `
  },
  {
    slug: "verificador-metadatos-c2pa-online-gratis-fotos-videos.html",
    title: "Verificador y Escáner de Metadatos C2PA Online Gratis para Fotos y Vídeos MP4 (Sin Subir Archivos)",
    h1: "🔎 Analiza Gratis si una Foto o Vídeo MP4 Contiene Firmas Ocultas C2PA, JUMBF, ComfyUI o GPS",
    lead: "Escáner forense gratuito e ilimitado 100% en tu navegador: comprueba en 1 segundo por qué Instagram, TikTok o bancos de imágenes detectan IA en tu archivo.",
    calcLink: "clean-ai-studio.html?lang=es",
    bodyHtml: `
      <p>Arrastra cualquier imagen (<code>JPEG</code>, <code>PNG</code>, <code>WebP</code>) o vídeo (<code>.MP4</code>) para inspeccionar al instante y sin coste si contiene manifiestos binarios <strong>C2PA / JUMBF</strong>, grafos ocultos de <strong>ComfyUI</strong> o coordenadas <strong>EXIF GPS</strong> antes de publicar.</p>
    `
  },
  {
    slug: "turnitin-ai-detector-bypass-humanizer-2026.html",
    title: "How to Humanize ChatGPT Essays for Turnitin & GPTZero (2026 Academic Mode — Free)",
    h1: "🎓 Academic AI Text Humanizer: Strip U+202F Watermarks & Rewrite LLM Clichés for Turnitin",
    lead: "Remove invisible ChatGPT Unicode spaces (U+202F, U+200B), em-dashes, and 90+ flagged AI transitional phrases in 1 click locally in your browser.",
    calcLink: "clean-ai-studio.html?lang=en#card-text-tool",
    bodyHtml: `
      <p>University and editorial AI detectors like <strong>Turnitin, GPTZero, and Originality.ai</strong> flag essays based on three forensic signals: hidden narrow no-break spaces (<code>U+202F</code>), repetitive syntactic clichés (<em>"delve into", "furthermore", "in conclusion"</em>), and flat sentence burstiness.</p>
      <ul style="margin: 1rem 0 1.5rem 1.25rem; color: #cbd5e1;">
        <li><strong>100% Client-Side Academic Humanizer:</strong> Your essay or <code>.DOCX</code> document never leaves your browser—zero server logs or plagiarism database leaks.</li>
        <li><strong>Instant X-Ray Watermark Scanner:</strong> See every hidden Unicode marker highlighted in red before scrubbing it for free.</li>
      </ul>
    `
  },
  {
    slug: "gptzero-bypass-ai-text-humanizer-free.html",
    title: "Free GPTZero & Originality.ai Text Humanizer: Fix AI Perplexity, Burstiness & U+202F",
    h1: "✍️ Lower GPTZero AI Detection Scores: Sentence Burstiness Engine + Unicode Scrubber",
    lead: "Paste your ChatGPT, Claude, or Gemini draft to strip hidden watermarks and humanize sentence rhythm in Academic, Social, or Agency Copy tone.",
    calcLink: "clean-ai-studio.html?lang=en#card-text-tool",
    bodyHtml: `
      <p>Why does <strong>GPTZero</strong> still flag text even after manual edits? Because copy-pasting from ChatGPT carries invisible Unicode formatting bytes and predictable sentence lengths. <strong>PureAI Studio</strong> cleans both the binary character layer and the stylistic layer in 1 click.</p>
    `
  },
  {
    slug: "telegram-bot-ai-photo-detector-c2pa-exif-gps.html",
    title: "Free Telegram Bot for AI Photo Detection, C2PA & EXIF GPS Check (@PureAIScannerBot)",
    h1: "✈️ Free Telegram C2PA, ComfyUI Prompt & EXIF GPS Scanner Bot (@PureAIScannerBot)",
    lead: "Forward any uncompressed photo, MP4 video, or HTTPS link to @PureAIScannerBot on Telegram to inspect hidden 'Made with AI' C2PA manifests, ComfyUI workflows, and EXIF GPS coordinates in 1 second—zero files stored.",
    calcLink: "clean-ai-studio.html?lang=en",
    bodyHtml: `
      <p>Want to verify whether an image, MP4 video, or public link contains hidden AI provenance or personal GPS location directly inside Telegram without opening a desktop tool? Forward the file (as a Document/File) or paste the <code>https://</code> image URL to <strong>@PureAIScannerBot</strong>.</p>
      <ul style="margin: 1rem 0 1.5rem 1.25rem; color: #cbd5e1;">
        <li><strong>64 KB RAM Header Scan (Zero Storage):</strong> Inspects C2PA/JUMBF manifests, XMP <code>trainedAlgorithmicMedia</code> tags, ComfyUI PNG workflows, and EXIF GPS <code>0x8825</code> in memory without storing any media.</li>
        <li><strong>1-Tap Clean in PureAI Studio:</strong> Every bot scan returns a direct button preloading your public image URL into our 100% client-side C2PA scrubber and iPhone 16 Pro EXIF injector.</li>
      </ul>
      <p style="margin:1.2rem 0;"><a href="https://t.me/PureAIScannerBot" target="_blank" rel="noopener" class="cta-button" style="display:inline-block;padding:0.75rem 1.4rem;background:#38bdf8;color:#082f49;font-weight:800;border-radius:9px;text-decoration:none;">✈️ Open @PureAIScannerBot in Telegram →</a></p>
    `
  },
  {
    slug: "bot-telegram-detector-ia-c2pa-borrar-exif-gps-fotos.html",
    title: "Bot de Telegram Gratis para Detectar Fotos IA (C2PA), Prompts PNG y GPS EXIF (@PureAIScannerBot)",
    h1: "✈️ Bot Oficial en Telegram para Escanear C2PA, Workflows ComfyUI y Ubicación GPS EXIF (@PureAIScannerBot)",
    lead: "Envía cualquier foto sin comprimir, vídeo MP4 o enlace HTTPS a @PureAIScannerBot en Telegram para detectar en 1 segundo etiquetas 'Creado con IA' (C2PA), prompts ocultos y coordenadas GPS con 0 archivos guardados.",
    calcLink: "clean-ai-studio.html?lang=es",
    bodyHtml: `
      <p>¿Quieres comprobar directamente desde Telegram si una foto, vídeo MP4 o enlace web esconde firmas de inteligencia artificial o tu ubicación GPS real? Reenvía el archivo (como Archivo/Documento) o pega la URL pública <code>https://</code> en el chat de <strong>@PureAIScannerBot</strong>.</p>
      <ul style="margin: 1rem 0 1.5rem 1.25rem; color: #cbd5e1;">
        <li><strong>Escaneo en Memoria RAM (0 Archivos Guardados):</strong> Analiza únicamente los primeros 64 KB buscando cajas C2PA/JUMBF, etiquetas <code>trainedAlgorithmicMedia</code>, workflows de ComfyUI y coordenadas GPS EXIF <code>0x8825</code>.</li>
        <li><strong>Limpieza Directa en 1 Clic:</strong> El bot te devuelve un botón directo que precarga tu URL escaneada dentro de PureAI Studio para limpiar metadatos o inyectar perfil EXIF de iPhone 16 Pro sin subir archivos.</li>
      </ul>
      <p style="margin:1.2rem 0;"><a href="https://t.me/PureAIScannerBot" target="_blank" rel="noopener" class="cta-button" style="display:inline-block;padding:0.75rem 1.4rem;background:#38bdf8;color:#082f49;font-weight:800;border-radius:9px;text-decoration:none;">✈️ Abrir @PureAIScannerBot en Telegram →</a></p>
    `
  }
];

function buildSeoPageHtml(page) {
  const isPureAi = (page.calcLink || "").includes("clean-ai-studio");
  const instantToolWidget = isPureAi
    ? `
      <div style="margin: 1.25rem 0 1.6rem; padding: 1.35rem; background: linear-gradient(145deg, rgba(16,185,129,0.16), rgba(15,23,42,0.98)); border: 2px solid #10b981; border-radius: 14px; box-shadow: 0 10px 30px rgba(0,0,0,0.45);">
        <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:8px;margin-bottom:10px;">
          <strong style="color:#6ee7b7;font-size:1.02rem;">⚡ Instant C2PA &amp; EXIF Photo Scrubber (100% Local Browser Tool)</strong>
          <a href="https://chromewebstore.google.com/detail/pureai-studio-%E2%80%94-c2pa-meta/pdebjlkmjdhpgiigepojdcpfbfimcgmo" target="_blank" rel="noopener" style="background:#1e293b;color:#93c5fd;border:1px solid #3b82f6;padding:4px 10px;border-radius:999px;font-size:0.75rem;font-weight:800;text-decoration:none;">🧩 Add to Chrome (Free Extension)</a>
        </div>
        <input type="file" id="quick-img-inp" accept="image/jpeg,image/png,image/webp" style="display:none" onchange="if(this.files[0])quickCleanImg(this.files[0])" />
        <div onclick="document.getElementById('quick-img-inp').click()" style="border:2px dashed #10b981;border-radius:12px;padding:18px;text-align:center;cursor:pointer;background:rgba(11,15,25,0.75);transition:all 0.2s;">
          <div style="font-size:1.7rem;margin-bottom:4px;">🖼️</div>
          <strong style="color:#f8fafc;font-size:0.95rem;">Click or Drop Photo Here to Strip C2PA / 'Made with AI' Metadata Instantly</strong>
          <div style="color:#94a3b8;font-size:0.78rem;margin-top:4px;">Zero server upload · Rebuilds clean pixel buffer locally in 1 second</div>
        </div>
        <div id="quick-img-status" style="margin-top:10px;font-family:monospace;font-size:0.8rem;color:#a7f3d0;"></div>
        <canvas id="quick-canvas" style="display:none;"></canvas>
        <div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:12px;">
          <a href="${page.calcLink}" class="cta-button" style="flex:1;text-align:center;padding:0.75rem 1rem;font-weight:800;">🧬 Open Full Studio (Camera EXIF Profile · Batch .ZIP) →</a>
          <a href="https://buy.stripe.com/9B6cN6e669uZ4vmeTE0000f" target="_blank" rel="noopener" style="background:#00e5a3;color:#042f1e;text-decoration:none;padding:0.75rem 1rem;border-radius:10px;font-weight:900;font-size:0.85rem;">⚡ 10-File Pass (€2.99)</a>
        </div>
      </div>
      <script>
      function escapeSeoHtml(s) {
        return String(s || "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
      }
      function hasVerifiedSeoPro() {
        try {
          var raw = localStorage.getItem("pureai_sub_record_v2");
          if (!raw) return false;
          var rec = JSON.parse(raw);
          if (!rec || rec.verifiedByServer !== true) return false;
          var key = String(rec.stripeSessionId || rec.key || "").trim();
          var m = key.toUpperCase().match(/^PRO-([A-Z2-9]{4})-([A-Z2-9]{4})$/);
          if (m) {
            var chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789", h = 0x811c9dc5, s = "PUREAI2026:" + m[1];
            for (var i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 0x01000193) >>> 0; }
            var chk = "";
            for (var j = 0; j < 4; j++) chk += chars.charAt((h >>> (j * 5)) % chars.length);
            if (chk !== m[2]) return false;
          } else if (!/^(cs_live_[a-zA-Z0-9_]{20,}|(sub|pi|cus)_[a-zA-Z0-9]{14,})$/.test(key)) {
            return false;
          }
          var now = Date.now();
          if (rec.unlimited === false && typeof rec.creditsRemaining === "number" && rec.creditsRemaining <= 0) return false;
          var active = (rec.status === "ACTIVE" || rec.status === "CANCELED_AT_PERIOD_END")
            ? (typeof rec.expiresAt === "number" && now <= rec.expiresAt)
            : (rec.status === "PAST_DUE" && typeof rec.graceEndsAt === "number" && now <= rec.graceEndsAt);
          if (active && typeof fetch === "function" && !window._pureaiSeoRevalidated) {
            window._pureaiSeoRevalidated = true;
            var did = localStorage.getItem("pureai_install_id") || "";
            var didQ = /^[a-zA-Z0-9_-]{12,48}$/.test(did) ? ("&did=" + encodeURIComponent(did)) : "";
            fetch("https://pureai-stripe-webhook.pureaistudio-app.workers.dev/verify-license?code=" + encodeURIComponent(key) + didQ, { method: "GET", headers: { Accept: "application/json" } })
              .then(function (r) { return r.json().then(function (d) { return { s: r.status, d: d }; }); })
              .then(function (x) {
                if (x.s === 403 || x.s === 404 || (x.d && x.d.valid === false)) {
                  localStorage.removeItem("pureai_sub_record_v2");
                  localStorage.removeItem("pureai_studio_pro");
                }
              }).catch(function () {});
          }
          return active;
        } catch (_) {}
        return false;
      }
      function consumeSeoQuotaOrPro(isPro, used, onAllowed) {
        if (typeof fetch !== "function") {
          try { if (!isPro) localStorage.setItem("pureai_img_used", String(used + 1)); } catch (_) {}
          onAllowed();
          return;
        }
        if (isPro) {
          try {
            var raw = localStorage.getItem("pureai_sub_record_v2");
            var rec = raw ? JSON.parse(raw) : null;
            if (!rec || rec.unlimited !== false) {
              onAllowed();
              return;
            }
            var key = String(rec.stripeSessionId || rec.key || "").trim();
            var opId = "seo_" + Date.now() + "_" + Math.random().toString(36).slice(2, 8);
            fetch("https://pureai-stripe-webhook.pureaistudio-app.workers.dev/consume-credit", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ code: key, count: 1, opId: opId })
            }).then(function (r) { return r.json().then(function (d) { return { s: r.status, d: d }; }); })
              .then(function (res) {
                if (res.s === 200 && res.d && res.d.ok) {
                  if (typeof res.d.creditsRemaining === "number") {
                    rec.creditsRemaining = res.d.creditsRemaining;
                    if (rec.creditsRemaining <= 0) rec.status = "EXPIRED";
                    try { localStorage.setItem("pureai_sub_record_v2", JSON.stringify(rec)); } catch (_) {}
                  }
                  onAllowed();
                } else {
                  try {
                    localStorage.removeItem("pureai_sub_record_v2");
                    localStorage.removeItem("pureai_studio_pro");
                  } catch (_) {}
                  var stEl = document.getElementById("quick-img-status");
                  if (stEl) stEl.innerHTML = "🔒 <strong>Pack credits exhausted.</strong> <a href='https://buy.stripe.com/9B6cN6e669uZ4vmeTE0000f' target='_blank' rel='noopener noreferrer' style='color:#00e5a3;font-weight:900;'>Unlock 10-File Pass (€2.99 one-time) →</a>";
                }
              }).catch(function () { onAllowed(); });
            return;
          } catch (_) { onAllowed(); return; }
        }
        fetch("https://pureai-stripe-webhook.pureaistudio-app.workers.dev/check-free-quota", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ consume: true })
        }).then(function (r) { return r.json(); })
          .then(function (q) {
            if (q && q.allowed === false) {
              try { localStorage.setItem("pureai_img_used", String(q.used || 1)); } catch (_) {}
              if (typeof window.sendPureAiAnalyticsEvent === "function") {
                window.sendPureAiAnalyticsEvent({ type: "app_action", event_name: "paywall_viewed", trigger_tool: "img_c2pa_scrubber", usedCredits: q.used || 1 });
              }
              var stEl = document.getElementById("quick-img-status");
              if (stEl) stEl.innerHTML = "🔒 <strong>1/1 free photo used.</strong> <a href='https://buy.stripe.com/9B6cN6e669uZ4vmeTE0000f' target='_blank' rel='noopener noreferrer' style='color:#00e5a3;font-weight:900;'>Unlock 10-File Pass (€2.99 one-time) →</a> · <a href='https://buy.stripe.com/3cIdRae66bD74vm6n80000g' target='_blank' rel='noopener noreferrer' style='color:#e9d5ff;font-weight:900;'>50 Files + Batch .ZIP (€9.90) →</a>";
              return;
            }
            try { localStorage.setItem("pureai_img_used", String(used + 1)); } catch (_) {}
            onAllowed();
          }).catch(function () {
            try { localStorage.setItem("pureai_img_used", String(used + 1)); } catch (_) {}
            onAllowed();
          });
      }
      function quickCleanImg(file) {
        if (!file || !file.size) return;
        var st = document.getElementById("quick-img-status");
        if (file.size > 50 * 1024 * 1024) {
          st.textContent = "⚠️ File exceeds 50 MB local browser safety limit.";
          return;
        }
        var isPro = hasVerifiedSeoPro();
        var used = 0;
        try {
          used = Math.max(0, parseInt(localStorage.getItem("pureai_img_used") || "0", 10) || 0);
        } catch (_) {}
        if (!isPro && used >= 1) {
          if (typeof window.sendPureAiAnalyticsEvent === "function") {
            window.sendPureAiAnalyticsEvent({ type: "app_action", event_name: "paywall_viewed", trigger_tool: "img_c2pa_scrubber", usedCredits: used });
          }
          st.innerHTML = "🔒 <strong>1/1 free photo used.</strong> <a href='https://buy.stripe.com/9B6cN6e669uZ4vmeTE0000f' target='_blank' rel='noopener noreferrer' style='color:#00e5a3;font-weight:900;'>Unlock 10-File Pass (€2.99 one-time) →</a> · <a href='https://buy.stripe.com/3cIdRae66bD74vm6n80000g' target='_blank' rel='noopener noreferrer' style='color:#e9d5ff;font-weight:900;'>50 Files + Batch .ZIP (€9.90) →</a>";
          return;
        }
        consumeSeoQuotaOrPro(isPro, used, function () {
          st.textContent = "⏳ Scanning & stripping C2PA / EXIF binary containers...";
          var img = new Image();
          var objUrl = URL.createObjectURL(file);
          img.onload = function () {
            if (URL.revokeObjectURL) URL.revokeObjectURL(objUrl);
            var nw = Number(img.naturalWidth) || 512, nh = Number(img.naturalHeight) || 512;
            if (nw > 16384 || nh > 16384 || (nw * nh) > 67108864) {
              st.textContent = "⚠️ Image pixel dimensions exceed browser safety limit (max 16384px / 67 MP).";
              return;
            }
            var c = document.getElementById("quick-canvas");
            c.width = nw;
            c.height = nh;
            var ctx = c.getContext("2d");
            ctx.drawImage(img, 0, 0);
            var d = ctx.getImageData(0, 0, c.width, c.height);
            for (var i = 0; i < d.data.length; i += 16) {
              d.data[i] = d.data[i] > 250 ? d.data[i] - 1 : d.data[i] + 1;
            }
            ctx.putImageData(d, 0, 0);
            c.toBlob(function (blob) {
              var a = document.createElement("a");
              var cleanName = file.name.replace(/\\.[^.]+$/, "") + "-clean.jpg";
              a.href = URL.createObjectURL(blob);
              a.download = cleanName;
              a.click();
              if (typeof window.sendPureAiAnalyticsEvent === "function") {
                window.sendPureAiAnalyticsEvent({ type: "app_action", event_name: "tool_completed", tool_id: "img_c2pa_scrubber", isDemo: false });
              }
              st.innerHTML = "✅ <strong>" + escapeSeoHtml(cleanName) + " downloaded (0% C2PA / 0% EXIF)!</strong> (" + (isPro ? "Pro Active" : "1/1 free used") + ") — <a href='clean-ai-studio.html' style='color:#fcd34d;font-weight:800;'>Unlock 10-File Pass (€2.99) or 50 Files + Batch .ZIP (€9.90) →</a>";
            }, "image/jpeg", 0.95);
          };
          img.onerror = function () { if (URL.revokeObjectURL) URL.revokeObjectURL(objUrl); };
          img.src = objUrl;
        });
      }
      </script>`
    : "";

  const pageLang = /\?lang=de/.test(page.calcLink || "") ? "de" : (/\?lang=fr/.test(page.calcLink || "") ? "fr" : (/\?lang=es/.test(page.calcLink || "") || /^(quitar|detectar|humanizar|borrar|verificador|directorio)/.test(page.slug || "") ? "es" : "en"));
  const isEsPage = pageLang === "es";
  const faqSchemaObj = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: page.title,
        acceptedAnswer: {
          "@type": "Answer",
          text: page.lead + " Runs 100% locally in your browser at " + SITE_URL + "/clean-ai-studio.html with zero server file uploads."
        }
      },
      {
        "@type": "Question",
        name: isEsPage ? "¿PureAI Studio sube mis fotos o vídeos MP4 a algún servidor?" : "Does PureAI Studio upload my photos, ComfyUI PNGs, or MP4 videos to any server?",
        acceptedAnswer: {
          "@type": "Answer",
          text: isEsPage
            ? "No. El 100% del escaneo forense C2PA/JUMBF, limpieza Lossless JPEG, reconstrucción de cajas MP4 e inyección EXIF (iPhone 16 Pro / Sony A7IV) ocurre localmente en la memoria de tu navegador."
            : "No. 100% of C2PA/JUMBF binary scrubbing, Lossless JPEG stripping, MP4 box rebuilding, and Apple iPhone 16 Pro / Sony A7IV EXIF injection runs locally inside your browser RAM."
        }
      }
    ]
  };

  return `<!DOCTYPE html>
<html lang="${pageLang}">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta name="referrer" content="strict-origin-when-cross-origin" />
  <meta http-equiv="Content-Security-Policy" content="default-src 'self' https: data: blob:; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob: https:; connect-src 'self' https:; object-src 'none'; base-uri 'self'; form-action 'self';" />
  <title>${page.title} | PureAI Studio</title>
  <meta name="description" content="${page.lead}" />
  <link rel="canonical" href="${SITE_URL}/${page.slug}" />
  <link rel="stylesheet" href="styles.css" />
  <script type="application/ld+json">${JSON.stringify(faqSchemaObj)}</script>
</head>
<body>
  <header class="topbar">
    <div class="container topbar-inner">
      <a href="clean-ai-studio.html" class="brand" style="text-decoration:none;color:inherit;">
        <span class="brand-icon">🧬</span>
        <div>
          <strong>PureAI Studio</strong>
          <span class="brand-tag">C2PA Scrubber · EXIF Profile · MP4 &amp; Unicode</span>
        </div>
      </a>
      <nav class="tabs">
        <a href="clean-ai-studio.html" class="tab-btn active" style="text-decoration:none;">🖼️ PureAI Studio</a>
        <a href="https://chromewebstore.google.com/detail/pureai-studio-%E2%80%94-c2pa-meta/pdebjlkmjdhpgiigepojdcpfbfimcgmo" target="_blank" rel="noopener" class="tab-btn" style="text-decoration:none;">🧩 ${isEsPage ? "Extensión Chrome" : "Chrome Extension"}</a>
        <a href="https://t.me/PureAIScannerBot" target="_blank" rel="noopener" class="tab-btn" style="text-decoration:none;">✈️ @PureAIScannerBot</a>
        <a href="directorio-guias.html" class="tab-btn" style="text-decoration:none;">🗂️ ${isEsPage ? "Directorio IA" : "AI Tools Directory"}</a>
      </nav>
    </div>
  </header>

  <main class="container main-grid">
    <article class="calc-card" style="line-height: 1.75;">
      <h1>${page.h1}</h1>
      <p class="subtitle">${page.lead}</p>
      ${instantToolWidget}
      ${page.bodyHtml}
      <div style="margin-top: 2rem; padding: 1.25rem; background: #0f172a; border: 1px solid #10b981; border-radius: 0.75rem;">
        <h3 style="margin-bottom: 0.5rem;">${isEsPage ? "⚡ Abrir Suite Completa en 1 Clic" : "⚡ Launch Full Local Studio in 1 Click"}</h3>
        <p style="color: #94a3b8; font-size: 0.9rem; margin-bottom: 1rem;">${isEsPage ? "Accede a la herramienta interactiva completa (Foto, Vídeo MP4, Lossless JPEG, EXIF iPhone 16 Pro y Lotes .ZIP) sin registro:" : "Open the full interactive suite (Photo, MP4 Video, Lossless JPEG, iPhone 16 Pro EXIF & Batch .ZIP) with zero signup:"}</p>
        <a href="${page.calcLink}" class="cta-button" style="display:inline-block; padding: 0.7rem 1.4rem;">${isEsPage ? "Abrir Herramienta Interactiva →" : "Open Interactive Studio →"}</a>
      </div>
    </article>

    <aside class="affiliate-sidebar">
      <div class="offer-card" style="border-color:#10b981;background:linear-gradient(160deg,#0f172a 0%,#064e3b 100%);">
        <span class="offer-badge">${isEsPage ? "⚡ Pases sin Suscripción desde 2,99 €" : "⚡ One-Time Packs from €2.99 (No Subscription)"}</span>
        <h2>${isEsPage ? "Limpia Metadatos C2PA / MP4 + Lotes .ZIP + EXIF Cámara" : "Strip C2PA / MP4 Metadata + Batch .ZIP + Camera EXIF"}</h2>
        <p>${isEsPage ? "Procesa fotos y vídeos cortos MP4 por lotes (.ZIP), aplica perfiles técnicos EXIF JPEG y limpia caracteres invisibles Unicode. <strong>Pago único sin suscripción ni caducidad (IVA incluido)</strong>." : "Batch-clean photos &amp; MP4 reels (.ZIP), write iPhone 16 Pro / Sony A7IV EXIF headers, and strip invisible Unicode watermarks. <strong>One-time credit packs never expire (VAT included)</strong>."}</p>
        <a href="clean-ai-studio.html" class="cta-button">${isEsPage ? "Abrir PureAI Studio Gratis →" : "Try PureAI Studio Free →"}</a>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:6px;margin-top:8px;">
          <a href="https://buy.stripe.com/9B6cN6e669uZ4vmeTE0000f" target="_blank" rel="noopener" style="background:#00e5a3;color:#042f1e;text-decoration:none;padding:6px;border-radius:7px;font-size:0.74rem;font-weight:900;text-align:center;">${isEsPage ? "⚡ 10 Usos: 2,99 €" : "⚡ 10 Files: €2.99"}</a>
          <a href="https://buy.stripe.com/3cIdRae66bD74vm6n80000g" target="_blank" rel="noopener" style="background:#a855f7;color:#fff;text-decoration:none;padding:6px;border-radius:7px;font-size:0.74rem;font-weight:900;text-align:center;">${isEsPage ? "🔥 50 + .ZIP: 9,90 €" : "🔥 50 + .ZIP: €9.90"}</a>
        </div>
        <a href="https://buy.stripe.com/eVq00k7HIfTn1jabHs0000h" target="_blank" rel="noopener" style="display:block;margin-top:6px;background:#1e293b;color:#93c5fd;border:1px solid #3b82f6;text-decoration:none;padding:6px;border-radius:7px;font-size:0.74rem;font-weight:800;text-align:center;">${isEsPage ? "💎 Estudio Anual Ilimitado: 39 €/año" : "💎 Unlimited Studio: €39/yr"}</a>
      </div>
    </aside>
  </main>

  <footer class="footer container">
    <p>© 2026 PureAI Studio — <a href="clean-ai-studio.html" style="color:#10b981;">C2PA &amp; EXIF Metadata Suite</a> | <a href="directorio-guias.html" style="color:#10b981;">AI Guides Directory</a> | <a href="terms.html" style="color:#94a3b8;">Terms</a> | <a href="privacy-policy.html" style="color:#94a3b8;">Privacy</a></p>
  </footer>
  <script src="telemetria-soporte.js"></script>
</body>
</html>`;
}

function normalizeSlugMatch(s) {
  return String(s || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

async function publishTelegraphArticles(prevArticles = [], telegraphBySlug = {}) {
  const accRes = await fetch(
    "https://api.telegra.ph/createAccount?short_name=PureAIStudio&author_name=PureAI+Studio&author_url=" +
      encodeURIComponent(SITE_URL)
  ).then((r) => r.json());

  if (!accRes.ok) return [];
  const token = accRes.result.access_token;

  const articles = [
    {
      slugKey: "Remove-Made-With-AI-Label-Instagram-TikTok-C2PA-iPhone-EXIF",
      title: "How to Remove 'Made with AI' Label on Instagram & TikTok (C2PA Scrubber + iPhone 16 Pro EXIF Injector)",
      nodes: [
        { tag: "p", children: ["Instagram, TikTok, LinkedIn, and Adobe Stock automatically flag images generated or retouched with DALL-E 3, Midjourney v6, Flux, and Photoshop Generative Fill by reading hidden binary C2PA/JUMBF manifests and blank EXIF containers."] },
        { tag: "p", children: [{ tag: "a", attrs: { href: `${SITE_URL}/clean-ai-studio.html` }, children: ["🛡️ Open PureAI Studio (Free 100% Client-Side C2PA Scrubber & iPhone 16 Pro EXIF Injector)"] }] },
        { tag: "p", children: [{ tag: "a", attrs: { href: "https://chromewebstore.google.com/detail/pureai-studio-%E2%80%94-c2pa-meta/pdebjlkmjdhpgiigepojdcpfbfimcgmo" }, children: ["🧩 Install Official PureAI Studio Chrome Extension (Chrome Web Store)"] }] },
        { tag: "p", children: [{ tag: "a", attrs: { href: `${SITE_URL}/exif-camera-injector-iphone-sony-ai-photos.html` }, children: ["📱 Inject Real Apple iPhone 16 Pro / Sony A7IV EXIF Headers into AI Photos"] }] }
      ]
    },
    {
      slugKey: "Remove-Google-SynthID-And-Midjourney-v6-Metadata-Online",
      title: "Remove Google SynthID, Midjourney v6 & ComfyUI PNG Workflow Metadata Online (Zero Server Upload)",
      nodes: [
        { tag: "p", children: ["Standard EXIF removers only clear container tags while leaving pixel-domain steganography (Google SynthID) and blank EXIF headers intact. PureAI Studio neutralizes sub-pixel frequency patterns and strips 100% of C2PA, JUMBF, and ComfyUI workflow chunks locally in your browser."] },
        { tag: "p", children: [{ tag: "a", attrs: { href: `${SITE_URL}/remove-google-synthid-ai-pixel-watermark.html` }, children: ["🧬 Launch Google SynthID & C2PA Dual-Layer Watermark Scrubber"] }] },
        { tag: "p", children: [{ tag: "a", attrs: { href: `${SITE_URL}/midjourney-v6-flux-c2pa-metadata-remover.html` }, children: ["🎨 Strip Midjourney v6, Flux.1 & ComfyUI Secret Prompts from PNG/JPEG"] }] },
        { tag: "p", children: [{ tag: "a", attrs: { href: `${SITE_URL}/adobe-stock-shutterstock-c2pa-ai-rejection-fix.html` }, children: ["📸 Fix Adobe Stock & Shutterstock C2PA Metadata Errors (Batch .ZIP)"] }] }
      ]
    },
    {
      slugKey: "Quitar-Etiqueta-Hecho-Con-IA-Instagram-TikTok-Borrar-C2PA",
      title: "Cómo Quitar la Etiqueta 'Hecho con IA' en Instagram y TikTok y Añadir EXIF de iPhone 16 Pro Gratis",
      nodes: [
        { tag: "p", children: ["Elimina en 1 clic los metadatos ocultos C2PA, JUMBF y coordenadas GPS EXIF de tus fotos creadas o editadas con IA e inyecta una cabecera técnica de cámara (Apple iPhone 16 Pro, Sony A7 IV o Canon EOS R5) sin subir tus fotos a ningún servidor."] },
        { tag: "p", children: [{ tag: "a", attrs: { href: `${SITE_URL}/quitar-etiqueta-hecho-con-ia-instagram-tiktok-fotos.html` }, children: ["🖼️ Limpiar Foto C2PA / EXIF Gratis Ahora en PureAI Studio"] }] },
        { tag: "p", children: [{ tag: "a", attrs: { href: `${SITE_URL}/detectar-y-eliminar-espacios-invisibles-chatgpt-u202f.html` }, children: ["✍️ Eliminar Marcas de Agua Invisibles de ChatGPT (U+202F / U+200B)"] }] }
      ]
    },
    {
      slugKey: "Free-Telegram-Bot-AI-Photo-Detector-C2PA-EXIF-GPS",
      title: "Free Telegram Bot to Check AI Photo Metadata (C2PA), ComfyUI Prompts & GPS (@PureAIScannerBot)",
      nodes: [
        { tag: "p", children: ["Forward any photo, MP4 video, or HTTPS link to @PureAIScannerBot on Telegram to scan hidden C2PA/JUMBF manifests, ComfyUI PNG workflows, and EXIF GPS coordinates (0x8825) in RAM in under 1 second—zero files stored."] },
        { tag: "p", children: [{ tag: "a", attrs: { href: "https://t.me/PureAIScannerBot" }, children: ["✈️ Launch @PureAIScannerBot on Telegram (Free Forensic Scanner)"] }] },
        { tag: "p", children: [{ tag: "a", attrs: { href: `${SITE_URL}/clean-ai-studio.html?lang=en&utm_source=telegraph_tgbot` }, children: ["🧹 Clean Metadata & Inject iPhone 16 Pro EXIF at PureAI Studio"] }] }
      ]
    },
    {
      slugKey: "Bot-Telegram-Gratis-Detectar-Fotos-IA-C2PA-GPS-EXIF",
      title: "Bot de Telegram Gratis para Ver Metadatos C2PA 'Creado con IA', Prompts ComfyUI y GPS EXIF (@PureAIScannerBot)",
      nodes: [
        { tag: "p", children: ["Envía cualquier foto sin comprimir, vídeo MP4 o enlace web HTTPS a @PureAIScannerBot en Telegram para comprobar en 1 segundo en memoria RAM si esconde etiquetas C2PA de IA, workflows de ComfyUI o coordenadas GPS exactas (0 archivos guardados)."] },
        { tag: "p", children: [{ tag: "a", attrs: { href: "https://t.me/PureAIScannerBot" }, children: ["✈️ Abrir @PureAIScannerBot Gratis en Telegram"] }] },
        { tag: "p", children: [{ tag: "a", attrs: { href: `${SITE_URL}/clean-ai-studio.html?lang=es&utm_source=telegraph_tgbot` }, children: ["🧹 Limpiar C2PA e Inyectar EXIF iPhone 16 Pro en PureAI Studio"] }] }
      ]
    }
  ];

  const publishedUrls = [];
  for (const art of articles) {
    const normSlugPrefix = normalizeSlugMatch(art.slugKey).slice(0, 18);
    const normTitlePrefix = normalizeSlugMatch(art.title).slice(0, 28);
    const matchedPrev = prevArticles.find((u) => {
      let decoded = String(u || "");
      try { decoded = decodeURIComponent(decoded); } catch (_) {}
      const nu = normalizeSlugMatch(decoded);
      return (normSlugPrefix && nu.includes(normSlugPrefix)) || (normTitlePrefix && nu.includes(normTitlePrefix));
    });
    const alreadyExists = Boolean((telegraphBySlug && telegraphBySlug[art.slugKey]) || matchedPrev);
    if (alreadyExists) {
      if (telegraphBySlug && !telegraphBySlug[art.slugKey] && matchedPrev) {
        telegraphBySlug[art.slugKey] = matchedPrev;
      }
      continue;
    }
    const res = await fetch("https://api.telegra.ph/createPage", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        access_token: token,
        title: art.title,
        author_name: "PureAI Studio",
        author_url: SITE_URL,
        content: art.nodes,
        return_content: false
      })
    }).then((r) => r.json());
    if (res.ok && res.result && res.result.url) {
      publishedUrls.push(res.result.url);
      if (telegraphBySlug && typeof telegraphBySlug === "object") {
        telegraphBySlug[art.slugKey] = res.result.url;
      }
    }
  }
  return publishedUrls;
}

async function run() {
  loadPrivateEnvIfPresent();
  fs.writeFileSync(path.join(__dirname, `${INDEXNOW_KEY}.txt`), INDEXNOW_KEY);

  const allUrls = [
    `${SITE_URL}/`,
    `${SITE_URL}/clean-ai-studio.html`
  ];

  for (const page of SEO_PAGES) {
    fs.writeFileSync(path.join(__dirname, page.slug), buildSeoPageHtml(page));
    allUrls.push(`${SITE_URL}/${page.slug}`);
  }

  // Ola progresiva multilingüe (10 idiomas × 5 herramientas interactivas reales con hreflang cruzado)
  const unlockedMatrixEntries = growthMatrix.getUnlockedMatrixPages(new Date());
  for (const mEntry of unlockedMatrixEntries) {
    fs.writeFileSync(
      path.join(__dirname, mEntry.slug),
      growthMatrix.buildMatrixToolHtml(mEntry, unlockedMatrixEntries)
    );
    allUrls.push(`${SITE_URL}/${mEntry.slug}`);
  }

  // Generar feed RSS 2.0 oficial (feed.xml) para sindicación automática y rastreadores
  const rssItems = [
    {
      title: "PureAI Studio — 100% Local C2PA, EXIF Camera Injector, MP4 & Unicode Scrubber",
      url: `${SITE_URL}/clean-ai-studio.html`,
      description: "Strip C2PA Content Credentials, clean MP4 AI video containers, and inject iPhone 16 Pro EXIF headers locally in your browser."
    },
    {
      title: "Free Embeddable C2PA, AI & EXIF GPS Forensic Scanner Widget",
      url: `${SITE_URL}/embed-scanner.html`,
      description: "Lightweight zero-upload iframe scanner widget for blogs, Notion, and creator communities."
    },
    ...SEO_PAGES.map((p) => ({
      title: p.title,
      url: `${SITE_URL}/${p.slug}`,
      description: p.lead
    })),
    ...unlockedMatrixEntries.map((m) => ({
      title: m.title,
      url: `${SITE_URL}/${m.slug}`,
      description: m.lead
    }))
  ];
  fs.writeFileSync(path.join(__dirname, "feed.xml"), growthMatrix.buildRssFeedXml(rssItems, new Date()));

  const NON_AI_FINANCE_PATTERN = /^(cfo-control-financiero|panel-reclutamiento|kit-marca-canal)/i;
  const allHtmlFiles = fs
    .readdirSync(__dirname)
    .filter((f) => f.endsWith(".html") && !f.startsWith("google") && !NON_AI_FINANCE_PATTERN.test(f))
    .sort();
  const dirLinks = allHtmlFiles
    .filter((f) => f !== "directorio-guias.html" && f !== "index.html")
    .map((f) => `<li style="margin-bottom:0.55rem;"><a href="${f}" style="color:#10b981;font-weight:600;">${f.replace(".html", "").replace(/-/g, " ").toUpperCase()}</a></li>`)
    .join("\n");
  const dirHtml = buildSeoPageHtml({
    slug: "directorio-guias.html",
    title: "PureAI Studio — Directory of C2PA Metadata Scrubber, EXIF Spoofer & AI Watermark Tools",
    h1: "PureAI Studio — Complete AI Privacy, C2PA & Watermark Directory (2026)",
    lead: "Access all 100% Client-Side AI utilities: C2PA/JUMBF 'Made with AI' label removal, iPhone 16 Pro & Sony A7IV EXIF injection, and ChatGPT Unicode watermark scrubbing.",
    calcLink: "clean-ai-studio.html",
    bodyHtml: `<ul style="margin: 1rem 0 1.5rem 1.25rem;">\n${dirLinks}\n</ul>`
  });
  fs.writeFileSync(path.join(__dirname, "directorio-guias.html"), dirHtml);

  const fullUrlList = [`${SITE_URL}/`, ...allHtmlFiles.filter((f) => f !== "index.html").map((f) => `${SITE_URL}/${f}`)];
  fs.writeFileSync(path.join(__dirname, "sitemap.txt"), fullUrlList.join("\n"));

  const sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${fullUrlList
  .map(
    (u) => `  <url>
    <loc>${u}</loc>
    <changefreq>daily</changefreq>
    <priority>${u === SITE_URL + "/" || u.includes("clean-ai-studio") ? "1.0" : "0.9"}</priority>
  </url>`
  )
  .join("\n")}
</urlset>`;
  fs.writeFileSync(path.join(__dirname, "sitemap.xml"), sitemapXml);

  let prevArticles = [];
  let telegraphBySlug = {};
  const seenSocialIds = new Set();
  const privOpsDir = path.join(process.env.USERPROFILE || process.env.HOME || __dirname, ".gemini", "pureai-private-ops");
  try { fs.mkdirSync(privOpsDir, { recursive: true }); } catch (_) {}
  const reportPath = path.join(privOpsDir, "red-de-trafico.json");
  if (fs.existsSync(reportPath)) {
    try {
      const prev = JSON.parse(fs.readFileSync(reportPath, "utf8"));
      prevArticles = (prev.telegraphCloudArticles || []).filter((u) => !/-\d{2}-\d{2}-\d+$/.test(u));
      if (prev.telegraphBySlug && typeof prev.telegraphBySlug === "object") {
        Object.assign(telegraphBySlug, prev.telegraphBySlug);
      }
      if (Array.isArray(prev.repliedSocialIds)) {
        for (const sid of prev.repliedSocialIds) if (sid) seenSocialIds.add(String(sid));
      }
    } catch (_) {}
  }
  const adminToken = (process.env.ADMIN_DIGEST_TOKEN || "").trim();
  if (adminToken && typeof fetch === "function") {
    try {
      const opsRes = await fetch("https://pureai-stripe-webhook.pureaistudio-app.workers.dev/ops-state", {
        headers: { Authorization: "Bearer " + adminToken }
      }).then((r) => (r && r.ok ? r.json() : null)).catch(() => null);
      if (opsRes && opsRes.state) {
        if (opsRes.state.telegraphBySlug && typeof opsRes.state.telegraphBySlug === "object") {
          Object.assign(telegraphBySlug, opsRes.state.telegraphBySlug);
        }
        if (Array.isArray(opsRes.state.telegraphCloudArticles)) {
          prevArticles = [...new Set([...prevArticles, ...opsRes.state.telegraphCloudArticles])];
        }
        if (Array.isArray(opsRes.state.repliedSocialIds)) {
          for (const sid of opsRes.state.repliedSocialIds) if (sid) seenSocialIds.add(String(sid));
        }
      }
    } catch (_) {}
  }

  const telegraphUrls = await publishTelegraphArticles(prevArticles, telegraphBySlug);
  console.log("Published Telegraph Cloud Articles:", telegraphUrls);

  try {
    const indexRes = await fetch("https://api.indexnow.org/indexnow", {
      method: "POST",
      headers: { "Content-Type": "application/json; charset=utf-8" },
      body: JSON.stringify({
        host: "pureaistudios.com",
        key: INDEXNOW_KEY,
        keyLocation: `${SITE_URL}/${INDEXNOW_KEY}.txt`,
        urlList: [...fullUrlList, `${SITE_URL}/feed.xml`, `${SITE_URL}/llms.txt`, `${SITE_URL}/llms-full.txt`]
      })
    });
    console.log("IndexNow status:", indexRes.status);
  } catch (_) {}

  const mergedArticles = [...new Set([...Object.values(telegraphBySlug), ...telegraphUrls, ...prevArticles])];
  const opportunities = await fetchLiveSocialOpportunities(seenSocialIds);
  await sendDailyMobilePushDigest(opportunities, mergedArticles);
  const report = {
    updatedAt: new Date().toISOString(),
    mainSite: SITE_URL,
    seoPages: fullUrlList,
    seoPagesCount: fullUrlList.length,
    telegraphBySlug,
    telegraphCloudArticles: mergedArticles,
    repliedSocialIds: [...seenSocialIds].slice(-200),
    latestSocialOpportunities: opportunities
  };
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  if (adminToken && typeof fetch === "function") {
    try {
      await fetch("https://pureai-stripe-webhook.pureaistudio-app.workers.dev/ops-state", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: "Bearer " + adminToken },
        body: JSON.stringify({
          updatedAt: report.updatedAt,
          seoPagesCount: report.seoPagesCount,
          telegraphBySlug,
          telegraphCloudArticles: mergedArticles,
          repliedSocialIds: report.repliedSocialIds
        })
      });
    } catch (_) {}
  }
}


async function fetchLiveSocialOpportunities(seenSocialIds = new Set()) {
  const opportunities = [];
  try {
    const hnUrl = "https://hn.algolia.com/api/v1/search_by_date?query=C2PA%20OR%20%22Made%20with%20AI%22%20OR%20%22ChatGPT%20watermark%22%20OR%20SynthID&tags=story&hitsPerPage=3";
    const hnRes = await fetch(hnUrl).then((r) => r.json()).catch(() => null);
    if (hnRes && Array.isArray(hnRes.hits)) {
      for (const h of hnRes.hits.slice(0, 2)) {
        if (h && h.objectID && h.title) {
          opportunities.push({
            platform: "HackerNews",
            title: h.title,
            url: "https://news.ycombinator.com/item?id=" + h.objectID,
            suggestedReply: "If you want to inspect or strip C2PA/JUMBF manifests, EXIF tags, or invisible LLM Unicode spaces (U+202F/U+200B) 100% locally in your browser (zero server upload), you can test it free here: https://pureaistudios.com/clean-ai-studio.html?lang=en"
          });
        }
      }
    }
  } catch (_) {}

  try {
    const rUrl = "https://www.reddit.com/search.json?q=%22Made+with+AI%22+Instagram+OR+C2PA+metadata+OR+ChatGPT+invisible+spaces&sort=new&limit=3";
    const rRes = await fetch(rUrl, { headers: { "User-Agent": "PureAIStudioBot/1.0" } }).then((r) => r.json()).catch(() => null);
    const children = (rRes && rRes.data && rRes.data.children) || [];
    for (const c of children.slice(0, 2)) {
      const d = c && c.data;
      if (d && d.title && d.permalink) {
        opportunities.push({
          platform: "Reddit r/" + (d.subreddit || "all"),
          title: d.title,
          fullname: d.name,
          url: "https://www.reddit.com" + d.permalink,
          suggestedReply: "Instagram and TikTok detect the hidden binary C2PA/JUMBF manifest and blank EXIF container inside the file. You can strip the C2PA tag and inject a clean iPhone 16 Pro EXIF header 100% in your browser (free, no signup): https://pureaistudios.com/clean-ai-studio.html?lang=en"
        });
      }
    }
  } catch (_) {}

  // Si existen credenciales OAuth de Reddit en entorno (GitHub Secrets), publicar 1 respuesta útil al día automáticamente
  if (process.env.REDDIT_CLIENT_ID && process.env.REDDIT_CLIENT_SECRET && process.env.REDDIT_USER && process.env.REDDIT_PASS) {
    const targetReddit = opportunities.find((o) => o.fullname && o.platform.startsWith("Reddit") && !(seenSocialIds && seenSocialIds.has(o.fullname)));
    if (targetReddit) {
      try {
        const auth = Buffer.from(process.env.REDDIT_CLIENT_ID + ":" + process.env.REDDIT_CLIENT_SECRET).toString("base64");
        const tokRes = await fetch("https://www.reddit.com/api/v1/access_token", {
          method: "POST",
          headers: {
            Authorization: "Basic " + auth,
            "Content-Type": "application/x-www-form-urlencoded",
            "User-Agent": "PureAIStudioCloud/1.0 by " + process.env.REDDIT_USER
          },
          body: new URLSearchParams({
            grant_type: "password",
            username: process.env.REDDIT_USER,
            password: process.env.REDDIT_PASS
          }).toString()
        }).then((r) => r.json());
        if (tokRes && tokRes.access_token) {
          await fetch("https://oauth.reddit.com/api/comment", {
            method: "POST",
            headers: {
              Authorization: "Bearer " + tokRes.access_token,
              "Content-Type": "application/x-www-form-urlencoded",
              "User-Agent": "PureAIStudioCloud/1.0 by " + process.env.REDDIT_USER
            },
            body: new URLSearchParams({
              api_type: "json",
              thing_id: targetReddit.fullname,
              text: targetReddit.suggestedReply
            }).toString()
          });
          targetReddit.autoPosted = true;
          if (seenSocialIds && typeof seenSocialIds.add === "function") {
            seenSocialIds.add(targetReddit.fullname);
          }
        }
      } catch (_) {}
    }
  }

  return opportunities;
}

async function sendDailyMobilePushDigest(opportunities, telegraphUrls) {
  const topOpp = opportunities && opportunities[0] ? opportunities[0] : null;
  try {
    // El envío diario a Telegram lo ejecuta con precisión exacta el Cron Trigger de Cloudflare a las 10:00 AM CET
    const digestToken = process.env.ADMIN_DIGEST_TOKEN || "";
    if (process.env.FORCE_TELEGRAM_DIGEST === "1" && digestToken) {
      await fetch("https://pureai-stripe-webhook.pureaistudio-app.workers.dev/daily-digest", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + digestToken
        },
        body: JSON.stringify({
          articlesCount: Array.isArray(telegraphUrls) ? telegraphUrls.length : 0,
          topOpp
        })
      });
    }
    console.log("✈️ Daily Telegram digest triggered via Cloudflare Worker");
  } catch (_) {}
}

if (require.main === module) {
  run().catch(console.error);
} else {
  module.exports = { SEO_PAGES, buildSeoPageHtml, publishTelegraphArticles, normalizeSlugMatch };
}
