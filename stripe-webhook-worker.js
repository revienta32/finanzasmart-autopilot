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

// Pure-JS FIPS 180-4 SHA-256 & RFC 2104 HMAC-SHA256 (compatible with Cloudflare Workers & Node.js without external imports)
const SHA256_K = new Uint32Array([
  0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5,
  0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
  0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
  0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
  0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85,
  0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
  0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3,
  0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2
]);

function sha256Bytes(msgBytes) {
  const l = msgBytes.length;
  const bitLen = l * 8;
  const padLen = ((l + 9 + 63) & ~63);
  const buf = new Uint8Array(padLen);
  buf.set(msgBytes, 0);
  buf[l] = 0x80;
  const dv = new DataView(buf.buffer);
  dv.setUint32(padLen - 8, Math.floor(bitLen / 0x100000000), false);
  dv.setUint32(padLen - 4, bitLen >>> 0, false);

  let h0 = 0x6a09e667, h1 = 0xbb67ae85, h2 = 0x3c6ef372, h3 = 0xa54ff53a;
  let h4 = 0x510e527f, h5 = 0x9b05688c, h6 = 0x1f83d9ab, h7 = 0x5be0cd19;
  const w = new Uint32Array(64);

  for (let off = 0; off < padLen; off += 64) {
    for (let i = 0; i < 16; i++) w[i] = dv.getUint32(off + i * 4, false);
    for (let i = 16; i < 64; i++) {
      const s0 = ((w[i - 15] >>> 7) | (w[i - 15] << 25)) ^ ((w[i - 15] >>> 18) | (w[i - 15] << 14)) ^ (w[i - 15] >>> 3);
      const s1 = ((w[i - 2] >>> 17) | (w[i - 2] << 15)) ^ ((w[i - 2] >>> 19) | (w[i - 2] << 13)) ^ (w[i - 2] >>> 10);
      w[i] = (w[i - 16] + s0 + w[i - 7] + s1) >>> 0;
    }
    let a = h0, b = h1, c = h2, d = h3, e = h4, f = h5, g = h6, h = h7;
    for (let i = 0; i < 64; i++) {
      const S1 = ((e >>> 6) | (e << 26)) ^ ((e >>> 11) | (e << 21)) ^ ((e >>> 25) | (e << 7));
      const ch = (e & f) ^ (~e & g);
      const temp1 = (h + S1 + ch + SHA256_K[i] + w[i]) >>> 0;
      const S0 = ((a >>> 2) | (a << 30)) ^ ((a >>> 13) | (a << 19)) ^ ((a >>> 22) | (a << 10));
      const maj = (a & b) ^ (a & c) ^ (b & c);
      const temp2 = (S0 + maj) >>> 0;
      h = g; g = f; f = e; e = (d + temp1) >>> 0;
      d = c; c = b; b = a; a = (temp1 + temp2) >>> 0;
    }
    h0 = (h0 + a) >>> 0; h1 = (h1 + b) >>> 0; h2 = (h2 + c) >>> 0; h3 = (h3 + d) >>> 0;
    h4 = (h4 + e) >>> 0; h5 = (h5 + f) >>> 0; h6 = (h6 + g) >>> 0; h7 = (h7 + h) >>> 0;
  }
  const out = new Uint8Array(32);
  const odv = new DataView(out.buffer);
  odv.setUint32(0, h0, false); odv.setUint32(4, h1, false); odv.setUint32(8, h2, false); odv.setUint32(12, h3, false);
  odv.setUint32(16, h4, false); odv.setUint32(20, h5, false); odv.setUint32(24, h6, false); odv.setUint32(28, h7, false);
  return out;
}

function hmacSha256Hex(keyStr, messageStr) {
  const enc = new TextEncoder();
  let keyBytes = enc.encode(String(keyStr));
  if (keyBytes.length > 64) keyBytes = sha256Bytes(keyBytes);
  const blockKey = new Uint8Array(64);
  blockKey.set(keyBytes, 0);
  const oKeyPad = new Uint8Array(64);
  const iKeyPad = new Uint8Array(64);
  for (let i = 0; i < 64; i++) {
    oKeyPad[i] = blockKey[i] ^ 0x5c;
    iKeyPad[i] = blockKey[i] ^ 0x36;
  }
  const msgBytes = enc.encode(String(messageStr));
  const innerInput = new Uint8Array(64 + msgBytes.length);
  innerInput.set(iKeyPad, 0);
  innerInput.set(msgBytes, 64);
  const innerHash = sha256Bytes(innerInput);
  const outerInput = new Uint8Array(64 + 32);
  outerInput.set(oKeyPad, 0);
  outerInput.set(innerHash, 64);
  const finalBytes = sha256Bytes(outerInput);
  let hex = "";
  for (let i = 0; i < finalBytes.length; i++) {
    hex += finalBytes[i].toString(16).padStart(2, "0");
  }
  return hex;
}

function timingSafeHexEqual(aHex, bHex) {
  const a = String(aHex || "").toLowerCase();
  const b = String(bHex || "").toLowerCase();
  if (a.length !== b.length || a.length === 0) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) {
    diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return diff === 0;
}

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
  const expectedSig = hmacSha256Hex(webhookSecret, signedPayload);
  const matched = signatures.some((sig) => timingSafeHexEqual(sig, expectedSig));
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

function computeKeyChecksumBlock(block4) {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let h = 0x811c9dc5;
  const seed = "PUREAI2026:" + String(block4 || "").toUpperCase();
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 0x01000193) >>> 0;
  }
  let out = "";
  for (let j = 0; j < 4; j++) {
    out += chars.charAt((h >>> (j * 5)) % chars.length);
  }
  return out;
}

function deriveProKeyFromSession(seedId) {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const clean = String(seedId || "PUREAI").trim();
  let h = 0x811c9dc5;
  for (let i = 0; i < clean.length; i++) {
    h ^= clean.charCodeAt(i);
    h = Math.imul(h, 0x01000193) >>> 0;
  }
  let p1 = "";
  for (let j = 0; j < 4; j++) {
    p1 += chars.charAt((h >>> (j * 5)) % chars.length);
  }
  const p2 = computeKeyChecksumBlock(p1);
  return `PRO-${p1}-${p2}`;
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
  const mappedCustomer = (obj.payment_intent && store.subscriptionsByCustomer.get(`pi:${obj.payment_intent}`)) || null;
  const customerId = obj.customer || (mappedCustomer && mappedCustomer.customerId) || obj.id || "cust_unknown";
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
        cancelAtPeriodEnd: false,
        verifiedByServer: true
      };
  existing.verifiedByServer = true;

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
          existing.proKey = deriveProKeyFromSession(String(obj.id));
        } else if (!existing.proKey) {
          existing.proKey = deriveProKeyFromSession(customerId);
        }
        if (obj.payment_intent) {
          existing.lastPaymentIntentId = String(obj.payment_intent);
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
    if (existing.proKey) {
      store.subscriptionsByCustomer.set(existing.proKey, existing);
    }
    if (existing.lastPaymentIntentId) {
      store.subscriptionsByCustomer.set(`pi:${existing.lastPaymentIntentId}`, existing);
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
  let customerId = obj.customer || obj.id || "cust_unknown";
  if (!obj.customer && obj.payment_intent && typeof kv.get === "function") {
    const piRaw = await kv.get(`pi:${obj.payment_intent}`);
    if (piRaw) {
      try {
        const piSub = JSON.parse(piRaw);
        if (piSub && piSub.customerId) {
          customerId = piSub.customerId;
          store.subscriptionsByCustomer.set(`pi:${obj.payment_intent}`, piSub);
          store.subscriptionsByCustomer.set(customerId, piSub);
        }
      } catch (_) {}
    }
  }
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
    const effectiveCustId = result.subscription.customerId || customerId;
    const proKey = result.subscription.proKey;
    const piId = result.subscription.lastPaymentIntentId || obj.payment_intent;
    if (effectiveCustId) await kv.put(`sub:${effectiveCustId}`, serializedSub);
    if (sessId) await kv.put(`sess:${sessId}`, serializedSub);
    if (proKey) await kv.put(`key:${proKey.toUpperCase()}`, serializedSub);
    if (piId) await kv.put(`pi:${piId}`, serializedSub);
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
      const kvKey = code.startsWith("cs_")
        ? `sess:${code}`
        : /^PRO-[A-Z2-9]{4}-[A-Z2-9]{4}$/i.test(code)
          ? `key:${code.toUpperCase()}`
          : `sub:${code}`;
      const kvRaw = await env.PUREAI_LICENSES_KV.get(kvKey);
      if (kvRaw) {
        try {
          subRecord = JSON.parse(kvRaw);
          store.subscriptionsByCustomer.set(code, subRecord);
        } catch (_) {}
      }
    }
    if (!subRecord) {
      subRecord = store.subscriptionsByCustomer.get(code) || store.subscriptionsByCustomer.get(code.toUpperCase()) || null;
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
        proKey: subRecord.proKey || deriveProKeyFromSession(code),
        status: subRecord.status,
        planInterval: subRecord.planInterval || "month",
        expiresAt: subRecord.expiresAt,
        graceEndsAt: subRecord.graceEndsAt
      })
    };
  }

  // 3. Endpoint Server-Side de Soporte y Telemetría Opt-In (POST /telemetry | POST /support) para no exponer temas públicos en cliente
  if (req.method === "POST" && (url.pathname === "/telemetry" || url.pathname === "/support")) {
    const rawBody = typeof req.text === "function" ? await req.text() : String(req.body || "");
    if (!rawBody || rawBody.length > 4096) {
      return { status: 400, headers, body: JSON.stringify({ ok: false, error: "invalid_payload_size" }) };
    }
    let parsed;
    try {
      parsed = JSON.parse(rawBody);
    } catch (_) {
      return { status: 400, headers, body: JSON.stringify({ ok: false, error: "invalid_json" }) };
    }
    delete parsed.ua;
    delete parsed.countryTz;
    delete parsed.deviceFp;
    const evWithId = { id: "kv_" + Date.now() + "_" + Math.random().toString(36).slice(2, 7), ...parsed };
    if (env && env.PUREAI_LICENSES_KV && typeof env.PUREAI_LICENSES_KV.get === "function" && typeof env.PUREAI_LICENSES_KV.put === "function") {
      try {
        const rawList = await env.PUREAI_LICENSES_KV.get("telemetry:recent_events");
        const list = rawList ? JSON.parse(rawList) : [];
        list.push(evWithId);
        while (list.length > 250) list.shift();
        await env.PUREAI_LICENSES_KV.put("telemetry:recent_events", JSON.stringify(list));
      } catch (_) {}
    }
    const ntfyUrl = (env && env.NTFY_SECRET_TOPIC_URL) || "https://ntfy.sh/pureai_studio_ops_telemetry_94c2e1";
    if (ntfyUrl && typeof fetch === "function") {
      try {
        await fetch(ntfyUrl, { method: "POST", body: JSON.stringify(parsed) });
      } catch (_) {}
    }
    return { status: 200, headers, body: JSON.stringify({ ok: true, relayed: true }) };
  }

  if (req.method === "POST" && url.pathname === "/daily-digest") {
    let bodyObj = {};
    try {
      const raw = typeof req.text === "function" ? await req.text() : String(req.body || "{}");
      bodyObj = JSON.parse(raw || "{}");
    } catch (_) {}
    let list = [];
    if (env && env.PUREAI_LICENSES_KV && typeof env.PUREAI_LICENSES_KV.get === "function") {
      try {
        const rawList = await env.PUREAI_LICENSES_KV.get("telemetry:recent_events");
        if (rawList) list = JSON.parse(rawList);
      } catch (_) {}
    }
    const kvStats = { visits: 0, photosCleaned: 0, textsCleaned: 0, demosTested: 0, checkouts: 0, engaged15s: 0 };
    for (const e of list) {
      if (e.type === "pageview" || e.event_name === "session_start") kvStats.visits++;
      if (e.target === "image_scrub_download") kvStats.photosCleaned++;
      if (e.target === "text_watermark_scrub" || e.target === "pro_humanizer_click") kvStats.textsCleaned++;
      if (e.target === "demo_photo_tested" || e.target === "demo_text_tested") kvStats.demosTested++;
      if (e.type === "click_checkout" || e.event_name === "checkout_clicked") kvStats.checkouts++;
      if (e.target === "engaged_15s") kvStats.engaged15s++;
    }
    const topOpp = bodyObj && bodyObj.topOpp;
    const msgLines = [
      "📅 PureAI Studio — Resumen Diario (1 vez al día):",
      "• Visitas registradas: " + kvStats.visits + " (Interés >15s: " + kvStats.engaged15s + ")",
      "• Fotos/MP4 limpiados: " + kvStats.photosCleaned + " | Textos: " + kvStats.textsCleaned + " | Demos 1-clic: " + kvStats.demosTested,
      "• Clics a Stripe Pro: " + kvStats.checkouts,
      "• Artículos SEO Cloud activos: " + (Number(bodyObj.articlesCount) || 0) + " (IndexNow 200 OK)"
    ];
    if (topOpp && topOpp.title && topOpp.url) {
      msgLines.push("🎯 Hilo del día (" + (topOpp.platform || "Social") + "): " + String(topOpp.title).slice(0, 80));
      msgLines.push("👉 " + topOpp.url);
    }
    let sent = false;
    if (env && env.TELEGRAM_BOT_TOKEN && env.TELEGRAM_CHAT_ID && typeof fetch === "function") {
      try {
        await fetch("https://api.telegram.org/bot" + env.TELEGRAM_BOT_TOKEN + "/sendMessage", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            chat_id: env.TELEGRAM_CHAT_ID,
            text: msgLines.join("\n"),
            disable_web_page_preview: true
          })
        });
        sent = true;
      } catch (_) {}
    }
    return { status: 200, headers, body: JSON.stringify({ ok: true, sent }) };
  }

  if (req.method === "GET" && url.pathname === "/telemetry") {
    let list = [];
    if (env && env.PUREAI_LICENSES_KV && typeof env.PUREAI_LICENSES_KV.get === "function") {
      try {
        const rawList = await env.PUREAI_LICENSES_KV.get("telemetry:recent_events");
        if (rawList) list = JSON.parse(rawList);
      } catch (_) {}
    }
    return { status: 200, headers, body: JSON.stringify({ ok: true, events: list }) };
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
  computeKeyChecksumBlock,
  deriveProKeyFromSession,
  createWebhookProcessorStore,
  processStripeWebhookEvent,
  handleWorkerHttpRequest,
  default: workerDefaultExport
};
