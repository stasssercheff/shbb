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

// === Автоподстановка даты ===
document.addEventListener("DOMContentLoaded", async () => {
  const dateEl = document.getElementById("current-date");
  if (dateEl) {
    const today = new Date();
    const day = String(today.getDate()).padStart(2, '0');
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const year = today.getFullYear();
    dateEl.textContent = `${day}.${month}.${year}`;
  }

  // === Загружаем переводы до их использования ===
  await loadTranslations();

  const lang = localStorage.getItem("lang") || "ru";

  // Пустая опция для select.qty
  document.querySelectorAll("select.qty").forEach(select => {
    const hasEmpty = Array.from(select.options).some(opt => opt.value === "");
    if (!hasEmpty) {
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

  const today = new Date();
  const day = String(today.getDate()).padStart(2, "0");
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const formattedDate = `${day}/${month}`;

  document.querySelectorAll("select, textarea.comment").forEach(el => {
    el.addEventListener("input", saveFormData);
  });

  // === Функция сборки сообщения ===
  const buildMessage = lang => {
    let message = `🧾 <b>${lang === "en" ? "PRODUCT ORDER" : "ЗАКАЗ ПРОДУКТОВ"}</b>\n\n`;
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
      const title = translations[titleKey]?.[lang] || sectionTitle?.textContent || "";

      let sectionContent = "";
      let itemIndex = 1;

      section.querySelectorAll(".dish").forEach(dish => {
        const select = dish.querySelector("select.qty");
        if (!select || !select.value) return;

        const label = dish.querySelector("label");
        const labelKey = label?.dataset.i18n;
        const labelText = translations[labelKey]?.[lang] || label?.textContent || "—";

        sectionContent += `${itemIndex}. ${labelText}\n`;
        itemIndex++;
      });

      const commentField = section.querySelector("textarea.comment");
      if (commentField && commentField.value.trim()) {
        sectionContent += `💬 ${lang === "en" ? "Comment" : "Комментарий"}: ${commentField.value.trim()}\n`;
      }

      if (sectionContent.trim()) {
        message += `\n<b>${title}</b>\n${sectionContent}\n`;
      }
    });

    return message;
  };

  // === Кнопка отправки ===
  const button = document.getElementById("sendToTelegram");
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
      document.querySelectorAll("textarea.comment").forEach(textarea => (textarea.value = ""));
    };

    try {
      // ✅ Используем языки из sendConfig.js
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
});
