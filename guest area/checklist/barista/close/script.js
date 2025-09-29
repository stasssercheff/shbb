document.addEventListener('DOMContentLoaded', () => {
  console.log("✅ DOM загружен, инициализация скрипта");

  const chat_id = '-1002915693964';
  const worker_url = 'https://shbb1.stassser.workers.dev/';
  const button = document.getElementById('sendBtn');

  if (!button) {
    console.error("❌ Кнопка #sendBtn не найдена на странице!");
    return;
  }

  // ✅ массив языков для отправки (берётся из sendConfig.js)
  const sendLangs = window.sendLangs || [window.sendLang || "ru"];
  console.log("🌍 Языки отправки:", sendLangs);

  const buildMessage = (lang) => {
    console.log(`🛠 Формируем сообщение полностью на языке: ${lang}`);

    const today = new Date();
    const date = `${String(today.getDate()).padStart(2, '0')}/${String(today.getMonth() + 1).padStart(2, '0')}`;

    // === Шапка сообщения ===
    let message = `🧾 <b>${
      lang === 'en' ? 'Barista close. Done form 11:' :
      lang === 'vi' ? 'Barista đóng làm được trong 11' :
      'Бариста закрытие. Выполнено из 11:'
    }</b>\n\n`;

    message += `📅 ${
      lang === 'en' ? 'Date' :
      lang === 'vi' ? 'Ngày' :
      'Дата'
    }: ${date}\n`;

    // === Кто заполнял ===
    const chefSelect = document.querySelector('select[name="chef"]');
    if (chefSelect) {
      const selectedOption = chefSelect.options[chefSelect.selectedIndex];
      message += `👤 ${selectedOption.textContent.trim()}\n\n`;
    }

    // === Чеклист ===
    const checklist = document.querySelectorAll('#checklist input[type="checkbox"]');
    let selectedItems = [];

    checklist.forEach((item, index) => {
      if (item.checked) {
        const label = item.closest('.checklist-item')?.querySelector('label');
        if (label) {
          // 🟢 Тянем текст не из DOM, а из словаря по ключу data-i18n
          const key = label.dataset.i18n;
          const translated =
            key && translations[key] && translations[key][lang]
              ? translations[key][lang]
              : label.textContent.trim(); // fallback если нет перевода
          selectedItems.push(`${index + 1}. ${translated}`);
        }
      }
    });

    if (selectedItems.length === 0) return null;
    message += selectedItems.join('\n');
    return message;
  };

  const sendMessage = async (msg) => {
    const res = await fetch(worker_url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id, text: msg, parse_mode: "HTML" })
    });
    return res.json();
  };

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
