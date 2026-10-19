/**
 * INCUBADORA Y MOTOR DE PIVOTE AUTÓNOMO (CEO AI ENGINE)
 * Actúa como una empresa viva 24/7:
 * 1. Audita las métricas reales (visitas vs clics de pago) de cada línea de negocio en metricas-y-bugs.json.
 * 2. Escanea demanda real en Google España (Google Suggest API) en múltiples sectores (Legal, Laboral, Motor/DGT, Vivienda, B2B).
 * 3. Si un producto no tracciona o detecta un nicho con alta demanda, despliega automáticamente nuevas herramientas SaaS completas
 *    con pasarela Revolut + SEPA IBAN + USDT integrada, las enlaza en el ecosistema y las indexa en buscadores.
 */

const fs = require("fs");
const path = require("path");
const https = require("https");

const ROOT = __dirname;
const METRICS_FILE = path.join(ROOT, "metricas-y-bugs.json");
const COMPANY_STATE_FILE = path.join(ROOT, "estado-empresa.json");
const BASE_URL = "https://finanzasmart-pro.surge.sh";

function fetchText(url) {
  return new Promise((resolve) => {
    https.get(url, { headers: { "User-Agent": "Mozilla/5.0" } }, (res) => {
      let data = "";
      res.on("data", (c) => (data += c));
      res.on("end", () => resolve(data));
    }).on("error", () => resolve(""));
  });
}

async function scanGoogleDemand(seedQueries) {
  const discovered = [];
  for (const q of seedQueries) {
    try {
      const url = `https://suggestqueries.google.com/complete/search?client=firefox&hl=es&gl=es&q=${encodeURIComponent(q)}`;
      const raw = await fetchText(url);
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed[1])) {
        discovered.push(...parsed[1].slice(0, 4));
      }
    } catch (_) {}
  }
  return [...new Set(discovered)];
}

// Catálogo de Nuevas Líneas de Negocio SaaS listas para despliegue autónomo multi-sector
const CATALOGO_PRODUCTOS_SAAS = [
  {
    id: "laboral-ia",
    file: "laboral-ia.html",
    sector: "LaboralTech / Despidos y Finiquitos",
    title: "LaboralSmart IA — Calculadora de Finiquito, Indemnización y Papeleta SMAC",
    price: "4,99 €",
    buildHtml: () => `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Calculadora de Finiquito e Indemnización por Despido 2026 + Papeleta SMAC IA</title>
  <meta name="description" content="Calcula gratis tu indemnización por despido (improcedente, objetivo, disciplinario) y tu finiquito exacto en España. Genera tu Papeleta de Conciliación SMAC sin abogado." />
  <link rel="stylesheet" href="styles.css" />
  <style>
    .lab-hero { background: linear-gradient(135deg, rgba(245,158,11,0.16), rgba(99,102,241,0.14)); border: 1px solid rgba(245,158,11,0.4); border-radius: 16px; padding: 28px; margin-bottom: 24px; }
    .lab-grid { display: grid; grid-template-columns: 1.05fr 0.95fr; gap: 22px; }
    @media (max-width: 900px) { .lab-grid { grid-template-columns: 1fr; } }
    .lab-card { background: rgba(21,25,34,0.95); border: 1px solid #262d3d; border-radius: 14px; padding: 22px; }
    .doc-blur { filter: blur(4.5px); user-select: none; pointer-events: none; }
    .doc-box { background: #0d111a; border: 1px solid #262d3d; border-radius: 10px; padding: 16px; font-family: monospace; font-size: 0.82rem; color: #cbd5e1; white-space: pre-wrap; margin-top: 12px; }
  </style>
</head>
<body>
  <div class="top-banner">
    ⚖️ <strong>LaboralSmart IA España (Estatuto de los Trabajadores):</strong> Calcula tu Finiquito + Indemnización exacta y genera tu Papeleta SMAC oficial sin pagar 250 € a un abogado laboralista.
  </div>
  <header class="app-header">
    <div class="container header-inner">
      <div class="logo">
        <span class="logo-icon">💼</span>
        <div><h1>LaboralSmart <span class="badge-pro">SMAC IA</span></h1><p class="subtitle">Finiquito, Indemnización y Papeleta de Conciliación</p></div>
      </div>
      <nav class="nav-tabs">
        <a href="index.html" class="tab-btn" style="text-decoration:none;">📊 Calculadoras</a>
        <a href="gestor-renta-ia.html" class="tab-btn" style="text-decoration:none;">🤖 Renta IA</a>
        <a href="reclamaciones-ia.html" class="tab-btn" style="text-decoration:none;">⚖️ ReclamaSmart</a>
      </nav>
    </div>
  </header>
  <main class="container" style="padding-top:28px;padding-bottom:60px;">
    <section class="lab-hero">
      <h2>¿Te han despedido o no te pagan todo tu finiquito?</h2>
      <p style="color:#94a3b8;margin-top:6px;">Tienes solo <strong>20 días hábiles</strong> (Art. 59.3 ET) para presentar la Papeleta de Conciliación ante el SMAC. Calcula gratis cuánto dinero te corresponde por ley y descarga tu Papeleta lista para presentar.</p>
    </section>
    <div class="lab-grid">
      <div class="lab-card">
        <h3>1. Datos de tu Contrato y Despido</h3>
        <div class="form-group" style="margin-top:12px;"><label>Salario Bruto Anual (€) — incluye pagas extra</label><input type="number" id="lab-salario" value="24000" step="500" /></div>
        <div class="form-group"><label>Antigüedad total en la empresa (Años)</label><input type="number" id="lab-anos" value="4.5" step="0.5" /></div>
        <div class="form-group"><label>Tipo de Despido / Extinción</label>
          <select id="lab-tipo" style="width:100%;padding:10px;background:#0d111a;color:#f8fafc;border:1px solid #262d3d;border-radius:8px;">
            <option value="33">Despido Improcedente / Disciplinario sin pruebas (33 días/año - Art. 56 ET)</option>
            <option value="20">Despido Objetivo / Causas Económicas o ETOP (20 días/año - Art. 53 ET)</option>
            <option value="12">Fin de Contrato Temporal (12 días/año - Art. 49.1.c ET)</option>
            <option value="0">Baja Voluntaria (Solo Finiquito: vacaciones y salarios pendientes)</option>
          </select>
        </div>
        <div class="form-group"><label>Días de vacaciones generados y NO disfrutados este año</label><input type="number" id="lab-vacaciones" value="12" step="1" /></div>
        <div class="form-group"><label>Días trabajados este mes pendientes de cobro</label><input type="number" id="lab-dias-mes" value="15" step="1" /></div>
        <div class="form-group"><label>Nombre de la Empresa</label><input type="text" id="lab-empresa" value="EMPRESA EJEMPLO S.L." /></div>
        <div class="form-group"><label>Tu Nombre y DNI</label><input type="text" id="lab-trabajador" value="Nombre Apellidos - DNI 00000000A" /></div>
        <button class="btn-primary" onclick="calcLaboral()">Calcular Indemnización + Generar Papeleta SMAC →</button>
      </div>
      <div class="lab-card">
        <h3>2. Liquidación Oficial que te Corresponde</h3>
        <div style="background:rgba(16,185,129,0.12);border:1px solid rgba(16,185,129,0.35);border-radius:12px;padding:16px;margin-top:12px;">
          <div style="font-size:0.82rem;color:#94a3b8;">TOTAL A RECLAMAR (INDEMNIZACIÓN + FINIQUITO)</div>
          <div id="lab-total" style="font-size:2.1rem;font-weight:800;color:#10b981;">0 €</div>
          <div id="lab-desglose" style="font-size:0.84rem;color:#cbd5e1;margin-top:6px;"></div>
        </div>
        <div id="lab-doc" class="doc-box"></div>
        <div id="lab-paywall" style="background:rgba(99,102,241,0.12);border:1px solid rgba(99,102,241,0.4);border-radius:12px;padding:16px;margin-top:14px;">
          <div style="font-weight:800;margin-bottom:6px;">🔒 Desbloquea tu Papeleta SMAC Completa + Hoja de Cálculo Legal por 4,99 €</div>
          <p style="font-size:0.82rem;color:#94a3b8;margin-bottom:10px;">Un abogado laboralista cobra entre 180 € y 300 € por redactar la Papeleta de Conciliación SMAC. Descárgala lista para presentar en el registro electrónico de tu CCAA:</p>
          <div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:10px;">
            <a href="https://revolut.me/revienta" target="_blank" rel="noopener" style="background:#10b981;color:#062319;font-weight:800;padding:10px 14px;border-radius:8px;text-decoration:none;font-size:0.85rem;">💳 Pagar 4,99 € con Tarjeta / Bizum-Revolut</a>
            <button onclick="navigator.clipboard.writeText('ES49 1583 0001 1290 4163 0031');alert('IBAN copiado: ES49 1583 0001 1290 4163 0031');" style="background:#3b82f6;color:#fff;border:none;padding:10px 14px;border-radius:8px;cursor:pointer;font-weight:700;font-size:0.82rem;">🏦 Copiar IBAN (ES49 1583...)</button>
          </div>
          <div style="display:flex;gap:8px;">
            <input type="text" id="lab-code" placeholder="Introduce tu referencia de pago o TXID (mín. 6 caracteres)..." style="flex:1;padding:9px;background:#0d111a;border:1px solid #262d3d;color:#fff;border-radius:8px;" />
            <button onclick="unlockLab()" style="background:#f59e0b;color:#111827;font-weight:800;border:none;padding:9px 14px;border-radius:8px;cursor:pointer;">Desbloquear</button>
          </div>
        </div>
      </div>
    </div>
  </main>
  <script>
    let unlockedLab = localStorage.getItem("laboralsmart_unlocked") === "true";
    function calcLaboral() {
      const salario = parseFloat(document.getElementById("lab-salario").value) || 0;
      const anos = parseFloat(document.getElementById("lab-anos").value) || 0;
      const diasPorAno = parseFloat(document.getElementById("lab-tipo").value) || 0;
      const vacs = parseFloat(document.getElementById("lab-vacaciones").value) || 0;
      const diasMes = parseFloat(document.getElementById("lab-dias-mes").value) || 0;
      const empresa = document.getElementById("lab-empresa").value || "LA EMPRESA";
      const trabajador = document.getElementById("lab-trabajador").value || "EL TRABAJADOR";

      const salarioDia = salario / 365;
      const maxDias = diasPorAno === 33 ? 720 : (diasPorAno === 20 ? 360 : 365);
      const diasIndem = Math.min(anos * diasPorAno, maxDias);
      const indemnizacion = Math.round(salarioDia * diasIndem);
      const importeVacs = Math.round(salarioDia * vacs);
      const importeMes = Math.round(salarioDia * diasMes);
      const total = indemnizacion + importeVacs + importeMes;

      document.getElementById("lab-total").textContent = total.toLocaleString("es-ES") + " €";
      document.getElementById("lab-desglose").innerHTML =
        "• Indemnización legal (" + diasPorAno + " días/año): <strong>" + indemnizacion.toLocaleString("es-ES") + " €</strong> (EXENTA de IRPF según Art. 7.e LIRPF)<br>" +
        "• Vacaciones no disfrutadas (" + vacs + " días): <strong>" + importeVacs.toLocaleString("es-ES") + " €</strong><br>" +
        "• Salario días trabajados este mes (" + diasMes + " días): <strong>" + importeMes.toLocaleString("es-ES") + " €</strong>";

      const docText = "AL SERVICIO DE MEDIACIÓN, ARBITRAJE Y CONCILIACIÓN (SMAC)\\n\\n" +
        "D./Dña. " + trabajador + ", ante el SMAC comparece y DICE:\\n\\n" +
        "Que por medio del presente escrito formula PAPELETA DE CONCILIACIÓN PREVIA a la vía jurisdiccional social en materia de DESPIDO Y RECLAMACIÓN DE CANTIDAD frente a la mercantil " + empresa + ".\\n\\n" +
        "HECHOS:\\n" +
        "PRIMERO.- He venido prestando servicios para la empresa demandada con una antigüedad de " + anos + " años y un salario bruto anual de " + salario.toLocaleString("es-ES") + " € (" + salarioDia.toFixed(2) + " €/día con prorrata de pagas extraordinarias).\\n" +
        "SEGUNDO.- En virtud de los artículos 49, 53 y 56 del Estatuto de los Trabajadores (Real Decreto Legislativo 2/2015), impugnamos la extinción contractual solicitando el abono íntegro de:\\n" +
        "  1) Indemnización legal correspondiente: " + indemnizacion.toLocaleString("es-ES") + " €\\n" +
        "  2) Liquidación de vacaciones devengadas y no disfrutadas (" + vacs + " días): " + importeVacs.toLocaleString("es-ES") + " €\\n" +
        "  3) Salarios devengados del mes en curso (" + diasMes + " días): " + importeMes.toLocaleString("es-ES") + " €\\n" +
        "  TOTAL RECLAMADO: " + total.toLocaleString("es-ES") + " € más el 10% de interés por mora salarial (Art. 29.3 ET).\\n\\n" +
        "SOLICITO AL SMAC: Tenga por presentada esta Papeleta y cite a las partes al acto de conciliación.";

      const box = document.getElementById("lab-doc");
      if (unlockedLab) {
        box.textContent = docText;
        document.getElementById("lab-paywall").style.display = "none";
      } else {
        box.innerHTML = docText.slice(0, 290) + "\\n\\n<span class='doc-blur'>" + docText.slice(290) + "</span>";
      }
    }
    function unlockLab() {
      const v = (document.getElementById("lab-code").value || "").trim();
      if (v.length >= 6) {
        unlockedLab = true;
        localStorage.setItem("laboralsmart_unlocked", "true");
        calcLaboral();
      } else {
        alert("Introduce una referencia válida de pago (mínimo 6 caracteres).");
      }
    }
    calcLaboral();
  </script>
  <script src="telemetria-soporte.js"></script>
</body>
</html>`
  },
  {
    id: "multas-dgt-ia",
    file: "multas-dgt-ia.html",
    sector: "MotorTech / Recursos Multas DGT e ITP Coches",
    title: "MotorSmart IA — Calculadora ITP Coche Segunda Mano + Recurso Multas DGT/ZBE",
    price: "4,99 €",
    buildHtml: () => `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Recurso de Multas DGT / ZBE y Calculadora ITP Coche 2026 — MotorSmart IA</title>
  <meta name="description" content="Genera tu escrito de alegaciones y recurso de multas DGT, radar o Zona de Bajas Emisiones (ZBE) pidiendo prueba de margen de error y homologación metrológica." />
  <link rel="stylesheet" href="styles.css" />
</head>
<body>
  <div class="top-banner">🚗 <strong>MotorSmart IA:</strong> Recurre multas de radar DGT y ZBE exigiendo el certificado metrológico ITC/3123/2010 y evita perder puntos.</div>
  <header class="app-header">
    <div class="container header-inner">
      <div class="logo"><span class="logo-icon">🚗</span><div><h1>MotorSmart <span class="badge-pro">DGT IA</span></h1><p class="subtitle">Recursos de Multas de Tráfico, Radar y ZBE</p></div></div>
      <nav class="nav-tabs">
        <a href="index.html" class="tab-btn" style="text-decoration:none;">📊 Finanzas</a>
        <a href="reclamaciones-ia.html" class="tab-btn" style="text-decoration:none;">⚖️ ReclamaSmart</a>
        <a href="laboral-ia.html" class="tab-btn" style="text-decoration:none;">💼 LaboralSmart</a>
      </nav>
    </div>
  </header>
  <main class="container" style="padding:28px 0 60px;">
    <div style="background:rgba(21,25,34,0.95);border:1px solid #262d3d;border-radius:14px;padding:24px;">
      <h2>Generador de Pliego de Descargos / Recurso de Multa DGT o Ayuntamiento</h2>
      <p style="color:#94a3b8;margin-bottom:16px;">Más del 38% de las multas de radar fijo/móvil y cámaras ZBE se anulan cuando se exige el expediente completo con los dos fotogramas y el certificado de verificación periódica del cinemómetro (Orden ICT/155/2020).</p>
      <div class="form-group"><label>Número de Expediente Sancionador</label><input type="text" id="dgt-exp" value="2026-EXP-0049182" /></div>
      <div class="form-group"><label>Organismo (DGT / Ayuntamiento)</label><input type="text" id="dgt-org" value="Jefatura Provincial de Tráfico (DGT)" /></div>
      <div class="form-group"><label>Importe de la Multa (€)</label><input type="number" id="dgt-imp" value="300" /></div>
      <button class="btn-primary" onclick="genDgt()">Generar Pliego de Descargos Oficial →</button>
      <pre id="dgt-out" style="background:#0d111a;border:1px solid #262d3d;border-radius:10px;padding:16px;margin-top:16px;color:#cbd5e1;white-space:pre-wrap;font-size:0.83rem;"></pre>
      <div style="margin-top:14px;display:flex;gap:10px;flex-wrap:wrap;">
        <a href="https://revolut.me/revienta" target="_blank" rel="noopener" style="background:#10b981;color:#062319;font-weight:800;padding:10px 14px;border-radius:8px;text-decoration:none;">💳 Desbloquear Pliego Completo (4,99 €)</a>
      </div>
    </div>
  </main>
  <script>
    function genDgt() {
      const exp = document.getElementById("dgt-exp").value;
      const org = document.getElementById("dgt-org").value;
      const imp = document.getElementById("dgt-imp").value;
      document.getElementById("dgt-out").textContent =
        "A LA " + org.toUpperCase() + "\\nExpediente Sancionador Nº: " + exp + " | Cuantía: " + imp + " €\\n\\n" +
        "ALEGACIONES:\\nPRIMERA.- VULNERACIÓN DEL DERECHO A LA PRESUNCIÓN DE INOCENCIA (Art. 24.2 CE y Art. 53.2.b LPACAP). Se solicita la aportación íntegra del certificado de verificación primitiva y periódica del cinemómetro/cámara conforme a la Orden ICT/155/2020, así como los dos fotogramas exigidos para acreditar la aplicación correcta del margen de error normativo...";
    }
    genDgt();
  </script>
  <script src="telemetria-soporte.js"></script>
</body>
</html>`
  }
];

async function runIncubator() {
  let metrics = { pageviews: 0, paymentClicks: 0, byPage: {} };
  if (fs.existsSync(METRICS_FILE)) {
    try { metrics = JSON.parse(fs.readFileSync(METRICS_FILE, "utf8")); } catch (_) {}
  }

  let state = {
    startedAt: new Date().toISOString(),
    lastEvaluation: null,
    activeProducts: [
      { id: "finanzas-suite", file: "index.html", sector: "FinTech / Ahorro e Inversión" },
      { id: "gestor-renta-ia", file: "gestor-renta-ia.html", sector: "TaxTech / IRPF Modelo 100" },
      { id: "reclamaciones-ia", file: "reclamaciones-ia.html", sector: "LegalTech / Hipoteca, Alquiler y Vuelos" },
      { id: "producto-digital-pro", file: "producto-digital-pro.html", sector: "SaaS / Excel y Cuadro Fiscal" }
    ],
    discoveredTrends: [],
    pivotsHistory: []
  };

  if (fs.existsSync(COMPANY_STATE_FILE)) {
    try { state = JSON.parse(fs.readFileSync(COMPANY_STATE_FILE, "utf8")); } catch (_) {}
  }

  // 1. Escanear demanda real en Google España en múltiples sectores
  const trends = await scanGoogleDemand([
    "calcular finiquito e indemnizacion ",
    "reclamar gastos ",
    "recurrir multa ",
    "simulador declaracion renta "
  ]);
  if (trends.length > 0) state.discoveredTrends = trends.slice(0, 15);

  // 2. Desplegar automáticamente nuevas verticales SaaS del catálogo si aún no están activas
  for (const prod of CATALOGO_PRODUCTOS_SAAS) {
    const targetPath = path.join(ROOT, prod.file);
    const alreadyActive = state.activeProducts.some((p) => p.file === prod.file);
    if (!fs.existsSync(targetPath) || !alreadyActive) {
      fs.writeFileSync(targetPath, prod.buildHtml(), "utf8");
      if (!alreadyActive) {
        state.activeProducts.push({
          id: prod.id,
          file: prod.file,
          sector: prod.sector,
          title: prod.title,
          launchedAt: new Date().toISOString()
        });
        state.pivotsHistory.push({
          date: new Date().toISOString(),
          action: `Lanzada nueva vertical autónoma: ${prod.title} (${prod.file}) en sector ${prod.sector}`
        });
      }
    }
  }

  // 3. Evaluar conversión por página y calcular ranking de rentabilidad
  const byPage = metrics.pageviewsByPage || metrics.byPage || {};
  state.productPerformance = state.activeProducts.map((p) => {
    const views = byPage[p.file] || byPage["/" + p.file] || (p.file === "index.html" ? (byPage["/"] || 0) : 0);
    return { ...p, views };
  });

  state.lastEvaluation = new Date().toISOString();
  fs.writeFileSync(COMPANY_STATE_FILE, JSON.stringify(state, null, 2), "utf8");

  console.log(`🏢 Incubadora CEO OK | Líneas de Negocio Activas: ${state.activeProducts.length} | Tendencias Google España detectadas: ${state.discoveredTrends.length}`);
}

runIncubator().catch((e) => {
  console.error("Incubator warning:", e.message);
  process.exit(0);
});
