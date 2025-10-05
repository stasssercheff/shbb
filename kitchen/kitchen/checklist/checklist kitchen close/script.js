// ===== Навигация =====
function goHome() {
  location.href = "http://stasssercheff.github.io/shbb/";
}

function goBack() {
  const currentPath = window.location.pathname;
  const parentPath = currentPath.substring(0, currentPath.lastIndexOf("/"));
  const upperPath = parentPath.substring(0, parentPath.lastIndexOf("/"));
  window.location.href = upperPath + "/index.html";
}

// ===== Переключение языка =====
async function switchLanguage(lang) {
  try {
    const response = await fetch("lang.json");
    const translations = await response.json();
    document.documentElement.lang = lang;

    document.querySelectorAll("[data-i18n]").forEach(el => {
      const key = el.getAttribute("data-i18n");
      if (translations[key] && translations[key][lang]) {
        if (el.tagName === "INPUT") {
          if (el.type === "submit" || el.type === "button") el.value = translations[key][lang];
          else if (el.hasAttribute("placeholder")) el.setAttribute("placeholder", translations[key][lang]);
        } else if (el.hasAttribute("placeholder")) el.setAttribute("placeholder", translations[key][lang]);
        else el.textContent = translations[key][lang];
      }
    });

    document.querySelectorAll("select option[data-i18n]").forEach(opt => {
      const key = opt.getAttribute("data-i18n");
      if (translations[key] && translations[key][lang]) opt.textContent = translations[key][lang];
    });
  } catch (err) {
    console.error("Ошибка загрузки lang.json:", err);
  }
}

// ===== Сохранение и восстановление формы =====
function saveFormData() {
  const data = {};
  document.querySelectorAll("select").forEach(select => data[select.name || select.id] = select.value);
  document.querySelectorAll("textarea.comment").forEach(textarea => data[textarea.name || textarea.id] = textarea.value);
  localStorage.setItem("formData", JSON.stringify(data));
}

function restoreFormData() {
  const saved = localStorage.getItem("formData");
  if (!saved) return;
  const data = JSON.parse(saved);
  document.querySelectorAll("select").forEach(select => {
    if (data[select.name || select.id] !== undefined) select.value = data[select.name || select.id];
  });
  document.querySelectorAll("textarea.comment").forEach(textarea => {
    if (data[textarea.name || textarea.id] !== undefined) textarea.value = data[textarea.name || textarea.id];
  });
}

// ===== DOMContentLoaded =====
document.addEventListener("DOMContentLoaded", () => {
  const lang = document.documentElement.lang || "ru";

  // Добавляем пустые опции
  document.querySelectorAll("select.qty").forEach(select => {
    if (![...select.options].some(opt => opt.value === "")) {
      const emptyOption = document.createElement("option");
      emptyOption.value = "";
      emptyOption.textContent = "—";
      emptyOption.selected = true;
      select.insertBefore(emptyOption, select.firstChild);
    }
  });

  restoreFormData();
  switchLanguage(lang);

  // Дата
  const today = new Date();
  const day = String(today.getDate()).padStart(2, "0");
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const formattedDate = `${day}/${month}`;
  const dateDiv = document.getElementById("current-date");
  if (dateDiv) dateDiv.textContent = formattedDate;

  // Сохраняем при изменении
  document.querySelectorAll("select, textarea.comment").forEach(el => el.addEventListener("input", saveFormData));

  // Отправка в Telegram
  const button = document.getElementById("sendToTelegram");
  if (button) {
    button.addEventListener("click", () => {
      const chat_id = "-1002393080811";
      const worker_url = "https://shbb1.stassser.workers.dev/";
      const message = buildMessage(lang);
      fetch(`${worker_url}?chat_id=${chat_id}&text=${encodeURIComponent(message)}`);
      alert(lang === "en" ? "Sent!" : "Отправлено!");
    });
  }

  // ===== Формирование сообщения =====
  function buildMessage(lang) {
    let message = `🧾 <b>${lang === "en" ? "KITCHEN-CLOSE" : "КУХНЯ-ЗАКРЫТИЕ"}</b>\n\n`;
    message += `📅 ${lang === "en" ? "Date" : "Дата"}: ${formattedDate}\n`;

    const nameSelect = document.querySelector('select[name="chef"]');
    const selectedChef = nameSelect?.selectedOptions[0];
    const name = selectedChef?.dataset[lang] || selectedChef?.textContent || "—";
    message += `${lang === "en" ? "👨‍🍳 Name" : "👨‍🍳 Имя"}: ${name}\n\n`;

    // Перебираем все секции
    document.querySelectorAll(".checklist-section").forEach(section => {
      const sectionTitle = section.querySelector(".section-title");
      if (!sectionTitle) return;
      message += `🔹 ${sectionTitle.textContent}\n`;

      section.querySelectorAll(".dish").forEach(dish => {
        const label = dish.querySelector("label")?.textContent || "—";
        const select = dish.querySelector("select.qty");
        const value = select?.selectedOptions[0]?.textContent || "";
        if (value) message += `- ${label}: ${value}\n`;
      });

      const comment = section.querySelector("textarea.comment")?.value;
      if (comment) message += `💬 ${comment}\n`;

      message += "\n";
    });

    return message;
  }
});
