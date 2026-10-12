const AhooraUtils = {
  formatPrice(n) {
    if (n == null || Number.isNaN(n)) return "—";
    return new Intl.NumberFormat("fa-IR").format(Math.round(n)) + " تومان";
  },

  toFaDigits(str) {
    return String(str).replace(/\d/g, (d) => "۰۱۲۳۴۵۶۷۸۹"[d]);
  },

  pathPrefix() {
    const path = window.location.pathname.replace(/\\/g, "/");
    if (path.includes("/admin/") || path.includes("/pages/")) return "../";
    return "./";
  },

  qs(name) {
    return new URLSearchParams(window.location.search).get(name);
  },

  stockLabel(stock) {
    if (stock <= 0) return { text: "ناموجود", cls: "out" };
    if (stock <= 3) return { text: "اتمام موجودی نزدیک است", cls: "out" };
    return { text: "موجود", cls: "in" };
  },

  stars(n) {
    const full = Math.round(n || 0);
    return "★".repeat(full) + "☆".repeat(5 - full);
  },

  validatePhone(phone) {
    return /^09\d{9}$/.test(String(phone).replace(/\s/g, ""));
  },

  todayISO() {
    const d = new Date();
    return d.toISOString().slice(0, 10);
  },

  addDaysISO(days) {
    const d = new Date();
    d.setDate(d.getDate() + days);
    return d.toISOString().slice(0, 10);
  },

  isWorkingDay(dateStr, schedule) {
    const d = new Date(dateStr + "T12:00:00");
    const day = d.getDay(); // 0 Sun ... 6 Sat — adjust for Iranian week if needed
    const jsToIran = day; // keep simple: use schedule.workingDays as JS getDay()
    if (schedule.holidays?.includes(dateStr)) return false;
    return (schedule.workingDays || []).includes(jsToIran);
  },

  setMeta({ title, description, canonical }) {
    if (title) document.title = title;
    let desc = document.querySelector('meta[name="description"]');
    if (!desc) {
      desc = document.createElement("meta");
      desc.name = "description";
      document.head.appendChild(desc);
    }
    if (description) desc.content = description;
    if (canonical) {
      let link = document.querySelector('link[rel="canonical"]');
      if (!link) {
        link = document.createElement("link");
        link.rel = "canonical";
        document.head.appendChild(link);
      }
      link.href = canonical;
    }
  },

  injectSchema(obj) {
    const script = document.createElement("script");
    script.type = "application/ld+json";
    script.textContent = JSON.stringify(obj);
    document.head.appendChild(script);
  },

  toast(msg, type = "success") {
    const el = document.createElement("div");
    el.className = `ah-alert ah-alert-${type === "error" ? "error" : "success"}`;
    el.style.cssText = "position:fixed;top:70px;left:50%;transform:translateX(-50%);z-index:2000;min-width:260px;text-align:center;box-shadow:0 8px 24px rgba(0,0,0,.12)";
    el.textContent = msg;
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 2800);
  },
};
