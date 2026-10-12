document.addEventListener("DOMContentLoaded", async () => {
  await AhooraLayout.boot({
    seo: {
      title: "رزرو نوبت | اهورا تل",
      description: "رزرو آنلاین تعویض باتری و خدمات تعمیرات",
    },
  });

  const servicesData = AhooraStore.services.all();
  const services = AhooraStore.services.list();
  const serviceSel = document.getElementById("serviceId");
  const preselect = AhooraUtils.qs("service");

  serviceSel.innerHTML = services
    .map(
      (s) =>
        `<option value="${s.id}" ${preselect === s.id ? "selected" : ""}>${s.title} (${s.type === "onsite" ? "در محل" : "غیرحضوری"})</option>`
    )
    .join("");

  const dateInput = document.getElementById("date");
  dateInput.min = AhooraUtils.todayISO();
  dateInput.value = AhooraUtils.todayISO();

  let selectedSlot = null;
  let mediaDataUrl = null;

  function currentService() {
    return AhooraStore.services.byId(serviceSel.value);
  }

  function fillModels() {
    const group = document.getElementById("modelGroup").value;
    const models = servicesData.deviceModels?.[group] || [];
    document.getElementById("deviceModel").innerHTML = models.map((m) => `<option value="${m}">${m}</option>`).join("");
    updatePrice();
  }

  function updatePrice() {
    const svc = currentService();
    const model = document.getElementById("deviceModel").value;
    let price = svc?.basePrice || 0;
    if (svc?.priceByModel?.[model]) price = svc.priceByModel[model];
    // fuzzy match for variants like iPhone 13 Pro -> iPhone 13
    if (!svc?.priceByModel?.[model] && svc?.priceByModel) {
      const key = Object.keys(svc.priceByModel).find((k) => model.startsWith(k));
      if (key) price = svc.priceByModel[key];
    }
    document.getElementById("priceBox").textContent = AhooraUtils.formatPrice(price);
    document.getElementById("priceBox").dataset.price = price;
  }

  function toggleAddress() {
    const svc = currentService();
    const box = document.getElementById("addressFields");
    const need = !!(svc?.requiresAddress || svc?.type === "onsite");
    box.hidden = !need;
    document.getElementById("street").required = need;
    document.getElementById("plaque").required = need;
  }

  function renderSlots() {
    const svc = currentService();
    const date = dateInput.value;
    const schedule = servicesData.schedule;
    const wrap = document.getElementById("slots");
    selectedSlot = null;
    document.getElementById("slot").value = "";

    if (!svc) return;
    if (!AhooraUtils.isWorkingDay(date, schedule)) {
      wrap.innerHTML = `<p class="text-danger small">این روز تعطیل یا خارج از ساعات کاری است.</p>`;
      document.getElementById("capInfo").textContent = "";
      return;
    }

    const dayUsed = AhooraStore.capacity.getUsed(svc.id, date);
    document.getElementById("capInfo").textContent = `ظرفیت روزانه این خدمت: ${dayUsed} / ${svc.dailyCapacity}`;

    wrap.innerHTML = (schedule.slots || [])
      .map((slot) => {
        const ok = AhooraStore.capacity.canBook(svc.id, date, slot);
        return `<button type="button" class="ah-slot ${ok ? "" : "disabled"}" data-slot="${slot}" ${ok ? "" : "disabled"}>${slot}</button>`;
      })
      .join("");

    wrap.querySelectorAll(".ah-slot:not(.disabled)").forEach((btn) => {
      btn.onclick = () => {
        wrap.querySelectorAll(".ah-slot").forEach((b) => b.classList.remove("active"));
        btn.classList.add("active");
        selectedSlot = btn.dataset.slot;
        document.getElementById("slot").value = selectedSlot;
      };
    });
  }

  document.getElementById("modelGroup").onchange = fillModels;
  document.getElementById("deviceModel").onchange = updatePrice;
  serviceSel.onchange = () => {
    toggleAddress();
    updatePrice();
    renderSlots();
  };
  dateInput.onchange = renderSlots;

  document.getElementById("media").onchange = (e) => {
    const file = e.target.files?.[0];
    if (!file) {
      mediaDataUrl = null;
      return;
    }
    if (file.size > 3 * 1024 * 1024) {
      AhooraUtils.toast("حداکثر حجم فایل ۳ مگابایت (نسخه دمو)", "error");
      e.target.value = "";
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      mediaDataUrl = reader.result;
    };
    reader.readAsDataURL(file);
  };

  fillModels();
  toggleAddress();
  updatePrice();
  renderSlots();

  document.getElementById("bookingForm").onsubmit = async (e) => {
    e.preventDefault();
    const svc = currentService();
    const fd = new FormData(e.target);
    const phone = String(fd.get("phone")).trim();
    const date = fd.get("date");
    const slot = fd.get("slot");

    if (!AhooraUtils.validatePhone(phone)) return AhooraUtils.toast("شماره موبایل معتبر نیست", "error");
    if (!slot) return AhooraUtils.toast("ساعت را انتخاب کنید", "error");
    if (!AhooraStore.capacity.canBook(svc.id, date, slot)) {
      return AhooraUtils.toast("این بازه تکمیل ظرفیت است", "error");
    }

    let amount = Number(document.getElementById("priceBox").dataset.price || svc.basePrice);
    const couponCode = String(fd.get("coupon") || "").trim();
    let discount = 0;
    if (couponCode) {
      const coupons = AhooraStore.content.get().coupons || [];
      const c = coupons.find((x) => x.active && x.code.toUpperCase() === couponCode.toUpperCase());
      if (c && (c.appliesTo === "all" || c.appliesTo === "services")) {
        discount = c.type === "percent" ? Math.round((amount * c.value) / 100) : c.value;
        amount = Math.max(0, amount - discount);
      }
    }

    // Atomic-ish reserve (single-threaded JS + localStorage)
    const reserved = AhooraStore.capacity.reserve(svc.id, date, slot);
    if (!reserved) return AhooraUtils.toast("ظرفیت همزمان پر شد؛ زمان دیگری انتخاب کنید", "error");

    const booking = {
      id: AhooraStore.uid("bk"),
      trackingCode: AhooraStore.trackingCode(),
      serviceId: svc.id,
      serviceTitle: svc.title,
      serviceType: svc.type,
      deviceModel: fd.get("deviceModel"),
      date,
      slot,
      name: fd.get("name"),
      phone,
      address:
        svc.type === "onsite"
          ? {
              street: fd.get("street"),
              plaque: fd.get("plaque"),
              unit: fd.get("unit"),
              postal: fd.get("postal"),
            }
          : null,
      notes: fd.get("notes"),
      media: mediaDataUrl,
      amount,
      discount,
      couponCode,
      paymentStatus: "awaiting_approval",
      status: "pending_approval",
      createdAt: new Date().toISOString(),
    };

    AhooraStore.bookings.add(booking);
    AhooraSMS.notifyOrderCreated({ phone, code: booking.trackingCode });

    // Notify same-browser admin tab (if open)
    try {
      localStorage.setItem("ah_admin_ping", String(Date.now()));
    } catch {
      /* ignore */
    }

    const result = document.getElementById("bookingResult");
    if (result) {
      result.innerHTML = `
        <div class="ah-alert ah-alert-success">
          <strong>درخواست شما ثبت شد.</strong><br>
          کد پیگیری: <strong>${booking.trackingCode}</strong><br>
          وضعیت: در انتظار تأیید مدیریت سایت<br>
          پس از تأیید، پیامک می‌گیرید و می‌توانید پرداخت کنید.
        </div>
        <div class="d-flex gap-2 flex-wrap mt-3">
          <a class="ah-btn ah-btn-primary" href="account.html">پیگیری در حساب کاربری</a>
          <a class="ah-btn ah-btn-dark" href="services.html">بازگشت به خدمات</a>
        </div>`;
      result.scrollIntoView({ behavior: "smooth", block: "start" });
    }
    e.target.reset();
    selectedSlot = null;
    document.getElementById("slot").value = "";
    renderSlots();
    AhooraUtils.toast("درخواست ثبت شد · منتظر تأیید مدیریت");
  };

  AhooraUtils.injectSchema({
    "@context": "https://schema.org",
    "@type": "ReserveAction",
    name: "رزرو خدمات اهورا تل",
    target: { "@type": "EntryPoint", urlTemplate: window.location.href },
  });
});
