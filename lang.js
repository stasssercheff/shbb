// lang.js — универсальный и устойчивый загрузчик переводов
(async function () {
  const tryPaths = [
    '/lang.json',
    '/lang/lang.json',
    'lang.json',
    './lang.json',
    './lang/lang.json',
    '../lang.json'
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
    throw new Error('[lang.js] could not load lang.json from any known path');
  }

  try {
    translations = await fetchFirst(tryPaths);
  } catch (err) {
    console.error(err);
    return; // ничего не делаем дальше — нет переводов
  }

  function getSavedLang() {
    const saved = localStorage.getItem('lang');
    if (saved && translations[saved]) return saved;
    const nav = (navigator.language || navigator.userLanguage || '').slice(0, 2);
    if (nav && translations[nav]) return nav;
    return Object.keys(translations)[0]; // первый доступный
  }

  function applyTranslations(lang) {
    if (!translations[lang]) {
      console.warn('[lang.js] no translations for', lang);
      return;
    }

    // Перевод обычного текста / title
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
      // если перевода нет — оставляем существующий текст
    });

    // Поддержка атрибутов (placeholder, title) через специальные атрибуты
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

    // Дата: элементы с data-i18n="date" или #current-date
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

    // Обновим атрибут lang у <html>
    document.documentElement.lang = lang;

    // Сохраняем выбор
    localStorage.setItem('lang', lang);

    // Пометить активную кнопку и при наличии — обновить текст кнопок выбора языка
    document.querySelectorAll('.lang-btn').forEach(btn => {
      const bLang = btn.dataset.lang;
      btn.classList.toggle('active', bLang === lang);
      const labelKey = 'lang_' + (bLang || '');
      if (translations[lang][labelKey]) {
        btn.textContent = translations[lang][labelKey];
      }
    });
  }

  // Навесим обработчики и применим язык при загрузке DOM
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