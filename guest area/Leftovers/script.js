// === Переключение языка ===
function switchLanguage(lang) {
  document.documentElement.lang = lang;
  localStorage.setItem('selectedLang', lang);

  document.querySelectorAll('.section-title').forEach(title => {
    if (title.dataset[lang]) title.textContent = title.dataset[lang];
  });

  document.querySelectorAll('.check-label').forEach(label => {
    if (label.dataset[lang]) label.textContent = label.dataset[lang];
  });

  document.querySelectorAll('select').forEach(select => {
    Array.from(select.options).forEach(option => {
      if (option.value === '') option.textContent = '—';
      else if (option.dataset[lang]) option.textContent = option.dataset[lang];
    });
  });
}

// === Сохранение и восстановление данных формы ===
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
    if (data[select.name || select.id] !== undefined) select.value = data[select.name || select.id];
  });
  document.querySelectorAll('textarea.comment').forEach(textarea => {
    if (data[textarea.name || textarea.id] !== undefined) textarea.value = data[textarea.name || textarea.id];
  });
}

// === DOMContentLoaded ===
document.addEventListener('DOMContentLoaded', () => {
  // Выбор языка из localStorage или документа
  let lang = localStorage.getItem('selectedLang') || document.documentElement.lang || 'ru';
  document.documentElement.lang = lang;

  // Вставка пустой опции в каждый select.qty
  document.querySelectorAll('select.qty').forEach(select => {
    const hasEmpty = Array.from(select.options).some(opt => opt.value === '');
    if (!hasEmpty) {
      const emptyOption = document.createElement('option');
      emptyOption.value = '';
      emptyOption.dataset.ru = '—';
      emptyOption.dataset.en = '—';
      emptyOption.dataset.vi = '—';
      emptyOption.textContent = '—';
      emptyOption.selected = true;
      select.insertBefore(emptyOption, select.firstChild);
    }
  });

  restoreFormData();
  switchLanguage(lang);

  // Авто-дата
  const today = new Date();
  const day = String(today.getDate()).padStart(2, '0');
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const formattedDate = `${day}/${month}`;
  const dateDiv = document.getElementById('autodate');
  if (dateDiv) dateDiv.textContent = formattedDate;

  // Сохранение данных при изменении
  document.querySelectorAll('select, textarea.comment').forEach(el => {
    el.addEventListener('input', saveFormData);
  });

  // === Сборка сообщения для Telegram/email ===
  const buildMessage = (lang) => {
    let message = `🧾 <b>${lang === 'en' ? 'LEFTOVER/GIVEN' : 'ОСТАТКИ/ВЫСТАЛЕНО'}</b>\n\n`;
    message += `📅 ${lang === 'en' ? 'Date' : 'Дата'}: ${formattedDate}\n`;

    const nameSelect = document.querySelector('select[name="chef"]');
    const selectedChef = nameSelect?.options[nameSelect.selectedIndex];
    const name = selectedChef?.dataset[lang] || '—';
    message += `${lang === 'en' ? '👨‍🍳 Name' : '👨‍🍳 Имя'}: ${name}\n`;

    const actionSelect = document.querySelector('select[name="actionType"]');
    if (actionSelect && actionSelect.value) {
      const selectedAction = actionSelect.options[actionSelect.selectedIndex];
      const actionText = selectedAction?.dataset[lang] || selectedAction.textContent;
      message += `${lang === 'en' ? '📌 Action' : '📌 Действие'}: ${actionText}\n`;
    }

    message += '\n';

    document.querySelectorAll('.menu-section').forEach(section => {
      const sectionTitle = section.querySelector('.section-title');
      const title = sectionTitle?.dataset[lang] || '';
      let sectionContent = '';

      section.querySelectorAll('.dish').forEach(dish => {
        const select = dish.querySelector('select.qty');
        if (!select || !select.value) return;

        const label = dish.querySelector('label.check-label');
        const labelText = label?.dataset[lang] || '—';
        const selectedOption = select.options[select.selectedIndex];
        const value = selectedOption?.dataset[lang] || selectedOption.textContent;
        sectionContent += `• ${labelText}: ${value}\n`;
      });

      const commentField = section.querySelector('textarea.comment');
      if (commentField && commentField.value.trim()) {
        sectionContent += `💬 ${lang === 'en' ? 'Comment' : 'Комментарий'}: ${commentField.value.trim()}\n`;
      }

      if (sectionContent.trim()) {
        message += `🔸 <b>${title}</b>\n` + sectionContent + '\n';
      }
    });

    return message;
  };

  // === Кнопка отправки ===
  const button = document.getElementById('sendToTelegram');
  button.addEventListener('click', () => {
    const chat_id = '-1002915693964';
    const worker_url = 'https://shbb1.stassser.workers.dev/';
    const accessKey = "14d92358-9b7a-4e16-b2a7-35e9ed71de43";

    const sendMessage = (msg) => fetch(worker_url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id, text: msg })
    }).then(res => res.json());

    const sendEmail = async (msg) => {
      try {
        const res = await fetch("https://api.web3forms.com/submit", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            access_key: accessKey,
            subject: "ОСТАТКИ/ВЫСТАЛЕНО",
            from_name: "SHBB PASTRY",
            reply_to: "no-reply@shbb.com",
            message: msg
          })
        }).then(r => r.json());

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
      document.querySelectorAll('select').forEach(select => select.value = '');
      document.querySelectorAll('textarea.comment').forEach(textarea => textarea.value = '');
    };

    (async () => {
      try {
        await sendAllParts(buildMessage('ru'));
        alert('✅ ОТПРАВЛЕНО');
        localStorage.removeItem('formData');
        clearForm();
      } catch (err) {
        alert('❌ Ошибка при отправке: ' + err.message);
        console.error(err);
      }
    })();
  });

  // === Кнопки переключения языка на странице ===
  document.querySelectorAll('.lang-btn').forEach(btn => {
    btn.addEventListener('click', () => switchLanguage(btn.dataset.lang));
  });
});