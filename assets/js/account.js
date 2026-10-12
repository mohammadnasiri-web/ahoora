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

  function render() {
    const user = AhooraStore.auth.current();
    if (!user) {
      root.innerHTML = `
        <div class="row g-4">
          <div class="col-md-6">
            <form class="ah-form-card" id="loginForm">
              <h2 class="h5 mb-3">ورود</h2>
              <label>شماره موبایل</label>
              <input class="form-control mb-2" name="phone" required dir="ltr" placeholder="09xxxxxxxxx">
              <label>رمز عبور</label>
              <input class="form-control mb-3" type="password" name="password" required>
              <button class="ah-btn ah-btn-primary w-100" type="submit">ورود</button>
            </form>
          </div>
          <div class="col-md-6">
            <form class="ah-form-card" id="regForm">
              <h2 class="h5 mb-3">ثبت‌نام</h2>
              <label>نام</label>
              <input class="form-control mb-2" name="name" required>
              <label>شماره موبایل</label>
              <input class="form-control mb-2" name="phone" required dir="ltr">
              <label>ایمیل</label>
              <input class="form-control mb-2" type="email" name="email">
              <label>رمز عبور</label>
              <input class="form-control mb-3" type="password" name="password" required minlength="6">
              <button class="ah-btn ah-btn-dark w-100" type="submit">ثبت‌نام</button>
            </form>
          </div>
          <div class="col-12">
            <form class="ah-form-card" id="trackForm">
              <h2 class="h5 mb-3">پیگیری با کد</h2>
              <div class="input-group">
                <input class="form-control" name="code" placeholder="کد پیگیری" required>
                <button class="ah-btn ah-btn-primary" type="submit">جست‌وجو</button>
              </div>
              <div id="trackResult" class="mt-3"></div>
            </form>
          </div>
        </div>`;

      document.getElementById("loginForm").onsubmit = (e) => {
        e.preventDefault();
        const fd = new FormData(e.target);
        const u = AhooraStore.auth.login(fd.get("phone"), fd.get("password"));
        if (!u) return AhooraUtils.toast("اطلاعات ورود نادرست است", "error");
        AhooraUtils.toast("ورود موفق");
        render();
      };
      document.getElementById("regForm").onsubmit = (e) => {
        e.preventDefault();
        const fd = new FormData(e.target);
        const res = AhooraStore.auth.register({
          name: fd.get("name"),
          phone: fd.get("phone"),
          email: fd.get("email"),
          password: fd.get("password"),
        });
        if (res.error) return AhooraUtils.toast(res.error, "error");
        AhooraUtils.toast("ثبت‌نام انجام شد");
        render();
      };
      document.getElementById("trackForm").onsubmit = (e) => {
        e.preventDefault();
        const code = new FormData(e.target).get("code").trim();
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
      return;
    }

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
