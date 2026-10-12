/**
 * Order/booking approval workflow
 * User submits → pending_approval → Admin approve/reject → payment (if approved)
 */
const AhooraWorkflow = (() => {
  const STATUS_FA = {
    pending_approval: "در انتظار تأیید مدیریت",
    awaiting_payment: "تأیید شد · منتظر پرداخت",
    confirmed: "تأیید نهایی",
    processing: "در حال آماده‌سازی",
    preparing: "آماده‌سازی",
    shipped: "ارسال شده",
    in_progress: "در حال انجام",
    completed: "تکمیل شده",
    cancelled: "لغو شده",
    rejected: "رد شده توسط مدیریت",
    payment_failed: "پرداخت ناموفق",
  };

  function statusFa(status) {
    return STATUS_FA[status] || status || "—";
  }

  function pendingBookings() {
    return AhooraStore.bookings.list().filter((b) => b.status === "pending_approval");
  }

  function pendingOrders() {
    return AhooraStore.orders.list().filter((o) => o.status === "pending_approval");
  }

  function pendingCount() {
    return pendingBookings().length + pendingOrders().length;
  }

  function pendingAll() {
    const books = pendingBookings().map((b) => ({
      kind: "booking",
      id: b.id,
      code: b.trackingCode,
      title: b.serviceTitle,
      meta: `${b.deviceModel || ""} · ${b.date} ${b.slot}`,
      name: b.name,
      phone: b.phone,
      amount: b.amount,
      createdAt: b.createdAt,
    }));
    const ords = pendingOrders().map((o) => ({
      kind: "order",
      id: o.id,
      code: o.code,
      title: "سفارش فروشگاهی",
      meta: `${(o.items || []).length} قلم`,
      name: o.name,
      phone: o.phone,
      amount: o.amount,
      createdAt: o.createdAt,
    }));
    return [...books, ...ords].sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt)));
  }

  function approve(kind, id) {
    if (kind === "booking") {
      const b = AhooraStore.bookings.update(id, {
        status: "awaiting_payment",
        adminDecision: "approved",
        approvedAt: new Date().toISOString(),
      });
      if (b) {
        AhooraSMS.notifyApproved(b.phone, b.trackingCode);
        AhooraUtils.toast(`رزرو ${b.trackingCode} تأیید شد`);
      }
      return b;
    }
    const o = AhooraStore.orders.update(id, {
      status: "awaiting_payment",
      adminDecision: "approved",
      approvedAt: new Date().toISOString(),
    });
    if (o) {
      AhooraSMS.notifyApproved(o.phone, o.code);
      AhooraUtils.toast(`سفارش ${o.code} تأیید شد`);
    }
    return o;
  }

  function reject(kind, id, reason = "") {
    if (kind === "booking") {
      const prev = AhooraStore.bookings.list().find((x) => x.id === id);
      const b = AhooraStore.bookings.update(id, {
        status: "rejected",
        adminDecision: "rejected",
        rejectReason: reason,
        rejectedAt: new Date().toISOString(),
        paymentStatus: "cancelled",
      });
      // capacity released inside store when status becomes rejected
      if (b) {
        AhooraSMS.notifyRejected(b.phone, b.trackingCode, reason);
        AhooraUtils.toast(`رزرو ${b.trackingCode} رد شد`, "error");
      }
      return b || prev;
    }
    const o = AhooraStore.orders.update(id, {
      status: "rejected",
      adminDecision: "rejected",
      rejectReason: reason,
      rejectedAt: new Date().toISOString(),
      paymentStatus: "cancelled",
    });
    if (o) {
      AhooraSMS.notifyRejected(o.phone, o.code, reason);
      AhooraUtils.toast(`سفارش ${o.code} رد شد`, "error");
    }
    return o;
  }

  function canPay(item) {
    return item && item.status === "awaiting_payment" && item.paymentStatus !== "paid";
  }

  function playAlert() {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.connect(g);
      g.connect(ctx.destination);
      o.frequency.value = 880;
      g.gain.value = 0.04;
      o.start();
      setTimeout(() => {
        o.stop();
        ctx.close();
      }, 180);
    } catch {
      /* ignore */
    }
  }

  return {
    STATUS_FA,
    statusFa,
    pendingBookings,
    pendingOrders,
    pendingCount,
    pendingAll,
    approve,
    reject,
    canPay,
    playAlert,
  };
})();
