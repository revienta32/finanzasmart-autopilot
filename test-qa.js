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

// Verificar resultados matemáticos exactos:
// Interés compuesto: 2000 inicial + 150/mes al 8% durante 15 años (180 meses) -> Total aportado = 29.000 €, Total final ~ 58.659 €
assert(getEl("ic-res-aportado").textContent.includes("29.000"), `Error en total aportado IC: ${getEl("ic-res-aportado").textContent}`);
assert(getEl("ic-res-total").textContent.includes("58.659"), `Error en capital final IC: ${getEl("ic-res-total").textContent}`);

// Hipoteca: 180.000€ + 10% gastos = 198.000€ - 40.000€ ahorro = 158.000€ préstamo a 25 años al 3.1% -> Cuota ~ 757 €/mes, Rentabilidad bruta = (950*12)/180000 = 6,3%
assert(getEl("hip-res-cuota").textContent.includes("757"), `Error en cuota hipoteca: ${getEl("hip-res-cuota").textContent}`);
assert(getEl("hip-res-rentabilidad").textContent.includes("6,3"), `Error en rentabilidad hipoteca: ${getEl("hip-res-rentabilidad").textContent}`);

// Autónomo: 3000 facturación - 350 gastos - 310 cuota = 2340 base * 18% IRPF (421,2€) -> Neto = 1.919 €
assert(getEl("aut-res-neto").textContent.includes("1.919"), `Error en neto autónomo: ${getEl("aut-res-neto").textContent}`);

// Libertad financiera: 1500€/mes (18.000€/año) al 4% retiro -> Meta = 450.000 €
assert(getEl("lib-res-meta").textContent.includes("450.000"), `Error en meta libertad financiera: ${getEl("lib-res-meta").textContent}`);

// 3. Verificar exportación Excel (UTF-8 BOM + punto y coma ';' para Excel en España)
assert(proHtml.includes('\\uFEFF'), "El exportador Excel no incluye BOM UTF-8 (\\uFEFF) para acentos y símbolo € en Excel");
assert(proHtml.includes("Mes;Ahorro Acumulado (€);Fondo de Emergencia 40% (€);Capital Invertido al 8% Anual (€)"), "El exportador Excel no usa ';' como separador de columnas para España");

console.log("✅ QA TEST SUITE PASSED: 4/4 calculadoras, enrutamiento hash, pasarela cripto/SEPA y exportación Excel verificados sin errores.");
