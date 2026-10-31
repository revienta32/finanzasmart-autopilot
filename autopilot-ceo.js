/**
 * CEO AUTOPILOT ENGINE - PureAI Studio
 * 1. Genera y mantiene las páginas de SEO Programático de alta intención de búsqueda (Long-Tail IA).
 * 2. Publica artículos satélite en Telegra.ph sin duplicar.
 * 3. Notifica a los buscadores (Bing, DuckDuckGo, Yandex, ChatGPT Search) mediante IndexNow API.
 */

const fs = require("fs");
const path = require("path");

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
        <li><strong>Instant Browser Extension &amp; Web Studio:</strong> Clean single images for free or unlock Batch <code>.ZIP</code> + iPhone 16 Pro EXIF injection from 4,99 €/month.</li>
      </ul>
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
          <a href="https://buy.stripe.com/aFaaEY0fgcHbd1SeTE0000c" target="_blank" rel="noopener" style="background:#00e5a3;color:#042f1e;text-decoration:none;padding:0.75rem 1rem;border-radius:10px;font-weight:900;font-size:0.85rem;">🔥 Pro Monthly -50% (4,99 €)</a>
        </div>
      </div>
      <script>
      function escapeSeoHtml(s) {
        return String(s || "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
      }
      function quickCleanImg(file) {
        if (!file || !file.size) return;
        var st = document.getElementById("quick-img-status");
        st.textContent = "⏳ Scanning & stripping C2PA / EXIF binary containers...";
        var img = new Image();
        img.onload = function () {
          var c = document.getElementById("quick-canvas");
          c.width = img.naturalWidth || 512;
          c.height = img.naturalHeight || 512;
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
            st.innerHTML = "✅ <strong>" + escapeSeoHtml(cleanName) + " downloaded (0% C2PA / 0% EXIF)!</strong> Want to clean 50+ photos in a .ZIP or apply optical EXIF headers? <a href='clean-ai-studio.html' style='color:#fcd34d;font-weight:800;'>Unlock in PureAI Studio Pro (from 4,99 €) →</a>";
          }, "image/jpeg", 0.95);
        };
        img.src = URL.createObjectURL(file);
      }
      </script>`
    : "";

  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta name="referrer" content="strict-origin-when-cross-origin" />
  <title>${page.title} | PureAI Studio</title>
  <meta name="description" content="${page.lead}" />
  <link rel="canonical" href="${SITE_URL}/${page.slug}" />
  <link rel="stylesheet" href="styles.css" />
</head>
<body>
  <header class="topbar">
    <div class="container topbar-inner">
      <a href="clean-ai-studio.html" class="brand" style="text-decoration:none;color:inherit;">
        <span class="brand-icon">🧬</span>
        <div>
          <strong>PureAI Studio</strong>
          <span class="brand-tag">C2PA Scrubber · EXIF Profile · Unicode Hygiene</span>
        </div>
      </a>
      <nav class="tabs">
        <a href="clean-ai-studio.html" class="tab-btn active" style="text-decoration:none;">🖼️ PureAI Studio</a>
        <a href="https://chromewebstore.google.com/detail/pureai-studio-%E2%80%94-c2pa-meta/pdebjlkmjdhpgiigepojdcpfbfimcgmo" target="_blank" rel="noopener" class="tab-btn" style="text-decoration:none;">🧩 Extensión Chrome</a>
        <a href="directorio-guias.html" class="tab-btn" style="text-decoration:none;">🗂️ Directorio IA</a>
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
        <h3 style="margin-bottom: 0.5rem;">⚡ Abrir Suite Completa en 1 Clic</h3>
        <p style="color: #94a3b8; font-size: 0.9rem; margin-bottom: 1rem;">Accede a la herramienta interactiva completa sin registro y 100% en tu navegador:</p>
        <a href="${page.calcLink}" class="cta-button" style="display:inline-block; padding: 0.7rem 1.4rem;">Abrir Herramienta Interactiva →</a>
      </div>
    </article>

    <aside class="affiliate-sidebar">
      <div class="offer-card" style="border-color:#10b981;background:linear-gradient(160deg,#0f172a 0%,#064e3b 100%);">
        <span class="offer-badge">🧬 PureAI Studio Pro (4,99 € 1er mes)</span>
        <h2>Limpia Metadatos C2PA / JUMBF + Lotes .ZIP + EXIF Cámara</h2>
        <p>Procesa fotos y vídeos cortos MP4 por lotes (.ZIP), aplica perfiles técnicos EXIF JPEG y limpia caracteres invisibles Unicode. <strong>50% DTO 1er mes (4,99 €) con código FRIEND50</strong>.</p>
        <a href="clean-ai-studio.html" class="cta-button">Abrir PureAI Studio Gratis →</a>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:6px;margin-top:8px;">
          <a href="https://buy.stripe.com/aFaaEY0fgcHbd1SeTE0000c" target="_blank" rel="noopener" style="background:#00e5a3;color:#042f1e;text-decoration:none;padding:6px;border-radius:7px;font-size:0.75rem;font-weight:900;text-align:center;">🔥 Pro Mensual: 4,99 €</a>
          <a href="https://buy.stripe.com/5kQ28sfaa0Yt5zqfXI0000d" target="_blank" rel="noopener" style="background:#1e293b;color:#93c5fd;border:1px solid #3b82f6;text-decoration:none;padding:6px;border-radius:7px;font-size:0.75rem;font-weight:800;text-align:center;">💎 Pro Anual: 39 €</a>
        </div>
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

async function publishTelegraphArticles(prevArticles = []) {
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
    }
  ];

  const publishedUrls = [];
  for (const art of articles) {
    const alreadyExists = prevArticles.some((u) => decodeURIComponent(u).toLowerCase().includes(art.slugKey.slice(0, 18).toLowerCase()));
    if (alreadyExists) continue;
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
    }
  }
  return publishedUrls;
}

async function run() {
  fs.writeFileSync(path.join(__dirname, `${INDEXNOW_KEY}.txt`), INDEXNOW_KEY);

  const allUrls = [
    `${SITE_URL}/`,
    `${SITE_URL}/clean-ai-studio.html`
  ];

  for (const page of SEO_PAGES) {
    fs.writeFileSync(path.join(__dirname, page.slug), buildSeoPageHtml(page));
    allUrls.push(`${SITE_URL}/${page.slug}`);
  }

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

  const fullUrlList = [`${SITE_URL}/`, ...allHtmlFiles.map((f) => `${SITE_URL}/${f}`)];
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
  const privOpsDir = path.join(process.env.USERPROFILE || process.env.HOME || __dirname, ".gemini", "pureai-private-ops");
  try { fs.mkdirSync(privOpsDir, { recursive: true }); } catch (_) {}
  const reportPath = path.join(privOpsDir, "red-de-trafico.json");
  if (fs.existsSync(reportPath)) {
    try {
      const prev = JSON.parse(fs.readFileSync(reportPath, "utf8"));
      prevArticles = (prev.telegraphCloudArticles || []).filter((u) => !/-\d{2}-\d{2}-\d+$/.test(u));
    } catch (_) {}
  }
  const telegraphUrls = await publishTelegraphArticles(prevArticles);
  console.log("Published Telegraph Cloud Articles:", telegraphUrls);

  const indexRes = await fetch("https://api.indexnow.org/indexnow", {
    method: "POST",
    headers: { "Content-Type": "application/json; charset=utf-8" },
    body: JSON.stringify({
      host: "pureaistudios.com",
      key: INDEXNOW_KEY,
      keyLocation: `${SITE_URL}/${INDEXNOW_KEY}.txt`,
      urlList: fullUrlList
    })
  });
  console.log("IndexNow status:", indexRes.status);

  const mergedArticles = [...new Set([...telegraphUrls, ...prevArticles])];
  const report = {
    updatedAt: new Date().toISOString(),
    mainSite: SITE_URL,
    seoPages: fullUrlList,
    telegraphCloudArticles: mergedArticles
  };
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
}

run().catch(console.error);
