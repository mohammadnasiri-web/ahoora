/**
 * Payment gateway adapter (BalePay stub)
 * Replace requestPayment / verifyPayment with real API calls.
 */
const AhooraPayment = (() => {
  async function requestPayment({ amount, orderId, description, callbackUrl }) {
    const site = AhooraStore.site.get();
    const payment = {
      id: AhooraStore.uid("pay"),
      gateway: site.payment?.gateway || "bale-pay",
      amount,
      orderId,
      description,
      status: "pending",
      createdAt: new Date().toISOString(),
      callbackUrl,
      authority: "BL" + Date.now().toString(36).toUpperCase(),
    };
    const list = AhooraStore.get(AhooraStore.KEYS.payments, []);
    list.unshift(payment);
    AhooraStore.set(AhooraStore.KEYS.payments, list);

    // Test mode: simulate redirect page
    if (site.payment?.testMode !== false) {
      return {
        ok: true,
        testMode: true,
        payment,
        redirectUrl: `${AhooraUtils.pathPrefix()}pages/payment.html?authority=${payment.authority}&orderId=${encodeURIComponent(orderId)}`,
      };
    }

    // Production placeholder
    return {
      ok: true,
      testMode: false,
      payment,
      redirectUrl: `https://api.balepay.example/pay/${payment.authority}`,
    };
  }

  function verifyPayment(authority, success = true) {
    const list = AhooraStore.get(AhooraStore.KEYS.payments, []);
    const idx = list.findIndex((p) => p.authority === authority);
    if (idx < 0) return { ok: false, error: "تراکنش یافت نشد" };
    list[idx].status = success ? "paid" : "failed";
    list[idx].verifiedAt = new Date().toISOString();
    AhooraStore.set(AhooraStore.KEYS.payments, list);
    return { ok: true, payment: list[idx] };
  }

  function cancelPayment(authority) {
    return verifyPayment(authority, false);
  }

  return { requestPayment, verifyPayment, cancelPayment };
})();
