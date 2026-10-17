/**
 * INFORME EJECUTIVO CEO - FinanzaSmart
 * Consulta en tiempo real:
 * 1. Estado de los servidores en vivo (Surge CDN + GitHub Pages) y total de páginas SEO activas.
 * 2. Ejecuciones automáticas en la nube de GitHub Actions y tráfico del repositorio.
 * 3. Lecturas reales acumuladas en los artículos en la nube de Telegram (api.telegra.ph/getViews).
 * 4. Saldo y movimientos en blockchain de las billeteras de cobro del proyecto.
 */

const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

async function generarInformeCEO() {
  console.log("==================================================================");
  console.log("📊 INFORME EJECUTIVO CEO - FINANZASMART (" + new Date().toISOString().slice(0, 10) + ")");
  console.log("==================================================================");

  // 1.Sincronizar últimos cambios hechos por el robot en la nube (GitHub Actions) y correr Auto-Doctor
  try {
    execSync("git pull --rebase origin main", { stdio: "ignore" });
  } catch (_) {}
  try {
    execSync("node auto-doctor.js", { stdio: "inherit" });
    execSync("node incubadora-empresa.js", { stdio: "inherit" });
  } catch (_) {}

  const trafico = JSON.parse(fs.readFileSync(path.join(__dirname, "red-de-trafico.json"), "utf8"));
  console.log(`🌐 Páginas SEO Indexadas Activas: ${trafico.seoPages.length}`);
  console.log(`📰 Artículos Cloud en Telegra.ph: ${trafico.telegraphCloudArticles.length}`);

  // 2. Consultar visitas reales en la API de Telegra.ph
  let totalTelegraphViews = 0;
  for (const url of trafico.telegraphCloudArticles) {
    try {
      const slug = decodeURIComponent(url.replace("https://telegra.ph/", ""));
      const res = await fetch(`https://api.telegra.ph/getViews/${encodeURIComponent(slug)}`).then((r) => r.json());
      if (res.ok && res.result) {
        totalTelegraphViews += res.result.views || 0;
      }
    } catch (_) {}
  }
  console.log(`👀 Lecturas en Artículos Satélite (Telegra.ph): ${totalTelegraphViews} vistas`);

  // 3. Consultar tráfico del repositorio y ejecuciones Cloud en GitHub
  try {
    const credOut = execSync("git credential fill", { input: "protocol=https\nhost=github.com\n\n" }).toString();
    const pass = (credOut.match(/password=(.+)/) || [])[1]?.trim();
    if (pass) {
      const headers = { Authorization: "Bearer " + pass, "User-Agent": "FinanzaSmart-CEO" };
      const viewsRes = await fetch("https://api.github.com/repos/revienta32/finanzasmart-autopilot/traffic/views", { headers }).then((r) => r.json());
      const clonesRes = await fetch("https://api.github.com/repos/revienta32/finanzasmart-autopilot/traffic/clones", { headers }).then((r) => r.json());
      const runsRes = await fetch("https://api.github.com/repos/revienta32/finanzasmart-autopilot/actions/runs?per_page=5", { headers }).then((r) => r.json());
      console.log(`📈 Tráfico GitHub SEO (14d): ${viewsRes.count || 0} vistas (${viewsRes.uniques || 0} únicos) | ${clonesRes.count || 0} clones`);
      const okRuns = (runsRes.workflow_runs || []).filter((r) => r.conclusion === "success").length;
      console.log(`🤖 Últimas ejecuciones en la nube (GitHub Actions): ${okRuns}/5 exitosas`);
    }
  } catch (_) {}

  // 4. Comprobar salud HTTP de las webs principales
  const s1 = await fetch("https://finanzasmart-pro.surge.sh/gestor-renta-ia.html").then((r) => r.status).catch(() => 0);
  const s2 = await fetch("https://revienta32.github.io/finanzasmart-autopilot/gestor-renta-ia.html").then((r) => r.status).catch(() => 0);
  console.log(`✅ Estado Web Principal (Surge CDN): HTTP ${s1} | Espejo GitHub Pages: HTTP ${s2}`);
  console.log("==================================================================");
}

generarInformeCEO().catch(console.error);
