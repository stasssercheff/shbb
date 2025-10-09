window.currentLang = window.currentLang || 'ru';

// ==== Данные JSON ====
const dataFiles = {
  'Preps': 'data/preps.json',
  'Sous-Vide': 'data/sv.json'
};

// ==== Навигация ====
function goHome() {
  location.href = "https://stasssercheff.github.io/shbb/";
}
function goBack() {
  const currentPath = window.location.pathname;
  const parentPath = currentPath.substring(0, currentPath.lastIndexOf("/"));
  const upperPath = parentPath.substring(0, parentPath.lastIndexOf("/"));
  window.location.href = upperPath + "/index.html";
}

// ==== Загрузка JSON ====
function loadData(sectionName, callback) {
  fetch(dataFiles[sectionName])
    .then(res => res.json())
    .then(data => callback(data))
    .catch(err => console.error(`Ошибка загрузки ${sectionName}:`, err));
}

// ==== Переключение языка ====
function switchLanguage(lang) {
  currentLang = lang;
  const activeSection = document.querySelector('.section-btn.active');
  if (activeSection) renderSection(activeSection.dataset.section, false);
  updateI18nText();
}

// ==== Отображение раздела ====
function renderSection(sectionName, toggle = true) {
  const container = document.querySelector('.table-container');
  const btn = document.querySelector(`.section-btn[data-section="${sectionName}"]`);

  document.querySelectorAll('.section-btn').forEach(b => b.classList.remove('active'));

  if (toggle && container.dataset.active === sectionName) {
    container.innerHTML = '';
    container.dataset.active = '';
    return;
  }

  btn.classList.add('active');
  container.dataset.active = sectionName;

  loadData(sectionName, data => {
    if (sectionName === 'Preps') createTable(data, sectionName);
    else if (sectionName === 'Sous-Vide') renderSousVide(data);
  });
}

// ==== Создание таблицы Preps ====
function createTable(data, sectionName) {
  const container = document.querySelector('.table-container');
  container.innerHTML = '';

  data.recipes.forEach(dish => {
    const card = document.createElement('div');
    card.className = 'dish-card';

    const title = document.createElement('div');
    title.className = 'dish-title';
    title.textContent = currentLang === 'ru'
      ? dish.name?.ru || dish.title
      : dish.name?.en || dish.title;
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

    dish.ingredients.forEach((ing, i) => {
      const tr = document.createElement('tr');

      const tdNum = document.createElement('td');
      tdNum.textContent = i + 1;

      const tdName = document.createElement('td');
      tdName.textContent = currentLang === 'ru' ? ing['Продукт'] : ing['Ingredient'];

      const tdAmount = document.createElement('td');
      tdAmount.textContent = ing['Шт/гр'];
      tdAmount.dataset.base = ing['Шт/гр'];

      if (ing['Продукт'] === dish.key) {
        tdAmount.contentEditable = true;
        tdAmount.classList.add('key-ingredient');

        tdAmount.addEventListener('input', () => {
          let newVal = parseFloat(tdAmount.textContent.replace(/[^0-9.]/g, '')) || 0;
          if (parseFloat(tdAmount.dataset.base) === 0) tdAmount.dataset.base = 1;
          const factor = newVal / parseFloat(tdAmount.dataset.base);

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
        tdDesc.textContent = dish.process?.[currentLang] || '';
        tdDesc.rowSpan = dish.ingredients.length;
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

// ==== Рендер Sous-Vide ====
function renderSousVide(data) {
  const container = document.querySelector('.table-container');
  container.innerHTML = '';

  data.recipes.forEach(dish => {
    const card = document.createElement('div');
    card.className = 'dish-card';

    const title = document.createElement('div');
    title.className = 'dish-title';
    title.textContent = dish.title;
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

    dish.ingredients.forEach((ing, i) => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${ing['№']}</td>
        <td>${currentLang === 'ru' ? ing['Продукт'] : ing['Ingredient']}</td>
        <td>${ing['Шт/гр']}</td>
        <td>${ing['Температура С / Temperature C'] || ''}</td>
        <td>${ing['Время мин / Time'] || ''}</td>
        <td>${(dish.process.find(p => i + 1 >= p.range[0] && i + 1 <= p.range[1])?.[currentLang]) || ''}</td>
      `;
      tbody.appendChild(tr);
    });

    table.appendChild(thead);
    table.appendChild(tbody);
    card.appendChild(table);
    container.appendChild(card);
  });
}

// ==== i18n переводы ====
const translations = {
  home: { ru: "На главную", en: "Home" },
  back: { ru: "Назад", en: "Back" },
  preps: { ru: "ПФ", en: "Preps" },
  sousvide: { ru: "Су-вид", en: "Sous-Vide" },
  lang_ru: { ru: "Рус", en: "RU" },
  lang_en: { ru: "Англ", en: "EN" }
};

// ==== Обновление текста кнопок ====
function updateI18nText() {
  document.querySelectorAll("[data-i18n]").forEach(el => {
    const key = el.getAttribute("data-i18n");
    if (translations[key] && translations[key][currentLang]) {
      el.textContent = translations[key][currentLang];
    }
  });
}

// ==== Инициализация ====
document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll('.section-btn').forEach(btn => {
    btn.addEventListener('click', () => renderSection(btn.dataset.section));
  });

  document.querySelectorAll('.lang-switch button').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.lang-switch button').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      switchLanguage(btn.textContent.toLowerCase());
    });
  });

  updateI18nText();
});
