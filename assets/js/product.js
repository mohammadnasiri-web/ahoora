document.addEventListener("DOMContentLoaded", async () => {
  await AhooraLayout.boot();
  const slug = AhooraUtils.qs("slug");
  const p = AhooraStore.products.bySlug(slug);
  const root = document.getElementById("productRoot");

  if (!p || p.active === false) {
    root.innerHTML = `<div class="ah-alert ah-alert-error">محصول یافت نشد یا غیرفعال است. <a href="shop.html">بازگشت به فروشگاه</a></div>`;
    return;
  }

  const price = p.discountPrice || p.price;
  const stock = AhooraUtils.stockLabel(p.stock);
  AhooraUtils.setMeta({
    title: p.seo?.title || `${p.title} | اهورا تل`,
    description: p.seo?.description || p.description,
  });

  const variants = p.variants || [];
  root.innerHTML = `
    <nav class="ah-breadcrumb"><a href="shop.html">فروشگاه</a> / ${p.title}</nav>
    <div class="row g-4 align-items-start">
      <div class="col-md-5">
        <div class="ah-form-card p-0 overflow-hidden">
          <img src="../${p.images[0]}" alt="${p.title}" width="560" height="560" style="width:100%;height:auto;display:block;object-fit:cover;aspect-ratio:1">
        </div>
      </div>
      <div class="col-md-7">
        <h1 class="mb-2" style="letter-spacing:-.03em">${p.title}</h1>
        <div class="ah-stars mb-2">${AhooraUtils.stars(p.rating)} <span class="text-secondary small">(${p.reviewCount || 0} نظر)</span></div>
        <p class="text-secondary">${p.brand || ""} · ${p.model || ""}</p>
        <p>${p.description || ""}</p>
        <div class="ah-price fs-4 mb-2">${AhooraUtils.formatPrice(price)}${p.discountPrice ? `<span class="old">${AhooraUtils.formatPrice(p.price)}</span>` : ""}</div>
        <div class="ah-stock ${stock.cls} mb-3">${stock.text}</div>
        ${
          variants.length
            ? `<label class="form-label">تنوع</label>
               <select class="form-select mb-3" id="variantSel" style="max-width:280px">
                 ${variants.map((v) => `<option value="${v.id}" data-price="${v.price}" data-stock="${v.stock}">${[v.color, v.storage].filter(Boolean).join(" / ")} — ${AhooraUtils.formatPrice(v.price)}</option>`).join("")}
               </select>`
            : ""
        }
        <div class="d-flex gap-2 flex-wrap">
          <button class="ah-btn ah-btn-primary" id="addCart" ${p.stock <= 0 ? "disabled" : ""}>افزودن به سبد</button>
          <a class="ah-btn ah-btn-dark" href="cart.html">مشاهده سبد</a>
        </div>
        <hr class="my-4">
        <h2 class="h5">مشخصات فنی</h2>
        <ul>${Object.entries(p.specs || {}).map(([k, v]) => `<li><strong>${k}:</strong> ${v}</li>`).join("")}</ul>
        <hr class="my-4">
        <h2 class="h5">ثبت نظر</h2>
        <form id="reviewForm" class="ah-form-card">
          <div class="row g-2">
            <div class="col-md-4"><input class="form-control" name="name" placeholder="نام" required></div>
            <div class="col-md-4">
              <select class="form-select" name="rating" required>
                <option value="5">۵ ستاره</option><option value="4">۴</option><option value="3">۳</option><option value="2">۲</option><option value="1">۱</option>
              </select>
            </div>
            <div class="col-12"><textarea class="form-control" name="text" rows="3" placeholder="نظر شما" required></textarea></div>
            <div class="col-12"><button class="ah-btn ah-btn-primary" type="submit">ارسال نظر</button></div>
          </div>
        </form>
      </div>
    </div>`;

  document.getElementById("addCart")?.addEventListener("click", () => {
    const sel = document.getElementById("variantSel");
    const variantId = sel?.value || null;
    let itemPrice = price;
    let stockOk = p.stock > 0;
    if (sel) {
      const opt = sel.selectedOptions[0];
      itemPrice = Number(opt.dataset.price);
      stockOk = Number(opt.dataset.stock) > 0;
    }
    if (!stockOk) return AhooraUtils.toast("موجودی کافی نیست", "error");
    AhooraStore.cart.add({
      productId: p.id,
      variantId,
      title: p.title,
      price: itemPrice,
      image: p.images[0],
      qty: 1,
    });
    AhooraLayout.updateCartBadge();
    AhooraUtils.toast("به سبد خرید اضافه شد");
  });

  document.getElementById("reviewForm")?.addEventListener("submit", (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    const content = AhooraStore.content.get();
    content.reviews = content.reviews || [];
    content.reviews.unshift({
      id: AhooraStore.uid("rv"),
      productId: p.id,
      name: fd.get("name"),
      rating: Number(fd.get("rating")),
      text: fd.get("text"),
      approved: false,
      createdAt: new Date().toISOString(),
    });
    AhooraStore.content.save(content);
    AhooraUtils.toast("نظر شما پس از تأیید نمایش داده می‌شود");
    e.target.reset();
  });

  AhooraUtils.injectSchema({
    "@context": "https://schema.org",
    "@type": "Product",
    name: p.title,
    description: p.description,
    brand: { "@type": "Brand", name: p.brand },
    sku: p.slug,
    image: p.images,
    offers: {
      "@type": "Offer",
      priceCurrency: "IRR",
      price: price,
      availability: p.stock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
    },
    aggregateRating: p.reviewCount
      ? { "@type": "AggregateRating", ratingValue: p.rating, reviewCount: p.reviewCount }
      : undefined,
  });
});
