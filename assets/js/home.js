document.addEventListener("DOMContentLoaded", async () => {
  await AhooraLayout.boot();
  const site = AhooraStore.site.get();
  const content = AhooraStore.content.get();
  const root = document.getElementById("home-root");
  const sections = (site.homepage?.sections || []).filter((s) => s.active).sort((a, b) => a.order - b.order);

  const html = sections
    .map((sec) => {
      if (sec.type === "hero") {
        const theme = sec.bg || "dark";
        const bgImg = AhooraLayout.resolveUrl(
          sec.bgImage || (theme === "dark" ? "assets/img/hero-bg-dark.svg" : "assets/img/hero-bg-light.svg")
        );
        return `<section class="ah-hero ah-hero-${theme} ah-hero-apple">
          <div class="ah-hero-bg" style="background-image:url('${bgImg}')" aria-hidden="true"></div>
          <div class="ah-hero-content">
            <h2 class="ah-hero-eyebrow">${sec.title}</h2>
            <p class="ah-hero-title">${sec.subtitle || ""}</p>
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
          { icon: "bi-geo-alt", theme: "dark" },
          { icon: "bi-tools", theme: "light" },
          { icon: "bi-headphones", theme: "blue" },
          { icon: "bi-bag-check", theme: "graphite" },
        ];
        return `<div class="ah-quick" aria-label="میانبرها">
            <a href="${AhooraLayout.resolveUrl("pages/booking.html")}"><i class="bi bi-calendar-check"></i>رزرو نوبت</a>
            <a href="${AhooraLayout.resolveUrl("pages/shop.html")}"><i class="bi bi-bag"></i>فروشگاه</a>
            <a href="tel:${site.site.phone}"><i class="bi bi-telephone"></i>تماس</a>
            <a href="${AhooraLayout.resolveUrl("pages/services.html")}"><i class="bi bi-tools"></i>خدمات</a>
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
        return `<section class="ah-section" style="background:var(--ah-bg)">
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
          <div class="container-ah" style="max-width:760px">
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

  // Featured products strip
  const featured = AhooraStore.products.list({ featured: true }).slice(0, 4);
  const productsHtml = featured.length
    ? `<section class="ah-section">
        <div class="container-ah">
          <h2 class="ah-section-title">محصولات ویژه</h2>
          <div class="ah-grid">
            ${featured
              .map((p) => {
                const price = p.discountPrice || p.price;
                const stock = AhooraUtils.stockLabel(p.stock);
                return `<a class="ah-card-product" href="pages/product.html?slug=${p.slug}">
                  <div class="media"><img src="${p.images[0]}" alt="${p.title}" loading="lazy" width="160" height="160"></div>
                  <div class="body">
                    <h3>${p.title}</h3>
                    <div class="ah-price">${AhooraUtils.formatPrice(price)}${p.discountPrice ? `<span class="old">${AhooraUtils.formatPrice(p.price)}</span>` : ""}</div>
                    <div class="ah-stock ${stock.cls}">${stock.text}</div>
                  </div>
                </a>`;
              })
              .join("")}
          </div>
        </div>
      </section>`
    : "";

  root.innerHTML = html + productsHtml;

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
