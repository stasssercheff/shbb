// script.js
document.addEventListener('DOMContentLoaded', () => {
  const chat_id = '-1002915693964';
  const worker_url = 'https://shbb1.stassser.workers.dev/';
  const button = document.getElementById('sendBtn');

  console.log('✅ Скрипт загружен, текущий язык:', window.currentLang);

  const buildMessage = () => {
    const today = new Date();
    const date = `${String(today.getDate()).padStart(2, '0')}/${String(today.getMonth() + 1).padStart(2, '0')}`;

    let message = `🧾 <b>${
      window.currentLang === 'en' ? 'Barista close' :
      window.currentLang === 'vi' ? 'Barista đóng' :
      'Бариста закрытие'
    }</b>\n\n`;

    message += `📅 ${
      window.currentLang === 'en' ? 'Date' :
      window.currentLang === 'vi' ? 'Ngày' :
      'Дата'
    }: ${date}\n`;

    // 👤 Имя сотрудника
    const chefSelect = document.querySelector('select[name="chef"]');
    if (chefSelect) {
      const selectedOption = chefSelect.options[chefSelect.selectedIndex];
      message += `👤 ${selectedOption.textContent.trim()}\n\n`;
    } else {
      message += `\n`;
    }

    // ✅ Собираем чеклист
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
    console.log('📤 Готовое сообщение:', message);
    return message;
  };

  const sendMessage = async (msg) => {
    console.log('🔄 Отправляем на Worker...');
    const res = await fetch(worker_url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id, text: msg, parse_mode: "HTML" })
    });

    console.log('📥 Ответ от Worker:', res.status);
    const data = await res.json();
    console.log('📥 JSON:', data);
    return data;
  };

  button.addEventListener('click', async () => {
    const msg = buildMessage();

    if (!msg) {
      alert(
        window.currentLang === 'en' ? 'Please select at least one item' :
        window.currentLang === 'vi' ? 'Vui lòng chọn ít nhất một mục' :
        'Выберите хотя бы один пункт'
      );
      return;
    }

    try {
      const result = await sendMessage(msg);
      if (result.ok) {
        alert(
          window.currentLang === 'en' ? '✅ SENT' :
          window.currentLang === 'vi' ? '✅ ĐÃ GỬI' :
          '✅ ОТПРАВЛЕНО'
        );
      } else {
        alert('⚠️ Telegram ответил с ошибкой, смотри консоль');
        console.error(result);
      }

      // Сбрасываем чеклист
      document.querySelectorAll('#checklist input[type="checkbox"]').forEach(cb => cb.checked = false);
    } catch (err) {
      console.error('❌ Ошибка отправки:', err);
      alert(
        window.currentLang === 'en' ? `❌ Error: ${err.message}` :
        window.currentLang === 'vi' ? `❌ Lỗi: ${err.message}` :
        `❌ Ошибка: ${err.message}`
      );
    }
  });
});
