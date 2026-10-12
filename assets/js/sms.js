/**
 * SMS provider stub — wire to real panel (Kavenegar / Melipayamak / etc.)
 */
const AhooraSMS = (() => {
  function send({ to, template, vars = {}, type = "customer" }) {
    const site = AhooraStore.site.get();
    const tpl = site.sms?.templates?.[template] || template;
    let body = tpl;
    Object.entries(vars).forEach(([k, v]) => {
      body = body.replace(new RegExp(`\\{${k}\\}`, "g"), v);
    });

    const entry = {
      id: AhooraStore.uid("sms"),
      to,
      body,
      type,
      template,
      status: "queued",
      provider: site.sms?.provider || "stub",
      createdAt: new Date().toISOString(),
    };

    // Stub: mark as sent
    entry.status = "sent";
    entry.sentAt = new Date().toISOString();

    const log = AhooraStore.get(AhooraStore.KEYS.smsLog, []);
    log.unshift(entry);
    AhooraStore.set(AhooraStore.KEYS.smsLog, log);

    console.info("[SMS stub]", entry);
    return entry;
  }

  const FALLBACK = {
    orderCreated: "درخواست {code} ثبت شد و منتظر تأیید مدیریت است. اهورا تل",
    adminNewRequest: "درخواست جدید {code} — لطفاً در پنل تأیید یا رد کنید.",
    requestApproved: "درخواست {code} تأیید شد. می‌توانید پرداخت را انجام دهید. اهورا تل",
    requestRejected: "متأسفانه درخواست {code} رد شد. {reason} اهورا تل",
    paymentOk: "پرداخت سفارش {code} تأیید شد.",
    serviceDone: "خدمت شما با کد {code} تکمیل شد.",
  };

  function notifyOrderCreated(orderOrBooking) {
    const site = AhooraStore.site.get();
    const code = orderOrBooking.code || orderOrBooking.trackingCode;
    if (site.sms?.notifyAdminOnOrder && site.sms?.adminPhone) {
      send({
        to: site.sms.adminPhone,
        template: site.sms?.templates?.adminNewRequest || FALLBACK.adminNewRequest,
        vars: { code },
        type: "admin",
      });
    }
    if (orderOrBooking.phone) {
      send({
        to: orderOrBooking.phone,
        template: site.sms?.templates?.orderCreated || FALLBACK.orderCreated,
        vars: { code },
        type: "customer",
      });
    }
  }

  function notifyApproved(phone, code) {
    const site = AhooraStore.site.get();
    send({
      to: phone,
      template: site.sms?.templates?.requestApproved || FALLBACK.requestApproved,
      vars: { code },
      type: "customer",
    });
  }

  function notifyRejected(phone, code, reason = "") {
    const site = AhooraStore.site.get();
    send({
      to: phone,
      template: site.sms?.templates?.requestRejected || FALLBACK.requestRejected,
      vars: { code, reason: reason || "" },
      type: "customer",
    });
  }

  function notifyPaymentOk(phone, code) {
    const site = AhooraStore.site.get();
    send({
      to: phone,
      template: site.sms?.templates?.paymentOk || FALLBACK.paymentOk,
      vars: { code },
      type: "customer",
    });
  }

  function notifyServiceDone(phone, code) {
    const site = AhooraStore.site.get();
    send({
      to: phone,
      template: site.sms?.templates?.serviceDone || FALLBACK.serviceDone,
      vars: { code },
      type: "customer",
    });
  }

  return {
    send,
    notifyOrderCreated,
    notifyApproved,
    notifyRejected,
    notifyPaymentOk,
    notifyServiceDone,
  };
})();
