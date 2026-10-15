document.addEventListener("DOMContentLoaded", async () => {
  await AhooraStore.init();
  const app = document.getElementById("adminApp");
  let view = "dashboard";

  const nav = [
    { id: "dashboard", title: "داشبورد", icon: "bi-speedometer2" },
    { id: "pending", title: "درخواست‌های جدید", icon: "bi-bell" },
    { id: "products", title: "محصولات", icon: "bi-phone" },
    { id: "categories", title: "دسته‌بندی‌ها", icon: "bi-diagram-3" },
    { id: "orders", title: "سفارش‌های فروش", icon: "bi-bag-check" },
    { id: "services", title: "خدمات", icon: "bi-tools" },
    { id: "bookings", title: "رزروها", icon: "bi-calendar-check" },
    { id: "capacity", title: "ظرفیت و ساعات", icon: "bi-clock-history" },
    { id: "content", title: "صفحه اصلی و محتوا", icon: "bi-layout-text-window" },
    { id: "menus", title: "منو / هدر / فوتر", icon: "bi-list" },
    { id: "coupons", title: "کد تخفیف", icon: "bi-ticket-perforated" },
    { id: "reviews", title: "نظرات", icon: "bi-chat-quote" },
    { id: "shipping", title: "ارسال", icon: "bi-truck" },
    { id: "settings", title: "تنظیمات و سئو", icon: "bi-gear" },
    { id: "sms", title: "پیامک‌ها", icon: "bi-chat-left-text" },
  ];

  let lastPending = -1;

  function requireAuth() {
    return AhooraStore.auth.adminCurrent();
  }

  function shell(inner) {
    const admin = requireAuth();
    const pending = AhooraWorkflow.pendingCount();
    return `<div class="admin-layout">
      <aside class="admin-side">
        <div class="px-2 mb-3 admin-brand">
          <img src="../assets/img/logo-ahoora.jpg" alt="اهورا تل" width="120" height="48" style="height:40px;width:auto;background:#fff;border-radius:8px;padding:2px 6px;display:block;margin-bottom:0.4rem">
          <span class="fw-bold">پنل مدیریت</span>
        </div>
        ${nav
          .map((n) => {
            const badge =
              n.id === "pending" && pending
                ? `<span class="admin-badge">${pending}</span>`
                : "";
            return `<a href="#" data-view="${n.id}" class="${view === n.id ? "active" : ""}"><i class="bi ${n.icon} me-1"></i>${n.title}${badge}</a>`;
          })
          .join("")}
        <hr class="border-secondary">
        <a href="../index.html" target="_blank">مشاهده سایت</a>
        <a href="#" id="adminLogout">خروج (${admin?.name || ""})</a>
      </aside>
      <main class="admin-main">
        ${
          pending
            ? `<div class="admin-alert-bar" role="alert">
                <div><strong>⚠ درخواست جدید:</strong> ${pending} مورد منتظر تأیید شماست.</div>
                <button type="button" class="ah-btn ah-btn-primary ah-btn-sm" id="gotoPending">مشاهده و تأیید</button>
              </div>`
            : ""
        }
        ${inner}
      </main>
    </div>`;
  }

  function renderLogin() {
    app.innerHTML = `<div class="min-vh-100 d-flex align-items-center justify-content-center" style="background:#f5f5f7">
      <form class="ah-form-card" id="adminLogin" style="width:min(400px,92%)">
        <h1 class="h4 mb-3">ورود پنل مدیریت</h1>
        <label>نام کاربری</label>
        <input class="form-control mb-2" name="username" value="admin" required>
        <label>رمز عبور</label>
        <input class="form-control mb-3" type="password" name="password" value="admin123" required>
        <button class="ah-btn ah-btn-primary w-100" type="submit">ورود</button>
        <p class="small text-secondary mt-3 mb-0">پیش‌فرض: admin / admin123</p>
      </form>
    </div>`;
    document.getElementById("adminLogin").onsubmit = (e) => {
      e.preventDefault();
      const fd = new FormData(e.target);
      const ok = AhooraStore.auth.adminLogin(fd.get("username"), fd.get("password"));
      if (!ok) return AhooraUtils.toast("ورود ناموفق", "error");
      render();
    };
  }

  function bindNav() {
    app.querySelectorAll("[data-view]").forEach((a) => {
      a.onclick = (e) => {
        e.preventDefault();
        view = a.dataset.view;
        render();
      };
    });
    document.getElementById("adminLogout")?.addEventListener("click", (e) => {
      e.preventDefault();
      AhooraStore.auth.adminLogout();
      render();
    });
  }

  function viewDashboard() {
    const products = AhooraStore.products.all().products.length;
    const bookings = AhooraStore.bookings.list().length;
    const orders = AhooraStore.orders.list().length;
    const services = AhooraStore.services.list().length;
    const pending = AhooraWorkflow.pendingCount();
    return `<h1 class="h4 mb-4">داشبورد</h1>
      <div class="row g-3">
        <div class="col-md-3"><div class="admin-stat ${pending ? "admin-stat-warn" : ""}"><div class="text-secondary small">در انتظار تأیید</div><div class="num">${pending}</div></div></div>
        <div class="col-md-3"><div class="admin-stat"><div class="text-secondary small">محصولات</div><div class="num">${products}</div></div></div>
        <div class="col-md-3"><div class="admin-stat"><div class="text-secondary small">سفارش‌ها</div><div class="num">${orders}</div></div></div>
        <div class="col-md-3"><div class="admin-stat"><div class="text-secondary small">رزروها</div><div class="num">${bookings}</div></div></div>
      </div>
      <div class="ah-form-card mt-4">
        <h2 class="h6">فرایند سفارش</h2>
        <ol class="mb-3 small text-secondary pe-3">
          <li>مشتری درخواست را ثبت می‌کند</li>
          <li>اعلان در پنل مدیریت نمایش داده می‌شود</li>
          <li>شما تأیید یا رد می‌کنید</li>
          <li>در صورت تأیید، مشتری می‌تواند پرداخت کند</li>
        </ol>
        <button class="ah-btn ah-btn-primary ah-btn-sm" id="gotoPending">رفتن به درخواست‌های جدید</button>
        <button class="ah-btn ah-btn-dark ah-btn-sm" id="resetData">بازنشانی داده اولیه</button>
      </div>`;
  }

  function viewPending() {
    const items = AhooraWorkflow.pendingAll();
    return `<h1 class="h4 mb-3">درخواست‌های جدید <span class="badge text-bg-danger">${items.length}</span></h1>
      <p class="text-secondary small mb-3">هر درخواست را بررسی کنید؛ اگر امکان انجام دارید تأیید، در غیر این صورت رد کنید.</p>
      ${
        items.length
          ? items
              .map(
                (p) => `<article class="ah-form-card mb-3 pending-card">
            <div class="d-flex justify-content-between flex-wrap gap-2 mb-2">
              <div>
                <span class="badge ${p.kind === "booking" ? "text-bg-dark" : "text-bg-primary"}">${p.kind === "booking" ? "رزرو خدمت" : "سفارش فروش"}</span>
                <strong class="ms-2">${p.code}</strong>
              </div>
              <div class="small text-secondary">${p.createdAt ? new Date(p.createdAt).toLocaleString("fa-IR") : ""}</div>
            </div>
            <div class="mb-1"><strong>${p.title}</strong></div>
            <div class="small text-secondary mb-2">${p.meta || ""}</div>
            <div class="mb-2">${p.name} · <span dir="ltr">${p.phone}</span> · ${AhooraUtils.formatPrice(p.amount)}</div>
            <div class="d-flex gap-2 flex-wrap">
              <button type="button" class="ah-btn ah-btn-primary ah-btn-sm btn-approve" data-kind="${p.kind}" data-id="${p.id}">تأیید می‌کنم</button>
              <button type="button" class="ah-btn ah-btn-dark ah-btn-sm btn-reject" data-kind="${p.kind}" data-id="${p.id}">رد می‌کنم</button>
            </div>
          </article>`
              )
              .join("")
          : `<div class="ah-alert ah-alert-success">درخواست جدیدی در صف تأیید نیست.</div>`
      }`;
  }

  function viewProducts() {
    const items = AhooraStore.products.all().products;
    return `<div class="d-flex justify-content-between mb-3"><h1 class="h4 mb-0">محصولات</h1>
      <button class="ah-btn ah-btn-primary ah-btn-sm" id="addProduct">افزودن محصول</button></div>
      <div class="ah-form-card overflow-auto">
        <table class="ah-table"><thead><tr><th>عنوان</th><th>قیمت</th><th>موجودی</th><th>فعال</th><th></th></tr></thead>
        <tbody>${items
          .map(
            (p) => `<tr>
            <td>${p.title}<div class="small text-secondary">${p.slug}</div></td>
            <td>${AhooraUtils.formatPrice(p.discountPrice || p.price)}</td>
            <td>${p.stock}</td>
            <td>${p.active ? "بله" : "خیر"}</td>
            <td class="text-nowrap">
              <button class="btn btn-sm btn-outline-primary edit-p" data-id="${p.id}">ویرایش</button>
              <button class="btn btn-sm btn-outline-danger del-p" data-id="${p.id}">حذف</button>
            </td>
          </tr>`
          )
          .join("")}</tbody></table>
      </div>
      <div id="productFormWrap" class="mt-3"></div>`;
  }

  function productForm(p = null) {
    const cats = AhooraStore.products.all().categories;
    const data = p || {
      id: "",
      slug: "",
      title: "",
      brand: "",
      model: "",
      categoryId: cats[0]?.id || "",
      price: 0,
      discountPrice: null,
      stock: 0,
      active: true,
      featured: false,
      bestseller: false,
      images: ["assets/img/product-phone.svg"],
      description: "",
      specs: {},
      variants: [],
      seo: { title: "", description: "" },
    };
    return `<form class="ah-form-card" id="productForm">
      <h2 class="h5 mb-3">${p ? "ویرایش" : "افزودن"} محصول</h2>
      <input type="hidden" name="id" value="${data.id}">
      <div class="row g-2">
        <div class="col-md-6"><label>عنوان</label><input class="form-control" name="title" value="${data.title}" required></div>
        <div class="col-md-6"><label>Slug (انگلیسی)</label><input class="form-control" name="slug" value="${data.slug}" required dir="ltr"></div>
        <div class="col-md-4"><label>برند</label><input class="form-control" name="brand" value="${data.brand || ""}"></div>
        <div class="col-md-4"><label>مدل</label><input class="form-control" name="model" value="${data.model || ""}"></div>
        <div class="col-md-4"><label>دسته</label><select class="form-select" name="categoryId">${cats.map((c) => `<option value="${c.id}" ${c.id === data.categoryId ? "selected" : ""}>${c.title}</option>`).join("")}</select></div>
        <div class="col-md-4"><label>قیمت</label><input class="form-control" type="number" name="price" value="${data.price}" required></div>
        <div class="col-md-4"><label>قیمت تخفیف</label><input class="form-control" type="number" name="discountPrice" value="${data.discountPrice || ""}"></div>
        <div class="col-md-4"><label>موجودی</label><input class="form-control" type="number" name="stock" value="${data.stock}" required></div>
        <div class="col-12"><label>توضیحات</label><textarea class="form-control" name="description" rows="2">${data.description || ""}</textarea></div>
        <div class="col-md-6"><label>SEO Title</label><input class="form-control" name="seoTitle" value="${data.seo?.title || ""}"></div>
        <div class="col-md-6"><label>SEO Description</label><input class="form-control" name="seoDesc" value="${data.seo?.description || ""}"></div>
        <div class="col-12 d-flex gap-3">
          <label><input type="checkbox" name="active" ${data.active ? "checked" : ""}> فعال</label>
          <label><input type="checkbox" name="featured" ${data.featured ? "checked" : ""}> ویژه</label>
          <label><input type="checkbox" name="bestseller" ${data.bestseller ? "checked" : ""}> پرفروش</label>
        </div>
        <div class="col-12"><button class="ah-btn ah-btn-primary" type="submit">ذخیره</button></div>
      </div>
    </form>`;
  }

  function viewServices() {
    const items = AhooraStore.services.all().services;
    return `<div class="d-flex justify-content-between mb-3"><h1 class="h4 mb-0">خدمات</h1>
      <button class="ah-btn ah-btn-primary ah-btn-sm" id="addService">افزودن خدمت</button></div>
      <div class="ah-form-card overflow-auto">
        <table class="ah-table"><thead><tr><th>عنوان</th><th>نوع</th><th>قیمت پایه</th><th>ظرفیت روزانه</th><th>مدت</th><th></th></tr></thead>
        <tbody>${items
          .map(
            (s) => `<tr>
            <td>${s.title}</td>
            <td>${s.type === "onsite" ? "در محل" : "غیرحضوری"}</td>
            <td>${AhooraUtils.formatPrice(s.basePrice)}</td>
            <td>${s.dailyCapacity}</td>
            <td>${s.durationMinutes} دقیقه</td>
            <td><button class="btn btn-sm btn-outline-primary edit-s" data-id="${s.id}">ویرایش</button></td>
          </tr>`
          )
          .join("")}</tbody></table>
      </div>
      <div id="serviceFormWrap" class="mt-3"></div>`;
  }

  function serviceForm(s = null) {
    const data = s || {
      id: "",
      slug: "",
      title: "",
      type: "workshop",
      category: "other",
      active: true,
      basePrice: 0,
      durationMinutes: 60,
      dailyCapacity: 10,
      description: "",
      requiresAddress: false,
      requiresMedia: false,
      priceByModel: {},
      seo: { title: "", description: "" },
    };
    return `<form class="ah-form-card" id="serviceForm">
      <h2 class="h5 mb-3">${s ? "ویرایش" : "افزودن"} خدمت</h2>
      <input type="hidden" name="id" value="${data.id}">
      <div class="row g-2">
        <div class="col-md-6"><label>عنوان</label><input class="form-control" name="title" value="${data.title}" required></div>
        <div class="col-md-6"><label>Slug</label><input class="form-control" name="slug" value="${data.slug}" required dir="ltr"></div>
        <div class="col-md-4"><label>نوع ارائه</label><select class="form-select" name="type"><option value="onsite" ${data.type === "onsite" ? "selected" : ""}>در محل</option><option value="workshop" ${data.type === "workshop" ? "selected" : ""}>غیرحضوری</option></select></div>
        <div class="col-md-4"><label>قیمت پایه</label><input class="form-control" type="number" name="basePrice" value="${data.basePrice}" required></div>
        <div class="col-md-4"><label>ظرفیت روزانه</label><input class="form-control" type="number" name="dailyCapacity" value="${data.dailyCapacity}" required></div>
        <div class="col-md-4"><label>مدت (دقیقه)</label><input class="form-control" type="number" name="durationMinutes" value="${data.durationMinutes}" required></div>
        <div class="col-12"><label>توضیحات</label><textarea class="form-control" name="description" rows="2">${data.description || ""}</textarea></div>
        <div class="col-md-6"><label>SEO Title</label><input class="form-control" name="seoTitle" value="${data.seo?.title || ""}"></div>
        <div class="col-md-6"><label>SEO Description</label><input class="form-control" name="seoDesc" value="${data.seo?.description || ""}"></div>
        <div class="col-12 d-flex gap-3">
          <label><input type="checkbox" name="active" ${data.active ? "checked" : ""}> فعال</label>
          <label><input type="checkbox" name="requiresAddress" ${data.requiresAddress ? "checked" : ""}> نیاز به آدرس</label>
          <label><input type="checkbox" name="requiresMedia" ${data.requiresMedia ? "checked" : ""}> نیاز به رسانه</label>
        </div>
        <div class="col-12"><button class="ah-btn ah-btn-primary" type="submit">ذخیره</button></div>
      </div>
    </form>`;
  }

  function viewBookings() {
    const items = AhooraStore.bookings.list();
    const statuses = [
      "pending_approval",
      "awaiting_payment",
      "confirmed",
      "in_progress",
      "completed",
      "rejected",
      "cancelled",
    ];
    return `<h1 class="h4 mb-3">رزروها</h1>
      <div class="ah-form-card overflow-auto">
        <table class="ah-table"><thead><tr><th>کد</th><th>خدمت</th><th>مشتری</th><th>زمان</th><th>پرداخت</th><th>وضعیت</th><th></th></tr></thead>
        <tbody>${items
          .map(
            (b) => `<tr class="${b.status === "pending_approval" ? "table-warning" : ""}">
            <td>${b.trackingCode}</td>
            <td>${b.serviceTitle}<div class="small">${b.deviceModel || ""}</div></td>
            <td>${b.name}<div class="small" dir="ltr">${b.phone}</div></td>
            <td>${b.date} ${b.slot}</td>
            <td>${b.paymentStatus}</td>
            <td>
              <div class="small mb-1">${AhooraWorkflow.statusFa(b.status)}</div>
              <select class="form-select form-select-sm bk-status" data-id="${b.id}">
                ${statuses
                  .map((s) => `<option value="${s}" ${b.status === s ? "selected" : ""}>${AhooraWorkflow.statusFa(s)}</option>`)
                  .join("")}
              </select>
            </td>
            <td class="text-nowrap">
              ${
                b.status === "pending_approval"
                  ? `<button class="btn btn-sm btn-success btn-approve" data-kind="booking" data-id="${b.id}">تأیید</button>
                     <button class="btn btn-sm btn-outline-danger btn-reject" data-kind="booking" data-id="${b.id}">رد</button>`
                  : `<button class="btn btn-sm btn-outline-success bk-done" data-id="${b.id}" data-phone="${b.phone}" data-code="${b.trackingCode}">تکمیل</button>`
              }
            </td>
          </tr>`
          )
          .join("") || `<tr><td colspan="7">رزروی نیست</td></tr>`}</tbody></table>
      </div>`;
  }

  function viewOrders() {
    const items = AhooraStore.orders.list();
    const statuses = [
      "pending_approval",
      "awaiting_payment",
      "processing",
      "preparing",
      "shipped",
      "completed",
      "rejected",
      "cancelled",
      "payment_failed",
    ];
    return `<h1 class="h4 mb-3">سفارش‌های فروشگاهی</h1>
      <div class="ah-form-card overflow-auto">
        <table class="ah-table"><thead><tr><th>کد</th><th>مشتری</th><th>مبلغ</th><th>پرداخت</th><th>وضعیت</th><th></th></tr></thead>
        <tbody>${items
          .map(
            (o) => `<tr class="${o.status === "pending_approval" ? "table-warning" : ""}">
            <td>${o.code}</td>
            <td>${o.name}<div class="small" dir="ltr">${o.phone}</div></td>
            <td>${AhooraUtils.formatPrice(o.amount)}</td>
            <td>${o.paymentStatus}</td>
            <td>
              <div class="small mb-1">${AhooraWorkflow.statusFa(o.status)}</div>
              <select class="form-select form-select-sm ord-status" data-id="${o.id}">
                ${statuses
                  .map((s) => `<option value="${s}" ${o.status === s ? "selected" : ""}>${AhooraWorkflow.statusFa(s)}</option>`)
                  .join("")}
              </select>
            </td>
            <td class="text-nowrap">
              ${
                o.status === "pending_approval"
                  ? `<button class="btn btn-sm btn-success btn-approve" data-kind="order" data-id="${o.id}">تأیید</button>
                     <button class="btn btn-sm btn-outline-danger btn-reject" data-kind="order" data-id="${o.id}">رد</button>`
                  : "—"
              }
            </td>
          </tr>`
          )
          .join("") || `<tr><td colspan="6">سفارشی نیست</td></tr>`}</tbody></table>
      </div>`;
  }

  function viewCapacity() {
    const data = AhooraStore.services.all();
    const schedule = data.schedule;
    return `<h1 class="h4 mb-3">ظرفیت و ساعات کاری</h1>
      <form class="ah-form-card" id="scheduleForm">
        <label>اسلات‌های ساعتی (با کاما)</label>
        <input class="form-control mb-2" name="slots" value="${(schedule.slots || []).join(",")}" dir="ltr">
        <label>ظرفیت پیش‌فرض هر اسلات</label>
        <input class="form-control mb-2" type="number" name="slotCapacityDefault" value="${schedule.slotCapacityDefault || 2}">
        <label>روزهای کاری (۰=یکشنبه … ۶=شنبه، با کاما)</label>
        <input class="form-control mb-2" name="workingDays" value="${(schedule.workingDays || []).join(",")}" dir="ltr">
        <label>تعطیلات (YYYY-MM-DD با کاما)</label>
        <input class="form-control mb-3" name="holidays" value="${(schedule.holidays || []).join(",")}" dir="ltr">
        <button class="ah-btn ah-btn-primary" type="submit">ذخیره ساعات</button>
      </form>
      <div class="ah-form-card mt-3">
        <h2 class="h6">ظرفیت روزانه هر خدمت — از جدول خدمات قابل ویرایش است</h2>
        <ul class="mb-0">${data.services.map((s) => `<li>${s.title}: <strong>${s.dailyCapacity}</strong></li>`).join("")}</ul>
      </div>`;
  }

  function viewContent() {
    const site = AhooraStore.site.get();
    const hero = site.homepage.sections.find((s) => s.id === "hero-battery") || {};
    return `<h1 class="h4 mb-3">محتوای صفحه اصلی</h1>
      <form class="ah-form-card" id="heroForm">
        <h2 class="h6">هیرو اول</h2>
        <label>تیتر</label><input class="form-control mb-2" name="title" value="${hero.title || ""}">
        <label>زیرتیتر</label><input class="form-control mb-2" name="subtitle" value="${hero.subtitle || ""}">
        <label>متن</label><textarea class="form-control mb-2" name="text" rows="2">${hero.text || ""}</textarea>
        <label>متن دکمه اصلی</label><input class="form-control mb-3" name="cta" value="${hero.ctaPrimary?.text || ""}">
        <button class="ah-btn ah-btn-primary" type="submit">ذخیره</button>
      </form>
      <form class="ah-form-card mt-3" id="bannerForm">
        <h2 class="h6">بنر تبلیغاتی</h2>
        <label>عنوان</label><input class="form-control mb-2" name="title" value="${site.banners?.[0]?.title || ""}">
        <label>متن</label><input class="form-control mb-2" name="text" value="${site.banners?.[0]?.text || ""}">
        <label>لینک</label><input class="form-control mb-3" name="url" value="${site.banners?.[0]?.url || ""}">
        <button class="ah-btn ah-btn-primary" type="submit">ذخیره بنر</button>
      </form>`;
  }

  function viewMenus() {
    const site = AhooraStore.site.get();
    return `<h1 class="h4 mb-3">منو / هدر / فوتر</h1>
      <form class="ah-form-card" id="headerForm">
        <label>متن دکمه اقدام هدر</label>
        <input class="form-control mb-2" name="ctaText" value="${site.header?.ctaText || ""}">
        <label>لینک دکمه</label>
        <input class="form-control mb-2" name="ctaLink" value="${site.header?.ctaLink || ""}">
        <label>شماره تماس</label>
        <input class="form-control mb-2" name="phone" value="${site.site.phone}" dir="ltr">
        <label>متن کپی‌رایت فوتر</label>
        <input class="form-control mb-3" name="copyright" value="${site.footer?.copyright || ""}">
        <button class="ah-btn ah-btn-primary" type="submit">ذخیره</button>
      </form>
      <div class="ah-form-card mt-3">
        <h2 class="h6">آیتم‌های منو (JSON)</h2>
        <textarea class="form-control mb-2" id="menuJson" rows="10" dir="ltr">${JSON.stringify(site.menu, null, 2)}</textarea>
        <button class="ah-btn ah-btn-dark" id="saveMenu">ذخیره منو</button>
      </div>`;
  }

  function viewCoupons() {
    const coupons = AhooraStore.content.get().coupons || [];
    return `<h1 class="h4 mb-3">کدهای تخفیف</h1>
      <div class="ah-form-card mb-3 overflow-auto">
        <table class="ah-table"><thead><tr><th>کد</th><th>نوع</th><th>مقدار</th><th>استفاده</th><th>فعال</th></tr></thead>
        <tbody>${coupons.map((c) => `<tr><td>${c.code}</td><td>${c.type}</td><td>${c.value}</td><td>${c.usedCount}/${c.usageLimit}</td><td>${c.active ? "بله" : "خیر"}</td></tr>`).join("")}</tbody></table>
      </div>
      <form class="ah-form-card" id="couponForm">
        <h2 class="h6">افزودن کد</h2>
        <div class="row g-2">
          <div class="col-md-3"><input class="form-control" name="code" placeholder="CODE" required></div>
          <div class="col-md-3"><select class="form-select" name="type"><option value="percent">درصدی</option><option value="fixed">مبلغی</option></select></div>
          <div class="col-md-3"><input class="form-control" type="number" name="value" placeholder="مقدار" required></div>
          <div class="col-md-3"><input class="form-control" type="number" name="minAmount" placeholder="حداقل مبلغ" value="0"></div>
          <div class="col-12"><button class="ah-btn ah-btn-primary" type="submit">افزودن</button></div>
        </div>
      </form>`;
  }

  function viewReviews() {
    const content = AhooraStore.content.get();
    const reviews = content.reviews || [];
    const testimonials = content.testimonials || [];
    return `<h1 class="h4 mb-3">نظرات و اعتمادسازی</h1>
      <h2 class="h6">نظرات در انتظار تأیید</h2>
      <div class="ah-form-card mb-3">${reviews.length ? reviews.map((r) => `
        <div class="d-flex justify-content-between border-bottom py-2 gap-2">
          <div><strong>${r.name}</strong> · ${r.rating}★<div>${r.text}</div></div>
          <div>
            <button class="btn btn-sm btn-success approve-r" data-id="${r.id}">تأیید</button>
            <button class="btn btn-sm btn-danger del-r" data-id="${r.id}">حذف</button>
          </div>
        </div>`).join("") : "<p class='mb-0 text-secondary'>موردی نیست</p>"}</div>
      <h2 class="h6">نظرات مشتریان (صفحه اصلی)</h2>
      <div class="ah-form-card">${testimonials.map((t) => `<div class="py-2 border-bottom"><strong>${t.name}</strong> — ${t.text}</div>`).join("")}</div>`;
  }

  function viewShipping() {
    const shipping = AhooraStore.site.get().shipping || [];
    return `<h1 class="h4 mb-3">روش‌های ارسال</h1>
      <form class="ah-form-card" id="shippingForm">
        <textarea class="form-control mb-2" id="shippingJson" rows="12" dir="ltr">${JSON.stringify(shipping, null, 2)}</textarea>
        <button class="ah-btn ah-btn-primary" type="submit">ذخیره</button>
      </form>`;
  }

  function viewSettings() {
    const site = AhooraStore.site.get();
    return `<h1 class="h4 mb-3">تنظیمات و سئو</h1>
      <form class="ah-form-card" id="settingsForm">
        <label>نام سایت</label><input class="form-control mb-2" name="name" value="${site.site.name}">
        <label>تگ‌لاین</label><input class="form-control mb-2" name="tagline" value="${site.site.tagline}">
        <label>آدرس</label><input class="form-control mb-2" name="address" value="${site.site.address}">
        <label>ایمیل</label><input class="form-control mb-2" name="email" value="${site.site.email}">
        <label>واتساپ</label><input class="form-control mb-2" name="whatsapp" value="${site.site.whatsapp}" dir="ltr">
        <label>ساعات کاری</label><input class="form-control mb-2" name="workingHours" value="${site.site.workingHours}">
        <label>SEO Title پیش‌فرض</label><input class="form-control mb-2" name="seoTitle" value="${site.site.seo.title}">
        <label>SEO Description</label><textarea class="form-control mb-3" name="seoDesc" rows="2">${site.site.seo.description}</textarea>
        <label>درگاه پرداخت</label><input class="form-control mb-2" name="gateway" value="${site.payment?.gateway || ""}">
        <label>شماره ادمین برای SMS</label><input class="form-control mb-3" name="adminPhone" value="${site.sms?.adminPhone || ""}" dir="ltr">
        <button class="ah-btn ah-btn-primary" type="submit">ذخیره تنظیمات</button>
      </form>`;
  }

  function viewSms() {
    const log = AhooraStore.get(AhooraStore.KEYS.smsLog, []);
    return `<h1 class="h4 mb-3">لاگ پیامک‌ها (stub)</h1>
      <div class="ah-form-card overflow-auto">
        <table class="ah-table"><thead><tr><th>زمان</th><th>گیرنده</th><th>متن</th><th>وضعیت</th></tr></thead>
        <tbody>${log.map((s) => `<tr><td>${s.createdAt}</td><td dir="ltr">${s.to}</td><td>${s.body}</td><td>${s.status}</td></tr>`).join("") || "<tr><td colspan='4'>هنوز پیامکی ارسال نشده</td></tr>"}</tbody></table>
      </div>`;
  }

  function viewCategories() {
    const cats = AhooraStore.products.all().categories;
    return `<h1 class="h4 mb-3">دسته‌بندی‌ها</h1>
      <div class="ah-form-card mb-3 overflow-auto">
        <table class="ah-table"><thead><tr><th>عنوان</th><th>slug</th><th>والد</th><th>فعال</th></tr></thead>
        <tbody>${cats.map((c) => `<tr><td>${c.title}</td><td dir="ltr">${c.slug}</td><td>${c.parentId || "—"}</td><td>${c.active ? "بله" : "خیر"}</td></tr>`).join("")}</tbody></table>
      </div>
      <form class="ah-form-card" id="catForm">
        <h2 class="h6">افزودن دسته</h2>
        <div class="row g-2">
          <div class="col-md-4"><input class="form-control" name="title" placeholder="عنوان" required></div>
          <div class="col-md-4"><input class="form-control" name="slug" placeholder="slug-en" required dir="ltr"></div>
          <div class="col-md-4"><select class="form-select" name="parentId"><option value="">بدون والد</option>${cats.filter((c)=>!c.parentId).map((c)=>`<option value="${c.id}">${c.title}</option>`).join("")}</select></div>
          <div class="col-12"><button class="ah-btn ah-btn-primary" type="submit">افزودن</button></div>
        </div>
      </form>`;
  }

  function render() {
    if (!requireAuth()) return renderLogin();
    let inner = "";
    if (view === "dashboard") inner = viewDashboard();
    else if (view === "pending") inner = viewPending();
    else if (view === "products") inner = viewProducts();
    else if (view === "categories") inner = viewCategories();
    else if (view === "orders") inner = viewOrders();
    else if (view === "services") inner = viewServices();
    else if (view === "bookings") inner = viewBookings();
    else if (view === "capacity") inner = viewCapacity();
    else if (view === "content") inner = viewContent();
    else if (view === "menus") inner = viewMenus();
    else if (view === "coupons") inner = viewCoupons();
    else if (view === "reviews") inner = viewReviews();
    else if (view === "shipping") inner = viewShipping();
    else if (view === "settings") inner = viewSettings();
    else if (view === "sms") inner = viewSms();
    else inner = viewDashboard();

    app.innerHTML = shell(inner);
    bindNav();
    bindActions();
  }

  function bindActions() {
    document.getElementById("gotoPending")?.addEventListener("click", () => {
      view = "pending";
      render();
    });

    app.querySelectorAll(".btn-approve").forEach((btn) => {
      btn.onclick = () => {
        AhooraWorkflow.approve(btn.dataset.kind, btn.dataset.id);
        render();
      };
    });
    app.querySelectorAll(".btn-reject").forEach((btn) => {
      btn.onclick = () => {
        const reason = prompt("دلیل رد (اختیاری):") || "";
        if (!confirm("این درخواست رد شود؟")) return;
        AhooraWorkflow.reject(btn.dataset.kind, btn.dataset.id, reason);
        render();
      };
    });

    document.getElementById("resetData")?.addEventListener("click", () => {
      if (!confirm("همه داده‌های محلی پاک شود؟")) return;
      AhooraStore.resetToSeed();
      location.reload();
    });

    document.getElementById("addProduct")?.addEventListener("click", () => {
      document.getElementById("productFormWrap").innerHTML = productForm();
      bindProductForm();
    });
    app.querySelectorAll(".edit-p").forEach((btn) => {
      btn.onclick = () => {
        const p = AhooraStore.products.byId(btn.dataset.id);
        document.getElementById("productFormWrap").innerHTML = productForm(p);
        bindProductForm();
      };
    });
    app.querySelectorAll(".del-p").forEach((btn) => {
      btn.onclick = () => {
        if (!confirm("حذف شود؟")) return;
        AhooraStore.products.remove(btn.dataset.id);
        render();
      };
    });

    document.getElementById("addService")?.addEventListener("click", () => {
      document.getElementById("serviceFormWrap").innerHTML = serviceForm();
      bindServiceForm();
    });
    app.querySelectorAll(".edit-s").forEach((btn) => {
      btn.onclick = () => {
        document.getElementById("serviceFormWrap").innerHTML = serviceForm(AhooraStore.services.byId(btn.dataset.id));
        bindServiceForm();
      };
    });

    app.querySelectorAll(".bk-status").forEach((sel) => {
      sel.onchange = () => {
        AhooraStore.bookings.update(sel.dataset.id, { status: sel.value });
        AhooraUtils.toast("وضعیت رزرو بروزرسانی شد");
      };
    });
    app.querySelectorAll(".bk-done").forEach((btn) => {
      btn.onclick = () => {
        AhooraStore.bookings.update(btn.dataset.id, { status: "completed" });
        AhooraSMS.notifyServiceDone(btn.dataset.phone, btn.dataset.code);
        AhooraUtils.toast("تکمیل و پیامک ارسال شد");
        render();
      };
    });
    app.querySelectorAll(".ord-status").forEach((sel) => {
      sel.onchange = () => {
        AhooraStore.orders.update(sel.dataset.id, { status: sel.value });
        AhooraUtils.toast("وضعیت سفارش بروزرسانی شد");
      };
    });

    document.getElementById("scheduleForm")?.addEventListener("submit", (e) => {
      e.preventDefault();
      const fd = new FormData(e.target);
      const data = AhooraStore.services.all();
      data.schedule.slots = String(fd.get("slots")).split(",").map((s) => s.trim()).filter(Boolean);
      data.schedule.slotCapacityDefault = Number(fd.get("slotCapacityDefault"));
      data.schedule.workingDays = String(fd.get("workingDays")).split(",").map((n) => Number(n.trim())).filter((n) => !Number.isNaN(n));
      data.schedule.holidays = String(fd.get("holidays")).split(",").map((s) => s.trim()).filter(Boolean);
      AhooraStore.services.save(data);
      AhooraUtils.toast("ساعات ذخیره شد");
    });

    document.getElementById("heroForm")?.addEventListener("submit", (e) => {
      e.preventDefault();
      const fd = new FormData(e.target);
      const site = AhooraStore.site.get();
      const sec = site.homepage.sections.find((s) => s.id === "hero-battery");
      if (sec) {
        sec.title = fd.get("title");
        sec.subtitle = fd.get("subtitle");
        sec.text = fd.get("text");
        if (sec.ctaPrimary) sec.ctaPrimary.text = fd.get("cta");
      }
      AhooraStore.site.save(site);
      AhooraUtils.toast("محتوا ذخیره شد");
    });

    document.getElementById("bannerForm")?.addEventListener("submit", (e) => {
      e.preventDefault();
      const fd = new FormData(e.target);
      const site = AhooraStore.site.get();
      if (!site.banners?.length) site.banners = [{ id: "promo-1", active: true }];
      site.banners[0].title = fd.get("title");
      site.banners[0].text = fd.get("text");
      site.banners[0].url = fd.get("url");
      AhooraStore.site.save(site);
      AhooraUtils.toast("بنر ذخیره شد");
    });

    document.getElementById("headerForm")?.addEventListener("submit", (e) => {
      e.preventDefault();
      const fd = new FormData(e.target);
      const site = AhooraStore.site.get();
      site.header.ctaText = fd.get("ctaText");
      site.header.ctaLink = fd.get("ctaLink");
      site.site.phone = fd.get("phone");
      site.footer.copyright = fd.get("copyright");
      AhooraStore.site.save(site);
      AhooraUtils.toast("هدر/فوتر ذخیره شد");
    });

    document.getElementById("saveMenu")?.addEventListener("click", () => {
      try {
        const menu = JSON.parse(document.getElementById("menuJson").value);
        const site = AhooraStore.site.get();
        site.menu = menu;
        AhooraStore.site.save(site);
        AhooraUtils.toast("منو ذخیره شد");
      } catch {
        AhooraUtils.toast("JSON نامعتبر", "error");
      }
    });

    document.getElementById("couponForm")?.addEventListener("submit", (e) => {
      e.preventDefault();
      const fd = new FormData(e.target);
      const content = AhooraStore.content.get();
      content.coupons.push({
        id: AhooraStore.uid("c"),
        code: String(fd.get("code")).toUpperCase(),
        type: fd.get("type"),
        value: Number(fd.get("value")),
        minAmount: Number(fd.get("minAmount") || 0),
        appliesTo: "all",
        startDate: "2026-01-01",
        endDate: "2026-12-31",
        usageLimit: 100,
        usedCount: 0,
        active: true,
      });
      AhooraStore.content.save(content);
      AhooraUtils.toast("کد افزوده شد");
      render();
    });

    app.querySelectorAll(".approve-r").forEach((btn) => {
      btn.onclick = () => {
        const content = AhooraStore.content.get();
        const r = content.reviews.find((x) => x.id === btn.dataset.id);
        if (r) {
          content.testimonials.unshift({
            id: AhooraStore.uid("t"),
            name: r.name,
            rating: r.rating,
            text: r.text,
            active: true,
            approved: true,
          });
          content.reviews = content.reviews.filter((x) => x.id !== r.id);
          AhooraStore.content.save(content);
          render();
        }
      };
    });
    app.querySelectorAll(".del-r").forEach((btn) => {
      btn.onclick = () => {
        const content = AhooraStore.content.get();
        content.reviews = content.reviews.filter((x) => x.id !== btn.dataset.id);
        AhooraStore.content.save(content);
        render();
      };
    });

    document.getElementById("shippingForm")?.addEventListener("submit", (e) => {
      e.preventDefault();
      try {
        const shipping = JSON.parse(document.getElementById("shippingJson").value);
        const site = AhooraStore.site.get();
        site.shipping = shipping;
        AhooraStore.site.save(site);
        AhooraUtils.toast("ارسال ذخیره شد");
      } catch {
        AhooraUtils.toast("JSON نامعتبر", "error");
      }
    });

    document.getElementById("settingsForm")?.addEventListener("submit", (e) => {
      e.preventDefault();
      const fd = new FormData(e.target);
      const site = AhooraStore.site.get();
      site.site.name = fd.get("name");
      site.site.tagline = fd.get("tagline");
      site.site.address = fd.get("address");
      site.site.email = fd.get("email");
      site.site.whatsapp = fd.get("whatsapp");
      site.site.workingHours = fd.get("workingHours");
      site.site.seo.title = fd.get("seoTitle");
      site.site.seo.description = fd.get("seoDesc");
      site.payment.gateway = fd.get("gateway");
      site.sms.adminPhone = fd.get("adminPhone");
      AhooraStore.site.save(site);
      AhooraUtils.toast("تنظیمات ذخیره شد");
    });

    document.getElementById("catForm")?.addEventListener("submit", (e) => {
      e.preventDefault();
      const fd = new FormData(e.target);
      const data = AhooraStore.products.all();
      data.categories.push({
        id: AhooraStore.uid("cat"),
        slug: fd.get("slug"),
        title: fd.get("title"),
        active: true,
        parentId: fd.get("parentId") || null,
        order: data.categories.length + 1,
      });
      AhooraStore.products.save(data);
      AhooraUtils.toast("دسته افزوده شد");
      render();
    });
  }

  function bindProductForm() {
    document.getElementById("productForm")?.addEventListener("submit", (e) => {
      e.preventDefault();
      const fd = new FormData(e.target);
      const existing = fd.get("id") ? AhooraStore.products.byId(fd.get("id")) : null;
      const product = {
        ...(existing || { images: ["assets/img/product-phone.svg"], variants: [], specs: {}, rating: 0, reviewCount: 0 }),
        id: fd.get("id") || AhooraStore.uid("p"),
        title: fd.get("title"),
        slug: fd.get("slug"),
        brand: fd.get("brand"),
        model: fd.get("model"),
        categoryId: fd.get("categoryId"),
        price: Number(fd.get("price")),
        discountPrice: fd.get("discountPrice") ? Number(fd.get("discountPrice")) : null,
        stock: Number(fd.get("stock")),
        description: fd.get("description"),
        active: !!fd.get("active"),
        featured: !!fd.get("featured"),
        bestseller: !!fd.get("bestseller"),
        seo: { title: fd.get("seoTitle"), description: fd.get("seoDesc") },
      };
      AhooraStore.products.upsert(product);
      AhooraUtils.toast("محصول ذخیره شد");
      render();
    });
  }

  function bindServiceForm() {
    document.getElementById("serviceForm")?.addEventListener("submit", (e) => {
      e.preventDefault();
      const fd = new FormData(e.target);
      const existing = fd.get("id") ? AhooraStore.services.byId(fd.get("id")) : null;
      const svc = {
        ...(existing || { priceByModel: {}, category: "other" }),
        id: fd.get("id") || AhooraStore.uid("svc"),
        title: fd.get("title"),
        slug: fd.get("slug"),
        type: fd.get("type"),
        basePrice: Number(fd.get("basePrice")),
        dailyCapacity: Number(fd.get("dailyCapacity")),
        durationMinutes: Number(fd.get("durationMinutes")),
        description: fd.get("description"),
        active: !!fd.get("active"),
        requiresAddress: !!fd.get("requiresAddress") || fd.get("type") === "onsite",
        requiresMedia: !!fd.get("requiresMedia"),
        seo: { title: fd.get("seoTitle"), description: fd.get("seoDesc") },
      };
      AhooraStore.services.upsert(svc);
      AhooraUtils.toast("خدمت ذخیره شد");
      render();
    });
  }

  render();

  // Live alert when new requests arrive (same browser / multi-tab)
  function checkPendingAlerts() {
    if (!requireAuth()) return;
    const count = AhooraWorkflow.pendingCount();
    if (lastPending >= 0 && count > lastPending) {
      AhooraWorkflow.playAlert();
      AhooraUtils.toast(`درخواست جدید آمده است (${count})`);
      if (view === "pending" || view === "dashboard" || view === "bookings" || view === "orders") {
        render();
      } else {
        // refresh shell badge only
        render();
      }
    } else if (lastPending >= 0 && count !== lastPending && (view === "pending" || view === "dashboard")) {
      render();
    }
    lastPending = count;
  }

  lastPending = AhooraWorkflow.pendingCount();
  setInterval(checkPendingAlerts, 2500);
  window.addEventListener("storage", (e) => {
    if (e.key === "ah_admin_ping" || e.key === "ah_bookings" || e.key === "ah_orders") {
      checkPendingAlerts();
    }
  });
});
