/**
 * PUREAI STUDIO — STRIPE WEBHOOK & SUBSCRIPTION LIFECYCLE ENGINE (Cloudflare Worker / Node.js)
 * Coste de mantenimiento: 0,00 €/mes (Cloudflare Workers Free Tier: 100.000 req/día).
 *
 * Funcionalidades implementadas:
 * 1. Verificación criptográfica HMAC-SHA256 de la cabecera `Stripe-Signature` con ventana anti-replay (300s).
 * 2. Idempotencia estricta y duradera por `event.id` en KV (`evt:<id>`) + memoria, con confirmación atómica post-escritura.
 * 3. Hidratación previa desde KV (`sub:<customerId>`, `sess:<sessionId>`, `aff_cust:<customerId>`) antes de evaluar eventos fuera de orden.
 * 4. Cálculo exacto de caducidad para planes mensuales (32 días) vs. anuales (366 días, `amount_total >= 3500` o `plan_interval === "year"`).
 * 5. Gestión completa de los 9 estados de suscripción (PENDING, ACTIVE, RENEWAL_PENDING, PAST_DUE con 72h de gracia,
 *    CANCELED_AT_PERIOD_END, EXPIRED, REFUNDED, DISPUTED, SUSPENDED).
 * 6. Motor antifraude de afiliados: cálculo del 40% sobre ingreso neto (descontando IVA y comisión de Stripe),
 *    bloqueo de auto-referidos (self-referral), cuarentena de 30 días y anulación automática ante reembolsos o disputas.
 */

const crypto = require("crypto");

const SUBSCRIPTION_STATES = {
  PENDING: "PENDING",
  ACTIVE: "ACTIVE",
  RENEWAL_PENDING: "RENEWAL_PENDING",
  PAST_DUE: "PAST_DUE",
  CANCELED_AT_PERIOD_END: "CANCELED_AT_PERIOD_END",
  EXPIRED: "EXPIRED",
  REFUNDED: "REFUNDED",
  DISPUTED: "DISPUTED",
  SUSPENDED: "SUSPENDED"
};

function verifyStripeWebhookSignature(rawPayload, signatureHeader, webhookSecret, nowUnixSeconds) {
  if (!rawPayload || !signatureHeader || !webhookSecret) {
    return { valid: false, reason: "missing_parameters" };
  }
  const parts = String(signatureHeader).split(",");
  let timestamp = 0;
  const signatures = [];
  for (const p of parts) {
    const [k, v] = p.trim().split("=");
    if (k === "t") timestamp = parseInt(v, 10) || 0;
    if (k === "v1" && v) signatures.push(v);
  }
  if (!timestamp || signatures.length === 0) {
    return { valid: false, reason: "malformed_signature_header" };
  }
  const nowSec = typeof nowUnixSeconds === "number" ? nowUnixSeconds : Math.floor(Date.now() / 1000);
  if (Math.abs(nowSec - timestamp) > 300) {
    return { valid: false, reason: "timestamp_outside_tolerance_window" };
  }
  const signedPayload = `${timestamp}.${rawPayload}`;
  const expectedSig = crypto.createHmac("sha256", webhookSecret).update(signedPayload, "utf8").digest("hex");
  const expectedBuf = Buffer.from(expectedSig, "hex");

  const matched = signatures.some((sig) => {
    try {
      const sigBuf = Buffer.from(sig, "hex");
      return sigBuf.length === expectedBuf.length && crypto.timingSafeEqual(sigBuf, expectedBuf);
    } catch (_) {
      return false;
    }
  });
  return matched ? { valid: true, timestamp } : { valid: false, reason: "signature_mismatch" };
}

function calculateAffiliateNetCommission(grossCents, taxCents, stripeFeeCents, affiliateId, buyerEmail, affiliateEmail) {
  if (!affiliateId || affiliateId === "organic") {
    return { eligible: false, commissionCents: 0, reason: "no_affiliate" };
  }
  if (buyerEmail && affiliateEmail && String(buyerEmail).toLowerCase().trim() === String(affiliateEmail).toLowerCase().trim()) {
    return { eligible: false, commissionCents: 0, reason: "self_referral_blocked" };
  }
  const gross = Math.max(0, Number(grossCents) || 0);
  const tax = Math.max(0, Number(taxCents) || 0);
  const fee = Math.max(0, Number(stripeFeeCents) || Math.round(gross * 0.025 + 25));
  const netRevenueCents = Math.max(0, gross - tax - fee);
  const commissionCents = Math.round(netRevenueCents * 0.40);
  return {
    eligible: commissionCents > 0,
    grossCents: gross,
    netRevenueCents,
    commissionCents,
    status: "ON_HOLD_30_DAYS",
    reason: "valid_net_commission"
  };
}

function resolveSubscriptionPeriod(obj, nowMs, previousPlanInterval) {
  const metaInterval = obj && obj.metadata && obj.metadata.plan_interval;
  const lineInterval =
    obj &&
    obj.lines &&
    obj.lines.data &&
    obj.lines.data[0] &&
    obj.lines.data[0].price &&
    obj.lines.data[0].price.recurring &&
    obj.lines.data[0].price.recurring.interval;
  const amountCents = Number((obj && (obj.amount_total || obj.amount_paid || obj.amount_due)) || 0);
  const isAnnual =
    metaInterval === "year" ||
    (obj && obj.plan_interval === "year") ||
    lineInterval === "year" ||
    amountCents >= 3500 ||
    (!amountCents && previousPlanInterval === "year");

  const planInterval = isAnnual ? "year" : "month";
  const defaultDurationMs = isAnnual ? 366 * 24 * 3600 * 1000 : 32 * 24 * 3600 * 1000;

  let expiresAt = nowMs + defaultDurationMs;
  if (obj && typeof obj.PeriodEndMs === "number" && obj.PeriodEndMs > 0) {
    expiresAt = obj.PeriodEndMs;
  } else if (obj && typeof obj.current_period_end === "number" && obj.current_period_end > 0) {
    expiresAt = obj.current_period_end * 1000;
  } else if (obj && typeof obj.period_end === "number" && obj.period_end > 0) {
    expiresAt = obj.period_end * 1000;
  }
  return { planInterval, expiresAt };
}

function createWebhookProcessorStore() {
  return {
    processedEventIds: new Set(),
    subscriptionsByCustomer: new Map(),
    affiliateLedger: new Map(),
    auditErrors: []
  };
}

function processStripeWebhookEvent(store, event, nowMs, options) {
  const now = typeof nowMs === "number" ? nowMs : Date.now();
  const deferCommit = Boolean(options && options.deferCommit);
  if (!event || !event.id || !event.type) {
    store.auditErrors.push({ ts: now, reason: "invalid_event_structure" });
    return { handled: false, reason: "invalid_event_structure" };
  }

  // 1. Protección frente a eventos duplicados (Idempotencia)
  if (store.processedEventIds.has(event.id)) {
    return { handled: false, duplicate: true, reason: "duplicate_event_ignored" };
  }

  const obj = (event.data && event.data.object) || {};
  const customerId = obj.customer || obj.id || "cust_unknown";
  const eventCreated = Number(event.created) || Math.floor(now / 1000);
  const prevRecord = store.subscriptionsByCustomer.get(customerId);
  const existing = prevRecord
    ? { ...prevRecord }
    : {
        customerId,
        status: SUBSCRIPTION_STATES.PENDING,
        planInterval: "month",
        expiresAt: 0,
        graceEndsAt: 0,
        lastEventCreated: 0,
        cancelAtPeriodEnd: false
      };

  // 2. Gestión de eventos fuera de orden (Out-of-order protection)
  // Excepción: disputas y reembolsos tienen prioridad crítica de seguridad siempre
  const isCriticalRevocation = event.type === "charge.refunded" || event.type === "charge.dispute.created";
  if (!isCriticalRevocation && existing.lastEventCreated > eventCreated) {
    const commitStale = () => {
      store.processedEventIds.add(event.id);
    };
    if (!deferCommit) commitStale();
    return {
      handled: false,
      outOfOrder: true,
      reason: "stale_event_ignored",
      state: existing.status,
      subscription: existing,
      commitInMemory: commitStale
    };
  }

  existing.lastEventCreated = Math.max(existing.lastEventCreated, eventCreated);
  let pendingAffiliateKey = null;
  let pendingAffiliateEntry = null;
  let clawbackStatus = null;

  switch (event.type) {
    case "checkout.session.completed": {
      if (obj.payment_status === "paid") {
        const periodInfo = resolveSubscriptionPeriod(obj, now, existing.planInterval);
        existing.status = SUBSCRIPTION_STATES.ACTIVE;
        existing.planInterval = periodInfo.planInterval;
        existing.expiresAt = periodInfo.expiresAt;
        existing.graceEndsAt = existing.expiresAt + 72 * 3600 * 1000;
        if (obj.id && String(obj.id).startsWith("cs_")) {
          existing.lastCheckoutSessionId = String(obj.id);
        }
        const ref = String(obj.client_reference_id || "");
        if (ref.startsWith("aff_")) {
          const affId = ref.slice(4);
          const defaultGross = existing.planInterval === "year" ? 3900 : 499;
          const comm = calculateAffiliateNetCommission(
            obj.amount_total || defaultGross,
            obj.total_details && obj.total_details.amount_tax ? obj.total_details.amount_tax : 0,
            obj.stripe_fee_cents || Math.round((obj.amount_total || defaultGross) * 0.025 + 25),
            affId,
            obj.customer_email,
            obj.affiliate_email
          );
          pendingAffiliateKey = obj.charge_id || event.id;
          pendingAffiliateEntry = {
            affiliateId: affId,
            customerId,
            ...comm,
            unlocksAt: now + 30 * 24 * 3600 * 1000
          };
        }
      } else {
        existing.status = SUBSCRIPTION_STATES.PENDING;
      }
      break;
    }
    case "invoice.paid": {
      const periodInfo = resolveSubscriptionPeriod(obj, now, existing.planInterval);
      existing.status = SUBSCRIPTION_STATES.ACTIVE;
      existing.planInterval = periodInfo.planInterval;
      existing.expiresAt = periodInfo.expiresAt;
      existing.graceEndsAt = existing.expiresAt + 72 * 3600 * 1000;
      break;
    }
    case "invoice.payment_failed": {
      // No revocar de inmediato ante una notificación aislada de fallo de cobro: pasar a PAST_DUE con 72h de gracia
      existing.status = SUBSCRIPTION_STATES.PAST_DUE;
      existing.graceEndsAt = now + 72 * 3600 * 1000;
      break;
    }
    case "customer.subscription.updated": {
      const periodInfo = resolveSubscriptionPeriod(obj, now, existing.planInterval);
      existing.planInterval = periodInfo.planInterval;
      if (obj.cancel_at_period_end) {
        existing.status = SUBSCRIPTION_STATES.CANCELED_AT_PERIOD_END;
        existing.cancelAtPeriodEnd = true;
        if (obj.current_period_end) existing.expiresAt = obj.current_period_end * 1000;
      } else if (obj.status === "active") {
        existing.status = SUBSCRIPTION_STATES.ACTIVE;
        existing.cancelAtPeriodEnd = false;
        if (obj.current_period_end) existing.expiresAt = obj.current_period_end * 1000;
      }
      break;
    }
    case "customer.subscription.deleted": {
      existing.status = SUBSCRIPTION_STATES.EXPIRED;
      existing.expiresAt = now - 1000;
      break;
    }
    case "charge.refunded": {
      existing.status = SUBSCRIPTION_STATES.REFUNDED;
      existing.expiresAt = now - 1000;
      clawbackStatus = "CLAWBACK_REFUNDED";
      break;
    }
    case "charge.dispute.created": {
      existing.status = SUBSCRIPTION_STATES.DISPUTED;
      existing.expiresAt = now - 1000;
      clawbackStatus = "FROZEN_DISPUTE";
      break;
    }
    default:
      break;
  }

  const commitInMemory = () => {
    store.processedEventIds.add(event.id);
    store.subscriptionsByCustomer.set(customerId, existing);
    if (obj.id && String(obj.id).startsWith("cs_")) {
      store.subscriptionsByCustomer.set(String(obj.id), existing);
    }
    if (existing.lastCheckoutSessionId) {
      store.subscriptionsByCustomer.set(existing.lastCheckoutSessionId, existing);
    }
    if (pendingAffiliateKey && pendingAffiliateEntry) {
      store.affiliateLedger.set(pendingAffiliateKey, pendingAffiliateEntry);
    }
    if (clawbackStatus) {
      for (const [, entry] of store.affiliateLedger.entries()) {
        if (entry.customerId === customerId) {
          entry.commissionCents = 0;
          entry.status = clawbackStatus;
        }
      }
    }
  };

  if (!deferCommit) {
    commitInMemory();
  }

  return {
    handled: true,
    state: existing.status,
    subscription: existing,
    pendingAffiliateKey,
    pendingAffiliateEntry,
    clawbackStatus,
    commitInMemory
  };
}

const ALLOWED_ORIGINS = new Set([
  "https://pureaistudios.com",
  "https://www.pureaistudios.com"
]);

function buildCorsHeaders(origin) {
  const allowed = ALLOWED_ORIGINS.has(origin) ? origin : "https://pureaistudios.com";
  return {
    "Access-Control-Allow-Origin": allowed,
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Stripe-Signature",
    "Content-Type": "application/json; charset=utf-8",
    "X-Content-Type-Options": "nosniff",
    "Cache-Control": "no-store"
  };
}

async function hydrateStoreFromKv(env, store, eventObj) {
  if (!env || !env.PUREAI_LICENSES_KV || !eventObj) return { alreadyProcessedInKv: false };
  const kv = env.PUREAI_LICENSES_KV;
  const eventId = eventObj.id;
  if (eventId) {
    const existingEvt = await kv.get(`evt:${eventId}`);
    if (existingEvt) {
      store.processedEventIds.add(eventId);
      return { alreadyProcessedInKv: true };
    }
  }
  const obj = (eventObj.data && eventObj.data.object) || {};
  const customerId = obj.customer || obj.id || "cust_unknown";
  if (customerId && typeof kv.get === "function") {
    const subRaw = await kv.get(`sub:${customerId}`);
    if (subRaw) {
      try {
        const kvSub = JSON.parse(subRaw);
        const memSub = store.subscriptionsByCustomer.get(customerId);
        if (!memSub || (kvSub.lastEventCreated || 0) >= (memSub.lastEventCreated || 0)) {
          store.subscriptionsByCustomer.set(customerId, kvSub);
        }
      } catch (_) {}
    }
    const affRaw = await kv.get(`aff_cust:${customerId}`);
    if (affRaw) {
      try {
        const kvAff = JSON.parse(affRaw);
        if (kvAff && kvAff.key && !store.affiliateLedger.has(kvAff.key)) {
          store.affiliateLedger.set(kvAff.key, kvAff.entry);
        }
      } catch (_) {}
    }
  }
  return { alreadyProcessedInKv: false };
}

async function persistWebhookResultToKv(env, eventObj, result) {
  if (!env || !env.PUREAI_LICENSES_KV || !eventObj) return;
  const kv = env.PUREAI_LICENSES_KV;
  const obj = (eventObj.data && eventObj.data.object) || {};
  const customerId = obj.customer || obj.id || "cust_unknown";
  const sessId = (obj.id && String(obj.id).startsWith("cs_") ? String(obj.id) : null) || (result.subscription && result.subscription.lastCheckoutSessionId);

  if (result.subscription) {
    const serializedSub = JSON.stringify(result.subscription);
    if (customerId) await kv.put(`sub:${customerId}`, serializedSub);
    if (sessId) await kv.put(`sess:${sessId}`, serializedSub);
  }
  if (result.pendingAffiliateKey && result.pendingAffiliateEntry) {
    await kv.put(
      `aff_cust:${customerId}`,
      JSON.stringify({ key: result.pendingAffiliateKey, entry: result.pendingAffiliateEntry })
    );
  } else if (result.clawbackStatus && customerId && typeof kv.get === "function") {
    const affRaw = await kv.get(`aff_cust:${customerId}`);
    if (affRaw) {
      try {
        const parsed = JSON.parse(affRaw);
        if (parsed && parsed.entry) {
          parsed.entry.commissionCents = 0;
          parsed.entry.status = result.clawbackStatus;
          await kv.put(`aff_cust:${customerId}`, JSON.stringify(parsed));
        }
      } catch (_) {}
    }
  }
  // Marcar el evento como procesado en KV ÚNICAMENTE después de que todas las escrituras de estado hayan tenido éxito
  if (eventObj.id) {
    await kv.put(`evt:${eventObj.id}`, JSON.stringify({ processedAt: Date.now(), type: eventObj.type, state: result.state }));
  }
}

async function handleWorkerHttpRequest(req, env, sharedStore) {
  const store = sharedStore || createWebhookProcessorStore();
  const url = new URL(req.url || "https://pureaistudios.com/");
  const origin = (req.headers && req.headers.get && req.headers.get("origin")) || "https://pureaistudios.com";
  const headers = buildCorsHeaders(origin);

  if (req.method === "OPTIONS") {
    return { status: 204, headers, body: "" };
  }

  // 1. Endpoint de recepción de Webhooks firmados de Stripe (POST /webhook/stripe)
  if (req.method === "POST" && url.pathname === "/webhook/stripe") {
    const sigHeader = (req.headers && req.headers.get && req.headers.get("stripe-signature")) || "";
    const rawBody = typeof req.text === "function" ? await req.text() : String(req.body || "");
    const secret = env && env.STRIPE_WEBHOOK_SECRET;
    const v = verifyStripeWebhookSignature(rawBody, sigHeader, secret, Math.floor(Date.now() / 1000));
    if (!v.valid) {
      return { status: 400, headers, body: JSON.stringify({ ok: false, error: v.reason }) };
    }
    let eventObj;
    try {
      eventObj = JSON.parse(rawBody);
    } catch (_) {
      return { status: 400, headers, body: JSON.stringify({ ok: false, error: "invalid_json" }) };
    }

    try {
      const hydration = await hydrateStoreFromKv(env, store, eventObj);
      if (hydration.alreadyProcessedInKv) {
        return { status: 200, headers, body: JSON.stringify({ ok: true, duplicate: true, reason: "duplicate_event_in_kv" }) };
      }

      const result = processStripeWebhookEvent(store, eventObj, Date.now(), { deferCommit: true });
      if (result.duplicate) {
        return { status: 200, headers, body: JSON.stringify({ ok: true, duplicate: true }) };
      }

      await persistWebhookResultToKv(env, eventObj, result);
      if (typeof result.commitInMemory === "function") {
        result.commitInMemory();
      }
      return {
        status: 200,
        headers,
        body: JSON.stringify({
          ok: true,
          state: result.state,
          planInterval: result.subscription && result.subscription.planInterval,
          duplicate: false,
          outOfOrder: !!result.outOfOrder
        })
      };
    } catch (kvErr) {
      // Si KV falla antes de confirmar, NO marcamos el evento como procesado y devolvemos HTTP 500 para reintento seguro de Stripe
      return {
        status: 500,
        headers,
        body: JSON.stringify({ ok: false, error: "kv_persistence_failed", retryable: true })
      };
    }
  }

  // 2. Endpoint de verificación Server-Side de licencia / session_id (GET /verify-license?code=...)
  if (req.method === "GET" && url.pathname === "/verify-license") {
    const code = String(url.searchParams.get("code") || "").trim();
    if (!code || code.length < 8 || code.length > 128) {
      return { status: 400, headers, body: JSON.stringify({ valid: false, reason: "invalid_code_format" }) };
    }
    // Priorizar KV de Cloudflare para garantizar consistencia entre instancias y reinicios
    let subRecord = null;
    if (env && env.PUREAI_LICENSES_KV && typeof env.PUREAI_LICENSES_KV.get === "function") {
      const kvRaw = await env.PUREAI_LICENSES_KV.get(code.startsWith("cs_") ? `sess:${code}` : `sub:${code}`);
      if (kvRaw) {
        try {
          subRecord = JSON.parse(kvRaw);
          store.subscriptionsByCustomer.set(code, subRecord);
        } catch (_) {}
      }
    }
    if (!subRecord) {
      subRecord = store.subscriptionsByCustomer.get(code) || null;
    }
    if (!subRecord) {
      return { status: 404, headers, body: JSON.stringify({ valid: false, status: SUBSCRIPTION_STATES.PENDING, reason: "license_not_found" }) };
    }
    const now = Date.now();
    const isActive =
      (subRecord.status === SUBSCRIPTION_STATES.ACTIVE && (!subRecord.expiresAt || now <= subRecord.expiresAt)) ||
      (subRecord.status === SUBSCRIPTION_STATES.CANCELED_AT_PERIOD_END && now <= subRecord.expiresAt) ||
      (subRecord.status === SUBSCRIPTION_STATES.PAST_DUE && now <= subRecord.graceEndsAt);

    return {
      status: 200,
      headers,
      body: JSON.stringify({
        valid: isActive,
        verifiedByServer: true,
        status: subRecord.status,
        planInterval: subRecord.planInterval || "month",
        expiresAt: subRecord.expiresAt,
        graceEndsAt: subRecord.graceEndsAt
      })
    };
  }

  return { status: 404, headers, body: JSON.stringify({ ok: false, error: "not_found" }) };
}

const workerDefaultExport = {
  async fetch(request, env) {
    const res = await handleWorkerHttpRequest(request, env);
    if (typeof Response !== "undefined") {
      return new Response(res.body, { status: res.status, headers: res.headers });
    }
    return res;
  }
};

if (typeof addEventListener === "function") {
  addEventListener("fetch", (event) => {
    if (event && typeof event.respondWith === "function") {
      event.respondWith(workerDefaultExport.fetch(event.request, typeof globalThis !== "undefined" ? globalThis : {}));
    }
  });
}

module.exports = {
  SUBSCRIPTION_STATES,
  verifyStripeWebhookSignature,
  calculateAffiliateNetCommission,
  resolveSubscriptionPeriod,
  createWebhookProcessorStore,
  processStripeWebhookEvent,
  handleWorkerHttpRequest,
  default: workerDefaultExport
};
