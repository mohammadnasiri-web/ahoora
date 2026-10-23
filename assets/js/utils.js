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

  _div(a, b) {
    return ~~(a / b);
  },

  toJalali(iso) {
    const [gy, gm, gd] = String(iso).split("-").map(Number);
    const gdm = [0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334];
    let jy = gy <= 1600 ? 0 : 979;
    let year = gy - (gy <= 1600 ? 621 : 1600);
    const gy2 = gm > 2 ? year + 1 : year;
    let days =
      365 * year +
      this._div(gy2 + 3, 4) -
      this._div(gy2 + 99, 100) +
      this._div(gy2 + 399, 400) -
      80 +
      gd +
      gdm[gm - 1];
    jy += 33 * this._div(days, 12053);
    days %= 12053;
    jy += 4 * this._div(days, 1461);
    days %= 1461;
    if (days > 365) {
      jy += this._div(days - 1, 365);
      days = (days - 1) % 365;
    }
    const jm = days < 186 ? 1 + this._div(days, 31) : 7 + this._div(days - 186, 30);
    const jd = 1 + (days < 186 ? days % 31 : (days - 186) % 30);
    return { jy, jm, jd };
  },

  fromJalali(jy, jm, jd) {
    let gy = jy <= 979 ? 621 : 1600;
    let year = jy - (jy <= 979 ? 0 : 979);
    let days =
      365 * year +
      this._div(year, 33) * 8 +
      this._div((year % 33) + 3, 4) +
      78 +
      jd +
      (jm < 7 ? (jm - 1) * 31 : (jm - 7) * 30 + 186);
    gy += 400 * this._div(days, 146097);
    days %= 146097;
    if (days > 36524) {
      gy += 100 * this._div(--days, 36524);
      days %= 36524;
      if (days >= 365) days += 1;
    }
    gy += 4 * this._div(days, 1461);
    days %= 1461;
    if (days > 365) {
      gy += this._div(days - 1, 365);
      days = (days - 1) % 365;
    }
    let gd = days + 1;
    const leap = (gy % 4 === 0 && gy % 100 !== 0) || gy % 400 === 0;
    const md = [0, 31, leap ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
    let gm = 1;
    while (gm <= 12 && gd > md[gm]) {
      gd -= md[gm];
      gm += 1;
    }
    const pad = (n) => String(n).padStart(2, "0");
    return `${gy}-${pad(gm)}-${pad(gd)}`;
  },

  jalaliMonthLength(jy, jm) {
    if (jm <= 6) return 31;
    if (jm <= 11) return 30;
    return [1, 5, 9, 13, 17, 22, 26, 30].includes(jy % 33) ? 30 : 29;
  },

  formatJalali(iso) {
    const { jy, jm, jd } = this.toJalali(iso);
    const pad = (n) => String(n).padStart(2, "0");
    return this.toFaDigits(`${jy}/${pad(jm)}/${pad(jd)}`);
  },

  jalaliMonthName(jm) {
    return ["فروردین", "اردیبهشت", "خرداد", "تیر", "مرداد", "شهریور", "مهر", "آبان", "آذر", "دی", "بهمن", "اسفند"][jm - 1] || "";
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
