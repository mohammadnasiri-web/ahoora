document.addEventListener("DOMContentLoaded", async () => {
  await AhooraLayout.boot({
    seo: { title: "فروشگاه | اهورا تل", description: "خرید گوشی و لوازم جانبی" },
  });

  const data = AhooraStore.products.all();
  const catSel = document.getElementById("fCat");
  catSel.innerHTML =
    `<option value="">همه</option>` +
    (data.categories || [])
      .filter((c) => c.active)
      .map((c) => `<option value="${c.id}">${c.parentId ? "— " : ""}${c.title}</option>`)
      .join("");

  const brandSel = document.getElementById("fBrand");
  (data.brands || []).forEach((b) => {
    brandSel.insertAdjacentHTML("beforeend", `<option value="${b}">${b}</option>`);
  });

  // URL params
  const q = AhooraUtils.qs("q") || "";
  const cat = AhooraUtils.qs("cat") || "";
  const featured = AhooraUtils.qs("featured");
  document.getElementById("fQ").value = q;
  if (cat) catSel.value = cat;

  function render() {
    const filters = {
      q: document.getElementById("fQ").value.trim(),
      cat: document.getElementById("fCat").value || null,
      brand: document.getElementById("fBrand").value || null,
      sort: document.getElementById("fSort").value || null,
      inStock: document.getElementById("fStock").checked,
      featured: featured === "1" ? true : undefined,
    };
    const items = AhooraStore.products.list(filters);
    document.getElementById("shopResultMeta").textContent = `${items.length} محصول`;
    document.getElementById("shopGrid").innerHTML = items.length
      ? items
          .map((p) => {
            const price = p.discountPrice || p.price;
            const stock = AhooraUtils.stockLabel(p.stock);
            return `<a class="ah-card-product" href="product.html?slug=${encodeURIComponent(p.slug)}">
              <div class="media"><img src="../${p.images[0]}" alt="${p.title}" loading="lazy" width="160" height="160"></div>
              <div class="body">
                <h3>${p.title}</h3>
                <div class="small text-secondary mb-1">${p.brand || ""} ${p.model || ""}</div>
                <div class="ah-price">${AhooraUtils.formatPrice(price)}${p.discountPrice ? `<span class="old">${AhooraUtils.formatPrice(p.price)}</span>` : ""}</div>
                <div class="ah-stock ${stock.cls}">${stock.text}</div>
              </div>
            </a>`;
          })
          .join("")
      : `<p class="text-secondary">محصولی یافت نشد.</p>`;

    AhooraUtils.injectSchema({
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      name: "فروشگاه اهورا تل",
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

  document.getElementById("filterForm").addEventListener("submit", (e) => {
    e.preventDefault();
    render();
  });
  render();
});
