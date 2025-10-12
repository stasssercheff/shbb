// === НАВИГАЦИЯ ===
window.goHome = function () {
  location.href = "https://stasssercheff.github.io/shbb/";
};

window.goBack = function () {
  const path = window.location.pathname.split("/").filter(Boolean);
  if (path.length > 1) {
    path.pop();
    const target = "/" + path.join("/") + "/index.html";
    location.href = target;
  } else {
    location.href = "/shbb/index.html";
  }
};

// === НАСТРОЙКИ ОТПРАВКИ ===
const TELEGRAM_WORKER_URL = "https://shbb1.stassser.workers.dev/";
const TELEGRAM_CHAT_ID = "-1003076643701";
const WEB3FORMS_ACCESS_KEY = "14d92358-9b7a-4e16-b2a7-35e9ed71de43";
const WEB3FORMS_ENDPOINT = "https://api.web3forms.com/submit";

// === ЯЗЫК ===
async function loadLang() {
  try {
    const res = await fetch("https://stasssercheff.github.io/shbb/lang.json");
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const dict = await res.json();
    window.langDict = dict;
    applyLanguage(localStorage.getItem("lang") || "ru");
  } catch (err) {
    console.error("Ошибка загрузки словаря:", err);
  }
}

function applyLanguage(lang) {
  const dict = window.langDict?.[lang];
  document.querySelectorAll("[data-i18n]").forEach((el) => {
    const key = el.dataset.i18n;
    if (dict?.[key]) el.textContent = dict[key];
  });
  document.querySelectorAll(".section-title, .check-label").forEach((el) => {
    if (el.dataset[lang]) el.textContent = el.dataset[lang];
  });
}

function switchLanguage(lang) {
  document.documentElement.lang = lang;
  localStorage.setItem("lang", lang);
  applyLanguage(lang);
}

// === ДАТА / ВРЕМЯ / АВТОИД ===
function updateDateTime() {
  const now = new Date();
  const d = String(now.getDate()).padStart(2, "0");
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const y = now.getFullYear();
  const h = String(now.getHours()).padStart(2, "0");
  const min = String(now.getMinutes()).padStart(2, "0");

  const dateEl = document.getElementById("current-date");
  const timeEl = document.getElementById("current-time");
  const idEl = document.getElementById("order-id");

  if (dateEl) dateEl.textContent = `${d}.${m}.${y}`;
  if (timeEl) timeEl.textContent = `${h}:${min}`;

  if (idEl) idEl.textContent = `${y}${m}${d}-${h}${min}`;
}

// === СОХРАНЕНИЕ / ВОССТАНОВЛЕНИЕ ===
function saveFormData() {
  const data = {};
  document.querySelectorAll("select, textarea.comment, input[type=text]").forEach((el) => {
    data[el.name || el.id] = el.value;
  });
  localStorage.setItem("formData", JSON.stringify(data));
}

function restoreFormData() {
  const saved = localStorage.getItem("formData");
  if (!saved) return;
  const data = JSON.parse(saved);
  document.querySelectorAll("select, textarea.comment, input[type=text]").forEach((el) => {
    if (data[el.name || el.id] !== undefined) el.value = data[el.name || el.id];
  });
}

// === СБОРКА СООБЩЕНИЯ ===
function buildMessage(lang) {
  const now = new Date();
  const d = String(now.getDate()).padStart(2, "0");
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const h = String(now.getHours()).padStart(2, "0");
  const min = String(now.getMinutes()).padStart(2, "0");

  const dateStr = `${d}.${m}`;
  const timeStr = `${h}:${min}`;

  const dept = document.getElementById("department")?.value || "—";
  const position = document.getElementById("position")?.value || "—";
  const chef = document.getElementById("chef")?.value || "—";
  const orderId = document.getElementById("order-id")?.textContent || "—";

  let message = `🧾 <b>${lang === "en" ? "ORDER" : "ЗАКАЗ"}</b>\n\n`;
  message += `🆔 ID: ${orderId}\n`;
  message += `📅 ${lang === "en" ? "Date" : "Дата"}: ${dateStr}\n`;
  message += `⏰ ${lang === "en" ? "Time" : "Время"}: ${timeStr}\n`;
  message += `🏢 ${lang === "en" ? "Department" : "Отдел"}: ${dept}\n`;
  message += `👨‍🍳 ${lang === "en" ? "Chef" : "Повар"}: ${chef}\n`;
  message += `🎓 ${lang === "en" ? "Position" : "Должность"}: ${position}\n\n`;

  document.querySelectorAll(".menu-section").forEach((section) => {
    const title = section.querySelector(".section-title")?.dataset[lang] || "";
    let sectionText = "";

    section.querySelectorAll(".dish").forEach((dish) => {
      const select = dish.querySelector("select.qty");
      if (!select?.value) return;
      const label = dish.querySelector(".check-label");
      const labelText = label?.dataset[lang] || label?.textContent || "";
      const selectedOpt = select.options[select.selectedIndex];
      const valueText = selectedOpt?.dataset[lang] || selectedOpt?.textContent;
      sectionText += `• ${labelText}: ${valueText}\n`;
    });

    const comment = section.querySelector("textarea.comment");
    if (comment?.value.trim()) sectionText += `💬 ${comment.value.trim()}\n`;

    if (sectionText) message += `🔸 <b>${title}</b>\n${sectionText}\n`;
  });

  return message;
}

// === ОТПРАВКА ===
async function sendToTelegram(text) {
  await fetch(TELEGRAM_WORKER_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chat_id: TELEGRAM_CHAT_ID, text }),
  });
}

async function sendToWeb3Forms(text) {
  await fetch(WEB3FORMS_ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      access_key: WEB3FORMS_ACCESS_KEY,
      subject: "Order",
      from_name: "SHBB PASTRY",
      message: text,
    }),
  });
}

async function sendAll(text) {
  const chunk = 4000;
  for (let i = 0; i < text.length; i += chunk) {
    const part = text.slice(i, i + chunk);
    await sendToTelegram(part);
    await sendToWeb3Forms(part);
  }
}

function clearForm() {
  document.querySelectorAll("select, textarea.comment, input[type=text]").forEach((el) => (el.value = ""));
  localStorage.removeItem("formData");
}

// === ИНИЦИАЛИЗАЦИЯ ===
document.addEventListener("DOMContentLoaded", () => {
  updateDateTime();
  restoreFormData();
  loadLang();

  document.querySelectorAll("select, textarea.comment, input[type=text]").forEach((el) => {
    el.addEventListener("input", saveFormData);
  });

  document.querySelectorAll(".lang-btn").forEach((btn) => {
    btn.addEventListener("click", () => switchLanguage(btn.dataset.lang));
  });

  const profile = document.body.dataset.profile || "rest";
  const sendLangs = window.sendLangs || ["ru"];
  console.log(`✉️ Отправка будет выполнена на языках: ${sendLangs.join(", ")}`);

  document.getElementById("sendToTelegram")?.addEventListener("click", async () => {
    try {
      for (const lang of sendLangs) {
        const msg = buildMessage(lang);
        await sendAll(msg);
      }
      alert("✅ Отправлено!");
      clearForm();
    } catch (err) {
      console.error("Ошибка отправки:", err);
      alert("❌ Ошибка при отправке");
    }
  });
});

