/**
 * AUTOMATED END-TO-END QA TEST SUITE - PureAI Studio
 * Verifica limpieza binaria C2PA/EXIF/MP4, higiene Unicode, licencias Pro FNV-1a,
 * webhooks Stripe, panel CFO, cumplimiento RGPD/EU AI Act, ciberseguridad y analítica.
 */

const assert = require("assert");
const fs = require("fs");
const path = require("path");

const telemetriaCode = fs.readFileSync(path.join(__dirname, "telemetria-soporte.js"), "utf8");
new Function(telemetriaCode);

// 5b. Verificar que clean-ai-studio.html ya incluye todos los controles de Ciberseguridad (CSP, Referrer-Policy, Anti-DOM-XSS, sin ntfy.sh expuesto en cliente, y validación HTTPS en ?ext_img=)
const cleanAiHtml = fs.readFileSync(path.join(__dirname, "clean-ai-studio.html"), "utf8");
assert(!cleanAiHtml.includes("https://ntfy.sh"), "clean-ai-studio.html no debe exponer URLs directas de ntfy.sh en el cliente");
assert(!telemetriaCode.includes("https://ntfy.sh"), "telemetria-soporte.js debe enviar eventos al relay /telemetry y nunca exponer el topic de ntfy.sh en cliente");
assert(cleanAiHtml.includes("trainedAlgorithmicMedia") && cleanAiHtml.includes("\\u202F"), "Falta motor C2PA y Unicode Scrubber en clean-ai-studio.html");
assert(
  cleanAiHtml.includes("https://buy.stripe.com/9B6cN6e669uZ4vmeTE0000f") &&
  cleanAiHtml.includes("https://buy.stripe.com/3cIdRae66bD74vm6n80000g") &&
  cleanAiHtml.includes("https://buy.stripe.com/eVq00k7HIfTn1jabHs0000h") &&
  !cleanAiHtml.includes("FRIEND50"),
  "Faltan los 3 enlaces híbridos de Stripe Checkout en vivo (2,99 € / 9,90 € / 39 €) o quedan rastros del cupón antiguo FRIEND50"
);
assert(!cleanAiHtml.includes("paypal.me") && !cleanAiHtml.includes("revolut.me"), "No deben existir pasarelas ajenas a Stripe en la suite principal");
assert(cleanAiHtml.includes("telemetria-soporte.js"), "Falta inyección de telemetria-soporte.js en clean-ai-studio.html");
assert(!fs.existsSync(path.join(__dirname, "calculadoras-PureAI Studio.html")) && !fs.existsSync(path.join(__dirname, "verifactu-studio.html")), "Todo archivo relacionado con PureAI Studio o VeriFactu debe estar eliminado del proyecto");

// 6. Ejecución E2E Real en VM de clean-ai-studio.html (Binarios C2PA/EXIF/GPS + Textos + Idiomas + XSS + Batch Pro)
const vm = require("vm");
const cleanScript = cleanAiHtml.split("<script>")[1].split("</script>")[0];
const paEls = {};
function getPaEl(id) {
  if (!paEls[id]) {
    paEls[id] = {
      id,
      value: id === "img-format" ? "image/jpeg" : id === "img-defense" ? "micro" : "",
      textContent: "",
      innerHTML: "",
      disabled: true,
      style: {},
      classList: { toggle() {}, contains() { return false; } },
      scrollIntoView() {},
      focus() {},
      click() {},
      getContext() {
        return {
          drawImage() {},
          getImageData(x, y, w, h) { return { data: new Uint8ClampedArray((w || 8) * (h || 8) * 4) }; },
          putImageData() {}
        };
      },
      toBlob(cb, mime) {
        const cleanBytes = Buffer.from([0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46, 0x49, 0x46, 0xff, 0xd9]);
        cb({ size: cleanBytes.length, _bytes: cleanBytes, type: mime });
      }
    };
  }
  return paEls[id];
}
let cleanedBlobs = [];
const paSandbox = {
  console, TextDecoder, TextEncoder, Uint8Array, DataView, Math, Array, Object,
  Blob: class {
    constructor(parts) {
      const bufs = parts.map(p => Buffer.from(p.buffer ? p.buffer.slice(p.byteOffset, p.byteOffset + p.byteLength) : p));
      this._bytes = Buffer.concat(bufs);
      this.size = this._bytes.length;
    }
    async arrayBuffer() { return this._bytes.buffer.slice(this._bytes.byteOffset, this._bytes.byteOffset + this._bytes.byteLength); }
  },
  URL: { createObjectURL(o) { if (o && o._bytes) cleanedBlobs.push(o); return "blob:ok"; } },
  Image: class { constructor() { this.naturalWidth = 64; this.naturalHeight = 64; } set src(v) { if (this.onload) this.onload(); } },
  localStorage: { _s: {}, getItem(k) { return this._s[k] || null; }, setItem(k, v) { this._s[k] = String(v); }, removeItem(k) { delete this._s[k]; } },
  location: { search: "" },
  navigator: { language: "es-ES", clipboard: { writeText: async () => {}, readText: async () => "Prueba\u202F—\u202FIA" } },
  document: { getElementById: (id) => getPaEl(id), createElement: (t) => getPaEl("tag-" + t) },
  alert() {}
};
vm.createContext(paSandbox);
vm.runInContext(cleanScript, paSandbox);
assert.strictEqual(paSandbox.currentUiLang, "es", "clean-ai-studio debe iniciar en español si navigator.language es es-ES");
assert(getPaEl("xray-view").innerHTML.includes("[U+202F WATERMARK]"), "El visor de Rayos X debe marcar U+202F al iniciar");
paSandbox.setLang("de");
assert(getPaEl("txt-input").value.includes("Zusammenfassend"), "Cambiar idioma a DE debe actualizar el texto de ejemplo a alemán");
paSandbox.scrubAiText();
assert(!/[\u202F\u200B\u00A0—]/.test(getPaEl("txt-input").value), "scrubAiText debe eliminar todos los espacios Unicode invisibles y guiones largos");
const testZip = paSandbox.createZipBlob([{ name: "test.jpg", bytes: new Uint8Array([0xff, 0xd8, 0xff, 0xd9]) }]);
assert.strictEqual(testZip._bytes[0], 0x50, "El generador ZIP por lotes debe emitir cabecera estándar PK (0x50 0x4B)");
assert(paSandbox.AI_CLICHE_MAP.length >= 65, "El diccionario multilingüe Pro debe incluir más de 65 clichés de IA");

// 7. Verificar blindaje criptográfico de licencias Pro, limpieza de vídeo C2PA y pricing sin canibalización
assert.strictEqual(paSandbox.isValidProLicenseCode("123456"), false, "No debe aceptar códigos arbitrarios de 6 caracteres");
assert.strictEqual(paSandbox.isValidProLicenseCode("fake@gmail.com"), false, "No debe aceptar emails sin verificar como clave Pro");
assert.strictEqual(paSandbox.isValidProLicenseCode("PRO-AAAA-BBBB"), false, "No debe aceptar claves PRO con checksum inválido");
const validGeneratedKey = paSandbox.generateMultiDeviceProKey();
assert.strictEqual(paSandbox.isValidProLicenseCode(validGeneratedKey), true, "Debe validar claves PRO-XXXX-YYYY con checksum FNV-1a legítimo");
assert.strictEqual(paSandbox.isValidProLicenseCode("cs_live_a1B2c3D4e5F6g7H8i9J0k1L2m3N4"), true, "Debe validar Session IDs reales de Stripe Checkout");
const scrubbedVid = paSandbox.scrubVideoBytesInPlace(new TextEncoder().encode("ftypmp42...C2PA...Sora...trainedAlgorithmicMedia"));
const scrubbedVidStr = new TextDecoder("latin1").decode(scrubbedVid);
assert(!/c2pa|sora|trainedalgorithmicmedia/i.test(scrubbedVidStr), "scrubVideoBytesInPlace debe limpiar firmas C2PA/Sora sin importar mayúsculas/minúsculas");
assert(!cleanAiHtml.includes("3cI28s2no0Yt6Du5j400008") && !cleanAiHtml.includes("9B6aEY4vwgXre5W7rc0000b"), "El Pase 24h (1,99€) y Licencia Vitalicia (179€) deben eliminarse para evitar canibalización del MRR");

// 8. Verificar sincronización entre index.html y clean-ai-studio.html, saneamiento de las páginas SEO de IA y que sitemap.xml / sitemap.txt usen el dominio pureaistudios.com (100% solo lectura)
const indexHtmlContent = fs.readFileSync(path.join(__dirname, "index.html"), "utf8");
assert.strictEqual(indexHtmlContent, cleanAiHtml, "index.html debe estar 100% sincronizado con clean-ai-studio.html");
const NON_AI_FINANCE_PATTERN = /^(cfo-control-financiero|cuota-hipoteca|regla-50-30-20|sueldo-neto-autonomo|indemnizacion-despido|invertir-|reclamar-|recurrir-multa|calculadora-irav|calculadoras-PureAI Studio|calcular-finiquito|codigo-promocional-bitget|como-declarar-criptomonedas|cuanto-queda-neto-autonomo|gestor-renta-ia|invitacion-revolut|laboral-ia|modelo-burofax|multas-dgt-ia|producto-digital-pro|reclamaciones-ia|simulador-declaracion-renta|subida-alquiler|verifactu|xrechnung|e-rechnung|generateur-factur|generador-facturas|peppol-ubl|panel-reclutamiento|kit-marca-canal)/i;
const SITE_CANONICAL = "https://pureaistudios.com";
const aiFiles = fs.readdirSync(__dirname).filter(f => f.endsWith(".html") && !f.startsWith("google") && !NON_AI_FINANCE_PATTERN.test(f)).sort();

const cleanSitemapXml = fs.readFileSync(path.join(__dirname, "sitemap.xml"), "utf8");
assert(!cleanSitemapXml.includes("revienta32.github.io") && !cleanSitemapXml.includes("cuota-hipoteca"), "sitemap.xml debe usar exclusivamente pureaistudios.com y excluir calculadoras hipotecarias");
assert(!cleanAiHtml.includes("59 €") && cleanAiHtml.includes("39 €") && cleanAiHtml.includes("3,25 €/mes"), "clean-ai-studio.html debe mostrar el plan anual a 39 €/año (3,25 €/mes) y nunca 59 €");

// 9. Verificar Sistema de Control Financiero CFO (aislado en bóveda privada fuera del directorio web público) en VM E2E
const PRIV_OPS_DIR = path.join(process.env.USERPROFILE || process.env.HOME || __dirname, ".gemini", "pureai-private-ops");
const cfoPath = path.join(PRIV_OPS_DIR, "cfo-control-financiero.html");
assert(!fs.existsSync(path.join(__dirname, "cfo-control-financiero.html")), "cfo-control-financiero.html debe estar fuera de la carpeta web pública");
assert(!fs.existsSync(path.join(__dirname, ".env")), ".env debe estar aislado fuera de la carpeta web pública");
if (fs.existsSync(cfoPath)) {
  const cfoHtml = fs.readFileSync(cfoPath, "utf8");
  assert(cfoHtml.includes('http-equiv="Content-Security-Policy"'), "APP-03: cfo-control-financiero.html debe incluir meta Content-Security-Policy");
  const cfoScript = cfoHtml.split("<script>")[1].split("</script>")[0];
  const cfoEls = {};
  function getCfoEl(id) {
    if (!cfoEls[id]) {
      cfoEls[id] = { id, value: "", textContent: "", innerHTML: "", style: {} };
    }
    return cfoEls[id];
  }
  const cfoSandbox = {
    console, Math, Number, String, Date, Array, Object, JSON, parseFloat,
    Blob: paSandbox.Blob,
    URL: paSandbox.URL,
    localStorage: { _s: {}, getItem(k) { return this._s[k] || null; }, setItem(k, v) { this._s[k] = String(v); }, removeItem(k) { delete this._s[k]; } },
    document: { getElementById: (id) => getCfoEl(id), createElement: (t) => getCfoEl("tag-" + t) },
    alert() {}
  };
  vm.createContext(cfoSandbox);
  vm.runInContext(cfoScript, cfoSandbox);

  // 9a. Verificar que las suscripciones anuales imputan 1/12 al MRR y las licencias vitalicias/pases puntuales imputan 0 € al MRR
  const annualMetrics = cfoSandbox.computeTransactionMetrics({ gross: 39, vatPct: 0, stripeFee: 1.23, affPct: 0, varCost: 0, status: "COBRADO", type: "VENTA_ANUAL" });
  assert(Math.abs(annualMetrics.mrrContribution - (39 / 12)) < 0.01, "Suscripción anual debe imputar exactamente 1/12 de la base al MRR");
  const lifetimeMetrics = cfoSandbox.computeTransactionMetrics({ gross: 179, vatPct: 0, stripeFee: 4.73, affPct: 0, varCost: 0, status: "COBRADO", type: "VENTA_VITALICIA" });
  assert.strictEqual(lifetimeMetrics.mrrContribution, 0, "Licencia vitalicia no debe inflar el MRR");

  // 9b. Verificar bloqueo de doble contabilidad por ID de Stripe duplicado
  assert.strictEqual(cfoSandbox.registerFinancialTransaction({ date: "2026-11-01", ref: "cs_live_unique_001", type: "VENTA_MENSUAL", product: "PRO_MENSUAL_STD", country: "ES", gross: 9.99, vatPct: 21, stripeFee: 0.5, affPct: 0, varCost: 0, status: "COBRADO" }), true, "Primera transacción con ID único debe registrarse");
  assert.strictEqual(cfoSandbox.registerFinancialTransaction({ date: "2026-11-01", ref: "cs_live_unique_001", type: "VENTA_MENSUAL", product: "PRO_MENSUAL_STD", country: "ES", gross: 9.99, vatPct: 21, stripeFee: 0.5, affPct: 0, varCost: 0, status: "COBRADO" }), false, "Segunda transacción con el mismo ID de Stripe debe ser bloqueada para evitar doble contabilidad");

  // 9c. Verificar cálculo de Punto de Equilibrio y Simulador a 12 meses
  const beModel = cfoSandbox.calculateBreakEvenModel(15, 9.99, 21, 0);
  assert(beModel.requiredClients >= 2 && beModel.requiredClients <= 3, "El punto de equilibrio para 15€ de gastos fijos con plan de 9,99€ (IVA 21%) debe ser de 2 a 3 clientes");
  const sim12 = cfoSandbox.run12MonthSimulation();
  assert.strictEqual(sim12.length, 12, "El simulador financiero debe proyectar exactamente 12 meses");
}

// 10. SUITE DE 12 PRUEBAS OBLIGATORIAS DE PAGOS, WEBHOOKS, SUSCRIPCIONES Y ANTIFRAUDE
const crypto = require("crypto");
const webhookEngine = require("./stripe-webhook-worker.js");
const wStore = webhookEngine.createWebhookProcessorStore();
const baseNow = 1793430000000;

// Test 1: Compra correcta (checkout.session.completed pagado + atribución de afiliado sobre neto)
const resBuy = webhookEngine.processStripeWebhookEvent(wStore, {
  id: "evt_buy_001",
  type: "checkout.session.completed",
  created: 1000,
  data: { object: { customer: "cus_test_1", payment_status: "paid", amount_total: 1209, total_details: { amount_tax: 210 }, stripe_fee_cents: 55, client_reference_id: "aff_partner1", charge_id: "ch_001" } }
}, baseNow);
assert.strictEqual(resBuy.state, "ACTIVE", "1. Compra correcta debe activar estado ACTIVE");
assert.strictEqual(wStore.affiliateLedger.get("ch_001").commissionCents, Math.round((1209 - 210 - 55) * 0.40), "Afiliado debe cobrar 40% sobre ingreso neto (sin IVA ni comisión Stripe)");

// Test 2: Pago rechazado / incompleto (payment_status !== 'paid')
const resDeclined = webhookEngine.processStripeWebhookEvent(wStore, {
  id: "evt_declined_002",
  type: "checkout.session.completed",
  created: 1001,
  data: { object: { customer: "cus_declined", payment_status: "unpaid" } }
}, baseNow);
assert.strictEqual(resDeclined.state, "PENDING", "2. Pago rechazado/incompleto debe permanecer en PENDING sin acceso Pro");
assert.strictEqual(paSandbox.evaluateSubscriptionAccess({ status: "PENDING" }, baseNow).hasAccess, false, "Estado PENDING no debe tener acceso Pro");

// Test 3: Pago duplicado / retorno de sesión repetido en Frontend
const sessRes1 = paSandbox.processStripeCheckoutReturn("?session_id=cs_live_1234567890abcdefghijklmnop");
const sessRes2 = paSandbox.processStripeCheckoutReturn("?session_id=cs_live_1234567890abcdefghijklmnop");
assert.strictEqual(sessRes1.activated, true, "Primera activación con session_id legítimo debe procesarse");
assert.strictEqual(sessRes2.duplicate, true, "3. Segundo intento con el mismo session_id debe marcarse como duplicado sin re-atribuir venta");

// Test 4: Confirmación tardía / Evento fuera de orden (created anterior al último procesado)
const resStale = webhookEngine.processStripeWebhookEvent(wStore, {
  id: "evt_stale_004",
  type: "customer.subscription.updated",
  created: 500, // Anterior a created: 1000
  data: { object: { customer: "cus_test_1", cancel_at_period_end: true } }
}, baseNow);
assert.strictEqual(resStale.outOfOrder, true, "4. Evento fuera de orden (timestamp antiguo) debe ser ignorado");
assert.strictEqual(wStore.subscriptionsByCustomer.get("cus_test_1").status, "ACTIVE", "Evento antiguo no debe sobrescribir el estado ACTIVE más reciente");

// Test 5: Renovación correcta (invoice.paid extiende periodo)
const newPeriodEndSec = Math.floor((baseNow + 60 * 24 * 3600 * 1000) / 1000);
const resRenew = webhookEngine.processStripeWebhookEvent(wStore, {
  id: "evt_renew_005",
  type: "invoice.paid",
  created: 2000,
  data: { object: { customer: "cus_test_1", period_end: newPeriodEndSec } }
}, baseNow);
assert.strictEqual(resRenew.state, "ACTIVE", "5. Renovación correcta debe mantener estado ACTIVE");
assert.strictEqual(wStore.subscriptionsByCustomer.get("cus_test_1").expiresAt, newPeriodEndSec * 1000, "Renovación debe actualizar expiresAt");

// Test 6: Renovación fallida (invoice.payment_failed entra en PAST_DUE con 72h de gracia sin revocar acceso inmediato)
const resFailRenew = webhookEngine.processStripeWebhookEvent(wStore, {
  id: "evt_fail_006",
  type: "invoice.payment_failed",
  created: 2500,
  data: { object: { customer: "cus_test_1" } }
}, baseNow);
assert.strictEqual(resFailRenew.state, "PAST_DUE", "6. Fallo de renovación debe cambiar a PAST_DUE");
const graceCheckInside = paSandbox.evaluateSubscriptionAccess(wStore.subscriptionsByCustomer.get("cus_test_1"), baseNow + 24 * 3600 * 1000);
const graceCheckExpired = paSandbox.evaluateSubscriptionAccess(wStore.subscriptionsByCustomer.get("cus_test_1"), baseNow + 96 * 3600 * 1000);
assert.strictEqual(graceCheckInside.hasAccess, true, "No debe revocar el acceso en las primeras 72h de gracia tras fallo aislado de renovación");
assert.strictEqual(graceCheckExpired.hasAccess, false, "Debe revocar acceso cuando expiran las 72h de gracia sin pago");

// Test 7: Cancelación al final del periodo (CANCELED_AT_PERIOD_END conserva acceso hasta fin de ciclo)
const endCycleSec = Math.floor((baseNow + 10 * 24 * 3600 * 1000) / 1000);
webhookEngine.processStripeWebhookEvent(wStore, {
  id: "evt_cancel_007",
  type: "customer.subscription.updated",
  created: 3000,
  data: { object: { customer: "cus_test_1", cancel_at_period_end: true, current_period_end: endCycleSec } }
}, baseNow);
const cancelBeforeEnd = paSandbox.evaluateSubscriptionAccess(wStore.subscriptionsByCustomer.get("cus_test_1"), baseNow + 5 * 24 * 3600 * 1000);
const cancelAfterEnd = paSandbox.evaluateSubscriptionAccess(wStore.subscriptionsByCustomer.get("cus_test_1"), baseNow + 11 * 24 * 3600 * 1000);
assert.strictEqual(cancelBeforeEnd.hasAccess, true, "7. Suscripción cancelada al final del periodo debe conservar acceso durante los días ya pagados");
assert.strictEqual(cancelAfterEnd.hasAccess, false, "Suscripción cancelada debe revocar acceso tras superar current_period_end");

// Test 8: Reembolso (charge.refunded revoca acceso inmediato y anula comisión de afiliado)
webhookEngine.processStripeWebhookEvent(wStore, {
  id: "evt_refund_008",
  type: "charge.refunded",
  created: 3500,
  data: { object: { customer: "cus_test_1" } }
}, baseNow);
assert.strictEqual(paSandbox.evaluateSubscriptionAccess(wStore.subscriptionsByCustomer.get("cus_test_1"), baseNow).hasAccess, false, "8. Reembolso debe revocar el acceso Pro inmediatamente");
assert.strictEqual(wStore.affiliateLedger.get("ch_001").commissionCents, 0, "Reembolso debe anular (clawback) la comisión del afiliado");

// Test 9: Contracargo / Disputa (charge.dispute.created suspende cuenta inmediatamente)
webhookEngine.processStripeWebhookEvent(wStore, {
  id: "evt_dispute_009",
  type: "charge.dispute.created",
  created: 4000,
  data: { object: { customer: "cus_test_1" } }
}, baseNow);
assert.strictEqual(wStore.subscriptionsByCustomer.get("cus_test_1").status, "DISPUTED", "9. Contracargo debe marcar estado DISPUTED");
assert.strictEqual(paSandbox.evaluateSubscriptionAccess(wStore.subscriptionsByCustomer.get("cus_test_1"), baseNow).hasAccess, false, "Contracargo debe bloquear acceso inmediatamente");

// Test 10: Webhook repetido + Verificación criptográfica de firma Stripe-Signature
const dupWebhook = webhookEngine.processStripeWebhookEvent(wStore, { id: "evt_buy_001", type: "checkout.session.completed", created: 1000, data: {} }, baseNow);
assert.strictEqual(dupWebhook.duplicate, true, "10. Webhook repetido con el mismo event.id debe ser rechazado por idempotencia");
const testSecret = "whsec_test_secret_2026";
const testPayload = JSON.stringify({ id: "evt_sig_test", type: "invoice.paid" });
const validSig = crypto.createHmac("sha256", testSecret).update(`1700000000.${testPayload}`).digest("hex");
assert.strictEqual(webhookEngine.verifyStripeWebhookSignature(testPayload, `t=1700000000,v1=${validSig}`, testSecret, 1700000050).valid, true, "Firma HMAC-SHA256 válida dentro de ventana de 300s debe ser aceptada");
assert.strictEqual(webhookEngine.verifyStripeWebhookSignature(testPayload, `t=1700000000,v1=${validSig}`, testSecret, 1700000900).valid, false, "Ataque replay fuera de ventana de 300s debe ser rechazado");

// Test 11: Manipulación de parámetros URL (?pro_activated=true y ?partner_vip=1 bloqueados)
assert.strictEqual(paSandbox.processStripeCheckoutReturn("?pro_activated=true&partner_vip=1").activated, false, "11. Manipulación de URL ?pro_activated=true o ?partner_vip=1 debe ser bloqueada");
assert.strictEqual(paSandbox.processStripeCheckoutReturn("?session_id=fake_123").activated, false, "session_id manipulado debe ser rechazado");

// Test 12: Acceso no autorizado, bloqueo de auto-referido y enmascaramiento de PII en telemetría
const selfRefCheck = webhookEngine.calculateAffiliateNetCommission(999, 0, 50, "jorgeia", "jorge@domain.com", "JORGE@domain.com");
assert.strictEqual(selfRefCheck.eligible, false, "12. Auto-referido (mismo email comprador y afiliado) debe ser bloqueado");
assert(!paSandbox.maskSensitiveTelemetryValue("cliente@empresa.com").includes("cliente@empresa.com"), "Los emails deben enviarse enmascarados al bus público de telemetría");
assert(!paSandbox.maskSensitiveTelemetryValue("PRO-ABCD-EFGH").includes("ABCD"), "Las claves Pro deben enviarse enmascaradas al bus público de telemetría");

// 11. Verificar Cumplimiento Normativo Preliminar (privacy-policy.html, terms.html y cláusulas precontractuales)
const privHtml = fs.readFileSync(path.join(__dirname, "privacy-policy.html"), "utf8");
const termsHtml = fs.readFileSync(path.join(__dirname, "terms.html"), "utf8");
assert(!privHtml.includes("Zero Data Collection") && !privHtml.includes("Merchant of Record"), "privacy-policy.html no debe contener afirmaciones falsas de 'Zero Data Collection' ni 'Merchant of Record'");
assert(privHtml.includes("Reglamento (UE) 2016/679") && privHtml.includes("ARSOPOL"), "privacy-policy.html debe detallar bases jurídicas RGPD y derechos ARSOPOL");
assert(termsHtml.includes("103.m") && termsHtml.includes("1202") && termsHtml.includes("30 días"), "terms.html debe incluir cláusula Art. 103.m TRLGDCU, prohibición de eliminación ilícita de CMI y reglas de afiliados a 30 días sobre neto");
assert(cleanAiHtml.includes("terms.html") && cleanAiHtml.includes("Art. 103.m TRLGDCU"), "clean-ai-studio.html debe enlazar a terms.html y mostrar información precontractual de suscripción y desistimiento");

// 12. Pruebas Técnicas de Gobernanza IA, Integridad de Formato (PNG/WebP vs JPEG) y Preservación de mdat en MP4
(async () => {
  // 12a. Verificar que un archivo PNG (0x89 0x50 0x4E 0x47) NO sea corrompido con cabeceras JPEG (0xFF 0xD8)
  const pngFakeBytes = new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
  const pngBlob = new paSandbox.Blob([pngFakeBytes]);
  pngBlob.type = "image/png";
  const outPng = await paSandbox.injectCameraExifIntoBlob(pngBlob, "spoof");
  assert.strictEqual(outPng._bytes[0], 0x89, "Un contenedor PNG jamás debe ser sobrescrito con bytes mágicos JPEG 0xFFD8");

  // 12b. Verificar que un archivo JPEG legítimo (0xFF 0xD8) sí reciba el bloque EXIF APP1 (0xFF 0xE1) cuando se solicita
  const jpgFakeBytes = new Uint8Array([0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10, 0xff, 0xd9]);
  const jpgBlob = new paSandbox.Blob([jpgFakeBytes]);
  jpgBlob.type = "image/jpeg";
  const outJpg = await paSandbox.injectCameraExifIntoBlob(jpgBlob, "spoof");
  assert.strictEqual(outJpg._bytes[0], 0xff, "El contenedor JPEG debe iniciar con 0xFF");
  assert.strictEqual(outJpg._bytes[2], 0xff, "El segundo marcador tras SOI en JPEG con perfil técnico debe ser APP1 (0xFFE1)");
  assert.strictEqual(outJpg._bytes[3], 0xe1, "El marcador APP1 debe ser 0xE1");

  // 12c. Verificar que scrubVideoBytesInPlace protege los bytes dentro del átomo 'mdat' (vídeo comprimido) mientras limpia metadatos fuera de 'mdat'
  const metaBox = Buffer.from([0x00, 0x00, 0x00, 0x10, 0x75, 0x75, 0x69, 0x64, ...Buffer.from("c2paSora")]); // 16-byte uuid box with "c2paSora"
  const mdatBox = Buffer.from([0x00, 0x00, 0x00, 0x10, 0x6d, 0x64, 0x61, 0x74, ...Buffer.from("SoraPika")]); // 16-byte mdat box with frame bytes matching "SoraPika"
  const mp4Sample = new Uint8Array(Buffer.concat([metaBox, mdatBox]));
  const cleanedMp4 = paSandbox.scrubVideoBytesInPlace(mp4Sample);
  const metaSliceStr = Buffer.from(cleanedMp4.slice(8, 16)).toString("latin1");
  const mdatSliceStr = Buffer.from(cleanedMp4.slice(24, 32)).toString("latin1");
  assert.strictEqual(metaSliceStr.trim(), "", "Los marcadores C2PA/Sora en cajas de metadatos fuera de mdat deben limpiarse");
  assert.strictEqual(mdatSliceStr, "SoraPika", "Los bytes comprimidos de vídeo dentro del átomo mdat jamás deben alterarse");

  // 12d. Verificar que el informe técnico no afirme falsamente '100% Human & Clean Media Certificate'
  assert(!cleanAiHtml.includes("100% Human &amp; Clean Media Certificate"), "El informe técnico no debe afirmar que certifica autoría biológica humana");
  assert(cleanAiHtml.includes('<option value="pure" selected>'), "El modo predeterminado debe ser Limpieza Neutra (pure)");

  // 13. Pruebas automatizadas del Sistema de Automatización SaaS, Clasificador de Soporte (8 categorías), Guardrails y Conciliación (auto-doctor.js)
  const autoDoctor = require("./auto-doctor.js");

  // 13a. Verificar las 8 categorías del clasificador de soporte y el control de escalado humano
  const caseVuln = autoDoctor.classifySupportInquiry("He encontrado una vulnerabilidad XSS y un exploit de bypass en vuestra web");
  assert.strictEqual(caseVuln.category, autoDoctor.SUPPORT_CATEGORIES.SECURITY_VULNERABILITY, "Debe clasificar reporte de exploit como SECURITY_VULNERABILITY");
  assert.strictEqual(caseVuln.requiresHumanApproval, true, "Vulnerabilidades de seguridad requieren revisión humana obligatoria");
  assert.strictEqual(caseVuln.autoSendAllowed, false, "Vulnerabilidades no deben auto-enviarse sin supervisión");

  const casePrivacy = autoDoctor.classifySupportInquiry("Ejerzo mi derecho de supresión RGPD y solicito borrar mis datos personales");
  assert.strictEqual(casePrivacy.category, autoDoctor.SUPPORT_CATEGORIES.PRIVACY, "Debe clasificar solicitud RGPD como PRIVACY");
  assert.strictEqual(casePrivacy.requiresHumanApproval, true, "Solicitudes de privacidad requieren revisión humana obligatoria");
  assert.strictEqual(casePrivacy.autoSendAllowed, false, "Solicitudes RGPD no deben responderse automáticamente sin revisión");

  const caseRefund = autoDoctor.classifySupportInquiry("Quiero solicitar un reembolso y devolución de mi dinero porque voy a abrir disputa");
  assert.strictEqual(caseRefund.category, autoDoctor.SUPPORT_CATEGORIES.REFUND_REQUEST, "Debe clasificar solicitud de devolución como REFUND_REQUEST");
  assert.strictEqual(caseRefund.requiresHumanApproval, true, "Solicitudes de reembolso requieren revisión humana obligatoria");
  assert.strictEqual(caseRefund.autoSendAllowed, false, "Conflictos económicos no deben auto-enviarse sin validación humana");

  const casePayment = autoDoctor.classifySupportInquiry("Tengo un cargo duplicado en mi tarjeta de crédito y necesito la factura con IVA");
  assert.strictEqual(casePayment.category, autoDoctor.SUPPORT_CATEGORIES.PAYMENT, "Debe clasificar incidencia de cobro/factura como PAYMENT");
  assert.strictEqual(casePayment.requiresHumanApproval, true, "Incidencias de cobro requieren verificación humana en Stripe");
  assert.strictEqual(casePayment.autoSendAllowed, false, "Incidencias de cobro no deben auto-enviarse sin validar el pago");

  const caseProAccess = autoDoctor.classifySupportInquiry("No funciona mi código de licencia PRO-A1B2-C3D4 para activar Pro en otro navegador");
  assert.strictEqual(caseProAccess.category, autoDoctor.SUPPORT_CATEGORIES.PRO_ACCESS, "Debe clasificar duda de licencia como PRO_ACCESS");
  assert.strictEqual(caseProAccess.requiresHumanApproval, false, "FAQ de activación Pro puede responderse con guía verificada");
  assert.strictEqual(caseProAccess.autoSendAllowed, true, "FAQ de activación Pro permite respuesta asistida");
  assert(caseProAccess.draftReply.includes("PRO-XXXX-YYYY"), "El borrador debe explicar el formato de licencia Pro");

  const caseSub = autoDoctor.classifySupportInquiry("Quiero cancelar mi suscripción mensual para dar de baja la renovación automática");
  assert.strictEqual(caseSub.category, autoDoctor.SUPPORT_CATEGORIES.SUBSCRIPTION, "Debe clasificar baja de plan como SUBSCRIPTION");
  assert.strictEqual(caseSub.requiresHumanApproval, false, "FAQ de gestión de suscripción no requiere bloqueo humano");
  assert.strictEqual(caseSub.autoSendAllowed, true, "FAQ de suscripción permite respuesta automática con enlace al portal");

  const caseFeature = autoDoctor.classifySupportInquiry("Tengo una sugerencia para añadir una nueva función de procesamiento por lotes API");
  assert.strictEqual(caseFeature.category, autoDoctor.SUPPORT_CATEGORIES.FEATURE_REQUEST, "Debe clasificar propuesta de mejora como FEATURE_REQUEST");
  assert.strictEqual(caseFeature.requiresHumanApproval, false, "Sugerencias de producto no requieren escalado crítico");
  assert.strictEqual(caseFeature.autoSendAllowed, true, "Sugerencias permiten acuse de recibo automático");

  const caseTech = autoDoctor.classifySupportInquiry("La herramienta se queda cargando al subir un archivo MP4 pesado en mi navegador");
  assert.strictEqual(caseTech.category, autoDoctor.SUPPORT_CATEGORIES.TECHNICAL_ISSUE, "Debe clasificar fallo técnico general como TECHNICAL_ISSUE");
  assert.strictEqual(caseTech.requiresHumanApproval, false, "Soporte técnico nivel 1 permite guía de diagnóstico inicial");
  assert.strictEqual(caseTech.autoSendAllowed, true, "Soporte técnico nivel 1 permite envío de pasos de resolución");

  // 13b. Verificar guardrails inmutables de seguridad operativa
  const blockedPriceChange = autoDoctor.validateAutomatedActionSafety("CHANGE_PRODUCTION_PRICES", false);
  assert.strictEqual(blockedPriceChange.allowed, false, "Ningún agente debe cambiar precios en producción sin aprobación humana");
  const allowedWithHuman = autoDoctor.validateAutomatedActionSafety("CHANGE_PRODUCTION_PRICES", true);
  assert.strictEqual(allowedWithHuman.allowed, true, "Con aprobación humana explícita se desbloquea la acción supervisada");

  // 13c. Verificar conciliación financiera automática e idempotencia ante eventos duplicados
  const digest = autoDoctor.generateAutomatedFinancialDigest([
    { id: "evt_01", type: "SALE_MONTHLY", amountCents: 499, taxCents: 0 },
    { id: "evt_01", type: "SALE_MONTHLY", amountCents: 499, taxCents: 0 }, // Duplicado
    { id: "evt_02", type: "SALE_ANNUAL", amountCents: 5900, taxCents: 0, affiliateId: "partner_01" },
    { id: "evt_03", type: "REFUND", amountCents: 499, taxCents: 0, wasAnnual: false }
  ]);
  assert.strictEqual(digest.duplicateEventsIgnored, 1, "Debe ignorar exactamente 1 evento duplicado por ID");
  assert.strictEqual(digest.activeSubscriptionsCount, 1, "Tras 2 altas y 1 reembolso debe quedar 1 suscripción activa neta");
  assert.strictEqual(digest.normalizedMrrCents, Math.round(5900 / 12), "El MRR en céntimos debe reflejar únicamente la doceava parte del plan anual activo tras el reembolso mensual");
  assert(digest.accountingDisclaimer.includes("NO sustituye los libros contables"), "El informe financiero debe incluir la advertencia contable obligatoria");

  // 13d. Verificar el monitor de salud local de la plataforma
  const healthReport = await autoDoctor.checkPlatformHealth({ skipRemotePing: true });
  assert.strictEqual(healthReport.healthy, true, "La auditoría de salud local de PureAI Studio debe resultar sana (healthy === true)");

  // 14. Pruebas Automatizadas de Ciberseguridad (DOM XSS, Privacidad Técnica ntfy.sh, CSP/Referrer, Extensión Chrome y Secretos/.gitignore)
  // 14a. Verificar bloqueo de DOM XSS (APP-01) al inspeccionar imágenes y vídeos con nombres de archivo maliciosos
  const xssFilename = '"><img src=x onerror=alert(1)>.jpg';
  const xssImgBytes = new Uint8Array([0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10, ...Buffer.from("c2pa"), 0xff, 0xd9]);
  await paSandbox.inspectImageFile({
    name: xssFilename,
    size: xssImgBytes.length,
    type: "image/jpeg",
    arrayBuffer: async () => xssImgBytes.buffer
  });
  const auditHtmlAfterImg = getPaEl("img-audit-log").innerHTML;
  assert(!auditHtmlAfterImg.includes("<img src=x onerror=alert(1)>"), "APP-01: inspectImageFile debe escapar caracteres HTML en file.name para impedir DOM XSS");
  assert(auditHtmlAfterImg.includes("&lt;img src=x onerror=alert(1)&gt;"), "APP-01: El nombre malicioso debe aparecer escapado con entidades HTML seguras");

  const xssVidBytes = new Uint8Array([0x00, 0x00, 0x00, 0x10, 0x66, 0x74, 0x79, 0x70, ...Buffer.from("SoraC2PA")]);
  await paSandbox.inspectVideoFile({
    name: '"><script>alert(1)</script>.mp4',
    size: xssVidBytes.length,
    type: "video/mp4",
    arrayBuffer: async () => xssVidBytes.buffer
  });
  const auditHtmlAfterVid = getPaEl("img-audit-log").innerHTML;
  assert(!auditHtmlAfterVid.includes("<script>alert(1)</script>"), "APP-01: inspectVideoFile debe escapar etiquetas <script> en nombres de vídeo");

  // 14b. Verificar eliminación de polling público ntfy.sh (APP-02) y de envío de fingerprint quota_sync (PRIV-01)
  assert(!cleanAiHtml.includes("ntfy.sh/pureai_studio_ops_telemetry_94c2e1/json?poll=1"), "APP-02: El cliente web no debe descargar el historial público de ntfy.sh");
  assert(!cleanAiHtml.includes('type: "quota_sync"'), "PRIV-01: El cliente web no debe transmitir huellas de dispositivo quota_sync a servidores externos");

  // 14c. Verificar cabeceras meta Content-Security-Policy y Referrer-Policy (APP-03) y validación HTTPS en ?ext_img= (APP-04)
  assert(cleanAiHtml.includes('http-equiv="Content-Security-Policy"'), "APP-03: clean-ai-studio.html debe incluir meta Content-Security-Policy");
  assert(cleanAiHtml.includes('name="referrer" content="strict-origin-when-cross-origin"'), "APP-03: clean-ai-studio.html debe incluir meta Referrer-Policy");
  assert(cleanAiHtml.includes('/^https:\\/\\//i.test(imgUrl)'), "APP-04: ?ext_img= debe restringirse exclusivamente a URLs HTTPS externas seguras");

  // 14d. Verificar seguridad de la Extensión Chrome (EXT-01, EXT-02, EXT-03) y paquete .zip (100% solo lectura)
  const extContentJs = fs.readFileSync(path.join(__dirname, "chrome-extension-pureai", "content-chatgpt.js"), "utf8");
  const extPopupHtml = fs.readFileSync(path.join(__dirname, "chrome-extension-pureai", "popup.html"), "utf8");
  assert(extContentJs.includes("isValidProLicenseCode") && !extContentJs.includes("k.trim().length >= 6"), "EXT-01: La extensión Chrome debe validar el checksum FNV-1a y no aceptar cualquier cadena de 6 caracteres");
  assert(!extContentJs.includes("3cI28s2no0Yt6Du5j400008") && !extPopupHtml.includes("3cI28s2no0Yt6Du5j400008"), "EXT-03: La extensión Chrome no debe ofrecer el Pase 24h eliminado de 1,99€");
  assert(fs.existsSync(path.join(__dirname, "chrome-extension-pureai.zip")), "Debe existir chrome-extension-pureai.zip");

  // 14e. Verificar enmascarado PII en telemetria-soporte.js (PRIV-02) y protección .gitignore (SEC-02)
  assert(telemetriaCode.includes("maskSensitiveSupportText") && !telemetriaCode.includes("3cI28s2no0Yt6Du5j400008"), "PRIV-02: telemetria-soporte.js debe enmascarar PII en reportes y excluir el pase de 1,99€");
  const gitignoreContent = fs.readFileSync(path.join(__dirname, ".gitignore"), "utf8");
  assert(gitignoreContent.includes("creadores-afiliados-crm.json") && gitignoreContent.includes(".env"), "SEC-02: .gitignore debe proteger .env y el CRM interno de creadores");

  // 14f. Verificar endpoint Server-Side handleWorkerHttpRequest (POST /webhook/stripe + GET /verify-license con clave derivada PRO-XXXX-YYYY y reembolso por payment_intent)
  const workerStore = webhookEngine.createWebhookProcessorStore();
  const webhookSecret = "whsec_worker_e2e_secret";
  const nowSec = Math.floor(Date.now() / 1000);
  const sampleEventStr = JSON.stringify({
    id: "evt_srv_01",
    type: "checkout.session.completed",
    created: nowSec,
    data: { object: { id: "cs_live_verified_server_session_999", customer: null, payment_intent: "pi_guest_999", payment_status: "paid", amount_total: 499 } }
  });
  const validSig = crypto.createHmac("sha256", webhookSecret).update(`${nowSec}.${sampleEventStr}`, "utf8").digest("hex");
  const postRes = await webhookEngine.handleWorkerHttpRequest(
    {
      method: "POST",
      url: "https://api.pureaistudios.com/webhook/stripe",
      headers: { get: (k) => (k.toLowerCase() === "stripe-signature" ? `t=${nowSec},v1=${validSig}` : "https://pureaistudios.com") },
      text: async () => sampleEventStr
    },
    { STRIPE_WEBHOOK_SECRET: webhookSecret },
    workerStore
  );
  assert.strictEqual(postRes.status, 200, "POST /webhook/stripe con firma HMAC válida debe responder HTTP 200");

  const derivedProKey = webhookEngine.deriveProKeyFromSession("cs_live_verified_server_session_999");
  assert.strictEqual(paSandbox.deriveProKeyFromSession("cs_live_verified_server_session_999"), derivedProKey, "Cliente y Worker deben derivar exactamente la misma clave PRO-XXXX-YYYY a partir de session_id");
  const verifyByKey = await webhookEngine.handleWorkerHttpRequest(
    {
      method: "GET",
      url: `https://api.pureaistudios.com/verify-license?code=${derivedProKey}`,
      headers: { get: () => "https://pureaistudios.com" }
    },
    {},
    workerStore
  );
  assert.strictEqual(verifyByKey.status, 200, "GET /verify-license para clave PRO-XXXX-YYYY derivada de sesión pagada debe responder HTTP 200");
  assert.strictEqual(JSON.parse(verifyByKey.body).valid, true, "GET /verify-license debe confirmar valid: true para clave PRO-XXXX-YYYY derivada");

  const verifyOk = await webhookEngine.handleWorkerHttpRequest(
    {
      method: "GET",
      url: "https://api.pureaistudios.com/verify-license?code=cs_live_verified_server_session_999",
      headers: { get: () => "https://pureaistudios.com" }
    },
    {},
    workerStore
  );
  assert.strictEqual(verifyOk.status, 200, "GET /verify-license para sesión pagada debe responder HTTP 200");
  assert.strictEqual(JSON.parse(verifyOk.body).valid, true, "GET /verify-license debe confirmar valid: true para sesión verificada en servidor");

  // Reembolso de compra guest (customer: null, resuelto por payment_intent pi_guest_999)
  webhookEngine.processStripeWebhookEvent(workerStore, {
    id: "evt_guest_refund_01",
    type: "charge.refunded",
    created: nowSec + 10,
    data: { object: { customer: null, payment_intent: "pi_guest_999" } }
  }, Date.now());
  const verifyAfterGuestRefund = await webhookEngine.handleWorkerHttpRequest(
    {
      method: "GET",
      url: `https://api.pureaistudios.com/verify-license?code=${derivedProKey}`,
      headers: { get: () => "https://pureaistudios.com" }
    },
    {},
    workerStore
  );
  assert.strictEqual(JSON.parse(verifyAfterGuestRefund.body).valid, false, "Reembolso guest (customer: null, payment_intent: pi_...) debe revocar la clave PRO-XXXX-YYYY derivada");

  const verifyFake = await webhookEngine.handleWorkerHttpRequest(
    {
      method: "GET",
      url: "https://api.pureaistudios.com/verify-license?code=cs_live_forged_browser_session_000",
      headers: { get: () => "https://pureaistudios.com" }
    },
    {},
    workerStore
  );
  assert.strictEqual(verifyFake.status, 404, "GET /verify-license debe rechazar con HTTP 404 un session_id inventado en DevTools");
  assert.strictEqual(JSON.parse(verifyFake.body).valid, false, "GET /verify-license debe devolver valid: false ante sesiones no pagadas en Stripe");

  // 15. Pruebas Automatizadas del Sistema de Analítica de Producto, Embudo de 8 Etapas, Atribución por Herramienta y Decisiones de Viabilidad (Go/Optimize/Kill)
  assert(cleanAiHtml.includes('event_name: "paywall_viewed"'), "clean-ai-studio.html debe instrumentar el evento paywall_viewed dentro de showProModal");
  const estadoEmpresaPath = path.join(PRIV_OPS_DIR, "estado-empresa.json");
  if (fs.existsSync(estadoEmpresaPath)) {
    const estadoEmpresa = JSON.parse(fs.readFileSync(estadoEmpresaPath, "utf8"));
    assert.strictEqual(estadoEmpresa.activeProducts.length, 7, "estado-empresa.json debe inventariar exactamente las 7 herramientas reales de PureAI Studio");
    assert(!JSON.stringify(estadoEmpresa).includes("laboral-ia") && !JSON.stringify(estadoEmpresa).includes("multas-dgt-ia"), "estado-empresa.json no debe incluir antiguas calculadoras laborales o de multas");
  }

  // 15a. Verificar muestra pequeña (INSUFFICIENT_SAMPLE_KEEP_TESTING) y bloqueo de LTV sin datos reales (INSUFFICIENT_DATA)
  const smallSampleEvents = [
    { event_name: "session_start", channel: "organic_search", lang: "en", isReturning: false, cohortWeek: "2026-W44" },
    { event_name: "session_start", channel: "social_reddit", lang: "es", isReturning: true, cohortWeek: "2026-W43" },
    { event_name: "tool_completed", tool_id: "img_c2pa_scrubber", isDemo: true }, // Demo no cuenta como activación real
    { event_name: "tool_completed", tool_id: "img_c2pa_scrubber", isDemo: false }, // Activación real
    { event_name: "paywall_viewed", trigger_tool: "img_c2pa_scrubber" },
    { event_name: "checkout_clicked", plan_selected: "PRO_MONTHLY_499", trigger_tool: "img_c2pa_scrubber" }
  ];
  const funnelSmall = autoDoctor.computeProductAnalyticsFunnel(smallSampleEvents, { founderHours: 10, hourlyShadowCostEur: 15 });
  assert.strictEqual(funnelSmall.stages.visitors, 2, "Debe contabilizar 2 visitantes humanos");
  assert.strictEqual(funnelSmall.stages.returningUsers, 1, "Debe contabilizar 1 usuario recurrente");
  assert.strictEqual(funnelSmall.stages.activatedUsers, 1, "Debe excluir ejecuciones de demostración (isDemo: true) de la tasa de activación real");
  assert.strictEqual(funnelSmall.byTool.img_c2pa_scrubber.demoCompletions, 1, "Debe separar ejecuciones demo de ejecuciones reales en la matriz por herramienta");
  assert.strictEqual(funnelSmall.byTool.img_c2pa_scrubber.realCompletions, 1, "Debe registrar 1 ejecución real en img_c2pa_scrubber");
  assert.strictEqual(funnelSmall.cacMetrics.ltvEstimateEur, "INSUFFICIENT_DATA", "El LTV debe mostrarse como INSUFFICIENT_DATA cuando no existen >=30 clientes y >=3 renovaciones");
  assert.strictEqual(funnelSmall.viabilityDecision, "INSUFFICIENT_SAMPLE_KEEP_TESTING", "Con menos de 200 visitas no debe emitir juicios precipitados de cierre");

  // 15b. Verificar señal de PIVOT_OR_KILL cuando se supera el umbral de 1.000 visitantes y 100 vistas de Paywall con 0 ventas
  const killEvents = [];
  for (let i = 0; i < 1050; i++) killEvents.push({ event_name: "session_start", channel: "organic_search", lang: "en" });
  for (let i = 0; i < 300; i++) killEvents.push({ event_name: "tool_completed", tool_id: "img_c2pa_scrubber", isDemo: false });
  for (let i = 0; i < 110; i++) killEvents.push({ event_name: "paywall_viewed", trigger_tool: "img_c2pa_scrubber" });
  const funnelKill = autoDoctor.computeProductAnalyticsFunnel(killEvents);
  assert.strictEqual(funnelKill.viabilityDecision, "PIVOT_OR_KILL", "Con >=1000 visitas, >=100 paywalls y 0 compras debe recomendar PIVOT_OR_KILL");

  // 15c. Verificar señal de GO_SCALE cuando existen compras verificadas y tracción en Paywall/Renovación
  const goEvents = [
    ...smallSampleEvents,
    { event_name: "purchase_verified" },
    { event_name: "purchase_verified" },
    { event_name: "purchase_verified" },
    { event_name: "subscription_renewed" }
  ];
  const funnelGo = autoDoctor.computeProductAnalyticsFunnel(goEvents, { adSpendEur: 0, affiliatePayoutsEur: 6, founderHours: 2, hourlyShadowCostEur: 15 });
  assert.strictEqual(funnelGo.viabilityDecision, "GO_SCALE", "Con >=3 compras verificadas y renovación activa debe recomendar GO_SCALE");
  assert.strictEqual(funnelGo.cacMetrics.cashCacEur, 2, "Cash CAC para 6€ de comisiones entre 3 compras debe ser 2€");
  assert.strictEqual(funnelGo.cacMetrics.fullyLoadedCacEur, 12, "Fully Loaded CAC incluyendo 2h a 15€/h (30€ + 6€ = 36€ / 3) debe ser 12€");

  // 16. AUDITORÍA FINAL DE REGRESIÓN, COMPATIBILIDAD CROSS-MODULE, CASOS LÍMITE (IMAGEN/VÍDEO/METADATOS/TEXTO) Y SANEAMIENTO SEO
  // 16a. Compatibilidad Cross-Module de Licencias (BUG-01): Clave PRO-XXXX-YYYY generada en clean-ai-studio.html debe ser válida en la Extensión Chrome (content-chatgpt.js)
  const extSandbox = {
    localStorage: { getItem: () => null, setItem: () => {} },
    document: { querySelectorAll: () => [] },
    setInterval: () => {}
  };
  vm.createContext(extSandbox);
  // Extraer isValidProLicenseCode de content-chatgpt.js y probar con 10 claves generadas por clean-ai-studio.html
  const extFnMatch = extContentJs.match(/function computeKeyChecksumBlock[\s\S]*?function isValidProLicenseCode[\s\S]*?\n  \}/);
  assert(extFnMatch, "Debe encontrarse isValidProLicenseCode en content-chatgpt.js");
  vm.runInContext(extFnMatch[0], extSandbox);
  for (let kIdx = 0; kIdx < 10; kIdx++) {
    paSandbox.localStorage._s.pureai_pro_key = "";
    const webGeneratedKey = paSandbox.generateMultiDeviceProKey();
    assert.strictEqual(extSandbox.isValidProLicenseCode(webGeneratedKey), true, `BUG-01: La extensión Chrome debe aceptar la clave legítima ${webGeneratedKey} generada por la web`);
  }
  assert.strictEqual(extSandbox.isValidProLicenseCode("PRO-AAAA-BBBB"), false, "La extensión Chrome debe rechazar claves con checksum inválido");

  // 16b. Casos límite de Procesamiento de Imágenes y Vídeos (BUG-07: archivos vacíos 0B, archivos gigantes >150MB, contenedores corruptos)
  const emptyImgRes = await paSandbox.inspectImageFile({ name: "empty.jpg", size: 0, type: "image/jpeg", arrayBuffer: async () => new ArrayBuffer(0) });
  assert.strictEqual(emptyImgRes, false, "BUG-07: inspectImageFile debe rechazar archivos vacíos de 0 bytes");
  assert.strictEqual(getPaEl("btn-scrub-img").disabled, true, "El botón de descarga debe permanecer deshabilitado tras subir una imagen vacía");

  const hugeVidRes = await paSandbox.inspectVideoFile({ name: "huge.mp4", size: 200 * 1024 * 1024, type: "video/mp4", arrayBuffer: async () => new ArrayBuffer(8) });
  assert.strictEqual(hugeVidRes, false, "BUG-07: inspectVideoFile debe rechazar vídeos que excedan el límite seguro de memoria (>150 MB)");

  // 16c. Casos límite de Herramientas de Texto (texto vacío, texto masivo >50KB con marcas Unicode, emojis y caracteres especiales)
  getPaEl("txt-input").value = "";
  paSandbox.analyzeText();
  paSandbox.scrubAiText();
  assert.strictEqual(getPaEl("txt-input").value, "", "Texto vacío no debe provocar errores ni insertar caracteres");

  const longRepeatedBlock = "En conclusión\u202F—\u202Fdatos 🚀 áéíóú ñ ü\u200B. ";
  getPaEl("txt-input").value = longRepeatedBlock.repeat(1200); // >40.000 caracteres
  paSandbox.analyzeText();
  paSandbox.scrubAiText();
  const cleanedLongTxt = getPaEl("txt-input").value;
  assert(!/[\u202F\u200B\u00A0—]/.test(cleanedLongTxt), "Texto masivo (>40KB) debe quedar libre de marcas invisibles U+202F/U+200B y guiones largos");
  assert(cleanedLongTxt.includes("🚀 áéíóú ñ ü"), "El limpiador de texto debe preservar emojis y tildes/eñes intactos");

  // 16d. Verificación de Saneamiento de las Páginas Satélites SEO y Sitemap (BUG-02 y BUG-05)
  assert(!cleanSitemapXml.includes("verifactu") && !cleanSitemapXml.includes("xrechnung") && !cleanSitemapXml.includes("panel-reclutamiento"), "BUG-05: sitemap.xml no debe incluir páginas de facturación electrónica ni paneles internos");
  for (const seoFile of aiFiles) {
    const content = fs.readFileSync(path.join(__dirname, seoFile), "utf8");
    assert(!content.includes("3cI28s2no0Yt6Du5j400008") && !content.includes("1.99 24") && !content.includes("1,99"), `BUG-02: La página ${seoFile} no debe contener enlaces ni referencias al Pase 24h eliminado de 1,99€`);
    assert(content.includes("https://pureaistudios.com/") && !content.includes("revienta32.github.io"), `BUG-02: La página ${seoFile} debe usar el dominio canónico pureaistudios.com`);
    assert(!content.includes('st.innerHTML = "✅ <strong>" + cleanName +') && !content.includes("st.innerHTML = '✅ <strong>' + cleanName +"), `BUG-02: La página ${seoFile} debe escapar cleanName contra DOM XSS tanto en comillas simples como dobles`);
    assert(!content.includes("E-Invoice") && !content.includes("VeriFactu") && !content.includes("XRechnung"), `ARQ-01: La página ${seoFile} no debe mostrar branding ni tarjetas de facturación electrónica (E-Invoice / VeriFactu)`);
    assert(content.includes('http-equiv="Content-Security-Policy"'), `SEC-04: La página ${seoFile} debe incluir meta Content-Security-Policy`);
  }

  // 16e. Verificación de Compatibilidad Cloudflare Workers en wrangler.toml y stripe-webhook-worker.js (BUG-03 / CFG-03)
  const wranglerToml = fs.readFileSync(path.join(__dirname, "wrangler.toml"), "utf8");
  const workerCode = fs.readFileSync(path.join(__dirname, "stripe-webhook-worker.js"), "utf8");
  assert(wranglerToml.includes("nodejs_compat") && wranglerToml.includes("PUREAI_LICENSES_KV"), "BUG-03: wrangler.toml debe incluir compatibility_flags = ['nodejs_compat'] y binding PUREAI_LICENSES_KV");
  assert(workerCode.includes('addEventListener("fetch"'), "BUG-03: stripe-webhook-worker.js debe registrar el listener fetch para Cloudflare Workers");

  // 17. Verificación de Persistencia KV Atómica, Planes Anuales (366d), Revocación Server-Side de Caché Local, Consentimiento Opt-In de Telemetría y SW Offline
  // 17a. Plan Anual (3900 céntimos) asigna 366 días (planInterval: "year") en checkout.session.completed
  const annualStore = webhookEngine.createWebhookProcessorStore();
  const baseNow = 1793400000000;
  const annualRes = webhookEngine.processStripeWebhookEvent(annualStore, {
    id: "evt_annual_3900",
    type: "checkout.session.completed",
    created: Math.floor(baseNow / 1000),
    data: { object: { id: "cs_live_annual_3900_session_abc", customer: "cus_annual_01", payment_status: "paid", amount_total: 3900 } }
  }, baseNow);
  assert.strictEqual(annualRes.subscription.planInterval, "year", "Plan de 39,00 € (3900 céntimos) debe detectarse como anual (year)");
  assert.strictEqual(annualRes.subscription.expiresAt, baseNow + 366 * 24 * 3600 * 1000, "Plan anual debe asignar 366 días de vigencia");

  // 17b. Fallo en KV.put NO debe marcar el evento como procesado en memoria (permite reintento limpio de Stripe) y KV hidrata estado entre instancias
  const kvStoreMap = new Map();
  let simulateKvFailure = true;
  const mockKvEnv = {
    STRIPE_WEBHOOK_SECRET: webhookSecret,
    PUREAI_LICENSES_KV: {
      async get(k) { return kvStoreMap.get(k) || null; },
      async put(k, v) {
        if (simulateKvFailure) throw new Error("Simulated KV write failure");
        kvStoreMap.set(k, v);
      }
    }
  };
  const atomicStore = webhookEngine.createWebhookProcessorStore();
  const rawKvTestBody = JSON.stringify({
    id: "evt_kv_atomic_01",
    type: "checkout.session.completed",
    created: nowSec,
    data: { object: { id: "cs_live_kv_atomic_session_1234567890", customer: "cus_kv_01", payment_status: "paid", amount_total: 499 } }
  });
  const kvTestHmac = crypto.createHmac("sha256", webhookSecret).update(`${nowSec}.${rawKvTestBody}`, "utf8").digest("hex");
  const failedKvResp = await webhookEngine.handleWorkerHttpRequest(
    {
      method: "POST",
      url: "https://api.pureaistudios.com/webhook/stripe",
      headers: { get: (h) => (h.toLowerCase() === "stripe-signature" ? `t=${nowSec},v1=${kvTestHmac}` : "https://pureaistudios.com") },
      text: async () => rawKvTestBody
    },
    mockKvEnv,
    atomicStore
  );
  assert.strictEqual(failedKvResp.status, 500, "Si KV.put falla, el Worker debe devolver HTTP 500 para que Stripe reintente");
  assert.strictEqual(atomicStore.processedEventIds.has("evt_kv_atomic_01"), false, "Si KV.put falla, el evento NO debe marcarse como procesado en memoria");

  // Reintentar con KV operativo y verificar hidratación en una nueva instancia de memoria vacía
  simulateKvFailure = false;
  const retryKvResp = await webhookEngine.handleWorkerHttpRequest(
    {
      method: "POST",
      url: "https://api.pureaistudios.com/webhook/stripe",
      headers: { get: (h) => (h.toLowerCase() === "stripe-signature" ? `t=${nowSec},v1=${kvTestHmac}` : "https://pureaistudios.com") },
      text: async () => rawKvTestBody
    },
    mockKvEnv,
    atomicStore
  );
  assert.strictEqual(retryKvResp.status, 200, "El reintento con KV operativo debe completarse con HTTP 200");
  assert.strictEqual(JSON.parse(retryKvResp.body).duplicate, false, "El reintento tras un fallo previo de KV debe procesarse como nuevo, no como duplicado");

  const freshInstanceStore = webhookEngine.createWebhookProcessorStore();
  const dupAcrossInstanceResp = await webhookEngine.handleWorkerHttpRequest(
    {
      method: "POST",
      url: "https://api.pureaistudios.com/webhook/stripe",
      headers: { get: (h) => (h.toLowerCase() === "stripe-signature" ? `t=${nowSec},v1=${kvTestHmac}` : "https://pureaistudios.com") },
      text: async () => rawKvTestBody
    },
    mockKvEnv,
    freshInstanceStore
  );
  assert.strictEqual(JSON.parse(dupAcrossInstanceResp.body).duplicate, true, "Una nueva instancia del Worker sin memoria previa debe detectar el evento duplicado leyendo evt: desde KV");

  // 17c. Verificación Server-Side en cliente (verifyLicenseWithServer) revoca licencias locales falsas cuando el servidor devuelve 404
  paSandbox.fetch = async () => ({
    status: 404,
    headers: { get: () => "application/json" },
    json: async () => ({ valid: false, status: "PENDING", reason: "license_not_found" })
  });
  getPaEl("pa-pro-code").value = "PRO-ABCD-" + paSandbox.computeKeyChecksumBlock("ABCD");
  paSandbox.activatePureAiPro();
  const srvCheckForged = await paSandbox.verifyLicenseWithServer(getPaEl("pa-pro-code").value, "https://api.pureaistudios.com/verify-license");
  assert.strictEqual(srvCheckForged.valid, false, "verifyLicenseWithServer debe invalidar una clave PRO- generada localmente que no exista en KV del servidor");
  assert.strictEqual(paSandbox.evaluateSubscriptionAccess(paSandbox.loadStoredSubscriptionRecord(), Date.now()).hasAccess, false, "Tras respuesta 404 del servidor, evaluateSubscriptionAccess debe denegar acceso (hasAccess === false)");
  assert.strictEqual(paSandbox.localStorage.getItem("pureai_studio_pro"), null, "Tras respuesta 404 del servidor, pureai_studio_pro debe eliminarse de localStorage");

  // 17d. Verificar minimización de telemetría (sin User-Agent ni deviceFp), textos legales sin marcadores pendientes y Service Worker v4
  assert(!telemetriaCode.includes("navigator.userAgent"), "telemetria-soporte.js no debe recopilar ni enviar navigator.userAgent");
  assert(telemetriaCode.includes("hasTelemetryConsent"), "telemetria-soporte.js debe exigir consentimiento opt-in antes de enviar telemetría externa");
  const privPolicyCurrent = fs.readFileSync(path.join(__dirname, "privacy-policy.html"), "utf8");
  const termsCurrent = fs.readFileSync(path.join(__dirname, "terms.html"), "utf8");
  assert(!privPolicyCurrent.includes("[NOMBRE COMPLETO") && !termsCurrent.includes("[NOMBRE COMPLETO"), "privacy-policy.html y terms.html no deben contener marcadores de borrador sin completar");
  const swCurrent = fs.readFileSync(path.join(__dirname, "sw.js"), "utf8");
  assert(swCurrent.includes("pureai-studio-v5") && swCurrent.includes('e.request.mode === "navigate"'), "sw.js debe implementar caché v5 con soporte de navegación offline y revalidación");

  // 17e. Verificar Cuota Gratuita de 1 Foto/Vídeo Gratis (MAX_FREE_IMG_USES = 1) y 1 prueba de texto corto (<=180 palabras) en deepHumanizePro
  assert.strictEqual(paSandbox.MAX_FREE_IMG_USES, 1, "CRO: MAX_FREE_IMG_USES debe ser exactamente 1 exportación gratuita");
  paSandbox.isPureAiPro = false;
  paSandbox.freeProCredits = 0;
  paSandbox.persistImgQuota(1); // Simular que ya gastó su 1ª exportación gratuita
  paSandbox.loadedImgElement = { naturalWidth: 64, naturalHeight: 64 };
  paSandbox.loadedImgFile = { name: "user-photo.jpg", size: 2048, type: "image/jpeg" };
  paSandbox.loadedIsVideo = false;
  getPaEl("img-defense").value = "pure";
  getPaEl("img-gps-city").value = "none";
  getPaEl("pro-modal-overlay").style.display = "none";
  paSandbox.scrubAndDownloadImage();
  assert.strictEqual(getPaEl("pro-modal-overlay").style.display, "flex", "PLG: La 2ª foto incluso en Limpieza Neutra sin Pack/Pro debe mostrar el modal Pro");

  getPaEl("pro-modal-overlay").style.display = "none";
  getPaEl("img-defense").value = "spoof";
  paSandbox.scrubAndDownloadImage();
  assert.strictEqual(getPaEl("pro-modal-overlay").style.display, "flex", "PLG: El 2º uso con perfil EXIF Pro (iPhone 16 Pro) sin Pack/Pro debe mostrar el modal Pro");

  getPaEl("pro-modal-overlay").style.display = "none";
  paSandbox.localStorage.removeItem("pureai_plg_short_txt_tried");
  getPaEl("txt-input").value = "En conclusión\u202F—\u202Fes importante recordar que este párrafo corto prueba el humanizador.";
  paSandbox.deepHumanizePro();
  assert.strictEqual(paSandbox.localStorage.getItem("pureai_plg_short_txt_tried"), "1", "PLG: El 1er uso de texto corto (<=180 palabras) en deepHumanizePro debe permitirse gratis");
  assert.strictEqual(getPaEl("pro-modal-overlay").style.display, "none", "PLG: El 1er uso de texto corto no debe bloquearse con el modal Pro");

  paSandbox.deepHumanizePro();
  assert.strictEqual(getPaEl("pro-modal-overlay").style.display, "flex", "PLG: El 2º uso de deepHumanizePro sin Pro ni créditos debe mostrar el modal Pro");

  // 17f. Verificar mejoras de conversión y valor técnico: EXIF visible fuera de <details>, Sub-IFD GPS binario (0x8825), vídeo en cuota Pro y anti-fuga de créditos en WhatsApp
  assert(!cleanAiHtml.includes('<summary style="cursor:pointer;font-size:0.78rem;color:#94a3b8;font-weight:700;" id="ui-adv-img">'), "UX: El selector de perfiles EXIF (#ui-adv-img) debe estar visible en la tarjeta principal y no oculto en un <summary>");
  getPaEl("img-gps-city").value = "madrid";
  const exifWithGps = paSandbox.buildCameraApp1ExifSegment("spoof");
  const exifDv = new DataView(exifWithGps.buffer, exifWithGps.byteOffset, exifWithGps.byteLength);
  let foundGpsPointerTag = false;
  const ifdCount = exifDv.getUint16(18, true);
  for (let idx = 0; idx < ifdCount; idx++) {
    const tagId = exifDv.getUint16(20 + idx * 12, true);
    if (tagId === 0x8825) foundGpsPointerTag = true;
  }
  assert.strictEqual(foundGpsPointerTag, true, "EXIF GPS: buildCameraApp1ExifSegment debe inyectar el tag binario 0x8825 (GPSInfo IFD Pointer) cuando se selecciona una ciudad");
  getPaEl("img-gps-city").value = "none";

  getPaEl("pro-modal-overlay").style.display = "none";
  getPaEl("img-defense").value = "pure";
  paSandbox.loadedIsVideo = true;
  paSandbox.persistImgQuota(1);
  paSandbox.scrubAndDownloadImage();
  assert.strictEqual(getPaEl("pro-modal-overlay").style.display, "flex", "PLG Vídeo: El 2º uso de limpieza de vídeo (.MP4/.MOV) sin Pack/Pro debe mostrar el modal Pro");
  paSandbox.loadedIsVideo = false;

  paSandbox.freeProCredits = 0;
  paSandbox.refFriendsCount = 0;
  paSandbox.sharePureAiReferral("wa");
  assert.strictEqual(paSandbox.freeProCredits, 0, "Anti-fuga PLG: sharePureAiReferral no debe regalar créditos Pro gratis solo por hacer clic en el botón sin verificación");

  paSandbox.applyCreatorPreset("iphone_agency");
  assert.strictEqual(getPaEl("img-defense").value, "spoof", "ICP Preset: applyCreatorPreset('iphone_agency') debe seleccionar perfil iPhone 16 Pro (spoof)");
  assert.strictEqual(getPaEl("img-gps-city").value, "miami", "ICP Preset: applyCreatorPreset('iphone_agency') debe preseleccionar ciudad GPS por defecto");
  paSandbox.applyCreatorPreset("sony_studio");
  assert.strictEqual(getPaEl("img-defense").value, "spoof_sony", "ICP Preset: applyCreatorPreset('sony_studio') debe seleccionar perfil Sony Alpha A7 IV");
  paSandbox.applyCreatorPreset("photoshop_lossless");
  assert.strictEqual(getPaEl("img-defense").value, "lossless", "ICP Preset: applyCreatorPreset('photoshop_lossless') debe seleccionar modo Lossless JPEG para fotógrafos con Photoshop C2PA");
  paSandbox.applyCreatorPreset("pure_clean");
  assert.strictEqual(getPaEl("img-defense").value, "pure", "ICP Preset: applyCreatorPreset('pure_clean') debe restaurar modo Limpieza Neutra");

  // 17g. Verificar las 3 mejoras competitivas: Lossless JPEG Stripper, MP4 Camera Atom Injection + UUID Box Wipe, y Extractor de Prompts Expuestos
  const fakeJpegWithApp1AndSos = new Uint8Array([
    0xff, 0xd8, // SOI
    0xff, 0xe1, 0x00, 0x08, 0x45, 0x78, 0x69, 0x66, 0x00, 0x00, // APP1 EXIF (to strip)
    0xff, 0xeb, 0x00, 0x06, 0x63, 0x32, 0x70, 0x61, // APP11 C2PA JUMBF (to strip)
    0xff, 0xdb, 0x00, 0x04, 0x00, 0x10, // DQT (to keep)
    0xff, 0xda, 0x00, 0x04, 0x00, 0x00, 0xaa, 0xbb, 0xff, 0xd9 // SOS + DCT bitstream (to keep 100% lossless)
  ]);
  const losslessOut = paSandbox.stripJpegContainersLossless(fakeJpegWithApp1AndSos);
  const losslessStr = Buffer.from(losslessOut).toString("latin1");
  assert(!/Exif|c2pa/.test(losslessStr), "Lossless JPEG: stripJpegContainersLossless debe eliminar todos los segmentos APP1/APP11 (EXIF/C2PA) sin recodificar");
  assert.strictEqual(losslessOut[losslessOut.length - 4], 0xaa, "Lossless JPEG: stripJpegContainersLossless debe preservar intacto el flujo comprimido tras SOS (0xFFDA)");

  const mp4WithCamera = paSandbox.scrubVideoBytesInPlace(mp4Sample, "spoof");
  const mp4CamStr = Buffer.from(mp4WithCamera).toString("latin1");
  assert(mp4CamStr.includes("udta") && mp4CamStr.includes("iPhone 16 Pro"), "MP4 Camera Atom: scrubVideoBytesInPlace con perfil 'spoof' debe inyectar átomo udta con firma iPhone 16 Pro");

  const promptPreview = paSandbox.extractEmbeddedPromptPreview("PNG...tEXtworkflow: ComfyUI nodes, Midjourney v6.1 hyperrealistic portrait");
  assert(promptPreview.includes("ComfyUI"), "Prompt Extractor: extractEmbeddedPromptPreview debe extraer el fragmento de workflow/prompt expuesto");

  // 17h. Verificar Lote Mixto .ZIP (Fotos + Vídeos .MP4 en un mismo lote), Simplificación REF15/30 -> FRIEND50 y Telemetría por Función
  const mixedBatchEntries = await paSandbox.processMixedBatchToZipEntries(
    [
      { name: "carousel-1.jpg", type: "image/jpeg", arrayBuffer: async () => fakeJpegWithApp1AndSos.buffer },
      { name: "reel-2.mp4", type: "video/mp4", arrayBuffer: async () => mp4Sample.buffer }
    ],
    "spoof",
    "image/jpeg",
    "jpg",
    "miami"
  );
  assert.strictEqual(mixedBatchEntries.length, 2, "Batch Mixto .ZIP: processMixedBatchToZipEntries debe empaquetar tanto fotos (.jpg) como vídeos (.mp4) en el mismo lote");
  assert(mixedBatchEntries[0].name.startsWith("IMG_") && mixedBatchEntries[0].name.endsWith(".JPG"), "Batch Mixto .ZIP: La foto del lote con perfil 'spoof' debe renombrarse como IMG_XXXX.JPG");
  assert(mixedBatchEntries[1].name.startsWith("IMG_") && mixedBatchEntries[1].name.endsWith(".MP4"), "Batch Mixto .ZIP: El vídeo del lote con perfil 'spoof' debe renombrarse como IMG_XXXX.MP4");
  const batchVidStr = Buffer.from(mixedBatchEntries[1].bytes).toString("latin1");
  assert(!/c2paSora/i.test(batchVidStr) && batchVidStr.includes("iPhone 16 Pro"), "Batch Mixto .ZIP: El vídeo dentro del lote debe quedar limpio de C2PA e incluir átomo udta de cámara");
  assert(!cleanAiHtml.includes("REF15") && !cleanAiHtml.includes("REF30") && !cleanAiHtml.includes("FRIEND50"), "Simplificación PLG: Eliminados cupones manuales REF15/REF30/FRIEND50 en favor de precios fijos directos con IVA incluido");
  assert(cleanAiHtml.includes('tool_id: "forensic_certificate"') && cleanAiHtml.includes('"img_batch_zip"'), "Telemetría de Valor: Debe instrumentar eventos anónimos por función para decisiones de producto");

  // 17i. Verificar Retención: Memoria Persistente de Preset EXIF/GPS (saveCurrentCreatorWorkflow / restoreSavedCreatorWorkflow), Prompt PWA en 2º uso y Cohortes D1/W1/M1 + genuineReturn
  paSandbox.applyCreatorPreset("iphone_agency");
  assert.strictEqual(paSandbox.localStorage.getItem("pureai_saved_defense"), "spoof", "Retención: applyCreatorPreset debe persistir pureai_saved_defense en localStorage");
  assert.strictEqual(paSandbox.localStorage.getItem("pureai_saved_city"), "miami", "Retención: applyCreatorPreset debe persistir pureai_saved_city en localStorage");
  getPaEl("img-defense").value = "pure";
  getPaEl("img-gps-city").value = "none";
  const wasRestored = paSandbox.restoreSavedCreatorWorkflow();
  assert.strictEqual(wasRestored, true, "Retención: restoreSavedCreatorWorkflow debe devolver true al restaurar un perfil guardado");
  assert.strictEqual(getPaEl("img-defense").value, "spoof", "Retención: restoreSavedCreatorWorkflow debe restaurar el perfil EXIF guardado al volver en la siguiente sesión");
  assert.strictEqual(getPaEl("img-gps-city").value, "miami", "Retención: restoreSavedCreatorWorkflow debe restaurar la ciudad GPS guardada");
  paSandbox.applyCreatorPreset("pure_clean");

  paSandbox.sessionCleanCount = 2;
  const tipAfterSecondUse = paSandbox.buildPostCleanPartnerTipHtml();
  assert(tipAfterSecondUse.includes("Hábito Creador") && tipAfterSecondUse.includes("installPwaApp()"), "Retención: Tras el 2º archivo procesado debe mostrarse el recordatorio de fijar PWA y preset guardado");

  const retFunnel = autoDoctor.computeProductAnalyticsFunnel([
    { event_name: "session_start", isReturning: true, retentionBucket: "D1_48h", genuineReturn: true },
    { event_name: "session_start", isReturning: true, retentionBucket: "W1_d2_7", genuineReturn: true },
    { event_name: "session_start", isReturning: true, retentionBucket: "M1_d8_30", genuineReturn: false, promoTriggered: true }
  ]);
  assert.strictEqual(retFunnel.retentionBreakdown.D1_48h, 1, "Cohortes Retención: Debe contabilizar retorno en ventana D1_48h");
  assert.strictEqual(retFunnel.retentionBreakdown.W1_d2_7, 1, "Cohortes Retención: Debe contabilizar retorno en ciclo semanal W1_d2_7");
  assert.strictEqual(retFunnel.retentionBreakdown.M1_d8_30, 1, "Cohortes Retención: Debe contabilizar retorno en ciclo mensual M1_d8_30");
  assert.strictEqual(retFunnel.retentionBreakdown.genuineReturningUsers, 2, "Retención Genuina: Debe separar retornos orgánicos genuinos (2) de promocionales");
  assert.strictEqual(retFunnel.retentionBreakdown.promoReturningUsers, 1, "Retención Promocional: Debe aislar retornos inducidos por promoción (?ref= / bonus email)");

  // 17j. Verificar Mejoras de Conversión en Monetización: Precios directos sin código promocional, Contexto Dinámico en showProModal (#pro-modal-desc / #pro-modal-title) y Deduplicación de Cuota por Archivo Único
  assert(
    cleanAiHtml.includes("https://buy.stripe.com/9B6cN6e669uZ4vmeTE0000f") &&
    cleanAiHtml.includes("https://buy.stripe.com/3cIdRae66bD74vm6n80000g") &&
    cleanAiHtml.includes("https://buy.stripe.com/eVq00k7HIfTn1jabHs0000h"),
    "Checkout Friction Zero: Los 3 enlaces híbridos de Stripe deben usar precios directos con IVA incluido sin códigos promocionales"
  );
  paSandbox.showProModal("🔒 Tienes 12 fotos y vídeos en lote listos para descargar en .ZIP", "img_batch_zip");
  assert(getPaEl("pro-modal-title").textContent.includes("Lotes .ZIP Mixtos"), "Paywall Contextual: showProModal debe adaptar #pro-modal-title a la función que disparó el bloqueo");
  assert(getPaEl("pro-modal-desc").textContent.includes("12 fotos y vídeos"), "Paywall Contextual: showProModal debe inyectar el mensaje específico msg en #pro-modal-desc");
  assert.strictEqual(paSandbox.lastPaywallTriggerTool, "img_batch_zip", "Atribución de Paywall: showProModal debe registrar lastPaywallTriggerTool para atribuir el checkout");

  paSandbox.isPureAiPro = false;
  paSandbox.persistImgQuota(0);
  paSandbox.loadedImgElement = { naturalWidth: 64, naturalHeight: 64 };
  paSandbox.loadedImgFile = { name: "same-portrait.jpg", size: 40960, type: "image/jpeg" };
  paSandbox.loadedIsVideo = false;
  getPaEl("img-defense").value = "spoof";
  getPaEl("img-gps-city").value = "miami";
  paSandbox.scrubAndDownloadImage();
  assert.strictEqual(paSandbox.usedImgCredits, 1, "Cuota PLG: El 1er procesado Pro de un archivo nuevo debe consumir 1 crédito (1/3)");
  getPaEl("img-gps-city").value = "madrid";
  paSandbox.scrubAndDownloadImage();
  assert.strictEqual(paSandbox.usedImgCredits, 1, "Protección PLG: Re-procesar el mismo archivo cambiando ciudad GPS o cámara no debe consumir un 2º crédito gratuito");

  // 17k. Verificar Mejoras de UX y Comprensión: 0 Falsas Alertas Rojas en archivos ya limpios, Miniatura SVG en Vídeo .MP4, Grid Responsive .pa-exif-grid y Auto-Sync en Focus
  assert(cleanAiHtml.includes(".pa-exif-grid") && cleanAiHtml.includes("@media (max-width: 680px)"), "UX Móvil: Los 3 selectores EXIF/GPS deben usar la clase responsive .pa-exif-grid");
  const cleanPhotoBytes = new Uint8Array([0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46, 0x49, 0x46, 0xff, 0xd9]);
  await paSandbox.inspectImageFile({
    name: "already-clean.jpg",
    size: cleanPhotoBytes.length,
    type: "image/jpeg",
    arrayBuffer: async () => cleanPhotoBytes.buffer
  });
  const cleanAuditHtml = getPaEl("img-audit-log").innerHTML;
  assert(cleanAuditHtml.includes("threat-badge-green") && !cleanAuditHtml.includes("threat-badge-red"), "UX Confianza: Al inspeccionar una imagen ya limpia (0 amenazas), inspectImageFile debe mostrar insignia verde y nunca .threat-badge-red");

  getPaEl("img-preview-thumb").src = "";
  await paSandbox.inspectVideoFile({
    name: "reel-test.mp4",
    size: 4096,
    type: "video/mp4",
    arrayBuffer: async () => xssVidBytes.buffer
  });
  assert(String(getPaEl("img-preview-thumb").src).startsWith("data:image/svg+xml"), "UX Vídeo: inspectVideoFile debe asignar un icono SVG válido a #img-preview-thumb para evitar icono de imagen rota");

  // 17l. Verificar Embudo de Conversión por Canal (byChannelFunnel y bestConvertingChannel) y clasificación de user_referral / paid_ads / community_social
  assert(telemetriaCode.includes('"user_referral"') && telemetriaCode.includes('"paid_ads"') && telemetriaCode.includes('"community_social"'), "Adquisición: classifyTrafficChannel debe distinguir user_referral, paid_ads y community_social");
  const channelFunnelTest = autoDoctor.computeProductAnalyticsFunnel([
    { event_name: "session_start", channel: "social_reddit" },
    { event_name: "tool_completed", channel: "social_reddit", tool_id: "img_c2pa_scrubber", isDemo: false },
    { event_name: "paywall_viewed", channel: "social_reddit", trigger_tool: "img_batch_zip" },
    { event_name: "checkout_clicked", channel: "social_reddit", plan_selected: "PRO_ANNUAL_3900" },
    { event_name: "purchase_verified", channel: "social_reddit" },
    { event_name: "session_start", channel: "organic_search" },
    { event_name: "tool_completed", channel: "organic_search", tool_id: "img_c2pa_scrubber", isDemo: false }
  ]);
  assert.strictEqual(channelFunnelTest.byChannelFunnel.social_reddit.purchasesVerified, 1, "Atribución por Canal: byChannelFunnel debe rastrear compras verificadas por canal");
  assert.strictEqual(channelFunnelTest.byChannelFunnel.social_reddit.conversionToPurchasePct, 100, "Atribución por Canal: Debe calcular conversionToPurchasePct por canal");
  assert.strictEqual(channelFunnelTest.bestConvertingChannel, "social_reddit", "Atribución por Canal: Debe identificar automáticamente el canal con mejor conversión (bestConvertingChannel)");

  // 17m. Verificar Modelo de Viabilidad Financiera (Facturación vs. BAI vs. Caja Propietario + Escenarios Conservador/Intermedio/Optimista)
  const finViabilityDigest = autoDoctor.generateAutomatedFinancialDigest(
    [
      { id: "ev_fin_1", type: "SALE_ANNUAL", amountCents: 3900, taxCents: 0, affiliateId: "organic" },
      { id: "ev_fin_2", type: "SALE_MONTHLY", amountCents: 999, taxCents: 0, affiliateId: "creator_partner" }
    ],
    { fixedCostsCents: 100, adSpendCents: 0, founderHours: 5, taxRatePct: 20 }
  );
  assert(finViabilityDigest.contributionMarginCents > 4000, "Viabilidad Financiera: Debe calcular el Margen de Contribución descontando Stripe y afiliados");
  assert(finViabilityDigest.preTaxProfitBaiCents < finViabilityDigest.contributionMarginCents, "Viabilidad Financiera: Debe distinguir Beneficio Antes de Impuestos (BAI) descontando costes fijos");
  assert(finViabilityDigest.ownerFreeCashFlowCents < finViabilityDigest.preTaxProfitBaiCents, "Viabilidad Financiera: Debe distinguir Dinero Disponible para el Propietario descontando reserva fiscal");
  assert(finViabilityDigest.weeklyKpiChecklist && finViabilityDigest.weeklyKpiChecklist.under100EurBudgetCompliant === true, "Viabilidad Financiera: Debe verificar cumplimiento del presupuesto < 100 €/mes");

  const finScenarios = autoDoctor.simulateFinancialViabilityScenarios({ monthlyPromo499Sales: 5, monthlyStd999Sales: 5, annual3900Sales: 2 });
  assert(finScenarios.conservative && finScenarios.intermediate && finScenarios.optimistic, "Viabilidad Financiera: Debe simular escenarios Conservador, Intermedio y Optimista");
  assert(finScenarios.optimistic.ownerTakeHomeCashEur > finScenarios.intermediate.ownerTakeHomeCashEur && finScenarios.intermediate.ownerTakeHomeCashEur > finScenarios.conservative.ownerTakeHomeCashEur, "Viabilidad Financiera: El flujo de caja libre del propietario debe escalar coherentemente entre escenarios");
  assert.strictEqual(finScenarios.optimistic.variableApiAndServerCostEur, 0, "Viabilidad Financiera: El coste variable de APIs/servidor por operación debe mantenerse en 0,00 € (100% Client-Side)");

  // 17n. Verificar Corrección de los 8 Casos Límite de QA, Ingeniería y Seguridad (BUG-01 a BUG-09)
  // BUG-01: Retorno legítimo de Stripe Checkout (?session_id=cs_live_...) concede acceso en ventana de propagación de webhook sin bloquear al comprador
  const graceCheckoutRes = paSandbox.processStripeCheckoutReturn("?session_id=cs_live_buyer_grace_window_test_9876543210");
  assert.strictEqual(graceCheckoutRes.activated, true, "QA BUG-01: Retorno de Stripe debe activar la sesión");
  assert.strictEqual(paSandbox.isPureAiPro, true, "QA BUG-01: El comprador recién retornado de Stripe debe tener isPureAiPro=true durante la ventana de propagación del webhook");
  await paSandbox.verifyLicenseWithServer("cs_live_buyer_grace_window_test_9876543210"); // Sin customEndpoint (simula 404 temporal por carrera del webhook)
  assert.strictEqual(paSandbox.isPureAiPro, true, "QA BUG-01: Un 404 temporal en los primeros segundos tras pagar en Stripe no debe revocar la sesión del comprador");

  // BUG-02: Modo Lossless sobre contenedor PNG elimina cadenas C2PA/prompts sin dejarlas intactas
  const pngWithC2pa = new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, ...Buffer.from("tEXtparameters\0Midjourney prompt secret c2pa")]);
  const losslessPngOut = paSandbox.stripJpegContainersLossless(pngWithC2pa);
  const losslessPngStr = Buffer.from(losslessPngOut).toString("latin1");
  assert(!/c2pa|Midjourney|prompt/i.test(losslessPngStr), "QA BUG-02: stripJpegContainersLossless debe limpiar rastros C2PA/prompts también cuando recibe un contenedor PNG");

  // BUG-03: Modo Neutro ('pure') + Ciudad GPS ('madrid') debe inyectar el bloque EXIF/GPS APP1 (0xFFE1)
  paSandbox.isPureAiPro = false;
  paSandbox.persistImgQuota(0);
  getPaEl("img-defense").value = "pure";
  getPaEl("img-gps-city").value = "madrid";
  getPaEl("img-format").value = "image/png"; // Incluso si estaba en PNG, debe cambiar a JPEG para soportar APP1 GPS
  paSandbox.loadedImgElement = { naturalWidth: 64, naturalHeight: 64 };
  paSandbox.loadedImgFile = { name: "neutral-gps-test.jpg", size: 2048, type: "image/jpeg" };
  paSandbox.loadedIsVideo = false;
  paSandbox.scrubAndDownloadImage();
  await new Promise((r) => setTimeout(r, 25));
  assert(paSandbox.lastCleanedBlob && paSandbox.lastCleanedBlob._bytes[2] === 0xff && paSandbox.lastCleanedBlob._bytes[3] === 0xe1, "QA BUG-03: Seleccionar ciudad GPS en modo neutro debe inyectar cabecera APP1 con coordenadas GPS");

  // BUG-04: MP4 con átomo mdat de tamaño 0 (hasta EOF) o 1 (64 bits) protege el flujo H.264/H.265 sin corromperlo
  const mp4BoxZero = new Uint8Array([
    0x00, 0x00, 0x00, 0x08, 0x66, 0x74, 0x79, 0x70,
    0x00, 0x00, 0x00, 0x00, 0x6d, 0x64, 0x61, 0x74,
    0x11, 0x22, 0x73, 0x6f, 0x72, 0x61, 0x33, 0x44
  ]);
  const cleanedBoxZero = paSandbox.scrubVideoBytesInPlace(mp4BoxZero, "pure");
  assert.strictEqual(Buffer.from(cleanedBoxZero.slice(18, 22)).toString("latin1"), "sora", "QA BUG-04: Átomo mdat con boxSize=0 (hasta EOF) debe proteger su bitstream H.264 interno");

  // BUG-05: inspectImageFile detecta metadatos al final de archivos >256 KB y detecta tag binario TIFF GPS 0x8825
  const bigPng = new Uint8Array(280000);
  bigPng.set([0x89, 0x50, 0x4e, 0x47], 0);
  bigPng.set(Buffer.from("c2pa.manifest.trainedAlgorithmicMedia"), 270000);
  await paSandbox.inspectImageFile({
    name: "big-tail-c2pa.png",
    size: bigPng.length,
    arrayBuffer: async () => bigPng.buffer,
    _dataUrl: "data:image/png;base64,iVBORw0KGgo="
  });
  assert(getPaEl("img-audit-log").innerHTML.includes("C2PA"), "QA BUG-05: inspectImageFile debe detectar manifiestos C2PA situados más allá de los primeros 256 KB");

  // BUG-06 y BUG-08: freeProCredits (obtenido por ?ref= o email) desbloquea también 1 uso Pro de imagen y wrangler.toml coincide con el endpoint del Worker
  paSandbox.isPureAiPro = false;
  paSandbox.persistImgQuota(1);
  paSandbox.freeProCredits = 1;
  getPaEl("pro-modal-overlay").style.display = "none";
  getPaEl("img-defense").value = "spoof";
  paSandbox.loadedImgFile = { name: "bonus-credit-test.jpg", size: 4096, type: "image/jpeg" };
  paSandbox.scrubAndDownloadImage();
  assert.strictEqual(getPaEl("pro-modal-overlay").style.display, "none", "QA BUG-06: freeProCredits debe permitir 1 uso Pro de imagen cuando usedImgCredits === 1");
  assert.strictEqual(paSandbox.freeProCredits, 0, "QA BUG-06: Consumir el crédito extra Pro en imagen debe descontar freeProCredits a 0");
  assert(wranglerToml.includes('name = "pureai-stripe-webhook"'), "QA BUG-08: wrangler.toml debe usar el nombre exacto pureai-stripe-webhook");

  // 17o. Verificar Árbol de Diagnóstico de Cuellos de Botella 30/60/90 Días (diagnoseConversionBottleneck)
  const diagLowActivation = autoDoctor.diagnoseConversionBottleneck(
    { stages: { visitors: 100, activatedUsers: 8, paywallViewed: 2, checkoutClicked: 0 }, rates: { activationRatePct: 8, paywallReachRatePct: 25 } },
    { stageDay: 30 }
  );
  assert.strictEqual(diagLowActivation.bottleneckCode, "BOTTLENECK_AUDIENCE_OR_CLARITY", "Diagnóstico 90d: Con <15% de activación debe señalar fallo de público/claridad y prohibir bajar precios a ciegas");

  const diagCheckoutDrop = autoDoctor.diagnoseConversionBottleneck(
    { stages: { visitors: 200, activatedUsers: 80, paywallViewed: 30, checkoutClicked: 12, purchasesVerified: 0 }, rates: { activationRatePct: 40, paywallReachRatePct: 37.5, paywallToCheckoutPct: 40, checkoutToPurchasePct: 0 } },
    { stageDay: 60 }
  );
  assert.strictEqual(diagCheckoutDrop.bottleneckCode, "BOTTLENECK_CHECKOUT_TRUST_OR_MODEL", "Diagnóstico 90d: Con >=10 clics a Stripe y <15% de compra debe señalar fricción en checkout o modelo de cobro");

  const diagHealthy = autoDoctor.diagnoseConversionBottleneck(
    { stages: { visitors: 300, activatedUsers: 120, paywallViewed: 40, checkoutClicked: 10, purchasesVerified: 4 }, rates: { activationRatePct: 40, paywallReachRatePct: 33.3, paywallToCheckoutPct: 25, checkoutToPurchasePct: 40 }, bestConvertingChannel: "social_reddit", retentionBreakdown: { genuineReturningUsers: 18 } },
    { stageDay: 90 }
  );
  assert.strictEqual(diagHealthy.bottleneckCode, "HEALTHY_CONVERSION_FLOW", "Diagnóstico 90d: Cuando todas las tasas superan los umbrales debe recomendar escalar el canal ganador");

  // 17p. Verificar Las 5 Pruebas Esenciales y Regla de Señales Convergentes (evaluateFiveCoreValidationTests)
  const partialFive = autoDoctor.evaluateFiveCoreValidationTests(
    {
      stages: { visitors: 100, activatedUsers: 35, paywallViewed: 20, checkoutClicked: 0, purchasesVerified: 0 },
      rates: { activationRatePct: 35, paywallToCheckoutPct: 0 },
      retentionBreakdown: { genuineReturningUsers: 2 },
      byChannelFunnel: {}
    },
    { verifiedSalesCount: 0, refundsCount: 0 }
  );
  assert.strictEqual(partialFive.convergentStatus, "FREE_UTILITY_TRAP_NO_PAYMENT_YET", "5 Pruebas: Superar solo Comprensión y Utilidad sin Pago ni Recurrencia debe alertar FREE_UTILITY_TRAP_NO_PAYMENT_YET");

  const convergentFive = autoDoctor.evaluateFiveCoreValidationTests(
    {
      stages: { visitors: 120, activatedUsers: 45, paywallViewed: 25, checkoutClicked: 6, purchasesVerified: 4 },
      rates: { activationRatePct: 37.5, paywallToCheckoutPct: 24 },
      retentionBreakdown: { genuineReturningUsers: 12, W1_d2_7: 8, M1_d8_30: 4 },
      byChannelFunnel: { user_referral: { visitors: 6, activatedUsers: 3 } }
    },
    { verifiedSalesCount: 4, refundsCount: 0 }
  );
  assert.strictEqual(convergentFive.passedCount, 5, "5 Pruebas: Cuando los 5 pilares superan sus umbrales passedCount debe ser 5");
  assert.strictEqual(convergentFive.convergentStatus, "VALIDATED_CONVERGENT", "5 Pruebas: Solo con señales convergentes (Utilidad + Recurrencia + Pago + Comprensión/Recomendación) debe declarar VALIDATED_CONVERGENT");

  // 17q. Verificar Evaluador de Entrevistas a Usuarios Reales (The Mom Test: hechos pasados vs. cumplidos vacíos)
  const politeCompliment = autoDoctor.evaluateUserInterviewResponses({
    daysSinceLastProblem: 180,
    usedActiveWorkaround: false,
    timeSpentMinutes: 0,
    paidForAlternativeBefore: false,
    gaveGenericComplimentOnly: true
  });
  assert.strictEqual(politeCompliment.profileClassification, "FALSE_POSITIVE_POLITE_COMPLIMENT", "Entrevistas: Un usuario que dice 'me encanta' pero no ha tenido el problema en meses ni usó workaround debe clasificarse como FALSE_POSITIVE_POLITE_COMPLIMENT");
  assert.strictEqual(politeCompliment.isReliableDemandSignal, false, "Entrevistas: Cumplidos generales sin comportamiento pasado no deben contarse como señal de demanda");

  const realIcpCreator = autoDoctor.evaluateUserInterviewResponses({
    daysSinceLastProblem: 2,
    usedActiveWorkaround: true,
    timeSpentMinutes: 20,
    paidForAlternativeBefore: true,
    completedRealTaskInPureAi: true,
    hasSpecificReturnTrigger: true,
    unnecessaryFeatures: ["txt_pro_humanizer"],
    trustBarriers: ["subida_a_nube"]
  });
  assert.strictEqual(realIcpCreator.profileClassification, "HIGH_INTENT_ICP_BUYER", "Entrevistas: Un usuario que tuvo el problema hace 2 días, tardó 20 min en un workaround y tiene desencadenante de retorno debe clasificarse como HIGH_INTENT_ICP_BUYER");
  assert.strictEqual(realIcpCreator.isReliableDemandSignal, true, "Entrevistas: Evidencia conductual pasada debe marcarse como señal fiable de demanda");

  // 17r. Verificar Semáforo de Constitución de Empresa para Trabajador por Cuenta Ajena (incorporationReadiness en generateAutomatedFinancialDigest)
  assert.strictEqual(finViabilityDigest.incorporationReadiness.readyToCreateCompany, false, "Con solo 2 ventas no debe recomendar constituir empresa ni asumir gastos fijos de gestoría");
  assert(finViabilityDigest.incorporationReadiness.recommendation.includes("DO_NOT_INCORPORATE_YET"), "Debe advertir expresamente DO_NOT_INCORPORATE_YET mientras no supere 350 €/mes y 15 clientes");

  // 18. AUDITORÍA PROFUNDA ANTI-BYPASS DE LÍMITES DE USO Y CIBERSEGURIDAD END-TO-END
  // 18a. Anti-Bypass por falsificación de nombre de archivo ("dalle3-instagram-sample.jpg") vs Demo legítima integrada
  paSandbox.isPureAiPro = false;
  paSandbox.persistImgQuota(1);
  paSandbox.freeProCredits = 0;
  getPaEl("pro-modal-overlay").style.display = "none";
  paSandbox.loadedImgElement = { naturalWidth: 64, naturalHeight: 64 };
  paSandbox.loadedImgFile = { name: "dalle3-instagram-sample.jpg", size: 184320, type: "image/jpeg" };
  paSandbox.loadedIsVideo = false;
  paSandbox.scrubAndDownloadImage();
  assert.strictEqual(getPaEl("pro-modal-overlay").style.display, "flex", "SEC-BYPASS-01: Renombrar un archivo de usuario a dalle3-instagram-sample.jpg NO debe saltarse el límite de 1 exportación gratuita");

  getPaEl("pro-modal-overlay").style.display = "none";
  paSandbox.loadSampleAiImage();
  paSandbox.scrubAndDownloadImage();
  assert.strictEqual(getPaEl("pro-modal-overlay").style.display, "none", "SEC-BYPASS-01b: El botón oficial de foto de ejemplo (con _isTrustedBuiltInDemo) sí debe seguir funcionando sin cobrar cuota");

  // 18b. Sincronización Multi-Pestaña de cuota y Anti-Acumulación de créditos promocionales (Email + ?ref=)
  paSandbox.usedImgCredits = 0; // Pestaña antigua en memoria con contador en 0
  paSandbox.localStorage.setItem("pureai_img_used", "1"); // Otra pestaña ya consumió la exportación gratuita
  getPaEl("pro-modal-overlay").style.display = "none";
  paSandbox.loadedImgElement = { naturalWidth: 64, naturalHeight: 64 };
  paSandbox.loadedImgFile = { name: "multitab-photo.jpg", size: 5000, type: "image/jpeg" };
  paSandbox.scrubAndDownloadImage();
  assert.strictEqual(paSandbox.usedImgCredits, 1, "SEC-BYPASS-02: scrubAndDownloadImage debe sincronizar pureai_img_used desde localStorage entre pestañas");
  assert.strictEqual(getPaEl("pro-modal-overlay").style.display, "flex", "SEC-BYPASS-02b: Una segunda pestaña no debe permitir reiniciar ni sobrescribir la cuota agotada");

  paSandbox.localStorage.removeItem("pureai_email_bonus_claimed");
  paSandbox.localStorage.removeItem("pureai_promo_extra_credit_claimed");
  paSandbox.freeProCredits = 0;
  getPaEl("modal-lead-email").value = "invalido@.c";
  assert.strictEqual(paSandbox.claimFreeExtraUnlockByEmail(), false, "SEC-BYPASS-03: Emails malformados deben ser rechazados en el desbloqueo promocional");
  getPaEl("modal-lead-email").value = "usuario.real@dominio.com";
  assert.strictEqual(paSandbox.claimFreeExtraUnlockByEmail(), true, "SEC-BYPASS-03b: Email con formato válido debe aceptarse una única vez");
  assert.strictEqual(paSandbox.freeProCredits, 1, "SEC-BYPASS-03c: El bonus por email debe conceder exactamente 1 crédito extra");
  assert.strictEqual(paSandbox.usedImgCredits, 1, "SEC-BYPASS-03d: El bonus por email NO debe además restar usedImgCredits (evitando regalar 2 usos en vez de 1)");
  paSandbox.freeProCredits = 0;
  assert.strictEqual(paSandbox.claimFreeExtraUnlockByEmail(), true, "Llamada repetida cierra modal sin error");
  assert.strictEqual(paSandbox.freeProCredits, 0, "SEC-BYPASS-03e: El bonus promocional no debe poder reclamarse múltiples veces");

  // 18c. Bloqueo de sesiones Stripe de prueba (cs_test_), expiración de ventana de gracia no verificada y rechazo de pureai_sub_record_v2 sin clave
  assert.strictEqual(paSandbox.isValidProLicenseCode("cs_test_1234567890abcdefghijklmnop"), false, "SEC-BYPASS-04: Claves de entorno de prueba cs_test_ deben rechazarse en producción");
  assert.strictEqual(paSandbox.processStripeCheckoutReturn("?session_id=cs_test_1234567890abcdefghijklmnop").activated, false, "SEC-BYPASS-04b: Retorno URL con cs_test_ no debe activar Pro");

  const expiredGraceEval = paSandbox.evaluateSubscriptionAccess(
    { status: "ACTIVE", verifiedByServer: "CHECKOUT_GRACE", checkoutGraceUntil: Date.now() - 1000 },
    Date.now()
  );
  assert.strictEqual(expiredGraceEval.hasAccess, false, "SEC-BYPASS-05: Una ventana CHECKOUT_GRACE caducada sin confirmación del servidor debe revocar el acceso");
  assert.strictEqual(paSandbox.localStorage.getItem("pureai_unverified_grace_abused"), "1", "SEC-BYPASS-05b: Expirar una ventana CHECKOUT_GRACE sin pago real debe marcar pureai_unverified_grace_abused");
  const replayGraceAttempt = paSandbox.processStripeCheckoutReturn("?session_id=cs_live_forged_replay_grace_9999999999");
  assert.strictEqual(replayGraceAttempt.activated, false, "SEC-BYPASS-05c: Tras expirar una gracia no verificada, nuevos ?session_id=cs_live_ inventados NO deben conceder otra ventana de gracia gratuita");
  assert.strictEqual(paSandbox.isPureAiPro, false, "SEC-BYPASS-05d: isPureAiPro debe permanecer en false ante reintentos de ?session_id= no verificados");

  paSandbox.localStorage.setItem("pureai_sub_record_v2", JSON.stringify({ status: "ACTIVE", verifiedByServer: true, expiresAt: Date.now() + 999999999 }));
  paSandbox.localStorage.setItem("pureai_studio_pro", "true");
  assert.strictEqual(paSandbox.revalidateStoredSubscriptionState(), false, "SEC-BYPASS-06: Un registro pureai_sub_record_v2 manipulado sin clave verificable debe ser revocado inmediatamente");
  assert.strictEqual(paSandbox.isPureAiPro, false, "SEC-BYPASS-06b: isPureAiPro debe quedar en false tras limpiar el registro inválido");

  // 18d. Auditoría de todas las páginas SEO con herramientas rápidas (quickCleanImg, seoCleanPhoto, inspectAndCleanImg) y CSP endurecida
  const allRepoHtmlFiles = fs.readdirSync(__dirname).filter((f) => f.endsWith(".html") && !f.startsWith("google"));
  let quickToolPagesChecked = 0;
  for (const hf of allRepoHtmlFiles) {
    const hContent = fs.readFileSync(path.join(__dirname, hf), "utf8");
    if (/function\s+(quickCleanImg|seoCleanPhoto|inspectAndCleanImg)\s*\(/.test(hContent)) {
      quickToolPagesChecked++;
      assert(hContent.includes("hasVerifiedSeoPro") && hContent.includes("used >= 1"), `SEC-BYPASS-07: La página ${hf} debe validar hasVerifiedSeoPro() y bloquear al llegar a used >= 1`);
      assert(!hContent.includes("100% Free &amp; Unlimited") && !hContent.includes("Unlimited Free 1-by-1 Cleaning"), `SEC-BYPASS-07b: ${hf} no debe prometer limpiezas ilimitadas de fotos gratis`);
    }
    if (hContent.includes('http-equiv="Content-Security-Policy"')) {
      assert(hContent.includes("object-src 'none'") && hContent.includes("base-uri 'self'"), `SEC-CSP-01: ${hf} debe incluir directivas CSP endurecidas object-src 'none' y base-uri 'self'`);
    }
  }
  assert(quickToolPagesChecked >= 20, "SEC-BYPASS-07c: Deben haberse auditado al menos las 20 páginas SEO interactivas con scrubber rápido");

  // Ejecución real en VM de seoCleanPhoto e inspectAndCleanImg con pureai_img_used=1 y pureai_studio_pro falsificado
  const sampleSeoCleanHtml = fs.readFileSync(path.join(__dirname, "remove-made-with-ai-label-instagram-tiktok-c2pa.html"), "utf8");
  const seoScriptMatch = sampleSeoCleanHtml.match(/<script>\s*(function hasVerifiedSeoPro[\s\S]*?)<\/script>/);
  assert(seoScriptMatch, "Debe extraerse el bloque script de seoCleanPhoto");
  const seoStatusEl = { innerHTML: "", textContent: "" };
  const seoVm = {
    localStorage: {
      getItem: (k) => (k === "pureai_img_used" ? "1" : k === "pureai_studio_pro" ? "true" : null),
      setItem: () => {}
    },
    document: { getElementById: () => seoStatusEl },
    window: {},
    Image: function () { throw new Error("No debe instanciar Image cuando la cuota está agotada"); }
  };
  vm.createContext(seoVm);
  vm.runInContext(seoScriptMatch[1], seoVm);
  seoVm.seoCleanPhoto({ name: "bypass-seo.jpg", size: 4096 });
  assert(seoStatusEl.innerHTML.includes("1/1 free photo used"), "SEC-BYPASS-07d: seoCleanPhoto debe bloquear la 2ª foto incluso si localStorage.pureai_studio_pro='true' fue inyectado manualmente");

  // 18e. Seguridad Backend del Worker (ntfy secreto, Auth en /daily-digest y GET /telemetry, anti-poisoning en POST /telemetry, multidivisa, límite de dispositivos y rate-limit)
  const workerSrcRaw = fs.readFileSync(path.join(__dirname, "stripe-webhook-worker.js"), "utf8");
  const doctorSrcRaw = fs.readFileSync(path.join(__dirname, "auto-doctor.js"), "utf8");
  assert(!workerSrcRaw.includes("pureai_studio_ops_telemetry_94c2e1") && !doctorSrcRaw.includes("pureai_studio_ops_telemetry_94c2e1"), "SEC-BACKEND-01: Ningún archivo del repositorio público debe contener URLs secretas hardcodeadas de ntfy.sh");

  const secStore = webhookEngine.createWebhookProcessorStore();
  const secEnv = {
    STRIPE_WEBHOOK_SECRET: "whsec_prod_test_secret_123456",
    ADMIN_DIGEST_TOKEN: "adm_secret_digest_token_987654",
    PUREAI_LICENSES_KV: (() => {
      const m = new Map();
      return {
        get: async (k) => (m.has(k) ? m.get(k) : null),
        put: async (k, v) => { m.set(k, String(v)); },
        _m: m
      };
    })()
  };

  const unauthDigest = await webhookEngine.handleWorkerHttpRequest(
    { method: "POST", url: "https://api.pureaistudios.com/daily-digest", headers: { get: () => "" }, text: async () => '{"force":true}' },
    secEnv,
    secStore
  );
  assert.strictEqual(unauthDigest.status, 401, "SEC-BACKEND-02: POST /daily-digest sin token Bearer válido debe ser rechazado con HTTP 401");

  const wrongAuthDigest = await webhookEngine.handleWorkerHttpRequest(
    {
      method: "POST",
      url: "https://api.pureaistudios.com/daily-digest",
      headers: { get: (h) => (h.toLowerCase() === "authorization" ? "Bearer wrong_token_value_0000" : "") },
      text: async () => '{"force":false}'
    },
    secEnv,
    secStore
  );
  assert.strictEqual(wrongAuthDigest.status, 401, "SEC-BACKEND-02b: POST /daily-digest con Bearer incorrecto debe responder HTTP 401");

  const validAuthDigest = await webhookEngine.handleWorkerHttpRequest(
    {
      method: "POST",
      url: "https://api.pureaistudios.com/daily-digest",
      headers: { get: (h) => (h.toLowerCase() === "authorization" ? "Bearer adm_secret_digest_token_987654" : "") },
      text: async () => '{"force":false}'
    },
    secEnv,
    secStore
  );
  assert.strictEqual(validAuthDigest.status, 200, "SEC-BACKEND-02c: POST /daily-digest con Bearer legítimo debe responder HTTP 200");

  const unauthGetTelemetry = await webhookEngine.handleWorkerHttpRequest(
    { method: "GET", url: "https://api.pureaistudios.com/telemetry", headers: { get: () => "" } },
    secEnv,
    secStore
  );
  assert.strictEqual(unauthGetTelemetry.status, 401, "SEC-BACKEND-03: GET /telemetry sin autenticación debe responder HTTP 401");

  const forgedPurchaseTel = await webhookEngine.handleWorkerHttpRequest(
    {
      method: "POST",
      url: "https://api.pureaistudios.com/telemetry",
      headers: { get: (h) => (h.toLowerCase() === "origin" ? "https://pureaistudios.com" : "") },
      text: async () => JSON.stringify({ event_name: "purchase_verified", amount_eur: "999.00" })
    },
    secEnv,
    secStore
  );
  assert.strictEqual(forgedPurchaseTel.status, 403, "SEC-BACKEND-04: POST /telemetry debe bloquear con HTTP 403 intentos externos de inyectar purchase_verified");

  const evilOriginTel = await webhookEngine.handleWorkerHttpRequest(
    {
      method: "POST",
      url: "https://api.pureaistudios.com/telemetry",
      headers: { get: (h) => (h.toLowerCase() === "origin" ? "https://evil-attacker.example" : "") },
      text: async () => JSON.stringify({ type: "pageview", event_name: "session_start" })
    },
    secEnv,
    secStore
  );
  assert.strictEqual(evilOriginTel.status, 403, "SEC-BACKEND-04b: POST /telemetry desde un Origin externo no autorizado debe responder HTTP 403");

  const idOverwriteTel = await webhookEngine.handleWorkerHttpRequest(
    {
      method: "POST",
      url: "https://api.pureaistudios.com/telemetry",
      headers: { get: (h) => (h.toLowerCase() === "origin" ? "https://pureaistudios.com" : "") },
      text: async () => JSON.stringify({ id: "attacker_custom_id", ts: "1999-01-01T00:00:00Z", type: "pageview", event_name: "session_start", injectedAdminFlag: true })
    },
    secEnv,
    secStore
  );
  assert.strictEqual(idOverwriteTel.status, 200, "Evento legítimo desde pureaistudios.com debe aceptarse");
  const savedTelEvents = JSON.parse(await secEnv.PUREAI_LICENSES_KV.get("telemetry:recent_events"));
  assert(savedTelEvents[0].id.startsWith("kv_") && savedTelEvents[0].id !== "attacker_custom_id", "SEC-BACKEND-04c: El cliente no debe poder sobrescribir el ID generado por el servidor en KV");
  assert.strictEqual(savedTelEvents[0].injectedAdminFlag, undefined, "SEC-BACKEND-04d: Campos fuera de la lista blanca deben ser descartados en /telemetry");

  // Multidivisa en Stripe Adaptive Pricing (4,99 € cobrados en MXN/SEK/INR no deben regalar 1 año)
  const mxnMonthlyPeriod = webhookEngine.resolveSubscriptionPeriod({ amount_total: 10800, currency: "mxn" }, baseNow);
  const eurAnnualPeriod = webhookEngine.resolveSubscriptionPeriod({ amount_total: 3900, currency: "eur" }, baseNow);
  assert.strictEqual(mxnMonthlyPeriod.planInterval, "month", "SEC-BACKEND-05: 108,00 MXN (10800 centavos ~ 4,99 €) NO debe clasificarse como plan anual de 366 días");
  assert.strictEqual(eurAnnualPeriod.planInterval, "year", "SEC-BACKEND-05b: 39,00 EUR (3900 céntimos) sí debe clasificarse como plan anual");

  // Límite de dispositivos por licencia (MAX_DEVICES_PER_LICENSE = 4) y Rate Limiting anti-fuerza bruta por IP
  webhookEngine.processStripeWebhookEvent(secStore, {
    id: "evt_dev_limit_01",
    type: "checkout.session.completed",
    created: nowSec + 20,
    data: { object: { id: "cs_live_device_cap_session_1234567890", customer: "cus_dev_cap", payment_status: "paid", amount_total: 499, currency: "eur" } }
  }, Date.now());
  const devCapKey = webhookEngine.deriveProKeyFromSession("cs_live_device_cap_session_1234567890");
  for (let d = 1; d <= 4; d++) {
    const rDev = await webhookEngine.handleWorkerHttpRequest(
      {
        method: "GET",
        url: `https://api.pureaistudios.com/verify-license?code=${devCapKey}&did=inst_device_test_000${d}`,
        headers: { get: (h) => (h.toLowerCase() === "origin" ? "https://pureaistudios.com" : "") }
      },
      secEnv,
      secStore
    );
    assert.strictEqual(rDev.status, 200, `Dispositivo ${d}/4 debe permitirse`);
    assert.strictEqual(JSON.parse(rDev.body).valid, true, `Dispositivo ${d}/4 debe recibir valid=true`);
  }
  const fifthDevRes = await webhookEngine.handleWorkerHttpRequest(
    {
      method: "GET",
      url: `https://api.pureaistudios.com/verify-license?code=${devCapKey}&did=inst_device_test_0005`,
      headers: { get: (h) => (h.toLowerCase() === "origin" ? "https://pureaistudios.com" : "") }
    },
    secEnv,
    secStore
  );
  assert.strictEqual(fifthDevRes.status, 403, "SEC-BACKEND-06: Un 5º dispositivo distinto intentando activar la misma clave compartida debe ser bloqueado con HTTP 403");
  assert.strictEqual(JSON.parse(fifthDevRes.body).reason, "max_devices_exceeded", "SEC-BACKEND-06b: Debe indicar max_devices_exceeded");

  let lastRlStatus = 200;
  for (let attempt = 1; attempt <= 21; attempt++) {
    const rlRes = await webhookEngine.handleWorkerHttpRequest(
      {
        method: "GET",
        url: "https://api.pureaistudios.com/verify-license?code=PRO-2345-6789",
        headers: { get: (h) => (h.toLowerCase() === "cf-connecting-ip" ? "198.51.100.42" : "https://pureaistudios.com") }
      },
      secEnv,
      secStore
    );
    lastRlStatus = rlRes.status;
  }
  assert.strictEqual(lastRlStatus, 429, "SEC-BACKEND-07: Más de 20 intentos por minuto desde una misma IP en /verify-license deben bloquearse con HTTP 429");

  // 18f. Extensión Chrome: Fail-Closed ante fallos de red/CORS y cuota de 3 imágenes en popup.js
  let injectedBarBtnHandler = null;
  const fakeAssistMsg = {
    dataset: {},
    innerText: "In conclusion\u202F—\u202Ftest message",
    appendChild: () => {}
  };
  let promptQueue = ["PRO-AAAA-BBBB"];
  let extAlerts = [];
  const extFullVm = {
    localStorage: {
      _m: { pureai_ext_pro: "true" }, // Intento de bypass en localStorage de chatgpt.com
      getItem(k) { return Object.prototype.hasOwnProperty.call(this._m, k) ? this._m[k] : null; },
      setItem(k, v) { this._m[k] = String(v); },
      removeItem(k) { delete this._m[k]; }
    },
    chrome: {
      storage: { local: { get: (_keys, cb) => cb({}), set: () => {} } },
      runtime: { sendMessage: (_msg, cb) => cb({ ok: false, valid: false, reason: "network_unreachable" }) }
    },
    fetch: async () => { throw new Error("Simulated CORS/Network Failure"); },
    navigator: { clipboard: { writeText: async () => {} } },
    prompt: () => promptQueue.shift(),
    alert: (m) => extAlerts.push(m),
    document: {
      querySelectorAll: () => [fakeAssistMsg],
      createElement: () => ({
        style: {},
        dataset: {},
        querySelector: () => ({ addEventListener: (_ev, fn) => { injectedBarBtnHandler = fn; } }),
        addEventListener: () => {},
        appendChild: () => {},
        remove: () => {}
      })
    },
    setInterval: (fn) => fn(),
    setTimeout: () => {}
  };
  vm.createContext(extFullVm);
  vm.runInContext(fs.readFileSync(path.join(__dirname, "chrome-extension-pureai", "content-chatgpt.js"), "utf8"), extFullVm);
  assert.strictEqual(extFullVm.localStorage.getItem("pureai_ext_pro"), null, "SEC-EXT-01: content-chatgpt.js debe purgar y no confiar en pureai_ext_pro del host web");

  const validTestKeyForExt = paSandbox.generateMultiDeviceProKey("cs_live_ext_fail_closed_check_12345");
  promptQueue = [validTestKeyForExt];
  // Forzar aparición del upsell simulando 3 usos agotados hoy
  const todayExtKey = "pureai_ext_uses_" + new Date().toISOString().slice(0, 10);
  extFullVm.localStorage.setItem(todayExtKey, "3");
  let copyClickHandler = null;
  const fakeAssistMsg2 = { dataset: {}, innerText: "Test", appendChild: () => {} };
  extFullVm.document.querySelectorAll = () => [fakeAssistMsg2];
  extFullVm.document.createElement = () => ({
    style: {},
    dataset: {},
    querySelector: (sel) => (sel === ".pureai-inline-upsell" ? null : { addEventListener: (_e, fn) => { injectedBarBtnHandler = fn; } }),
    addEventListener: (_e, fn) => { copyClickHandler = fn; },
    appendChild: () => {},
    remove: () => {}
  });
  // Re-ejecutar en contexto limpio para probar clic en Activar Clave cuando el servidor falla
  vm.runInContext(fs.readFileSync(path.join(__dirname, "chrome-extension-pureai", "content-chatgpt.js"), "utf8"), extFullVm);
  copyClickHandler();
  assert(typeof injectedBarBtnHandler === "function", "Debe montar el manejador de activación de clave en el upsell");
  await injectedBarBtnHandler();
  assert(extAlerts.some((a) => a.includes("No se pudo verificar")), "SEC-EXT-02: Si /verify-license falla o está offline, la extensión Chrome debe fallar CERRADA sin regalar Pro");

  const popupCode = fs.readFileSync(path.join(__dirname, "chrome-extension-pureai", "popup.js"), "utf8");
  assert(popupCode.includes("MAX_FREE_POPUP_IMG = 1") && popupCode.includes("popupImgUsed >= MAX_FREE_POPUP_IMG"), "SEC-EXT-03: popup.js debe aplicar el límite de 1 imagen gratuita");

  // 18g. Protección contra .DOCX Zip Bombs, Zip-Slip en createZipBlob y SSRF en isSafeExternalImageUrl (?ext_img=)
  const oversizedDocRes = await paSandbox.loadDocFile({ name: "huge.docx", size: 30 * 1024 * 1024, arrayBuffer: async () => new ArrayBuffer(8) });
  assert.strictEqual(oversizedDocRes, false, "SEC-DOS-01: loadDocFile debe rechazar documentos mayores de 25 MB");

  // Cabecera ZIP local con uncompHint > 10 MB para verificar bloqueo temprano de Zip Bomb en .DOCX
  const bombBuf = new ArrayBuffer(64);
  const bombDv = new DataView(bombBuf);
  const bombBytes = new Uint8Array(bombBuf);
  const entryNameBytes = Buffer.from("word/document.xml");
  bombDv.setUint32(0, 0x04034b50, true);
  bombDv.setUint16(8, 8, true); // deflate
  bombDv.setUint32(18, 4, true); // compSize = 4 bytes
  bombDv.setUint32(22, 50 * 1024 * 1024, true); // uncompHint = 50 MB (> 10 MB cap)
  bombDv.setUint16(26, entryNameBytes.length, true);
  bombBytes.set(entryNameBytes, 30);
  const bombDocRes = await paSandbox.loadDocFile({ name: "zipbomb.docx", size: 64, arrayBuffer: async () => bombBuf });
  assert.strictEqual(bombDocRes, false, "SEC-DOS-02: loadDocFile debe abortar de inmediato ante un .DOCX Zip Bomb con tamaño descomprimido > 10 MB");

  const traversalZip = paSandbox.createZipBlob([{ name: "../../etc/passwd", bytes: new Uint8Array([0x41, 0x42]) }]);
  const zipHeaderStr = Buffer.from(traversalZip._bytes).toString("latin1");
  assert(!zipHeaderStr.includes("../") && !zipHeaderStr.includes("etc/passwd"), "SEC-ZIP-01: createZipBlob debe sanear rutas ../ y barras para impedir ataques Zip-Slip");

  assert.strictEqual(paSandbox.isSafeExternalImageUrl("http://images.unsplash.com/test.jpg"), false, "SEC-SSRF-01: Debe bloquear HTTP sin cifrar");
  assert.strictEqual(paSandbox.isSafeExternalImageUrl("https://admin:secret@images.unsplash.com/test.jpg"), false, "SEC-SSRF-02: Debe bloquear URLs con credenciales embebidas");
  assert.strictEqual(paSandbox.isSafeExternalImageUrl("https://169.254.169.254/latest/meta-data/"), false, "SEC-SSRF-03: Debe bloquear IPs link-local / Cloud Metadata 169.254.x.x");
  assert.strictEqual(paSandbox.isSafeExternalImageUrl("https://172.20.0.10/internal.jpg"), false, "SEC-SSRF-04: Debe bloquear rangos privados RFC1918 172.16-31.x.x");
  assert.strictEqual(paSandbox.isSafeExternalImageUrl("https://[::1]/loopback.jpg"), false, "SEC-SSRF-05: Debe bloquear literales IPv6 loopback/privados");
  assert.strictEqual(paSandbox.isSafeExternalImageUrl("https://router.local/photo.jpg"), false, "SEC-SSRF-06: Debe bloquear dominios mDNS/internos .local");
  assert.strictEqual(paSandbox.isSafeExternalImageUrl("https://images.unsplash.com/photo-123.jpg"), true, "SEC-SSRF-07: Debe permitir URLs HTTPS públicas legítimas");

  // 19. AUDITORÍA ADVERSARIAL DE SEGUNDA RONDA: CIERRE DE VECTORES DE BYPASS Y CIBERSEGURIDAD AVANZADA
  // 19a. Bloqueo de evasión del límite de 4 dispositivos omitiendo ?did= o enviando ?did= malformado
  const noDidFifthRes = await webhookEngine.handleWorkerHttpRequest(
    {
      method: "GET",
      url: `https://api.pureaistudios.com/verify-license?code=${devCapKey}`,
      headers: { get: (h) => (h.toLowerCase() === "origin" ? "https://pureaistudios.com" : "") }
    },
    secEnv,
    secStore
  );
  assert.strictEqual(noDidFifthRes.status, 403, "SEC-R2-01: Omitir el parámetro did cuando los 4 huecos de dispositivos están llenos NO debe permitir saltarse MAX_DEVICES_PER_LICENSE");

  const ipFallbackFifthRes = await webhookEngine.handleWorkerHttpRequest(
    {
      method: "GET",
      url: `https://api.pureaistudios.com/verify-license?code=${devCapKey}`,
      headers: { get: (h) => (h.toLowerCase() === "cf-connecting-ip" ? "203.0.113.77" : h.toLowerCase() === "origin" ? "https://pureaistudios.com" : "") }
    },
    secEnv,
    secStore
  );
  assert.strictEqual(ipFallbackFifthRes.status, 403, "SEC-R2-01b: Omitir did desde una IP externa distinta debe consumir/respetar el tope de 4 dispositivos y devolver HTTP 403");

  const malformedDidRes = await webhookEngine.handleWorkerHttpRequest(
    {
      method: "GET",
      url: `https://api.pureaistudios.com/verify-license?code=${devCapKey}&did=x`,
      headers: { get: (h) => (h.toLowerCase() === "origin" ? "https://pureaistudios.com" : "") }
    },
    secEnv,
    secStore
  );
  assert.strictEqual(malformedDidRes.status, 400, "SEC-R2-01c: Enviar un did malformado (<8 chars) debe ser rechazado con HTTP 400 en vez de ignorar el control de dispositivos");

  // 19b. Rate-Limit ante IPv6 mapeado a IPv4 (::ffff:x.x.x.x) y comparación constante ante longitudes distintas
  let mappedIpv6LastStatus = 200;
  for (let i = 1; i <= 21; i++) {
    const r = await webhookEngine.handleWorkerHttpRequest(
      {
        method: "GET",
        url: "https://api.pureaistudios.com/verify-license?code=PRO-2345-6789",
        headers: { get: (h) => (h.toLowerCase() === "cf-connecting-ip" ? "::ffff:203.0.113.88" : "https://pureaistudios.com") }
      },
      secEnv,
      secStore
    );
    mappedIpv6LastStatus = r.status;
  }
  assert.strictEqual(mappedIpv6LastStatus, 429, "SEC-R2-02: Direcciones IPv4-mapped IPv6 (::ffff:x.x.x.x) NO deben evadir el rate-limit de /verify-license");

  const sameBucketIpv4Res = await webhookEngine.handleWorkerHttpRequest(
    {
      method: "GET",
      url: "https://api.pureaistudios.com/verify-license?code=PRO-2345-6789",
      headers: { get: (h) => (h.toLowerCase() === "cf-connecting-ip" ? "203.0.113.88" : "https://pureaistudios.com") }
    },
    secEnv,
    secStore
  );
  assert.strictEqual(sameBucketIpv4Res.status, 429, "SEC-R2-02b: ::ffff:203.0.113.88 y 203.0.113.88 deben compartir exactamente el mismo bucket de rate-limit");

  const shortTokenDigest = await webhookEngine.handleWorkerHttpRequest(
    {
      method: "POST",
      url: "https://api.pureaistudios.com/daily-digest",
      headers: { get: (h) => (h.toLowerCase() === "authorization" ? "Bearer x" : "") },
      text: async () => '{"force":false}'
    },
    secEnv,
    secStore
  );
  assert.strictEqual(shortTokenDigest.status, 401, "SEC-R2-02c: Tokens Bearer de longitud distinta deben rechazarse mediante hash SHA-256 de tamaño fijo");

  // 19c. Clawback de afiliados en KV ante charge.dispute.created sin obj.customer y revocación en customer.subscription.updated (unpaid/canceled)
  const signStripeTestEvt = (evtObj) => {
    const raw = JSON.stringify(evtObj);
    const ts = Math.floor(Date.now() / 1000);
    const sig = require("crypto").createHmac("sha256", secEnv.STRIPE_WEBHOOK_SECRET).update(`${ts}.${raw}`).digest("hex");
    return { raw, header: `t=${ts},v1=${sig}` };
  };
  const paidAffEvt = {
    id: "evt_r2_aff_paid_01",
    type: "checkout.session.completed",
    created: Math.floor(Date.now() / 1000),
    data: {
      object: {
        id: "cs_live_r2_aff_dispute_session_0001",
        customer: "cus_r2_aff_disp_01",
        payment_intent: "pi_r2_aff_disp_01",
        payment_status: "paid",
        amount_total: 499,
        currency: "eur",
        client_reference_id: "aff_partner77"
      }
    }
  };
  const signedPaidAff = signStripeTestEvt(paidAffEvt);
  const resPaidAff = await webhookEngine.handleWorkerHttpRequest(
    { method: "POST", url: "https://api.pureaistudios.com/webhook/stripe", headers: { get: (h) => (h.toLowerCase() === "stripe-signature" ? signedPaidAff.header : "") }, text: async () => signedPaidAff.raw },
    secEnv,
    webhookEngine.createWebhookProcessorStore()
  );
  assert.strictEqual(resPaidAff.status, 200, "Webhook inicial de venta con afiliado debe persistir en KV");

  const disputeNoCustEvt = {
    id: "evt_r2_aff_disp_02",
    type: "charge.dispute.created",
    created: Math.floor(Date.now() / 1000) + 5,
    data: { object: { id: "dp_r2_no_customer_field", payment_intent: "pi_r2_aff_disp_01" } }
  };
  const signedDisp = signStripeTestEvt(disputeNoCustEvt);
  const resDisp = await webhookEngine.handleWorkerHttpRequest(
    { method: "POST", url: "https://api.pureaistudios.com/webhook/stripe", headers: { get: (h) => (h.toLowerCase() === "stripe-signature" ? signedDisp.header : "") }, text: async () => signedDisp.raw },
    secEnv,
    webhookEngine.createWebhookProcessorStore()
  );
  assert.strictEqual(resDisp.status, 200, "Webhook de disputa sin obj.customer debe procesarse vía pi: en KV");
  const kvAffAfterDispute = JSON.parse(await secEnv.PUREAI_LICENSES_KV.get("aff_cust:cus_r2_aff_disp_01"));
  assert.strictEqual(kvAffAfterDispute.entry.commissionCents, 0, "SEC-R2-03: charge.dispute.created sin obj.customer debe anular la comisión del afiliado en KV");
  assert.strictEqual(kvAffAfterDispute.entry.status, "FROZEN_DISPUTE", "SEC-R2-03b: El estado en KV debe quedar en FROZEN_DISPUTE");

  const unpaidUpdateStore = webhookEngine.createWebhookProcessorStore();
  webhookEngine.processStripeWebhookEvent(unpaidUpdateStore, {
    id: "evt_sub_act_01",
    type: "checkout.session.completed",
    created: nowSec + 30,
    data: { object: { id: "cs_live_sub_unpaid_transition_01", customer: "cus_unpaid_01", payment_status: "paid", amount_total: 499, currency: "eur" } }
  }, Date.now());
  const unpaidRes = webhookEngine.processStripeWebhookEvent(unpaidUpdateStore, {
    id: "evt_sub_unpaid_02",
    type: "customer.subscription.updated",
    created: nowSec + 60,
    data: { object: { id: "sub_unpaid_01", customer: "cus_unpaid_01", status: "unpaid" } }
  }, Date.now());
  assert.strictEqual(unpaidRes.state, "EXPIRED", "SEC-R2-03c: customer.subscription.updated con status='unpaid' o 'canceled' debe revocar la suscripción a EXPIRED");

  // 19d. Bloqueo de encadenamiento infinito (<60s) de ?session_id=cs_live_, bloqueo de Batch .ZIP sin verificación del servidor y tope de usos en gracia
  paSandbox.localStorage.removeItem("pureai_unverified_grace_abused");
  paSandbox.localStorage.removeItem("pureai_grace_uses");
  const firstGrace = paSandbox.processStripeCheckoutReturn("?session_id=cs_live_r2_first_grace_window_00001");
  assert.strictEqual(firstGrace.activated, true, "1ª ventana de gracia legítima tras redirección debe iniciar espera del webhook");

  getPaEl("pro-modal-overlay").style.display = "none";
  paSandbox.handleSelectedFiles([
    { name: "b1.jpg", size: 1024, type: "image/jpeg", arrayBuffer: async () => new ArrayBuffer(8), _dataUrl: "data:image/png;base64,iVBORw0KGgo=" },
    { name: "b2.jpg", size: 1024, type: "image/jpeg", arrayBuffer: async () => new ArrayBuffer(8), _dataUrl: "data:image/png;base64,iVBORw0KGgo=" }
  ]);
  assert.strictEqual(paSandbox.batchQueue.length, 1, "SEC-R2-04: Durante CHECKOUT_GRACE no verificada por el servidor NO debe permitirse procesar lotes masivos .ZIP");
  assert.strictEqual(getPaEl("pro-modal-overlay").style.display, "flex", "SEC-R2-04b: Seleccionar múltiples archivos durante gracia no verificada debe exigir verificación Pro");

  paSandbox.localStorage.setItem("pureai_grace_uses", "3");
  getPaEl("pro-modal-overlay").style.display = "none";
  paSandbox.loadedImgElement = { naturalWidth: 64, naturalHeight: 64 };
  paSandbox.loadedImgFile = { name: "grace-cap.jpg", size: 2048, type: "image/jpeg" };
  paSandbox.loadedIsVideo = false;
  paSandbox.scrubAndDownloadImage();
  assert.strictEqual(getPaEl("pro-modal-overlay").style.display, "flex", "SEC-R2-04c: Una gracia CHECKOUT_GRACE no confirmada no debe permitir limpiezas ilimitadas antes de los 60s");

  const chainedGraceBefore60s = paSandbox.processStripeCheckoutReturn("?session_id=cs_live_r2_chained_grace_window_00002");
  assert.strictEqual(chainedGraceBefore60s.activated, false, "SEC-R2-04d: Rotar ?session_id=cs_live_ antes de 60s mientras hay otra gracia sin verificar debe bloquearse de inmediato");
  assert.strictEqual(paSandbox.isPureAiPro, false, "SEC-R2-04e: El encadenamiento de sesiones falsas debe dejar isPureAiPro=false");

  // 19e. Bloqueo de evasión del límite de 180 palabras en deepHumanizePro (Zero-Width / CJK sin espacios) y saneamiento de contadores negativos/inflados
  paSandbox.isPureAiPro = false;
  paSandbox.freeProCredits = 0;
  paSandbox.localStorage.removeItem("pureai_plg_short_txt_tried");
  getPaEl("pro-modal-overlay").style.display = "none";
  getPaEl("txt-input").value = "palabra\u200B".repeat(400);
  paSandbox.deepHumanizePro();
  assert.strictEqual(getPaEl("pro-modal-overlay").style.display, "flex", "SEC-R2-05: Unir 400 palabras con espacios invisibles U+200B NO debe burlar el límite gratuito de 180 palabras en deepHumanizePro");

  getPaEl("pro-modal-overlay").style.display = "none";
  getPaEl("txt-input").value = "人工智能生成内容检测规避测试文本".repeat(120);
  paSandbox.deepHumanizePro();
  assert.strictEqual(getPaEl("pro-modal-overlay").style.display, "flex", "SEC-R2-05b: Textos largos sin espacios ASCII (>1500 caracteres CJK) NO deben burlar el límite gratuito de deepHumanizePro");

  paSandbox.localStorage.setItem("pureai_img_used", "-500");
  paSandbox.restoreImgQuotaFromAllLayers();
  assert.strictEqual(paSandbox.usedImgCredits, 0, "SEC-R2-05c: Inyectar valores negativos en pureai_img_used debe acotarse a >= 0");
  paSandbox.localStorage.removeItem("pureai_promo_extra_credit_claimed");
  paSandbox.localStorage.removeItem("pureai_email_bonus_claimed");
  paSandbox.localStorage.removeItem("pureai_ref_bonus_claimed");
  paSandbox.localStorage.setItem("pureai_free_pro_credits", "9999");
  assert.strictEqual(paSandbox.readClampedPromoCredits(), 0, "SEC-R2-05d: pureai_free_pro_credits inflado sin reclamación legítima debe acotarse a 0 (y máximo 1 con reclamación)");

  // 19f. Protección contra Decompression Pixel Bombs (25000x25000 = 625 MP) y validación de checksum en páginas SEO
  let pixelBombEncoded = false;
  paSandbox.scrubSingleImageToBlob({ naturalWidth: 25000, naturalHeight: 25000 }, "bomb.png", "pure", "image/jpeg", "jpg", () => {
    pixelBombEncoded = true;
  });
  assert.strictEqual(pixelBombEncoded, false, "SEC-R2-06: Imágenes bomba con dimensiones extremas (25000x25000 / 625 MP) deben abortarse antes de reservar memoria RGBA en Canvas");

  const seoBadChecksumVm = {
    localStorage: {
      getItem: (k) => k === "pureai_sub_record_v2"
        ? JSON.stringify({ key: "PRO-AAAA-AAAA", status: "ACTIVE", verifiedByServer: true, expiresAt: Date.now() + 999999 })
        : (k === "pureai_img_used" ? "3" : null),
      setItem: () => {},
      removeItem: () => {}
    },
    document: { getElementById: () => seoStatusEl },
    window: {},
    Image: function () { throw new Error("No debe procesar imagen con checksum PRO inválido"); }
  };
  vm.createContext(seoBadChecksumVm);
  vm.runInContext(seoScriptMatch[1], seoBadChecksumVm);
  assert.strictEqual(seoBadChecksumVm.hasVerifiedSeoPro(), false, "SEC-R2-06b: hasVerifiedSeoPro en páginas SEO debe rechazar claves PRO-XXXX-YYYY con checksum FNV-1a inválido");

  // 19g. Extensión Chrome: sincronización entre pestañas (chatgpt.com <-> claude.ai) vía chrome.storage.onChanged y copia limpia sin texto del botón
  let storageChangedCb = null;
  let extCopiedText = "";
  let extBtnClick = null;
  let upsellMounted = false;
  const extMsgNode = {
    dataset: {},
    innerText: "Texto limpio de prueba\u202F—\u202Fsin basura\n✨ Copiar Texto Limpio",
    appendChild: () => {}
  };
  const extSyncVm = {
    localStorage: {
      _m: {},
      getItem(k) { return Object.prototype.hasOwnProperty.call(this._m, k) ? this._m[k] : null; },
      setItem(k, v) { this._m[k] = String(v); },
      removeItem(k) { delete this._m[k]; }
    },
    chrome: {
      storage: {
        local: { get: (_k, cb) => cb({}), set: () => {} },
        onChanged: { addListener: (fn) => { storageChangedCb = fn; } }
      },
      runtime: { sendMessage: (_m, cb) => cb({ ok: true, valid: false }) }
    },
    navigator: { clipboard: { writeText: async (t) => { extCopiedText = t; } } },
    document: {
      querySelectorAll: () => [extMsgNode],
      createElement: (tag) => ({
        tag,
        style: {},
        dataset: {},
        querySelector: (sel) => (sel === ".pureai-inline-upsell" ? null : { addEventListener: () => {} }),
        addEventListener: (_e, fn) => { if (tag === "button") extBtnClick = fn; },
        appendChild: (child) => { if (child && child.className === "pureai-inline-upsell") upsellMounted = true; },
        remove: () => {}
      })
    },
    setInterval: (fn) => fn(),
    setTimeout: () => {}
  };
  vm.createContext(extSyncVm);
  vm.runInContext(fs.readFileSync(path.join(__dirname, "chrome-extension-pureai", "content-chatgpt.js"), "utf8"), extSyncVm);
  extBtnClick();
  assert(!extCopiedText.includes("Copiar Texto Limpio"), "SEC-R2-07: Copiar un mensaje en ChatGPT/Claude NO debe arrastrar el texto del botón inyectado al portapapeles");

  assert(typeof storageChangedCb === "function", "content-chatgpt.js debe escuchar chrome.storage.onChanged");
  storageChangedCb({ [todayExtKey]: { newValue: 3 } }, "local");
  extBtnClick();
  assert.strictEqual(upsellMounted, true, "SEC-R2-07b: Agotar los 3 usos diarios en otra pestaña/dominio (claude.ai) debe sincronizarse al instante vía storage.onChanged sin reiniciar la cuota");

  // 19h. Workflow CI GitHub Actions cableado con secretos de autenticación del Worker
  const ciWorkflowYml = fs.readFileSync(path.join(__dirname, ".github", "workflows", "autopilot.yml"), "utf8");
  assert(ciWorkflowYml.includes("ADMIN_DIGEST_TOKEN") && ciWorkflowYml.includes("NTFY_SECRET_TOPIC_URL"), "SEC-R2-08: autopilot.yml debe inyectar ADMIN_DIGEST_TOKEN y NTFY_SECRET_TOPIC_URL para los scripts operativos");

  // 20. VERIFICACIÓN END-TO-END DE MODELO HÍBRIDO (PACK 10 / PACK 50 / ANUAL 39 €), LEDGER DE CRÉDITOS, ANTI-INCÓGNITO Y CRO PAYWALL
  // 20a. Resolución de Packs por Payment Link ID e importes, y acumulación de créditos en recargas
  const hybridStore = webhookEngine.createWebhookProcessorStore();
  const pack10Evt1 = {
    id: "evt_pack10_buy_01",
    type: "checkout.session.completed",
    created: nowSec + 100,
    data: {
      object: {
        id: "cs_live_pack10_session_00000001",
        customer: "cus_hybrid_pack_user",
        payment_link: "plink_1UbbsAJGMJW2ESycP7cZbuRv",
        mode: "payment",
        payment_status: "paid",
        amount_total: 299,
        currency: "eur"
      }
    }
  };
  const pack10Signed = signStripeTestEvt(pack10Evt1);
  const resPack10 = await webhookEngine.handleWorkerHttpRequest(
    { method: "POST", url: "https://api.pureaistudios.com/webhook/stripe", headers: { get: (h) => (h.toLowerCase() === "stripe-signature" ? pack10Signed.header : "") }, text: async () => pack10Signed.raw },
    secEnv,
    hybridStore
  );
  assert.strictEqual(resPack10.status, 200, "CRO-PACK-01: Webhook de Pack 10 usos (2,99 €) debe responder HTTP 200");

  const pack10Verify = await webhookEngine.handleWorkerHttpRequest(
    { method: "GET", url: "https://api.pureaistudios.com/verify-license?code=cs_live_pack10_session_00000001&did=inst_pack10_dev_01", headers: { get: (h) => (h.toLowerCase() === "origin" ? "https://pureaistudios.com" : "") } },
    secEnv,
    hybridStore
  );
  const pack10VerifyBody = JSON.parse(pack10Verify.body);
  assert.strictEqual(pack10VerifyBody.valid, true, "CRO-PACK-01b: Pack 10 usos debe verificarse como activo");
  assert.strictEqual(pack10VerifyBody.unlimited, false, "CRO-PACK-01c: Pack 10 usos no debe ser ilimitado");
  assert.strictEqual(pack10VerifyBody.creditsRemaining, 10, "CRO-PACK-01d: Pack 10 usos debe acreditar exactamente 10 créditos");
  assert.strictEqual(pack10VerifyBody.planType, "pack_10", "CRO-PACK-01e: planType debe ser pack_10");

  const pack50Period = webhookEngine.resolveSubscriptionPeriod({ payment_link: "plink_1UbbsCJGMJW2ESyccAo1J7VN", mode: "payment", amount_total: 990, currency: "eur" }, baseNow);
  assert.strictEqual(pack50Period.planType, "pack_50", "CRO-PACK-02: plink de 9,90 € debe resolverse como pack_50");
  assert.strictEqual(pack50Period.creditsGranted, 50, "CRO-PACK-02b: Pack 50 debe otorgar 50 créditos");
  assert.strictEqual(pack50Period.unlimited, false, "CRO-PACK-02c: Pack 50 debe ser no ilimitado");

  // 20b. Consumo atómico e idempotente de créditos en POST /consume-credit y agotamiento a 0
  const consume1Res = await webhookEngine.handleWorkerHttpRequest(
    {
      method: "POST",
      url: "https://api.pureaistudios.com/consume-credit",
      headers: { get: (h) => (h.toLowerCase() === "origin" ? "https://pureaistudios.com" : "") },
      text: async () => JSON.stringify({ code: "cs_live_pack10_session_00000001", count: 1, opId: "op_unique_001" })
    },
    secEnv,
    hybridStore
  );
  assert.strictEqual(consume1Res.status, 200, "CRO-LEDGER-01: Descontar 1 crédito de un Pack activo debe devolver HTTP 200");
  assert.strictEqual(JSON.parse(consume1Res.body).creditsRemaining, 9, "CRO-LEDGER-01b: Deben quedar 9 créditos tras el 1er uso");

  const consumeIdemRes = await webhookEngine.handleWorkerHttpRequest(
    {
      method: "POST",
      url: "https://api.pureaistudios.com/consume-credit",
      headers: { get: (h) => (h.toLowerCase() === "origin" ? "https://pureaistudios.com" : "") },
      text: async () => JSON.stringify({ code: "cs_live_pack10_session_00000001", count: 1, opId: "op_unique_001" })
    },
    secEnv,
    hybridStore
  );
  assert.strictEqual(JSON.parse(consumeIdemRes.body).idempotent, true, "CRO-LEDGER-02: Reintentar el mismo opId debe ser idempotente");
  assert.strictEqual(JSON.parse(consumeIdemRes.body).creditsRemaining, 9, "CRO-LEDGER-02b: Reintentar opId no debe descontar dos veces");

  const consumeBatch9Res = await webhookEngine.handleWorkerHttpRequest(
    {
      method: "POST",
      url: "https://api.pureaistudios.com/consume-credit",
      headers: { get: (h) => (h.toLowerCase() === "origin" ? "https://pureaistudios.com" : "") },
      text: async () => JSON.stringify({ code: "cs_live_pack10_session_00000001", count: 9, opId: "op_batch_002" })
    },
    secEnv,
    hybridStore
  );
  assert.strictEqual(JSON.parse(consumeBatch9Res.body).creditsRemaining, 0, "CRO-LEDGER-03: Consumir lote de 9 créditos debe dejar el saldo en 0");
  assert.strictEqual(JSON.parse(consumeBatch9Res.body).status, "EXPIRED", "CRO-LEDGER-03b: Al llegar a 0 créditos el estado debe pasar a EXPIRED");

  const consumeExhaustedRes = await webhookEngine.handleWorkerHttpRequest(
    {
      method: "POST",
      url: "https://api.pureaistudios.com/consume-credit",
      headers: { get: (h) => (h.toLowerCase() === "origin" ? "https://pureaistudios.com" : "") },
      text: async () => JSON.stringify({ code: "cs_live_pack10_session_00000001", count: 1, opId: "op_over_003" })
    },
    secEnv,
    hybridStore
  );
  assert.strictEqual(consumeExhaustedRes.status, 403, "CRO-LEDGER-04: Consumir con saldo 0 debe rechazarse con HTTP 403");
  assert.strictEqual(JSON.parse(consumeExhaustedRes.body).reason, "insufficient_credits", "CRO-LEDGER-04b: Debe indicar insufficient_credits");

  const verifyExhaustedRes = await webhookEngine.handleWorkerHttpRequest(
    { method: "GET", url: "https://api.pureaistudios.com/verify-license?code=cs_live_pack10_session_00000001&did=inst_pack10_dev_01", headers: { get: (h) => (h.toLowerCase() === "origin" ? "https://pureaistudios.com" : "") } },
    secEnv,
    hybridStore
  );
  assert.strictEqual(JSON.parse(verifyExhaustedRes.body).valid, false, "CRO-LEDGER-05: Un Pack con 0 créditos debe devolver valid=false en /verify-license");

  // 20c. Control Anti-Incógnito por hash salado efímero en POST /check-free-quota (sin guardar IP en claro)
  const testIncogIp = "198.51.100.211";
  const fqFirst = await webhookEngine.handleWorkerHttpRequest(
    {
      method: "POST",
      url: "https://api.pureaistudios.com/check-free-quota",
      headers: { get: (h) => (h.toLowerCase() === "cf-connecting-ip" ? testIncogIp : h.toLowerCase() === "origin" ? "https://pureaistudios.com" : "") },
      text: async () => JSON.stringify({ consume: true })
    },
    secEnv,
    hybridStore
  );
  assert.strictEqual(JSON.parse(fqFirst.body).allowed, true, "CRO-INCOG-01: La 1ª exportación gratuita desde una IP nueva debe permitirse");
  assert.strictEqual(JSON.parse(fqFirst.body).used, 1, "CRO-INCOG-01b: El contador efímero debe quedar en 1");

  const fqSecondIncognito = await webhookEngine.handleWorkerHttpRequest(
    {
      method: "POST",
      url: "https://api.pureaistudios.com/check-free-quota",
      headers: { get: (h) => (h.toLowerCase() === "cf-connecting-ip" ? testIncogIp : h.toLowerCase() === "origin" ? "https://pureaistudios.com" : "") },
      text: async () => JSON.stringify({ consume: false })
    },
    secEnv,
    hybridStore
  );
  assert.strictEqual(JSON.parse(fqSecondIncognito.body).allowed, false, "CRO-INCOG-02: Abrir ventana de Incógnito desde la misma IP tras agotar la prueba gratuita debe recibir allowed=false");
  const allKvKeysDump = Array.from(secEnv.PUREAI_LICENSES_KV._m.keys()).join(" ");
  assert(!allKvKeysDump.includes(testIncogIp), "CRO-INCOG-03 (RGPD): La dirección IP nunca debe almacenarse en texto claro en KV, solo hash HMAC salado");

  // 20d. CRO UI: Barra de Presets 1-Clic encima de #btn-scrub-img, Vista Previa anti-XSS en #pro-modal-asset-preview y Downsell colapsado
  const posPresetBar = cleanAiHtml.indexOf('id="quick-exif-preset-bar"');
  const posScrubBtn = cleanAiHtml.indexOf('id="btn-scrub-img"');
  assert(posPresetBar > 0 && posPresetBar < posScrubBtn, "CRO-UX-01: La barra rápida de presets EXIF (#quick-exif-preset-bar) debe aparecer ENCIMA del botón de descarga (#btn-scrub-img)");
  assert(!/<details[^>]*id="pro-modal-downsell"[^>]*open/i.test(cleanAiHtml), "CRO-UX-02: El bloque de escape gratuito (#pro-modal-downsell) debe permanecer cerrado por defecto para no canibalizar el checkout");

  paSandbox.loadedImgFile = { name: '"><img src=x onerror=alert(99)>.jpg', size: 8192, type: "image/jpeg" };
  paSandbox.batchQueue = [paSandbox.loadedImgFile];
  paSandbox.showProModal("🔒 Desbloquea exportación", "img_c2pa_scrubber");
  const modalPrevHtml = getPaEl("pro-modal-asset-preview").innerHTML;
  assert.strictEqual(getPaEl("pro-modal-asset-preview").style.display, "flex", "CRO-UX-03: showProModal debe mostrar la vista previa del activo bloqueado (#pro-modal-asset-preview)");
  assert(!modalPrevHtml.includes("<img src=x onerror=alert(99)>") && modalPrevHtml.includes("&lt;img src=x onerror=alert(99)&gt;"), "CRO-SEC-01: #pro-modal-asset-preview debe escapar nombres de archivo maliciosos contra DOM XSS");

  console.log("✅ QA TEST SUITE PASSED (20 SECCIONES / 270+ ASERCIONES): 100% E2E VM + Hybrid Credit Packs (2,99 € / 9,90 € / 39 €) + Atomic Credit Ledger (/consume-credit) + Anti-Incognito Quota (/check-free-quota) + CRO Paywall Asset Preview + Round-2 Adversarial Security + Pre-Incorporation Gate + Mom-Test Scorer + 5 Core Validation Tests + 90-Day Bottleneck Diagnostics + Batch Mixto Foto/MP4 + Lossless JPEG + MP4 Camera Udta + EXIF GPS 0x8825 + Pagos/Webhooks KV + CFO + Legal/AI Act + Ciberseguridad verificadas sin errores.");
})();



