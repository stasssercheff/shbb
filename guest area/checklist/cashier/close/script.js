document.addEventListener('DOMContentLoaded', () => {
  console.log("✅ DOM загружен, инициализация скрипта");

  const chat_id = '-1002915693964';
  const worker_url = 'https://shbb1.stassser.workers.dev/';
  const button = document.getElementById('sendBtn');

  if (!button) {
    console.error("❌ Кнопка #sendBtn не найдена на странице!");
    return;
  }
  console.log("✅ Кнопка найдена, навешиваем обработчик...");

let sendLang = localStorage.getItem('sendLang') || 'ru';
  console.log("🌍 Текущий язык для отправки:", sendLang);

  document.querySelectorAll('.lang-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const selectedLang = btn.dataset.lang;
      if (selectedLang) {
        sendLang = selectedLang;
        localStorage.setItem('lang', selectedLang);
        console.log("🔄 Язык изменён:", sendLang);
      }
    });
  });

  const buildMessage = () => {
    console.log("🛠 Формируем сообщение...");
    const today = new Date();
    const date = `${String(today.getDate()).padStart(2, '0')}/${String(today.getMonth() + 1).padStart(2, '0')}`;

    let message = `🧾 <b>${
      sendLang === 'en' ? 'Cashier close. Done form 11:' :
      sendLang === 'vi' ? 'Thu ngân đóng làm được trong 11' :
      'Кассир закрытие. Выполнено из 11:'
    }</b>\n\n`;

    message += `📅 ${
      sendLang === 'en' ? 'Date' :
      sendLang === 'vi' ? 'Ngày' :
      'Дата'
    }: ${date}\n`;

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
        if (label) selectedItems.push(`${index + 1}. ${label.textContent.trim()}`);
      }
    });

    if (selectedItems.length === 0) {
      console.warn("⚠️ Ничего не выбрано");
      return null;
    }

    message += selectedItems.join('\n');
    console.log("📤 Готовое сообщение:", message);
    return message;
  };

  const sendMessage = async (msg) => {
    console.log("🔄 Отправляем на Worker...");
    const res = await fetch(worker_url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id, text: msg, parse_mode: "HTML" })
    });
    console.log("📥 Ответ от Worker:", res.status);
    const data = await res.json();
    console.log("📥 JSON:", data);
    return data;
  };

  button.addEventListener('click', async () => {
    console.log("👆 Кнопка нажата");
    const msg = buildMessage();

    if (!msg) {
      alert('Выберите хотя бы один пункт');
      return;
    }

    try {
      await sendMessage(msg);
      alert('✅ ОТПРАВЛЕНО');
      document.querySelectorAll('#checklist input[type="checkbox"]').forEach(cb => cb.checked = false);
    } catch (err) {
      console.error("❌ Ошибка при отправке:", err);
      alert(`❌ Ошибка: ${err.message}`);
    }
  });
});
