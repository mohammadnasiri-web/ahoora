document.addEventListener("DOMContentLoaded", async () => {
  await AhooraLayout.boot({ seo: { title: "پرداخت | اهورا تل" }, skipSchema: true });
  const authority = AhooraUtils.qs("authority");
  const orderId = AhooraUtils.qs("orderId");
  const type = AhooraUtils.qs("type") || "shop";
  const root = document.getElementById("payRoot");

  const payments = AhooraStore.get(AhooraStore.KEYS.payments, []);
  const payment = payments.find((p) => p.authority === authority);

  if (!payment) {
    root.innerHTML = `<div class="ah-alert ah-alert-error">تراکنش یافت نشد.</div>`;
    return;
  }

  const target =
    type === "booking"
      ? AhooraStore.bookings.list().find((b) => b.id === orderId)
      : AhooraStore.orders.list().find((o) => o.id === orderId);

  if (!target) {
    root.innerHTML = `<div class="ah-alert ah-alert-error">سفارش/رزرو مرتبط یافت نشد.</div>`;
    return;
  }

  if (target.status === "pending_approval") {
    root.innerHTML = `<div class="ah-alert ah-alert-error">این درخواست هنوز توسط مدیریت تأیید نشده است.</div>
      <a class="ah-btn ah-btn-primary mt-3" href="account.html">بازگشت به حساب کاربری</a>`;
    return;
  }

  if (target.status === "rejected") {
    root.innerHTML = `<div class="ah-alert ah-alert-error">این درخواست توسط مدیریت رد شده و قابل پرداخت نیست.</div>`;
    return;
  }

  if (target.status !== "awaiting_payment" && target.paymentStatus === "paid") {
    root.innerHTML = `<div class="ah-alert ah-alert-success">این مورد قبلاً پرداخت شده است.</div>`;
    return;
  }

  root.innerHTML = `
    <div class="ah-form-card text-center">
      <h1 class="h4 mb-3">درگاه پرداخت آزمایشی (بله‌پی)</h1>
      <p class="text-secondary mb-1">کد پیگیری درگاه: <span dir="ltr">${payment.authority}</span></p>
      <p class="fs-5 fw-bold mb-4">${AhooraUtils.formatPrice(payment.amount)}</p>
      <div class="d-flex gap-2 justify-content-center flex-wrap">
        <button class="ah-btn ah-btn-primary" id="okBtn">پرداخت موفق</button>
        <button class="ah-btn ah-btn-dark" id="failBtn">پرداخت ناموفق</button>
        <button class="ah-btn ah-btn-ghost" id="cancelBtn">انصراف</button>
      </div>
    </div>`;

  async function finish(success, cancelled = false) {
    if (cancelled) AhooraPayment.cancelPayment(authority);
    else AhooraPayment.verifyPayment(authority, success);

    if (type === "shop") {
      const order = AhooraStore.orders.list().find((o) => o.id === orderId);
      if (order) {
        if (success) {
          for (const item of order.items) {
            AhooraStore.products.decreaseStock(item.productId, item.qty, item.variantId);
          }
          if (order.couponCode) {
            const content = AhooraStore.content.get();
            const c = content.coupons.find((x) => x.code === order.couponCode);
            if (c) {
              c.usedCount += 1;
              AhooraStore.content.save(content);
            }
          }
          AhooraStore.orders.update(order.id, { paymentStatus: "paid", status: "processing" });
          AhooraSMS.notifyPaymentOk(order.phone, order.code);
          AhooraStore.cart.clear();
          root.innerHTML = `<div class="ah-alert ah-alert-success">پرداخت موفق. کد پیگیری سفارش: <strong>${order.code}</strong></div>
            <a class="ah-btn ah-btn-primary mt-3" href="account.html">پیگیری در حساب کاربری</a>`;
        } else {
          AhooraStore.orders.update(order.id, {
            paymentStatus: cancelled ? "cancelled" : "failed",
            status: cancelled ? "cancelled" : "payment_failed",
          });
          root.innerHTML = `<div class="ah-alert ah-alert-error">پرداخت ${cancelled ? "لغو" : "ناموفق"} شد.</div>
            <a class="ah-btn ah-btn-primary mt-3" href="cart.html">بازگشت به سبد</a>`;
        }
      }
    } else {
      const booking = AhooraStore.bookings.list().find((b) => b.id === orderId);
      if (booking) {
        if (success) {
          AhooraStore.bookings.update(booking.id, { paymentStatus: "paid", status: "confirmed" });
          AhooraSMS.notifyPaymentOk(booking.phone, booking.trackingCode);
          root.innerHTML = `<div class="ah-alert ah-alert-success">رزرو تأیید شد. کد پیگیری: <strong>${booking.trackingCode}</strong>
            <br>${booking.serviceTitle} · ${booking.date} · ${booking.slot}</div>
            <a class="ah-btn ah-btn-primary mt-3" href="account.html">مشاهده در حساب کاربری</a>`;
        } else {
          AhooraStore.capacity.release(booking.serviceId, booking.date, booking.slot);
          AhooraStore.bookings.update(booking.id, {
            paymentStatus: cancelled ? "cancelled" : "failed",
            status: "cancelled",
          });
          root.innerHTML = `<div class="ah-alert ah-alert-error">پرداخت انجام نشد و ظرفیت آزاد شد.</div>
            <a class="ah-btn ah-btn-primary mt-3" href="booking.html">تلاش مجدد</a>`;
        }
      }
    }
  }

  document.getElementById("okBtn").onclick = () => finish(true);
  document.getElementById("failBtn").onclick = () => finish(false);
  document.getElementById("cancelBtn").onclick = () => finish(false, true);
});
