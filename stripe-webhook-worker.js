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

function timingSafeStringEqual(aStr, bStr) {
  const a = String(aStr || "");
  const b = String(bStr || "");
  if (a.length === 0 || b.length === 0) return false;
  const enc = new TextEncoder();
  const hashA = sha256Bytes(enc.encode(a));
  const hashB = sha256Bytes(enc.encode(b));
  let diff = 0;
  for (let i = 0; i < 32; i++) {
    diff |= hashA[i] ^ hashB[i];
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

const STRIPE_PAYMENT_LINK_PLANS = {
  plink_1UbbsAJGMJW2ESycP7cZbuRv: { planType: "pack_10", planInterval: "one_time", unlimited: false, creditsGranted: 10 },
  plink_1UbbsCJGMJW2ESyccAo1J7VN: { planType: "pack_50", planInterval: "one_time", unlimited: false, creditsGranted: 50 },
  plink_1UbbsDJGMJW2ESycZKktNrhu: { planType: "annual_unlimited", planInterval: "year", unlimited: true, creditsGranted: null }
};

function resolveSubscriptionPeriod(obj, nowMs, previousPlanInterval) {
  const plinkId = String((obj && obj.payment_link) || "").trim();
  if (plinkId && STRIPE_PAYMENT_LINK_PLANS[plinkId]) {
    const mapped = STRIPE_PAYMENT_LINK_PLANS[plinkId];
    const durMs = mapped.planInterval === "one_time" ? 10 * 365 * 24 * 3600 * 1000 : 366 * 24 * 3600 * 1000;
    return {
      planInterval: mapped.planInterval,
      planType: mapped.planType,
      unlimited: mapped.unlimited,
      creditsGranted: mapped.creditsGranted,
      expiresAt: nowMs + durMs
    };
  }

  const metaPlanType = String((obj && obj.metadata && obj.metadata.plan_type) || "").trim().toLowerCase();
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
  const currency = String((obj && obj.currency) || "").trim().toLowerCase();
  const isMajorCurrency = !currency || currency === "eur" || currency === "usd" || currency === "gbp" || currency === "chf";
  const isOneTimeMode = Boolean(obj && obj.mode === "payment");

  if (
    metaPlanType === "pack_10" ||
    (isMajorCurrency && amountCents >= 200 && amountCents <= 390) ||
    (isOneTimeMode && isMajorCurrency && amountCents > 0 && amountCents <= 450)
  ) {
    return {
      planInterval: "one_time",
      planType: "pack_10",
      unlimited: false,
      creditsGranted: 10,
      expiresAt: nowMs + 10 * 365 * 24 * 3600 * 1000
    };
  }

  if (
    metaPlanType === "pack_50" ||
    (isMajorCurrency && amountCents === 990) ||
    (isOneTimeMode && isMajorCurrency && amountCents >= 700 && amountCents <= 2500)
  ) {
    return {
      planInterval: "one_time",
      planType: "pack_50",
      unlimited: false,
      creditsGranted: 50,
      expiresAt: nowMs + 10 * 365 * 24 * 3600 * 1000
    };
  }

  const isAnnual =
    metaPlanType === "annual_unlimited" ||
    metaInterval === "year" ||
    (obj && obj.plan_interval === "year") ||
    lineInterval === "year" ||
    (isMajorCurrency && amountCents >= 3500) ||
    (!amountCents && previousPlanInterval === "year");

  const planInterval = isAnnual ? "year" : "month";
  const planType = isAnnual ? "annual_unlimited" : "monthly_unlimited";
  const defaultDurationMs = isAnnual ? 366 * 24 * 3600 * 1000 : 32 * 24 * 3600 * 1000;

  let expiresAt = nowMs + defaultDurationMs;
  if (obj && typeof obj.PeriodEndMs === "number" && obj.PeriodEndMs > 0) {
    expiresAt = obj.PeriodEndMs;
  } else if (obj && typeof obj.current_period_end === "number" && obj.current_period_end > 0) {
    expiresAt = obj.current_period_end * 1000;
  } else if (obj && typeof obj.period_end === "number" && obj.period_end > 0) {
    expiresAt = obj.period_end * 1000;
  }
  return { planInterval, planType, unlimited: true, creditsGranted: null, expiresAt };
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
    rateLimits: new Map(),
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
        const hadActiveUnlimited =
          existing.unlimited === true &&
          existing.status === SUBSCRIPTION_STATES.ACTIVE &&
          (!existing.expiresAt || existing.expiresAt > now);
        const prevCredits =
          existing.unlimited === false &&
          typeof existing.creditsRemaining === "number" &&
          existing.status === SUBSCRIPTION_STATES.ACTIVE
            ? Math.max(0, existing.creditsRemaining)
            : 0;
        const periodInfo = resolveSubscriptionPeriod(obj, now, existing.planInterval);
        existing.status = SUBSCRIPTION_STATES.ACTIVE;
        existing.planInterval = periodInfo.planInterval;
        existing.planType = periodInfo.planType || (periodInfo.planInterval === "year" ? "annual_unlimited" : "monthly_unlimited");
        if (periodInfo.unlimited || hadActiveUnlimited) {
          existing.unlimited = true;
          existing.creditsRemaining = null;
        } else {
          existing.unlimited = false;
          existing.creditsRemaining = prevCredits + (Number(periodInfo.creditsGranted) || 10);
        }
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
          const defaultGross =
            existing.planType === "pack_10"
              ? 299
              : existing.planType === "pack_50"
                ? 990
                : existing.planInterval === "year"
                  ? 3900
                  : 499;
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
      if (obj.status === "canceled" || obj.status === "unpaid" || obj.status === "incomplete_expired") {
        existing.status = SUBSCRIPTION_STATES.EXPIRED;
        existing.cancelAtPeriodEnd = false;
        existing.expiresAt = now - 1000;
      } else if (obj.status === "past_due") {
        existing.status = SUBSCRIPTION_STATES.PAST_DUE;
        existing.graceEndsAt = now + 72 * 3600 * 1000;
      } else if (obj.cancel_at_period_end) {
        existing.status = SUBSCRIPTION_STATES.CANCELED_AT_PERIOD_END;
        existing.cancelAtPeriodEnd = true;
        if (obj.current_period_end) existing.expiresAt = obj.current_period_end * 1000;
      } else if (obj.status === "active" || obj.status === "trialing") {
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
      existing.creditsRemaining = 0;
      existing.unlimited = false;
      clawbackStatus = "CLAWBACK_REFUNDED";
      break;
    }
    case "charge.dispute.created": {
      existing.status = SUBSCRIPTION_STATES.DISPUTED;
      existing.expiresAt = now - 1000;
      existing.creditsRemaining = 0;
      existing.unlimited = false;
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

const VERIFY_LICENSE_EXTRA_ORIGINS = new Set([
  "https://chatgpt.com",
  "https://claude.ai"
]);

const GLOBAL_RATE_LIMITS = new Map();
const MAX_DEVICES_PER_LICENSE = 4;

function isAllowedExtensionOrigin(origin) {
  return /^chrome-extension:\/\/[a-z]{32}$/.test(String(origin || ""));
}

function buildCorsHeaders(origin, pathname) {
  const isVerifyPath = pathname === "/verify-license" || pathname === "/consume-credit";
  const allowed =
    ALLOWED_ORIGINS.has(origin) ||
    isAllowedExtensionOrigin(origin) ||
    (isVerifyPath && VERIFY_LICENSE_EXTRA_ORIGINS.has(origin))
      ? origin
      : "https://pureaistudios.com";
  return {
    "Access-Control-Allow-Origin": allowed,
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Stripe-Signature, Authorization",
    "Content-Type": "application/json; charset=utf-8",
    "X-Content-Type-Options": "nosniff",
    "Cache-Control": "no-store"
  };
}

function extractClientIp(req) {
  if (!req || !req.headers || typeof req.headers.get !== "function") return null;
  const raw = String(req.headers.get("cf-connecting-ip") || "").trim();
  if (!raw || raw.length > 45 || raw.startsWith("http://") || raw.startsWith("https://")) return null;
  const normalized = raw.replace(/^::ffff:/i, "");
  if (/^(?:\d{1,3}\.){3}\d{1,3}$/.test(normalized)) return normalized;
  if (/^[0-9a-fA-F:]{2,45}$/.test(normalized) && normalized.includes(":")) return normalized.toLowerCase();
  if (/^[0-9a-fA-F:.]{2,45}$/.test(normalized) && normalized.includes(":")) return normalized.toLowerCase();
  return null;
}

function checkWorkerRateLimit(rateMap, bucketKey, maxPerMinute, nowMs) {
  if (!bucketKey) return { allowed: true };
  const map = rateMap || GLOBAL_RATE_LIMITS;
  const now = typeof nowMs === "number" ? nowMs : Date.now();
  const windowMs = 60 * 1000;
  const prev = map.get(bucketKey);
  const timestamps = Array.isArray(prev) ? prev.filter((t) => now - t < windowMs) : [];
  if (timestamps.length >= maxPerMinute) {
    map.set(bucketKey, timestamps);
    return { allowed: false, retryAfterSec: 60 };
  }
  timestamps.push(now);
  if (map.size > 5000 && !prev) {
    const oldestKey = map.keys().next().value;
    if (oldestKey) map.delete(oldestKey);
  }
  map.set(bucketKey, timestamps);
  return { allowed: true };
}

function verifyAdminBearerAuth(req, env) {
  const expectedSecret = String((env && (env.ADMIN_DIGEST_TOKEN || env.STRIPE_WEBHOOK_SECRET)) || "").trim();
  if (expectedSecret.length < 12) return false;
  const authHeader = String((req && req.headers && typeof req.headers.get === "function" && req.headers.get("authorization")) || "").trim();
  if (!authHeader.startsWith("Bearer ")) return false;
  const provided = authHeader.slice(7).trim();
  return timingSafeStringEqual(provided, expectedSecret);
}

const ALLOWED_TELEMETRY_STR_FIELDS = [
  "type", "event_name", "target", "tool_id", "trigger_tool", "plan_selected",
  "channel", "lang", "cohortWeek", "retentionBucket", "userTier", "page",
  "aff", "partner", "maskedSession", "maskedProKey", "commissionBasis"
];
const ALLOWED_TELEMETRY_BOOL_FIELDS = ["isReturning", "genuineReturn", "isDemo"];
const ALLOWED_TELEMETRY_NUM_FIELDS = ["daysSinceFirstVisit", "usedCredits", "line"];

function sanitizeClientTelemetryPayload(parsed) {
  const clean = {};
  for (const k of ALLOWED_TELEMETRY_STR_FIELDS) {
    if (typeof parsed[k] === "string" && parsed[k].length > 0) {
      clean[k] = parsed[k].slice(0, 120);
    }
  }
  if (typeof parsed.msg === "string" && parsed.msg.length > 0) {
    clean.msg = parsed.msg.slice(0, 500);
  }
  for (const k of ALLOWED_TELEMETRY_BOOL_FIELDS) {
    if (typeof parsed[k] === "boolean") clean[k] = parsed[k];
  }
  for (const k of ALLOWED_TELEMETRY_NUM_FIELDS) {
    if (typeof parsed[k] === "number" && Number.isFinite(parsed[k])) {
      clean[k] = Math.max(0, Math.min(1000000, Math.trunc(parsed[k])));
    }
  }
  return clean;
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
  const effectiveCustId = (result.subscription && result.subscription.customerId) || customerId;
  const sessId = (obj.id && String(obj.id).startsWith("cs_") ? String(obj.id) : null) || (result.subscription && result.subscription.lastCheckoutSessionId);

  if (result.subscription) {
    const serializedSub = JSON.stringify(result.subscription);
    const proKey = result.subscription.proKey;
    const piId = result.subscription.lastPaymentIntentId || obj.payment_intent;
    if (effectiveCustId) await kv.put(`sub:${effectiveCustId}`, serializedSub);
    if (sessId) await kv.put(`sess:${sessId}`, serializedSub);
    if (proKey) await kv.put(`key:${proKey.toUpperCase()}`, serializedSub);
    if (piId) await kv.put(`pi:${piId}`, serializedSub);
  }
  if (result.pendingAffiliateKey && result.pendingAffiliateEntry) {
    await kv.put(
      `aff_cust:${effectiveCustId}`,
      JSON.stringify({ key: result.pendingAffiliateKey, entry: result.pendingAffiliateEntry })
    );
  } else if (result.clawbackStatus && effectiveCustId && typeof kv.get === "function") {
    const affKey = `aff_cust:${effectiveCustId}`;
    const affRaw = (await kv.get(affKey)) || (customerId !== effectiveCustId ? await kv.get(`aff_cust:${customerId}`) : null);
    if (affRaw) {
      try {
        const parsed = JSON.parse(affRaw);
        if (parsed && parsed.entry) {
          parsed.entry.commissionCents = 0;
          parsed.entry.status = result.clawbackStatus;
          await kv.put(affKey, JSON.stringify(parsed));
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
  const rateMap = (sharedStore && sharedStore.rateLimits) || GLOBAL_RATE_LIMITS;
  const url = new URL(req.url || "https://pureaistudios.com/");
  const rawOrigin = (req.headers && req.headers.get && req.headers.get("origin")) || "";
  const origin = rawOrigin || "https://pureaistudios.com";
  const headers = buildCorsHeaders(origin, url.pathname);
  const clientIp = extractClientIp(req);

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
      if (eventObj.type === "checkout.session.completed" && result.state === SUBSCRIPTION_STATES.ACTIVE) {
        const objPaid = (eventObj.data && eventObj.data.object) || {};
        const amountEur = ((Number(objPaid.amount_total) || 0) / 100).toFixed(2);
        const rawRef = String(objPaid.client_reference_id || "");
        const affPartner = rawRef.startsWith("aff_") ? rawRef.slice(4) : "organic";
        if (env && env.PUREAI_LICENSES_KV && typeof env.PUREAI_LICENSES_KV.get === "function" && typeof env.PUREAI_LICENSES_KV.put === "function") {
          try {
            const rawList = await env.PUREAI_LICENSES_KV.get("telemetry:recent_events");
            const list = rawList ? JSON.parse(rawList) : [];
            const saleEv = {
              id: "sale_" + eventObj.id,
              type: "sale_verified_session",
              event_name: "purchase_verified",
              amount_eur: amountEur,
              amountCents: Number(objPaid.amount_total) || 0,
              partner: affPartner,
              planInterval: result.subscription && result.subscription.planInterval,
              ts: new Date().toISOString()
            };
            await incrementLifetimeTelemetryCounter(env, saleEv, list);
            list.push(saleEv);
            while (list.length > 600) list.shift();
            await env.PUREAI_LICENSES_KV.put("telemetry:recent_events", JSON.stringify(list));
          } catch (_) {}
        }
        if (env && env.TELEGRAM_BOT_TOKEN && env.TELEGRAM_CHAT_ID && typeof fetch === "function") {
          const planLabel =
            result.subscription && result.subscription.planType === "pack_10"
              ? "Pack 10 usos"
              : result.subscription && result.subscription.planType === "pack_50"
                ? "Pack 50 usos + .ZIP"
                : result.subscription && result.subscription.planInterval === "year"
                  ? "Anual Ilimitado"
                  : "Suscripción Mensual";
          try {
            await fetch("https://api.telegram.org/bot" + env.TELEGRAM_BOT_TOKEN + "/sendMessage", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                chat_id: env.TELEGRAM_CHAT_ID,
                text: "💰 ¡NUEVA VENTA PAGADA EN STRIPE!\n• Importe: " + amountEur + " €\n• Plan: " + planLabel + "\n• Clave Pro: " + ((result.subscription && result.subscription.proKey) || "Activa"),
                disable_web_page_preview: true
              })
            });
          } catch (_) {}
        }
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
    if (clientIp) {
      const rl = checkWorkerRateLimit(rateMap, `verify:${clientIp}`, 20, Date.now());
      if (!rl.allowed) {
        return {
          status: 429,
          headers: { ...headers, "Retry-After": String(rl.retryAfterSec) },
          body: JSON.stringify({ valid: false, reason: "rate_limit_exceeded" })
        };
      }
    }
    const code = String(url.searchParams.get("code") || "").trim();
    if (!code || code.length < 8 || code.length > 128 || /^cs_test_/i.test(code)) {
      return { status: 400, headers, body: JSON.stringify({ valid: false, reason: "invalid_code_format" }) };
    }
    // Priorizar KV de Cloudflare para garantizar consistencia entre instancias y reinicios
    let subRecord = null;
    const kvKey = code.startsWith("cs_")
      ? `sess:${code}`
      : /^PRO-[A-Z2-9]{4}-[A-Z2-9]{4}$/i.test(code)
        ? `key:${code.toUpperCase()}`
        : `sub:${code}`;
    if (env && env.PUREAI_LICENSES_KV && typeof env.PUREAI_LICENSES_KV.get === "function") {
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
    const isUnlimitedSub = subRecord.unlimited !== false;
    const hasPackCredits = isUnlimitedSub || (typeof subRecord.creditsRemaining === "number" && subRecord.creditsRemaining > 0);
    const isActive =
      hasPackCredits &&
      ((subRecord.status === SUBSCRIPTION_STATES.ACTIVE && (!subRecord.expiresAt || now <= subRecord.expiresAt)) ||
        (subRecord.status === SUBSCRIPTION_STATES.CANCELED_AT_PERIOD_END && now <= subRecord.expiresAt) ||
        (subRecord.status === SUBSCRIPTION_STATES.PAST_DUE && now <= subRecord.graceEndsAt));

    const rawDid = String(url.searchParams.get("did") || "").trim();
    if (rawDid && !/^[a-zA-Z0-9_-]{8,64}$/.test(rawDid)) {
      return {
        status: 400,
        headers,
        body: JSON.stringify({ valid: false, reason: "invalid_device_id" })
      };
    }
    const effectiveDid = rawDid || (clientIp ? "ip_" + hmacSha256Hex("pureai-did-slot", clientIp).slice(0, 16) : "");
    if (isActive) {
      const boundDevices = Array.isArray(subRecord.boundDevices) ? [...subRecord.boundDevices] : [];
      if (!effectiveDid && boundDevices.length >= MAX_DEVICES_PER_LICENSE) {
        return {
          status: 403,
          headers,
          body: JSON.stringify({
            valid: false,
            verifiedByServer: true,
            status: "DEVICE_LIMIT_REACHED",
            reason: "max_devices_exceeded",
            maxDevices: MAX_DEVICES_PER_LICENSE
          })
        };
      }
      if (effectiveDid && !boundDevices.includes(effectiveDid)) {
        if (boundDevices.length >= MAX_DEVICES_PER_LICENSE) {
          return {
            status: 403,
            headers,
            body: JSON.stringify({
              valid: false,
              verifiedByServer: true,
              status: "DEVICE_LIMIT_REACHED",
              reason: "max_devices_exceeded",
              maxDevices: MAX_DEVICES_PER_LICENSE
            })
          };
        }
        boundDevices.push(effectiveDid);
        subRecord.boundDevices = boundDevices;
        store.subscriptionsByCustomer.set(code, subRecord);
        if (subRecord.proKey) store.subscriptionsByCustomer.set(subRecord.proKey, subRecord);
        if (subRecord.lastCheckoutSessionId) store.subscriptionsByCustomer.set(subRecord.lastCheckoutSessionId, subRecord);
        if (subRecord.customerId) store.subscriptionsByCustomer.set(subRecord.customerId, subRecord);
        if (env && env.PUREAI_LICENSES_KV && typeof env.PUREAI_LICENSES_KV.put === "function") {
          const serializedSub = JSON.stringify(subRecord);
          await env.PUREAI_LICENSES_KV.put(kvKey, serializedSub);
          if (subRecord.customerId) await env.PUREAI_LICENSES_KV.put(`sub:${subRecord.customerId}`, serializedSub);
          if (subRecord.lastCheckoutSessionId) await env.PUREAI_LICENSES_KV.put(`sess:${subRecord.lastCheckoutSessionId}`, serializedSub);
          if (subRecord.proKey) await env.PUREAI_LICENSES_KV.put(`key:${subRecord.proKey.toUpperCase()}`, serializedSub);
        }
      }
    }

    const responsePayload = {
      valid: isActive,
      verifiedByServer: true,
      status: !hasPackCredits && !isUnlimitedSub ? SUBSCRIPTION_STATES.EXPIRED : subRecord.status,
      planInterval: subRecord.planInterval || "month",
      planType: subRecord.planType || (subRecord.planInterval === "year" ? "annual_unlimited" : "monthly_unlimited"),
      unlimited: isUnlimitedSub,
      creditsRemaining: typeof subRecord.creditsRemaining === "number" ? subRecord.creditsRemaining : null,
      expiresAt: subRecord.expiresAt,
      graceEndsAt: subRecord.graceEndsAt
    };
    if (!hasPackCredits && !isUnlimitedSub) {
      responsePayload.reason = "credits_exhausted";
    }
    if (isActive) {
      responsePayload.proKey = subRecord.proKey || deriveProKeyFromSession(code);
    }

    return {
      status: 200,
      headers,
      body: JSON.stringify(responsePayload)
    };
  }

  // 2a-bis. Consumo atómico e idempotente de créditos en Lotes de Uso (POST /consume-credit)
  if (req.method === "POST" && url.pathname === "/consume-credit") {
    if (clientIp) {
      const rl = checkWorkerRateLimit(rateMap, `consume:${clientIp}`, 60, Date.now());
      if (!rl.allowed) {
        return {
          status: 429,
          headers: { ...headers, "Retry-After": String(rl.retryAfterSec) },
          body: JSON.stringify({ ok: false, reason: "rate_limit_exceeded" })
        };
      }
    }
    if (rawOrigin && !ALLOWED_ORIGINS.has(rawOrigin) && !isAllowedExtensionOrigin(rawOrigin) && !VERIFY_LICENSE_EXTRA_ORIGINS.has(rawOrigin)) {
      return { status: 403, headers, body: JSON.stringify({ ok: false, reason: "origin_not_allowed" }) };
    }
    const rawBody = typeof req.text === "function" ? await req.text() : String(req.body || "");
    if (!rawBody || rawBody.length > 2048) {
      return { status: 400, headers, body: JSON.stringify({ ok: false, reason: "invalid_payload_size" }) };
    }
    let parsed;
    try {
      parsed = JSON.parse(rawBody);
    } catch (_) {
      return { status: 400, headers, body: JSON.stringify({ ok: false, reason: "invalid_json" }) };
    }
    const code = String((parsed && parsed.code) || "").trim();
    if (!code || code.length < 8 || code.length > 128 || /^cs_test_/i.test(code)) {
      return { status: 400, headers, body: JSON.stringify({ ok: false, reason: "invalid_code_format" }) };
    }
    const count = Math.max(1, Math.min(100, Math.trunc(Number(parsed && parsed.count) || 1)));
    const cleanOpId = typeof (parsed && parsed.opId) === "string" ? parsed.opId.trim().slice(0, 80) : "";

    let subRecord = null;
    const kvKey = code.startsWith("cs_")
      ? `sess:${code}`
      : /^PRO-[A-Z2-9]{4}-[A-Z2-9]{4}$/i.test(code)
        ? `key:${code.toUpperCase()}`
        : `sub:${code}`;
    if (env && env.PUREAI_LICENSES_KV && typeof env.PUREAI_LICENSES_KV.get === "function") {
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
      return { status: 404, headers, body: JSON.stringify({ ok: false, reason: "license_not_found" }) };
    }

    const now = Date.now();
    const validTimeState =
      (subRecord.status === SUBSCRIPTION_STATES.ACTIVE && (!subRecord.expiresAt || now <= subRecord.expiresAt)) ||
      (subRecord.status === SUBSCRIPTION_STATES.CANCELED_AT_PERIOD_END && now <= subRecord.expiresAt) ||
      (subRecord.status === SUBSCRIPTION_STATES.PAST_DUE && now <= subRecord.graceEndsAt);

    if (subRecord.unlimited !== false) {
      if (!validTimeState) {
        return { status: 403, headers, body: JSON.stringify({ ok: false, reason: "inactive_license" }) };
      }
      return { status: 200, headers, body: JSON.stringify({ ok: true, unlimited: true, creditsRemaining: null }) };
    }

    if (cleanOpId && Array.isArray(subRecord.recentOpIds) && subRecord.recentOpIds.includes(cleanOpId)) {
      return {
        status: 200,
        headers,
        body: JSON.stringify({
          ok: true,
          idempotent: true,
          unlimited: false,
          creditsRemaining: Math.max(0, Number(subRecord.creditsRemaining) || 0)
        })
      };
    }

    const currentCredits = Math.max(0, Number(subRecord.creditsRemaining) || 0);
    if (!validTimeState || currentCredits < count) {
      return {
        status: 403,
        headers,
        body: JSON.stringify({
          ok: false,
          reason: currentCredits < count ? "insufficient_credits" : "inactive_license",
          creditsRemaining: currentCredits
        })
      };
    }

    subRecord.creditsRemaining = currentCredits - count;
    if (cleanOpId) {
      const ops = Array.isArray(subRecord.recentOpIds) ? subRecord.recentOpIds.slice(-19) : [];
      ops.push(cleanOpId);
      subRecord.recentOpIds = ops;
    }
    if (subRecord.creditsRemaining === 0) {
      subRecord.status = SUBSCRIPTION_STATES.EXPIRED;
    }

    store.subscriptionsByCustomer.set(code, subRecord);
    if (subRecord.proKey) store.subscriptionsByCustomer.set(subRecord.proKey, subRecord);
    if (subRecord.lastCheckoutSessionId) store.subscriptionsByCustomer.set(subRecord.lastCheckoutSessionId, subRecord);
    if (subRecord.customerId) store.subscriptionsByCustomer.set(subRecord.customerId, subRecord);

    if (env && env.PUREAI_LICENSES_KV && typeof env.PUREAI_LICENSES_KV.put === "function") {
      const serializedSub = JSON.stringify(subRecord);
      await env.PUREAI_LICENSES_KV.put(kvKey, serializedSub);
      if (subRecord.customerId) await env.PUREAI_LICENSES_KV.put(`sub:${subRecord.customerId}`, serializedSub);
      if (subRecord.lastCheckoutSessionId) await env.PUREAI_LICENSES_KV.put(`sess:${subRecord.lastCheckoutSessionId}`, serializedSub);
      if (subRecord.proKey) await env.PUREAI_LICENSES_KV.put(`key:${subRecord.proKey.toUpperCase()}`, serializedSub);
    }

    return {
      status: 200,
      headers,
      body: JSON.stringify({
        ok: true,
        unlimited: false,
        creditsRemaining: subRecord.creditsRemaining,
        status: subRecord.status
      })
    };
  }

  // 2a-ter. Control Anti-Incógnito RGPD-minimizado de cuota gratuita (POST /check-free-quota: hash salado efímero de IP, límite 1)
  if (req.method === "POST" && url.pathname === "/check-free-quota") {
    if (clientIp) {
      const rl = checkWorkerRateLimit(rateMap, `freeq_rl:${clientIp}`, 30, Date.now());
      if (!rl.allowed) {
        return {
          status: 429,
          headers: { ...headers, "Retry-After": String(rl.retryAfterSec) },
          body: JSON.stringify({ ok: false, reason: "rate_limit_exceeded" })
        };
      }
    }
    if (rawOrigin && !ALLOWED_ORIGINS.has(rawOrigin) && !isAllowedExtensionOrigin(rawOrigin)) {
      return { status: 403, headers, body: JSON.stringify({ ok: false, reason: "origin_not_allowed" }) };
    }
    let consume = false;
    try {
      const rawBody = typeof req.text === "function" ? await req.text() : String(req.body || "{}");
      if (rawBody && rawBody.length <= 512) {
        const parsed = JSON.parse(rawBody);
        consume = Boolean(parsed && parsed.consume);
      }
    } catch (_) {}

    const MAX_SERVER_FREE_USES = 1;
    const cfCountry = String((req.cf && req.cf.country) || (req.headers && req.headers.get && req.headers.get("cf-ipcountry")) || "").trim().toUpperCase().slice(0, 2) || null;
    if (!clientIp) {
      return { status: 200, headers, body: JSON.stringify({ ok: true, allowed: true, used: 0, limit: MAX_SERVER_FREE_USES, country: cfCountry }) };
    }
    const monthBucket = new Date().toISOString().slice(0, 7);
    const salt = String((env && env.STRIPE_WEBHOOK_SECRET) || "pureai-freeq-salt-2026").slice(0, 24);
    const ipHash = hmacSha256Hex(`freeq:${monthBucket}:${salt}`, clientIp).slice(0, 20);
    const fqKey = `freeq:${monthBucket}:${ipHash}`;

    let used = 0;
    const memVal = rateMap.get(fqKey);
    if (typeof memVal === "number" && Number.isFinite(memVal)) {
      used = Math.max(0, memVal);
    }
    if (env && env.PUREAI_LICENSES_KV && typeof env.PUREAI_LICENSES_KV.get === "function") {
      try {
        const kvVal = await env.PUREAI_LICENSES_KV.get(fqKey);
        if (kvVal !== null && kvVal !== undefined) {
          used = Math.max(used, parseInt(String(kvVal), 10) || 0);
        }
      } catch (_) {}
    }

    if (used >= MAX_SERVER_FREE_USES) {
      return {
        status: 200,
        headers,
        body: JSON.stringify({
          ok: true,
          allowed: false,
          used,
          limit: MAX_SERVER_FREE_USES,
          country: cfCountry,
          reason: "free_quota_exhausted"
        })
      };
    }

    if (consume) {
      const nextUsed = used + 1;
      rateMap.set(fqKey, nextUsed);
      if (env && env.PUREAI_LICENSES_KV && typeof env.PUREAI_LICENSES_KV.put === "function") {
        try {
          await env.PUREAI_LICENSES_KV.put(fqKey, String(nextUsed), { expirationTtl: 30 * 24 * 3600 });
        } catch (_) {}
      }
      return {
        status: 200,
        headers,
        body: JSON.stringify({ ok: true, allowed: true, used: nextUsed, limit: MAX_SERVER_FREE_USES, country: cfCountry })
      };
    }

    return {
      status: 200,
      headers,
      body: JSON.stringify({ ok: true, allowed: true, used, limit: MAX_SERVER_FREE_USES, country: cfCountry })
    };
  }

  // 2b. Lectura autenticada de eventos recientes para monitorización privada (GET /telemetry)
  if (req.method === "GET" && url.pathname === "/telemetry") {
    if (!verifyAdminBearerAuth(req, env)) {
      return { status: 401, headers, body: JSON.stringify({ ok: false, error: "unauthorized" }) };
    }
    let list = [];
    if (env && env.PUREAI_LICENSES_KV && typeof env.PUREAI_LICENSES_KV.get === "function") {
      try {
        const rawList = await env.PUREAI_LICENSES_KV.get("telemetry:recent_events");
        if (rawList) list = JSON.parse(rawList);
      } catch (_) {}
    }
    return { status: 200, headers, body: JSON.stringify({ ok: true, events: list }) };
  }

  // 3. Endpoint Server-Side de Soporte y Telemetría Opt-In (POST /telemetry | POST /support) para no exponer temas públicos en cliente
  if (req.method === "POST" && (url.pathname === "/telemetry" || url.pathname === "/support")) {
    if (clientIp) {
      const rl = checkWorkerRateLimit(rateMap, `telemetry:${clientIp}`, 45, Date.now());
      if (!rl.allowed) {
        return {
          status: 429,
          headers: { ...headers, "Retry-After": String(rl.retryAfterSec) },
          body: JSON.stringify({ ok: false, error: "rate_limit_exceeded" })
        };
      }
    }
    if (rawOrigin && !ALLOWED_ORIGINS.has(rawOrigin) && !isAllowedExtensionOrigin(rawOrigin)) {
      return { status: 403, headers, body: JSON.stringify({ ok: false, error: "origin_not_allowed" }) };
    }
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
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
      return { status: 400, headers, body: JSON.stringify({ ok: false, error: "invalid_payload_object" }) };
    }
    if (parsed.event_name === "purchase_verified" || parsed.type === "sale_verified_session") {
      return { status: 403, headers, body: JSON.stringify({ ok: false, error: "forbidden_server_only_event" }) };
    }
    const sanitized = sanitizeClientTelemetryPayload(parsed);
    const evWithId = {
      ...sanitized,
      id: "kv_" + Date.now() + "_" + Math.random().toString(36).slice(2, 7),
      ts: new Date().toISOString()
    };
    if (env && env.PUREAI_LICENSES_KV && typeof env.PUREAI_LICENSES_KV.get === "function" && typeof env.PUREAI_LICENSES_KV.put === "function") {
      try {
        const rawList = await env.PUREAI_LICENSES_KV.get("telemetry:recent_events");
        const list = rawList ? JSON.parse(rawList) : [];
        await incrementLifetimeTelemetryCounter(env, evWithId, list);
        list.push(evWithId);
        while (list.length > 600) list.shift();
        await env.PUREAI_LICENSES_KV.put("telemetry:recent_events", JSON.stringify(list));
      } catch (_) {}
    }
    const ntfyUrl = (env && env.NTFY_SECRET_TOPIC_URL) || "";
    if (ntfyUrl && typeof fetch === "function") {
      try {
        await fetch(ntfyUrl, { method: "POST", body: JSON.stringify(sanitized) });
      } catch (_) {}
    }
    return { status: 200, headers, body: JSON.stringify({ ok: true, relayed: true }) };
  }

  if (req.method === "POST" && url.pathname === "/daily-digest") {
    if (!verifyAdminBearerAuth(req, env)) {
      return { status: 401, headers, body: JSON.stringify({ ok: false, error: "unauthorized" }) };
    }
    let bodyObj = {};
    try {
      const raw = typeof req.text === "function" ? await req.text() : String(req.body || "{}");
      bodyObj = JSON.parse(raw || "{}");
    } catch (_) {}
    const res = await buildAndSendDailyTelegramDigest(env, {
      force: Boolean(bodyObj && bodyObj.force),
      topOpp: bodyObj && bodyObj.topOpp
    });
    return { status: 200, headers, body: JSON.stringify(res) };
  }

  // 7. Bot Público Viral de Telegram (Escáner Forense C2PA / EXIF GPS en RAM sin guardar archivos)
  if (req.method === "POST" && url.pathname === "/telegram-public-bot") {
    const pubBotToken = (env && env.PUBLIC_TELEGRAM_BOT_TOKEN) ? String(env.PUBLIC_TELEGRAM_BOT_TOKEN).trim() : "";
    const pubWebhookSecret = (env && env.PUBLIC_TELEGRAM_WEBHOOK_SECRET) ? String(env.PUBLIC_TELEGRAM_WEBHOOK_SECRET).trim() : "";
    if (!pubBotToken || !pubWebhookSecret) {
      return { status: 503, headers, body: JSON.stringify({ ok: false, error: "public_bot_not_configured" }) };
    }
    const gotSecret = (req.headers && typeof req.headers.get === "function" ? req.headers.get("x-telegram-bot-api-secret-token") : "") || "";
    if (!timingSafeStringEqual(gotSecret, pubWebhookSecret)) {
      return { status: 401, headers, body: JSON.stringify({ ok: false, error: "invalid_telegram_secret" }) };
    }
    if (clientIp) {
      const rl = checkWorkerRateLimit(rateMap, `tgpub:${clientIp}`, 40, Date.now());
      if (!rl.allowed) {
        return { status: 429, headers, body: JSON.stringify({ ok: false, error: "rate_limited" }) };
      }
    }
    let update = {};
    try {
      const raw = typeof req.text === "function" ? await req.text() : String(req.body || "{}");
      if (raw.length > 65536) return { status: 413, headers, body: JSON.stringify({ ok: false }) };
      update = JSON.parse(raw || "{}");
    } catch (_) {
      return { status: 400, headers, body: JSON.stringify({ ok: false, error: "invalid_json" }) };
    }
    const msg = update && (update.message || update.edited_message);
    const chatId = msg && msg.chat && msg.chat.id;
    if (!chatId) {
      return { status: 200, headers, body: JSON.stringify({ ok: true, ignored: true }) };
    }
    const isEsUser = String((msg.from && msg.from.language_code) || "").toLowerCase().startsWith("es");
    const replyResult = await handlePublicTelegramBotMessage(pubBotToken, chatId, msg, isEsUser);
    return { status: 200, headers, body: JSON.stringify(replyResult) };
  }

  if (req.method === "POST" && url.pathname === "/setup-public-telegram-bot") {
    if (!verifyAdminBearerAuth(req, env)) {
      return { status: 401, headers, body: JSON.stringify({ ok: false, error: "unauthorized" }) };
    }
    const pubBotToken = (env && env.PUBLIC_TELEGRAM_BOT_TOKEN) ? String(env.PUBLIC_TELEGRAM_BOT_TOKEN).trim() : "";
    const pubWebhookSecret = (env && env.PUBLIC_TELEGRAM_WEBHOOK_SECRET) ? String(env.PUBLIC_TELEGRAM_WEBHOOK_SECRET).trim() : "";
    if (!pubBotToken || !pubWebhookSecret) {
      return { status: 400, headers, body: JSON.stringify({ ok: false, error: "missing_public_bot_secrets" }) };
    }
    const webhookUrl = `${url.origin}/telegram-public-bot`;
    const tgRes = await fetch(`https://api.telegram.org/bot${pubBotToken}/setWebhook`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        url: webhookUrl,
        secret_token: pubWebhookSecret,
        allowed_updates: ["message"]
      })
    }).then((r) => r.json()).catch(() => ({ ok: false }));
    return { status: 200, headers, body: JSON.stringify({ ok: Boolean(tgRes && tgRes.ok), webhookUrl }) };
  }

  return { status: 404, headers, body: JSON.stringify({ ok: false, error: "not_found" }) };
}

function inspectBinaryHeaderForTelegram(bytes) {
  const arr = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes || []);
  const slice = arr.subarray(0, Math.min(arr.length, 65536));
  const ascii = new TextDecoder("latin1").decode(slice);
  let hasGpsBin = false;
  for (let i = 0; i + 3 < slice.length; i++) {
    if (
      (slice[i] === 0x25 && slice[i + 1] === 0x88 && slice[i + 2] === 0x04 && slice[i + 3] === 0x00) ||
      (slice[i] === 0x88 && slice[i + 1] === 0x25 && slice[i + 2] === 0x00 && slice[i + 3] === 0x04)
    ) {
      hasGpsBin = true;
      break;
    }
  }
  const findings = [];
  if (/c2pa|jumbf|c2ma|contentcredentials/i.test(ascii)) findings.push("C2PA / JUMBF AI Content Credentials");
  if (/trainedAlgorithmicMedia|DigitalSourceType/i.test(ascii)) findings.push("IPTC / XMP trainedAlgorithmicMedia");
  if (/GPSInfo|GPSLatitude|GPSLongitude/.test(ascii) || hasGpsBin) findings.push("EXIF Binary GPS Coordinates (0x8825)");
  if (/Exif\0\0/.test(ascii)) findings.push("Camera / Device EXIF APP1 Header");
  if (/ComfyUI|workflow|parameters|Midjourney|Stable Diffusion|DALL-E|Sora|Runway|Kling/i.test(ascii)) findings.push("Embedded AI Generator / Prompt Chunk");
  return { hasThreats: findings.length > 0, findings };
}

async function handlePublicTelegramBotMessage(botToken, chatId, msg, isEs) {
  const studioUrl = isEs
    ? "https://pureaistudios.com/clean-ai-studio.html?lang=es&utm_source=telegram_bot"
    : "https://pureaistudios.com/clean-ai-studio.html?lang=en&utm_source=telegram_bot";
  const shareUrl = "https://t.me/share/url?url=" + encodeURIComponent("https://pureaistudios.com") + "&text=" + encodeURIComponent(
    isEs
      ? "🔎 Escáner y limpiador gratis de etiquetas 'Creado con IA' (C2PA), vídeos MP4 y GPS EXIF 100% privado:"
      : "🔎 Free 100% local C2PA 'Made with AI', MP4 & EXIF GPS forensic scanner & cleaner:"
  );
  const inlineKeyboard = {
    inline_keyboard: [
      [{ text: isEs ? "🧹 Limpiar C2PA / Añadir EXIF iPhone 16 Pro" : "🧹 Strip C2PA / Add iPhone 16 Pro EXIF", url: studioUrl }],
      [{ text: isEs ? "📲 Compartir Escáner en Telegram" : "📲 Share Scanner on Telegram", url: shareUrl }]
    ]
  };

  let fileId = "";
  let fileSize = 0;
  let isCompressedPhotoHint = false;
  if (msg.document && msg.document.file_id) {
    fileId = msg.document.file_id;
    fileSize = Number(msg.document.file_size) || 0;
  } else if (Array.isArray(msg.photo) && msg.photo.length > 0) {
    const largest = msg.photo[msg.photo.length - 1];
    fileId = largest.file_id;
    fileSize = Number(largest.file_size) || 0;
    isCompressedPhotoHint = true;
  } else if (msg.video && msg.video.file_id) {
    fileId = msg.video.file_id;
    fileSize = Number(msg.video.file_size) || 0;
  }

  let replyText = "";
  let findings = [];
  if (!fileId) {
    replyText = isEs
      ? "🧬 PureAI Forensic Scanner\n\nEnvíame cualquier foto (JPG/PNG/WebP) o vídeo MP4 (preferiblemente como 'Archivo / Documento' sin comprimir) y analizaré en memoria RAM si esconde:\n• Etiquetas 'Creado con IA' (C2PA / JUMBF)\n• Workflows ocultos de ComfyUI / Midjourney / Sora\n• Coordenadas exactas GPS EXIF (0x8825)\n\n🛡️ 0 bytes guardados. O usa el estudio 100% local en tu navegador abajo:"
      : "🧬 PureAI Forensic Scanner\n\nSend me any photo (JPG/PNG/WebP) or MP4 video (ideally as an uncompressed 'File / Document') and I will inspect in RAM whether it hides:\n• 'Made with AI' C2PA / JUMBF credentials\n• Hidden ComfyUI / Midjourney / Sora tags\n• Exact EXIF GPS coordinates (0x8825)\n\n🛡️ 0 bytes stored. Or launch the 100% local browser studio below:";
  } else if (fileSize > 20 * 1024 * 1024) {
    replyText = isEs
      ? "⚠️ El archivo supera el límite de 20 MB de la API de bots de Telegram. Ábrelo directamente en PureAI Studio (soporta hasta 150 MB 100% en tu propio navegador sin subirlo):"
      : "⚠️ File exceeds Telegram's 20 MB Bot API limit. Open it directly in PureAI Studio (supports up to 150 MB 100% locally in your browser with zero upload):";
  } else {
    try {
      const gf = await fetch(`https://api.telegram.org/bot${botToken}/getFile?file_id=${encodeURIComponent(fileId)}`).then((r) => r.json());
      const filePath = gf && gf.ok && gf.result && gf.result.file_path;
      if (filePath && typeof fetch === "function") {
        const binRes = await fetch(`https://api.telegram.org/file/bot${botToken}/${filePath}`, {
          headers: { Range: "bytes=0-65535" }
        });
        const buf = await binRes.arrayBuffer();
        const report = inspectBinaryHeaderForTelegram(new Uint8Array(buf));
        findings = report.findings;
      }
    } catch (_) {}

    if (findings.length > 0) {
      replyText = (isEs ? "⚠️ RASTROS OCULTOS DETECTADOS:\n" : "⚠️ HIDDEN METADATA DETECTED:\n") +
        findings.map((f) => "• " + f).join("\n") +
        (isEs
          ? "\n\nPulsa abajo para exportar una copia 100% limpia o inyectar EXIF de iPhone 16 Pro desde tu navegador:"
          : "\n\nTap below to export a 100% clean copy or inject iPhone 16 Pro EXIF locally in your browser:");
    } else {
      replyText = isEs
        ? "✅ 0 firmas ocultas C2PA / GPS detectadas en la cabecera analizada." + (isCompressedPhotoHint ? "\n💡 Consejo: Telegram comprime las fotos normales; envíala como 'Archivo' o analízala sin compresión en nuestra web:" : "\nPuedes inyectar EXIF de cámara real (iPhone 16 Pro / Sony A7IV) abajo:")
        : "✅ 0 hidden C2PA / GPS signatures found in scanned header." + (isCompressedPhotoHint ? "\n💡 Tip: Telegram recompresses standard photos; send as 'File/Document' or scan the original locally on our web studio:" : "\nYou can also inject real camera EXIF (iPhone 16 Pro / Sony A7IV) below:");
    }
  }

  if (typeof fetch === "function") {
    try {
      await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: chatId,
          text: replyText,
          reply_markup: inlineKeyboard,
          disable_web_page_preview: true
        })
      });
    } catch (_) {}
  }
  return { ok: true, findings };
}


function createTelemetryBucket() {
  return { visits: 0, engaged15s: 0, photos: 0, texts: 0, demos: 0, paywalls: 0, checkouts: 0, paidSales: 0 };
}

function applyEventToTelemetryBucket(b, e) {
  if (!b || !e || e.channel === "test_verificacion_telegram") return;
  if (e.type === "pageview" || e.event_name === "session_start") b.visits++;
  if (e.target === "engaged_15s") b.engaged15s++;
  if (!e.isDemo && (e.target === "image_scrub_download" || (e.event_name === "tool_completed" && (e.tool_id === "img_c2pa_scrubber" || e.tool_id === "video_c2pa_scrubber" || e.tool_id === "img_batch_zip")))) b.photos++;
  if (!e.isDemo && (e.target === "text_watermark_scrub" || e.target === "pro_humanizer_click" || (e.event_name === "tool_completed" && (e.tool_id === "txt_invisible_cleaner" || e.tool_id === "txt_unicode_scrubber" || e.tool_id === "txt_deep_humanizer")))) b.texts++;
  if (e.target === "demo_photo_tested" || e.target === "demo_text_tested" || e.isDemo === true) b.demos++;
  if (e.event_name === "paywall_viewed") b.paywalls++;
  if (e.type === "click_checkout" || e.event_name === "checkout_clicked") b.checkouts++;
  if (e.event_name === "purchase_verified") b.paidSales++;
}

async function incrementLifetimeTelemetryCounter(env, newEv, existingRecentList) {
  if (!env || !env.PUREAI_LICENSES_KV || typeof env.PUREAI_LICENSES_KV.get !== "function" || typeof env.PUREAI_LICENSES_KV.put !== "function") return;
  if (!newEv || newEv.channel === "test_verificacion_telegram") return;
  try {
    let lifetime = null;
    const rawLt = await env.PUREAI_LICENSES_KV.get("telemetry:lifetime_totals");
    if (rawLt) {
      lifetime = Object.assign(createTelemetryBucket(), JSON.parse(rawLt));
    } else {
      lifetime = createTelemetryBucket();
      const seedList = Array.isArray(existingRecentList) ? existingRecentList : [];
      for (const item of seedList) applyEventToTelemetryBucket(lifetime, item);
    }
    applyEventToTelemetryBucket(lifetime, newEv);
    await env.PUREAI_LICENSES_KV.put("telemetry:lifetime_totals", JSON.stringify(lifetime));
  } catch (_) {}
}

async function fetchWorkerTrafficRadar(env) {
  if (typeof fetch !== "function") return [];
  let seenUrls = [];
  if (env && env.PUREAI_LICENSES_KV && typeof env.PUREAI_LICENSES_KV.get === "function") {
    try {
      const rawSeen = await env.PUREAI_LICENSES_KV.get("telemetry:seen_radar_urls");
      if (rawSeen) seenUrls = JSON.parse(rawSeen);
    } catch (_) {}
  }
  const seenSet = new Set(Array.isArray(seenUrls) ? seenUrls : []);
  const fresh = [];
  const fetchWithTimeout = (u, opts) => Promise.race([
    fetch(u, opts),
    new Promise((_, rej) => setTimeout(() => rej(new Error("timeout")), 3200))
  ]);

  try {
    const rUrl = "https://www.reddit.com/search.json?q=%22Made+with+AI%22+Instagram+OR+C2PA+metadata+OR+ComfyUI+workflow+metadata+OR+%22AI+Info%22+Lightroom&sort=new&t=week&limit=6";
    const rRes = await fetchWithTimeout(rUrl, { headers: { "User-Agent": "PureAIStudioRadar/1.0" } });
    if (rRes && rRes.ok && typeof rRes.json === "function") {
      const rJson = await rRes.json();
      const children = (rJson && rJson.data && rJson.data.children) || [];
      for (const c of children) {
        const d = c && c.data;
        if (d && d.title && d.permalink) {
          const fullUrl = "https://www.reddit.com" + d.permalink;
          if (!seenSet.has(fullUrl)) {
            fresh.push({ src: "r/" + (d.subreddit || "reddit"), title: String(d.title).slice(0, 78), url: fullUrl });
            seenSet.add(fullUrl);
            if (fresh.length >= 2) break;
          }
        }
      }
    }
  } catch (_) {}

  try {
    const hnUrl = "https://hn.algolia.com/api/v1/search_by_date?query=C2PA%20OR%20%22Made%20with%20AI%22%20OR%20%22Content%20Credentials%22%20OR%20SynthID&tags=story&hitsPerPage=4";
    const hnRes = await fetchWithTimeout(hnUrl, {});
    if (hnRes && hnRes.ok && typeof hnRes.json === "function") {
      const hnJson = await hnRes.json();
      for (const h of (hnJson && hnJson.hits) || []) {
        if (h && h.objectID && h.title) {
          const fullUrl = "https://news.ycombinator.com/item?id=" + h.objectID;
          if (!seenSet.has(fullUrl)) {
            fresh.push({ src: "HN", title: String(h.title).slice(0, 78), url: fullUrl });
            seenSet.add(fullUrl);
            if (fresh.length >= 3) break;
          }
        }
      }
    }
  } catch (_) {}

  if (fresh.length > 0 && env && env.PUREAI_LICENSES_KV && typeof env.PUREAI_LICENSES_KV.put === "function") {
    try {
      const nextSeen = Array.from(seenSet).slice(-50);
      await env.PUREAI_LICENSES_KV.put("telemetry:seen_radar_urls", JSON.stringify(nextSeen));
    } catch (_) {}
  }
  return fresh.slice(0, 3);
}

async function buildAndSendDailyTelegramDigest(env, options = {}) {
  const nowMs = Date.now();
  const todayIso = new Date(nowMs).toISOString().slice(0, 10);
  if (!options.force && env && env.PUREAI_LICENSES_KV && typeof env.PUREAI_LICENSES_KV.get === "function") {
    try {
      const lastSentDate = await env.PUREAI_LICENSES_KV.get("telemetry:last_digest_date");
      if (lastSentDate === todayIso) {
        return { ok: true, sent: false, reason: "already_sent_today" };
      }
    } catch (_) {}
  }

  let list = [];
  let storedLifetime = null;
  if (env && env.PUREAI_LICENSES_KV && typeof env.PUREAI_LICENSES_KV.get === "function") {
    try {
      const rawList = await env.PUREAI_LICENSES_KV.get("telemetry:recent_events");
      if (rawList) list = JSON.parse(rawList);
    } catch (_) {}
    try {
      const rawLt = await env.PUREAI_LICENSES_KV.get("telemetry:lifetime_totals");
      if (rawLt) storedLifetime = JSON.parse(rawLt);
    } catch (_) {}
  }

  const last24h = createTelemetryBucket();
  const windowTotal = createTelemetryBucket();

  for (const e of list) {
    if (e.channel === "test_verificacion_telegram") continue;
    const evMs = e.ts ? Date.parse(e.ts) : 0;
    const is24h = evMs > 0 && (nowMs - evMs) <= 24 * 3600 * 1000;
    applyEventToTelemetryBucket(windowTotal, e);
    if (is24h) applyEventToTelemetryBucket(last24h, e);
  }

  const total = createTelemetryBucket();
  for (const k of Object.keys(total)) {
    total[k] = Math.max(windowTotal[k] || 0, (storedLifetime && Number(storedLifetime[k])) || 0);
  }
  if (!storedLifetime && env && env.PUREAI_LICENSES_KV && typeof env.PUREAI_LICENSES_KV.put === "function") {
    try {
      await env.PUREAI_LICENSES_KV.put("telemetry:lifetime_totals", JSON.stringify(total));
    } catch (_) {}
  }

  const radarItems = (options.skipRadar || !(env && env.TELEGRAM_BOT_TOKEN)) ? [] : await fetchWorkerTrafficRadar(env);

  const msgLines = [
    "🕙 PureAI Studio — Resumen Diario (10:00 AM):",
    "",
    "🟢 ÚLTIMAS 24 HORAS (HOY):",
    "• Visitas: " + last24h.visits + " (Interés >15s: " + last24h.engaged15s + ")",
    "• Uso real: " + last24h.photos + " Fotos/MP4 | " + last24h.texts + " Textos | " + last24h.demos + " Demos",
    "• Paywalls Pro abiertos: " + last24h.paywalls + " | Clics a Stripe: " + last24h.checkouts + " | Ventas pagadas: " + last24h.paidSales,
    "",
    "🏛️ HISTÓRICO ACUMULADO (PERMANENTE):",
    "• Visitas: " + total.visits + " (Interés >15s: " + total.engaged15s + ")",
    "• Uso total: " + total.photos + " Fotos/MP4 | " + total.texts + " Textos | " + total.demos + " Demos",
    "• Paywalls Pro abiertos: " + total.paywalls + " | Clics a Stripe: " + total.checkouts + " | Ventas pagadas: " + total.paidSales
  ];

  if (radarItems.length > 0) {
    msgLines.push("", "🎯 RADAR DE CLIENTES HOY (Hilos nuevos para responder):");
    for (const item of radarItems) {
      msgLines.push("• [" + item.src + "] " + item.title + "\n  " + item.url);
    }
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
      if (env.PUREAI_LICENSES_KV && typeof env.PUREAI_LICENSES_KV.put === "function") {
        await env.PUREAI_LICENSES_KV.put("telemetry:last_digest_date", todayIso);
      }
    } catch (_) {}
  }
  return { ok: true, sent, last24h, total };
}

const workerDefaultExport = {
  async fetch(request, env) {
    const res = await handleWorkerHttpRequest(request, env);
    if (typeof Response !== "undefined") {
      return new Response(res.body, { status: res.status, headers: res.headers });
    }
    return res;
  },
  async scheduled(event, env, ctx) {
    const p = buildAndSendDailyTelegramDigest(env || (typeof globalThis !== "undefined" ? globalThis : {}), { force: false });
    if (ctx && typeof ctx.waitUntil === "function") ctx.waitUntil(p);
    else await p;
  }
};

if (typeof addEventListener === "function") {
  addEventListener("scheduled", (event) => {
    if (event && typeof event.waitUntil === "function") {
      event.waitUntil(buildAndSendDailyTelegramDigest(typeof globalThis !== "undefined" ? globalThis : {}, { force: false }));
    }
  });
}

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
  inspectBinaryHeaderForTelegram,
  default: workerDefaultExport
};
