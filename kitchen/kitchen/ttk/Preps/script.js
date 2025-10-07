// === Убираем let, чтобы не конфликтовать с lang.js ===
if (typeof currentLang === 'undefined') {
  var currentLang = 'ru';
}

const dataFiles = {
  Preps: 'data/preps.json',
  'Sous-Vide': 'data/sv.json'
};

// Загрузка JSON
function loadData(sectionName, callback) {
  fetch(dataFiles[sectionName])
    .then(res => res.json())
    .then(data => callback(data))
    .catch(err => console.error(err));
}

// Переключение языка (не закрывает таблицу)
function switchLanguage(lang) {
  currentLang = lang;
  const activeSection = document.querySelector('.section-btn.active');
  if (activeSection) {
    renderSection(activeSection.dataset.section, false);
  }
}

// Отображение раздела
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
    if (sectionName === 'Preps') {
      createTable(data, sectionName); // PF
    } else if (sectionName === 'Sous-Vide') {
      renderSousVide(data);           // Su-Vide
    }
  });
}

// Создание таблицы
function createTable(data, sectionName) {
  const tableContainer = document.querySelector('.table-container');
  tableContainer.innerHTML = '';

  data.recipes.forEach((dish) => {
    const card = document.createElement('div');
    card.className = 'dish-card';

    // Название карточки
    const title = document.createElement('div');
    title.className = 'dish-title';
    title.textContent = currentLang === 'ru'
      ? dish.name?.ru || dish.title
      : dish.name?.en || dish.title;
    card.appendChild(title);

    // Таблица
    const table = document.createElement('table');
    table.className = sectionName === 'Preps' ? 'pf-table' : 'sv-table';

    const thead = document.createElement('thead');
    const tbody = document.createElement('tbody');

    const headers = sectionName === 'Preps'
      ? (currentLang === 'ru'
        ? ['#', 'Продукт', 'Гр/шт', 'Описание']
        : ['#', 'Ingredient', 'Gr/Pcs', 'process'])
      : (currentLang === 'ru'
        ? ['#', 'Продукт', 'Гр/шт', 'Темп °C', 'Время', 'Описание']
        : ['#', 'Ingredient', 'Gr/Pcs', 'Temp C', 'Time', 'process']);

    const trHead = document.createElement('tr');
    headers.forEach(h => {
      const th = document.createElement('th');
      th.textContent = h;
      trHead.appendChild(th);
    });
    thead.appendChild(trHead);

    // Заполняем ингредиенты
    dish.ingredients.forEach((ing, i) => {
      const tr = document.createElement('tr');

      const tdNum = document.createElement('td');
      tdNum.textContent = i + 1;

      const tdName = document.createElement('td');
      tdName.textContent = currentLang === 'ru' ? ing['Продукт'] : ing['Ingredient'];

      const tdAmount = document.createElement('td');
      tdAmount.textContent = ing['Шт/гр'];
      tdAmount.dataset.base = ing['Шт/гр'];

      // Ключевой ингредиент
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
              let base = parseFloat(cell.dataset.base) || 0;
              cell.textContent = Math.round(base * factor);
            }
          });
        });

        tdAmount.addEventListener('keydown', e => {
          if (!/[0-9]|Backspace|Delete|ArrowLeft|ArrowRight/.test(e.key)) {
            e.preventDefault();
          }
        });
      }

      tr.appendChild(tdNum);
      tr.appendChild(tdName);
      tr.appendChild(tdAmount);

      // ==== Описание процесса (один раз на блюдо) ====
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
    tableContainer.appendChild(card);
  });
}

// ==== Блок для Sous-Vide ====
function renderSousVide(data) {
  const tableContainer = document.querySelector('.table-container');
  tableContainer.innerHTML = '';

  data.recipes.forEach((dish) => {
    const card = document.createElement('div');
    card.className = 'dish-card';

    const title = document.createElement('div');
    title.className = 'dish-title';
    title.textContent = currentLang === 'ru' ? dish.title : dish.title;
    card.appendChild(title);

    const table = document.createElement('table');
    table.className = 'sv-table';

    const thead = document.createElement('thead');
    const tbody = document.createElement('tbody');

    const headers = currentLang === 'ru'
      ? ['#', 'Продукт', 'Гр/шт', 'Темп °C', 'Время', 'Описание']
      : ['#', 'Ingredient', 'Gr/Pcs', 'Temp C', 'Time', 'process'];

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
      tdNum.textContent = ing['№'];

      const tdName = document.createElement('td');
      tdName.textContent = currentLang === 'ru' ? ing['Продукт'] : ing['Ingredient'];

      const tdAmount = document.createElement('td');
      tdAmount.textContent = ing['Шт/гр'];

      const tdTemp = document.createElement('td');
      tdTemp.textContent = ing['Температура С / Temperature C'] || '';

      const tdTime = document.createElement('td');
      tdTime.textContent = ing['Время мин / Time'] || '';

      const tdProcess = document.createElement('td');
      const proc = dish.process.find(p => i + 1 >= p.range[0] && i + 1 <= p.range[1]);
      tdProcess.textContent = proc ? proc[currentLang] : '';

      tr.appendChild(tdNum);
      tr.appendChild(tdName);
      tr.appendChild(tdAmount);
      tr.appendChild(tdTemp);
      tr.appendChild(tdTime);
      tr.appendChild(tdProcess);

      tbody.appendChild(tr);
    });

    table.appendChild(thead);
    table.appendChild(tbody);
    card.appendChild(table);
    tableContainer.appendChild(card);
  });
}

// ==== Навигация ====
function goHome() {
  location.href = '/index.html';
}
function goBack() {
  history.back();
}

// ==== Инициализация кнопок ====
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
