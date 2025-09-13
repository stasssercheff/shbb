// === Переключение языка ===
function switchLanguage(lang) {
  document.documentElement.lang = lang;

  // Заголовки разделов
  document.querySelectorAll('.section-title').forEach(title => {
    if (title.dataset[lang]) title.textContent = title.dataset[lang];
  });

  // Метки
  document.querySelectorAll('.check-label').forEach(label => {
    if (label.dataset[lang]) label.textContent = label.dataset[lang];
  });

  // Опции селекторов
  document.querySelectorAll('select').forEach(select => {
    Array.from(select.options).forEach(option => {
      if (option.value === '') {
        option.textContent = '—';
      } else if (option.dataset[lang]) {
        option.textContent = option.dataset[lang];
      }
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

// === DOMContentLoaded ===
document.addEventListener('DOMContentLoaded', () => {
  const lang = document.documentElement.lang || 'ru';

  // Вставка пустой опции, восстановление данных, перевод и т.д.
  // ... твой существующий код switchLanguage, restoreFormData, автодата, автосохранение ...

  // === Кнопка отправки ===
  const button = document.getElementById('sendToTelegram');
  if (button) { // теперь обработчик добавляется точно после загрузки DOM
    button.addEventListener('click', () => {
      const chat_id = '-1003076643701';
      const worker_url = 'https://shbb1.stassser.workers.dev/';
      const accessKey = "14d92358-9b7a-4e16-b2a7-35e9ed71de43";

      const sendMessage = (msg) => {
        return fetch(worker_url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ chat_id, text: msg })
        }).then(res => res.json());
      };

      const sendEmail = async (msg) => {
        try {
          const res = await fetch("https://api.web3forms.com/submit", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              access_key: accessKey,
              subject: "Отдано",
              from_name: "ШББ кондитерка",
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

      (async () => {
        try {
          await sendAllParts(buildMessage('ru'));
          await sendAllParts(buildMessage('en'));

          alert('✅ отправлено!');
          localStorage.clear();
        } catch (err) {
          alert('❌ Ошибка при отправке: ' + err.message);
          console.error(err);
        }
      })();
    });
  }
});