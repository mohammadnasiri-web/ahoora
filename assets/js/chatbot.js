const AhooraChat = (() => {
  const replies = [
    { keys: ["باتری", "تعویض باتری", "battery"], text: "برای تعویض باتری در محل، از بخش رزرو نوبت مدل گوشی و زمان را انتخاب کنید. ظرفیت روزانه هر خدمت جداگانه مدیریت می‌شود." },
    { keys: ["lcd", "ال سی دی", "ال‌سی‌دی", "صفحه"], text: "تعویض ال‌سی‌دی از خدمات غیرحضوری است. می‌توانید مدل گوشی و عکس خرابی را هنگام ثبت سفارش آپلود کنید." },
    { keys: ["قیمت", "هزینه"], text: "قیمت‌ها بر اساس مدل و نوع خدمت در صفحه خدمات و رزرو نمایش داده می‌شوند و از پنل مدیریت قابل تغییرند." },
    { keys: ["پیگیری", "سفارش", "رزرو"], text: "برای پیگیری وارد حساب کاربری شوید یا با کد پیگیری در بخش حساب، وضعیت را ببینید." },
    { keys: ["فروشگاه", "خرید", "محصول"], text: "در فروشگاه اهورا گوشی، ایرپاد، گلس، قاب، شارژر و قطعات موجود است. فیلتر برند و قیمت هم فعال است." },
    { keys: ["پرداخت", "درگاه"], text: "پرداخت آنلاین از طریق درگاه (بله‌پی) برای خرید و رزرو پشتیبانی می‌شود." },
    { keys: ["سلام", "درود", "hi", "hello"], text: "سلام! چطور می‌تونم کمکتون کنم؟ درباره خدمات، محصولات یا رزرو بپرسید." },
  ];

  function answer(msg) {
    const q = (msg || "").toLowerCase();
    for (const r of replies) {
      if (r.keys.some((k) => q.includes(k.toLowerCase()))) return r.text;
    }
    return "سوالت رو دریافت کردم. می‌تونی از منوی سایت بخش خدمات، فروشگاه یا رزرو نوبت را باز کنی. برای اتصال به هوش مصنوعی، این ماژول آماده‌ی توسعه است.";
  }

  function mount() {
    if (document.getElementById("ah-chat-root")) return;
    const site = AhooraStore.site.get();
    const root = document.createElement("div");
    root.id = "ah-chat-root";
    root.innerHTML = `
      <button class="ah-chat-toggle" id="ahChatToggle" aria-label="چت‌بات" type="button"><i class="bi bi-chat-dots-fill"></i></button>
      <div class="ah-chat" id="ahChat" role="dialog" aria-label="گفتگو با اهورا تل">
        <div class="ah-chat-head">
          <strong>دستیار اهورا تل</strong>
          <button type="button" class="ah-icon-btn" id="ahChatClose" aria-label="بستن">✕</button>
        </div>
        <div class="ah-chat-body" id="ahChatBody"></div>
        <div class="ah-chat-suggestions" id="ahChatSuggestions"></div>
        <div class="ah-chat-foot">
          <input type="text" id="ahChatInput" placeholder="پیام خود را بنویسید..." aria-label="پیام">
          <button type="button" class="ah-btn ah-btn-primary ah-btn-sm" id="ahChatSend">ارسال</button>
        </div>
      </div>`;
    document.body.appendChild(root);

    const body = document.getElementById("ahChatBody");
    const push = (text, who) => {
      const d = document.createElement("div");
      d.className = `ah-chat-msg ${who}`;
      d.textContent = text;
      body.appendChild(d);
      body.scrollTop = body.scrollHeight;
    };

    push(site.chatbot?.welcome || "سلام!", "bot");

    const sug = document.getElementById("ahChatSuggestions");
    (site.chatbot?.suggestions || []).forEach((s) => {
      const b = document.createElement("button");
      b.type = "button";
      b.textContent = s;
      b.addEventListener("click", () => {
        push(s, "user");
        push(answer(s), "bot");
      });
      sug.appendChild(b);
    });

    const send = () => {
      const input = document.getElementById("ahChatInput");
      const val = input.value.trim();
      if (!val) return;
      push(val, "user");
      push(answer(val), "bot");
      input.value = "";
    };

    document.getElementById("ahChatToggle").onclick = () =>
      document.getElementById("ahChat").classList.toggle("open");
    document.getElementById("ahChatClose").onclick = () =>
      document.getElementById("ahChat").classList.remove("open");
    document.getElementById("ahChatSend").onclick = send;
    document.getElementById("ahChatInput").addEventListener("keydown", (e) => {
      if (e.key === "Enter") send();
    });
  }

  return { mount, answer };
})();
