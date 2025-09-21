// lang.js — универсальный загрузчик переводов
(async function () {
  const path = '/lang.json'; // загружаем всегда из корня
  let translations = null;

  try {
    const res = await fetch(path, { cache: 'no-store' });
    if (!res.ok) throw new Error('Не удалось загрузить lang.json');
    translations = await res.json();
    console.info('[lang.js] translations loaded');
  } catch (err) {
    console.error(err);
    return;
  }

  function getSavedLang() {
    const saved = localStorage.getItem('lang');
    if (saved) return saved;
    const nav = (navigator.language || '').slice(0,2);
    return nav || 'ru';
  }

  function applyTranslations(lang) {
    if (!translations) return;

    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n');
      const value = translations[key]?.[lang];
      if (value !== undefined) {
        if (el.tagName === 'TITLE') document.title = value;
        else el.textContent = value;
      }
    });

    document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
      const key = el.getAttribute('data-i18n-placeholder');
      const value = translations[key]?.[lang];
      if (value !== undefined) el.setAttribute('placeholder', value);
    });

    document.querySelectorAll('[data-i18n-title]').forEach(el => {
      const key = el.getAttribute('data-i18n-title');
      const value = translations[key]?.[lang];
      if (value !== undefined) el.setAttribute('title', value);
    });

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

    document.documentElement.lang = lang;
    localStorage.setItem('lang', lang);

    document.querySelectorAll('.lang-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.lang === lang);
    });
  }

  document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.lang-btn').forEach(btn => {
      btn.addEventListener('click', () => applyTranslations(btn.dataset.lang));
    });

    applyTranslations(getSavedLang());
  });
})();