document.addEventListener("DOMContentLoaded", async () => {
  await AhooraLayout.boot({ seo: { title: "سبد خرید | اهورا تل" } });
  const root = document.getElementById("cartRoot");

  function subtotal(items) {
    return items.reduce((s, i) => s + i.price * i.qty, 0);
  }

  function applyCoupon(code, amount) {
    const coupons = AhooraStore.content.get().coupons || [];
    const c = coupons.find((x) => x.active && x.code.toUpperCase() === code.toUpperCase());
    if (!c) return { error: "کد تخفیف نامعتبر است" };
    const today = AhooraUtils.todayISO();
    if (today < c.startDate || today > c.endDate) return { error: "کد منقضی شده است" };
    if (c.usedCount >= c.usageLimit) return { error: "سقف استفاده کد پر شده" };
    if (amount < c.minAmount) return { error: "حداقل مبلغ خرید رعایت نشده" };
    if (c.appliesTo === "services") return { error: "این کد فقط برای خدمات است" };
    const discount = c.type === "percent" ? Math.round((amount * c.value) / 100) : c.value;
    return { coupon: c, discount: Math.min(discount, amount) };
  }

  function render() {
    const items = AhooraStore.cart.get();
    const shipping = AhooraStore.site.get().shipping || [];
    if (!items.length) {
      root.innerHTML = `<p class="text-secondary">سبد خرید خالی است. <a href="shop.html">مشاهده فروشگاه</a></p>`;
      return;
    }

    root.innerHTML = `
      <div class="row g-4">
        <div class="col-lg-7">
          <div class="ah-form-card">
            <table class="ah-table">
              <thead><tr><th>محصول</th><th>قیمت</th><th>تعداد</th><th></th></tr></thead>
              <tbody>
                ${items
                  .map(
                    (i) => `<tr>
                    <td>${i.title}</td>
                    <td>${AhooraUtils.formatPrice(i.price)}</td>
                    <td><input type="number" min="1" value="${i.qty}" class="form-control form-control-sm qty" data-id="${i.productId}" data-vid="${i.variantId || ""}" style="width:70px"></td>
                    <td><button class="btn btn-sm btn-outline-danger rem" data-id="${i.productId}" data-vid="${i.variantId || ""}">حذف</button></td>
                  </tr>`
                  )
                  .join("")}
              </tbody>
            </table>
          </div>
        </div>
        <div class="col-lg-5">
          <form class="ah-form-card" id="checkoutForm">
            <h2 class="h5 mb-3">اطلاعات ارسال</h2>
            <label>نام و نام خانوادگی</label>
            <input class="form-control mb-2" name="name" required>
            <label>شماره تماس</label>
            <input class="form-control mb-2" name="phone" required placeholder="09xxxxxxxxx" dir="ltr">
            <label>آدرس</label>
            <textarea class="form-control mb-2" name="address" rows="2" required></textarea>
            <label>روش ارسال</label>
            <select class="form-select mb-2" name="shippingId" id="shipSel" required>
              ${shipping.map((s) => `<option value="${s.id}" data-price="${s.price}">${s.title} — ${AhooraUtils.formatPrice(s.price)} (${s.eta})</option>`).join("")}
            </select>
            <label>کد تخفیف</label>
            <div class="input-group mb-3">
              <input class="form-control" name="coupon" id="couponInput">
              <button class="btn btn-outline-secondary" type="button" id="applyCouponBtn">اعمال</button>
            </div>
            <div id="totals" class="mb-3 small"></div>
            <button class="ah-btn ah-btn-primary w-100" type="submit">ثبت سفارش برای تأیید</button>
          </form>
        </div>
      </div>`;

    let discount = 0;
    let couponCode = "";

    const updateTotals = () => {
      const shipPrice = Number(document.getElementById("shipSel").selectedOptions[0]?.dataset.price || 0);
      const sub = subtotal(AhooraStore.cart.get());
      const total = Math.max(0, sub + shipPrice - discount);
      document.getElementById("totals").innerHTML = `
        <div>جمع کالا: ${AhooraUtils.formatPrice(sub)}</div>
        <div>ارسال: ${AhooraUtils.formatPrice(shipPrice)}</div>
        <div>تخفیف: ${AhooraUtils.formatPrice(discount)}</div>
        <div class="fw-bold fs-6 mt-1">مبلغ قابل پرداخت: ${AhooraUtils.formatPrice(total)}</div>`;
      return { sub, shipPrice, total };
    };
    updateTotals();

    document.getElementById("shipSel").onchange = updateTotals;
    document.getElementById("applyCouponBtn").onclick = () => {
      const code = document.getElementById("couponInput").value.trim();
      const res = applyCoupon(code, subtotal(AhooraStore.cart.get()));
      if (res.error) return AhooraUtils.toast(res.error, "error");
      discount = res.discount;
      couponCode = res.coupon.code;
      AhooraUtils.toast("کد تخفیف اعمال شد");
      updateTotals();
    };

    root.querySelectorAll(".qty").forEach((inp) => {
      inp.onchange = () => {
        AhooraStore.cart.updateQty(inp.dataset.id, inp.dataset.vid || null, Number(inp.value));
        AhooraLayout.updateCartBadge();
        render();
      };
    });
    root.querySelectorAll(".rem").forEach((btn) => {
      btn.onclick = () => {
        AhooraStore.cart.remove(btn.dataset.id, btn.dataset.vid || null);
        AhooraLayout.updateCartBadge();
        render();
      };
    });

    document.getElementById("checkoutForm").onsubmit = async (e) => {
      e.preventDefault();
      const fd = new FormData(e.target);
      const phone = String(fd.get("phone")).trim();
      if (!AhooraUtils.validatePhone(phone)) return AhooraUtils.toast("شماره موبایل معتبر نیست", "error");
      const { shipPrice, total } = updateTotals();
      const cartItems = AhooraStore.cart.get();

      // stock check
      for (const item of cartItems) {
        const prod = AhooraStore.products.byId(item.productId);
        if (!prod || prod.stock < item.qty) {
          return AhooraUtils.toast(`موجودی «${item.title}» کافی نیست`, "error");
        }
      }

      const order = {
        id: AhooraStore.uid("ord"),
        code: AhooraStore.trackingCode(),
        type: "shop",
        items: cartItems,
        name: fd.get("name"),
        phone,
        address: fd.get("address"),
        shippingId: fd.get("shippingId"),
        shippingPrice: shipPrice,
        discount,
        couponCode,
        amount: total,
        paymentStatus: "awaiting_approval",
        status: "pending_approval",
        createdAt: new Date().toISOString(),
      };
      AhooraStore.orders.add(order);
      AhooraSMS.notifyOrderCreated(order);
      AhooraStore.cart.clear();
      AhooraLayout.updateCartBadge();

      try {
        localStorage.setItem("ah_admin_ping", String(Date.now()));
      } catch {
        /* ignore */
      }

      root.innerHTML = `
        <div class="ah-alert ah-alert-success" style="max-width:640px;margin:auto">
          <strong>سفارش شما ثبت شد.</strong><br>
          کد پیگیری: <strong>${order.code}</strong><br>
          وضعیت: در انتظار تأیید مدیریت سایت<br>
          بعد از تأیید می‌توانید پرداخت را انجام دهید.
        </div>
        <div class="text-center mt-3">
          <a class="ah-btn ah-btn-primary" href="account.html">پیگیری سفارش</a>
          <a class="ah-btn ah-btn-dark" href="shop.html">ادامه خرید</a>
        </div>`;
      AhooraUtils.toast("سفارش ثبت شد · منتظر تأیید مدیریت");
    };
  }

  render();
});
