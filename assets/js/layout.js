const AhooraLayout = (() => {
  function resolveUrl(url) {
    if (!url || url.startsWith("http") || url.startsWith("#")) return url;
    const prefix = AhooraUtils.pathPrefix();
    if (url.startsWith("pages/") || url.startsWith("admin/") || url.startsWith("assets/") || url === "index.html") {
      return prefix + url;
    }
    return url;
  }

  function renderNav() {
    const host = document.getElementById("ah-header");
    if (!host) return;
    const site = AhooraStore.site.get();
    const menu = (site.menu || []).slice().sort((a, b) => a.order - b.order);

    const drawerHtml = menu
      .map((item) => {
        const children = item.children || [];
        const main = `<a class="ah-drawer-link" href="${resolveUrl(item.url)}">${item.title}</a>`;
        if (!children.length) return `<li>${main}</li>`;
        return `<li>
          ${main}
          <ul class="ah-drawer-sub">
            ${children.map((c) => `<li><a href="${resolveUrl(c.url)}">${c.title}</a></li>`).join("")}
          </ul>
        </li>`;
      })
      .join("");

    host.innerHTML = `
      <div class="ah-nav-overlay" id="ahNavOverlay" hidden></div>
      <aside class="ah-drawer" id="ahDrawer" aria-hidden="true" aria-label="منوی موبایل">
        <div class="ah-drawer-head">
          <a class="ah-logo ah-logo-drawer" href="${resolveUrl("index.html")}">
            <img src="${resolveUrl(site.site.logo || "assets/img/logo-ahoora.jpg")}" alt="${site.site.name}" width="120" height="48" decoding="async">
          </a>
          <button type="button" class="ah-drawer-close" id="ahDrawerClose" aria-label="بستن منو"><i class="bi bi-x-lg"></i></button>
        </div>
        <ul class="ah-drawer-list">${drawerHtml}</ul>
        <div class="ah-drawer-foot">
          <a class="ah-btn ah-btn-primary w-100" href="${resolveUrl(site.header?.ctaLink || "pages/booking.html")}">${site.header?.ctaText || "رزرو آنلاین"}</a>
          <a class="ah-drawer-phone" href="tel:${site.site.phone}" dir="ltr">${site.site.phone}</a>
        </div>
      </aside>

      <header class="ah-site-header">
        <div class="ah-techno">
          <div class="ah-techno-top">
            <div class="ah-techno-top-inner">
              <div class="ah-techno-brand">
                <button type="button" class="ah-techno-burger" id="ahBurger" aria-label="باز کردن منو" aria-expanded="false" aria-controls="ahDrawer">
                  <span class="ah-burger-lines" aria-hidden="true"></span>
                </button>
                <a href="${resolveUrl("index.html")}" class="ah-techno-logo">
                  <img src="${resolveUrl(site.site.logo || "assets/img/logo-ahoora.jpg")}" alt="${site.site.name}" width="140" height="48" decoding="async">
                </a>
              </div>
              <form class="ah-techno-search" action="${resolveUrl("pages/shop.html")}" method="get" role="search">
                <input type="search" name="q" placeholder="محصول، برند یا دسته مورد نظرتان را جستجو کنید" autocomplete="off">
                <button type="submit" aria-label="جستجو"><i class="bi bi-search"></i></button>
              </form>
              <div class="ah-techno-user">
                <a class="ah-techno-cart" href="${resolveUrl("pages/cart.html")}" aria-label="سبد خرید">
                  <i class="bi bi-cart3"></i>
                  <span class="ah-techno-cart-count" id="ahTechnoCartCount">۰</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </header>

      <nav class="ah-bottom-nav" aria-label="میانبر پایین">
        <a href="${resolveUrl("index.html")}" data-nav="home"><i class="bi bi-house"></i><span>خانه</span></a>
        <a href="${resolveUrl("pages/shop.html")}" data-nav="shop"><i class="bi bi-bag"></i><span>فروشگاه</span></a>
        <a class="cta" href="${resolveUrl("pages/booking.html")}" data-nav="booking"><i class="bi bi-calendar-check"></i><span>رزرو</span></a>
        <a href="${resolveUrl("pages/services.html")}" data-nav="services"><i class="bi bi-tools"></i><span>خدمات</span></a>
        <a href="${resolveUrl("pages/account.html")}" data-nav="account"><i class="bi bi-person"></i><span>حساب</span></a>
      </nav>`;

    document.body.classList.add("has-bottom-nav");
    bindHeaderEvents();
    highlightBottomNav();
    updateCartBadge();
  }

  function bindHeaderEvents() {
    const burger = document.getElementById("ahBurger");
    const drawer = document.getElementById("ahDrawer");
    const overlay = document.getElementById("ahNavOverlay");
    const closeBtn = document.getElementById("ahDrawerClose");

    const closeMenu = () => {
      drawer?.classList.remove("open");
      overlay?.classList.remove("show");
      if (overlay) overlay.hidden = true;
      if (drawer) drawer.setAttribute("aria-hidden", "true");
      document.body.classList.remove("menu-open");
      if (burger) {
        burger.setAttribute("aria-expanded", "false");
        burger.setAttribute("aria-label", "باز کردن منو");
        burger.classList.remove("is-open");
      }
    };

    const openMenu = () => {
      drawer?.classList.add("open");
      if (overlay) {
        overlay.hidden = false;
        overlay.classList.add("show");
      }
      if (drawer) drawer.setAttribute("aria-hidden", "false");
      document.body.classList.add("menu-open");
      if (burger) {
        burger.setAttribute("aria-expanded", "true");
        burger.setAttribute("aria-label", "بستن منو");
        burger.classList.add("is-open");
      }
    };

    burger?.addEventListener("click", () => {
      if (drawer?.classList.contains("open")) closeMenu();
      else openMenu();
    });
    overlay?.addEventListener("click", closeMenu);
    closeBtn?.addEventListener("click", closeMenu);

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") closeMenu();
    });
  }

  function highlightBottomNav() {
    const path = (location.pathname || "").replace(/\\/g, "/").toLowerCase();
    document.querySelectorAll(".ah-bottom-nav a").forEach((a) => {
      const key = a.dataset.nav;
      let active = false;
      if (key === "home" && (path.endsWith("/") || path.endsWith("/index.html"))) active = true;
      if (key === "shop" && path.includes("/shop")) active = true;
      if (key === "booking" && path.includes("/booking")) active = true;
      if (key === "services" && path.includes("/services")) active = true;
      if (key === "account" && path.includes("/account")) active = true;
      if (active) a.classList.add("active");
    });
  }

  function toPersianDigits(n) {
    return String(n).replace(/\d/g, (d) => "۰۱۲۳۴۵۶۷۸۹"[d]);
  }

  function renderPromo() {
    const host = document.getElementById("ah-promo");
    if (!host) return;
    const banner = (AhooraStore.site.get().banners || []).find((b) => b.active);
    if (!banner) {
      host.hidden = true;
      return;
    }
    host.hidden = false;
    host.innerHTML = `<div class="ah-promo"><strong>${banner.title}</strong> — ${banner.text} <a href="${resolveUrl(banner.url)}">مشاهده</a></div>`;
  }

  function renderFooter() {
    const host = document.getElementById("ah-footer");
    if (!host) return;
    const site = AhooraStore.site.get();
    const cols = (site.footer?.columns || [])
      .map(
        (col) => `<div>
          <h4>${col.title}</h4>
          <ul>${(col.links || []).map((l) => `<li><a href="${resolveUrl(l.url)}">${l.title}</a></li>`).join("")}</ul>
        </div>`
      )
      .join("");

    const social = (site.social || [])
      .map((s) => `<a href="${s.url}" target="_blank" rel="noopener" aria-label="${s.title}"><i class="bi ${s.icon}"></i></a>`)
      .join("");

    host.innerHTML = `
      <footer class="ah-footer">
        <div class="container-ah">
          <div class="ah-footer-grid">
            <div>
              <a class="ah-footer-logo" href="${resolveUrl("index.html")}">
                <img src="${resolveUrl(site.site.logo || "assets/img/logo-ahoora.jpg")}" alt="${site.site.name}" width="160" height="64" loading="lazy" decoding="async">
              </a>
              <p>${site.site.tagline}</p>
              <p>${site.site.address}</p>
              <p><a href="tel:${site.site.phone}" dir="ltr">${site.site.phone}</a></p>
              <p>${site.site.workingHours}</p>
              <div class="ah-social mt-2">${social}</div>
            </div>
            ${cols}
          </div>
          <div class="ah-footer-bottom">
            <span>${site.footer?.copyright || ""}</span>
            <span>${site.site.email}</span>
          </div>
        </div>
      </footer>`;
  }

  function updateCartBadge() {
    const n = AhooraStore.cart.count();
    const techno = document.getElementById("ahTechnoCartCount");
    if (techno) techno.textContent = toPersianDigits(n);
  }

  function applyOrgSchema() {
    const site = AhooraStore.site.get().site;
    AhooraUtils.injectSchema({
      "@context": "https://schema.org",
      "@type": "LocalBusiness",
      name: site.name,
      description: site.tagline,
      telephone: site.phone,
      email: site.email,
      address: {
        "@type": "PostalAddress",
        streetAddress: site.address,
        addressCountry: "IR",
      },
      url: window.location.origin + window.location.pathname.replace(/\/[^/]*$/, "/"),
    });
  }

  async function boot(options = {}) {
    try {
      await AhooraStore.init();
      renderNav();
      renderPromo();
      renderFooter();
      if (!options.skipChat && typeof AhooraChat !== "undefined") AhooraChat.mount();
      if (!options.skipSchema) applyOrgSchema();
      const site = AhooraStore.site.get();
      if (!site) throw new Error("تنظیمات سایت خالی است. localStorage را پاک کنید یا صفحه را یک‌بار رفرش کنید.");
      if (options.seo) {
        AhooraUtils.setMeta({
          title: options.seo.title || site.site.seo.title,
          description: options.seo.description || site.site.seo.description,
        });
      } else if (!document.title || document.title === "اهورا تل") {
        AhooraUtils.setMeta({ title: site.site.seo.title, description: site.site.seo.description });
      }
      document.dispatchEvent(new CustomEvent("ahoora:ready"));
    } catch (err) {
      console.error("[AhooraLayout.boot]", err);
      throw err;
    }
  }

  return { boot, renderNav, renderFooter, updateCartBadge, resolveUrl };
})();
