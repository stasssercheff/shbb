// ======================
// Переключение языка через глобальный словарь
// ======================
function switchLanguage(lang) {
    document.documentElement.lang = lang;
    localStorage.setItem('selectedLang', lang);

    // Перевод всех элементов с data-i18n
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.dataset.i18n;
        if (translations[key] && translations[key][lang]) {
            el.textContent = translations[key][lang];
        }
    });

    // Перевод опций select
    document.querySelectorAll('select').forEach(select => {
        Array.from(select.options).forEach(option => {
            const key = option.dataset.i18n;
            if (key && translations[key] && translations[key][lang]) {
                option.textContent = translations[key][lang];
            }
        });
    });
}

// ======================
// Сохранение и восстановление данных формы
// ======================
function saveFormData() {
    const data = {};
    document.querySelectorAll('select').forEach(select => data[select.name] = select.value);
    document.querySelectorAll('textarea.comment').forEach(text => data[text.name || text.id] = text.value);
    localStorage.setItem('formData', JSON.stringify(data));
}

function restoreFormData() {
    const saved = localStorage.getItem('formData');
    if (!saved) return;
    const data = JSON.parse(saved);
    document.querySelectorAll('select').forEach(select => {
        if (data[select.name] !== undefined) select.value = data[select.name];
    });
    document.querySelectorAll('textarea.comment').forEach(text => {
        if (data[text.name || text.id] !== undefined) text.value = data[text.name || text.id];
    });
}

// ======================
// DOMContentLoaded
// ======================
document.addEventListener('DOMContentLoaded', () => {
    // Выбор языка
    const lang = localStorage.getItem('selectedLang') || document.documentElement.lang || 'ru';
    switchLanguage(lang);

    // Восстановление формы
    restoreFormData();

    // Сохранение данных при изменении
    document.querySelectorAll('select, textarea.comment').forEach(el => el.addEventListener('input', saveFormData));

    // Авто-дата
    const today = new Date();
    const day = String(today.getDate()).padStart(2, '0');
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const formattedDate = `${day}/${month}`;
    const dateDiv = document.getElementById('autodate');
    if (dateDiv) dateDiv.textContent = formattedDate;

    // Переключение языка кнопками
    document.querySelectorAll('.lang-btn').forEach(btn => {
        btn.addEventListener('click', () => switchLanguage(btn.dataset.lang));
    });

    // Кнопка отправки (оставляем твою логику)
    const button = document.getElementById('sendToTelegram');
    if (button) {
        button.addEventListener('click', async () => {
            const msgRu = buildMessage('ru');
            const msgEn = buildMessage('en');
            try {
                await sendAllParts(msgRu);
                await sendAllParts(msgEn);
                alert('✅ ОТПРАВЛЕНО');
                localStorage.removeItem('formData');
                document.querySelectorAll('select').forEach(s => s.value = '');
                document.querySelectorAll('textarea.comment').forEach(t => t.value = '');
            } catch (err) {
                alert('❌ Ошибка: ' + err.message);
            }
        });
    }
});

// ======================
// Функции сборки сообщений для Telegram/email
// ======================
function buildMessage(lang) {
    let message = `🧾 <b>${lang === 'en' ? 'LEFTOVER/GIVEN' : 'ОСТАТКИ/ВЫСТАЛЕНО'}</b>\n\n`;
    const today = new Date();
    const day = String(today.getDate()).padStart(2, '0');
    const month = String(today.getMonth() + 1).padStart(2, '0');
    message += `${lang === 'en' ? 'Date' : 'Дата'}: ${day}/${month}\n`;

    document.querySelectorAll('.menu-section').forEach(section => {
        const sectionTitle = section.querySelector('.section-title');
        if (!sectionTitle) return;
        const titleKey = sectionTitle.dataset.i18n;
        const titleText = translations[titleKey]?.[lang] || '';
        let sectionContent = '';

        section.querySelectorAll('.dish').forEach(dish => {
            const label = dish.querySelector('label.check-label');
            const select = dish.querySelector('select.qty');
            if (!label || !select || !select.value) return;
            const labelKey = label.dataset.i18n;
            const selectedOptionKey = select.options[select.selectedIndex].dataset.i18n;
            const labelText = translations[labelKey]?.[lang] || label.textContent;
            const optionText = translations[selectedOptionKey]?.[lang] || select.options[select.selectedIndex].textContent;
            sectionContent += `• ${labelText}: ${optionText}\n`;
        });

        const commentField = section.querySelector('textarea.comment');
        if (commentField && commentField.value.trim()) {
            sectionContent += `💬 ${lang === 'en' ? 'Comment' : 'Комментарий'}: ${commentField.value.trim()}\n`;
        }

        if (sectionContent.trim()) message += `🔸 <b>${titleText}</b>\n${sectionContent}\n`;
    });

    return message;
}

// ======================
// Отправка сообщений (оставляем твою логику)
// ======================
async function sendAllParts(text) {
    const chat_id = '-1002915693964';
    const worker_url = 'https://shbb1.stassser.workers.dev/';
    const accessKey = "14d92358-9b7a-4e16-b2a7-35e9ed71de43";

    const sendMessage = (msg) => fetch(worker_url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chat_id, text: msg })
    }).then(res => res.json());

    const sendEmail = async (msg) => {
        await fetch("https://api.web3forms.com/submit", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                access_key: accessKey,
                subject: "ОСТАТКИ/ВЫСТАЛЕНО",
                from_name: "SHBB PASTRY",
                reply_to: "no-reply@shbb.com",
                message: msg
            })
        });
    };

    let start = 0;
    while (start < text.length) {
        const chunk = text.slice(start, start + 4000);
        await sendMessage(chunk);
        await sendEmail(chunk);
        start += 4000;
    }
}