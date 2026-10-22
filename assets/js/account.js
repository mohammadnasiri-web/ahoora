document.addEventListener("DOMContentLoaded", async () => {
  await AhooraLayout.boot({ seo: { title: "حساب کاربری | اهورا تل" } });
  const root = document.getElementById("accountRoot");

  async function startPayment(type, id, amount, code) {
    const pay = await AhooraPayment.requestPayment({
      amount,
      orderId: id,
      description: `پرداخت ${code}`,
      callbackUrl: "pages/payment.html",
    });
    window.location.href = pay.redirectUrl + `&type=${type}`;
  }

  let authStep = "contact";
  let authContact = "";

  const contactKind = (value) => {
    const v = String(value || "").trim();
    if (/^09\d{9}$/.test(v)) return "phone";
    if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) return "email";
    return "";
  };

  function renderAuth() {
    const site = AhooraStore.site.get().site || {};
    const logo = AhooraLayout.resolveUrl(site.logo || "assets/img/logo-ahura-tell.png");
    const kind = contactKind(authContact);
    const titles = {
      contact: ["ورود یا ثبت‌نام در اهورا تل", "لطفا شماره موبایل یا ایمیل خود را وارد کنید"],
      password: ["رمز عبور را وارد کنید", `ادامه برای ${authContact}`],
      register: ["ساخت حساب کاربری", "این مورد هنوز ثبت نشده. چند فیلد کوتاه کافی است."],
      track: ["پیگیری سفارش", "کد پیگیری سفارش یا رزرو را وارد کنید"],
    };
    const [title, lead] = titles[authStep];
    const field =
      authStep === "contact"
        ? `<label class="visually-hidden" for="authContact">شماره موبایل یا پست الکترونیک</label>
           <div class="ah-auth-field">
             <input id="authContact" name="contact" inputmode="email" autocomplete="username" placeholder="شماره موبایل یا پست الکترونیک" value="${authContact}">
           </div>`
        : authStep === "password"
          ? `<label class="visually-hidden" for="authPass">رمز عبور</label>
             <div class="ah-auth-field">
               <input id="authPass" name="password" type="password" data-eye="1" autocomplete="current-password" placeholder="رمز عبور" required>
               <button type="button" class="ah-auth-eye" aria-label="نمایش رمز"><i class="bi bi-eye"></i></button>
             </div>`
          : authStep === "register"
            ? `<label class="visually-hidden" for="authName">نام</label>
               <div class="ah-auth-field"><input id="authName" name="name" autocomplete="name" placeholder="نام و نام خانوادگی" required></div>
               ${
                 kind === "email"
                   ? `<div class="ah-auth-field" style="margin-top:0.65rem"><input name="phone" dir="ltr" inputmode="numeric" autocomplete="tel" placeholder="شماره موبایل" required></div>`
                   : `<div class="ah-auth-field" style="margin-top:0.65rem"><input name="email" dir="ltr" inputmode="email" autocomplete="email" placeholder="ایمیل (اختیاری)"></div>`
               }
               <div class="ah-auth-field" style="margin-top:0.65rem">
                 <input name="password" type="password" data-eye="1" autocomplete="new-password" minlength="6" placeholder="رمز عبور" required>
                 <button type="button" class="ah-auth-eye" aria-label="نمایش رمز"><i class="bi bi-eye"></i></button>
               </div>`
            : `<label class="visually-hidden" for="authCode">کد پیگیری</label>
               <div class="ah-auth-field">
                 <input id="authCode" name="code" autocomplete="off" placeholder="کد پیگیری" required>
               </div>
               <div id="trackResult" class="ah-auth-result"></div>`;

    const submitLabel =
      authStep === "contact" ? "ورود به اهورا تل" : authStep === "register" ? "ثبت‌نام و ورود" : authStep === "track" ? "بررسی کد" : "ورود";

    root.innerHTML = `
      <section class="ah-auth">
        <button type="button" class="ah-auth-back" id="authBack" aria-label="بازگشت"><i class="bi bi-arrow-right"></i></button>
        <div class="ah-auth-panel">
          <img class="ah-auth-logo" src="${logo}" alt="${site.name || "اهورا تل"}">
          <h1>${title}</h1>
          <p class="ah-auth-lead">${lead}</p>
          <form id="authForm">
            ${field}
            <p class="ah-auth-error" id="authError" role="alert"></p>
            <button class="ah-auth-submit" type="submit">${submitLabel}</button>
          </form>
          ${
            authStep === "contact"
              ? `<p class="ah-auth-legal">ورود شما به معنای پذیرش <a href="terms.html">شرایط اهورا تل</a> و <a href="privacy.html">قوانین حریم‌خصوصی</a> است</p>
                 <div class="ah-auth-perks">
                   <span><i class="bi bi-geo-alt"></i>تعمیر در محل</span>
                   <span><i class="bi bi-patch-check"></i>قطعات اصل</span>
                   <span><i class="bi bi-shield-lock"></i>پرداخت امن</span>
                 </div>
                 <button type="button" class="ah-auth-alt" id="authTrack">پیگیری سفارش با کد</button>`
              : `<button type="button" class="ah-auth-alt" id="authChange">تغییر شماره یا ایمیل</button>`
          }
        </div>
      </section>`;

    const showError = (text) => {
      const box = document.getElementById("authError");
      if (box) box.textContent = text || "";
      root.querySelector(".ah-auth-field input")?.classList.toggle("is-invalid", Boolean(text));
    };

    document.getElementById("authBack").onclick = () => {
      if (authStep === "contact") {
        if (history.length > 1) history.back();
        else location.href = "../index.html";
        return;
      }
      authStep = "contact";
      renderAuth();
    };
    document.getElementById("authChange")?.addEventListener("click", () => {
      authStep = "contact";
      renderAuth();
    });
    document.getElementById("authTrack")?.addEventListener("click", () => {
      authStep = "track";
      renderAuth();
    });
    root.querySelectorAll(".ah-auth-eye").forEach((btn) => {
      btn.addEventListener("click", () => {
        const input = btn.parentElement.querySelector("input");
        const open = input.type === "password";
        input.type = open ? "text" : "password";
        btn.innerHTML = `<i class="bi ${open ? "bi-eye-slash" : "bi-eye"}"></i>`;
      });
    });

    document.getElementById("authForm").onsubmit = (e) => {
      e.preventDefault();
      const fd = new FormData(e.target);
      if (authStep === "contact") {
        const value = String(fd.get("contact") || "").trim();
        if (!contactKind(value)) {
          showError("شماره را با ۰۹ یا یک ایمیل معتبر وارد کنید");
          return;
        }
        authContact = value;
        authStep = AhooraStore.auth.findByContact(value) ? "password" : "register";
        renderAuth();
        return;
      }
      if (authStep === "password") {
        const user = AhooraStore.auth.login(authContact, fd.get("password"));
        if (!user) {
          showError("رمز عبور درست نیست");
          return;
        }
        AhooraUtils.toast("ورود موفق");
        render();
        return;
      }
      if (authStep === "register") {
        const enteredKind = contactKind(authContact);
        const phone = enteredKind === "phone" ? authContact : String(fd.get("phone") || "").trim();
        const email = enteredKind === "email" ? authContact : String(fd.get("email") || "").trim();
        if (!/^09\d{9}$/.test(phone)) {
          showError("شماره موبایل را با ۰۹ و ۱۱ رقم وارد کنید");
          return;
        }
        if (String(fd.get("password") || "").length < 6) {
          showError("رمز عبور حداقل ۶ کاراکتر باشد");
          return;
        }
        const res = AhooraStore.auth.register({
          name: fd.get("name"),
          phone,
          email,
          password: fd.get("password"),
        });
        if (res.error) {
          showError(res.error);
          return;
        }
        AhooraUtils.toast("ثبت‌نام انجام شد");
        render();
        return;
      }
      const code = String(fd.get("code") || "").trim();
      const order = AhooraStore.orders.list().find((o) => o.code === code);
      const booking = AhooraStore.bookings.list().find((b) => b.trackingCode === code);
      const box = document.getElementById("trackResult");
      if (order) {
        box.innerHTML = `<div class="ah-alert ah-alert-success">
          سفارش فروشگاهی · ${AhooraWorkflow.statusFa(order.status)} · پرداخت: ${order.paymentStatus}<br>
          مبلغ: ${AhooraUtils.formatPrice(order.amount)}
          ${
            AhooraWorkflow.canPay(order)
              ? `<div class="mt-2"><button type="button" class="ah-btn ah-btn-primary ah-btn-sm" id="payTracked">پرداخت آنلاین</button></div>`
              : ""
          }
        </div>`;
        document.getElementById("payTracked")?.addEventListener("click", () =>
          startPayment("shop", order.id, order.amount, order.code)
        );
      } else if (booking) {
        box.innerHTML = `<div class="ah-alert ah-alert-success">
          رزرو خدمت · ${booking.serviceTitle} · ${booking.date} ${booking.slot}<br>
          وضعیت: ${AhooraWorkflow.statusFa(booking.status)}
          ${
            AhooraWorkflow.canPay(booking)
              ? `<div class="mt-2"><button type="button" class="ah-btn ah-btn-primary ah-btn-sm" id="payTrackedBk">پرداخت آنلاین</button></div>`
              : ""
          }
        </div>`;
        document.getElementById("payTrackedBk")?.addEventListener("click", () =>
          startPayment("booking", booking.id, booking.amount, booking.trackingCode)
        );
      } else box.innerHTML = `<div class="ah-alert ah-alert-error">موردی یافت نشد</div>`;
    };
  }

  function render() {
    const user = AhooraStore.auth.current();
    if (!user) {
      document.body.classList.add("ah-auth-mode");
      renderAuth();
      return;
    }
    document.body.classList.remove("ah-auth-mode");

    const orders = AhooraStore.orders.list().filter((o) => o.phone === user.phone);
    const bookings = AhooraStore.bookings.list().filter((b) => b.phone === user.phone);

    root.innerHTML = `
      <div class="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
        <div><h2 class="h5 mb-0">${user.name}</h2><div class="text-secondary small" dir="ltr">${user.phone}</div></div>
        <button class="ah-btn ah-btn-dark ah-btn-sm" id="logoutBtn">خروج</button>
      </div>
      <h3 class="h5">سفارش‌های فروشگاهی</h3>
      <div class="ah-form-card mb-4">
        ${
          orders.length
            ? `<table class="ah-table"><thead><tr><th>کد</th><th>مبلغ</th><th>وضعیت</th><th></th></tr></thead><tbody>
            ${orders
              .map(
                (o) => `<tr>
                <td>${o.code}</td>
                <td>${AhooraUtils.formatPrice(o.amount)}</td>
                <td>${AhooraWorkflow.statusFa(o.status)}</td>
                <td>${
                  AhooraWorkflow.canPay(o)
                    ? `<button class="ah-btn ah-btn-primary ah-btn-sm pay-ord" data-id="${o.id}" data-amount="${o.amount}" data-code="${o.code}">پرداخت</button>`
                    : "—"
                }</td>
              </tr>`
              )
              .join("")}
            </tbody></table>`
            : `<p class="mb-0 text-secondary">سفارشی ثبت نشده است.</p>`
        }
      </div>
      <h3 class="h5">رزروهای خدمات</h3>
      <div class="ah-form-card">
        ${
          bookings.length
            ? `<table class="ah-table"><thead><tr><th>کد</th><th>خدمت</th><th>زمان</th><th>وضعیت</th><th></th></tr></thead><tbody>
            ${bookings
              .map(
                (b) => `<tr>
                <td>${b.trackingCode}</td>
                <td>${b.serviceTitle}</td>
                <td>${b.date} ${b.slot}</td>
                <td>${AhooraWorkflow.statusFa(b.status)}</td>
                <td>${
                  AhooraWorkflow.canPay(b)
                    ? `<button class="ah-btn ah-btn-primary ah-btn-sm pay-bk" data-id="${b.id}" data-amount="${b.amount}" data-code="${b.trackingCode}">پرداخت</button>`
                    : "—"
                }</td>
              </tr>`
              )
              .join("")}
            </tbody></table>`
            : `<p class="mb-0 text-secondary">رزروی ثبت نشده است.</p>`
        }
      </div>`;

    document.getElementById("logoutBtn").onclick = () => {
      AhooraStore.auth.logout();
      render();
    };
    root.querySelectorAll(".pay-ord").forEach((btn) => {
      btn.onclick = () => startPayment("shop", btn.dataset.id, Number(btn.dataset.amount), btn.dataset.code);
    });
    root.querySelectorAll(".pay-bk").forEach((btn) => {
      btn.onclick = () => startPayment("booking", btn.dataset.id, Number(btn.dataset.amount), btn.dataset.code);
    });
  }

  render();
});
