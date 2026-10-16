/**
 * AUTOMATED END-TO-END QA TEST SUITE - FinanzaSmart
 * Verifica cálculos matemáticos, navegación por hash, exportación Excel compatible con España,
 * validación de pagos y enlaces de monetización (Revolut, Bitget, IBAN y Wallets USDT).
 */

const assert = require("assert");
const fs = require("fs");
const path = require("path");

const indexHtml = fs.readFileSync(path.join(__dirname, "index.html"), "utf8");
const appJs = fs.readFileSync(path.join(__dirname, "app.js"), "utf8");
const afiliadosJs = fs.readFileSync(path.join(__dirname, "afiliados.js"), "utf8");
const proHtml = fs.readFileSync(path.join(__dirname, "producto-digital-pro.html"), "utf8");

// 1. Verificar integridad de enlaces de afiliado y billeteras
assert(afiliadosJs.includes("revienta!OCT1-26-AR-H1"), "Falta enlace de Revolut en afiliados.js");
assert(afiliadosJs.includes("KQBSNNRF"), "Falta código Bitget KQBSNNRF en afiliados.js");
assert(proHtml.includes("ES49 1583 0001 1290 4163 0031"), "Falta IBAN de Revolut en producto-digital-pro.html");
assert(proHtml.includes("0x512c2d191d9e6857e4fabbf14d0b7bfa9b44aed2"), "Falta Wallet BEP20/ERC20 en producto-digital-pro.html");
assert(proHtml.includes("TAeoVC9WL9K63MFYPqVzFKqi3MghZGdv63"), "Falta Wallet TRC20 en producto-digital-pro.html");
assert(proHtml.includes("3CjrJ9C6D5z1crQRXwti6JdQdBAYmqRUKCakFXi2vpRY"), "Falta Wallet Solana en producto-digital-pro.html");

// 2. Simular DOM y verificar cálculos matemáticos de las 4 calculadoras en app.js
const elements = {};
function getEl(id) {
  if (!elements[id]) {
    elements[id] = {
      id,
      value: "",
      textContent: "",
      hidden: true,
      style: {},
      dataset: {},
      classList: {
        _set: new Set(),
        add(c) { this._set.add(c); },
        remove(c) { this._set.delete(c); },
        toggle(c, cond) { if (cond) this._set.add(c); else this._set.delete(c); },
        contains(c) { return this._set.has(c); }
      },
      addEventListener() {}
    };
  }
  return elements[id];
}

// Cargar valores iniciales desde index.html
for (const m of indexHtml.matchAll(/<input[^>]+id="([^"]+)"[^>]+value="([^"]+)"/g)) {
  getEl(m[1]).value = m[2];
}

const tabBtns = ["compuesto", "hipoteca", "autonomo", "dca"].map(t => {
  const el = getEl("btn-" + t);
  el.dataset.tab = t;
  return el;
});
const tabPanels = ["compuesto", "hipoteca", "autonomo", "dca"].map(t => getEl("panel-" + t));

const sandboxWindow = {
  location: { hash: "#autonomo", protocol: "https:", href: "https://finanzasmart-pro.surge.sh/#autonomo" }
};
const sandboxDocument = {
  getElementById: (id) => getEl(id),
  querySelectorAll: (sel) => {
    if (sel === ".tab-btn") return tabBtns;
    if (sel === ".tab-panel") return tabPanels;
    return [];
  }
};

const runApp = new Function("window", "document", "history", "navigator", afiliadosJs + "\n" + appJs);
runApp(sandboxWindow, sandboxDocument, { replaceState() {} }, { clipboard: { writeText: async () => {} } });

// Verificar que #autonomo se activó por hash
assert(getEl("panel-autonomo").classList.contains("active"), "El enrutamiento por hash #autonomo no activó el panel de autónomos");

// Verificar resultados matemáticos exactos (normalizando separador de miles de ICU):
const norm = (s) => s.replace(/\./g, "");
assert(norm(getEl("ic-res-aportado").textContent).includes("29000"), `Error en total aportado IC: ${getEl("ic-res-aportado").textContent}`);
assert(norm(getEl("ic-res-total").textContent).includes("58520"), `Error en capital final IC: ${getEl("ic-res-total").textContent}`);
assert(norm(getEl("hip-res-cuota").textContent).includes("757"), `Error en cuota hipoteca: ${getEl("hip-res-cuota").textContent}`);
assert(getEl("hip-res-rentabilidad").textContent.includes("6.3"), `Error en rentabilidad hipoteca: ${getEl("hip-res-rentabilidad").textContent}`);
assert(norm(getEl("aut-res-neto").textContent).includes("1919"), `Error en neto autónomo: ${getEl("aut-res-neto").textContent}`);
assert(norm(getEl("lib-res-meta").textContent).includes("450000"), `Error en meta libertad financiera: ${getEl("lib-res-meta").textContent}`);

// 3. Verificar exportación Excel (UTF-8 BOM + punto y coma ';' para Excel en España + 6 columnas VIP) y Decoy Pricing
assert(proHtml.includes('\\uFEFF'), "El exportador Excel no incluye BOM UTF-8 (\\uFEFF) para acentos y símbolo € en Excel");
assert(proHtml.includes("Mes;Ahorro Acumulado (€);Fondo de Emergencia 40% (€);Capital Invertido al 8% Anual (€);Reserva Fiscal IVA+IRPF (€);Objetivo Take-Profit Cripto +35% (€)"), "El exportador Excel no usa las 6 columnas con ';' como separador para España");
assert(proHtml.includes("function selectTier("), "Falta selector de 3 niveles de producto (Decoy Pricing)");

console.log("✅ QA TEST SUITE PASSED: 4/4 calculadoras, 3 niveles de producto, enrutamiento hash, pasarela cripto/SEPA y exportación Excel verificados sin errores.");
