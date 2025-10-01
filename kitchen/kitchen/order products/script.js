// Функция возврата на главную страницу
function goHome() {
  location.href = '/index.html';
}

// Функция возврата на предыдущую страницу
function goBack() {
  history.back();
}

// Обновление даты при загрузке страницы
document.addEventListener("DOMContentLoaded", () => {
    const dateEl = document.getElementById("current-date");
    if (dateEl) {
        const today = new Date();
        const day = String(today.getDate()).padStart(2, '0');
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const year = today.getFullYear();
        dateEl.textContent = `${day}.${month}.${year}`;
    }
});


// === Переключение языка через словарь ===
function switchLanguage(lang) {
  document.documentElement.lang = lang;
  localStorage.setItem("lang", lang);

  // Обновляем элементы с data-i18n
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

  // Обновляем опции select
  document.querySelectorAll("select").forEach(select => {
    Array.from(select.options).forEach(option => {
      const key = option.dataset.i18n;
      if (key && translations[key] && translations[key][lang]) {
        option.textContent = translations[key][lang];
      }
      if (option.value === "") option.textContent = "—";
    });
  });
}

// === Сохранение и восстановление данных формы ===
function saveFormData() {
  const data = {};
  document.querySelectorAll("select").forEach(select => {
    data[select.name || select.id] = select.value;
  });
  document.querySelectorAll("textarea.comment").forEach(textarea => {
    data[textarea.name || textarea.id] = textarea.value;
  });
  localStorage.setItem("formData", JSON.stringify(data));
}

function restoreFormData() {
  const saved = localStorage.getItem("formData");
  if (!saved) return;
  const data = JSON.parse(saved);
  document.querySelectorAll("select").forEach(select => {
    if (data[select.name || select.id] !== undefined) {
      select.value = data[select.name || select.id];
    }
  });
  document.querySelectorAll("textarea.comment").forEach(textarea => {
    if (data[textarea.name || textarea.id] !== undefined) {
      textarea.value = data[textarea.name || textarea.id];
    }
  });
}

// === DOMContentLoaded ===
document.addEventListener("DOMContentLoaded", () => {
  const lang = localStorage.getItem("lang") || "ru";

  // Вставляем пустую опцию в каждый select.qty (если её нет)
  document.querySelectorAll("select.qty").forEach(select => {
    const hasEmpty = Array.from(select.options).some(opt => opt.value === "");
    if (!hasEmpty) {
      const emptyOption = document.createElement("option");
      emptyOption.value = "";
      emptyOption.dataset.i18n = "empty"; // ключ из lang.json
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
  const dateDiv = document.getElementById("autodate");
  if (dateDiv) dateDiv.textContent = formattedDate;

  document.querySelectorAll("select, textarea.comment").forEach(el => {
    el.addEventListener("input", saveFormData);
  });

  // === Функция сборки сообщения ===
  const buildMessage = lang => {
    let message = `🧾 <b>${
      lang === "en" ? "ORDER" : "ЗАКАЗ"
    }</b>\n\n`;
    message += `📅 ${lang === "en" ? "Date" : "Дата"}: ${formattedDate}\n`;

    const nameSelect = document.querySelector('select[name="chef"]');
    const selectedChef = nameSelect?.options[nameSelect.selectedIndex];
    const name = selectedChef?.dataset.i18n
      ? translations[selectedChef.dataset.i18n][lang]
      : "—";
    message += `${lang === "en" ? "👨‍🍳 Name" : "👨‍🍳 Имя"}: ${name}\n\n`;

    document.querySelectorAll(".menu-section").forEach(section => {
      const sectionTitle = section.querySelector(".section-title");
      const titleKey = sectionTitle?.dataset.i18n;
      const title =
        translations[titleKey]?.[lang] || sectionTitle?.textContent || "";

      let sectionContent = "";

      section.querySelectorAll(".dish").forEach(dish => {
        const select = dish.querySelector("select.qty");
        if (!select || !select.value) return;

        const label = dish.querySelector("label");
        const labelKey = label?.dataset.i18n;
        const labelText =
          translations[labelKey]?.[lang] || label?.textContent || "—";

        const selectedOption = select.options[select.selectedIndex];
        const optionKey = selectedOption?.dataset.i18n;
        const value =
          (optionKey && translations[optionKey]?.[lang]) ||
          selectedOption?.textContent ||
          "—";

        sectionContent += `• ${labelText}: ${value}\n`;
      });

      const commentField = section.querySelector("textarea.comment");
      if (commentField && commentField.value.trim()) {
        sectionContent += `💬 ${
          lang === "en" ? "Comment" : "Комментарий"
        }: ${commentField.value.trim()}\n`;
      }

      if (sectionContent.trim()) {
        message += `🔸 <b>${title}</b>\n` + sectionContent + "\n";
      }
    });

    return message;
  };

  // === Кнопка отправки ===
  const button = document.getElementById("sendToTelegram");
  button.addEventListener("click", () => {
    const chat_id = "-1002393080811"; // твой Telegram чат ID
    const worker_url = "https://shbb1.stassser.workers.dev/"; // твой Worker
    const accessKey = "14d92358-9b7a-4e16-b2a7-35e9ed71de43";

    // Отправка в Telegram через воркер
    const sendMessage = msg => {
      return fetch(worker_url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chat_id, text: msg })
      }).then(res => res.json());
    };

    // Отправка email через Web3Forms
    const sendEmail = async msg => {
      try {
        const res = await fetch("https://api.web3forms.com/submit", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            access_key: accessKey,
            subject: "ЗАКАЗ ПРОДУКТОВ",
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
      document
        .querySelectorAll("textarea.comment")
        .forEach(textarea => (textarea.value = ""));
    };

    (async () => {
      try {
        await sendAllParts(buildMessage("ru"));
        await sendAllParts(buildMessage("en"));

        alert("✅ ОТПРАВЛЕНО");
        localStorage.clear();
        clearForm();
      } catch (err) {
        alert("❌ Ошибка при отправке: " + err.message);
        console.error(err);
      }
    })();
  });
});
