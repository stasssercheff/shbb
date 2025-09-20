// lang.js — универсальный загрузчик переводов по фразам
(async function () {
  const tryPaths = [
    '/lang.json',
    './lang.json',
    './lang/lang.json'
  ];

  let translations = null;

  async function fetchFirst(paths) {
    for (const p of paths) {
      try {
        const res = await fetch(p, { cache: 'no-store' });
        if (res && res.ok) {
          const json = await res.json();
          console.info('[lang.js] loaded translations from', p);
          return json;
        }
      } catch (e) {
        // ignore
      }
    }
    throw new Error('[lang.js] could not load lang.json');
  }

  try {
    translations = await fetchFirst(tryPaths);
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
    if (!lang) return;

    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n');
      const value = translations[key] ? translations[key][lang] : null;
      if (value !== null && value !== undefined) {
        if (el.tagName === 'TITLE') {
          document.title = value;
        } else {
          el.textContent = value;
        }
      }
    });

    document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
      const key = el.getAttribute('data-i18n-placeholder');
      const value = translations[key] ? translations[key][lang] : null;
      if (value !== null) el.setAttribute('placeholder', value);
    });

    document.querySelectorAll('[data-i18n-title]').forEach(el => {
      const key = el.getAttribute('data-i18n-title');
      const value = translations[key] ? translations[key][lang] : null;
      if (value !== null) el.setAttribute('title', value);
    });

    // Дата
    const locale = translations.date_format ? translations.date_format[lang] : lang;
    const today = new Date();
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    document.querySelectorAll('[data-i18n="date"], #current-date').forEach(el => {
      try {
        el.textContent = today.toLocaleDateString(locale, options);
      } catch (e) {
        el.textContent = today.toLocaleDateString();
      }
    });

    // html lang
    document.documentElement.lang = lang;
    localStorage.setItem('lang', lang);

    // Кнопки выбора языка
    document.querySelectorAll('.lang-btn').forEach(btn => {
      const bLang = btn.dataset.lang;
      btn.classList.toggle('active', bLang === lang);
    });
  }

  document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.lang-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const lang = btn.dataset.lang;
        applyTranslations(lang);
      });
    });

    const initial = getSavedLang();
    applyTranslations(initial);
  });
})();