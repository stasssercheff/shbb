// === Навигация ===
function goHome() {
  location.href = "http://stasssercheff.github.io/shbb/";
}

function goBack() {
  const currentPath = window.location.pathname;
  const parentPath = currentPath.substring(0, currentPath.lastIndexOf("/"));
  const upperPath = parentPath.substring(0, parentPath.lastIndexOf("/"));
  window.location.href = upperPath + "/index.html";
}

// === Переключение языка через lang.json ===
async function switchLanguage(lang) {
  try {
    const response = await fetch("lang.json"); // lang.json в той же папке
    const translations = await response.json();

    document.documentElement.lang = lang;

    document.querySelectorAll("[data-i18n]").forEach((el) => {
      const key = el.dataset.i18n;
      if (translations[key] && translations[key][lang]) {
        if (el.tagName === "INPUT") {
          if (el.type === "submit" || el.type === "button") {
            el.value = translations[key][lang];
          } else if (el.hasAttribute("placeholder")) {
            el.setAttribute("placeholder", translations[key][lang]);
          }
        } else if (el.hasAttribute("placeholder")) {
          el.setAttribute("placeholder", translations[key][lang]);
        } else {
          el.textContent = translations[key][lang];
        }
      }
    });

    // Для <option> внутри select
    document.querySelectorAll("select option[data-i18n]").forEach((opt) => {
      const key = opt.dataset.i18n;
      if (translations[key] && translations[key][lang]) {
        opt.textContent = translations[key][lang];
      }
    });

  } catch (err) {
    console.error("Ошибка загрузки lang.json:", err);
  }
}

// === Сохранение и восстановление данных формы ===
function saveFormData() {
  const data = {};
  document.querySelectorAll("select").forEach((select) => {
    data[select.name || select.id] = select.value;
  });
  document.querySelectorAll("textarea.comment").forEach((textarea) => {
    data[textarea.name || textarea.id] = textarea.value;
  });
  localStorage.setItem("formData", JSON.stringify(data));
}

function restoreFormData() {
  const saved = localStorage.getItem("formData");
  if (!saved) return;
  const data = JSON.parse(saved);
  document.querySelectorAll("select").forEach((select) => {
    if (data[select.name || select.id] !== undefined)
      select.value = data[select.name || select.id];
  });
  document.querySelectorAll("textarea.comment").forEach((textarea) => {
    if (data[textarea.name || textarea.id] !== undefined)
      textarea.value = data[textarea.name || textarea.id];
  });
}

// === DOMContentLoaded ===
document.addEventListener("DOMContentLoaded", () => {
  const lang = document.documentElement.lang || "ru";

  // Добавляем дефолтный пункт “–” в каждый select.qty
  document.querySelectorAll("select.qty").forEach((select) => {
    const hasEmpty = Array.from(select.options).some(
      (opt) => opt.value === ""
    );
    if (!hasEmpty) {
      const emptyOption = document.createElement("option");
      emptyOption.value = "";
      emptyOption.textContent = "—";
      emptyOption.selected = true;
      select.insertBefore(emptyOption, select.firstChild);
    }
  });

  restoreFormData();
  switchLanguage(lang);

  // === Установка даты ===
  const today = new Date();
  const day = String(today.getDate()).padStart(2, "0");
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const formattedDate = `${day}/${month}`;
  const dateDiv = document.getElementById("autodate") || document.getElementById("current-date");
  if (dateDiv) dateDiv.textContent = formattedDate;

  // === Автосохранение изменений ===
  document.querySelectorAll("select, textarea.comment").forEach((el) => {
    el.addEventListener("input", saveFormData);
  });

  // === Функция сборки сообщения ===
  const buildMessage = (lang) => {
    let message = `🧾 <b>${lang === "en" ? "KITCHEN-CLOSE" : "КУХНЯ-ЗАКРЫТИЕ"}</b>\n\n`;
    message += `📅 ${lang === "en" ? "Date" : "Дата"}: ${formattedDate}\n`;

    const nameSelect = document.querySelector('select[name="chef"]');
    const selectedChef = nameSelect?.options[nameSelect.selectedIndex];
    const name = selectedChef?.dataset[lang] || "—";
    message += `${lang === "en" ? "👨‍🍳 Name" : "👨‍🍳 Имя"}: ${name}\n\n`;

    document.querySelectorAll(".menu-section").forEach((section) => {
      const sectionTitle = section.querySelector(".section-title");
      const title = sectionTitle?.dataset.i18n
        ? sectionTitle.textContent
        : "";
      let sectionContent = "";

      section.querySelectorAll(".dish").forEach((dish) => {
        const select = dish.querySelector("select.qty");
        if (!select || !select.value) return;

        const label = dish.querySelector("label.check-label");
        const labelText = label?.textContent || "—";
        const selectedOption = select.options[select.selectedIndex];
        const value = selectedOption?.textContent || "—";
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
  if (button) {
    button.addEventListener("click", () => {
      const chat_id = "-1002393080811";
      const worker_url = "https://shbb1.stassser.workers.dev/";
      const accessKey = "14d92358-9b7a-4e16-b2a7-35e9ed71de43";

      const sendMessage = (msg) => {
        return fetch(worker_url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ chat_id, text: msg }),
        }).then((res) => res.json());
      };

      const sendEmail = async (msg) => {
        try {
          const res = await fetch("https://api.web3forms.com/submit", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              access_key: accessKey,
              subject: "КУХНЯ-ЗАКРЫТИЕ",
              from_name: "SHBB KITCHEN-CLOSE",
              reply_to: "no-reply@shbb.com",
              message: msg,
            }),
          }).then((r) => r.json());

          if (!res.success) alert("Ошибка отправки email. Проверьте форму.");
        } catch (err) {
          alert("Ошибка отправки email: " + err.message);
        }
      };

      const sendAllParts = async (text) => {
        let start = 0;
        while (start < text.length) {
          const chunk = text.slice(start, start + 4000);
          await sendMessage(chunk);
          await sendEmail(chunk);
          start += 4000;
        }
      };

      const clearForm = () => {
        document.querySelectorAll("select").forEach((select) => (select.value = ""));
        document.querySelectorAll("textarea.comment").forEach((textarea) => (textarea.value = ""));
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
  }

  // === Кнопки переключения языка ===
  document.querySelectorAll(".lang-btn").forEach(btn => {
    btn.addEventListener("click", () => switchLanguage(btn.dataset.lang));
  });
});
