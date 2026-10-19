/**
 * SINDICACIÓN MULTICANAL CEO - FinanzaSmart & ReclamaSmart
 * 1. Publica Gists públicos de alta autoridad en gist.github.com (DA 96) para búsquedas legales y fiscales.
 * 2. Crea repositorios satélite temáticos en github.com con Topics SEO que redirigen a nuestras herramientas.
 * 3. Escanea en tiempo real Reddit España (r/ESLegal, r/SpainFIRE) detectando usuarios con problemas reales hoy.
 */

const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

const SITE_URL = "https://finanzasmart-pro.surge.sh";
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
  }
  return created;
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
  const subreddits = ["ESLegal", "SpainFIRE", "HorroresInmobiliarios", "SpainEconomics", "pesadillalaboral"];
  const keywords = /fianza|alquiler|casero|hipoteca|gastos|renta|irpf|autonomo|autónomo|declaracion|declaración|vuelo|retraso|revolut|cripto|hacienda|irav|impuesto|inmueble|piso|despido|finiquito|smac|indemnizaci|multa|dgt|radar|zbe/i;
  const matches = [];

  for (const sub of subreddits) {
    try {
      const xml = await fetch(`https://www.reddit.com/r/${sub}/new/.rss`, {
        headers: { "User-Agent": "FinanzaSmart/1.0" }
      }).then((r) => r.text());
      const entries = xml.split("<entry>").slice(1);
      for (const entry of entries) {
        const title = (entry.match(/<title>([^<]+)<\/title>/) || [])[1] || "";
        const link = (entry.match(/<link href="([^"]+)"/) || [])[1] || "";
        if (title && link && keywords.test(title)) {
          let targetLink = `${SITE_URL}/reclamaciones-ia.html`;
          if (/despido|finiquito|smac|indemnizaci|laboral|empresa|baja|vacaciones/i.test(title) || sub === "pesadillalaboral") {
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
            replyText: buildSuggestedReply(title, targetLink)
          });
        }
      }
    } catch (_) {}
  }

  if (matches.length > 0) {
    const md = [
      "# 🎯 Radar CEO en Tiempo Real: Personas Buscando Tus Herramientas Hoy en Reddit España",
      "",
      "Estos hilos son de usuarios reales en España preguntando **hoy mismo** sobre alquileres, fianzas, despidos, multas o impuestos, con la **respuesta exacta lista para copiar y pegar**:",
      "",
      ...matches.slice(0, 15).map(
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
  console.log("Created Satellite SEO Repos:", satRepos);
  const redditCount = await scanLiveRedditOpportunities();
  console.log("Live Reddit Spain opportunities detected today:", redditCount);
}

main().catch(console.error);
