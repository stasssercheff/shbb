// lang.js — универсальный загрузчик переводов
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
        // ignore and try next
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
    if (saved && translations[saved]) return saved;
    const nav = (navigator.language || '').slice(0, 2);
    if (nav && translations[nav]) return nav;
    return Object.keys(translations)[0];
  }

  function applyTranslations(lang) {
    if (!translations[lang]) return;

    // Перевод текста
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n');
      const value = translations[lang][key];
      if (value !== undefined && value !== null) {
        if (el.tagName === 'TITLE') {
          document.title = value;
        } else {
          el.textContent = value;
        }
      }
    });

    // Перевод атрибутов
    document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
      const key = el.getAttribute('data-i18n-placeholder');
      const v = translations[lang][key];
      if (v !== undefined) el.setAttribute('placeholder', v);
    });
    document.querySelectorAll('[data-i18n-title]').forEach(el => {
      const key = el.getAttribute('data-i18n-title');
      const v = translations[lang][key];
      if (v !== undefined) el.setAttribute('title', v);
    });

    // Дата
    const locale = translations[lang].date_format || lang;
    const today = new Date();
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    document.querySelectorAll('[data-i18n="date"], #current-date').forEach(el => {
      try {
        el.textContent = today.toLocaleDateString(locale, options);
      } catch (e) {
        el.textContent = today.toLocaleDateString();
      }
    });

    // Обновляем lang у <html>
    document.documentElement.lang = lang;
    localStorage.setItem('lang', lang);

    // Активная кнопка языка
    document.querySelectorAll('.lang-btn').forEach(btn => {
      const bLang = btn.dataset.lang;
      btn.classList.toggle('active', bLang === lang);
      const labelKey = 'lang_' + (bLang || '');
      if (translations[lang][labelKey]) {
        btn.textContent = translations[lang][labelKey];
      }
    });
  }

  document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.lang-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const lang = btn.dataset.lang;
        if (lang && translations[lang]) applyTranslations(lang);
      });
    });

    const initial = getSavedLang();
    applyTranslations(initial);
  });
})();