// lang.js
let currentLang = localStorage.getItem('lang') || 'ru'; // берем из localStorage или по умолчанию RU

function setLanguage(lang) {
  currentLang = lang;
  localStorage.setItem('lang', lang);

  // обновляем все тексты с data-i18n
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const translations = JSON.parse(el.getAttribute('data-i18n'));
    if (translations[lang]) {
      el.textContent = translations[lang];
    }
  });
}

document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.lang-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      setLanguage(btn.dataset.lang);
    });
  });

  setLanguage(currentLang); // применяем сохранённый язык при загрузке
});
