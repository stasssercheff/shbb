document.addEventListener('DOMContentLoaded', () => {
  const chat_id = '-1002915693964';
  const worker_url = 'https://shbb1.stassser.workers.dev/';
  const button = document.getElementById('sendBtn');

  // === Централизованный язык ===
  let sendLang = localStorage.getItem('appLang') || 'ru'; // по умолчанию русский

  // === Отслеживаем переключение языка ===
  document.querySelectorAll('.lang-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const selectedLang = btn.dataset.lang;
      if (selectedLang) {
        sendLang = selectedLang;
        localStorage.setItem('appLang', selectedLang); // сохраним для всех страниц
      }
    });
  });

  const buildMessage = () => {
    const today = new Date();
    const date = `${String(today.getDate()).padStart(2, '0')}/${String(today.getMonth() + 1).padStart(2, '0')}`;

    let message = `🧾 <b>${
      sendLang === 'en' ? 'TO DO LIST' :
      sendLang === 'vi' ? 'DANH SÁCH CÔNG VIỆC' :
      'СПИСОК НА СЕГОДНЯ'
    }</b>\n\n`;

    message += `📅 ${
      sendLang === 'en' ? 'Date' :
      sendLang === 'vi' ? 'Ngày' :
      'Дата'
    }: ${date}\n`;

    // Имя сотрудника
    const chefSelect = document.querySelector('select[name="chef"]');
    if (chefSelect) {
      const selectedOption = chefSelect.options[chefSelect.selectedIndex];
      message += `👤 ${selectedOption.textContent.trim()}\n\n`;
    } else {
      message += `\n`;
    }

    // Отмеченные пункты
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

    if (selectedItems.length === 0) return null;
    message += selectedItems.join('\n');
    return message;
  };

  const sendMessage = (msg) => {
    return fetch(worker_url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id, text: msg, parse_mode: "HTML" })
    }).then(res => res.json());
  };

  button.addEventListener('click', async () => {
    const msg = buildMessage();

    if (!msg) {
      alert(
        sendLang === 'en' ? 'Please select at least one item' :
        sendLang === 'vi' ? 'Vui lòng chọn ít nhất một mục' :
        'Выберите хотя бы один пункт'
      );
      return;
    }

    try {
      await sendMessage(msg);
      alert(
        sendLang === 'en' ? '✅ SENT' :
        sendLang === 'vi' ? '✅ ĐÃ GỬI' :
        '✅ ОТПРАВЛЕНО'
      );

      // Сбрасываем чеклист
      document.querySelectorAll('#checklist input[type="checkbox"]').forEach(cb => cb.checked = false);
    } catch (err) {
      alert(
        sendLang === 'en' ? `❌ Error: ${err.message}` :
        sendLang === 'vi' ? `❌ Lỗi: ${err.message}` :
        `❌ Ошибка: ${err.message}`
      );
      console.error(err);
    }
  });
});
