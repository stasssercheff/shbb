// === Навигация ===
function goHome() {
  location.href = '/index.html';
}
function goBack() {
  history.back();
}

// === Сохранение данных ===
function saveFormData() {
  const data = {};
  document.querySelectorAll('select').forEach(select => {
    data[select.name || select.id] = select.value;
  });
  document.querySelectorAll('textarea.comment').forEach(textarea => {
    data[textarea.name || textarea.id] = textarea.value;
  });
  localStorage.setItem('formData', JSON.stringify(data));
}

function restoreFormData() {
  const saved = localStorage.getItem('formData');
  if (!saved) return;
  const data = JSON.parse(saved);
  document.querySelectorAll('select').forEach(select => {
    if (data[select.name || select.id] !== undefined) {
      select.value = data[select.name || select.id];
    }
  });
  document.querySelectorAll('textarea.comment').forEach(textarea => {
    if (data[textarea.name || textarea.id] !== undefined) {
      textarea.value = data[textarea.name || textarea.id];
    }
  });
}

// === Генерация сообщения ===
function buildMessage(lang, formattedDate) {
  let message = `${lang === 'en' ? 'ORDER' : 'ЗАКАЗ'}\n\n`;
  message += `${lang === 'en' ? 'Date' : 'Дата'}: ${formattedDate}\n`;

  // Имя повара (берём select вне menu-section)
  const nameSelect = document.querySelector('#employeeSelect');
  const selectedChef = nameSelect?.options[nameSelect.selectedIndex];
  const name = selectedChef?.dataset[lang] || '-';
  message += `${lang === 'en' ? 'Name' : 'Имя'}: ${name}\n\n`;

  // Перебор всех menu-section (кроме первой, где имя)
  document.querySelectorAll('.menu-section').forEach((section, index) => {
    if (index === 0) return; // пропускаем блок с именем

    const sectionTitle = section.querySelector('.section-title');
    const title = sectionTitle?.dataset[lang] || sectionTitle?.textContent || '';
    let sectionContent = '';
    let counter = 1;

    section.querySelectorAll('.dish').forEach(dish => {
      const select = dish.querySelector('select.qty');
      if (!select || !select.value) return;

      const label = dish.querySelector('label');
      const labelText = label?.dataset[lang] || label?.textContent || '-';
      const selectedOption = select.options[select.selectedIndex];
      const value = selectedOption?.dataset[lang] || selectedOption?.textContent || '-';
      sectionContent += `${counter}. ${labelText}: ${value}\n`;
      counter++;
    });

    const commentField = section.querySelector('textarea.comment');
    if (commentField && commentField.value.trim()) {
      sectionContent += `${lang === 'en' ? 'Comment' : 'Комментарий'}: ${commentField.value.trim()}\n`;
    }

    if (sectionContent.trim()) {
      message += `${title}\n${sectionContent}\n`;
    }
  });

  return message.trim();
}

// === Кнопка отправки ===
const button = document.getElementById('sendToTelegram');
button.addEventListener('click', async () => {
  const chat_id = '-1002393080811';
  const worker_url = 'https://shbb1.stassser.workers.dev/';
  const accessKey = "14d92358-9b7a-4e16-b2a7-35e9ed71de43";

  const sendMessage = (msg) => fetch(worker_url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id, text: msg })
  });

  const sendEmail = (msg) => fetch("https://api.web3forms.com/submit", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      access_key: accessKey,
      subject: "ЗАКАЗ",
      from_name: "SHBB KITCHEN",
      reply_to: "no-reply@shbb.com",
      message: msg
    })
  });

  const sendAllParts = async (text) => {
    let start = 0;
    while (start < text.length) {
      const chunk = text.slice(start, start + 4000);
      await sendMessage(chunk);
      await sendEmail(chunk);
      start += 4000;
    }
  };

  try {
    // Формируем дату
    const today = new Date();
    const day = String(today.getDate()).padStart(2, '0');
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const formattedDate = `${day}/${month}`;

    // Сначала русский, потом английский
    const messageRu = buildMessage('ru', formattedDate);
    const messageEn = buildMessage('en', formattedDate);

    await sendAllParts(messageRu);
    await sendAllParts(messageEn);

    alert('✅ ОТПРАВЛЕНО');
    localStorage.clear();
    document.querySelectorAll('select').forEach(select => select.value = '');
    document.querySelectorAll('textarea.comment').forEach(textarea => textarea.value = '');
  } catch (err) {
    alert('❌ Ошибка при отправке: ' + err.message);
    console.error(err);
  }
});
