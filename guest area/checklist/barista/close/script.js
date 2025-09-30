// === script.js ===
document.addEventListener('DOMContentLoaded', () => {
  const chat_id = '-1002915693964';
  const worker_url = 'https://shbb1.stassser.workers.dev/';
  const button = document.getElementById('sendBtn');

  if (!button) return;

  const headerDict = {
    title: { 
      ru: "Бариста закрытие. Выполнено из 11:", 
      en: "Barista close. Done from 11:", 
      vi: "Barista đóng làm được trong 11" },
    date: { 
      ru: "Дата", 
      en: "Date", 
      vi: "Ngày" }
  };

  const buildMessage = (lang) => {
    const today = new Date();
    const date = `${String(today.getDate()).padStart(2,'0')}/${String(today.getMonth()+1).padStart(2,'0')}`;

    let message = `🧾 <b>${headerDict.title[lang] || headerDict.title.ru}</b>\n\n`;
    message += `📅 ${headerDict.date[lang] || headerDict.date.ru}: ${date}\n`;

    const chefSelect = document.querySelector('select[name="chef"]');
    if (chefSelect) {
      const selectedOption = chefSelect.options[chefSelect.selectedIndex];
      message += `👤 ${selectedOption.textContent.trim()}\n\n`;
    }

    const checklist = document.querySelectorAll('#checklist input[type="checkbox"]');
    let selectedItems = [];
    checklist.forEach((item, index) => {
      if (item.checked) {
        const label = item.closest('.checklist-item')?.querySelector('label');
        if (label) {
          const key = label.dataset.i18n;
          const translated = key && translations && translations[key] && translations[key][lang]
            ? translations[key][lang]
            : label.textContent.trim();
          selectedItems.push(`${index+1}. ${translated}`);
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
    try {
      // Берём актуальные языки прямо из sendConfig.js
      const currentProfile = getCurrentProfile();
      const sendLangs = getSendLanguages(currentProfile);
      console.log("🌍 Актуальные языки отправки:", sendLangs);

      let anySent = false;
      for (const lang of sendLangs) {
        const msg = buildMessage(lang);
        if (!msg) continue; // пропускаем язык без выбранных пунктов
        await sendMessage(msg);
        anySent = true;
      }

      if (anySent) {
        alert(`✅ Отправлено на: ${sendLangs.join(", ").toUpperCase()}`);
        document.querySelectorAll('#checklist input[type="checkbox"]').forEach(cb => cb.checked = false);
      } else {
        alert('⚠ Выберите хотя бы один пункт для отправки');
      }
    } catch (err) {
      console.error(err);
      alert(`❌ Ошибка: ${err.message}`);
    }
  });
});
