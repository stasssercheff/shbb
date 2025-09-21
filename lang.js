// lang.js — универсальный загрузчик переводов
(async function () {
  const jsonPaths = [
    '/lang.json',   // пробует из корня
    './lang.json',  // из текущей папки
  ];

  let translations = null;

  async function loadTranslations() {
    for (const path of jsonPaths) {
      try {
        const res = await fetch(path, { cache: 'no-store' });
        if (res.ok) {
          const data = await res.json();
          console.info('[lang.js] translations loaded from', path);
          return data;
        }
      } catch (e) { /* игнор */ }
    }
    throw new Error('[lang.js] could not load lang.json');
  }

  try {
    translations = await loadTranslations();
  } catch (err) {
    console.error(err);
    return;
  }

  function getSavedLang() {
    const saved = localStorage.getItem('lang');
    if (saved) return saved;
    const nav = (navigator.language || '').slice(0, 2);
    return nav || 'ru';
  }

  function applyTranslations(lang) {
    if (!translations) return;

    // Перевод текста
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n');
      const value = translations[key]?.[lang];
      if (value !== undefined) {
        if (el.tagName === 'TITLE') document.title = value;
        else el.textContent = value;
      }
    });

    // Перевод placeholder
    document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
      const key = el.getAttribute('data-i18n-placeholder');
      const value = translations[key]?.[lang];
      if (value !== undefined) el.setAttribute('placeholder', value);
    });

    // Перевод title
    document.querySelectorAll('[data-i18n-title]').forEach(el => {
      const key = el.getAttribute('data-i18n-title');
      const value = translations[key]?.[lang];
      if (value !== undefined) el.setAttribute('title', value);
    });

    // Дата
    const locale = translations.date_format?.[lang] || lang;
    const today = new Date();
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    document.querySelectorAll('#current-date, [data-i18n="date"]').forEach(el => {
      try {
        el.textContent = today.toLocaleDateString(locale, options);
      } catch {
        el.textContent = today.toLocaleDateString();
      }
    });

    // Установка языка html
    document.documentElement.lang = lang;
    localStorage.setItem('lang', lang);

    // Подсветка выбранной кнопки
    document.querySelectorAll('.lang-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.lang === lang);
    });
  }

  document.addEventListener('DOMContentLoaded', () => {
    // Навешиваем обработчики на кнопки языка
    document.querySelectorAll('.lang-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const lang = btn.dataset.lang;
        applyTranslations(lang);
      });
    });

    // Применяем сохраненный язык при загрузке
    const initialLang = getSavedLang();
    applyTranslations(initialLang);
  });
})();