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
  },
  {
    slug: "simulador-declaracion-renta-espana-casillas.html",
    title: "Simulador Declaración de la Renta España (Modelo 100): Calcula si Sale a Pagar o Devolver",
    h1: "Gestor Renta IA: Simula tu IRPF y Descubre tus Deducciones Autonómicas",
    lead: "Calcula gratis en 30 segundos si tu Declaración de la Renta sale a devolver o a pagar y obtén las casillas exactas de Renta WEB sin pagar 70€ de gestoría.",
    calcLink: "gestor-renta-ia.html",
    bodyHtml: `
      <p>Más del 60% de los contribuyentes en España confirma el borrador de Renta WEB sin incluir las <strong>deducciones autonómicas por alquiler, planes de pensiones o compensación de pérdidas en criptomonedas y acciones</strong>, perdiendo entre 300 € y 1.200 €.</p>
      <p>Nuestro <strong>Gestor Renta IA</strong> analiza tu Comunidad Autónoma, tus retenciones, tus intereses en cuentas remuneradas (Casilla 0027) y tus operaciones cripto (Casillas 1800-1814) para darte el resultado exacto al instante.</p>
    `
  },
  {
    slug: "como-declarar-criptomonedas-renta-casilla-1800-bitget.html",
    title: "Cómo Declarar Criptomonedas y Bitget en la Renta (Casillas 1800 - 1814 y Compensar Pérdidas)",
    h1: "Guía para Declarar Criptomonedas en Renta WEB (Casillas 1800 a 1814)",
    lead: "Aprende a declarar tus ganancias de Bitcoin, USDT y Copy Trading en España y cómo compensar pérdidas hasta el 25% de tus intereses bancarios.",
    calcLink: "gestor-renta-ia.html",
    bodyHtml: `
      <p>En la Declaración de la Renta (Modelo 100), las ventas o permutas de criptomonedas se declaran en el apartado <strong>Ganancias y pérdidas patrimoniales derivadas de la transmisión de monedas virtuales (Casillas 1800 a 1814)</strong> tributando en la Base del Ahorro (19% hasta 6.000€, 21% hasta 50.000€, 23% hasta 200.000€).</p>
      <p>Si has tenido pérdidas, la Ley del IRPF te permite compensarlas con ganancias del mismo año y hasta con el <strong>25% de los intereses de tus cuentas remuneradas (Casilla 0027)</strong>, ahorrando impuestos legalmente.</p>
    `
  },
  {
    slug: "reclamar-gastos-hipoteca-sin-abogado-modelo.html",
    title: "Cómo Reclamar los Gastos de Hipoteca sin Abogado en 2026 (Calculadora + Escrito TJUE)",
    h1: "Calcula y Reclama tus Gastos de Hipoteca al Banco sin Dar el 25% a un Abogado",
    lead: "Tras la sentencia del TJUE (C-561/21), puedes recuperar el 50% de Notaría y el 100% de Registro, Gestoría y Tasación más intereses legales presentando el escrito oficial al SAC de tu banco.",
    calcLink: "reclamaciones-ia.html",
    bodyHtml: `
      <p>La mayoría de hipotecas firmadas antes de junio de 2019 obligaban al cliente a pagar todos los gastos de formalización. Hoy los bancos están obligados a devolver una media de <strong>1.500 € a 2.400 € más los intereses legales acumulados</strong>.</p>
      <p>En lugar de ceder entre 350 € y 500 € de comisión a un despacho, calcula tu importe exacto al céntimo y genera tu <strong>Escrito Oficial de Reclamación Extrajudicial</strong> listo para presentar en tu sucursal o sede electrónica.</p>
    `
  },
  {
    slug: "modelo-burofax-reclamar-fianza-alquiler-lau.html",
    title: "Modelo Burofax para Reclamar la Devolución de Fianza de Alquiler (Art. 36.4 LAU)",
    h1: "¿Tu casero no te devuelve la fianza tras 30 días? Genera tu Requerimiento Legal",
    lead: "El artículo 36.4 de la Ley de Arrendamientos Urbanos obliga a devolver la fianza en 1 mes desde la entrega de llaves o pagar intereses legales automáticos.",
    calcLink: "reclamaciones-ia.html",
    bodyHtml: `
      <p>Si ha pasado más de un mes desde que entregaste las llaves del piso y el propietario retiene tu fianza sin facturas justificadas, puedes exigir el principal más los intereses de demora mediante un requerimiento fehaciente previo a juicio verbal (que no requiere abogado ni procurador hasta 2.000 €).</p>
    `
  },
  {
    slug: "calculadora-irav-subida-alquiler-carta-inquilino.html",
    title: "Calculadora IRAV 2026 y Modelo de Carta para Comunicar la Subida del Alquiler al Inquilino",
    h1: "Calcula la Subida Legal del Alquiler con el IRAV del INE y Descarga la Carta Oficial",
    lead: "Para que la actualización anual del alquiler sea válida según el artículo 18 de la LAU, debes notificar por escrito al inquilino el porcentaje exacto con 30 días de antelación.",
    calcLink: "reclamaciones-ia.html",
    bodyHtml: `
      <p>Con la entrada en vigor del nuevo índice de referencia del INE (IRAV), los propietarios deben calcular la nueva cuota mensual y enviar una notificación escrita fehaciente antes del mes siguiente para poder exigir la nueva renta.</p>
    `
  },
  {
    slug: "reclamar-vuelo-retrasado-cancelado-sin-comisiones-aesa.html",
    title: "Cómo Reclamar de 250€ a 600€ por Vuelo Retrasado o Cancelado sin Pagar el 35% de Comisión",
    h1: "Cobra el 100% de tu Indemnización Aérea (Reglamento CE 261/2004) sin Intermediarios",
    lead: "Las agencias de reclamación se quedan hasta el 35% + IVA de tus 250€-600€. Genera el escrito oficial previo a AESA en 1 minuto y quédate con todo tu dinero.",
    calcLink: "reclamaciones-ia.html",
    bodyHtml: `
      <p>Si tu vuelo llegó con 3 o más horas de retraso o fue cancelado con menos de 14 días de preaviso, el Reglamento Europeo CE 261/2004 establece una compensación automática de <strong>250 €, 400 € o 600 € por pasajero</strong> además del reembolso de comida, hotel y transporte.</p>
    `
  },
  {
    slug: "calcular-finiquito-indemnizacion-despido-improcedente.html",
    title: "Calcular Finiquito e Indemnización por Despido Improcedente u Objetivo (2026) + Papeleta SMAC",
    h1: "Calculadora de Finiquito, Indemnización por Despido (33 o 20 días) y Papeleta SMAC",
    lead: "Calcula al céntimo cuánto te corresponde por despido improcedente, objetivo o fin de contrato temporal más vacaciones no disfrutadas y descarga tu Papeleta de Conciliación SMAC.",
    calcLink: "laboral-ia.html",
    bodyHtml: `
      <p>Ante cualquier despido o falta de pago del finiquito, dispones de un plazo improrrogable de <strong>20 días hábiles</strong> (art. 59.3 del Estatuto de los Trabajadores) para presentar la Papeleta de Conciliación ante el SMAC.</p>
      <p>Con <strong>LaboralSmart IA</strong> puedes calcular gratis la indemnización exenta de IRPF (33 días por año trabajado en despido improcedente o 20 días en despido objetivo), sumar las vacaciones devengadas y generar el escrito oficial para el SMAC sin pagar 250 € a un despacho.</p>
    `
  },
  {
    slug: "recurrir-multa-dgt-radar-zbe-modelo-alegaciones.html",
    title: "Cómo Recurrir una Multa de la DGT, Radar o ZBE en 2026 (Modelo de Alegaciones Orden ICT/155/2020)",
    h1: "Generador de Recurso y Alegaciones para Multas de Radar DGT y Zonas de Bajas Emisiones (ZBE)",
    lead: "Exige el certificado de verificación metrológica del cinemómetro y los dos fotogramas obligatorios para anular multas de velocidad o cámaras municipales y conservar tus puntos.",
    calcLink: "multas-dgt-ia.html",
    bodyHtml: `
      <p>Más del 38% de las sanciones por exceso de velocidad o acceso a Zonas de Bajas Emisiones (ZBE) presentan defectos formales al no adjuntar el certificado de verificación periódica del aparato medidor conforme a la <strong>Orden ICT/155/2020</strong> ni aplicar correctamente el margen de error legal.</p>
      <p>Utiliza <strong>MotorSmart IA</strong> para generar tu pliego de descargos oficial listo para presentar en la Sede Electrónica de la DGT o de tu Ayuntamiento.</p>
    `
  },
  {
    slug: "reclamar-gastos-hipoteca-caixabank-bbva-santander.html",
    title: "Reclamar Gastos de Hipoteca a CaixaBank, BBVA, Santander o Sabadell (2026) sin Abogado",
    h1: "Cómo Recuperar entre 1.500€ y 2.400€ de Gastos de Hipoteca en CaixaBank, BBVA y Santander",
    lead: "El plazo de prescripción solo empieza a contar desde que conoces la nulidad de tu cláusula (Sentencia TJUE C-561/21). Calcula tu devolución más intereses legales y presenta el escrito al SAC.",
    calcLink: "reclamaciones-ia.html",
    bodyHtml: `
      <p>Tanto si tu hipoteca original era de <strong>CaixaBank (o Bankia/La Caixa), BBVA, Banco Santander, Sabadell, Kutxabank o Ibercaja</strong> —incluso si ya está cancelada o vendida—, tienes derecho a recuperar el 50% de Notaría y el 100% de Registro, Gestoría y Tasación más los intereses legales desde la fecha de cada factura.</p>
    `
  },
  {
    slug: "subida-alquiler-ipc-irav-limite-legal-inquilino.html",
    title: "¿Puede mi Casero Subirme el Alquiler un 5% con el IPC en 2026? Límite Legal IRAV y Fianza INCASOL/IVIMA",
    h1: "Límite Legal de Subida de Alquiler (IRAV vs IPC) y Reclamación de Fianza No Depositada",
    lead: "Comprueba si la subida de alquiler que te pide tu casero es ilegal según el artículo 18 de la LAU y cómo reclamar la fianza e indemnización si no la depositó en INCASOL/IVIMA.",
    calcLink: "reclamaciones-ia.html",
    bodyHtml: `
      <p>El propietario <strong>no puede aplicar subidas arbitrarias del 5% ni actualizar la renta con carácter retroactivo</strong>: el artículo 18 de la LAU exige preaviso fehaciente con 30 días de antelación respetando el límite oficial del INE (IRAV). Además, si al finalizar el contrato no devuelve la fianza en 30 días (art. 36.4 LAU), genera intereses legales automáticos.</p>
    `
  },
  {
    slug: "xrechnung-generator-viewer-kostenlos.html",
    title: "XRechnung Generator & XML Viewer Online Kostenlos (2026) — EN 16931 E-Rechnung erstellen ohne Anmeldung",
    h1: "🇩🇪 Kostenloser XRechnung 3.0 & ZUGFeRD Generator + XML-Viewer (100% DSGVO-konform im Browser)",
    lead: "Erstellen, prüfen und öffnen Sie XRechnung 3.0 (.XML mit Leitweg-ID) und druckfertige A4-PDFs mit EPC-GiroCode direkt im Browser — ohne Registrierung und ohne Server-Upload.",
    calcLink: "verifactu-studio.html?lang=de",
    bodyHtml: `
      <p>Seit der Einführung der <strong>E-Rechnungspflicht in Deutschland (Wachstumschancengesetz / EN 16931)</strong> müssen Unternehmen und Freiberufler strukturierte XML-Rechnungen (XRechnung 3.0 / ZUGFeRD) empfangen, prüfen und erstellen können.</p>
      <ul style="margin: 1rem 0 1.5rem 1.25rem; color: #cbd5e1;">
        <li><strong>XRechnung XML-Viewer (Drag &amp; Drop):</strong> Öffnen Sie jede empfangene <code>.xml</code>-E-Rechnung sofort als lesbares A4-PDF inklusive EN-16931-Prüfbericht.</li>
        <li><strong>XRechnung 3.0 Generator mit Leitweg-ID (BT-10):</strong> Exportieren Sie standardkonforme UBL 2.1 XML-Dateien + A4-PDF mit SEPA EPC-GiroCode.</li>
        <li><strong>100% Lokal &amp; DSGVO-sicher:</strong> Ihre Rechnungsdaten verlassen niemals Ihren Browser.</li>
      </ul>
    `
  },
  {
    slug: "peppol-ubl-xml-invoice-generator-validator.html",
    title: "Free Peppol BIS 3.0 UBL 2.1 XML Invoice Generator, Viewer & EN 16931 Validator (No Sign-Up)",
    h1: "🇬🇧 Free Peppol UBL 2.1 E-Invoice Generator & Drag-and-Drop XML Viewer (100% Client-Side)",
    lead: "Generate EN 16931 compliant Peppol BIS Billing 3.0 XML invoices or drag & drop any UBL/CII .xml file to validate and convert it into a clean printable PDF in seconds.",
    calcLink: "verifactu-studio.html?lang=en",
    bodyHtml: `
      <p>With mandatory B2B e-invoicing across Europe (Belgium, Germany, UK, Netherlands) and APAC (Australia, Singapore), freelancers and SMEs need a fast, zero-server way to create and inspect <strong>Peppol BIS 3.0 (UBL 2.1) XML invoices</strong> without paying $30/month for bloated ERP suites.</p>
      <ul style="margin: 1rem 0 1.5rem 1.25rem; color: #cbd5e1;">
        <li><strong>Instant XML-to-PDF Viewer &amp; EN 16931 Validator:</strong> Drop any <code>.xml</code> invoice to verify mandatory business terms (BT-1, BT-2, BT-10, BT-31, BT-109, BT-112) and print as A4 PDF.</li>
        <li><strong>1-Click UBL 2.1 XML + SHA-256 Audit Trail Export:</strong> Ready for Peppol access points and public procurement portals.</li>
      </ul>
    `
  },
  {
    slug: "generateur-factur-x-chorus-pro-gratuit.html",
    title: "Générateur Factur-X & Lecteur XML Chorus Pro Gratuit en Ligne (2026 — Sans Inscription)",
    h1: "🇫🇷 Créez et Validez vos Factures Électroniques Factur-X / Chorus Pro (.XML + PDF A4)",
    lead: "Outil 100% local (conforme RGPD) pour auto-entrepreneurs et PME : générez vos fichiers XML conformes EN 16931 avec SIRET/TVA et convertissez vos factures XML en PDF lisible.",
    calcLink: "verifactu-studio.html?lang=fr",
    bodyHtml: `
      <p>Face à l'obligation de facturation électronique B2B en France (réforme DGFIP / Chorus Pro / norme européenne EN 16931), notre studio vous permet de générer gratuitement vos factures <strong>Factur-X / UBL XML</strong> avec numéro SIRET, TVA intracommunautaire et QR SEPA sans aucun abonnement mensuel.</p>
    `
  },
  {
    slug: "generador-facturas-verifactu-qr-aeat-facturae-xml-gratis.html",
    title: "Generador de Facturas VeriFactu Gratis (2026) con QR AEAT, Huella SHA-256 y XML Facturae 3.2.2",
    h1: "🇪🇸 Crea Facturas Oficiales Veri*Factu (Huella SHA-256 + QR AEAT) y Facturae 3.2.2 sin Cuotas Mensuales",
    lead: "Cumple con el Real Decreto 1007/2023 (Ley Antifraude) gratis desde tu navegador: encadenamiento criptográfico SHA-256, QR tributario de la AEAT, exportación XML Facturae y Libro de IVA/IRPF.",
    calcLink: "verifactu-studio.html?lang=es",
    bodyHtml: `
      <p>No necesitas pagar 25 €/mes a un programa en la nube para emitir <strong>facturas legales con código QR de la Agencia Tributaria y huella digital SHA-256 encadenada</strong>. Nuestro estudio funciona 100% en tu dispositivo (tus clientes y facturas no se suben a ningún servidor externo).</p>
    `
  }
];

const DESPIDO_ANOS = [2, 5, 8, 10, 15];
for (const anos of DESPIDO_ANOS) {
  const indemn33 = Math.round((27000 / 365) * Math.min(anos * 33, 720));
  const indemn20 = Math.round((27000 / 365) * Math.min(anos * 20, 360));
  SEO_PAGES.push({
    slug: `indemnizacion-despido-${anos}-anos-trabajados.html`,
    title: `Cuánta Indemnización por Despido me Corresponde por ${anos} Años Trabajados en España (2026)`,
    h1: `Cálculo de Indemnización y Finiquito por ${anos} Años de Antigüedad`,
    lead: `Tabla comparativa de indemnización por despido improcedente (33 días/año) vs objetivo (20 días/año) tras ${anos} años en la empresa.`,
    calcLink: "laboral-ia.html",
    bodyHtml: `
      <p>Con una antigüedad de <strong>${anos} años</strong> y un sueldo medio de referencia de 27.000 € brutos anuales (73,97 €/día), esta es la indemnización legal exenta de IRPF que te corresponde:</p>
      <ul style="margin: 1rem 0 1.5rem 1.25rem; color: #cbd5e1;">
        <li><strong>Despido Improcedente (33 días/año, Art. 56 ET):</strong> <strong style="color:#10b981;">${indemn33.toLocaleString("es-ES")} €</strong> (${Math.min(anos * 33, 720)} días de salario)</li>
        <li><strong>Despido Objetivo / ETOP (20 días/año, Art. 53 ET):</strong> <strong>${indemn20.toLocaleString("es-ES")} €</strong> (${Math.min(anos * 20, 360)} días de salario)</li>
      </ul>
      <p>A esta cifra debes sumar siempre el <strong>finiquito</strong> (vacaciones generadas y no disfrutadas + días trabajados del mes). Calcula tu cifra exacta con tu sueldo real y genera tu Papeleta SMAC en 1 clic.</p>
    `
  });
}

// Generación programática de Long-Tail SEO (búsquedas exactas sin competencia donde el usuario entra directo a calcular)
const AUTONOMO_BRACKETS = [1500, 2000, 2500, 3500, 4000, 5000];
for (const fact of AUTONOMO_BRACKETS) {
  const gastos = Math.round(fact * 0.1);
  const cuota = fact <= 1700 ? 294 : fact <= 2500 ? 310 : 370;
  const base = Math.max(0, fact - gastos - cuota);
  const irpf = Math.round(base * 0.18);
  const neto = base - irpf;
  SEO_PAGES.push({
    slug: `sueldo-neto-autonomo-${fact}-euros.html`,
    title: `Cuánto Queda Neto a un Autónomo que Factura ${fact}€ al Mes en España (2026)`,
    h1: `Si facturas ${fact}€ al mes como autónomo, ¿cuánto te queda limpio?`,
    lead: `Cálculo exacto para ${fact}€/mes de facturación en 2026 descontando cuota de Seguridad Social (${cuota}€), gastos deducibles y retención de IRPF.`,
    calcLink: "index.html#autonomo",
    bodyHtml: `
      <p>Si eres autónomo o freelancer en España y facturas <strong>${fact} € al mes (sin IVA)</strong>, este es el desglose mensual real que entra limpio en tu cuenta:</p>
      <ul style="margin: 1rem 0 1.5rem 1.25rem; color: #cbd5e1;">
        <li><strong>Facturación bruta (sin IVA):</strong> ${fact} €</li>
        <li><strong>Gastos deducibles estimados (10%):</strong> -${gastos} €</li>
        <li><strong>Cuota Seguridad Social orientativa:</strong> -${cuota} €</li>
        <li><strong>Provisión IRPF (18%):</strong> -${irpf} €</li>
        <li><strong>💰 Sueldo Neto Real Limpio:</strong> <strong style="color:#10b981;">${neto} € / mes</strong> (${neto * 12} € / año)</li>
      </ul>
      <p>Consejo práctico: Abre una cuenta gratuita en <strong>Revolut</strong> y mueve automáticamente los ${cuota + irpf} € de impuestos cada mes a una hucha separada para no quedarte sin liquidez en el trimestre.</p>
    `
  });
}

const HIPOTECA_BRACKETS = [120000, 150000, 200000, 250000, 300000];
for (const precio of HIPOTECA_BRACKETS) {
  const entrada = Math.round(precio * 0.25);
  const prestamo = Math.round(precio * 1.1 - entrada);
  const r = 0.031 / 12;
  const n = 300;
  const cuota = Math.round((prestamo * (r * Math.pow(1 + r, n))) / (Math.pow(1 + r, n) - 1));
  SEO_PAGES.push({
    slug: `cuota-hipoteca-${precio}-euros.html`,
    title: `Cuánto se Paga de Hipoteca por un Piso de ${precio.toLocaleString("es-ES")}€ en 2026`,
    h1: `Cuota mensual y ahorro necesario para una hipoteca de ${precio.toLocaleString("es-ES")} €`,
    lead: `Simulación completa a 25 años para una vivienda de ${precio.toLocaleString("es-ES")}€: entrada necesaria, gastos de compra (10%) y cuota mensual al 3,1%.`,
    calcLink: "index.html#hipoteca",
    bodyHtml: `
      <p>Para comprar una vivienda de <strong>${precio.toLocaleString("es-ES")} €</strong> en 2026, los bancos suelen financiar el 80% del precio, por lo que necesitas contar con el 20% de entrada más un 10% aproximado para impuestos (ITP/IVA y notaría):</p>
      <ul style="margin: 1rem 0 1.5rem 1.25rem; color: #cbd5e1;">
        <li><strong>Precio de la vivienda:</strong> ${precio.toLocaleString("es-ES")} €</li>
        <li><strong>Ahorro recomendado (entrada + gastos):</strong> ${entrada.toLocaleString("es-ES")} €</li>
        <li><strong>Importe del préstamo hipotecario:</strong> ${prestamo.toLocaleString("es-ES")} €</li>
        <li><strong>🏠 Cuota mensual estimada (25 años al 3,1%):</strong> <strong style="color:#10b981;">${cuota} € / mes</strong></li>
      </ul>
    `
  });
}

const INVERSION_BRACKETS = [50, 100, 200, 300, 500];
for (const mensual of INVERSION_BRACKETS) {
  const r = 0.08 / 12;
  let s10 = 1000, s20 = 1000;
  for (let i = 0; i < 120; i++) s10 = s10 * (1 + r) + mensual;
  for (let i = 0; i < 240; i++) s20 = s20 * (1 + r) + mensual;
  SEO_PAGES.push({
    slug: `invertir-${mensual}-euros-al-mes.html`,
    title: `Cuánto Ganas si Inviertes ${mensual}€ al Mes (Interés Compuesto y DCA 2026)`,
    h1: `Cómo invertir ${mensual}€ al mes y cuánto dinero acumularás en 10 y 20 años`,
    lead: `Tabla de rentabilidad real aportando ${mensual}€/mes mediante interés compuesto y compras periódicas (DCA) al 8% anual.`,
    calcLink: "index.html#compuesto",
    bodyHtml: `
      <p>Empezar un plan de ahorro automatizado (DCA) de <strong>${mensual} € al mes</strong> partiendo de 1.000 € iniciales con una rentabilidad media del 8% anual genera este crecimiento exponencial:</p>
      <ul style="margin: 1rem 0 1.5rem 1.25rem; color: #cbd5e1;">
        <li><strong>A los 10 años:</strong> Habrás aportado ${(1000 + mensual * 120).toLocaleString("es-ES")} € y tendrás <strong style="color:#10b981;">${Math.round(s10).toLocaleString("es-ES")} €</strong>.</li>
        <li><strong>A los 20 años:</strong> Habrás aportado ${(1000 + mensual * 240).toLocaleString("es-ES")} € y tendrás <strong style="color:#10b981;">${Math.round(s20).toLocaleString("es-ES")} €</strong>.</li>
      </ul>
      <p>Puedes automatizar tus compras periódicas en <strong>Bitget (Código promocional: KQBSNNRF)</strong> y separar tu ahorro mensual automáticamente con las huchas gratuitas de <strong>Revolut</strong>.</p>
    `
  });
}

// Expansión diaria continua: cada día del año desbloquea automáticamente nuevos tramos de sueldo/ahorro
const dayIndex = Math.floor(Date.now() / 86400000) % 30;
for (let d = 0; d <= Math.min(dayIndex, 10); d++) {
  const sueldoRegla = 1100 + d * 150;
  SEO_PAGES.push({
    slug: `regla-50-30-20-sueldo-${sueldoRegla}-euros.html`,
    title: `Cómo Aplicar la Regla 50/30/20 con un Sueldo de ${sueldoRegla}€ al Mes (Tabla 2026)`,
    h1: `Distribución exacta 50/30/20 para un sueldo neto de ${sueldoRegla} €`,
    lead: `Calcula cuánto destinar a gastos fijos, ocio e inversión automática si cobras ${sueldoRegla}€ al mes en España.`,
    calcLink: "producto-digital-pro.html",
    bodyHtml: `
      <p>Si tu ingreso neto mensual es de <strong>${sueldoRegla} €</strong>, la regla 50/30/20 divide tu presupuesto mensual de forma matemática para garantizar que construyes patrimonio todos los meses:</p>
      <ul style="margin: 1rem 0 1.5rem 1.25rem; color: #cbd5e1;">
        <li><strong>50% Necesidades Básicas (vivienda, facturas, comida):</strong> Máximo ${Math.round(sueldoRegla * 0.5)} € / mes</li>
        <li><strong>30% Estilo de vida y ocio:</strong> Máximo ${Math.round(sueldoRegla * 0.3)} € / mes</li>
        <li><strong>20% Ahorro e Inversión Automática (DCA):</strong> Mínimo <strong style="color:#10b981;">${Math.round(sueldoRegla * 0.2)} € / mes</strong> (${Math.round(sueldoRegla * 0.2 * 12)} € / año)</li>
      </ul>
      <p>Descarga nuestra plantilla Excel interactiva o automatiza ese 20% creando una hucha gratuita en <strong>Revolut</strong> y un plan DCA en <strong>Bitget (Código: KQBSNNRF)</strong>.</p>
    `
  });
}

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
        <a href="index.html" class="tab-btn active" style="text-decoration:none;">🧮 Calculadoras</a>
        <a href="reclamaciones-ia.html" class="tab-btn" style="text-decoration:none;">⚖️ ReclamaSmart</a>
        <a href="laboral-ia.html" class="tab-btn" style="text-decoration:none;">💼 LaboralSmart</a>
        <a href="gestor-renta-ia.html" class="tab-btn" style="text-decoration:none;">🤖 Renta IA</a>
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
        <p style="color: #94a3b8; font-size: 0.9rem; margin-bottom: 1rem;">Usa nuestra herramienta interactiva gratuita para calcular tu caso exacto y descargar el documento oficial:</p>
        <a href="${page.calcLink}" class="cta-button" style="display:inline-block; padding: 0.7rem 1.4rem;">Abrir Herramienta Interactiva →</a>
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
    <p>© 2026 FinanzaSmart — <a href="index.html" style="color:#10b981;">Calculadoras Financieras</a> | <a href="reclamaciones-ia.html" style="color:#10b981;">Reclamaciones Legales</a> | <a href="laboral-ia.html" style="color:#10b981;">Finiquito y SMAC</a> | <a href="multas-dgt-ia.html" style="color:#10b981;">Recurso Multas DGT</a></p>
  </footer>
  <script src="telemetria-soporte.js"></script>
</body>
</html>`;
}

async function publishTelegraphArticles(prevArticles = []) {
  const accRes = await fetch(
    "https://api.telegra.ph/createAccount?short_name=FinanzaSmart&author_name=FinanzaSmart+Espa%C3%B1a&author_url=" +
      encodeURIComponent(SITE_URL)
  ).then((r) => r.json());

  if (!accRes.ok) return [];
  const token = accRes.result.access_token;

  const articles = [
    {
      slugKey: "Modelo-Burofax-Reclamar-Fianza-Alquiler-LAU",
      title: "Modelo Burofax Reclamar Fianza de Alquiler no Devuelta en 30 Días (Art. 36.4 LAU e INCASOL)",
      nodes: [
        { tag: "p", children: ["Si has entregado las llaves del piso y tu casero no te devuelve la fianza tras 30 días o no la depositó en el organismo autonómico (INCASOL, IVIMA, etc.), el artículo 36.4 de la LAU obliga al pago de intereses legales automáticos."] },
        { tag: "p", children: [{ tag: "a", attrs: { href: `${SITE_URL}/reclamaciones-ia.html` }, children: ["⚖️ Calcular Intereses de Fianza y Descargar Burofax Oficial (Art. 36.4 LAU)"] }] },
        { tag: "p", children: [{ tag: "a", attrs: { href: `${SITE_URL}/subida-alquiler-ipc-irav-limite-legal-inquilino.html` }, children: ["🏠 ¿Puede tu casero subirte un 5% de IPC? Consulta el límite legal IRAV"] }] }
      ]
    },
    {
      slugKey: "Calcular-Finiquito-Indemnizacion-Despido-Papeleta-SMAC",
      title: "Cómo Calcular tu Finiquito e Indemnización por Despido Improcedente (33 días) + Papeleta SMAC",
      nodes: [
        { tag: "p", children: ["Recuerda que dispones de solo 20 días hábiles desde la carta de despido para presentar la Papeleta de Conciliación ante el SMAC y reclamar tus 33 días por año trabajado más las vacaciones no disfrutadas."] },
        { tag: "p", children: [{ tag: "a", attrs: { href: `${SITE_URL}/laboral-ia.html` }, children: ["💼 Abrir Calculadora de Finiquito, Indemnización y Generador de Papeleta SMAC"] }] }
      ]
    },
    {
      slugKey: "Recurrir-Multa-Radar-DGT-y-ZBE-Modelo-Alegaciones",
      title: "Modelo para Recurrir Multa de Radar DGT o Zona de Bajas Emisiones (ZBE) en 2026",
      nodes: [
        { tag: "p", children: ["Antes de perder puntos del carnet, exige el certificado de verificación periódica del cinemómetro (Orden ICT/155/2020) y los dos fotogramas obligatorios con aplicación del margen de error."] },
        { tag: "p", children: [{ tag: "a", attrs: { href: `${SITE_URL}/multas-dgt-ia.html` }, children: ["🚗 Generar Pliego de Descargos para Multa DGT o Ayuntamiento"] }] }
      ]
    },
    {
      slugKey: "Reclamar-Gastos-Hipoteca-CaixaBank-BBVA-Santander-TJUE",
      title: "Cómo Reclamar los Gastos de Hipoteca a CaixaBank, BBVA y Santander sin Abogado (Sentencia TJUE)",
      nodes: [
        { tag: "p", children: ["Recupera entre 1.500 € y 2.400 € (50% Notaría y 100% Registro, Gestoría y Tasación más intereses legales) presentando el escrito oficial ante el Servicio de Atención al Cliente de tu banco."] },
        { tag: "p", children: [{ tag: "a", attrs: { href: `${SITE_URL}/reclamaciones-ia.html` }, children: ["🏦 Calcular Importe Exacto + Descargar Escrito Oficial Gastos de Hipoteca"] }] },
        { tag: "p", children: [{ tag: "a", attrs: { href: REVOLUT_URL }, children: ["💳 Abrir Cuenta Gratuita Revolut para cobrar tu indemnización sin comisiones"] }] }
      ]
    }
  ];

  const publishedUrls = [];
  for (const art of articles) {
    // Evitar republicar en bucle si ya existe este tema en red-de-trafico.json
    const alreadyExists = prevArticles.some((u) => decodeURIComponent(u).toLowerCase().includes(art.slugKey.slice(0, 18).toLowerCase()));
    if (alreadyExists) continue;
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
    `${SITE_URL}/verifactu-studio.html`,
    `${SITE_URL}/producto-digital-pro.html`,
    `${SITE_URL}/gestor-renta-ia.html`,
    `${SITE_URL}/reclamaciones-ia.html`,
    `${SITE_URL}/laboral-ia.html`,
    `${SITE_URL}/multas-dgt-ia.html`
  ];

  for (const page of SEO_PAGES) {
    fs.writeFileSync(path.join(__dirname, page.slug), buildSeoPageHtml(page));
    allUrls.push(`${SITE_URL}/${page.slug}`);
  }

  // 2b. Generar Directorio Hub de Enlazado Interno (para indexación rápida de las 20+ páginas long-tail)
  const dirLinks = SEO_PAGES.map(
    (p) => `<li style="margin-bottom:0.55rem;"><a href="${p.slug}" style="color:#10b981;font-weight:600;">${p.title}</a></li>`
  ).join("\n");
  const dirHtml = buildSeoPageHtml({
    slug: "directorio-guias.html",
    title: "Directorio de Tablas y Guías Financieras: Autónomos, Hipotecas, Interés Compuesto y Cripto",
    h1: "Todas las Tablas de Cálculo Financiero (España 2026)",
    lead: "Consulta directamente nuestras simulaciones exactas por tramo de sueldo de autónomo, precio de vivienda y aportación mensual de inversión.",
    calcLink: "index.html",
    bodyHtml: `<ul style="margin: 1rem 0 1.5rem 1.25rem;">\n${dirLinks}\n</ul>`
  });
  fs.writeFileSync(path.join(__dirname, "directorio-guias.html"), dirHtml);
  allUrls.push(`${SITE_URL}/directorio-guias.html`);

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

  // 4. Cargar historial de artículos satélite y publicar solo nuevos temas sin duplicar en bucle
  let prevArticles = [];
  const reportPath = path.join(__dirname, "red-de-trafico.json");
  if (fs.existsSync(reportPath)) {
    try {
      const prev = JSON.parse(fs.readFileSync(reportPath, "utf8"));
      prevArticles = (prev.telegraphCloudArticles || []).filter((u) => !/-\d{2}-\d{2}-\d+$/.test(u));
    } catch (_) {}
  }
  const telegraphUrls = await publishTelegraphArticles(prevArticles);
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
