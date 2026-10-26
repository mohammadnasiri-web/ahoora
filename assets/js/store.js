/**
 * Ahoora Tel — local data store (JSON + localStorage)
 * Simulates dynamic CMS until backend API is connected.
 */
const AhooraStore = (() => {
  const KEYS = {
    site: "ah_site",
    products: "ah_products",
    services: "ah_services",
    content: "ah_content",
    cart: "ah_cart",
    user: "ah_user",
    orders: "ah_orders",
    bookings: "ah_bookings",
    capacity: "ah_capacity",
    users: "ah_users",
    admins: "ah_admins",
    smsLog: "ah_sms_log",
    payments: "ah_payments",
  };

  const base = () => {
    const path = (window.location.pathname || "").replace(/\\/g, "/");
    // file:// and http paths under /pages or /admin
    if (/\/(admin|pages)(\/|$)/i.test(path)) return "../";
    return "./";
  };

  async function loadSeed(key, file) {
    // 1) Prefer inline seed (works with file:// and http)
    if (window.AHOORA_SEED && window.AHOORA_SEED[key]) {
      return window.AHOORA_SEED[key];
    }
    // 2) Fallback to JSON fetch (needs local server)
    try {
      const res = await fetch(`${base()}data/${file}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } catch (err) {
      console.error("[AhooraStore] load failed:", file, err);
      throw new Error(
        `نتوانستیم ${file} را بخوانیم. اگر فایل را مستقیم باز کرده‌اید، seed.js لازم است؛ در غیر این صورت با npm start اجرا کنید.`
      );
    }
  }

  function get(key, fallback = null) {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch {
      return fallback;
    }
  }

  function set(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
  }

  async function init() {
    try {
      if (!get(KEYS.site)) set(KEYS.site, await loadSeed("site", "site.json"));
      if (!get(KEYS.products)) set(KEYS.products, await loadSeed("products", "products.json"));
      if (!get(KEYS.services)) set(KEYS.services, await loadSeed("services", "services.json"));
      if (!get(KEYS.content)) set(KEYS.content, await loadSeed("content", "content.json"));
      // ensure featured products + real product photos
      const productsData = get(KEYS.products);
      if (productsData?.products) {
        let pChanged = false;
        const photoMap = {
          "p-iphone15": "assets/img/products/iphone-15.png",
          "p-airpods": "assets/img/products/airpods-pro.png",
          "p-glass15": "assets/img/products/screen-glass.png",
          "p-charger": "assets/img/products/charger-20w.png",
          "p-case15": "assets/img/products/phone-case.png",
          "p-battery-iphone": "assets/img/products/battery.png",
          "p-lcd13": "assets/img/products/lcd.png",
          "p-powerbank": "assets/img/products/powerbank.png",
        };
        productsData.products.forEach((p) => {
          const photo = photoMap[p.id];
          const cur = String(p.images?.[0] || "");
          if (photo && (!cur || cur.endsWith(".svg") || cur.endsWith(".jpg") || cur.endsWith(".jpeg"))) {
            p.images = [photo];
            pChanged = true;
          }
        });
        const featuredCount = productsData.products.filter((p) => p.featured && p.active !== false).length;
        if (featuredCount < 4) {
          const glass = productsData.products.find((p) => p.id === "p-glass15");
          if (glass && !glass.featured) {
            glass.featured = true;
            pChanged = true;
          }
        }
        const priceFix = {
          "p-iphone15": {
            price: 108000000,
            discountPrice: 98500000,
            variants: { v1: 98500000, v2: 98500000, v3: 115000000 },
          },
          "p-airpods": { price: 28500000, discountPrice: null, variants: {} },
        };
        productsData.products.forEach((p) => {
          const fix = priceFix[p.id];
          if (!fix) return;
          const stalePhone = p.id === "p-iphone15" && Number(p.price) <= 52000000;
          const stalePods = p.id === "p-airpods" && Number(p.price) <= 12500000;
          if (!stalePhone && !stalePods) return;
          p.price = fix.price;
          p.discountPrice = fix.discountPrice;
          (p.variants || []).forEach((variant) => {
            if (fix.variants[variant.id] != null) variant.price = fix.variants[variant.id];
          });
          pChanged = true;
        });
        const batteryProduct = productsData.products.find((p) => p.id === "p-battery-iphone");
        if (batteryProduct) {
          batteryProduct.specs = batteryProduct.specs || {};
          if (batteryProduct.specs.warranty !== "۳ ماه") {
            batteryProduct.specs.warranty = "۳ ماه";
            pChanged = true;
          }
        }
        if (pChanged) set(KEYS.products, productsData);
      }
      const servicesData = get(KEYS.services);
      if (servicesData) {
        let sChanged = false;
        if (servicesData.visitFee !== 1500000) {
          servicesData.visitFee = 1500000;
          sChanged = true;
        }
        (servicesData.services || []).forEach((svc) => {
          if (svc.type === "onsite" && svc.visitFee !== 1500000) {
            svc.visitFee = 1500000;
            sChanged = true;
          }
          if (svc.category === "battery" && svc.warrantyMonths !== 3) {
            svc.warrantyMonths = 3;
            sChanged = true;
          }
          if (svc.category === "battery" && !String(svc.description || "").includes("۳ ماه")) {
            svc.description =
              svc.id === "svc-battery-iphone"
                ? "تعویض باتری انواع آیفون از مدل ۷ تا ۱۸ در محل مشتری. گارانتی باتری ۳ ماه است."
                : "تعویض باتری سامسونگ، شیائومی و سایر برندها در آدرس شما. گارانتی باتری ۳ ماه است.";
            sChanged = true;
          }
        });
        if (sChanged) set(KEYS.services, servicesData);
      }
      const contentData = get(KEYS.content);
      if (contentData?.faqs) {
        const faq = contentData.faqs.find((item) => item.id === "faq2");
        if (faq && !String(faq.answer || "").includes("۳ ماه")) {
          faq.answer = "باتری تعویض‌شده ۳ ماه گارانتی دارد. سایر قطعات اصلی هم با گارانتی کتبی ارائه می‌شوند.";
          set(KEYS.content, contentData);
        }
      }
      // migrate logo paths + Apple-style hero fields for older localStorage
      const siteData = get(KEYS.site);
      if (siteData?.site) {
        let changed = false;
        if (
          !siteData.site.logo ||
          String(siteData.site.logo).includes("logo.svg") ||
          String(siteData.site.logo).endsWith(".jpg") ||
          String(siteData.site.logo).includes("logo-ahoora.png")
        ) {
          siteData.site.logo = "assets/img/logo-ahura-tell.png";
          changed = true;
        }
        if (!siteData.site.logoMark) {
          siteData.site.logoMark = "assets/img/logo-mark.svg";
          changed = true;
        }
        (siteData.banners || []).forEach((b) => {
          if (b.id === "promo-1" && b.active) {
            b.active = false;
            changed = true;
          }
        });
        if (Array.isArray(siteData.menu) && !siteData.menu.some((item) => item.id === "blog")) {
          siteData.menu.push({
            id: "blog",
            title: "وبلاگ",
            url: "pages/blog.html",
            order: 7,
          });
          changed = true;
        }
        // phones category now opens the "mobile & accessories" landing page
        [...(siteData.menu || []).flatMap((item) => item.children || []), ...(siteData.footer?.columns || []).flatMap((col) => col.links || [])]
          .filter((link) => link.url === "pages/shop.html?cat=phones")
          .forEach((link) => {
            link.url = "pages/mobile.html";
            changed = true;
          });
        if (Array.isArray(siteData.menu)) {
          const servicesItem = siteData.menu.find((item) => item.id === "services");
          if (servicesItem) {
            servicesItem.children = servicesItem.children || [];
            const batteryChild = servicesItem.children.find(
              (child) => child.id === "device" || child.id === "battery" || String(child.url || "").includes("device.html")
            );
            if (batteryChild) {
              if (batteryChild.title !== "تعویض باتری" || batteryChild.url !== "pages/battery.html" || batteryChild.id !== "battery") {
                batteryChild.id = "battery";
                batteryChild.title = "تعویض باتری";
                batteryChild.url = "pages/battery.html";
                changed = true;
              }
            } else {
              servicesItem.children.push({
                id: "battery",
                title: "تعویض باتری",
                url: "pages/battery.html",
              });
              changed = true;
            }
          }
        }
        const serviceCol = (siteData.footer?.columns || []).find((col) => col.title === "خدمات");
        if (serviceCol) {
          const links = serviceCol.links || [];
          links.forEach((link) => {
            const url = String(link.url || "");
            if (url.includes("device.html") || link.title === "تعویض دیوایس" || (link.title === "تعویض باتری" && url.includes("booking"))) {
              link.title = "تعویض باتری";
              link.url = "pages/battery.html";
              changed = true;
            }
          });
          const seen = new Set();
          serviceCol.links = links.filter((link) => {
            if (!String(link.url || "").includes("battery.html")) return true;
            if (seen.has("battery")) {
              changed = true;
              return false;
            }
            seen.add("battery");
            return true;
          });
          if (!seen.has("battery")) {
            serviceCol.links.splice(Math.min(1, serviceCol.links.length), 0, {
              title: "تعویض باتری",
              url: "pages/battery.html",
            });
            changed = true;
          }
        }
        const heroes = siteData.homepage?.sections || [];
        // add newer homepage sections (promo banners, deals row) for older localStorage
        if (siteData.homepage) {
          const seedSections = window.AHOORA_SEED?.site?.homepage?.sections || [];
          ["promo-banners", "ahoora-time"].forEach((id) => {
            if (heroes.some((sec) => sec.id === id)) return;
            const sec = seedSections.find((s) => s.id === id);
            if (!sec) return;
            heroes.push(JSON.parse(JSON.stringify(sec)));
            changed = true;
          });
        }
        heroes.forEach((sec) => {
          if ((sec.type === "testimonials" || sec.id === "promo-banners") && sec.active) {
            sec.active = false;
            changed = true;
          }
          if (sec.type !== "hero") return;
          if (sec.id === "hero-battery") {
            const img = String(sec.image || "");
            if (sec.layout !== "banner" || !img.endsWith("hero-banner.jpg")) {
              sec.layout = "banner";
              sec.bg = "light";
              sec.bgImage = "";
              sec.image = "assets/img/hero-banner.jpg";
              sec.title = "تعویض فوری باتری";
              sec.subtitle = "";
              sec.text = "";
              sec.ctaPrimary = null;
              sec.ctaSecondary = null;
              changed = true;
            }
          }
          if (sec.id === "hero-shop" && sec.active) {
            sec.active = false;
            changed = true;
          }
        });
        // rename legacy footer column title to match Technolife
        if (Array.isArray(siteData.footer?.columns)) {
          siteData.footer.columns.forEach((col) => {
            if (col && col.title === "قوانین") {
              col.title = "قوانین و مقررات";
              changed = true;
            }
          });
        }
        // migrate footer to Technolife-style structure
        if (!siteData.footer?.highlights || (siteData.footer?.columns || []).length < 5) {
          siteData.footer = {
            ...(siteData.footer || {}),
            columns: [
              {
                title: "دسترسی سریع",
                links: [
                  { title: "فروشگاه", url: "pages/shop.html" },
                  { title: "گوشی موبایل", url: "pages/mobile.html" },
                  { title: "لوازم جانبی", url: "pages/shop.html?cat=accessories" },
                  { title: "قطعات تعمیراتی", url: "pages/shop.html?cat=parts" },
                  { title: "رزرو نوبت", url: "pages/booking.html" },
                ],
              },
              {
                title: "خدمات",
                links: [
                  { title: "تعمیر در محل", url: "pages/services.html?type=onsite" },
                  { title: "تعویض باتری", url: "pages/booking.html" },
                  { title: "تعمیر غیرحضوری", url: "pages/services.html?type=workshop" },
                  { title: "پیگیری سفارش", url: "pages/account.html" },
                ],
              },
              {
                title: "درباره ما",
                links: [
                  { title: "اهورا تل در یک نگاه", url: "pages/about.html" },
                  { title: "سوالات متداول", url: "pages/faq.html" },
                  { title: "تماس با ما", url: "pages/contact.html" },
                ],
              },
              {
                title: "پیش از خرید",
                links: [
                  { title: "راهنمای خرید", url: "pages/faq.html" },
                  { title: "شیوه ارسال", url: "pages/terms.html" },
                  { title: "گارانتی و اصالت", url: "pages/terms.html" },
                ],
              },
              {
                title: "پس از خرید",
                links: [
                  { title: "پیگیری سفارش", url: "pages/account.html" },
                  { title: "مرجوعی کالا", url: "pages/terms.html" },
                  { title: "پشتیبانی", url: "pages/contact.html" },
                ],
              },
              {
                title: "قوانین و مقررات",
                links: [
                  { title: "قوانین و شرایط", url: "pages/terms.html" },
                  { title: "حریم خصوصی", url: "pages/privacy.html" },
                ],
              },
            ],
            highlights: [
              { title: "تعمیر در محل", text: "سریع و تخصصی", icon: "bi-geo-alt" },
              { title: "گارانتی اصالت", text: "کالای اصل", icon: "bi-shield-check" },
              { title: "پشتیبانی", text: "همه روزه", icon: "bi-headset" },
            ],
            copyright:
              siteData.footer?.copyright ||
              "تمامی حقوق مادی و معنوی این سایت متعلق به اهورا تل می‌باشد.",
          };
          changed = true;
        }
        if (changed) set(KEYS.site, siteData);
      }
    } catch (err) {
      // Surface a visible error instead of a blank white page
      const box = document.createElement("div");
      box.setAttribute("role", "alert");
      box.style.cssText =
        "font-family:Tahoma,sans-serif;direction:rtl;padding:2rem;max-width:640px;margin:3rem auto;background:#fdecee;color:#b00020;border-radius:12px;line-height:1.7";
      box.innerHTML = `<strong>خطا در بارگذاری سایت</strong><p>${err.message || err}</p>
        <p>راه حل: در پوشه پروژه دستور <code>npm start</code> را بزنید و آدرس <code>http://localhost:5500</code> را باز کنید.</p>`;
      document.body.prepend(box);
      throw err;
    }
    if (!get(KEYS.cart)) set(KEYS.cart, []);
    if (!get(KEYS.orders)) set(KEYS.orders, []);
    if (!get(KEYS.bookings)) set(KEYS.bookings, []);
    if (!get(KEYS.capacity)) set(KEYS.capacity, {});
    if (!get(KEYS.smsLog)) set(KEYS.smsLog, []);
    if (!get(KEYS.payments)) set(KEYS.payments, []);
    if (!get(KEYS.admins)) {
      set(KEYS.admins, [
        {
          id: "admin1",
          username: "admin",
          password: "admin123",
          role: "superadmin",
          name: "مدیر اصلی",
        },
      ]);
    }
    if (!get(KEYS.users)) set(KEYS.users, []);
  }

  function resetToSeed() {
    Object.values(KEYS).forEach((k) => {
      if (k !== KEYS.admins) localStorage.removeItem(k);
    });
  }

  function uid(prefix = "id") {
    return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`;
  }

  function trackingCode() {
    return `AH${Date.now().toString().slice(-8)}`;
  }

  /* ---- Site / CMS ---- */
  const site = {
    get: () => get(KEYS.site),
    save: (data) => set(KEYS.site, data),
  };

  const products = {
    all: () => get(KEYS.products),
    save: (data) => set(KEYS.products, data),
    list: (filters = {}) => {
      const data = get(KEYS.products);
      let items = (data.products || []).filter((p) => p.active !== false);
      if (filters.includeInactive) items = data.products || [];
      if (filters.cat) {
        const cats = data.categories || [];
        const matchIds = new Set([filters.cat]);
        cats.filter((c) => c.parentId === filters.cat).forEach((c) => matchIds.add(c.id));
        items = items.filter((p) => matchIds.has(p.categoryId));
      }
      if (filters.brand) items = items.filter((p) => p.brand === filters.brand);
      if (filters.q) {
        const q = filters.q.toLowerCase();
        items = items.filter(
          (p) =>
            p.title.toLowerCase().includes(q) ||
            (p.brand || "").toLowerCase().includes(q) ||
            (p.model || "").toLowerCase().includes(q)
        );
      }
      if (filters.featured) items = items.filter((p) => p.featured);
      if (filters.bestseller) items = items.filter((p) => p.bestseller);
      if (filters.inStock) items = items.filter((p) => p.stock > 0);
      if (filters.minPrice != null) items = items.filter((p) => (p.discountPrice || p.price) >= filters.minPrice);
      if (filters.maxPrice != null) items = items.filter((p) => (p.discountPrice || p.price) <= filters.maxPrice);
      if (filters.sort === "price-asc") items.sort((a, b) => (a.discountPrice || a.price) - (b.discountPrice || b.price));
      if (filters.sort === "price-desc") items.sort((a, b) => (b.discountPrice || b.price) - (a.discountPrice || a.price));
      if (filters.sort === "newest") items = items.slice().reverse();
      return items;
    },
    bySlug: (slug) => (get(KEYS.products).products || []).find((p) => p.slug === slug),
    byId: (id) => (get(KEYS.products).products || []).find((p) => p.id === id),
    upsert: (product) => {
      const data = get(KEYS.products);
      const idx = data.products.findIndex((p) => p.id === product.id);
      if (idx >= 0) data.products[idx] = product;
      else {
        product.id = product.id || uid("p");
        data.products.push(product);
      }
      set(KEYS.products, data);
      return product;
    },
    remove: (id) => {
      const data = get(KEYS.products);
      data.products = data.products.filter((p) => p.id !== id);
      set(KEYS.products, data);
    },
    decreaseStock: (id, qty, variantId = null) => {
      const data = get(KEYS.products);
      const p = data.products.find((x) => x.id === id);
      if (!p) return false;
      if (variantId && p.variants?.length) {
        const v = p.variants.find((x) => x.id === variantId);
        if (!v || v.stock < qty) return false;
        v.stock -= qty;
        p.stock = p.variants.reduce((s, x) => s + x.stock, 0);
      } else {
        if (p.stock < qty) return false;
        p.stock -= qty;
      }
      set(KEYS.products, data);
      return true;
    },
  };

  const services = {
    all: () => get(KEYS.services),
    save: (data) => set(KEYS.services, data),
    list: (type) => {
      let items = (get(KEYS.services).services || []).filter((s) => s.active !== false);
      if (type) items = items.filter((s) => s.type === type);
      return items;
    },
    byId: (id) => (get(KEYS.services).services || []).find((s) => s.id === id),
    bySlug: (slug) => (get(KEYS.services).services || []).find((s) => s.slug === slug),
    upsert: (svc) => {
      const data = get(KEYS.services);
      const idx = data.services.findIndex((s) => s.id === svc.id);
      if (idx >= 0) data.services[idx] = svc;
      else {
        svc.id = svc.id || uid("svc");
        data.services.push(svc);
      }
      set(KEYS.services, data);
      return svc;
    },
  };

  const content = {
    get: () => get(KEYS.content),
    save: (data) => set(KEYS.content, data),
  };

  /* ---- Capacity (independent per service/day/slot) ---- */
  const capacity = {
    key: (serviceId, date, slot) => `${serviceId}|${date}|${slot || "day"}`,
    getMap: () => get(KEYS.capacity, {}),
    getUsed: (serviceId, date, slot = null) => {
      const map = get(KEYS.capacity, {});
      if (slot) return map[capacity.key(serviceId, date, slot)] || 0;
      return map[capacity.key(serviceId, date)] || 0;
    },
    canBook: (serviceId, date, slot) => {
      const svc = services.byId(serviceId);
      if (!svc) return false;
      const schedule = services.all().schedule;
      const dayUsed = capacity.getUsed(serviceId, date);
      if (dayUsed >= (svc.dailyCapacity || 0)) return false;
      const slotCap = schedule.slotCapacityDefault || 2;
      const slotUsed = capacity.getUsed(serviceId, date, slot);
      return slotUsed < slotCap;
    },
    reserve: (serviceId, date, slot) => {
      if (!capacity.canBook(serviceId, date, slot)) return false;
      const map = get(KEYS.capacity, {});
      const dayKey = capacity.key(serviceId, date);
      const slotKey = capacity.key(serviceId, date, slot);
      map[dayKey] = (map[dayKey] || 0) + 1;
      map[slotKey] = (map[slotKey] || 0) + 1;
      set(KEYS.capacity, map);
      return true;
    },
    release: (serviceId, date, slot) => {
      const map = get(KEYS.capacity, {});
      const dayKey = capacity.key(serviceId, date);
      const slotKey = capacity.key(serviceId, date, slot);
      if (map[dayKey]) map[dayKey] = Math.max(0, map[dayKey] - 1);
      if (map[slotKey]) map[slotKey] = Math.max(0, map[slotKey] - 1);
      set(KEYS.capacity, map);
    },
  };

  /* ---- Cart ---- */
  const cart = {
    get: () => get(KEYS.cart, []),
    save: (items) => set(KEYS.cart, items),
    count: () => get(KEYS.cart, []).reduce((s, i) => s + i.qty, 0),
    add: (item) => {
      const items = get(KEYS.cart, []);
      const idx = items.findIndex(
        (x) => x.productId === item.productId && x.variantId === (item.variantId || null)
      );
      if (idx >= 0) items[idx].qty += item.qty || 1;
      else items.push({ ...item, qty: item.qty || 1 });
      set(KEYS.cart, items);
      return items;
    },
    updateQty: (productId, variantId, qty) => {
      let items = get(KEYS.cart, []);
      items = items
        .map((x) => {
          if (x.productId === productId && x.variantId === (variantId || null)) x.qty = qty;
          return x;
        })
        .filter((x) => x.qty > 0);
      set(KEYS.cart, items);
      return items;
    },
    remove: (productId, variantId) => {
      const items = get(KEYS.cart, []).filter(
        (x) => !(x.productId === productId && x.variantId === (variantId || null))
      );
      set(KEYS.cart, items);
      return items;
    },
    clear: () => set(KEYS.cart, []),
  };

  /* ---- Orders & Bookings ---- */
  const orders = {
    list: () => get(KEYS.orders, []),
    save: (list) => set(KEYS.orders, list),
    add: (order) => {
      const list = get(KEYS.orders, []);
      list.unshift(order);
      set(KEYS.orders, list);
      return order;
    },
    update: (id, patch) => {
      const list = get(KEYS.orders, []);
      const idx = list.findIndex((o) => o.id === id);
      if (idx < 0) return null;
      list[idx] = { ...list[idx], ...patch, updatedAt: new Date().toISOString() };
      set(KEYS.orders, list);
      return list[idx];
    },
  };

  const bookings = {
    list: () => get(KEYS.bookings, []),
    add: (booking) => {
      const list = get(KEYS.bookings, []);
      list.unshift(booking);
      set(KEYS.bookings, list);
      return booking;
    },
    update: (id, patch) => {
      const list = get(KEYS.bookings, []);
      const idx = list.findIndex((b) => b.id === id);
      if (idx < 0) return null;
      const prev = list[idx];
      list[idx] = { ...prev, ...patch, updatedAt: new Date().toISOString() };
      if (
        (patch.status === "cancelled" || patch.status === "rejected") &&
        prev.status !== "cancelled" &&
        prev.status !== "rejected"
      ) {
        capacity.release(prev.serviceId, prev.date, prev.slot);
      }
      set(KEYS.bookings, list);
      return list[idx];
    },
  };

  const sameContact = (user, contact) => {
    const q = String(contact || "").trim();
    if (!q) return false;
    if (user.phone === q) return true;
    return Boolean(user.email) && user.email.toLowerCase() === q.toLowerCase();
  };

  const auth = {
    current: () => get(KEYS.user),
    findByContact: (contact) => get(KEYS.users, []).find((user) => sameContact(user, contact)) || null,
    login: (phone, password) => {
      const pass = String(password || "");
      const users = get(KEYS.users, []);
      const u = users.find((x) => sameContact(x, phone) && x.password === pass);
      if (!u) return null;
      set(KEYS.user, { id: u.id, name: u.name, phone: u.phone, email: u.email });
      return get(KEYS.user);
    },
    register: ({ name, phone, password, email }) => {
      const users = get(KEYS.users, []);
      if (users.some((u) => u.phone === phone)) return { error: "این شماره قبلاً ثبت شده است." };
      const user = { id: uid("u"), name, phone, password, email, addresses: [], createdAt: new Date().toISOString() };
      users.push(user);
      set(KEYS.users, users);
      set(KEYS.user, { id: user.id, name, phone, email });
      return { user: get(KEYS.user) };
    },
    logout: () => localStorage.removeItem(KEYS.user),
    adminLogin: (username, password) => {
      const admins = get(KEYS.admins, []);
      const a = admins.find((x) => x.username === username && x.password === password);
      if (!a) return null;
      const session = { id: a.id, username: a.username, role: a.role, name: a.name };
      sessionStorage.setItem("ah_admin", JSON.stringify(session));
      return session;
    },
    adminCurrent: () => {
      try {
        return JSON.parse(sessionStorage.getItem("ah_admin"));
      } catch {
        return null;
      }
    },
    adminLogout: () => sessionStorage.removeItem("ah_admin"),
  };

  return {
    KEYS,
    init,
    resetToSeed,
    uid,
    trackingCode,
    get,
    set,
    site,
    products,
    services,
    content,
    capacity,
    cart,
    orders,
    bookings,
    auth,
  };
})();
