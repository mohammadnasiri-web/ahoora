document.addEventListener("DOMContentLoaded", async () => {
  await AhooraLayout.boot({
    seo: {
      title: "گوشی موبایل و تجهیزات | اهورا تل",
      description: "خرید گوشی موبایل، لوازم جانبی و قطعات موبایل با گارانتی از اهورا تل",
    },
  });

  const PAGE_TITLE = "گوشی موبایل و تجهیزات";
  const groups = [
    { id: "phones", title: "گوشی موبایل", image: "assets/img/products/iphone-15.png" },
    { id: "accessories", title: "لوازم جانبی گوشی موبایل", image: "assets/img/products/charger-20w.png" },
    { id: "parts", title: "قطعات موبایل", image: "assets/img/products/lcd.png" },
  ];
  const sorts = [
    { id: "bestseller", title: "پرفروش ترین" },
    { id: "price-desc", title: "بیشترین قیمت" },
    { id: "price-asc", title: "کمترین قیمت" },
    { id: "newest", title: "جدیدترین" },
    { id: "discount", title: "بیشترین تخفیف" },
  ];

  const data = AhooraStore.products.all();
  const categories = (data.categories || []).filter((c) => c.active);
  const allProducts = (data.products || []).filter((p) => p.active !== false);
  const fa = AhooraUtils.toFaDigits;
  const $ = (id) => document.getElementById(id);

  const sub = groups.find((g) => g.id === AhooraUtils.qs("cat")) || null;
  const scopeGroups = sub ? [sub] : groups;
  const childrenOf = (id) => categories.filter((c) => c.parentId === id);
  const scopeIds = new Set();
  scopeGroups.forEach((g) => {
    scopeIds.add(g.id);
    childrenOf(g.id).forEach((c) => scopeIds.add(c.id));
  });
  const scopeProducts = allProducts.filter((p) => scopeIds.has(p.categoryId));

  const state = {
    sort: "bestseller",
    inStock: false,
    discount: false,
    min: null,
    max: null,
    cats: new Set(),
    brands: new Set(),
  };

  const priceOf = (p) => p.discountPrice || p.price;
  const offOf = (p) => (p.discountPrice && p.price ? Math.round(((p.price - p.discountPrice) / p.price) * 100) : 0);
  const catMatches = (p, id) => p.categoryId === id || categories.find((c) => c.id === p.categoryId)?.parentId === id;

  /* ---- breadcrumb + sub-category cards ---- */
  const home = AhooraLayout.resolveUrl("index.html");
  $("catCrumb").innerHTML = [
    `<a href="${home}">اهورا تل</a>`,
    sub ? `<a href="mobile.html">${PAGE_TITLE}</a>` : `<span>${PAGE_TITLE}</span>`,
    sub ? `<span>${sub.title}</span>` : "",
  ]
    .filter(Boolean)
    .join(`<i class="bi bi-chevron-left" aria-hidden="true"></i>`);

  $("catSubs").innerHTML = groups
    .map((g) => {
      const active = sub?.id === g.id;
      return `<a class="ah-cat-sub${active ? " is-active" : ""}" href="${active ? "mobile.html" : `mobile.html?cat=${g.id}`}"${active ? ' aria-current="page"' : ""}>
        <img src="../${g.image}" alt="" width="72" height="72" loading="lazy">
        <span>${g.title}</span>
      </a>`;
    })
    .join("");

  /* ---- filter lists ---- */
  const filterCats = scopeGroups.flatMap((g) => {
    const kids = childrenOf(g.id);
    return kids.length ? kids : categories.filter((c) => c.id === g.id);
  });
  $("catCatList").innerHTML = filterCats
    .map(
      (c) => `<label class="ah-cat-check"><input type="checkbox" value="${c.id}" data-kind="cats"> <span>${c.title}</span></label>`
    )
    .join("");

  const brands = [...new Set(scopeProducts.map((p) => p.brand).filter(Boolean))];
  $("catBrandList").innerHTML = brands.length
    ? brands
        .map(
          (b) => `<label class="ah-cat-check"><input type="checkbox" value="${b}" data-kind="brands"> <span>${b}</span></label>`
        )
        .join("")
    : `<p class="ah-cat-empty-note">برندی ثبت نشده است.</p>`;

  /* ---- sort controls ---- */
  $("catSort").insertAdjacentHTML(
    "beforeend",
    sorts.map((s) => `<button type="button" data-sort="${s.id}">${s.title}</button>`).join("")
  );
  $("catSortList").innerHTML = sorts
    .map((s) => `<button type="button" class="ah-cat-sortopt" data-sort="${s.id}">${s.title}</button>`)
    .join("");

  function filtered() {
    let items = scopeProducts.slice();
    if (state.inStock) items = items.filter((p) => p.stock > 0);
    if (state.discount) items = items.filter((p) => offOf(p) > 0);
    if (state.min != null) items = items.filter((p) => priceOf(p) >= state.min);
    if (state.max != null) items = items.filter((p) => priceOf(p) <= state.max);
    if (state.cats.size) items = items.filter((p) => [...state.cats].some((id) => catMatches(p, id)));
    if (state.brands.size) items = items.filter((p) => state.brands.has(p.brand));

    if (state.sort === "bestseller") {
      items.sort((a, b) => Number(!!b.bestseller) - Number(!!a.bestseller) || (b.rating || 0) - (a.rating || 0));
    }
    if (state.sort === "price-desc") items.sort((a, b) => priceOf(b) - priceOf(a));
    if (state.sort === "price-asc") items.sort((a, b) => priceOf(a) - priceOf(b));
    if (state.sort === "newest") items.reverse();
    if (state.sort === "discount") items.sort((a, b) => offOf(b) - offOf(a));
    // out-of-stock items always go last
    items.sort((a, b) => Number(a.stock <= 0) - Number(b.stock <= 0));
    return items;
  }

  function card(p) {
    const off = offOf(p);
    const img = p.images?.[0] || "assets/img/products/iphone-15.png";
    const out = p.stock <= 0;
    const specs = Object.values(p.specs || {}).slice(0, 3);
    return `<a class="ah-cat-card${out ? " is-out" : ""}" href="product.html?slug=${encodeURIComponent(p.slug)}">
      <div class="ah-cat-card-media">
        <img src="../${img}" alt="${p.title}" loading="lazy" width="300" height="300">
      </div>
      <div class="ah-cat-card-body">
        <h3>${p.title}</h3>
        <div class="ah-cat-card-meta">
          ${p.rating ? `<span class="ah-cat-rate"><i class="bi bi-star-fill" aria-hidden="true"></i> ${fa(p.rating)}</span>` : ""}
          ${specs.length ? `<span class="ah-cat-specs">${specs.map((s) => `<span>${s}</span>`).join("")}</span>` : ""}
        </div>
        <div class="ah-cat-card-price">
          ${
            out
              ? `<span class="ah-cat-out">ناموجود</span>`
              : `<div class="ah-cat-price-now">
                  ${off ? `<span class="ah-cat-off">٪${fa(off)}</span>` : ""}
                  <strong>${new Intl.NumberFormat("fa-IR").format(priceOf(p))}</strong> <small>تومان</small>
                </div>
                ${off ? `<del>${new Intl.NumberFormat("fa-IR").format(p.price)}</del>` : ""}`
          }
        </div>
      </div>
    </a>`;
  }

  function render() {
    const items = filtered();
    const countText = `تعداد محصولات: ${fa(items.length)} کالا`;
    $("catCount").textContent = countText;
    $("catMCount").textContent = countText;
    $("catApply").textContent = `نمایش ${fa(items.length)} کالا`;
    $("catGrid").innerHTML = items.length
      ? items.map(card).join("")
      : `<div class="ah-cat-empty"><i class="bi bi-search" aria-hidden="true"></i><p>کالایی با این فیلترها پیدا نشد.</p></div>`;

    const sortTitle = sorts.find((s) => s.id === state.sort).title;
    $("catSortCurrent").textContent = sortTitle;
    document.querySelectorAll("[data-sort]").forEach((btn) => {
      btn.classList.toggle("is-active", btn.dataset.sort === state.sort);
    });

    const hasFilter =
      state.inStock || state.discount || state.min != null || state.max != null || state.cats.size || state.brands.size;
    $("catClear").hidden = !hasFilter;
    $("catFilterDot").hidden = !hasFilter;

    AhooraUtils.injectSchema({
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      name: sub ? sub.title : PAGE_TITLE,
      mainEntity: {
        "@type": "ItemList",
        itemListElement: items.slice(0, 20).map((p, i) => ({
          "@type": "ListItem",
          position: i + 1,
          url: `product.html?slug=${p.slug}`,
          name: p.title,
        })),
      },
    });
  }

  /* ---- events ---- */
  document.querySelectorAll("[data-sort]").forEach((btn) => {
    btn.addEventListener("click", () => {
      state.sort = btn.dataset.sort;
      render();
      if (btn.classList.contains("ah-cat-sortopt")) closeSheets();
    });
  });

  $("catInStock").addEventListener("change", (e) => {
    state.inStock = e.target.checked;
    render();
  });
  $("catDiscount").addEventListener("change", (e) => {
    state.discount = e.target.checked;
    render();
  });

  const readPrice = (el) => {
    const n = parseInt(el.value, 10);
    return Number.isFinite(n) && n >= 0 ? n : null;
  };
  let priceTimer;
  ["catMin", "catMax"].forEach((id) => {
    $(id).addEventListener("input", () => {
      clearTimeout(priceTimer);
      priceTimer = setTimeout(() => {
        state.min = readPrice($("catMin"));
        state.max = readPrice($("catMax"));
        render();
      }, 300);
    });
  });

  document.querySelectorAll(".ah-cat-check input").forEach((input) => {
    input.addEventListener("change", () => {
      const set = state[input.dataset.kind];
      if (input.checked) set.add(input.value);
      else set.delete(input.value);
      render();
    });
  });

  $("catClear").addEventListener("click", () => {
    Object.assign(state, { inStock: false, discount: false, min: null, max: null });
    state.cats.clear();
    state.brands.clear();
    document.querySelectorAll("#catFilters input[type=checkbox]").forEach((i) => (i.checked = false));
    $("catMin").value = "";
    $("catMax").value = "";
    render();
  });

  /* ---- mobile bottom sheets ---- */
  const overlay = $("catOverlay");
  function openSheet(el) {
    el.classList.add("is-open");
    overlay.hidden = false;
    document.body.classList.add("ah-cat-sheet-open");
  }
  function closeSheets() {
    document.querySelectorAll(".ah-cat-filters, .ah-cat-sortsheet").forEach((el) => el.classList.remove("is-open"));
    overlay.hidden = true;
    document.body.classList.remove("ah-cat-sheet-open");
  }
  $("catOpenFilters").addEventListener("click", () => openSheet($("catFilters")));
  $("catOpenSort").addEventListener("click", () => openSheet($("catSortSheet")));
  overlay.addEventListener("click", closeSheets);
  document.querySelectorAll("[data-close-sheet]").forEach((btn) => btn.addEventListener("click", closeSheets));
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeSheets();
  });

  render();
});
