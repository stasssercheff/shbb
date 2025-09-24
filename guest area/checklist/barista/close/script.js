document.addEventListener('DOMContentLoaded', () => {
  const chat_id = '-1002915693964';
  const worker_url = 'https://shbb1.stassser.workers.dev/';
  const button = document.getElementById('sendBtn');

  // Берём язык из глобальной переменной lang.js
  const getCurrentLang = () => window.currentLang || localStorage.getItem('lang') || 'ru';

  const buildMessage = () => {
    const lang = getCurrentLang();
    const today = new Date();
    const date = `${String(today.getDate()).padStart(2, '0')}/${String(today.getMonth() + 1).padStart(2, '0')}`;

    let message = `🧾 <b>${
      lang === 'en' ? 'Barista close' :
      'Бариста закрытие'
    }</b>\n\n`;

    message += `📅 ${
      lang === 'en' ? 'Date' :
      'Дата'
    }: ${date}\n`;

    // имя сотрудника
    const chefSelect = document.querySelector('select[name="chef"]');
    if (chefSelect) {
      const selectedOption = chefSelect.options[chefSelect.selectedIndex];
      const name = selectedOption.textContent.trim();
      if (name) {
        message += `👤 ${name}\n\n`;
      }
    }

    // чеклист
    const checklist = document.querySelectorAll('#checklist input[type="checkbox"]');
    let selectedItems = [];

    checklist.forEach((item, index) => {
      if (item.checked) {
        const label = item.closest('.checklist-item')?.querySelector('label');
        if (label) {
          selectedItems.push(`${index + 1}. ${label.textContent.trim()}`);
        }
      }
    });

    if (!selectedItems.length) return null;
    message += selectedItems.join('\n');
    return message;
  };

  const sendMessage = async (msg) => {
    const response = await fetch(worker_url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id,
        text: msg,
        parse_mode: "HTML"
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP error ${response.status}`);
    }

    return response.json();
  };

  button.addEventListener('click', async () => {
    const lang = getCurrentLang();
    const msg = buildMessage();

    if (!msg) {
      alert(
        lang === 'en' ? 'Please select at least one item' :
        lang === 'vi' ? 'Vui lòng chọn ít nhất một mục' :
        'Выберите хотя бы один пункт'
      );
      return;
    }

    try {
      await sendMessage(msg);
      alert(
        lang === 'en' ? '✅ SENT' :
        lang === 'vi' ? '✅ ĐÃ GỬI' :
        '✅ ОТПРАВЛЕНО'
      );

      // сбрасываем чеклист
      document.querySelectorAll('#checklist input[type="checkbox"]').forEach(cb => cb.checked = false);
    } catch (err) {
      console.error('Ошибка отправки:', err);
      alert(
        lang === 'en' ? `❌ Error: ${err.message}` :
        lang === 'vi' ? `❌ Lỗi: ${err.message}` :
        `❌ Ошибка: ${err.message}`
      );
    }
  });
});
