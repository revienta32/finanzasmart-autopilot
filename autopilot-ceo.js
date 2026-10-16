/**
 * CEO AUTOPILOT ENGINE - FinanzaSmart
 * 1. Genera páginas de SEO Programático de alta intención de búsqueda (Long-Tail).
 * 2. Publica artículos virales automáticamente en Telegra.ph (nube de Telegram 24/7, alta autoridad SEO).
 * 3. Notifica a los buscadores (Bing, DuckDuckGo, Yandex, ChatGPT Search) mediante IndexNow API.
 */

const fs = require("fs");
const path = require("path");

const SITE_URL = "https://finanzasmart-pro.surge.sh";
const REVOLUT_URL = "https://revolut.com/referral/?referral-code=revienta!OCT1-26-AR-H1&geo-redirect";
const BITGET_URL = "https://www.bitget.com/es/referral/register?clacCode=KQBSNNRF";
const INDEXNOW_KEY = "b8f4c2d1e9a74b6c8d3e2f1a0b9c8d7e";

// 1. Páginas de SEO Programático (búsquedas exactas en Google/Bing/IA)
const SEO_PAGES = [
  {
    slug: "codigo-promocional-bitget-kqbsnnrf.html",
    title: "Código Promocional Bitget 2026 (KQBSNNRF): Bono y Descuento en Comisiones",
    h1: "Código de Invitación Bitget 2026: KQBSNNRF",
    lead: "Activa el bono de bienvenida oficial en Bitget y accede a Copy Trading, DCA en Bitcoin y USDT Earn utilizando el código de referido verificado KQBSNNRF.",
    calcLink: "index.html#dca",
    bodyHtml: `
      <p>Si vas a abrir una cuenta en <strong>Bitget</strong> en 2026 para invertir a largo plazo (DCA) o utilizar su sistema de Copy Trading, introducir el código de referencia <strong>KQBSNNRF</strong> durante el registro te permite desbloquear las ventajas promocionales para nuevos usuarios.</p>
      <h3>¿Cómo usar el código KQBSNNRF paso a paso?</h3>
      <ul style="margin: 1rem 0 1.5rem 1.25rem; color: #cbd5e1;">
        <li>Haz clic en el enlace directo de registro oficial de Bitget.</li>
        <li>Verifica que en el campo <strong>Código de referencia</strong> aparezca escrito <code>KQBSNNRF</code>.</li>
        <li>Completa la verificación y accede al Centro de Recompensas para reclamar tus bonos bienvenida.</li>
      </ul>
    `
  },
  {
    slug: "invitacion-revolut-cuenta-remunerada.html",
    title: "Invitación Revolut 2026: Cómo Abrir Cuenta Gratis y Ahorrar con Huchas",
    h1: "Invitación Oficial Revolut 2026: Cuenta Sin Comisiones + Huchas de Ahorro",
    lead: "Abre tu cuenta gratuita en Revolut en menos de 3 minutos desde el móvil, automatiza tu ahorro con redondeo automático y gestiona pagos sin comisiones ocultas.",
    calcLink: "index.html",
    bodyHtml: `
      <p>Separar tu dinero del día a día de tu fondo de emergencia es el primer paso para cumplir la <strong>Regla 50/30/20</strong>. Con una cuenta gratuita de <strong>Revolut</strong> puedes crear huchas independientes, activar el redondeo automático de tus compras con tarjeta y enviar dinero al instante.</p>
      <h3>Ventajas principales de registrarte con invitación</h3>
      <ul style="margin: 1rem 0 1.5rem 1.25rem; color: #cbd5e1;">
        <li>Alta 100% online en 2 minutos desde tu smartphone.</li>
        <li>Tarjetas virtuales gratuitas y cambio de divisa competitivo para viajes y compras online.</li>
        <li>Huchas personalizadas para separar el ahorro de tu hipoteca o impuestos si eres autónomo.</li>
      </ul>
    `
  },
  {
    slug: "invertir-150-euros-al-mes-interes-compuesto.html",
    title: "Cuánto Dinero Tendrás si Inviertes 150€ al Mes (Tabla de Interés Compuesto)",
    h1: "¿Qué pasa si inviertes 150€ al mes durante 15 o 20 años?",
    lead: "Análisis real del poder del interés compuesto al 8% anual: cómo convertir un pequeño ahorro mensual en un patrimonio superior a 50.000€.",
    calcLink: "index.html",
    bodyHtml: `
      <p>Mucha gente piensa que hacen falta miles de euros para empezar a invertir. Sin embargo, aportando <strong>150€ al mes</strong> con una rentabilidad media histórica del 8% anual:</p>
      <ul style="margin: 1rem 0 1.5rem 1.25rem; color: #cbd5e1;">
        <li><strong>En 10 años:</strong> Aportas 18.000€ y acumulas <strong>27.442€</strong> (+9.442€ en intereses pasivos).</li>
        <li><strong>En 15 años:</strong> Aportas 27.000€ y acumulas <strong>51.906€</strong> (+24.906€ en intereses pasivos).</li>
        <li><strong>En 25 años:</strong> Aportas 45.000€ y acumulas <strong>142.654€</strong> (+97.654€ ganados automáticamente).</li>
      </ul>
    `
  },
  {
    slug: "cuanto-queda-neto-autonomo-2500-3000-euros.html",
    title: "Cuánto Queda Neto a un Autónomo que Factura 2.500€ o 3.000€ al Mes en 2026",
    h1: "De Facturación Bruta a Sueldo Neto: Guía Rápida para Autónomos",
    lead: "Desglose real de cuota de Seguridad Social, IRPF y gastos deducibles para saber cuánto dinero limpio entra en tu bolsillo cada mes.",
    calcLink: "index.html#autonomo",
    bodyHtml: `
      <p>Uno de los errores más graves al empezar como freelancer o autónomo es gastar el dinero del IVA o no apartar el porcentaje correspondiente al IRPF trimestral.</p>
      <p>Para un autónomo que factura <strong>3.000€ mensuales (sin IVA)</strong> con 300€ de gastos deducibles y una cuota aproximada de 310€, el sueldo neto real tras apartar un 18% de IRPF ronda los <strong>1.958€ limpios al mes</strong>. Te recomendamos usar una cuenta separada gratuita en Revolut exclusivamente para apartar el IVA e IRPF de cada factura cobrada.</p>
    `
  }
];

function buildSeoPageHtml(page) {
  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${page.title} | FinanzaSmart</title>
  <meta name="description" content="${page.lead}" />
  <link rel="canonical" href="${SITE_URL}/${page.slug}" />
  <link rel="stylesheet" href="styles.css" />
</head>
<body>
  <header class="topbar">
    <div class="container topbar-inner">
      <a href="index.html" class="brand" style="text-decoration:none;color:inherit;">
        <span class="brand-icon">📈</span>
        <div>
          <strong>FinanzaSmart</strong>
          <span class="brand-tag">Guías y Calculadoras Gratuitas</span>
        </div>
      </a>
      <nav class="tabs">
        <a href="index.html" class="tab-btn active" style="text-decoration:none;">🧮 Ir a las Calculadoras</a>
        <a href="producto-digital-pro.html" class="tab-btn" style="text-decoration:none;">📊 Planificador 50/30/20</a>
      </nav>
    </div>
  </header>

  <main class="container main-grid">
    <article class="calc-card" style="line-height: 1.75;">
      <h1>${page.h1}</h1>
      <p class="subtitle">${page.lead}</p>
      ${page.bodyHtml}
      <div style="margin-top: 2rem; padding: 1.25rem; background: #0f172a; border: 1px solid #334155; border-radius: 0.75rem;">
        <h3 style="margin-bottom: 0.5rem;">🧮 Haz tu propia simulación en 10 segundos</h3>
        <p style="color: #94a3b8; font-size: 0.9rem; margin-bottom: 1rem;">Usa nuestra calculadora interactiva gratuita para ajustar las cifras a tu caso personal:</p>
        <a href="${page.calcLink}" class="cta-button" style="display:inline-block; padding: 0.7rem 1.4rem;">Abrir Calculadora Interactiva →</a>
      </div>
    </article>

    <aside class="affiliate-sidebar">
      <div class="offer-card">
        <span class="offer-badge">🔥 Recomendado #1: Revolut</span>
        <h2>Cuenta Gratuita Revolut + Huchas de Ahorro</h2>
        <p>Separa tus ahorros e impuestos sin comisiones en 2 minutos desde el móvil.</p>
        <a href="${REVOLUT_URL}" target="_blank" rel="noopener sponsored" class="cta-button">Abrir cuenta gratis en Revolut →</a>
      </div>

      <div class="offer-card" style="background: linear-gradient(160deg, #1e293b 0%, #1e3a8a 100%); border-color: #3b82f6;">
        <span class="offer-badge" style="background: rgba(59, 130, 246, 0.2); color: #93c5fd;">⚡ Bono Bitget (Código: KQBSNNRF)</span>
        <h2>Automatiza tu DCA y Copy Trading en Bitget</h2>
        <p>Usa el código <strong>KQBSNNRF</strong> al registrarte para activar tu bono de bienvenida.</p>
        <a href="${BITGET_URL}" target="_blank" rel="noopener sponsored" class="cta-button" style="background: #3b82f6; color: #fff;">Registrarse en Bitget (KQBSNNRF) →</a>
      </div>
    </aside>
  </main>

  <footer class="footer container">
    <p>© 2026 FinanzaSmart — <a href="index.html" style="color:#10b981;">Calculadoras Financieras</a> | <a href="producto-digital-pro.html" style="color:#10b981;">Planificador 50/30/20</a></p>
  </footer>
</body>
</html>`;
}

async function publishTelegraphArticles() {
  const accRes = await fetch(
    "https://api.telegra.ph/createAccount?short_name=FinanzaSmart&author_name=FinanzaSmart+Espa%C3%B1a&author_url=" +
      encodeURIComponent(SITE_URL)
  ).then((r) => r.json());

  if (!accRes.ok) return [];
  const token = accRes.result.access_token;

  const todayStr = new Date().toISOString().slice(0, 10);
  const articles = [
    {
      title: `Resumen Financiero y Estrategia DCA (${todayStr}): Calculadora de Interés Compuesto y Cripto`,
      nodes: [
        { tag: "p", children: [`Actualización del ${todayStr}: Automatizar el ahorro mensual (Regla 50/30/20) y reinvertir intereses es la vía más segura para construir patrimonio sin depender de un único sueldo.`] },
        { tag: "p", children: [{ tag: "a", attrs: { href: SITE_URL }, children: ["🧮 Simular tu Interés Compuesto, Hipoteca o Sueldo Neto en FinanzaSmart"] }] },
        { tag: "p", children: [{ tag: "a", attrs: { href: REVOLUT_URL }, children: ["🏦 Abrir Cuenta Gratuita con Huchas en Revolut (Invitación Oficial)"] }] },
        { tag: "p", children: [{ tag: "a", attrs: { href: BITGET_URL }, children: ["⚡ Activar Bono de Bienvenida en Bitget (Código: KQBSNNRF)"] }] }
      ]
    },
    {
      title: "Cómo Calcular tu Interés Compuesto y Automatizar tu Ahorro en 2026 (Herramienta Gratis)",
      nodes: [
        { tag: "p", children: ["El 90% de las personas pierde poder adquisitivo cada año por dejar sus ahorros parados sin una estrategia clara. Con solo 150€ al mes invertidos a largo plazo, el interés compuesto multiplica tu capital por encima de los 50.000€ en 15 años."] },
        { tag: "h4", children: ["1. Calcula tu proyección exacta gratis"] },
        { tag: "p", children: ["Hemos publicado una suite gratuita de calculadoras financieras (Interés Compuesto, Cuota de Hipoteca, Sueldo Neto de Autónomo y Regla del 4%) junto con un Planificador 50/30/20 descargable en Excel:"] },
        { tag: "p", children: [{ tag: "a", attrs: { href: SITE_URL }, children: ["👉 Abrir Calculadora Financiera Interactiva FinanzaSmart"] }] },
        { tag: "h4", children: ["2. Automatiza tus huchas sin comisiones con Revolut"] },
        { tag: "p", children: ["Para no mezclar tus gastos diarios con tu ahorro mensual, abre una cuenta gratuita en Revolut y activa las huchas automáticas:"] },
        { tag: "p", children: [{ tag: "a", attrs: { href: REVOLUT_URL }, children: ["🏦 Crear Cuenta Gratis en Revolut (Invitación Oficial)"] }] },
        { tag: "h4", children: ["3. Estrategia DCA y Copy Trading en Bitget (Código: KQBSNNRF)"] },
        { tag: "p", children: ["Si destinas una parte de tu cartera a Bitcoin, USDT Earn o Copy Trading automático, regístrate en Bitget con el código promocional KQBSNNRF para activar tu bono de bienvenida:"] },
        { tag: "p", children: [{ tag: "a", attrs: { href: BITGET_URL }, children: ["🚀 Registrarse en Bitget con Bono (Código: KQBSNNRF)"] }] }
      ]
    },
    {
      title: "Regla 50/30/20 en España (2026): Plantilla Interactiva Gratis + Mejores Cuentas",
      nodes: [
        { tag: "p", children: ["La regla 50/30/20 divide tus ingresos netos en un 50% para necesidades básicas, 30% para estilo de vida y un 20% para ahorro e inversión automática."] },
        { tag: "p", children: [{ tag: "a", attrs: { href: `${SITE_URL}/producto-digital-pro.html` }, children: ["📊 Usar Plantilla Interactiva 50/30/20 Gratis (Exportable a Excel y PDF)"] }] },
        { tag: "p", children: ["Combina la plantilla con una cuenta sin comisiones en Revolut para separar tu 20% el mismo día que cobras la nómina y automatiza tus compras DCA en Bitget con el código KQBSNNRF:"] },
        { tag: "p", children: [{ tag: "a", attrs: { href: REVOLUT_URL }, children: ["👉 Invitación Oficial Revolut Gratis"] }] },
        { tag: "p", children: [{ tag: "a", attrs: { href: BITGET_URL }, children: ["👉 Bono Bitget (Código: KQBSNNRF)"] }] }
      ]
    },
    {
      title: "Código de Referencia Bitget 2026 (KQBSNNRF): Cómo Hacer DCA Automático en Cripto",
      nodes: [
        { tag: "p", children: ["Hacer DCA (Dollar Cost Averaging) consiste en invertir una cantidad fija cada semana o mes sin importar las subidas o bajadas del mercado."] },
        { tag: "p", children: ["Antes de empezar, simula cuánto tiempo tardarás en alcanzar tu meta de libertad financiera con nuestra calculadora gratuita:"] },
        { tag: "p", children: [{ tag: "a", attrs: { href: `${SITE_URL}/codigo-promocional-bitget-kqbsnnrf.html` }, children: ["📈 Guía y Simulador DCA + Código Bitget KQBSNNRF"] }] },
        { tag: "p", children: [{ tag: "a", attrs: { href: BITGET_URL }, children: ["⚡ Abrir cuenta en Bitget con el código KQBSNNRF"] }] }
      ]
    }
  ];

  const publishedUrls = [];
  for (const art of articles) {
    const res = await fetch("https://api.telegra.ph/createPage", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        access_token: token,
        title: art.title,
        author_name: "FinanzaSmart",
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
  // 1. Escribir clave IndexNow para verificación de buscadores
  fs.writeFileSync(path.join(__dirname, `${INDEXNOW_KEY}.txt`), INDEXNOW_KEY);

  // 2. Generar páginas SEO programáticas
  const allUrls = [
    `${SITE_URL}/`,
    `${SITE_URL}/producto-digital-pro.html`
  ];

  for (const page of SEO_PAGES) {
    fs.writeFileSync(path.join(__dirname, page.slug), buildSeoPageHtml(page));
    allUrls.push(`${SITE_URL}/${page.slug}`);
  }

  // 3. Actualizar sitemap.xml con todas las URLs
  const sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allUrls
  .map(
    (u) => `  <url>
    <loc>${u}</loc>
    <changefreq>daily</changefreq>
    <priority>${u === SITE_URL + "/" ? "1.0" : "0.9"}</priority>
  </url>`
  )
  .join("\n")}
</urlset>`;
  fs.writeFileSync(path.join(__dirname, "sitemap.xml"), sitemapXml);

  // 4. Publicar artículos satélite en la nube de Telegra.ph (24/7 online)
  const telegraphUrls = await publishTelegraphArticles();
  console.log("Published Telegraph Cloud Articles:", telegraphUrls);

  // 5. Notificar automáticamente a buscadores (Bing, DuckDuckGo, Yandex, ChatGPT Search) vía IndexNow
  const indexRes = await fetch("https://api.indexnow.org/indexnow", {
    method: "POST",
    headers: { "Content-Type": "application/json; charset=utf-8" },
    body: JSON.stringify({
      host: "finanzasmart-pro.surge.sh",
      key: INDEXNOW_KEY,
      keyLocation: `${SITE_URL}/${INDEXNOW_KEY}.txt`,
      urlList: allUrls
    })
  });
  console.log("IndexNow status:", indexRes.status);

  // 6. Guardar registro acumulativo de distribución en el proyecto
  let prevArticles = [];
  const reportPath = path.join(__dirname, "red-de-trafico.json");
  if (fs.existsSync(reportPath)) {
    try {
      const prev = JSON.parse(fs.readFileSync(reportPath, "utf8"));
      prevArticles = prev.telegraphCloudArticles || [];
    } catch (_) {}
  }
  const mergedArticles = [...new Set([...telegraphUrls, ...prevArticles])];
  const report = {
    updatedAt: new Date().toISOString(),
    mainSite: SITE_URL,
    githubMirror: "https://revienta32.github.io/finanzasmart-autopilot/",
    seoPages: allUrls,
    telegraphCloudArticles: mergedArticles
  };
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
}

run().catch(console.error);
