// ╔══════════════════════════════════════════════════════════════════════╗
// ║  TEST FLAGS — customer-web/src/config/testFlags.ts                  ║
// ║                                                                     ║
// ║  TEMPORARY TESTING OVERRIDES ONLY.                                  ║
// ║  These flags must NEVER be true in production.                      ║
// ║                                                                     ║
// ║  TO RE-ENABLE THE ₹200 MINIMUM:                                     ║
// ║    Set ENFORCE_MIN_PAYMENT_LIMIT = true  (below)                    ║
// ╚══════════════════════════════════════════════════════════════════════╝

/**
 * ENFORCE_MIN_PAYMENT_LIMIT
 *
 * When TRUE (production default):
 *   - Cart "Proceed to Payment" button is disabled when subtotal < ₹200
 *   - Payment form submit is blocked when subtotal < ₹200
 *   - The ₹200 banner/warning is shown in Cart and Payment pages
 *
 * When FALSE (temporary testing only):
 *   - The ₹200 frontend enforcement is bypassed — cart button becomes enabled
 *   - The ₹200 UI warning banners are still visible but do NOT block checkout
 *   - Checkout submit validation skips the ₹200 check
 *
 * ── TO RE-ENABLE ₹200 MINIMUM ─────────────────────────────────────────
 *   Change the line below to:  export const ENFORCE_MIN_PAYMENT_LIMIT = true;
 *   Must match backend config/testFlags.js setting.
 */
export const ENFORCE_MIN_PAYMENT_LIMIT = true;
