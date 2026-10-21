/**
 * SINDICACIÓN MULTICANAL CEO - FinanzaSmart & ReclamaSmart
 * 1. Publica Gists públicos de alta autoridad en gist.github.com (DA 96) para búsquedas legales y fiscales.
 * 2. Crea repositorios satélite temáticos en github.com con Topics SEO que redirigen a nuestras herramientas.
 * 3. Escanea en tiempo real Reddit España (r/ESLegal, r/SpainFIRE) detectando usuarios con problemas reales hoy.
 */

const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

const SITE_URL = "https://revienta32.github.io/finanzasmart-autopilot";
const REVOLUT_URL = "https://revolut.com/referral/?referral-code=revienta!OCT1-26-AR-H1&geo-redirect";
const BITGET_URL = "https://www.bitget.com/es/referral/register?clacCode=KQBSNNRF";

function getGithubToken() {
  try {
    const credOut = execSync("git credential fill", { input: "protocol=https\nhost=github.com\n\n" }).toString();
    return (credOut.match(/password=(.+)/) || [])[1]?.trim() || process.env.GITHUB_TOKEN;
  } catch (_) {
    return process.env.GITHUB_TOKEN;
  }
}

async function publishHighAuthorityGists(token) {
  if (!token) return [];
  const headers = {
    Authorization: "Bearer " + token,
    Accept: "application/vnd.github+json",
    "User-Agent": "FinanzaSmart-CEO"
  };

  // Comprobar Gists ya existentes para no duplicar
  const existing = await fetch("https://api.github.com/gists", { headers }).then((r) => r.json()).catch(() => []);
  const existingDescs = new Set(Array.isArray(existing) ? existing.map((g) => g.description) : []);

  const gistsToCreate = [
    {
      description: "Modelo Escrito Oficial para Reclamar Gastos de Hipoteca al Banco sin Abogado (Sentencia TJUE C-561/21)",
      filename: "Reclamar-Gastos-Hipoteca-TJUE-2026.md",
      content: `# 🏦 Cómo Reclamar los Gastos de Hipoteca sin Abogado en 2026 (Sentencia TJUE C-561/21)\n\nTras la sentencia del Tribunal de Justicia de la Unión Europea (TJUE), cualquier hipoteca firmada antes de junio de 2019 permite recuperar el **50% de Notaría y el 100% de Registro, Gestoría y Tasación más los intereses legales acumulados** (media de 1.500 € a 2.400 €).\n\n👉 **Calcula gratis tu importe exacto + intereses y genera el escrito oficial en PDF listo para presentar en tu banco:**\n### [⚖️ Abrir Calculadora y Generador de Escrito Gastos de Hipoteca](${SITE_URL}/reclamaciones-ia.html)\n\n---\n### 💡 Consejo para cobrar la indemnización sin comisiones\nAbre una cuenta gratuita con IBAN español en **[Revolut (Invitación Oficial)](${REVOLUT_URL})** para domiciliar el abono del banco y separar tu dinero en huchas remuneradas.`
    },
    {
      description: "Modelo Burofax / Requerimiento para Reclamar Devolución de Fianza de Alquiler (Art. 36.4 LAU)",
      filename: "Modelo-Reclamar-Fianza-Alquiler-LAU.md",
      content: `# 🔑 Modelo Oficial para Reclamar la Fianza del Alquiler no Devuelta en 30 Días (Art. 36.4 LAU)\n\nEl **artículo 36.4 de la Ley de Arrendamientos Urbanos (LAU)** establece que, transcurrido 1 mes desde la entrega de llaves sin devolución de la fianza, esta devenga automáticamente el interés legal del dinero a favor del inquilino, pudiendo reclamarse en juicio verbal sin abogado ni procurador hasta 2.000 €.\n\n👉 **Calcula los intereses de demora y descarga tu requerimiento fehaciente personalizado en 1 clic:**\n### [⚖️ Generar Burofax de Reclamación de Fianza de Alquiler](${SITE_URL}/reclamaciones-ia.html)`
    },
    {
      description: "Calculadora Subida de Alquiler IRAV 2026 (INE) + Modelo Carta de Notificación al Inquilino (Art. 18 LAU)",
      filename: "Calculadora-IRAV-Alquiler-Carta-Inquilino.md",
      content: `# 🏠 Calculadora IRAV 2026 y Carta Oficial para Actualizar el Alquiler al Inquilino\n\nSegún el **artículo 18 de la LAU**, la actualización anual de la renta aplicando el nuevo índice IRAV del INE solo es exigible si el propietario lo notifica por escrito al arrendatario con al menos 30 días de antelación.\n\n👉 **Calcula la nueva cuota exacta y genera la carta legal lista para enviar:**\n### [📄 Abrir Calculadora IRAV y Generador de Carta al Inquilino](${SITE_URL}/reclamaciones-ia.html)`
    },
    {
      description: "Simulador Declaración de la Renta España (Modelo 100) + Casillas Criptomonedas 1800-1814 y Deducciones CCAA",
      filename: "Simulador-Declaracion-Renta-Espana-IRPF.md",
      content: `# 🤖 Gestor Renta IA España: Simulador Modelo 100 y Casillas Exactas Renta WEB\n\nComprueba gratis en 30 segundos si tu Declaración de la Renta te sale **a devolver o a pagar** según tu situación real (1 o 2 pagadores, hijos, declaración conjunta vs. individual, alquiler en las 17 CCAA, sindicatos, ONGs o criptomonedas).\n\n👉 **Simular mi Declaración de la Renta Gratis:**\n### [🧮 Abrir Gestor Renta IA España (Modelo 100)](${SITE_URL}/gestor-renta-ia.html)\n\n- **🏦 Cuenta gratuita recomendada para domiciliar devolución:** [Abrir Revolut Gratis](${REVOLUT_URL})\n- **⚡ Exchange con informe fiscal anual (Código Bono ` + "`KQBSNNRF`" + `):** [Registrarse en Bitget](${BITGET_URL})`
    },
    {
      description: "Calculadora de Finiquito e Indemnización por Despido (33 y 20 días/año) + Modelo Papeleta de Conciliación SMAC",
      filename: "Calculadora-Finiquito-Indemnizacion-Despido-Papeleta-SMAC.md",
      content: `# 💼 Cómo Calcular tu Finiquito e Indemnización por Despido en España + Papeleta SMAC (2026)\n\nEl plazo legal para impugnar un despido o reclamar cantidades pendientes es de **20 días hábiles** (Art. 59.3 del Estatuto de los Trabajadores) presentando la Papeleta de Conciliación ante el SMAC.\n\n👉 **Calcula gratis tu indemnización (33 o 20 días/año exenta de IRPF), vacaciones no disfrutadas y genera tu Papeleta SMAC lista para registrar:**\n### [⚖️ Abrir Calculadora de Finiquito y Generador Papeleta SMAC](${SITE_URL}/laboral-ia.html)`
    },
    {
      description: "Modelo Pliego de Descargos y Recurso de Multas DGT, Radar y ZBE (Certificado Metrológico Orden ICT/155/2020)",
      filename: "Modelo-Recurrir-Multa-DGT-Radar-ZBE.md",
      content: `# 🚗 Modelo Oficial para Recurrir Multas de Radar DGT y Zonas de Bajas Emisiones (ZBE)\n\nMás del 38% de las multas de velocidad o cámaras municipales se anulan al exigir los dos fotogramas obligatorios, la aplicación del margen de error normativo y el certificado de verificación periódica del cinemómetro (**Orden ICT/155/2020**).\n\n👉 **Genera tu escrito de alegaciones personalizado en 30 segundos:**\n### [📄 Abrir Generador de Recurso de Multas DGT / ZBE](${SITE_URL}/multas-dgt-ia.html)`
    },
    {
      description: "Free Peppol UBL 2.1, German XRechnung 3.0, French Factur-X & Spanish VeriFactu E-Invoice XML Generator + Viewer (EN 16931)",
      filename: "Global-E-Invoice-XML-Generator-Viewer-EN16931.md",
      content: `# 🌍 Free Client-Side E-Invoice Generator & XML Viewer (Peppol UBL 2.1 · XRechnung 3.0 · Factur-X · VeriFactu)\n\n100% browser-based, GDPR/DSGVO-compliant electronic invoicing studio supporting European **EN 16931** standards with zero server uploads:\n\n- 🇬🇧 **[Free Peppol BIS 3.0 (UBL 2.1) XML Invoice Generator & Validator](${SITE_URL}/verifactu-studio.html?lang=en)**\n- 🇩🇪 **[Kostenloser XRechnung 3.0 Generator & XML-Viewer (mit Leitweg-ID & GiroCode)](${SITE_URL}/verifactu-studio.html?lang=de)**\n- 🇫🇷 **[Générateur Factur-X / Chorus Pro XML Gratuit en Ligne](${SITE_URL}/verifactu-studio.html?lang=fr)**\n- 🇪🇸 **[Generador Veri*Factu (Huella SHA-256 + QR AEAT) y Facturae 3.2.2 XML](${SITE_URL}/verifactu-studio.html?lang=es)**`
    },
    {
      description: "Free C2PA Metadata Remover, EXIF GPS Destroyer & Invisible ChatGPT Unicode Watermark Scrubber (100% Client-Side)",
      filename: "C2PA-Metadata-Remover-AI-Unicode-Scrubber.md",
      content: `# 🧬 PureAI Studio: Free Client-Side C2PA Metadata Remover & AI Unicode Watermark Scrubber\n\nInspect and strip **C2PA / JUMBF 'Made with AI' manifests** (DALL-E, Firefly, Gemini, Midjourney), **ComfyUI PNG chunks**, **EXIF GPS coordinates**, and **invisible LLM Unicode watermarks (\`U+202F\`, \`U+200B\`, \`U+00A0\`)** 100% locally in your browser without uploading files to any server:\n\n- 🇬🇧 **[Open PureAI C2PA & Unicode Watermark Scrubber (EN)](${SITE_URL}/clean-ai-studio.html?lang=en)**\n- 🇪🇸 **[Quitar Metadatos IA (C2PA / EXIF) y Marcas Invisibles de ChatGPT (ES)](${SITE_URL}/clean-ai-studio.html?lang=es)**\n- 🇩🇪 **[C2PA KI-Metadaten & ChatGPT-Wasserzeichen Entfernen (DE)](${SITE_URL}/clean-ai-studio.html?lang=de)**`
    },
    {
      description: "How to Remove Invisible ChatGPT Watermarks (U+202F, U+200B) & Humanize AI Text for Turnitin / GPTZero (Free Browser Tool)",
      filename: "Remove-ChatGPT-Watermarks-U202F-Humanize-AI-Text.md",
      content: `# 🔎 How to Detect & Remove Invisible ChatGPT Watermarks (\`U+202F\`, \`U+200B\`) & Robotic AI Clichés\n\nWhen you copy text from ChatGPT, Claude, or Gemini, hidden Unicode code points like **\`U+202F\` (Narrow No-Break Space)** and **\`U+200B\` (Zero-Width Space)** are embedded alongside overused AI phrases (*delve into, tapestry, testament to, furthermore*).\n\n👉 **Use our 100% Client-Side Forensic X-Ray Scrubber & 70+ Cliché Humanizer (Supports .DOCX & .TXT upload):**\n- 🇬🇧 **[Remove ChatGPT Watermarks U+202F & Humanize AI Text (EN)](${SITE_URL}/remove-chatgpt-watermarks-invisible-characters-u202f.html)**\n- 🇪🇸 **[Humanizar Texto de ChatGPT Gratis y Quitar Marcas Invisibles (ES)](${SITE_URL}/humanizar-texto-ia-indetectable-turnitin-gratis.html)**\n- 🇩🇪 **[KI-Texte vermenschlichen & ChatGPT-Wasserzeichen entfernen (DE)](${SITE_URL}/ki-text-vermenschlichen-chatgpt-wasserzeichen-entfernen.html)**\n- 🇫🇷 **[Humaniser un Texte IA ChatGPT & Supprimer les Filigranes (FR)](${SITE_URL}/humaniser-texte-ia-chatgpt-indetectable-gratuit.html)**`
    }
  ];

  const urls = [];
  for (const g of gistsToCreate) {
    if (existingDescs.has(g.description)) continue;
    const res = await fetch("https://api.github.com/gists", {
      method: "POST",
      headers,
      body: JSON.stringify({
        description: g.description,
        public: true,
        files: { [g.filename]: { content: g.content } }
      })
    }).then((r) => r.json());
    if (res && res.html_url) urls.push(res.html_url);
  }
  return urls;
}

async function createSatelliteRepos(token) {
  if (!token) return [];
  const headers = {
    Authorization: "Bearer " + token,
    Accept: "application/vnd.github+json",
    "User-Agent": "FinanzaSmart-CEO"
  };

  const repos = [
    {
      name: "reclamar-gastos-hipoteca-y-fianza-espana",
      description: "Calculadora y Generador de Escritos Oficiales para Reclamar Gastos de Hipoteca (TJUE), Fianza de Alquiler (Art. 36 LAU), Vuelos (CE 261) y Subida Alquiler IRAV.",
      homepage: `${SITE_URL}/reclamaciones-ia.html`,
      topics: ["hipoteca", "alquiler", "fianza", "irav", "reclamaciones", "derecho-espana", "consumidores"],
      readme: `# ⚖️ Reclamar Gastos de Hipoteca (TJUE), Fianza de Alquiler (LAU) y Vuelos en España (2026)\n\n👉 **Generador Oficial de Escritos Legales y Calculadora Gratis:** **[${SITE_URL}/reclamaciones-ia.html](${SITE_URL}/reclamaciones-ia.html)**\n\n### Herramientas Incluidas:\n1. **[Reclamar Gastos de Hipoteca sin Abogado (Sentencia TJUE C-561/21)](${SITE_URL}/reclamar-gastos-hipoteca-sin-abogado-modelo.html)**: Recupera el 50% de Notaría y el 100% de Registro, Gestoría y Tasación más intereses legales.\n2. **[Modelo Burofax Reclamación Fianza de Alquiler (Art. 36.4 LAU)](${SITE_URL}/modelo-burofax-reclamar-fianza-alquiler-lau.html)**: Exige tu fianza más intereses tras 30 días desde la entrega de llaves.\n3. **[Calculadora Subida Alquiler IRAV 2026 + Carta Oficial al Inquilino](${SITE_URL}/calculadora-irav-subida-alquiler-carta-inquilino.html)**.\n4. **[Reclamación Vuelo Retrasado/Cancelado (250€ a 600€, CE 261/2004)](${SITE_URL}/reclamar-vuelo-retrasado-cancelado-sin-comisiones-aesa.html)**.\n\n---\n🏦 **Cuenta gratuita recomendada con IBAN español para cobrar indemnizaciones:** **[Abrir Cuenta Gratis en Revolut](${REVOLUT_URL})**`
    },
    {
      name: "simulador-declaracion-renta-espana-irpf",
      description: "Simulador Declaración de la Renta España (Modelo 100): Calcula gratis si sale a devolver o pagar, deducciones en las 17 CCAA y casillas Renta WEB.",
      homepage: `${SITE_URL}/gestor-renta-ia.html`,
      topics: ["declaracion-renta", "irpf", "hacienda", "autonomos", "impuestos-espana", "criptomonedas", "alquiler"],
      readme: `# 🤖 Simulador Declaración de la Renta España (Modelo 100 - IRPF 2026)\n\n👉 **Abrir Gestor Renta IA Gratis:** **[${SITE_URL}/gestor-renta-ia.html](${SITE_URL}/gestor-renta-ia.html)**\n\n### ¿Qué calcula?\n- **Resultado exacto (A Devolver o A Pagar)** adaptado a tu situación personal (1 o 2 pagadores, autónomos, maternidad, hijos, declaración conjunta vs. individual).\n- **Deducciones autonómicas de las 17 Comunidades Autónomas** (alquiler de vivienda, gimnasio/deporte, estudios, donativos ONG 80%, cuotas sindicales).\n- **[Cómo declarar Criptomonedas y acciones (Casillas 1800-1814) y compensar pérdidas](${SITE_URL}/como-declarar-criptomonedas-renta-casilla-1800-bitget.html)**.\n\n---\n- 🏦 **Domicilia tu devolución en una cuenta gratuita con huchas:** **[Abrir Cuenta Revolut Gratis](${REVOLUT_URL})**\n- ⚡ **Opera en Cripto con informe anual descargable (Código Bono ` + "`KQBSNNRF`" + `):** **[Registrarse en Bitget](${BITGET_URL})**`
    },
    {
      name: "calculadora-finiquito-indemnizacion-despido-smac",
      description: "Calculadora de Finiquito e Indemnización por Despido en España (33 y 20 días/año) + Generador de Papeleta de Conciliación SMAC y Recurso Multas DGT.",
      homepage: `${SITE_URL}/laboral-ia.html`,
      topics: ["finiquito", "despido", "indemnizacion", "laboral", "smac", "estatuto-trabajadores", "multas-dgt"],
      readme: `# 💼 Calculadora de Finiquito, Indemnización por Despido y Papeleta SMAC (España 2026)\n\n👉 **Calcular Finiquito + Indemnización y Generar Papeleta SMAC:** **[${SITE_URL}/laboral-ia.html](${SITE_URL}/laboral-ia.html)**\n\n### Herramientas Incluidas:\n- **[Calcular Finiquito e Indemnización por Despido Improcedente (33 días) u Objetivo (20 días)](${SITE_URL}/calcular-finiquito-indemnizacion-despido-improcedente.html)**.\n- **[Generador de Recurso y Pliego de Descargos para Multas DGT, Radar y ZBE](${SITE_URL}/multas-dgt-ia.html)**.`
    },
    {
      name: "xrechnung-peppol-facturx-xml-generator-viewer",
      description: "Free Client-Side E-Invoice XML Generator & Viewer (EN 16931): Peppol BIS 3.0 UBL 2.1, German XRechnung 3.0, French Factur-X & Spanish VeriFactu SHA-256.",
      homepage: `${SITE_URL}/verifactu-studio.html`,
      topics: ["xrechnung", "peppol", "einvoicing", "ubl", "factur-x", "verifactu", "en16931"],
      readme: `# 🌍 Global E-Invoice & XML Studio Pro (Peppol UBL 2.1 · XRechnung 3.0 · Factur-X · VeriFactu)\n\n👉 **Launch Live Web App (100% Client-Side, No Sign-Up):** **[${SITE_URL}/verifactu-studio.html](${SITE_URL}/verifactu-studio.html)**\n\n### Supported International Standards:\n- 🇬🇧 **[Peppol BIS Billing 3.0 (UBL 2.1 XML) Generator & Validator](${SITE_URL}/peppol-ubl-xml-invoice-generator-validator.html)**\n- 🇩🇪 **[XRechnung 3.0 & ZUGFeRD Generator + XML Viewer (Leitweg-ID & GiroCode)](${SITE_URL}/xrechnung-generator-viewer-kostenlos.html)**\n- 🇫🇷 **[Générateur Factur-X / Chorus Pro XML Gratuit](${SITE_URL}/generateur-factur-x-chorus-pro-gratuit.html)**\n- 🇪🇸 **[Veri*Factu AEAT (SHA-256 + QR) & Facturae 3.2.2 XML](${SITE_URL}/generador-facturas-verifactu-qr-aeat-facturae-xml-gratis.html)**`
    },
    {
      name: "c2pa-metadata-remover-ai-watermark-scrubber",
      description: "Free 100% Client-Side C2PA Metadata Remover, EXIF GPS Destroyer, ComfyUI/Midjourney PNG Scrubber & ChatGPT Invisible Unicode Watermark Cleaner.",
      homepage: `${SITE_URL}/clean-ai-studio.html`,
      topics: ["c2pa", "exif-remover", "metadata-remover", "ai-watermark", "privacy-tools", "comfyui", "midjourney"],
      readme: `# 🧬 PureAI Studio — Free Client-Side C2PA Metadata Remover & AI Unicode Watermark Scrubber\n\n👉 **Launch Live Web App (Zero Server Upload):** **[${SITE_URL}/clean-ai-studio.html](${SITE_URL}/clean-ai-studio.html)**\n\n### Features (EN / ES / DE / FR / PT):\n- **[Image C2PA, JUMBF & EXIF GPS Destroyer](${SITE_URL}/c2pa-metadata-remover-ai-scrubber.html)**: Strips 'Made with AI' Content Credentials (DALL-E, Firefly, Gemini, Midjourney), ComfyUI PNG chunks, and EXIF geolocation.\n- **[ChatGPT / Claude Invisible Unicode Watermark Scrubber](${SITE_URL}/quitar-metadatos-ia-c2pa-exif-fotos-texto.html)**: Detects and removes hidden \`U+202F\`, \`U+200B\`, and \`U+00A0\` tracking characters.\n- 🇩🇪 **[C2PA KI-Metadaten & Wasserzeichen Kostenlos Entfernen](${SITE_URL}/ki-metadaten-c2pa-entfernen-kostenlos.html)**`
    },
    {
      name: "chatgpt-watermark-remover-ai-humanizer",
      description: "Free Client-Side ChatGPT Invisible Watermark Remover (U+202F / U+200B), 70+ AI Cliché Humanizer (.DOCX/.TXT) & Batch C2PA Image Scrubber (.ZIP).",
      homepage: `${SITE_URL}/clean-ai-studio.html?lang=en`,
      topics: ["chatgpt", "ai-humanizer", "unicode-watermark", "c2pa", "turnitin", "gptzero", "exif-scrubber"],
      readme: `# ✨ PureAI Studio — ChatGPT Invisible Watermark Remover (U+202F) & AI Text/Image Scrubber\n\n👉 **Open Live Browser App (100% Client-Side, Zero Server Upload):** **[${SITE_URL}/clean-ai-studio.html?lang=en](${SITE_URL}/clean-ai-studio.html?lang=en)**\n\n### Why Creators, Students & Agencies Use PureAI Studio:\n1. **[Remove ChatGPT Invisible Watermarks (U+202F & U+200B)](${SITE_URL}/remove-chatgpt-watermarks-invisible-characters-u202f.html)**: Live X-Ray view highlights hidden LLM characters in red and strips them in 1 click.\n2. **[Free AI Text Humanizer & Burstiness Engine (.DOCX / .TXT)](${SITE_URL}/humanize-ai-text-bypass-turnitin-gptzero-free.html)**: Replaces 70+ flagged AI clichés across EN, ES, DE, FR & PT.\n3. **[Remove 'Made with AI' Labels on Instagram & TikTok (C2PA / EXIF)](${SITE_URL}/remove-made-with-ai-label-instagram-tiktok-c2pa.html)**: Batch-scrub up to 20 images into a clean \`.zip\` archive with 1-click post-scrub verification.`
    }
  ];

  const created = [];
  for (const r of repos) {
    const res = await fetch("https://api.github.com/user/repos", {
      method: "POST",
      headers,
      body: JSON.stringify({ name: r.name, description: r.description, homepage: r.homepage, private: false })
    });
    if (res.status === 201) {
      await fetch(`https://api.github.com/repos/revienta32/${r.name}/contents/README.md`, {
        method: "PUT",
        headers,
        body: JSON.stringify({
          message: "Initial SEO README",
          content: Buffer.from(r.readme, "utf8").toString("base64")
        })
      });
      await fetch(`https://api.github.com/repos/revienta32/${r.name}/topics`, {
        method: "PUT",
        headers,
        body: JSON.stringify({ names: r.topics })
      });
      created.push(`https://github.com/revienta32/${r.name}`);
    }
    // Activar GitHub Pages (DA 96 en github.io) en cada repositorio satélite
    await fetch(`https://api.github.com/repos/revienta32/${r.name}/pages`, {
      method: "POST",
      headers,
      body: JSON.stringify({ source: { branch: "main", path: "/" } })
    }).catch(() => {});
  }
  // Activar también GitHub Pages en el repositorio principal finanzasmart-autopilot
  await fetch(`https://api.github.com/repos/revienta32/finanzasmart-autopilot/pages`, {
    method: "POST",
    headers,
    body: JSON.stringify({ source: { branch: "main", path: "/" } })
  }).catch(() => {});
  return created;
}

async function pingIndexNowAllUrls() {
  try {
    const sitemap = fs.readFileSync(path.join(__dirname, "sitemap.xml"), "utf8");
    const urlList = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
    const res = await fetch("https://api.indexnow.org/indexnow", {
      method: "POST",
      headers: { "Content-Type": "application/json; charset=utf-8" },
      body: JSON.stringify({
        host: "revienta32.github.io",
        key: "b8f4c2d1e9a74b6c8d3e2f1a0b9c8d7e",
        keyLocation: `${SITE_URL}/b8f4c2d1e9a74b6c8d3e2f1a0b9c8d7e.txt`,
        urlList
      })
    });
    return { status: res.status, count: urlList.length };
  } catch (e) {
    return { status: 0, count: 0 };
  }
}

function buildSuggestedReply(title, targetLink) {
  const t = title.toLowerCase();
  if (/subir|subida|ipc|irav|5%/.test(t)) {
    return `Por el art. 18 de la LAU no pueden aplicarte un 5% de IPC ni subirte la renta sin avisar por escrito con 30 días de antelación respetando el límite del índice IRAV del INE. Puedes calcular el límite exacto y sacar el escrito de respuesta aquí: ${targetLink}`;
  }
  if (/fianza|incasol|ivima|casero|alquiler/.test(t)) {
    return `Según el art. 36.4 de la LAU, pasado 1 mes desde la entrega de llaves la fianza genera intereses legales automáticos y si no la depositó en el organismo autonómico puedes denunciarlo y reclamar la deducción perdida. Aquí puedes calcular los intereses y generar el burofax/requerimiento oficial gratis: ${targetLink}`;
  }
  if (/despido|finiquito|smac|indemnizaci|empresa|laboral|vacaciones/.test(t)) {
    return `Ojo con el plazo: tienes solo 20 días hábiles (art. 59.3 ET) para presentar la Papeleta de Conciliación ante el SMAC (no hace falta abogado). Aquí puedes calcular gratis el finiquito + indemnización exacta y generar la Papeleta SMAC lista para presentar: ${targetLink}`;
  }
  if (/multa|dgt|radar|zbe|tráfico|trafico|ayuntamiento/.test(t)) {
    return `Si pides el expediente completo exigiendo los dos fotogramas y el certificado de verificación periódica del cinemómetro (Orden ICT/155/2020) aplicando el margen de error, muchas se anulan. Aquí puedes generar el pliego de descargos oficial: ${targetLink}`;
  }
  if (/hipoteca|gastos|notar|banco/.test(t)) {
    return `Tras la sentencia del TJUE (C-561/21) puedes reclamar el 50% de Notaría y el 100% de Registro, Gestoría y Tasación más los intereses legales directamente al SAC del banco sin abogado. Aquí puedes calcular el importe exacto y sacar el escrito oficial: ${targetLink}`;
  }
  if (/renta|irpf|hacienda|declaraci|autónomo|autonomo|deducci/.test(t)) {
    return `Puedes simular gratis en 30 segundos cómo queda en el Modelo 100 de Renta WEB y qué casillas/deducciones autonómicas te aplican aquí: ${targetLink}`;
  }
  return `Puedes calcular las cifras exactas según la normativa vigente y generar el escrito legal para reclamarlo en: ${targetLink}`;
}

async function scanLiveRedditOpportunities() {
  const subreddits = [
    "ChatGPT",
    "StableDiffusion",
    "comfyui",
    "midjourney",
    "copywriting",
    "ESLegal",
    "SpainFIRE",
    "HorroresInmobiliarios",
    "SpainEconomics",
    "pesadillalaboral"
  ];
  const keywords = /watermark|c2pa|metadata|exif|turnitin|gptzero|detector|humanize|made with ai|u\+202f|em-dash|workflow|fianza|alquiler|casero|hipoteca|gastos|renta|irpf|autonomo|autónomo|declaracion|declaración|vuelo|retraso|revolut|cripto|hacienda|irav|impuesto|inmueble|piso|despido|finiquito|smac|indemnizaci|multa|dgt|radar|zbe/i;
  const matches = [];

  for (const sub of subreddits) {
    try {
      const xml = await fetch(`https://www.reddit.com/r/${sub}/new/.rss`, {
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
          "Accept": "application/atom+xml,application/xml,text/xml;q=0.9,*/*;q=0.8"
        }
      }).then((r) => r.text());
      const entries = xml.split("<entry>").slice(1);
      for (const entry of entries) {
        const title = (entry.match(/<title>([^<]+)<\/title>/) || [])[1] || "";
        const link = (entry.match(/<link href="([^"]+)"/) || [])[1] || "";
        if (title && link && keywords.test(title)) {
          let targetLink = `${SITE_URL}/reclamaciones-ia.html`;
          let customReply = null;
          if (/watermark|c2pa|metadata|exif|turnitin|gptzero|detector|humanize|made with ai|u\+202f|em-dash|workflow/i.test(title) || ["ChatGPT", "StableDiffusion", "comfyui", "midjourney", "copywriting"].includes(sub)) {
            targetLink = `${SITE_URL}/clean-ai-studio.html?lang=en`;
            customReply = `You can inspect and strip hidden C2PA/JUMBF headers, ComfyUI PNG workflow chunks, EXIF data, and invisible LLM Unicode spaces (U+202F / U+200B) 100% locally in your browser (zero server upload) using PureAI Studio: ${targetLink}`;
          } else if (/despido|finiquito|smac|indemnizaci|laboral|empresa|baja|vacaciones/i.test(title) || sub === "pesadillalaboral") {
            targetLink = `${SITE_URL}/laboral-ia.html`;
          } else if (/multa|dgt|radar|zbe|trafico|tráfico/i.test(title)) {
            targetLink = `${SITE_URL}/multas-dgt-ia.html`;
          } else if (/renta|irpf|hacienda|declaraci|autonomo|autónomo|impuesto|isp|iva/i.test(title) && !/fianza|alquiler|casero/i.test(title)) {
            targetLink = `${SITE_URL}/gestor-renta-ia.html`;
          }
          matches.push({
            subreddit: `r/${sub}`,
            title,
            url: link,
            recommendedTool: targetLink,
            replyText: customReply || buildSuggestedReply(title, targetLink)
          });
        }
      }
    } catch (_) {}
  }

  // Escaneo adicional en tiempo real de Hacker News (Algolia API) para debates activos sobre C2PA, AI Watermarks y E-Invoicing
  const hnQueries = [
    { q: "C2PA OR watermark AI", tool: `${SITE_URL}/clean-ai-studio.html?lang=en`, reply: `For anyone testing C2PA / JUMBF manifests or invisible LLM Unicode watermarks (U+202F / U+200B), we built a 100% client-side browser inspector & scrubber (zero server uploads, with post-scrub binary verification): ${SITE_URL}/clean-ai-studio.html?lang=en` },
    { q: "GPTZero OR Turnitin AI detection", tool: `${SITE_URL}/remove-chatgpt-watermarks-invisible-characters-u202f.html`, reply: `A major false-positive trigger in AI detectors is hidden narrow no-break spaces (U+202F) and uniform sentence burstiness pasted from ChatGPT. You can X-ray and strip those code points client-side here: ${SITE_URL}/remove-chatgpt-watermarks-invisible-characters-u202f.html` },
    { q: "XRechnung OR Peppol OR e-invoice XML", tool: `${SITE_URL}/verifactu-studio.html?lang=en`, reply: `If you need a lightweight, 100% client-side EN 16931 XML generator & viewer (Peppol BIS 3.0 UBL 2.1, German XRechnung 3.0, French Factur-X, Spanish VeriFactu SHA-256) without uploading client invoices to cloud SaaS: ${SITE_URL}/verifactu-studio.html?lang=en` }
  ];
  for (const hq of hnQueries) {
    try {
      const hnRes = await fetch(`https://hn.algolia.com/api/v1/search_by_date?query=${encodeURIComponent(hq.q)}&tags=story&hitsPerPage=4`).then(r => r.json());
      for (const hit of (hnRes.hits || [])) {
        matches.push({
          subreddit: "HackerNews",
          title: hit.title,
          url: `https://news.ycombinator.com/item?id=${hit.objectID}`,
          recommendedTool: hq.tool,
          replyText: hq.reply
        });
      }
    } catch (_) {}
  }

  if (matches.length > 0) {
    const md = [
      "# 🎯 Radar CEO en Tiempo Real: Oportunidades Globales (PureAI Studio & E-Invoice) y España Hoy",
      "",
      "Hilos activos detectados **hoy mismo** en Reddit y Hacker News sobre detección de IA, C2PA, marcas de agua de ChatGPT, facturación electrónica o reclamaciones, con la **respuesta exacta lista para copiar y pegar**:",
      "",
      ...matches.slice(0, 25).map(
        (m, i) =>
          `${i + 1}. **[${m.subreddit}]** [${m.title}](${m.url})\n   - **Herramienta:** \`${m.recommendedTool}\`\n   - **Respuesta lista para copiar:**\n     > ${m.replyText}`
      )
    ].join("\n");
    fs.writeFileSync(path.join(__dirname, "radar-oportunidades-hoy.md"), md);
  }
  return matches.length;
}

async function main() {
  const token = getGithubToken();
  const gists = await publishHighAuthorityGists(token);
  console.log("Published Public GitHub Gists:", gists);
  const satRepos = await createSatelliteRepos(token);
  console.log("Created Satellite SEO Repos & Enabled GitHub Pages:", satRepos);
  const indexNowRes = await pingIndexNowAllUrls();
  console.log("IndexNow Instant Search Engine Ping:", indexNowRes);
  const redditCount = await scanLiveRedditOpportunities();
  console.log("Live Global & Spain Reddit opportunities detected today:", redditCount);
}

main().catch(console.error);
