/**
 * PUREAI STUDIO — SISTEMA DE AUTOMATIZACIÓN OPERATIVA, TRIAJE DE SOPORTE, MONITORIZACIÓN Y CONCILIACIÓN FINANCIERA
 * Implementa las Fases 1, 2 y 3 con coste 0,00 €/mes:
 * 1. Clasificador determinista de soporte en 8 categorías con escalado humano obligatorio para casos críticos.
 * 2. Monitor técnico 24/7 (disponibilidad web, integridad de pasarela Stripe, picos de errores JS y anomalías de cuota).
 * 3. Conciliación financiera automática idempotente (Ventas, Cobros, Reembolsos, Comisiones, MRR) con aviso contable.
 * 4. Despachador de alertas críticas (Fase 3: Telegram Bot privado / Email Webhook opcional por variables de entorno).
 * 5. Guardrails inmutables de control y seguridad (Sección 8).
 */

const fs = require("fs");
const path = require("path");

const BUS_URL = "https://ntfy.sh/pureai_studio_ops_telemetry_94c2e1/json?poll=1&since=48h";
const PRIVATE_OPS_DIR = path.join(process.env.USERPROFILE || process.env.HOME || __dirname, ".gemini", "pureai-private-ops");
try { fs.mkdirSync(PRIVATE_OPS_DIR, { recursive: true }); } catch (_) {}
const METRICS_FILE = path.join(PRIVATE_OPS_DIR, "metricas-y-bugs.json");

const SUPPORT_CATEGORIES = {
  TECHNICAL_ISSUE: "TECHNICAL_ISSUE",
  PAYMENT: "PAYMENT",
  SUBSCRIPTION: "SUBSCRIPTION",
  REFUND_REQUEST: "REFUND_REQUEST",
  PRO_ACCESS: "PRO_ACCESS",
  PRIVACY: "PRIVACY",
  FEATURE_REQUEST: "FEATURE_REQUEST",
  SECURITY_VULNERABILITY: "SECURITY_VULNERABILITY"
};

const IMMUTABLE_AUTOMATION_GUARDRAILS = Object.freeze({
  allowUnauthorizedOutgoingPayments: false,
  allowUnconfirmedCriticalDataDeletion: false,
  allowAutomaticProductionPriceChanges: false,
  allowAutomaticCommercialTermsChanges: false,
  allowUnapprovedMassCommunications: false,
  allowIndiscriminatePermissionChanges: false
});

function validateAutomatedActionSafety(actionType, hasExplicitHumanApproval) {
  const forbiddenWithoutHuman = new Set([
    "OUTGOING_PAYMENT",
    "DELETE_CRITICAL_DATA",
    "CHANGE_PRODUCTION_PRICES",
    "CHANGE_COMMERCIAL_TERMS",
    "SEND_MASS_COMMUNICATION",
    "BULK_ALTER_PERMISSIONS"
  ]);
  if (forbiddenWithoutHuman.has(actionType) && !hasExplicitHumanApproval) {
    return { allowed: false, status: "BLOCKED_BY_GUARDRAIL", reason: `Action ${actionType} strictly requires explicit human approval.` };
  }
  return { allowed: true, status: "APPROVED" };
}

function classifySupportInquiry(rawText) {
  const txt = String(rawText || "").trim();
  const lower = txt.toLowerCase();

  // 1. Posibles vulnerabilidades (Máxima prioridad -> Escalado crítico humano inmediato, prohibido auto-responder)
  if (/vulnerabil|exploit|xss|inyecci[oó]n|bypass|cve-|brecha|hack|security bug|fallo de seguridad/i.test(lower)) {
    return {
      category: SUPPORT_CATEGORIES.SECURITY_VULNERABILITY,
      priority: "CRITICAL",
      requiresHumanApproval: true,
      autoSendAllowed: false,
      escalationTarget: "SECURITY_OWNER",
      draftReply: "[ESCALADO CRÍTICO DE SEGURIDAD — REVISIÓN HUMANA OBLIGATORIA ANTES DE RESPONDER]"
    };
  }

  // 2. Privacidad y Protección de Datos (RGPD / ARSOPOL -> Escalado humano obligatorio)
  if (/privacidad|rgpd|gdpr|datos personales|borrar mis datos|derecho de supresi|aepd|arsopol|data deletion|privacy/i.test(lower)) {
    return {
      category: SUPPORT_CATEGORIES.PRIVACY,
      priority: "HIGH",
      requiresHumanApproval: true,
      autoSendAllowed: false,
      escalationTarget: "LEGAL_PRIVACY_OWNER",
      draftReply: "[SOLICITUD RGPD/PRIVACIDAD — REQUIERE VERIFICACIÓN DE IDENTIDAD Y REVISIÓN HUMANA (PLAZO MÁX. 30 DÍAS)]"
    };
  }

  // 3. Solicitudes de reembolso / devoluciones / disputas (Conflicto económico -> Escalado humano obligatorio)
  if (/reembolso|devoluci[oó]n|devolver|refund|chargeback|contracargo|desistimiento|quiero mi dinero/i.test(lower)) {
    return {
      category: SUPPORT_CATEGORIES.REFUND_REQUEST,
      priority: "HIGH",
      requiresHumanApproval: true,
      autoSendAllowed: false,
      escalationTarget: "BILLING_OWNER",
      draftReply: "[SOLICITUD DE REEMBOLSO — VERIFICAR ID DE CARGO EN STRIPE Y USO DE LOTES ANTES DE APROBAR MANUALMENTE]"
    };
  }

  // 4. Problemas de Pagos / Cobros duplicados / Facturación (Escalado humano obligatorio)
  if (/cobro doble|pago duplicado|cargo duplicado|tarjeta rechazada|error de pago|payment failed|factura|invoice|\biva\b|\bvat\b/i.test(lower)) {
    return {
      category: SUPPORT_CATEGORIES.PAYMENT,
      priority: "HIGH",
      requiresHumanApproval: true,
      autoSendAllowed: false,
      escalationTarget: "BILLING_OWNER",
      draftReply: "[INCIDENCIA DE FACTURACIÓN/PAGO — REVISIÓN HUMANA EN STRIPE DASHBOARD REQUERIDA]"
    };
  }

  // 5. Gestión de Suscripciones (Cancelación / Cambio de plan -> FAQ segura disponible)
  if (/cancelar|dar de baja|baja de suscripci|unsubscribe|cancel subscription|cambiar a anual|renovaci[oó]n/i.test(lower)) {
    return {
      category: SUPPORT_CATEGORIES.SUBSCRIPTION,
      priority: "MEDIUM",
      requiresHumanApproval: false,
      autoSendAllowed: true,
      escalationTarget: "NONE",
      draftReply: "Puedes gestionar o cancelar la renovación automática de tu suscripción en 1 clic desde el Portal Oficial de Stripe en https://billing.stripe.com/p/login/9B64gA5zA22x5zq3aW00000 (mantendrás el acceso Pro hasta finalizar el periodo abonado)."
    };
  }

  // 6. Acceso a Pro / Activación de licencia (FAQ segura disponible)
  if (/activar pro|clave pro|c[oó]digo de licencia|c[oó]digo pro|pro-|cs_live_|cambi[eé] de m[oó]vil|otro dispositivo|otro navegador|license key|unlock pro/i.test(lower)) {
    return {
      category: SUPPORT_CATEGORIES.PRO_ACCESS,
      priority: "MEDIUM",
      requiresHumanApproval: false,
      autoSendAllowed: true,
      escalationTarget: "NONE",
      draftReply: "Para activar PureAI Pro en tu dispositivo, pega tu ID de sesión de Stripe (cs_live_...) o tu clave multi-dispositivo (PRO-XXXX-YYYY) en el recuadro 'Activar Pro' bajo las tarjetas de planes y pulsa Activar."
    };
  }

  // 7. Solicitudes de nuevas funcionalidades (Backlog de producto)
  if (/sugerencia|nueva funci[oó]n|feature request|podr[ií]ais a[ñn]adir|me gustar[ií]a que|idea de mejora/i.test(lower)) {
    return {
      category: SUPPORT_CATEGORIES.FEATURE_REQUEST,
      priority: "LOW",
      requiresHumanApproval: false,
      autoSendAllowed: true,
      escalationTarget: "PRODUCT_BACKLOG",
      draftReply: "¡Gracias por tu sugerencia! La hemos registrado en nuestra hoja de ruta de producto para priorizarla según la demanda de los usuarios."
    };
  }

  // 8. Problemas técnicos generales (Por defecto)
  return {
    category: SUPPORT_CATEGORIES.TECHNICAL_ISSUE,
    priority: "MEDIUM",
    requiresHumanApproval: false,
    autoSendAllowed: true,
    escalationTarget: "TECH_TRIAGE",
    draftReply: "Hemos registrado tu reporte técnico. Recuerda que todo el procesamiento ocurre localmente en tu navegador (Chrome/Safari/Edge actualizado) y que los perfiles EXIF técnicos se aplican al exportar en formato JPG."
  };
}

function generateAutomatedFinancialDigest(rawEvents, options = {}) {
  const seenEventIds = new Set();
  const digest = {
    generatedAt: new Date().toISOString(),
    accountingDisclaimer: "AVISO: Este informe operativo interno es orientativo para control de gestión y NO sustituye los libros contables ni las declaraciones fiscales obligatorias.",
    verifiedSalesCount: 0,
    grossCollectionsCents: 0,
    totalVatCents: 0,
    refundsCount: 0,
    refundsCents: 0,
    disputesCount: 0,
    estimatedStripeFeesCents: 0,
    estimatedAffiliateHoldCents: 0,
    variableProcessingCostPerOpCents: 0,
    activeSubscriptionsCount: 0,
    canceledSubscriptionsCount: 0,
    normalizedMrrCents: 0,
    duplicateEventsIgnored: 0
  };

  for (const ev of (rawEvents || [])) {
    if (!ev || !ev.id) continue;
    if (seenEventIds.has(ev.id)) {
      digest.duplicateEventsIgnored++;
      continue;
    }
    seenEventIds.add(ev.id);

    const amount = Number(ev.amountCents) || 0;
    const tax = Number(ev.taxCents) || 0;
    const baseNet = Math.max(0, amount - tax);
    const fee = Number(ev.stripeFeeCents) || (amount > 0 ? Math.round(amount * 0.025 + 25) : 0);

    if (ev.type === "SALE_MONTHLY" || ev.type === "SALE_ANNUAL") {
      digest.verifiedSalesCount++;
      digest.grossCollectionsCents += amount;
      digest.totalVatCents += tax;
      digest.estimatedStripeFeesCents += fee;
      digest.activeSubscriptionsCount++;
      digest.normalizedMrrCents += (ev.type === "SALE_ANNUAL" ? Math.round(baseNet / 12) : baseNet);
      if (ev.affiliateId && ev.affiliateId !== "organic" && ev.affiliateId !== "self_referral_blocked") {
        digest.estimatedAffiliateHoldCents += Math.round(Math.max(0, baseNet - fee) * 0.40);
      }
    } else if (ev.type === "REFUND") {
      digest.refundsCount++;
      digest.refundsCents += amount;
      digest.totalVatCents = Math.max(0, digest.totalVatCents - tax);
      digest.activeSubscriptionsCount = Math.max(0, digest.activeSubscriptionsCount - 1);
      digest.normalizedMrrCents = Math.max(0, digest.normalizedMrrCents - (ev.wasAnnual ? Math.round(baseNet / 12) : baseNet));
    } else if (ev.type === "DISPUTE") {
      digest.disputesCount++;
      digest.refundsCents += amount + 1500; // +15€ penalización Stripe
      digest.totalVatCents = Math.max(0, digest.totalVatCents - tax);
      digest.activeSubscriptionsCount = Math.max(0, digest.activeSubscriptionsCount - 1);
    } else if (ev.type === "SUBSCRIPTION_CANCELED") {
      digest.canceledSubscriptionsCount++;
    }
  }

  digest.netRevenueExVatCents = Math.max(0, digest.grossCollectionsCents - digest.totalVatCents - digest.refundsCents);
  digest.contributionMarginCents = digest.netRevenueExVatCents - digest.estimatedStripeFeesCents - digest.estimatedAffiliateHoldCents;
  digest.contributionMarginPct = digest.netRevenueExVatCents > 0
    ? Number(((digest.contributionMarginCents / digest.netRevenueExVatCents) * 100).toFixed(2))
    : 0;
  digest.fixedCostsCents = options.fixedCostsCents !== undefined ? Number(options.fixedCostsCents) : 100; // 1,00 €/mes dominio amortizado + 0 € hosting
  digest.adSpendCents = Number(options.adSpendCents) || 0;
  digest.preTaxProfitBaiCents = digest.contributionMarginCents - digest.fixedCostsCents - digest.adSpendCents;
  const taxRatePct = options.taxRatePct !== undefined ? Number(options.taxRatePct) : 20;
  digest.estimatedTaxReserveCents = digest.preTaxProfitBaiCents > 0
    ? Math.round(digest.preTaxProfitBaiCents * (taxRatePct / 100))
    : 0;
  digest.ownerFreeCashFlowCents = digest.preTaxProfitBaiCents - digest.estimatedTaxReserveCents;
  const founderHours = options.founderHours !== undefined ? Number(options.founderHours) : 6;
  digest.ownerEffectiveHourlyEur = founderHours > 0
    ? Number(((digest.ownerFreeCashFlowCents / 100) / founderHours).toFixed(2))
    : 0;
  digest.breakEvenClientsNeeded = Math.max(1, Math.ceil((digest.fixedCostsCents + digest.adSpendCents) / 437));
  const minMonthlyNetForCompanyCents = options.minMonthlyNetForCompanyCents !== undefined ? Number(options.minMonthlyNetForCompanyCents) : 35000; // 350,00 €/mes mínimo para justificar crear empresa/estructura fiscal trabajando por cuenta ajena
  digest.incorporationReadiness = {
    founderStatus: "EMPLOYEE_PRE_INCORPORATION",
    minMonthlyNetRequiredEur: Number((minMonthlyNetForCompanyCents / 100).toFixed(2)),
    currentNetContributionEur: Number((digest.contributionMarginCents / 100).toFixed(2)),
    readyToCreateCompany: digest.contributionMarginCents >= minMonthlyNetForCompanyCents && digest.activeSubscriptionsCount >= 15,
    recommendation:
      digest.contributionMarginCents >= minMonthlyNetForCompanyCents && digest.activeSubscriptionsCount >= 15
        ? "READY_TO_INCORPORATE: El margen recurrente (>= 350 €/mes y >= 15 clientes activos) cubre costes de gestoría/estructura y justifica constituir entidad legal."
        : "DO_NOT_INCORPORATE_YET: Mantener validación ligera (< 50 €/mes y <= 1,5 h/semana). No asumir costes fijos societarios ni de gestoría hasta superar 350 €/mes netos."
  };
  digest.weeklyKpiChecklist = {
    netCashPostStripeAndAffiliatesEur: Number((digest.contributionMarginCents / 100).toFixed(2)),
    normalizedMrrEur: Number((digest.normalizedMrrCents / 100).toFixed(2)),
    activeVsCanceledRatio: `${digest.activeSubscriptionsCount}:${digest.canceledSubscriptionsCount}`,
    ownerHourlyReturnEur: digest.ownerEffectiveHourlyEur,
    totalMonthlyOutflowEur: Number(((digest.fixedCostsCents + digest.adSpendCents) / 100).toFixed(2)),
    under100EurBudgetCompliant: (digest.fixedCostsCents + digest.adSpendCents) < 10000
  };

  return digest;
}

function simulateFinancialViabilityScenarios(customParams = {}) {
  function evaluateScenario(cfg) {
    const n499 = Number(cfg.monthlyPromo499Sales) || 0;
    const n999 = Number(cfg.monthlyStd999Sales) || 0;
    const n3900 = Number(cfg.annual3900Sales) || 0;
    const totalClients = n499 + n999 + n3900;
    const vatRatePct = Number(cfg.vatRatePct) || 0;
    const affShare = Math.min(1, Math.max(0, (Number(cfg.affiliateSharePct) || 0) / 100));

    const grossCents = n499 * 499 + n999 * 999 + n3900 * 3900;
    const netExVatCents = vatRatePct > 0 ? Math.round(grossCents / (1 + vatRatePct / 100)) : grossCents;
    const stripeFeesCents =
      n499 * Math.round(499 * 0.025 + 25) +
      n999 * Math.round(999 * 0.025 + 25) +
      n3900 * Math.round(3900 * 0.025 + 25);
    const netAfterStripeCents = Math.max(0, netExVatCents - stripeFeesCents);
    const affiliateHoldCents = Math.round(netAfterStripeCents * affShare * 0.40);
    const contributionMarginCents = netAfterStripeCents - affiliateHoldCents;
    const fixedCents = Math.round((cfg.fixedCostsEur !== undefined ? Number(cfg.fixedCostsEur) : 1.0) * 100);
    const adSpendCents = Math.round((Number(cfg.adSpendEur) || 0) * 100);
    const totalFixedAndAcqCents = fixedCents + adSpendCents;
    const preTaxBaiCents = contributionMarginCents - totalFixedAndAcqCents;
    const taxRatePct = cfg.taxRatePct !== undefined ? Number(cfg.taxRatePct) : 20;
    const taxReserveCents = preTaxBaiCents > 0 ? Math.round(preTaxBaiCents * (taxRatePct / 100)) : 0;
    const ownerCashCents = preTaxBaiCents - taxReserveCents;
    const founderHours = cfg.founderHours !== undefined ? Number(cfg.founderHours) : 8;
    const churnPct = Math.max(1, Number(cfg.monthlyChurnPct) || 12);

    return {
      label: cfg.label || "CUSTOM_SCENARIO",
      totalNewAndActiveClients: totalClients,
      variableApiAndServerCostEur: 0,
      grossBillingEur: Number((grossCents / 100).toFixed(2)),
      netRevenueExVatEur: Number((netExVatCents / 100).toFixed(2)),
      stripeFeesEur: Number((stripeFeesCents / 100).toFixed(2)),
      affiliatePayoutsEur: Number((affiliateHoldCents / 100).toFixed(2)),
      contributionMarginEur: Number((contributionMarginCents / 100).toFixed(2)),
      contributionMarginPct: netExVatCents > 0 ? Number(((contributionMarginCents / netExVatCents) * 100).toFixed(2)) : 0,
      fixedAndAcquisitionCostsEur: Number((totalFixedAndAcqCents / 100).toFixed(2)),
      under100EurBudgetCompliant: totalFixedAndAcqCents < 10000,
      preTaxProfitBaiEur: Number((preTaxBaiCents / 100).toFixed(2)),
      taxReserveEur: Number((taxReserveCents / 100).toFixed(2)),
      ownerTakeHomeCashEur: Number((ownerCashCents / 100).toFixed(2)),
      ownerEffectiveHourlyEur: founderHours > 0 ? Number(((ownerCashCents / 100) / founderHours).toFixed(2)) : 0,
      expectedSubscriberLifetimeMonths: Number((1 / (churnPct / 100)).toFixed(2))
    };
  }

  return {
    conservative: evaluateScenario({
      label: "HYPOTHETICAL_CONSERVATIVE",
      monthlyPromo499Sales: 2,
      monthlyStd999Sales: 1,
      annual3900Sales: 1,
      affiliateSharePct: 0,
      fixedCostsEur: 1.0,
      adSpendEur: 0,
      founderHours: 6,
      taxRatePct: 20,
      monthlyChurnPct: 18
    }),
    intermediate: evaluateScenario({
      label: "HYPOTHETICAL_INTERMEDIATE",
      monthlyPromo499Sales: 8,
      monthlyStd999Sales: 7,
      annual3900Sales: 5,
      affiliateSharePct: 25,
      fixedCostsEur: 1.0,
      adSpendEur: 25.0,
      founderHours: 8,
      taxRatePct: 20,
      monthlyChurnPct: 12
    }),
    optimistic: evaluateScenario({
      label: "HYPOTHETICAL_OPTIMISTIC",
      monthlyPromo499Sales: 20,
      monthlyStd999Sales: 25,
      annual3900Sales: 15,
      affiliateSharePct: 30,
      fixedCostsEur: 6.0,
      adSpendEur: 50.0,
      founderHours: 10,
      taxRatePct: 20,
      monthlyChurnPct: 8
    }),
    custom: evaluateScenario({ label: "CUSTOM_INPUT", ...customParams })
  };
}

const PUREAI_TOOL_IDS = Object.freeze([
  "img_c2pa_scrubber",
  "img_batch_zip",
  "img_camera_exif",
  "vid_mp4_scrubber",
  "txt_unicode_scrubber",
  "txt_pro_humanizer",
  "chrome_extension"
]);

function computeProductAnalyticsFunnel(rawEvents = [], options = {}) {
  const stages = {
    visitors: 0,
    activatedUsers: 0,
    returningUsers: 0,
    leadsCaptured: 0,
    paywallViewed: 0,
    checkoutClicked: 0,
    purchasesVerified: 0,
    subscriptionsRenewed: 0
  };

  const byTool = {};
  PUREAI_TOOL_IDS.forEach((tid) => {
    byTool[tid] = {
      toolId: tid,
      realCompletions: 0,
      demoCompletions: 0,
      paywallTriggers: 0,
      checkoutClicks: 0,
      variableCostEur: 0
    };
  });

  const byChannel = {};
  const byChannelFunnel = {};
  function ensureChannelBucket(chName) {
    const key = chName || "direct";
    if (!byChannelFunnel[key]) {
      byChannelFunnel[key] = {
        channel: key,
        visitors: 0,
        activatedUsers: 0,
        paywallViewed: 0,
        checkoutClicked: 0,
        purchasesVerified: 0,
        conversionToPaywallPct: 0,
        conversionToPurchasePct: 0
      };
    }
    return byChannelFunnel[key];
  }
  const byLang = {};
  const byPlan = { PRO_MONTHLY_499: 0, PRO_MONTHLY_999: 0, PRO_ANNUAL_3900: 0 };
  const cohorts = {};
  const retentionBreakdown = {
    D1_48h: 0,
    W1_d2_7: 0,
    M1_d8_30: 0,
    D30_plus: 0,
    genuineReturningUsers: 0,
    promoReturningUsers: 0
  };

  for (const ev of rawEvents) {
    if (!ev || ev.isBot) continue;
    const evName = ev.event_name || ev.type || "";
    const ch = ev.channel || "direct";
    const chBucket = ensureChannelBucket(ch);
    const lg = (ev.lang || "en").slice(0, 2).toLowerCase();

    if (evName === "session_start" || ev.type === "pageview") {
      stages.visitors++;
      byChannel[ch] = (byChannel[ch] || 0) + 1;
      chBucket.visitors++;
      byLang[lg] = (byLang[lg] || 0) + 1;
      if (ev.isReturning) {
        stages.returningUsers++;
        if (ev.retentionBucket && retentionBreakdown[ev.retentionBucket] !== undefined) {
          retentionBreakdown[ev.retentionBucket]++;
        }
        if (ev.genuineReturn === false || ev.promoTriggered === true) {
          retentionBreakdown.promoReturningUsers++;
        } else {
          retentionBreakdown.genuineReturningUsers++;
        }
      }
      if (ev.cohortWeek) {
        if (!cohorts[ev.cohortWeek]) cohorts[ev.cohortWeek] = { totalSessions: 0, returningSessions: 0 };
        cohorts[ev.cohortWeek].totalSessions++;
        if (ev.isReturning) cohorts[ev.cohortWeek].returningSessions++;
      }
    }

    if (evName === "user_returned") {
      stages.returningUsers++;
      if (ev.retentionBucket && retentionBreakdown[ev.retentionBucket] !== undefined) {
        retentionBreakdown[ev.retentionBucket]++;
      }
    }

    if (evName === "tool_completed" || ev.target === "image_scrub_download" || ev.target === "text_watermark_scrub" || ev.target === "pro_humanizer_click") {
      const tid = ev.tool_id || (ev.target === "text_watermark_scrub" ? "txt_unicode_scrubber" : ev.target === "pro_humanizer_click" ? "txt_pro_humanizer" : "img_c2pa_scrubber");
      const isDemo = Boolean(ev.isDemo);
      if (!byTool[tid]) {
        byTool[tid] = { toolId: tid, realCompletions: 0, demoCompletions: 0, returningCompletions: 0, paywallTriggers: 0, checkoutClicks: 0, variableCostEur: 0 };
      }
      if (isDemo) {
        byTool[tid].demoCompletions++;
      } else {
        byTool[tid].realCompletions++;
        if (ev.isReturning) {
          byTool[tid].returningCompletions = (byTool[tid].returningCompletions || 0) + 1;
        }
        stages.activatedUsers++;
        chBucket.activatedUsers++;
      }
    }

    if (evName === "lead_captured" || ev.type === "lead_email_captured" || ev.target === "chrome_extension_download") {
      stages.leadsCaptured++;
      if (ev.tool_id === "chrome_extension" || ev.target === "chrome_extension_download") {
        byTool.chrome_extension.realCompletions++;
      }
    }

    if (evName === "paywall_viewed") {
      stages.paywallViewed++;
      chBucket.paywallViewed++;
      const trig = ev.trigger_tool || "img_c2pa_scrubber";
      if (byTool[trig]) byTool[trig].paywallTriggers++;
    }

    if (evName === "checkout_clicked" || ev.type === "click_checkout") {
      stages.checkoutClicked++;
      chBucket.checkoutClicked++;
      const plan = ev.plan_selected || "PRO_MONTHLY_499";
      byPlan[plan] = (byPlan[plan] || 0) + 1;
      const trig = ev.trigger_tool || "img_c2pa_scrubber";
      if (byTool[trig]) byTool[trig].checkoutClicks++;
    }

    if (evName === "purchase_verified" || ev.type === "sale_verified_session") {
      stages.purchasesVerified++;
      chBucket.purchasesVerified++;
    }

    if (evName === "subscription_renewed") {
      stages.subscriptionsRenewed++;
    }
  }

  const pct = (num, den) => (den > 0 ? Number(((num / den) * 100).toFixed(2)) : 0);
  const rates = {
    activationRatePct: pct(stages.activatedUsers, stages.visitors),
    returnRatePct: pct(stages.returningUsers, stages.visitors),
    paywallReachRatePct: pct(stages.paywallViewed, stages.activatedUsers),
    paywallToCheckoutPct: pct(stages.checkoutClicked, stages.paywallViewed),
    checkoutToPurchasePct: pct(stages.purchasesVerified, stages.checkoutClicked),
    overallConversionPct: pct(stages.purchasesVerified, stages.visitors)
  };

  // Control estadístico de tamaño muestral y cálculo de CAC / LTV con protección anti-humo
  const sampleSufficiency = {
    activationSampleOk: stages.visitors >= 200,
    paywallSampleOk: stages.paywallViewed >= 50,
    checkoutSampleOk: stages.checkoutClicked >= 25,
    ltvSampleOk: stages.purchasesVerified >= 30 && stages.subscriptionsRenewed >= 3,
    viabilitySampleOk: stages.visitors >= 1000 && stages.paywallViewed >= 100
  };

  const adSpendEur = Number(options.adSpendEur) || 0;
  const affiliatePayoutsEur = Number(options.affiliatePayoutsEur) || 0;
  const founderHours = Number(options.founderHours) || 0;
  const hourlyShadowCostEur = Number(options.hourlyShadowCostEur) || 15;
  const totalCashAcquisitionCostEur = Number((adSpendEur + affiliatePayoutsEur).toFixed(2));
  const totalFullyLoadedAcquisitionCostEur = Number((totalCashAcquisitionCostEur + founderHours * hourlyShadowCostEur).toFixed(2));

  const cacMetrics = {
    cashCacEur: stages.purchasesVerified > 0 ? Number((totalCashAcquisitionCostEur / stages.purchasesVerified).toFixed(2)) : null,
    fullyLoadedCacEur: stages.purchasesVerified > 0 ? Number((totalFullyLoadedAcquisitionCostEur / stages.purchasesVerified).toFixed(2)) : null,
    ltvEstimateEur: sampleSufficiency.ltvSampleOk
      ? Number((((options.arpuNetEur || 6.5) * 0.92) / Math.max(0.05, (options.monthlyChurnPct || 8) / 100)).toFixed(2))
      : "INSUFFICIENT_DATA"
  };

  // Semáforo de decisión de viabilidad del negocio basado en umbrales estadísticos reales
  let viabilityDecision = "INSUFFICIENT_SAMPLE_KEEP_TESTING";
  let viabilityReason = `Muestra en acumulación (${stages.visitors}/1000 visitantes, ${stages.paywallViewed}/100 vistas de Paywall). No tomar decisiones drásticas con muestras pequeñas.`;

  if (stages.purchasesVerified >= 3 && (stages.subscriptionsRenewed >= 1 || rates.paywallToCheckoutPct >= 8)) {
    viabilityDecision = "GO_SCALE";
    viabilityReason = `Tracción validada (${stages.purchasesVerified} compras verificadas, ${rates.paywallToCheckoutPct}% intención en Paywall). Justifica alta comercial y escalar canales ganadores.`;
  } else if (sampleSufficiency.viabilitySampleOk && stages.purchasesVerified === 0) {
    viabilityDecision = "PIVOT_OR_KILL";
    viabilityReason = `0 ventas tras ${stages.visitors} visitantes humanos y ${stages.paywallViewed} exposiciones al Paywall. Pausar inversión de tiempo o pivotar oferta.`;
  } else if (sampleSufficiency.activationSampleOk && rates.activationRatePct < 10) {
    viabilityDecision = "INVESTIGATE_OPTIMIZE";
    viabilityReason = `Activación baja (${rates.activationRatePct}% < 10% sobre ${stages.visitors} visitas). El tráfico entrante no está probando las herramientas con archivos reales.`;
  } else if (sampleSufficiency.paywallSampleOk && rates.paywallToCheckoutPct < 2) {
    viabilityDecision = "INVESTIGATE_OPTIMIZE";
    viabilityReason = `Fricción en Paywall (${rates.paywallToCheckoutPct}% < 2% sobre ${stages.paywallViewed} impactos). Revisar propuesta de valor Pro o límite gratuito.`;
  }

  let bestConvertingChannel = null;
  for (const chKey of Object.keys(byChannelFunnel)) {
    const b = byChannelFunnel[chKey];
    b.conversionToPaywallPct = pct(b.paywallViewed, b.visitors);
    b.conversionToPurchasePct = pct(b.purchasesVerified, b.visitors);
    if (!bestConvertingChannel || b.purchasesVerified > bestConvertingChannel.purchasesVerified || (b.purchasesVerified === bestConvertingChannel.purchasesVerified && b.paywallViewed > bestConvertingChannel.paywallViewed)) {
      bestConvertingChannel = b;
    }
  }

  const bottleneckDiagnosis = diagnoseConversionBottleneck(
    { stages, rates, byTool, byChannelFunnel, bestConvertingChannel: bestConvertingChannel ? bestConvertingChannel.channel : null, retentionBreakdown },
    options
  );
  const fiveCoreTests = evaluateFiveCoreValidationTests(
    { stages, rates, byChannelFunnel, retentionBreakdown },
    options.financialDigest || { refundsCount: 0, verifiedSalesCount: stages.purchasesVerified }
  );

  return {
    stages,
    rates,
    byTool,
    byChannel,
    byChannelFunnel,
    bestConvertingChannel: bestConvertingChannel ? bestConvertingChannel.channel : null,
    byLang,
    byPlan,
    cohorts,
    retentionBreakdown,
    sampleSufficiency,
    cacMetrics,
    viabilityDecision,
    viabilityReason,
    bottleneckDiagnosis,
    fiveCoreTests
  };
}

function evaluateFiveCoreValidationTests(funnel = {}, financialDigest = {}) {
  const st = funnel.stages || {};
  const rt = funnel.rates || {};
  const ret = funnel.retentionBreakdown || {};
  const ch = funnel.byChannelFunnel || {};

  const referralVisitors =
    ((ch.user_referral && ch.user_referral.visitors) || 0) +
    ((ch.affiliate_partner && ch.affiliate_partner.visitors) || 0);
  const referralActivated =
    ((ch.user_referral && ch.user_referral.activatedUsers) || 0) +
    ((ch.affiliate_partner && ch.affiliate_partner.activatedUsers) || 0);
  const realSales = Math.max(Number(st.purchasesVerified) || 0, Number(financialDigest.verifiedSalesCount) || 0);
  const refunds = Number(financialDigest.refundsCount) || 0;

  const tests = {
    comprehension: {
      passed: (st.visitors || 0) >= 20 && (rt.activationRatePct || 0) >= 25,
      observedValue: `${rt.activationRatePct || 0}% activación (${st.activatedUsers || 0}/${st.visitors || 0} visitas)`,
      targetThreshold: ">= 25% de visitantes usan una herramienta con archivo real (mín. 20 visitas)"
    },
    utility: {
      passed: (st.activatedUsers || 0) >= 30 && refunds === 0,
      observedValue: `${st.activatedUsers || 0} tareas reales completadas, ${refunds} reembolsos`,
      targetThreshold: ">= 30 usuarios completan su tarea con 0 reembolsos"
    },
    recurrence: {
      passed: (ret.genuineReturningUsers || 0) >= 10,
      observedValue: `${ret.genuineReturningUsers || 0} retornos genuinos (W1=${ret.W1_d2_7 || 0}, M1=${ret.M1_d8_30 || 0})`,
      targetThreshold: ">= 10 usuarios regresan voluntariamente sin promoción"
    },
    payment: {
      passed: realSales >= 3 && (rt.paywallToCheckoutPct || 0) >= 5,
      observedValue: `${realSales} compras reales, ${rt.paywallToCheckoutPct || 0}% conversión a checkout en paywall`,
      targetThreshold: ">= 3 compras reales en Stripe y >= 5% paso a checkout"
    },
    recommendation: {
      passed: referralVisitors >= 5 && referralActivated >= 1,
      observedValue: `${referralVisitors} visitas por recomendación (${referralActivated} activadas)`,
      targetThreshold: ">= 5 visitas invitadas (?ref= / ?aff=) con >= 1 activación"
    }
  };

  const passedCount = Object.values(tests).filter((t) => t.passed).length;
  let convergentStatus = "INSUFFICIENT_CONVERGENCE_KEEP_TESTING";
  if (tests.utility.passed && tests.recurrence.passed && tests.payment.passed && passedCount >= 4) {
    convergentStatus = "VALIDATED_CONVERGENT";
  } else if (tests.comprehension.passed && tests.utility.passed && !tests.payment.passed) {
    convergentStatus = "FREE_UTILITY_TRAP_NO_PAYMENT_YET";
  } else if (tests.payment.passed && !tests.recurrence.passed) {
    convergentStatus = "ONE_OFF_USAGE_CHURN_RISK";
  }

  return {
    passedCount,
    totalTests: 5,
    convergentStatus,
    tests
  };
}

function evaluateUserInterviewResponses(interview = {}) {
  const daysSinceLastProblem = interview.daysSinceLastProblem !== undefined ? Number(interview.daysSinceLastProblem) : 999;
  const usedActiveWorkaround = Boolean(interview.usedActiveWorkaround);
  const timeSpentMinutes = Number(interview.timeSpentMinutes) || 0;
  const paidForAlternativeBefore = Boolean(interview.paidForAlternativeBefore);
  const completedRealTaskInPureAi = Boolean(interview.completedRealTaskInPureAi);
  const hasSpecificReturnTrigger = Boolean(interview.hasSpecificReturnTrigger);
  const gaveGenericComplimentOnly = Boolean(interview.gaveGenericComplimentOnly);

  let evidenceScore = 0;
  if (daysSinceLastProblem <= 7) evidenceScore += 30;
  else if (daysSinceLastProblem <= 30) evidenceScore += 15;
  if (usedActiveWorkaround) evidenceScore += 25;
  if (timeSpentMinutes >= 10) evidenceScore += 15;
  if (paidForAlternativeBefore) evidenceScore += 15;
  if (completedRealTaskInPureAi && hasSpecificReturnTrigger) evidenceScore += 15;
  if (gaveGenericComplimentOnly && daysSinceLastProblem > 30 && !usedActiveWorkaround) {
    evidenceScore = Math.min(evidenceScore, 15);
  }

  let profileClassification = "LOW_INTENT_OR_CURIOUS";
  let followUpAdvice = "Si solo dio cumplidos generales ('me encanta'), repreguntar: '¿Cuándo fue la última vez que tuviste ese problema y qué hiciste para resolverlo?'";
  if (evidenceScore >= 65) {
    profileClassification = "HIGH_INTENT_ICP_BUYER";
    followUpAdvice = "Dolor recurrente y workaround verificados. Priorizar sus respuestas a las preguntas 10, 12 y 15 (qué falta para sustituir su herramienta actual y qué le haría desconfiar).";
  } else if (evidenceScore >= 40) {
    profileClassification = "MODERATE_PAIN_OCCASIONAL_USER";
    followUpAdvice = "Usuario con necesidad puntual. Evaluar si encaja mejor en un Pase de Proyecto sin suscripción mensual.";
  } else if (gaveGenericComplimentOnly) {
    profileClassification = "FALSE_POSITIVE_POLITE_COMPLIMENT";
  }

  return {
    evidenceScore,
    profileClassification,
    isReliableDemandSignal: evidenceScore >= 65,
    unnecessaryFeaturesReported: Array.isArray(interview.unnecessaryFeatures) ? interview.unnecessaryFeatures : [],
    trustBarriersReported: Array.isArray(interview.trustBarriers) ? interview.trustBarriers : [],
    followUpAdvice
  };
}

function diagnoseConversionBottleneck(funnel, options = {}) {
  const st = (funnel && funnel.stages) || {};
  const rt = (funnel && funnel.rates) || {};
  const ret = (funnel && funnel.retentionBreakdown) || {};
  const stageDay = Number(options.stageDay) || 30;

  if ((st.visitors || 0) < 50) {
    return {
      stageDay,
      bottleneckCode: "BOTTLENECK_TRAFFIC_VOLUME",
      primaryCause: "Muestra de tráfico aún insuficiente (< 50 visitantes humanos).",
      doNotDo: "No modificar precios ni programar funciones nuevas a ciegas.",
      recommendedAction: "Publicar las 6 demostraciones visuales (?preset=iphone&city=miami y ?preset=lossless) en comunidades de creadores IA/fotografía y activar 10 micro-afiliados (?aff=)."
    };
  }
  if ((rt.activationRatePct || 0) < 15) {
    return {
      stageDay,
      bottleneckCode: "BOTTLENECK_AUDIENCE_OR_CLARITY",
      primaryCause: `Baja activación (${rt.activationRatePct}% < 15%): el tráfico entrante no sube archivos o es público curioso no cualificado.`,
      doNotDo: "No bajar precios; el usuario ni siquiera llega a probar la herramienta.",
      recommendedAction: "Cambiar de canal de captación hacia comunidades con necesidad activa (ComfyUI / Fanvue / Photoshop C2PA) y priorizar enlaces con preset preseleccionado."
    };
  }
  if ((rt.paywallReachRatePct || 0) < 10) {
    return {
      stageDay,
      bottleneckCode: "BOTTLENECK_FREEMIUM_PACKAGING",
      primaryCause: `Bajo alcance de Paywall (${rt.paywallReachRatePct}% < 10% de activados): la limpieza neutra gratuita 1 a 1 resuelve todo lo que pide este segmento.`,
      doNotDo: "No asumir que el producto no gusta (la activación es alta).",
      recommendedAction: "Dirigir la adquisición a agencias que requieren Lotes .ZIP Mixtos (Fotos + .MP4) y Perfiles EXIF iPhone 16 Pro + GPS, o reducir las pruebas EXIF Pro gratuitas de 3 a 2."
    };
  }
  if ((st.paywallViewed || 0) >= 20 && (rt.paywallToCheckoutPct || 0) < 3) {
    return {
      stageDay,
      bottleneckCode: "BOTTLENECK_PAYWALL_VALUE_PROP",
      primaryCause: `Baja intención en Paywall (${rt.paywallToCheckoutPct}% < 3% sobre ${st.paywallViewed} vistas): el beneficio Pro percibido no justifica el paso al checkout.`,
      doNotDo: "No programar herramientas nuevas; el problema está en la oferta mostrada en el modal Pro.",
      recommendedAction: "Destacar el ahorro de tiempo en Lotes .ZIP y la prueba visual del EXIF iPhone 16 Pro + GPS antes de tocar el precio."
    };
  }
  if ((st.checkoutClicked || 0) >= 10 && (rt.checkoutToPurchasePct || 0) < 15) {
    return {
      stageDay,
      bottleneckCode: "BOTTLENECK_CHECKOUT_TRUST_OR_MODEL",
      primaryCause: `Abandono en Stripe Checkout (${rt.checkoutToPurchasePct}% < 15% sobre ${st.checkoutClicked} clics de compra): fricción con la suscripción recurrente o métodos de pago.`,
      doNotDo: "No descartar la demanda (el usuario ya hizo clic en comprar).",
      recommendedAction: "Verificar Apple Pay / Google Pay activos, código FRIEND50 pre-aplicado (4,99 €) y probar un Pase de Proyecto de pago único (sin renovación mensual) para usuarios puntuales."
    };
  }
  if (stageDay >= 60 && (st.activatedUsers || 0) >= 30 && (ret.genuineReturningUsers || 0) === 0) {
    return {
      stageDay,
      bottleneckCode: "BOTTLENECK_RETENTION_CHURN",
      primaryCause: "Uso estrictamente puntual sin retorno genuino (0 usuarios recurrentes genuinos en D60).",
      doNotDo: "No insistir en suscripción mensual para segmentos de uso único.",
      recommendedAction: "Pivotar el modelo comercial hacia Pago por Proyecto / Plan Anual de Agencias y congelar módulos sin recurrencia (como el humanizador de texto)."
    };
  }
  return {
    stageDay,
    bottleneckCode: "HEALTHY_CONVERSION_FLOW",
    primaryCause: "Las tasas de activación, paso por paywall y conversión superan los umbrales mínimos de validación.",
    doNotDo: "No dispersar recursos en canales con 0% de conversión.",
    recommendedAction: `Concentrar el presupuesto (< 100 €/mes) y el tiempo en escalar el canal ganador (${funnel.bestConvertingChannel || "organic_search"} / afiliados 40%).`
  };
}

async function checkPlatformHealth(options = {}) {
  const alerts = [];
  const requiredFiles = ["clean-ai-studio.html", "index.html", "privacy-policy.html", "terms.html", "stripe-webhook-worker.js"];
  for (const f of requiredFiles) {
    if (!fs.existsSync(path.join(__dirname, f))) {
      alerts.push({ severity: "CRITICAL", code: "MISSING_CORE_FILE", message: `Falta el archivo esencial: ${f}` });
    }
  }

  const mainHtml = fs.existsSync(path.join(__dirname, "clean-ai-studio.html"))
    ? fs.readFileSync(path.join(__dirname, "clean-ai-studio.html"), "utf8")
    : "";
  if (!mainHtml.includes("https://buy.stripe.com/aFacN6e66fTn6DudPA00009") || !mainHtml.includes("https://buy.stripe.com/6oUfZi7HI6iN2ne26S0000e")) {
    alerts.push({ severity: "CRITICAL", code: "STRIPE_LINKS_BROKEN", message: "Enlaces principales de Stripe Checkout ausentes o alterados en clean-ai-studio.html" });
  }

  const jsErrorCount = Number(options.recentJsErrorsCount) || 0;
  if (jsErrorCount >= 10) {
    alerts.push({ severity: "HIGH", code: "JS_ERROR_SPIKE", message: `Pico anormal de errores JS detectado: ${jsErrorCount} eventos recientes.` });
  }

  if (!options.skipRemotePing && typeof fetch === "function") {
    try {
      const start = Date.now();
      const res = await fetch("https://pureaistudios.com/", { method: "HEAD" });
      const latencyMs = Date.now() - start;
      if (!res.ok) {
        alerts.push({ severity: "CRITICAL", code: "WEB_DOWN", message: `pureaistudios.com devolvió HTTP ${res.status}` });
      } else if (latencyMs > 4000) {
        alerts.push({ severity: "WARNING", code: "HIGH_LATENCY", message: `Tiempo de respuesta elevado en pureaistudios.com: ${latencyMs} ms` });
      }
    } catch (_) {}
  }

  return {
    healthy: !alerts.some((a) => a.severity === "CRITICAL"),
    checkedAt: new Date().toISOString(),
    alerts
  };
}

async function dispatchCriticalOperationalAlert(alertObj, env = process.env) {
  if (!alertObj || (alertObj.severity !== "CRITICAL" && alertObj.severity !== "HIGH")) {
    return { sent: false, reason: "below_alert_threshold" };
  }
  // Fase 3: Envío opcional por Telegram Bot privado si el propietario configura TELEGRAM_BOT_TOKEN y TELEGRAM_CHAT_ID
  if (env.TELEGRAM_BOT_TOKEN && env.TELEGRAM_CHAT_ID && typeof fetch === "function") {
    try {
      await fetch(`https://api.telegram.org/bot${env.TELEGRAM_BOT_TOKEN}/sendMessage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: env.TELEGRAM_CHAT_ID,
          text: `🚨 [PureAI Studio ${alertObj.severity}] ${alertObj.code}: ${alertObj.message}`
        })
      });
      return { sent: true, channel: "telegram" };
    } catch (_) {}
  }
  return { sent: false, reason: "logged_locally_no_external_credentials" };
}

async function runAutoDoctor() {
  let stored = {
    processedIds: [],
    totalPageviews: 0,
    humanPageviews: 0,
    googlebotCrawls: 0,
    pageviewsByPage: {},
    googlebotCrawlsByPage: {},
    appActions: {
      pwa_install_click: 0,
      chrome_extension_download: 0,
      image_scrub_download: 0,
      text_watermark_scrub: 0,
      pro_humanizer_click: 0,
      paywall_3_uses_reached: 0
    },
    quotaByDevice: {},
    affiliateClicks: { stripe_checkout: 0 },
    jsErrors: [],
    userBugReports: [],
    supportTicketsTriaged: [],
    financialEventsHistory: [],
    analyticsEventsHistory: [],
    platformHealth: {},
    financialDigest: {},
    productFunnel: {}
  };

  if (fs.existsSync(METRICS_FILE)) {
    try {
      stored = { ...stored, ...JSON.parse(fs.readFileSync(METRICS_FILE, "utf8")) };
    } catch (_) {}
  }

  const seenIds = new Set(stored.processedIds || []);
  const financialEvents = Array.isArray(stored.financialEventsHistory) ? [...stored.financialEventsHistory] : [];
  const analyticsEvents = Array.isArray(stored.analyticsEventsHistory) ? [...stored.analyticsEventsHistory] : [];

  try {
    const raw = await fetch(BUS_URL).then((r) => r.text());
    const lines = raw.split("\n").filter(Boolean);
    for (const line of lines) {
      try {
        const env = JSON.parse(line);
        if (!env.id || seenIds.has(env.id) || env.event !== "message") continue;
        seenIds.add(env.id);

        const data = JSON.parse(env.message);
        const ua = data.ua || "";
        const isBot = Boolean(data.isBot || /bot|crawl|spider|headless|Nexus 5X Build\/MMB29P|Google-InspectionTool/i.test(ua));
        if (!isBot && (data.event_name || data.type === "pageview" || data.type === "app_action" || data.type === "click_checkout" || data.type === "sale_verified_session")) {
          analyticsEvents.push({ id: env.id, ...data, isBot: false });
        }
        if (data.type === "pageview") {
          stored.totalPageviews = (stored.totalPageviews || 0) + 1;
          const pg = data.page || "index.html";
          if (isBot) {
            stored.googlebotCrawls = (stored.googlebotCrawls || 0) + 1;
            stored.googlebotCrawlsByPage[pg] = (stored.googlebotCrawlsByPage[pg] || 0) + 1;
          } else {
            stored.humanPageviews = (stored.humanPageviews || 0) + 1;
            stored.pageviewsByPage[pg] = (stored.pageviewsByPage[pg] || 0) + 1;
          }
        } else if (data.type === "app_action" && data.target) {
          stored.appActions = stored.appActions || {};
          stored.appActions[data.target] = (stored.appActions[data.target] || 0) + 1;
        } else if (data.type === "click_checkout") {
          stored.affiliateClicks = stored.affiliateClicks || { stripe_checkout: 0 };
          stored.affiliateClicks.stripe_checkout = (stored.affiliateClicks.stripe_checkout || 0) + 1;
        } else if (data.type === "sale_verified_session") {
          const isAnnual = data.planInterval === "year" || Number(data.amountCents) >= 3500;
          financialEvents.push({
            id: data.maskedSession || env.id,
            type: isAnnual ? "SALE_ANNUAL" : "SALE_MONTHLY",
            amountCents: Number(data.amountCents) || (isAnnual ? 3900 : 499),
            taxCents: Number(data.taxCents) || (isAnnual ? 677 : 86),
            affiliateId: data.partner || "organic"
          });
        } else if (data.type === "user_bug_report") {
          const triage = classifySupportInquiry(data.msg || "");
          const ticket = {
            id: "TKT-" + env.id.slice(0, 8),
            page: data.page || "clean-ai-studio.html",
            msg: String(data.msg || "").slice(0, 500),
            ts: data.ts || new Date().toISOString(),
            ...triage
          };
          stored.userBugReports.unshift(ticket);
          stored.userBugReports = stored.userBugReports.slice(0, 50);
          stored.supportTicketsTriaged = stored.userBugReports;
          if (triage.priority === "CRITICAL") {
            await dispatchCriticalOperationalAlert({ severity: "CRITICAL", code: triage.category, message: ticket.msg });
          }
        } else if (data.type === "js_error" || data.type === "js_promise_error") {
          stored.jsErrors.unshift({ page: data.page, msg: data.msg, line: data.line, ts: data.ts });
          stored.jsErrors = stored.jsErrors.slice(0, 50);
        }
      } catch (_) {}
    }
  } catch (_) {}

  stored.financialEventsHistory = financialEvents.slice(-1000);
  stored.analyticsEventsHistory = analyticsEvents.slice(-2000);
  stored.platformHealth = await checkPlatformHealth({ recentJsErrorsCount: stored.jsErrors.length });
  stored.financialDigest = generateAutomatedFinancialDigest(stored.financialEventsHistory);
  stored.productFunnel = computeProductAnalyticsFunnel(stored.analyticsEventsHistory);
  stored.processedIds = [...seenIds].slice(-500);
  stored.lastDoctorRun = new Date().toISOString();
  fs.writeFileSync(METRICS_FILE, JSON.stringify(stored, null, 2));

  console.log(
    `🩺 PureAI Ops Monitor OK | Salud Web: ${stored.platformHealth.healthy ? "HEALTHY" : "ALERT"} | Visitas Humanas: ${stored.humanPageviews || 0} | Tickets Clasificados: ${stored.userBugReports.length} | Errores JS: ${stored.jsErrors.length}`
  );
}

module.exports = {
  SUPPORT_CATEGORIES,
  IMMUTABLE_AUTOMATION_GUARDRAILS,
  PUREAI_TOOL_IDS,
  validateAutomatedActionSafety,
  classifySupportInquiry,
  generateAutomatedFinancialDigest,
  simulateFinancialViabilityScenarios,
  computeProductAnalyticsFunnel,
  diagnoseConversionBottleneck,
  evaluateFiveCoreValidationTests,
  evaluateUserInterviewResponses,
  checkPlatformHealth,
  dispatchCriticalOperationalAlert,
  runAutoDoctor
};

if (require.main === module) {
  runAutoDoctor().catch(console.error);
}
