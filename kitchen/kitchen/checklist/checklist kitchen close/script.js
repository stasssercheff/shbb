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

// ===== Переключение языка =====
async function switchLanguage(lang) {
  try {
    const response = await fetch("lang.json");
    const translations = await response.json();
    document.documentElement.lang = lang;
    localStorage.setItem("lang", lang);

    // Перевод всех элементов с data-i18n
    document.querySelectorAll("[data-i18n]").forEach(el => {
      const key = el.dataset.i18n;
      if (translations[key] && translations[key][lang]) {
        if (el.tagName === "INPUT" && el.hasAttribute("placeholder")) {
          el.setAttribute("placeholder", translations[key][lang]);
        } else if (el.tagName === "TEXTAREA" && el.hasAttribute("placeholder")) {
          el.setAttribute("placeholder", translations[key][lang]);
        } else {
          el.textContent = translations[key][lang];
        }
      }
    });

    // Перевод опций select
    document.querySelectorAll("select option").forEach(opt => {
      const key = opt.dataset.i18n;
      if (key && translations[key] && translations[key][lang]) {
        opt.textContent = translations[key][lang];
      }
      if (opt.value === "") opt.textContent = "—";
    });
  } catch (err) {
    console.error("Ошибка загрузки lang.json:", err);
  }
}

// ===== DOMContentLoaded =====
document.addEventListener("DOMContentLoaded", () => {
  const lang = localStorage.getItem("lang") || "ru";

  // Добавляем пустые опции для select.qty
  document.querySelectorAll("select.qty").forEach(select => {
    if (![...select.options].some(opt => opt.value === "")) {
      const emptyOption = document.createElement("option");
      emptyOption.value = "";
      emptyOption.dataset.i18n = "empty";
      emptyOption.textContent = "—";
      emptyOption.selected = true;
      select.insertBefore(emptyOption, select.firstChild);
    }
  });

  restoreFormData();
  switchLanguage(lang);

  // Автоподстановка даты
  const today = new Date();
  const day = String(today.getDate()).padStart(2, "0");
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const formattedDate = `${day}/${month}`;
  const dateDiv = document.getElementById("current-date");
  if (dateDiv) dateDiv.textContent = formattedDate;

  // Сохраняем при изменении
  document.querySelectorAll("select, textarea.comment").forEach(el => el.addEventListener("input", saveFormData));

  // ===== Формирование сообщения =====
  const buildMessage = lang => {
    let message = `🧾 <b>${lang === "en" ? "KITCHEN-CLOSE" : "КУХНЯ-ЗАКРЫТИЕ"}</b>\n\n`;
    message += `📅 ${lang === "en" ? "Date" : "Дата"}: ${formattedDate}\n`;

    const nameSelect = document.querySelector('select[name="chef"]');
    const selectedChef = nameSelect?.selectedOptions[0];
    const name = selectedChef?.dataset.i18n
      ? selectedChef.dataset.i18n && window.translations[selectedChef.dataset.i18n][lang]
      : selectedChef?.textContent || "—";
    message += `${lang === "en" ? "👨‍🍳 Name" : "👨‍🍳 Имя"}: ${name}\n\n`;

    document.querySelectorAll(".checklist-section").forEach(section => {
      const sectionTitle = section.querySelector(".section-title");
      const titleKey = sectionTitle?.dataset.i18n;
      const title = titleKey && window.translations[titleKey]?.[lang] ? window.translations[titleKey][lang] : sectionTitle?.textContent;
      message += `🔹 ${title}\n`;

      section.querySelectorAll(".dish").forEach(dish => {
        const label = dish.querySelector("label");
        const labelText = label?.dataset.i18n
          ? window.translations[label.dataset.i18n][lang]
          : label?.textContent || "—";

        const select = dish.querySelector("select.qty");
        const selectedOption = select?.selectedOptions[0];
        const value = selectedOption?.dataset.i18n
          ? window.translations[selectedOption.dataset.i18n][lang]
          : selectedOption?.textContent || "";

        if (value) message += `- ${labelText}: ${value}\n`;
      });

      const commentField = section.querySelector("textarea.comment");
      if (commentField && commentField.value.trim()) {
        message += `💬 ${commentField.value.trim()}\n`;
      }

      message += "\n";
    });

    return message;
  };

  // ===== Кнопка отправки =====
  const button = document.getElementById("sendToTelegram");
  if (button) {
    button.addEventListener("click", async () => {
      const chat_id = "-1002393080811"; // твой Telegram чат ID
      const worker_url = "https://shbb1.stassser.workers.dev/";
      const accessKey = "14d92358-9b7a-4e16-b2a7-35e9ed71de43";

      const sendMessage = msg => fetch(worker_url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chat_id, text: msg })
      }).then(res => res.json());

      const sendEmail = async msg => {
        try {
          const res = await fetch("https://api.web3forms.com/submit", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              access_key: accessKey,
              subject: "КУХНЯ-ЗАКРЫТИЕ",
              from_name: "SHBB KITCHEN",
              reply_to: "no-reply@shbb.com",
              message: msg
            })
          }).then(r => r.json());

          if (!res.success) alert("Ошибка отправки email. Проверьте форму.");
        } catch (err) {
          alert("Ошибка отправки email: " + err.message);
        }
      };

      const sendAllParts = async text => {
        let start = 0;
        while (start < text.length) {
          const chunk = text.slice(start, start + 4000);
          await sendMessage(chunk);
          await sendEmail(chunk);
          start += 4000;
        }
      };

      const clearForm = () => {
        document.querySelectorAll("select").forEach(select => (select.value = ""));
        document.querySelectorAll("textarea.comment").forEach(textarea => (textarea.value = ""));
      };

      try {
        for (const lang of window.sendLangs) {
          const msg = buildMessage(lang);
          await sendAllParts(msg);
        }
        alert("✅ ОТПРАВЛЕНО");
        localStorage.clear();
        clearForm();
      } catch (err) {
        alert("❌ Ошибка при отправке: " + err.message);
        console.error(err);
      }
    });
  }
});
