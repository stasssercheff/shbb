// ---- start of fixed script.js ----
window.currentLang = window.currentLang || 'ru';

// ==== Навигация (оставил как просил) ====
function goHome() {
  location.href = "https://stasssercheff.github.io/shbb/";
}
function goBack() {
  const currentPath = window.location.pathname;
  const parentPath = currentPath.substring(0, currentPath.lastIndexOf("/"));
  const upperPath = parentPath.substring(0, parentPath.lastIndexOf("/"));
  window.location.href = upperPath + "/index.html";
}

// ==== Пути к данным ====
const dataFiles = {
  'Preps': 'data/preps.json',
  'Sous-Vide': 'data/sv.json'
};

// ==== Загрузка JSON ====
function loadData(sectionName, callback) {
  const path = dataFiles[sectionName];
  if (!path) {
    console.error('Нет пути для секции:', sectionName);
    return;
  }
  fetch(path)
    .then(res => {
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return res.json();
    })
    .then(data => callback(data))
    .catch(err => console.error(`Ошибка загрузки ${sectionName}:`, err));
}

// ==== Переключение языка ====
function switchLanguage(lang) {
  if (!lang) return;
  currentLang = lang;
  updateI18nText();

  // если раздел открыт — перерисовать
  const activeSection = document.querySelector('.section-btn.active');
  if (activeSection) renderSection(activeSection.dataset.section, false);
}

// ==== Отображение раздела ====
function renderSection(sectionName, toggle = true) {
  if (!sectionName) return;
  const container = document.querySelector('.table-container');
  if (!container) {
    console.error('Не найден .table-container в DOM');
    return;
  }

  const btn = document.querySelector(`.section-btn[data-section="${sectionName}"]`);
  document.querySelectorAll('.section-btn').forEach(b => b.classList.remove('active'));

  if (toggle && container.dataset.active === sectionName) {
    container.innerHTML = '';
    container.dataset.active = '';
    return;
  }

  if (btn) btn.classList.add('active');
  container.dataset.active = sectionName;

  loadData(sectionName, data => {
    try {
      if (sectionName === 'Preps') createTable(data);
      else if (sectionName === 'Sous-Vide') renderSousVide(data);
      else console.warn('Неизвестная секция:', sectionName);
    } catch (e) {
      console.error('Ошибка при рендере секции', sectionName, e);
    }
  });
}

// ==== Таблица Preps ====
function createTable(data) {
  const container = document.querySelector('.table-container');
  if (!container) return;
  container.innerHTML = '';

  if (!data || !Array.isArray(data.recipes)) {
    container.textContent = 'Нет данных для отображения';
    return;
  }

  data.recipes.forEach(dish => {
    const card = document.createElement('div');
    card.className = 'dish-card';

    const title = document.createElement('div');
    title.className = 'dish-title';
    title.textContent = (currentLang === 'ru') ? (dish.name?.ru || dish.title) : (dish.name?.en || dish.title);
    card.appendChild(title);

    const table = document.createElement('table');
    table.className = 'pf-table';

    const thead = document.createElement('thead');
    const tbody = document.createElement('tbody');

    const headers = currentLang === 'ru'
      ? ['#', 'Продукт', 'Гр/шт', 'Описание']
      : ['#', 'Ingredient', 'Gr/Pcs', 'Process'];

    const trHead = document.createElement('tr');
    headers.forEach(h => {
      const th = document.createElement('th');
      th.textContent = h;
      trHead.appendChild(th);
    });
    thead.appendChild(trHead);

    // ингредиенты
    (dish.ingredients || []).forEach((ing, i) => {
      const tr = document.createElement('tr');

      const tdNum = document.createElement('td');
      tdNum.textContent = i + 1;

      const tdName = document.createElement('td');
      tdName.textContent = (currentLang === 'ru') ? (ing['Продукт'] || '') : (ing['Ingredient'] || '');

      const tdAmount = document.createElement('td');
      tdAmount.textContent = ing['Шт/гр'] || '';
      tdAmount.dataset.base = ing['Шт/гр'] || '0';

      // редактируемая опция — ключевой ингредиент
      if (dish.key && ing['Продукт'] === dish.key) {
        tdAmount.contentEditable = true;
        tdAmount.classList.add('key-ingredient');

        tdAmount.addEventListener('input', () => {
          let newVal = parseFloat(tdAmount.textContent.replace(/[^0-9.]/g, '')) || 0;
          if (parseFloat(tdAmount.dataset.base) === 0) tdAmount.dataset.base = 1;
          const factor = newVal / parseFloat(tdAmount.dataset.base || 1);

          const rows = tdAmount.closest('table').querySelectorAll('tbody tr');
          rows.forEach(r => {
            const cell = r.cells[2];
            if (cell && cell !== tdAmount) {
              const base = parseFloat(cell.dataset.base) || 0;
              cell.textContent = Math.round(base * factor);
            }
          });
        });

        tdAmount.addEventListener('keydown', e => {
          if (!/[0-9]|Backspace|Delete|ArrowLeft|ArrowRight/.test(e.key)) e.preventDefault();
        });
      }

      tr.appendChild(tdNum);
      tr.appendChild(tdName);
      tr.appendChild(tdAmount);

      if (i === 0) {
        const tdDesc = document.createElement('td');
        tdDesc.textContent = (dish.process?.[currentLang]) || '';
        tdDesc.rowSpan = (dish.ingredients || []).length || 1;
        tr.appendChild(tdDesc);
      }

      tbody.appendChild(tr);
    });

    table.appendChild(thead);
    table.appendChild(tbody);
    card.appendChild(table);
    container.appendChild(card);
  });
}

// ==== Таблица Sous-Vide ====
function renderSousVide(data) {
  const container = document.querySelector('.table-container');
  if (!container) return;
  container.innerHTML = '';

  if (!data || !Array.isArray(data.recipes)) {
    container.textContent = 'Нет данных для отображения';
    return;
  }

  data.recipes.forEach(dish => {
    const card = document.createElement('div');
    card.className = 'dish-card';

    const title = document.createElement('div');
    title.className = 'dish-title';
    title.textContent = (currentLang === 'ru') ? (dish.title || '') : (dish.title || '');
    card.appendChild(title);

    const table = document.createElement('table');
    table.className = 'sv-table';

    const thead = document.createElement('thead');
    const tbody = document.createElement('tbody');

    const headers = currentLang === 'ru'
      ? ['#', 'Продукт', 'Гр/шт', 'Темп °C', 'Время', 'Описание']
      : ['#', 'Ingredient', 'Gr/Pcs', 'Temp °C', 'Time', 'Process'];

    const trHead = document.createElement('tr');
    headers.forEach(h => {
      const th = document.createElement('th');
      th.textContent = h;
      trHead.appendChild(th);
    });
    thead.appendChild(trHead);

    (dish.ingredients || []).forEach((ing, i) => {
      const tr = document.createElement('tr');
      const temp = ing['Температура С / Temperature C'] || '';
      const time = ing['Время мин / Time'] || '';

      // попытка найти процесс для этой строки (если dish.process — массив с range)
      let procText = '';
      try {
        if (Array.isArray(dish.process)) {
          const proc = dish.process.find(p => i + 1 >= p.range[0] && i + 1 <= p.range[1]);
          procText = proc ? (proc[currentLang] || '') : '';
        } else {
          // если process — объект с ru/en (как в Preps) — просто подставим общий текст
          procText = dish.process?.[currentLang] || '';
        }
      } catch (e) {
        procText = '';
      }

      tr.innerHTML = `
        <td>${ing['№'] || (i + 1)}</td>
        <td>${(currentLang === 'ru') ? (ing['Продукт'] || '') : (ing['Ingredient'] || '')}</td>
        <td>${ing['Шт/гр'] || ''}</td>
        <td>${temp}</td>
        <td>${time}</td>
        <td>${procText}</td>
      `;
      tbody.appendChild(tr);
    });

    table.appendChild(thead);
    table.appendChild(tbody);
    card.appendChild(table);
    container.appendChild(card);
  });
}

// ==== Переводы (локальный набор, можно расширить) ====
const translations = {
  home: { ru: "На главную", en: "Home" },
  back: { ru: "Назад", en: "Back" },
  preps: { ru: "ПФ", en: "Preps" },
  sousvide: { ru: "Су-вид", en: "Sous-Vide" },
  lang_ru: { ru: "Рус", en: "RU" },
  lang_en: { ru: "Англ", en: "EN" }
};

// ==== Обновление текста ====
function updateI18nText() {
  document.querySelectorAll("[data-i18n]").forEach(el => {
    const key = el.getAttribute("data-i18n");
    if (translations[key] && translations[key][currentLang]) {
      el.textContent = translations[key][currentLang];
    }
  });
}

// ==== Вспомогалка: определить язык по кнопке ====
function detectLangFromButton(btn) {
  if (!btn) return null;
  if (btn.dataset.lang) return btn.dataset.lang;
  const di = btn.dataset.i18n || '';
  if (di === 'lang_ru') return 'ru';
  if (di === 'lang_en') return 'en';
  const t = (btn.textContent || btn.innerText || '').trim().toLowerCase();
  if (t.startsWith('ru') || t.startsWith('рус')) return 'ru';
  if (t.startsWith('en') || t.startsWith('анг')) return 'en';
  return null;
}

// ==== Инициализация (надежная: делегирование кликов) ====
(function init() {
  // сразу обновляем тексты (если элементы есть)
  updateI18nText();

  // делегируем клики по кнопкам секций и языков
  document.body.addEventListener('click', function (e) {
    // section buttons (делегирование)
    const sectionBtn = e.target.closest('.section-btn');
    if (sectionBtn) {
      const section = sectionBtn.dataset.section;
      if (section) {
        // включаем визуальную активность
        document.querySelectorAll('.section-btn').forEach(b => b.classList.remove('active'));
        sectionBtn.classList.add('active');
        renderSection(section);
      }
      return; // если клик был по section-btn — дальше не обрабатываем
    }

    // language buttons внутри контейнера .lang-switch
    const langBtn = e.target.closest('.lang-switch button, .lang-btn');
    if (langBtn) {
      // получить язык
      const lang = detectLangFromButton(langBtn);
      if (lang) {
        // визуально пометим
        document.querySelectorAll('.lang-switch button').forEach(b => b.classList.remove('active'));
        langBtn.classList.add('active');
        switchLanguage(lang);
      } else {
        // если нет data-lang — попробуем текст (на всякий)
        const txt = (langBtn.textContent || '').trim().toLowerCase();
        if (txt === 'ru' || txt === 'рус') {
          document.querySelectorAll('.lang-switch button').forEach(b => b.classList.remove('active'));
          langBtn.classList.add('active');
          switchLanguage('ru');
        } else if (txt === 'en' || txt === 'англ') {
          document.querySelectorAll('.lang-switch button').forEach(b => b.classList.remove('active'));
          langBtn.classList.add('active');
          switchLanguage('en');
        }
      }
      return;
    }

    // навигация: если у тебя кнопки с onclick, они сработают напрямую,
    // но добавим поддержку делегированно (если у кнопки data-i18n="home/back")
    const navHome = e.target.closest('[data-i18n="home"]');
    if (navHome) { goHome(); return; }
    const navBack = e.target.closest('[data-i18n="back"]');
    if (navBack) { goBack(); return; }
  });

  // если section-btn уже помечен active в разметке — загрузим его сразу
  const initialActive = document.querySelector('.section-btn.active') || document.querySelector('.section-btn[data-section="Preps"]');
  if (initialActive && initialActive.dataset && initialActive.dataset.section) {
    // не сразу, а через setTimeout(0) чтобы DOM успел (и чтобы избежать race)
    setTimeout(() => renderSection(initialActive.dataset.section), 0);
  }
})();
 // ---- end of fixed script.js ----