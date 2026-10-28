const AhooraLayout = (() => {
  // clear leftover dark-theme preference from older builds
  try {
    document.documentElement.removeAttribute("data-theme");
    localStorage.removeItem("ahoora-theme");
  } catch {
    /* ignore */
  }

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

    const drawerIcons = {
      home: "bi-house",
      shop: "bi-phone",
      services: "bi-tools",
      booking: "bi-calendar-check",
      about: "bi-info-circle",
      contact: "bi-telephone",
      blog: "bi-journal-text",
    };
    const drawerAccent = {
      home: "#0071e3",
      shop: "#7b61ff",
      services: "#d4a017",
      booking: "#0071e3",
      about: "#6e6e73",
      contact: "#16a34a",
      blog: "#6994c7",
    };
    const defaultCat = menu.find((item) => (item.children || []).length) || menu[0];
    const drawerCards = (item) => {
      const links = (item.children || []).length ? item.children : [{ title: item.title, url: item.url }];
      return links
        .map((link) => `<a class="ah-drawer-card" href="${resolveUrl(link.url)}">${link.title}</a>`)
        .join("");
    };
    const railHtml = menu
      .map((item) => {
        const active = item.id === defaultCat?.id ? " is-active" : "";
        const icon = drawerIcons[item.id] || "bi-grid";
        const color = drawerAccent[item.id] || "#0071e3";
        const direct = item.id === "blog" ? ` data-href="${resolveUrl(item.url)}"` : "";
        return `<button type="button" class="ah-drawer-cat${active}" data-cat="${item.id}"${direct}>
          <span class="ah-drawer-cat-icon" style="color:${color}"><i class="bi ${icon}" aria-hidden="true"></i></span>
          <span class="ah-drawer-cat-label">${item.title}</span>
        </button>`;
      })
      .join("");
    const cardSetsHtml = menu
      .map((item) => {
        const active = item.id === defaultCat?.id ? " is-active" : "";
        return `<div class="ah-drawer-cardset${active}" data-cat="${item.id}">${drawerCards(item)}</div>`;
      })
      .join("");

    const desktopNavHtml = menu
      .map((item) => {
        const children = item.children || [];
        if (!children.length) {
          return `<li class="ah-desk-item">
            <a class="ah-desk-link" href="${resolveUrl(item.url)}">${item.title}</a>
          </li>`;
        }
        return `<li class="ah-desk-item ah-desk-item--drop">
          <a class="ah-desk-link" href="${resolveUrl(item.url)}">
            ${item.title}
            <i class="bi bi-chevron-down ah-desk-caret" aria-hidden="true"></i>
          </a>
          <ul class="ah-desk-drop" role="list">
            ${children
              .map((c) => `<li><a href="${resolveUrl(c.url)}">${c.title}</a></li>`)
              .join("")}
          </ul>
        </li>`;
      })
      .join("");

    host.innerHTML = `
      <div class="ah-nav-overlay" id="ahNavOverlay" hidden></div>
      <aside class="ah-drawer" id="ahDrawer" aria-hidden="true" aria-label="دسته‌بندی">
        <div class="ah-drawer-head">
          <button type="button" class="ah-drawer-close" id="ahDrawerClose" aria-label="بستن منو"><i class="bi bi-x-lg"></i></button>
          <a class="ah-logo ah-logo-drawer" href="${resolveUrl("index.html")}">
            <img src="${resolveUrl(site.site.logo || "assets/img/logo-ahura-tell.png")}" alt="${site.site.name}" width="240" height="86" decoding="async">
          </a>
        </div>
        <div class="ah-drawer-split">
          <nav class="ah-drawer-rail" aria-label="دسته‌ها">${railHtml}</nav>
          <div class="ah-drawer-cards">${cardSetsHtml}</div>
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
                <a href="${resolveUrl("index.html")}" class="ah-techno-logo ah-brand" aria-label="${site.site.name}">
                  <span class="ah-brand-name" aria-hidden="true">
                    <span class="ah-brand-word">${(() => {
                      const [first, ...rest] = String(site.site.name || "اهورا تل").split(" ");
                      return `<b>${first}</b>${rest.length ? ` <span>${rest.join(" ")}</span>` : ""}`;
                    })()}</span>
                  </span>
                </a>
              </div>
              <form class="ah-techno-search" action="${resolveUrl("pages/shop.html")}" method="get" role="search">
                <input type="search" name="q" placeholder="جستجو در کالای مورد نظر" autocomplete="off">
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
          <nav class="ah-desktop-nav" aria-label="منوی اصلی">
            <ul class="ah-desk-list">${desktopNavHtml}</ul>
          </nav>
        </div>
      </header>

      <nav class="ah-bottom-nav" aria-label="میانبر پایین">
        <a href="${resolveUrl("index.html")}" data-nav="home"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 11.1 12 4.4l8 6.7V20a.8.8 0 0 1-.8.8h-5v-6.1H9.8V20.8H4.8A.8.8 0 0 1 4 20v-8.9z" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/></svg><span>خانه</span></a>
        <button type="button" data-nav="categories" id="ahBottomCats" aria-label="دسته‌بندی"><svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="8" cy="8" r="2.05" fill="none" stroke="currentColor" stroke-width="1.6"/><circle cx="16" cy="8" r="2.05" fill="none" stroke="currentColor" stroke-width="1.6"/><circle cx="8" cy="16" r="2.05" fill="none" stroke="currentColor" stroke-width="1.6"/><circle cx="16" cy="16" r="2.05" fill="none" stroke="currentColor" stroke-width="1.6"/></svg><span>دسته‌بندی</span></button>
        <a href="${resolveUrl("pages/cart.html")}" data-nav="cart"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6.5 7.2h14l-1.5 8.2H8.2L6.5 7.2z" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/><path d="M6.5 7.2 5.4 4.2H2.6" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/><circle cx="9.3" cy="19.2" r="1.15" fill="currentColor" stroke="none"/><circle cx="16.8" cy="19.2" r="1.15" fill="currentColor" stroke="none"/></svg><span>سبد خرید</span><span class="ah-bottom-cart-count" id="ahBottomCartCount" hidden>۰</span></a>
        <a href="${resolveUrl("pages/battery.html")}" data-nav="battery"><svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3.2" y="7.2" width="15.2" height="9.6" rx="2" fill="none" stroke="currentColor" stroke-width="1.6"/><path d="M18.4 10.1h1.5a.9.9 0 0 1 .9.9v2a.9.9 0 0 1-.9.9h-1.5" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/><path d="M10.2 9.7 8.2 12.2h2.3L9.1 14.6" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg><span>تعویض باتری</span></a>
        <a href="${resolveUrl("pages/account.html")}" data-nav="account"><svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="8.1" r="3" fill="none" stroke="currentColor" stroke-width="1.6"/><path d="M5.8 19.2c1.2-2.8 3.4-4.1 6.2-4.1s5 1.3 6.2 4.1" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg><span>ورود</span></a>
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
      document.getElementById("ahBottomCats")?.classList.remove("is-active");
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
      document.getElementById("ahBottomCats")?.classList.add("is-active");
    };

    const toggleMenu = () => {
      if (drawer?.classList.contains("open")) closeMenu();
      else openMenu();
    };
    burger?.addEventListener("click", toggleMenu);
    document.getElementById("ahBottomCats")?.addEventListener("click", toggleMenu);
    overlay?.addEventListener("click", closeMenu);
    closeBtn?.addEventListener("click", closeMenu);

    const showCategory = (id) => {
      drawer?.querySelectorAll(".ah-drawer-cat").forEach((btn) => {
        btn.classList.toggle("is-active", btn.dataset.cat === id);
      });
      drawer?.querySelectorAll(".ah-drawer-cardset").forEach((set) => {
        set.classList.toggle("is-active", set.dataset.cat === id);
      });
    };

    drawer?.querySelectorAll(".ah-drawer-cat").forEach((btn) => {
      btn.addEventListener("click", () => {
        if (btn.dataset.href) {
          location.href = btn.dataset.href;
          return;
        }
        showCategory(btn.dataset.cat);
      });
    });

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") closeMenu();
    });

  }

  function highlightBottomNav() {
    const path = (location.pathname || "").replace(/\\/g, "/").toLowerCase();
    document.querySelectorAll(".ah-bottom-nav [data-nav]").forEach((a) => {
      const key = a.dataset.nav;
      let active = false;
      if (key === "home" && (path.endsWith("/") || path.endsWith("/index.html"))) active = true;
      if (key === "cart" && path.includes("/cart")) active = true;
      if (key === "battery" && path.includes("/battery")) active = true;
      if (key === "account" && path.includes("/account")) active = true;
      a.classList.toggle("active", active);
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
    const s = site.site || {};
    const footer = site.footer || {};

    const cols = (footer.columns || [])
      .map((col, i) => {
        const panelId = `ahFooterCol${i}`;
        const links = (col.links || [])
          .map((l) => `<li><a href="${resolveUrl(l.url)}">${l.title}</a></li>`)
          .join("");
        return `<div class="ah-footer-col">
          <button type="button" class="ah-footer-col-toggle" aria-expanded="false" aria-controls="${panelId}">
            <span>${col.title}</span>
            <i class="bi bi-chevron-down" aria-hidden="true"></i>
          </button>
          <div class="ah-footer-col-panel" id="${panelId}" aria-hidden="true">
            <ul>${links}</ul>
          </div>
        </div>`;
      })
      .join("");

    const social = (site.social || [])
      .map(
        (item) =>
          `<a class="ah-footer-social-btn" href="${item.url}" target="_blank" rel="noopener" aria-label="${item.title}"><i class="bi ${item.icon}"></i></a>`
      )
      .join("");

    const highlights = (footer.highlights || [])
      .map(
        (h) => `<div class="ah-footer-highlight">
          <span class="ah-footer-highlight-icon" aria-hidden="true"><i class="bi ${h.icon || "bi-check-circle"}"></i></span>
          <span class="ah-footer-highlight-text">
            <strong>${h.title}</strong>
            <small>${h.text || ""}</small>
          </span>
        </div>`
      )
      .join("");

    const phone = s.phone || "";
    const phoneDisplay = phone.replace(/(\d{3})(\d+)/, "$1-$2");

    host.innerHTML = `
      <footer class="ah-footer">
        <div class="ah-footer-inner">
          <div class="ah-footer-top">
            <a class="ah-footer-logo" href="${resolveUrl("index.html")}">
              <img src="${resolveUrl("assets/img/logo-ahura-footer.png")}" alt="${s.name || ""}" width="652" height="202" loading="lazy" decoding="async">
            </a>
            <button type="button" class="ah-footer-topbtn" id="ahFooterTopBtn" aria-label="بازگشت به بالا">
              <i class="bi bi-chevron-up" aria-hidden="true"></i>
              <span>بازگشت به بالا</span>
            </button>
          </div>

          <div class="ah-footer-section ah-footer-links">
            <div class="ah-footer-grid">${cols}</div>
          </div>

          <div class="ah-footer-section ah-footer-contact">
            <div class="ah-footer-col ah-footer-contact-acc">
              <button type="button" class="ah-footer-col-toggle" aria-expanded="false" aria-controls="ahFooterContactPanel">
                <span>ارتباط با ما</span>
                <i class="bi bi-chevron-down" aria-hidden="true"></i>
              </button>
              <div class="ah-footer-col-panel" id="ahFooterContactPanel" aria-hidden="true">
                <div class="ah-footer-contact-grid">
                  <div class="ah-footer-contact-block">
                    <h4 class="ah-footer-contact-heading">ارتباط با ما</h4>
                    <p class="ah-footer-meta"><span>تلفن:</span> <a href="tel:${phone}" dir="ltr">${phoneDisplay}</a></p>
                    <p class="ah-footer-meta"><span>ایمیل:</span> <a href="mailto:${s.email || ""}">${s.email || ""}</a></p>
                    <p class="ah-footer-meta"><span>آدرس:</span> ${s.address || ""}</p>
                    <p class="ah-footer-meta"><span>ساعات کاری:</span> ${s.workingHours || ""}</p>
                  </div>
                  <div class="ah-footer-contact-block">
                    <h4 class="ah-footer-contact-heading">شبکه های اجتماعی</h4>
                    <div class="ah-footer-social">${social}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          ${
            highlights
              ? `<div class="ah-footer-section ah-footer-highlights">${highlights}</div>`
              : ""
          }

          <div class="ah-footer-bottom">
            <div class="ah-footer-years">۱۴۰۵–۱۳۹۹</div>
            <p>${footer.copyright || ""}</p>
          </div>
        </div>
      </footer>`;

    const topBtn = document.getElementById("ahFooterTopBtn");
    if (topBtn) {
      topBtn.addEventListener("click", () => {
        window.scrollTo({ top: 0, behavior: "smooth" });
      });
    }

    const setFooterColOpen = (col, open) => {
      const btn = col.querySelector(".ah-footer-col-toggle");
      const panel = col.querySelector(".ah-footer-col-panel");
      col.classList.toggle("is-open", open);
      if (btn) btn.setAttribute("aria-expanded", open ? "true" : "false");
      if (panel) panel.setAttribute("aria-hidden", open ? "false" : "true");
    };

    const syncFooterColsForViewport = () => {
      const desktop = window.matchMedia("(min-width: 992px)").matches;
      host.querySelectorAll(".ah-footer-col").forEach((col) => {
        const keepOpen = desktop || col.classList.contains("ah-footer-contact-acc");
        setFooterColOpen(col, keepOpen);
      });
    };

    host.querySelectorAll(".ah-footer-col-toggle").forEach((btn) => {
      btn.addEventListener("click", () => {
        if (window.matchMedia("(min-width: 992px)").matches) return;
        const col = btn.closest(".ah-footer-col");
        if (!col) return;
        const willOpen = !col.classList.contains("is-open");
        if (willOpen) {
          host.querySelectorAll(".ah-footer-col.is-open").forEach((openCol) => {
            if (openCol !== col) setFooterColOpen(openCol, false);
          });
        }
        setFooterColOpen(col, willOpen);
      });
    });

    syncFooterColsForViewport();
    window.matchMedia("(min-width: 992px)").addEventListener("change", syncFooterColsForViewport);
  }

  function updateCartBadge() {
    const n = AhooraStore.cart.count();
    const label = toPersianDigits(n);
    const techno = document.getElementById("ahTechnoCartCount");
    if (techno) techno.textContent = label;
    const bottom = document.getElementById("ahBottomCartCount");
    if (bottom) {
      bottom.textContent = label;
      bottom.hidden = n < 1;
    }
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
