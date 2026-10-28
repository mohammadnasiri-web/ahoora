document.addEventListener("DOMContentLoaded", async () => {
  await AhooraLayout.boot();
  const site = AhooraStore.site.get();
  const content = AhooraStore.content.get();
  const root = document.getElementById("home-root");
  const sections = (site.homepage?.sections || []).filter((s) => s.active).sort((a, b) => a.order - b.order);

  // Blue campaign slide: headline + pill on the start side, product label in the middle,
  // product cut-outs with "burst" lines on the end side, white hand-drawn doodles behind
  const skySlideHtml = (slide) => {
    const cloud = (x, y, s) =>
      `<path transform="translate(${x} ${y}) scale(${s})" d="M4 44h104c12 0 16-16 5-22 2-15-15-24-28-15-7-17-33-19-41-2-15-6-30 6-24 19-13 1-19 20-16 20z"/>`;
    const tree = (x, y, s) =>
      `<path transform="translate(${x} ${y}) scale(${s})" d="M0 0l-12 22h8l-12 20h9l-13 22h40l-13-22h9l-12-20h8zM0 64v14"/>`;
    return `<a class="ah-dk-slide ah-sky" href="${AhooraLayout.resolveUrl(slide.url)}">
      <svg class="ah-sky-doodles" viewBox="0 0 2000 450" preserveAspectRatio="xMidYMid meet" aria-hidden="true">
        <defs>
          <filter id="ahChalk" x="-5%" y="-5%" width="110%" height="110%">
            <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed="4"/>
            <feDisplacementMap in="SourceGraphic" scale="3.2"/>
          </filter>
        </defs>
        <g fill="none" stroke="#fff" stroke-width="5" stroke-linecap="round" stroke-linejoin="round" filter="url(#ahChalk)">
          <path d="M96 112c-44-24-12-66 92-72 76-4 104 22 70 46"/>
          <path d="M78 98c-6 30 30 42 66 30"/><path d="M128 116l16 12-18 8"/>
          ${cloud(50, 196, 1)}
          ${cloud(965, 222, 1.05)}
          ${cloud(1440, 222, 0.95)}
          <circle cx="1224" cy="210" r="22"/>
          <path d="M1224 170v-14M1224 264v-14M1184 210h-14M1278 210h-14M1196 182l-10-10M1262 248l-10-10M1252 182l10-10M1186 248l10-10"/>
          <path d="M1010 418l140-88 52 16 124-92 96 78 40-14 140 60"/>
          <path d="M1326 254l-22 46 28-10 14 30 12-36 24 18"/>
          <path d="M1180 396l138-96"/><path d="M1352 316l26 46"/>
          <path d="M1168 412c180-14 330 4 480 36"/>
          ${tree(1372, 372, 0.85)}
          ${tree(1422, 362, 1)}
          ${tree(1462, 350, 1.15)}
        </g>
        <text x="174" y="88" text-anchor="middle" fill="#fff" font-family="Vazirmatn, sans-serif" font-weight="800" font-size="36" letter-spacing="3">AHURA</text>
      </svg>
      <span class="ah-sky-inner">
        <span class="ah-sky-text">
          <strong class="ah-sky-title">${slide.title}</strong>
          <span class="ah-sky-cta">${slide.cta}</span>
        </span>
        <span class="ah-sky-label" dir="ltr" aria-hidden="true">
          <i class="ti ti-device-mobile"></i>
          <span><b>${slide.label}</b><small>${slide.sublabel}</small></span>
        </span>
        <span class="ah-sky-media" aria-hidden="true">
          <svg class="ah-sky-burst" viewBox="0 0 220 160" fill="none" stroke="#fff" stroke-width="5" stroke-linecap="round">
            <path d="M70 52L52 20M104 40l2-36M138 50l22-30M160 80l34-10M40 82L8 70"/>
          </svg>
          ${slide.images
            .map((src) => `<img src="${AhooraLayout.resolveUrl(src)}" alt="" width="360" height="360" decoding="async" draggable="false">`)
            .join("")}
        </span>
      </span>
    </a>`;
  };

  // Orange festival slide: big number + two lines on the start side, a row of podiums on the end side
  const podiumSlideHtml = (slide) => {
    // left-to-right on screen; item/box heights are % of the banner height
    const pods = [
      { image: "assets/img/products/powerbank.png", item: 30, box: 40, width: 17, tilt: -14 },
      { image: "assets/img/products/iphone-15.png", item: 44, box: 22, width: 12, tilt: -6 },
      { gift: true, item: 34, box: 32, width: 20 },
      { image: "assets/img/products/airpods-pro.png", item: 26, box: 46, width: 15, tilt: 4 },
      { image: "assets/img/products/charger-20w.png", item: 24, box: 20, width: 14, tilt: 8 },
    ];
    const sparkles = [
      [12, 18], [28, 8], [46, 14], [63, 6], [80, 20], [36, 34], [70, 32],
    ];
    return `<a class="ah-dk-slide ah-pod-slide" href="${AhooraLayout.resolveUrl(slide.url)}">
      <span class="ah-pod-glow" aria-hidden="true"></span>
      <span class="ah-pod-inner">
        <span class="ah-pod-text">
          <span class="ah-pod-number">${slide.number}</span>
          <span class="ah-pod-lines">
            <strong>${slide.title}</strong>
            <span>${slide.text}</span>
          </span>
        </span>
        <span class="ah-pod-stage" aria-hidden="true">
          ${sparkles
            .map(([x, y], i) => `<span class="ah-pod-spark" style="left:${x}%;top:${y}%;animation-delay:${i * 0.45}s"></span>`)
            .join("")}
          ${pods
            .map(
              (p, i) => `<span class="ah-pod" style="--item:${p.item}%;--box:${p.box}%;--w:${p.width}%;--tilt:${p.tilt || 0}deg;--delay:${i * 0.35}s">
                <span class="ah-pod-item">${
                  p.gift
                    ? `<span class="ah-gift"><span class="ah-gift-bow"></span><span class="ah-gift-lid"></span><span class="ah-gift-body"></span></span>`
                    : `<img src="${AhooraLayout.resolveUrl(p.image)}" alt="" width="200" height="200" loading="lazy" decoding="async" draggable="false">`
                }</span>
                <span class="ah-pod-box"></span>
              </span>`
            )
            .join("")}
        </span>
      </span>
    </a>`;
  };

  // Three campaign banners (Technolife-style ad row), drawn in HTML/CSS around the product cut-outs
  const adRowHtml = () => {
    const ads = [
      {
        theme: "sky",
        brand: "AirPods Pro",
        title: "صدای خاص خودت",
        text: "ایرپاد اصل با گارانتی",
        cta: "خرید",
        url: "pages/product.html?slug=airpods-pro",
        image: "assets/img/products/airpods-pro.png",
        deco: `<svg viewBox="0 0 200 120" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
          <path d="M18 34c0-8 7-13 14-11 3-7 14-8 18 0 7-1 11 5 9 11H18z"/>
          <circle cx="150" cy="30" r="9"/><path d="M150 12v-6M150 54v-6M132 30h-6M174 30h-6M138 18l-4-4M166 46l-4-4M162 18l4-4M134 46l4-4"/>
          <path d="M110 112l26-38 14 18 10-12 26 32"/>
        </svg>`,
      },
      {
        theme: "wave",
        brand: "شارژر ۲۰ وات",
        title: "شارژ سریع، خیال راحت",
        text: "آداپتور USB-C اصل",
        cta: "خرید",
        url: "pages/product.html?slug=charger-20w",
        image: "assets/img/products/charger-20w.png",
        deco: `<svg viewBox="0 0 400 120" fill="none" stroke="currentColor" stroke-width="7" stroke-linecap="round" preserveAspectRatio="none">
          <path d="M0 60c20-50 40-50 60 0s40 50 60 0 40-50 60 0 40 50 60 0 40-50 60 0 40 50 60 0 40-50 40-30"/>
        </svg>`,
      },
      {
        theme: "amber",
        brand: "اهورا تل",
        title: "باتری نو، گوشی سرحال",
        text: "تعویض باتری در محل شما",
        cta: "رزرو نوبت",
        url: "pages/booking.html",
        image: "assets/img/products/battery.png",
        deco: "",
      },
    ];
    return `<section class="ah-adrow" aria-label="پیشنهادهای ویژه">
      <div class="ah-adrow-grid">
        ${ads
          .map(
            (ad) => `<a class="ah-ad ah-ad--${ad.theme}" href="${AhooraLayout.resolveUrl(ad.url)}">
              ${ad.deco ? `<span class="ah-ad-deco" aria-hidden="true">${ad.deco}</span>` : ""}
              <span class="ah-ad-text">
                <span class="ah-ad-brand">${ad.brand}</span>
                <strong class="ah-ad-title">${ad.title}</strong>
                <span class="ah-ad-desc">${ad.text}</span>
                <span class="ah-ad-cta">${ad.cta}</span>
              </span>
              <img class="ah-ad-media" src="${AhooraLayout.resolveUrl(ad.image)}" alt="" width="240" height="240" loading="lazy" decoding="async">
            </a>`
          )
          .join("")}
      </div>
    </section>`;
  };

  const html = sections
    .map((sec) => {
      if (sec.type === "hero" && sec.layout === "banner") {
        // Banners are drawn in HTML/CSS (sharp at any width) around the product cut-outs
        const slides = [
          {
            // blue campaign banner with white chalk doodles
            layout: "sky",
            title: "گوشیت هنوز جون داره...",
            cta: "رزرو نوبت",
            label: "AHURA Battery",
            sublabel: "Onsite Service",
            url: "pages/booking.html",
            images: ["assets/img/products/iphone-15.png", "assets/img/products/battery.png"],
          },
          {
            // orange festival banner: products on podiums around a gift box, gently animated
            layout: "podium",
            number: "۲۰٪",
            title: "جشنواره اهورا تل",
            text: "تخفیف لوازم جانبی اصل",
            url: "pages/shop.html?cat=accessories",
          },
        ];
        return `<section class="ah-dk" aria-roledescription="carousel" aria-label="اسلایدر">
          <div class="ah-dk-viewport" id="ahDkViewport">
            <div class="ah-dk-track" id="ahDkTrack">
              ${slides
                .map((slide, index) =>
                  slide.layout === "sky"
                    ? skySlideHtml(slide)
                    : slide.layout === "podium"
                    ? podiumSlideHtml(slide)
                    : `<a class="ah-dk-slide ah-dk-banner ah-dk-banner--${slide.theme}" href="${AhooraLayout.resolveUrl(slide.url)}">
                    <span class="ah-dk-banner-inner">
                      <span class="ah-dk-banner-text">
                        <span class="ah-dk-banner-eyebrow">${slide.eyebrow}</span>
                        <strong class="ah-dk-banner-title">${slide.title}</strong>
                        <span class="ah-dk-banner-desc">${slide.text}</span>
                        <span class="ah-dk-banner-cta">${slide.cta} <i class="ti ti-arrow-left" aria-hidden="true"></i></span>
                      </span>
                      <span class="ah-dk-banner-media" aria-hidden="true">
                        ${slide.images
                          .map(
                            (src) =>
                              `<img src="${AhooraLayout.resolveUrl(src)}" alt="" width="320" height="320" ${index === 0 ? "" : 'loading="lazy"'} decoding="async" draggable="false">`
                          )
                          .join("")}
                      </span>
                    </span>
                  </a>`
                )
                .join("")}
            </div>
          </div>
          <div class="ah-dk-arrows">
            <button type="button" class="ah-dk-arrow" id="ahDkPrev" aria-label="اسلاید قبلی"><i class="ti ti-chevron-right" aria-hidden="true"></i></button>
            <button type="button" class="ah-dk-arrow" id="ahDkNext" aria-label="اسلاید بعدی"><i class="ti ti-chevron-left" aria-hidden="true"></i></button>
          </div>
          <div class="ah-dk-dots" id="ahDkDots">
            ${slides
              .map(
                (slide, index) =>
                  `<button type="button" class="ah-dk-dot${index === 0 ? " is-active" : ""}" data-index="${index}" aria-label="${slide.title}"></button>`
              )
              .join("")}
          </div>
        </section>`;
      }
      if (sec.type === "hero") {
        const theme = sec.bg || "dark";
        const bgLayer = sec.bgImage
          ? `<div class="ah-hero-bg" style="background-image:url('${AhooraLayout.resolveUrl(sec.bgImage)}')" aria-hidden="true"></div>`
          : "";
        return `<section class="ah-hero ah-hero-${theme} ah-hero-apple">
          ${bgLayer}
          <div class="ah-hero-content">
            <h2 class="ah-hero-eyebrow">${sec.title}</h2>
            ${sec.subtitle ? `<p class="ah-hero-title">${sec.subtitle}</p>` : ""}
            ${sec.text ? `<p class="ah-hero-text">${sec.text}</p>` : ""}
            <div class="ah-hero-actions">
              ${
                sec.ctaPrimary
                  ? `<a class="ah-btn ah-btn-apple" href="${AhooraLayout.resolveUrl(sec.ctaPrimary.url)}">${sec.ctaPrimary.text}</a>`
                  : ""
              }
              ${
                sec.ctaSecondary
                  ? `<a class="ah-btn ah-btn-apple-outline" href="${AhooraLayout.resolveUrl(sec.ctaSecondary.url)}">${sec.ctaSecondary.text}</a>`
                  : ""
              }
            </div>
          </div>
          <div class="ah-hero-media">
            <img src="${AhooraLayout.resolveUrl(sec.image)}" alt="${sec.title}" width="820" height="420" loading="eager" decoding="async">
          </div>
        </section>`;
      }
      if (sec.type === "tiles") {
        const tileMeta = [
          { icon: "ti-map-pin-filled", theme: "dark" },
          { icon: "ti-tools", theme: "light" },
          { icon: "ti-headphones", theme: "blue" },
          { icon: "ti-shopping-bag-check", theme: "graphite" },
        ];
        // Technolife-style shortcut circles: a product cut-out on a soft tinted disc
        const quickLinks = [
          { url: AhooraLayout.resolveUrl("pages/booking.html"), label: "رزرو نوبت", image: "assets/img/products/battery.png", tint: "#e8f1fc" },
          { url: AhooraLayout.resolveUrl("pages/shop.html"), label: "فروشگاه", image: "assets/img/products/iphone-15.png", tint: "#fdecef" },
          { url: AhooraLayout.resolveUrl("pages/services.html"), label: "خدمات", image: "assets/img/products/lcd.png", tint: "#eaf6ee" },
          { url: AhooraLayout.resolveUrl("pages/account.html"), label: "پیگیری", image: "assets/img/products/airpods-pro.png", tint: "#fff4e0" },
          { url: AhooraLayout.resolveUrl("pages/faq.html"), label: "سوالات", image: "assets/img/products/charger-20w.png", tint: "#efedfb" },
          { url: `tel:${site.site.phone}`, label: "تماس", image: "assets/img/products/powerbank.png", tint: "#e6f6f8" },
        ];
        return `<div class="ah-quick" aria-label="میانبرها">
            ${quickLinks
              .map(
                (q) => `<a href="${q.url}"><span class="ah-quick-icon" style="--quick-tint:${q.tint}" aria-hidden="true"><img src="${AhooraLayout.resolveUrl(q.image)}" alt="" width="96" height="96" loading="lazy" decoding="async"></span><span class="ah-quick-label">${q.label}</span></a>`
              )
              .join("")}
          </div>
          <section class="ah-tiles" aria-label="دسترسی سریع">
          ${(sec.items || [])
            .map((t, i) => {
              const meta = tileMeta[i % tileMeta.length];
              const theme =
                t.bg === "#f5f5f7" || t.bg === "#fff"
                  ? "light"
                  : t.bg === "#0071e3"
                    ? "blue"
                    : t.bg === "#1d1d1f"
                      ? "graphite"
                      : meta.theme;
              return `<a class="ah-tile ah-tile--${theme}" href="${AhooraLayout.resolveUrl(t.url)}">
              <div class="ah-tile-body">
                <span class="ah-tile-icon" aria-hidden="true"><i class="ti ${meta.icon}"></i></span>
                <h3>${t.title}</h3>
                <p>${t.text}</p>
                <span class="ah-tile-link">بیشتر بدانید <i class="ti ti-chevron-left" aria-hidden="true"></i></span>
              </div>
              <div class="ah-tile-glow" aria-hidden="true"></div>
            </a>`;
            })
            .join("")}
        </section>${adRowHtml()}`;
      }
      if (sec.type === "banners") {
        const items = (sec.items || []).slice(0, 3);
        if (!items.length) return "";
        return `<section class="ah-promos" aria-label="پیشنهادهای ویژه">
          <div class="ah-promos-grid">
            ${items
              .map((b) => {
                const href = AhooraLayout.resolveUrl(b.url);
                if (b.image) {
                  return `<a class="ah-promo-card ah-promo-card--image" href="${href}">
                    <img src="${AhooraLayout.resolveUrl(b.image)}" alt="${b.title}" width="577" height="267" loading="lazy" decoding="async">
                  </a>`;
                }
                return `<a class="ah-promo-card" href="${href}" style="--promo-bg:${b.bg};--promo-fg:${b.color || "#fff"}">
                  <div class="ah-promo-text">
                    ${b.eyebrow ? `<span class="ah-promo-eyebrow">${b.eyebrow}</span>` : ""}
                    <h3>${b.title}</h3>
                    ${b.text ? `<p>${b.text}</p>` : ""}
                    ${b.cta ? `<span class="ah-promo-btn">${b.cta}</span>` : ""}
                  </div>
                  ${
                    b.productImage
                      ? `<img class="ah-promo-media" src="${AhooraLayout.resolveUrl(b.productImage)}" alt="" width="220" height="220" loading="lazy" decoding="async">`
                      : ""
                  }
                </a>`;
              })
              .join("")}
          </div>
        </section>`;
      }
      if (sec.type === "deals") {
        const all = AhooraStore.products.list({}).filter((p) => p.stock > 0);
        const offOf = (p) => (p.discountPrice && p.price ? Math.round(((p.price - p.discountPrice) / p.price) * 100) : 0);
        // discounted items first (biggest discount leading), then bestsellers to fill the row
        const items = all
          .slice()
          .sort((a, b) => offOf(b) - offOf(a) || Number(!!b.bestseller) - Number(!!a.bestseller))
          .slice(0, sec.limit || 10);
        if (!items.length) return "";
        const nf = new Intl.NumberFormat("fa-IR");
        return `<section class="ah-deals" aria-label="${sec.title}">
          <div class="ah-deals-box">
            <div class="ah-deals-head">
              <h2><i class="ti ti-flame" aria-hidden="true"></i> ${sec.title}</h2>
              <a href="${AhooraLayout.resolveUrl("pages/shop.html")}">نمایش همه <i class="ti ti-chevron-left" aria-hidden="true"></i></a>
            </div>
            <div class="ah-deals-body">
              <button type="button" class="ah-row-arrow is-prev" data-row-prev aria-label="محصولات قبلی" hidden><i class="ti ti-chevron-right" aria-hidden="true"></i></button>
              <div class="ah-deals-track" data-row-track>
                ${items
                  .map((p) => {
                    const off = offOf(p);
                    const price = p.discountPrice || p.price;
                    return `<a class="ah-deal-card" href="${AhooraLayout.resolveUrl(`pages/product.html?slug=${encodeURIComponent(p.slug)}`)}">
                      <span class="ah-deal-badge">${sec.badge || sec.title}</span>
                      <span class="ah-deal-media"><img src="${AhooraLayout.resolveUrl(p.images?.[0] || "assets/img/products/iphone-15.png")}" alt="${p.title}" width="200" height="200" loading="lazy" decoding="async"></span>
                      <span class="ah-deal-title">${p.title}</span>
                      <span class="ah-deal-price">
                        ${off ? `<span class="ah-deal-off">٪ ${AhooraUtils.toFaDigits(off)}</span>` : "<span></span>"}
                        <span class="ah-deal-amount">
                          <span><strong>${nf.format(price)}</strong> <small>تومان</small></span>
                          ${off ? `<del>${nf.format(p.price)}</del>` : ""}
                        </span>
                      </span>
                      <span class="ah-deal-timer">
                        <span class="ah-deal-timer-label"><i class="ti ti-stopwatch" aria-hidden="true"></i> زمان باقی مانده</span>
                        <span class="ah-deal-countdown" data-deal-ends="${p.dealEndsAt || ""}" dir="ltr">--:--:--</span>
                      </span>
                    </a>`;
                  })
                  .join("")}
              </div>
              <button type="button" class="ah-row-arrow is-next" data-row-next aria-label="محصولات بعدی"><i class="ti ti-chevron-left" aria-hidden="true"></i></button>
            </div>
          </div>
        </section>`;
      }
      if (sec.type === "benefits") {
        return `<section class="ah-section">
          <div class="container-ah">
            <h2 class="ah-section-title">${sec.title}</h2>
            <div class="ah-benefits">
              ${(sec.items || [])
                .map(
                  (b) => `<div class="ah-benefit">
                  <i class="bi ${b.icon}" aria-hidden="true"></i>
                  <h3>${b.title}</h3>
                  <p>${b.text}</p>
                </div>`
                )
                .join("")}
            </div>
          </div>
        </section>`;
      }
      if (sec.type === "testimonials") {
        const items = (content.testimonials || []).filter((t) => t.active && t.approved);
        return `<section class="ah-section ah-section--testimonials">
          <div class="container-ah">
            <h2 class="ah-section-title">${sec.title}</h2>
            <div class="row g-3">
              ${items
                .map(
                  (t) => `<div class="col-md-4"><article class="ah-testimonial">
                  <div class="ah-stars" aria-label="امتیاز ${t.rating}">${AhooraUtils.stars(t.rating)}</div>
                  <p class="mt-2 mb-3">${t.text}</p>
                  <strong>${t.name}</strong>
                </article></div>`
                )
                .join("")}
            </div>
          </div>
        </section>`;
      }
      if (sec.type === "faq") {
        const faqs = (content.faqs || [])
          .filter((f) => f.active)
          .sort((a, b) => a.order - b.order)
          .slice(0, sec.limit || 5);
        return `<section class="ah-section ah-home-faq">
          <div class="container-ah ah-home-faq-grid">
            <div class="ah-home-faq-intro">
              <span class="ah-home-faq-eyebrow"><i class="ti ti-help-circle" aria-hidden="true"></i> پاسخ سوالات شما</span>
              <h2 class="ah-section-title">${sec.title}</h2>
              <p>پرتکرارترین سوالات درباره تعمیر، تعویض باتری، رزرو و پرداخت. جواب سوالتان را پیدا نکردید؟ با ما تماس بگیرید.</p>
              <div class="ah-home-faq-actions">
                <a class="ah-btn ah-btn-primary" href="${AhooraLayout.resolveUrl("pages/faq.html")}">همه سوالات</a>              </div>
            </div>
            <div class="accordion ah-accordion ah-home-faq-list" id="homeFaq">
              ${faqs
                .map(
                  (f, i) => `<div class="accordion-item">
                  <h3 class="accordion-header">
                    <button class="accordion-button ${i ? "collapsed" : ""}" type="button" data-bs-toggle="collapse" data-bs-target="#hf${f.id}">${f.question}</button>
                  </h3>
                  <div id="hf${f.id}" class="accordion-collapse collapse ${i ? "" : "show"}" data-bs-parent="#homeFaq">
                    <div class="accordion-body">${f.answer}</div>
                  </div>
                </div>`
                )
                .join("")}
            </div>
          </div>
        </section>`;
      }
      return "";
    })
    .join("");

  // Featured products strip (exactly 4)
  let featured = AhooraStore.products.list({ featured: true }).slice(0, 4);
  if (featured.length < 4) {
    const ids = new Set(featured.map((p) => p.id));
    const extras = AhooraStore.products
      .list({ bestseller: true })
      .concat(AhooraStore.products.list({}))
      .filter((p) => !ids.has(p.id));
    for (const p of extras) {
      if (featured.length >= 4) break;
      featured.push(p);
      ids.add(p.id);
    }
  }
  const productsHtml = featured.length
    ? `<section class="ah-section ah-featured">
        <div class="container-ah">
          <div class="ah-featured-head">
            <h2 class="ah-section-title">محصولات ویژه</h2>
            <a class="ah-featured-more" href="pages/shop.html?featured=1">مشاهده همه <i class="ti ti-chevron-left" aria-hidden="true"></i></a>
          </div>
          <div class="ah-featured-grid">
            ${featured
              .map((p) => {
                const price = p.discountPrice || p.price;
                const stock = AhooraUtils.stockLabel(p.stock);
                const off =
                  p.discountPrice && p.price
                    ? Math.round(((p.price - p.discountPrice) / p.price) * 100)
                    : 0;
                return `<a class="ah-card-product ah-card-product--featured" href="pages/product.html?slug=${p.slug}">
                  <div class="media">
                    ${off ? `<span class="ah-card-badge">٪${AhooraUtils.toFaDigits(off)} تخفیف</span>` : ""}
                    <img src="${p.images[0]}" alt="${p.title}" loading="lazy" width="180" height="180">
                  </div>
                  <div class="body">
                    <span class="ah-card-brand">${p.brand || ""}</span>
                    <h3>${p.title}</h3>
                    <div class="ah-price-row">
                      <div class="ah-price">${AhooraUtils.formatPrice(price)}</div>
                      ${p.discountPrice ? `<span class="old">${AhooraUtils.formatPrice(p.price)}</span>` : ""}
                    </div>
                    <div class="ah-card-foot">
                      <span class="ah-stock ${stock.cls}">${stock.text}</span>
                      <span class="ah-card-cta">خرید <i class="ti ti-arrow-left" aria-hidden="true"></i></span>
                    </div>
                  </div>
                </a>`;
              })
              .join("")}
          </div>
        </div>
      </section>`
    : "";

  // Latest blog posts carousel (desktop only, Technolife-style)
  const posts = typeof AhooraBlog !== "undefined" ? AhooraBlog.list().slice(0, 8) : [];
  const blogHref = (slug) => AhooraLayout.resolveUrl("pages/blog.html") + (slug ? `?slug=${encodeURIComponent(slug)}` : "");
  const blogHtml = posts.length
    ? `<section class="ah-blogrow" aria-label="آخرین مطالب وبلاگ">
        <div class="ah-blogrow-box">
          <div class="ah-blogrow-head">
            <h2>از وبلاگ اهورا تل</h2>
            <a href="${blogHref()}">نمایش بیشتر در بلاگ <i class="ti ti-chevron-left" aria-hidden="true"></i></a>
          </div>
          <div class="ah-blogrow-body">
            <button type="button" class="ah-blogrow-arrow is-prev" data-row-prev aria-label="مطالب قبلی" hidden><i class="ti ti-chevron-right" aria-hidden="true"></i></button>
            <div class="ah-blogrow-track" data-row-track>
              ${posts
                .map(
                  (post) => `<a class="ah-blogrow-card" href="${blogHref(post.slug)}">
                    <span class="ah-blogrow-media">${AhooraBlog.cover(post, AhooraLayout.resolveUrl)}</span>
                    <span class="ah-blogrow-title">${post.title}</span>
                  </a>`
                )
                .join("")}
            </div>
            <button type="button" class="ah-blogrow-arrow is-next" data-row-next aria-label="مطالب بعدی"><i class="ti ti-chevron-left" aria-hidden="true"></i></button>
          </div>
        </div>
      </section>`
    : "";

  root.innerHTML = html + productsHtml + blogHtml;

  // Deal countdowns: a product's own dealEndsAt if set, otherwise the daily deal ends at midnight
  const countdowns = [...document.querySelectorAll("[data-deal-ends]")];
  if (countdowns.length) {
    const pad = (n) => String(n).padStart(2, "0");
    const endOf = (el) => {
      const own = Date.parse(el.dataset.dealEnds);
      if (own > Date.now()) return own;
      const midnight = new Date();
      midnight.setHours(24, 0, 0, 0);
      return midnight.getTime();
    };
    const tick = () => {
      countdowns.forEach((el) => {
        const left = Math.max(0, Math.floor((endOf(el) - Date.now()) / 1000));
        const text = `${pad(Math.floor(left / 3600))}:${pad(Math.floor((left % 3600) / 60))}:${pad(left % 60)}`;
        el.textContent = AhooraUtils.toFaDigits(text);
      });
    };
    tick();
    window.setInterval(tick, 1000);
  }

  // Horizontal card rows (deals, blog): arrows scroll one card at a time
  document.querySelectorAll("[data-row-track]").forEach((track) => {
    const body = track.parentElement;
    const prev = body.querySelector("[data-row-prev]");
    const next = body.querySelector("[data-row-next]");
    const step = () => {
      const card = track.firstElementChild;
      const gap = parseFloat(getComputedStyle(track).columnGap) || 0;
      return card ? card.offsetWidth + gap : track.clientWidth;
    };
    // RTL: scrollLeft runs from 0 (start, right edge) to negative values
    const syncArrows = () => {
      const pos = Math.abs(track.scrollLeft);
      const max = track.scrollWidth - track.clientWidth;
      prev.hidden = pos < 4;
      next.hidden = pos > max - 4;
    };
    prev.addEventListener("click", () => track.scrollBy({ left: step(), behavior: "smooth" }));
    next.addEventListener("click", () => track.scrollBy({ left: -step(), behavior: "smooth" }));
    track.addEventListener("scroll", syncArrows, { passive: true });
    window.addEventListener("resize", syncArrows);
    syncArrows();
  });

  const dkViewport = document.getElementById("ahDkViewport");
  const dkTrack = document.getElementById("ahDkTrack");
  if (dkViewport && dkTrack) {
    const slides = [...dkTrack.querySelectorAll(".ah-dk-slide")];
    const dots = [...document.querySelectorAll("#ahDkDots .ah-dk-dot")];
    let index = 0;
    let paused = false;
    let dragging = false;
    let moved = false;
    let startX = 0;
    let dragX = 0;

    const paint = (animate) => {
      const width = dkViewport.clientWidth;
      dkTrack.style.transition = animate ? "transform 0.55s cubic-bezier(0.22, 0.61, 0.36, 1)" : "none";
      dkTrack.style.transform = `translate3d(${index * width + dragX}px, 0, 0)`;
      dots.forEach((dot, i) => dot.classList.toggle("is-active", i === index));
    };

    const goTo = (next, animate = true) => {
      index = (next + slides.length) % slides.length;
      dragX = 0;
      paint(animate);
    };

    let resumeTimer;
    const jump = (next) => {
      paused = true;
      goTo(next);
      window.clearTimeout(resumeTimer);
      resumeTimer = window.setTimeout(() => {
        paused = false;
      }, 5000);
    };

    dots.forEach((dot) => {
      dot.addEventListener("click", () => jump(Number(dot.dataset.index)));
    });
    document.getElementById("ahDkPrev")?.addEventListener("click", () => jump(index - 1));
    document.getElementById("ahDkNext")?.addEventListener("click", () => jump(index + 1));

    dkViewport.addEventListener("pointerdown", (event) => {
      if (event.pointerType === "mouse" && event.button !== 0) return;
      dragging = true;
      moved = false;
      paused = true;
      startX = event.clientX;
      dragX = 0;
      dkViewport.setPointerCapture(event.pointerId);
      paint(false);
    });

    dkViewport.addEventListener("pointermove", (event) => {
      if (!dragging) return;
      dragX = event.clientX - startX;
      if (Math.abs(dragX) > 6) moved = true;
      paint(false);
    });

    const endDrag = () => {
      if (!dragging) return;
      dragging = false;
      const width = dkViewport.clientWidth;
      if (dragX > 48) goTo(index + 1);
      else if (dragX < -48) goTo(index - 1);
      else goTo(index);
      window.setTimeout(() => {
        paused = false;
        moved = false;
      }, 700);
    };

    dkViewport.addEventListener("pointerup", endDrag);
    dkViewport.addEventListener("pointercancel", endDrag);

    slides.forEach((slide) => {
      slide.addEventListener("click", (event) => {
        if (moved) event.preventDefault();
      });
      slide.addEventListener("dragstart", (event) => event.preventDefault());
    });

    window.addEventListener("resize", () => paint(false));
    paint(false);

    window.setInterval(() => {
      if (paused || dragging || document.hidden) return;
      goTo(index + 1);
    }, 4000);
  }

  AhooraUtils.injectSchema({
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: site.site.name,
    url: window.location.href,
    potentialAction: {
      "@type": "SearchAction",
      target: AhooraLayout.resolveUrl("pages/shop.html") + "?q={search_term_string}",
      "query-input": "required name=search_term_string",
    },
  });
});
