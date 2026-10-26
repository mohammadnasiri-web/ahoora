document.addEventListener("DOMContentLoaded", async () => {
  await AhooraLayout.boot();
  const site = AhooraStore.site.get();
  const content = AhooraStore.content.get();
  const root = document.getElementById("home-root");
  const sections = (site.homepage?.sections || []).filter((s) => s.active).sort((a, b) => a.order - b.order);

  const html = sections
    .map((sec) => {
      if (sec.type === "hero" && sec.layout === "banner") {
        const slides = [
          {
            image: sec.image || "assets/img/hero-banner.jpg",
            title: sec.title || "تعویض فوری باتری",
            url: "pages/services.html",
          },
          {
            image: "assets/img/hero-banner-2.jpg",
            title: "لوازم جانبی اصل",
            url: "pages/shop.html?cat=accessories",
          },
        ];
        return `<section class="ah-dk" aria-roledescription="carousel" aria-label="اسلایدر">
          <div class="ah-dk-viewport" id="ahDkViewport">
            <div class="ah-dk-track" id="ahDkTrack">
              ${slides
                .map(
                  (slide, index) => `<a class="ah-dk-slide" href="${AhooraLayout.resolveUrl(slide.url)}">
                    <img src="${AhooraLayout.resolveUrl(slide.image)}" alt="${slide.title}" width="1280" height="720" ${index === 0 ? 'fetchpriority="high"' : 'loading="lazy"'} decoding="async" draggable="false">
                  </a>`
                )
                .join("")}
            </div>
          </div>
          <div class="ah-dk-arrows">
            <button type="button" class="ah-dk-arrow" id="ahDkPrev" aria-label="اسلاید قبلی"><i class="bi bi-chevron-right" aria-hidden="true"></i></button>
            <button type="button" class="ah-dk-arrow" id="ahDkNext" aria-label="اسلاید بعدی"><i class="bi bi-chevron-left" aria-hidden="true"></i></button>
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
          { icon: "bi-geo-alt-fill", theme: "dark" },
          { icon: "bi-tools", theme: "light" },
          { icon: "bi-headphones", theme: "blue" },
          { icon: "bi-bag-check", theme: "graphite" },
        ];
        return `<div class="ah-quick" aria-label="میانبرها">
            <a href="${AhooraLayout.resolveUrl("pages/booking.html")}"><span class="ah-quick-icon" aria-hidden="true"><i class="bi bi-calendar-check"></i></span><span class="ah-quick-label">رزرو نوبت</span></a>
            <a href="${AhooraLayout.resolveUrl("pages/shop.html")}"><span class="ah-quick-icon" aria-hidden="true"><i class="bi bi-bag"></i></span><span class="ah-quick-label">فروشگاه</span></a>
            <a href="${AhooraLayout.resolveUrl("pages/services.html")}"><span class="ah-quick-icon" aria-hidden="true"><i class="bi bi-tools"></i></span><span class="ah-quick-label">خدمات</span></a>
            <a href="${AhooraLayout.resolveUrl("pages/account.html")}"><span class="ah-quick-icon" aria-hidden="true"><i class="bi bi-truck"></i></span><span class="ah-quick-label">پیگیری</span></a>
            <a href="${AhooraLayout.resolveUrl("pages/faq.html")}"><span class="ah-quick-icon" aria-hidden="true"><i class="bi bi-question-circle"></i></span><span class="ah-quick-label">سوالات</span></a>
            <a href="tel:${site.site.phone}"><span class="ah-quick-icon" aria-hidden="true"><i class="bi bi-telephone"></i></span><span class="ah-quick-label">تماس</span></a>
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
                <span class="ah-tile-icon" aria-hidden="true"><i class="bi ${meta.icon}"></i></span>
                <h3>${t.title}</h3>
                <p>${t.text}</p>
                <span class="ah-tile-link">بیشتر بدانید <i class="bi bi-chevron-left" aria-hidden="true"></i></span>
              </div>
              <div class="ah-tile-glow" aria-hidden="true"></div>
            </a>`;
            })
            .join("")}
        </section>`;
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
              <h2><i class="bi bi-fire" aria-hidden="true"></i> ${sec.title}</h2>
              <a href="${AhooraLayout.resolveUrl("pages/shop.html")}">نمایش همه <i class="bi bi-chevron-left" aria-hidden="true"></i></a>
            </div>
            <div class="ah-deals-body">
              <button type="button" class="ah-row-arrow is-prev" data-row-prev aria-label="محصولات قبلی" hidden><i class="bi bi-chevron-right" aria-hidden="true"></i></button>
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
                        <span class="ah-deal-timer-label"><i class="bi bi-stopwatch" aria-hidden="true"></i> زمان باقی مانده</span>
                        <span class="ah-deal-countdown" data-deal-ends="${p.dealEndsAt || ""}" dir="ltr">--:--:--</span>
                      </span>
                    </a>`;
                  })
                  .join("")}
              </div>
              <button type="button" class="ah-row-arrow is-next" data-row-next aria-label="محصولات بعدی"><i class="bi bi-chevron-left" aria-hidden="true"></i></button>
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
        return `<section class="ah-section">
          <div class="container-ah">
            <h2 class="ah-section-title">${sec.title}</h2>
            <div class="accordion ah-accordion" id="homeFaq">
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
            <div class="text-center mt-3"><a class="ah-btn ah-btn-ghost" href="pages/faq.html">همه سوالات ›</a></div>
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
            <a class="ah-featured-more" href="pages/shop.html?featured=1">مشاهده همه <i class="bi bi-chevron-left" aria-hidden="true"></i></a>
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
                      <span class="ah-card-cta">خرید <i class="bi bi-arrow-left" aria-hidden="true"></i></span>
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
            <a href="${blogHref()}">نمایش بیشتر در بلاگ <i class="bi bi-chevron-left" aria-hidden="true"></i></a>
          </div>
          <div class="ah-blogrow-body">
            <button type="button" class="ah-blogrow-arrow is-prev" data-row-prev aria-label="مطالب قبلی" hidden><i class="bi bi-chevron-right" aria-hidden="true"></i></button>
            <div class="ah-blogrow-track" data-row-track>
              ${posts
                .map(
                  (post) => `<a class="ah-blogrow-card" href="${blogHref(post.slug)}">
                    <span class="ah-blogrow-media"><img src="${AhooraLayout.resolveUrl(post.image)}" alt="" width="375" height="210" loading="lazy" decoding="async"></span>
                    <span class="ah-blogrow-title">${post.title}</span>
                  </a>`
                )
                .join("")}
            </div>
            <button type="button" class="ah-blogrow-arrow is-next" data-row-next aria-label="مطالب بعدی"><i class="bi bi-chevron-left" aria-hidden="true"></i></button>
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
