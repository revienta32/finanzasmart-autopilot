(function () {
  const fmtEUR = new Intl.NumberFormat("es-ES", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0
  });

  const cfg = window.AFILIADOS_CONFIG || {};
  if (cfg.nombreSitio) {
    document.getElementById("site-title").textContent = cfg.nombreSitio;
    document.getElementById("footer-brand").textContent = cfg.nombreSitio;
  }

  const tabMapToOffer = {
    compuesto: "inversion",
    hipoteca: "hipoteca",
    autonomo: "autonomos",
    dca: "cripto"
  };

  let activeTab = "compuesto";

  function updateOfferCard(tabKey) {
    const offerKey = tabMapToOffer[tabKey] || "inversion";
    const offer = cfg.ofertas && cfg.ofertas[offerKey];
    if (!offer) return;
    document.getElementById("offer-badge").textContent = offer.badge;
    document.getElementById("offer-title").textContent = offer.titulo;
    document.getElementById("offer-desc").textContent = offer.descripcion;
    const cta = document.getElementById("offer-cta");
    cta.textContent = offer.ctaTexto;
    cta.href = offer.url;
  }

  // 1. Cálculo de Interés Compuesto
  function calcCompuesto() {
    const inicial = parseFloat(document.getElementById("ic-inicial").value) || 0;
    const mensual = parseFloat(document.getElementById("ic-mensual").value) || 0;
    const tasaAnual = parseFloat(document.getElementById("ic-tasa").value) || 0;
    const anios = parseInt(document.getElementById("ic-anios").value, 10) || 1;

    const meses = anios * 12;
    const rMensual = tasaAnual / 100 / 12;

    let saldo = inicial;
    for (let i = 0; i < meses; i++) {
      saldo = saldo * (1 + rMensual) + mensual;
    }

    const totalAportado = inicial + mensual * meses;
    const intereses = Math.max(0, saldo - totalAportado);

    document.getElementById("ic-res-total").textContent = fmtEUR.format(saldo);
    document.getElementById("ic-res-aportado").textContent = fmtEUR.format(totalAportado);
    document.getElementById("ic-res-intereses").textContent = "+" + fmtEUR.format(intereses);

    const pctInteres = saldo > 0 ? Math.round((intereses / saldo) * 100) : 0;
    const pctAportado = 100 - pctInteres;
    document.getElementById("ic-pct-intereses").textContent = `${pctInteres}% son intereses pasivos`;
    document.getElementById("ic-bar-aportado").style.width = `${pctAportado}%`;
    document.getElementById("ic-bar-interes").style.width = `${pctInteres}%`;
  }

  // 2. Cálculo de Hipoteca y Alquiler
  function calcHipoteca() {
    const precio = parseFloat(document.getElementById("hip-precio").value) || 0;
    const ahorro = parseFloat(document.getElementById("hip-ahorro").value) || 0;
    const interesAnual = parseFloat(document.getElementById("hip-interes").value) || 0;
    const anios = parseInt(document.getElementById("hip-anios").value, 10) || 25;
    const alquiler = parseFloat(document.getElementById("hip-alquiler").value) || 0;
    const gastosAnuales = parseFloat(document.getElementById("hip-gastos").value) || 0;

    // Suponemos un 10% de gastos de compraventa (ITP, notaría, etc.)
    const costeTotalCompra = precio * 1.1;
    const prestamo = Math.max(0, costeTotalCompra - ahorro);
    const nMeses = anios * 12;
    const r = interesAnual / 100 / 12;

    let cuota = 0;
    if (prestamo > 0) {
      if (r === 0) {
        cuota = prestamo / nMeses;
      } else {
        cuota = (prestamo * (r * Math.pow(1 + r, nMeses))) / (Math.pow(1 + r, nMeses) - 1);
      }
    }

    const cashflowMensual = alquiler - cuota - gastosAnuales / 12;
    const rentabilidadBruta = precio > 0 ? ((alquiler * 12) / precio) * 100 : 0;

    document.getElementById("hip-res-cuota").textContent = fmtEUR.format(cuota) + "/mes";
    document.getElementById("hip-res-cashflow").textContent =
      (cashflowMensual >= 0 ? "+" : "") + fmtEUR.format(cashflowMensual) + "/mes";
    document.getElementById("hip-res-rentabilidad").textContent = rentabilidadBruta.toFixed(1) + " %";
  }

  // 3. Cálculo Autónomo
  function calcAutonomo() {
    const facturacion = parseFloat(document.getElementById("aut-facturacion").value) || 0;
    const gastos = parseFloat(document.getElementById("aut-gastos").value) || 0;
    const cuota = parseFloat(document.getElementById("aut-cuota").value) || 0;
    const irpfPct = parseFloat(document.getElementById("aut-irpf").value) || 0;

    const baseImponible = Math.max(0, facturacion - gastos - cuota);
    const irpf = baseImponible * (irpfPct / 100);
    const netoMensual = Math.max(0, facturacion - gastos - cuota - irpf);
    const totalImpuestos = cuota + irpf;

    document.getElementById("aut-res-neto").textContent = fmtEUR.format(netoMensual);
    document.getElementById("aut-res-impuestos").textContent = fmtEUR.format(totalImpuestos);
    document.getElementById("aut-res-anual").textContent = fmtEUR.format(netoMensual * 12);
  }

  // 4. Libertad Financiera
  function calcLibertad() {
    const gastoMensual = parseFloat(document.getElementById("lib-gasto").value) || 0;
    const tasaRetiro = parseFloat(document.getElementById("lib-retiro").value) || 4;
    const actual = parseFloat(document.getElementById("lib-actual").value) || 0;
    const ahorroMensual = parseFloat(document.getElementById("lib-ahorro").value) || 0;

    const gastoAnual = gastoMensual * 12;
    const meta = tasaRetiro > 0 ? gastoAnual / (tasaRetiro / 100) : 0;

    // Calcular años al 8% anual compuesto
    let saldo = actual;
    let meses = 0;
    const rMensual = 0.08 / 12;
    while (saldo < meta && meses < 1200) {
      saldo = saldo * (1 + rMensual) + ahorroMensual;
      meses++;
    }
    const anios = (meses / 12).toFixed(1);

    document.getElementById("lib-res-meta").textContent = fmtEUR.format(meta);
    document.getElementById("lib-res-renta").textContent = fmtEUR.format(gastoMensual) + "/mes";
    document.getElementById("lib-res-anios").textContent = meses >= 1200 ? "+99 años" : `${anios} años`;
  }

  function recalculateAll() {
    calcCompuesto();
    calcHipoteca();
    calcAutonomo();
    calcLibertad();
  }

  // Eventos de pestañas
  document.querySelectorAll(".tab-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".tab-btn").forEach((b) => b.classList.remove("active"));
      document.querySelectorAll(".tab-panel").forEach((p) => p.classList.remove("active"));
      btn.classList.add("active");
      activeTab = btn.dataset.tab;
      document.getElementById(`panel-${activeTab}`).classList.add("active");
      updateOfferCard(activeTab);
    });
  });

  // Eventos de inputs
  document.querySelectorAll("input").forEach((inp) => {
    inp.addEventListener("input", recalculateAll);
  });

  // Botón de compartir viral
  document.getElementById("btn-copy-summary").addEventListener("click", () => {
    let texto = "";
    if (activeTab === "compuesto") {
      texto = `📈 Si invierto ${document.getElementById("ic-mensual").value}€/mes durante ${document.getElementById("ic-anios").value} años, acumularé ${document.getElementById("ic-res-total").textContent} (${document.getElementById("ic-res-intereses").textContent} solo en intereses pasivos). Calcula el tuyo gratis en: ${window.location.href}`;
    } else if (activeTab === "hipoteca") {
      texto = `🏠 Mi simulación de hipoteca sale a ${document.getElementById("hip-res-cuota").textContent} con un cashflow de alquiler de ${document.getElementById("hip-res-cashflow").textContent}. Simula la tuya en: ${window.location.href}`;
    } else if (activeTab === "autonomo") {
      texto = `💼 Facturando ${document.getElementById("aut-facturacion").value}€/mes como autónomo, el sueldo neto limpio es de ${document.getElementById("aut-res-neto").textContent}. Calcula el tuyo en: ${window.location.href}`;
    } else {
      texto = `🔥 Mi meta de Libertad Financiera es de ${document.getElementById("lib-res-meta").textContent} (${document.getElementById("lib-res-anios").textContent}). Calcula cuándo podrás vivir de rentas en: ${window.location.href}`;
    }

    navigator.clipboard.writeText(texto).then(() => {
      const fb = document.getElementById("copy-feedback");
      fb.hidden = false;
      setTimeout(() => {
        fb.hidden = true;
      }, 2500);
    });
  });

  updateOfferCard(activeTab);
  recalculateAll();
})();
