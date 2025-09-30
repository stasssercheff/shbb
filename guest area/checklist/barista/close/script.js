document.addEventListener('DOMContentLoaded', () => {
  console.log("✅ DOM загружен, инициализация скрипта");

  const chat_id = '-1002915693964';
  const worker_url = 'https://shbb1.stassser.workers.dev/';
  const button = document.getElementById('sendBtn');

  if (!button) {
    console.error("❌ Кнопка #sendBtn не найдена на странице!");
    return;
  }

  // ✅ массив языков для отправки (берём из sendConfig.js)
  const sendLangs = window.sendLangs.length ? window.sendLangs : ["ru"];
  console.log("🌍 Языки отправки:", sendLangs);

  // 🟢 словарь шапки сообщений
  const headerDict = {
    title: {
      ru: "Бариста закрытие. Выполнено из 11:",
      en: "Barista close. Done from 11:",
      vi: "Barista đóng làm được trong 11"
    },
    date: {
      ru: "Дата",
      en: "Date",
      vi: "Ngày"
    }
  };

  // Строим сообщение полностью на одном языке
  const buildMessage = (lang) => {
    console.log(`🛠 Формируем сообщение полностью на языке: ${lang}`);

    const today = new Date();
    const date = `${String(today.getDate()).padStart(2,'0')}/${String(today.getMonth()+1).padStart(2,'0')}`;

    let message = `🧾 <b>${headerDict.title[lang] || headerDict.title.ru}</b>\n\n`;
    message += `📅 ${headerDict.date[lang] || headerDict.date.ru}: ${date}\n`;

    // Имя заполняющего
    const chefSelect = document.querySelector('select[name="chef"]');
    if (chefSelect) {
      const selectedOption = chefSelect.options[chefSelect.selectedIndex];
      message += `👤 ${selectedOption.textContent.trim()}\n\n`;
    }

    // Чеклист
    const checklist = document.querySelectorAll('#checklist input[type="checkbox"]');
    const selectedItems = [];

    checklist.forEach((item, index) => {
      if (item.checked) {
        const label = item.closest('.checklist-item')?.querySelector('label');
        if (label) {
          const key = label.dataset.i18n;
          const translated = key && translations[key] && translations[key][lang]
            ? translations[key][lang]
            : label.textContent.trim();
          selectedItems.push(`${index + 1}. ${translated}`);
        }
      }
    });

    if (!selectedItems.length) return null;
    message += selectedItems.join('\n');
    return message;
  };

  // Отправка сообщения на сервер (Telegram)
  const sendMessage = async (msg) => {
    const res = await fetch(worker_url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id, text: msg, parse_mode: "HTML" })
    });
    return res.json();
  };

  // Клик на кнопку отправки
  button.addEventListener('click', async () => {
    console.log("👆 Кнопка нажата");

    try {
      for (const lang of sendLangs) {
        const msg = buildMessage(lang);
        if (!msg) {
          alert('Выберите хотя бы один пункт');
          return;
        }
        await sendMessage(msg);
      }

      alert(`✅ Отправлено на: ${sendLangs.join(", ").toUpperCase()}`);
      document.querySelectorAll('#checklist input[type="checkbox"]').forEach(cb => cb.checked = false);
    } catch (err) {
      console.error("❌ Ошибка при отправке:", err);
      alert(`❌ Ошибка: ${err.message}`);
    }
  });
});
