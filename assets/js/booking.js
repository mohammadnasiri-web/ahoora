document.addEventListener("DOMContentLoaded", async () => {
  await AhooraLayout.boot({
    seo: {
      title: "ثبت درخواست | اهورا تل",
      description: "ثبت مرحله‌ای درخواست تعویض باتری و خدمات تعمیرات",
    },
  });

  const servicesData = AhooraStore.services.all();
  const services = AhooraStore.services.list();
  const models = servicesData.deviceModels || { iphone: [], other: [] };
  const brands = [
    { id: "iphone", group: "iphone", title: "آیفون", list: models.iphone || [] },
    { id: "samsung", group: "other", title: "سامسونگ", list: (models.other || []).filter((m) => m.startsWith("Samsung")) },
    { id: "xiaomi", group: "other", title: "شیائومی", list: (models.other || []).filter((m) => m.startsWith("Xiaomi")) },
    {
      id: "other",
      group: "other",
      title: "سایر",
      list: (models.other || []).filter((m) => !m.startsWith("Samsung") && !m.startsWith("Xiaomi")),
    },
  ].filter((brand) => brand.list.length);

  const state = { step: 1, brandId: "", model: "", serviceId: "" };
  let selectedSlot = null;
  let mediaDataUrl = null;

  const dateInput = document.getElementById("date");
  const shamsi = bindShamsiDate(dateInput, () => {
    if (state.step === 3) renderSlots();
  });

  function nextOpenDay() {
    const schedule = servicesData.schedule;
    for (let i = 0; i < 14; i += 1) {
      const iso = AhooraUtils.addDaysISO(i);
      if (AhooraUtils.isWorkingDay(iso, schedule)) return iso;
    }
    return AhooraUtils.todayISO();
  }

  shamsi.setISO(nextOpenDay());

  const brandForModel = (model) => brands.find((brand) => brand.list.includes(model));

  const currentBrand = () => brands.find((brand) => brand.id === state.brandId);
  const currentService = () => services.find((svc) => svc.id === state.serviceId);

  function priceFor(svc, model) {
    if (!svc) return 0;
    if (svc.priceByModel?.[model]) return svc.priceByModel[model];
    const key = Object.keys(svc.priceByModel || {}).find((item) => model && model.startsWith(item));
    return key ? svc.priceByModel[key] : svc.basePrice || 0;
  }

  function servicesForBrand() {
    const batteryId = state.brandId === "iphone" ? "svc-battery-iphone" : "svc-battery-other";
    return services
      .filter((svc) => svc.id !== "svc-battery-iphone" && svc.id !== "svc-battery-other" || svc.id === batteryId)
      .slice()
      .sort((a, b) => Number(b.id === batteryId) - Number(a.id === batteryId));
  }

  function syncHidden() {
    document.getElementById("deviceModel").value = state.model;
    document.getElementById("serviceId").value = state.serviceId;
  }

  function paintChoice(root, attr, current) {
    root.querySelectorAll("button").forEach((btn) => {
      btn.classList.toggle("is-on", btn.dataset[attr] === current);
    });
  }

  function renderBrands() {
    const row = document.getElementById("brandRow");
    row.innerHTML = brands
      .map((brand) => `<button type="button" class="ah-book-chip" data-brand="${brand.id}">${brand.title}</button>`)
      .join("");
    paintChoice(row, "brand", state.brandId);
    row.querySelectorAll("button").forEach((btn) => {
      btn.onclick = () => {
        if (state.brandId !== btn.dataset.brand) {
          state.model = "";
          state.serviceId = "";
        }
        state.brandId = btn.dataset.brand;
        renderBrands();
        renderModels();
      };
    });
  }

  function renderModels() {
    const block = document.getElementById("modelBlock");
    const brand = currentBrand();
    block.hidden = !brand;
    if (!brand) return;
    const row = document.getElementById("modelRow");
    row.innerHTML = brand.list
      .map((model) => `<button type="button" class="ah-book-chip" data-model="${model}">${model}</button>`)
      .join("");
    paintChoice(row, "model", state.model);
    row.querySelectorAll("button").forEach((btn) => {
      btn.onclick = () => {
        state.model = btn.dataset.model;
        syncHidden();
        renderModels();
      };
    });
  }

  function renderServices() {
    const row = document.getElementById("serviceRow");
    const list = servicesForBrand();
    if (state.serviceId && !list.some((svc) => svc.id === state.serviceId)) state.serviceId = "";
    row.innerHTML = list
      .map((svc) => {
        const price = AhooraUtils.formatPrice(priceFor(svc, state.model));
        const where = svc.type === "onsite" ? "در محل" : "کارگاه";
        return `<button type="button" class="ah-book-service" data-service="${svc.id}">
          <strong>${svc.title}</strong>
          <small>${where}</small>
          <b>${price}</b>
        </button>`;
      })
      .join("");
    paintChoice(row, "service", state.serviceId);
    row.querySelectorAll("button").forEach((btn) => {
      btn.onclick = () => {
        state.serviceId = btn.dataset.service;
        syncHidden();
        renderServices();
        toggleAddress();
        updatePrice();
      };
    });
    const brand = currentBrand();
    document.getElementById("pickedDevice").textContent = brand ? `${brand.title} · ${state.model}` : state.model;
  }

  function visitFor(svc) {
    if (!svc || svc.type !== "onsite") return 0;
    const fee = svc.visitFee ?? servicesData.visitFee;
    return Number(fee == null ? 1500000 : fee);
  }

  function updatePrice() {
    const svc = currentService();
    const part = priceFor(svc, state.model);
    const visit = visitFor(svc);
    const total = part + visit;
    const box = document.getElementById("priceBox");
    const warranty = document.getElementById("warrantyNote");
    box.dataset.price = total;
    if (warranty) {
      warranty.hidden = svc?.category !== "battery";
      if (svc?.warrantyMonths) warranty.textContent = `گارانتی باتری: ${svc.warrantyMonths} ماه`;
    }
    if (!part) {
      box.textContent = "—";
      return;
    }
    box.innerHTML = visit
      ? `خدمت ${AhooraUtils.formatPrice(part)} · ایاب و ذهاب ${AhooraUtils.formatPrice(visit)} · جمع ${AhooraUtils.formatPrice(total)}`
      : AhooraUtils.formatPrice(part);
  }

  function toggleAddress() {
    const svc = currentService();
    const need = !!(svc?.requiresAddress || svc?.type === "onsite");
    document.getElementById("addressFields").hidden = !need;
    document.getElementById("workshopNote").hidden = need || !svc;
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
    document.getElementById("capInfo").textContent = `ظرفیت این روز: ${dayUsed} از ${svc.dailyCapacity}`;
    wrap.innerHTML = (schedule.slots || [])
      .map((slot) => {
        const ok = AhooraStore.capacity.canBook(svc.id, date, slot);
        return `<button type="button" class="ah-slot ${ok ? "" : "disabled"}" data-slot="${slot}" ${ok ? "" : "disabled"}>${slot}</button>`;
      })
      .join("");
    wrap.querySelectorAll(".ah-slot:not(.disabled)").forEach((btn) => {
      btn.onclick = () => {
        wrap.querySelectorAll(".ah-slot").forEach((item) => item.classList.remove("active"));
        btn.classList.add("active");
        selectedSlot = btn.dataset.slot;
        document.getElementById("slot").value = selectedSlot;
      };
    });
  }

  function showStep(next) {
    state.step = next;
    document.querySelectorAll("[data-step]").forEach((section) => {
      section.hidden = Number(section.dataset.step) !== next;
    });
    document.getElementById("bookBack").hidden = next === 1;
    document.getElementById("bookNext").hidden = next === 3;
    document.getElementById("bookSubmit").hidden = next !== 3;
    document.querySelectorAll("#bookProgress li").forEach((item, index) => {
      item.classList.toggle("is-on", index + 1 === next);
      item.classList.toggle("is-done", index + 1 < next);
    });
    if (next === 2) renderServices();
    if (next === 3) {
      const svc = currentService();
      const brand = currentBrand();
      document.getElementById("pickedJob").textContent = [brand?.title, state.model, svc?.title].filter(Boolean).join(" · ");
      toggleAddress();
      updatePrice();
      renderSlots();
    }
    syncHidden();
  }

  document.getElementById("bookProgress").onclick = (event) => {
    const btn = event.target.closest("[data-goto]");
    if (!btn) return;
    const target = Number(btn.dataset.goto);
    if (target < state.step) showStep(target);
  };

  document.getElementById("bookBack").onclick = () => {
    if (state.step > 1) showStep(state.step - 1);
  };

  document.getElementById("bookNext").onclick = () => {
    if (state.step === 1) {
      if (!state.brandId || !state.model) {
        AhooraUtils.toast("اول برند و مدل گوشی را انتخاب کنید", "error");
        return;
      }
      showStep(2);
      return;
    }
    if (state.step === 2) {
      if (!state.serviceId) {
        AhooraUtils.toast("نوع خدمات را انتخاب کنید", "error");
        return;
      }
      showStep(3);
    }
  };

  dateInput.addEventListener("change", () => {
    if (state.step === 3) renderSlots();
  });

  document.getElementById("media").onchange = (event) => {
    const file = event.target.files?.[0];
    if (!file) {
      mediaDataUrl = null;
      return;
    }
    if (file.size > 3 * 1024 * 1024) {
      AhooraUtils.toast("حداکثر حجم فایل ۳ مگابایت است", "error");
      event.target.value = "";
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      mediaDataUrl = reader.result;
    };
    reader.readAsDataURL(file);
  };

  const preModel = AhooraUtils.qs("model");
  const matchedBrand = preModel ? brandForModel(preModel) : null;
  const preGroup = AhooraUtils.qs("group");
  if (matchedBrand) state.brandId = matchedBrand.id;
  else if (preGroup === "iphone") state.brandId = "iphone";
  if (matchedBrand) state.model = preModel;
  const preService = AhooraUtils.qs("service");
  if (preService && services.some((svc) => svc.id === preService)) state.serviceId = preService;

  renderBrands();
  renderModels();
  syncHidden();
  showStep(state.model ? 2 : 1);

  document.getElementById("bookingForm").onsubmit = async (event) => {
    event.preventDefault();
    if (state.step !== 3) return;
    const svc = currentService();
    const fd = new FormData(event.target);
    const phone = String(fd.get("phone") || "").trim();
    const date = fd.get("date");
    const slot = fd.get("slot");
    const needAddress = !!(svc?.requiresAddress || svc?.type === "onsite");

    if (!svc || !state.model) return AhooraUtils.toast("گوشی و نوع خدمات را کامل کنید", "error");
    if (!AhooraUtils.validatePhone(phone)) return AhooraUtils.toast("شماره موبایل معتبر نیست", "error");
    if (!String(fd.get("name") || "").trim()) return AhooraUtils.toast("نام را بنویسید", "error");
    if (!slot) return AhooraUtils.toast("ساعت را انتخاب کنید", "error");
    if (needAddress && (!String(fd.get("street") || "").trim() || !String(fd.get("plaque") || "").trim())) {
      return AhooraUtils.toast("نشانی و پلاک را بنویسید", "error");
    }
    if (!AhooraStore.capacity.canBook(svc.id, date, slot)) {
      return AhooraUtils.toast("این بازه تکمیل ظرفیت است", "error");
    }

    let amount = Number(document.getElementById("priceBox").dataset.price || svc.basePrice);
    const couponCode = String(fd.get("coupon") || "").trim();
    let discount = 0;
    if (couponCode) {
      const coupons = AhooraStore.content.get().coupons || [];
      const coupon = coupons.find((item) => item.active && item.code.toUpperCase() === couponCode.toUpperCase());
      if (coupon && (coupon.appliesTo === "all" || coupon.appliesTo === "services")) {
        discount = coupon.type === "percent" ? Math.round((amount * coupon.value) / 100) : coupon.value;
        amount = Math.max(0, amount - discount);
      }
    }

    const reserved = AhooraStore.capacity.reserve(svc.id, date, slot);
    if (!reserved) return AhooraUtils.toast("ظرفیت همزمان پر شد؛ زمان دیگری انتخاب کنید", "error");

    const booking = {
      id: AhooraStore.uid("bk"),
      trackingCode: AhooraStore.trackingCode(),
      serviceId: svc.id,
      serviceTitle: svc.title,
      serviceType: svc.type,
      deviceModel: state.model,
      date,
      slot,
      name: fd.get("name"),
      phone,
      address: needAddress
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
    try {
      localStorage.setItem("ah_admin_ping", String(Date.now()));
    } catch {
      /* ignore */
    }

    const result = document.getElementById("bookingResult");
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
    event.target.reset();
    state.brandId = "";
    state.model = "";
    state.serviceId = "";
    selectedSlot = null;
    mediaDataUrl = null;
    shamsi.setISO(nextOpenDay());
    renderBrands();
    renderModels();
    showStep(1);
    AhooraUtils.toast("درخواست ثبت شد · منتظر تأیید مدیریت");
  };

  function bindShamsiDate(input, onChange) {
    const toggle = document.getElementById("shamsiToggle");
    const label = document.getElementById("shamsiLabel");
    const pop = document.getElementById("shamsiPop");
    const title = document.getElementById("shamsiTitle");
    const grid = document.getElementById("shamsiGrid");
    const minISO = AhooraUtils.todayISO();
    let view = AhooraUtils.toJalali(minISO);

    const isoOf = (jy, jm, jd) => AhooraUtils.fromJalali(jy, jm, jd);
    const selected = () => input.value;

    function paintLabel() {
      label.textContent = input.value ? AhooraUtils.formatJalali(input.value) : "انتخاب تاریخ";
    }

    function shiftMonth(delta) {
      let jm = view.jm + delta;
      let jy = view.jy;
      if (jm < 1) {
        jm = 12;
        jy -= 1;
      }
      if (jm > 12) {
        jm = 1;
        jy += 1;
      }
      view = { jy, jm, jd: 1 };
      render();
    }

    function render() {
      title.textContent = `${AhooraUtils.jalaliMonthName(view.jm)} ${AhooraUtils.toFaDigits(view.jy)}`;
      const count = AhooraUtils.jalaliMonthLength(view.jy, view.jm);
      const firstIso = isoOf(view.jy, view.jm, 1);
      const first = new Date(`${firstIso}T12:00:00`);
      const lead = (first.getDay() + 1) % 7;
      const cells = [];
      for (let i = 0; i < lead; i += 1) cells.push("<span></span>");
      for (let day = 1; day <= count; day += 1) {
        const iso = isoOf(view.jy, view.jm, day);
        const closed = !AhooraUtils.isWorkingDay(iso, servicesData.schedule);
        const past = iso < minISO;
        const on = iso === selected();
        cells.push(
          `<button type="button" data-iso="${iso}" class="${on ? "is-on" : ""}" ${past || closed ? "disabled" : ""}>${AhooraUtils.toFaDigits(day)}</button>`
        );
      }
      grid.innerHTML = cells.join("");
    }

    function open(show) {
      pop.hidden = !show;
      toggle.setAttribute("aria-expanded", show ? "true" : "false");
      if (show) {
        const current = AhooraUtils.toJalali(selected() || minISO);
        view = { jy: current.jy, jm: current.jm, jd: 1 };
        render();
      }
    }

    function setISO(iso) {
      input.value = iso;
      paintLabel();
      if (!pop.hidden) render();
      input.dispatchEvent(new Event("change"));
      if (onChange) onChange();
    }

    toggle.addEventListener("click", () => open(pop.hidden));
    document.getElementById("shamsiPrev").addEventListener("click", () => shiftMonth(-1));
    document.getElementById("shamsiNext").addEventListener("click", () => shiftMonth(1));
    grid.addEventListener("click", (event) => {
      const btn = event.target.closest("[data-iso]");
      if (!btn || btn.disabled) return;
      setISO(btn.dataset.iso);
      open(false);
    });
    document.addEventListener("click", (event) => {
      if (!document.getElementById("shamsiDate").contains(event.target)) open(false);
    });

    paintLabel();
    return { setISO };
  }

  AhooraUtils.injectSchema({
    "@context": "https://schema.org",
    "@type": "ReserveAction",
    name: "رزرو خدمات اهورا تل",
    target: { "@type": "EntryPoint", urlTemplate: window.location.href },
  });
});
