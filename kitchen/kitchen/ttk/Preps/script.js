let currentLang = 'ru';

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

  loadData(sectionName, data => createTable(data, sectionName));
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
        : ['#', 'Ingredient', 'Rg/Pcs', 'Description'])
      : (currentLang === 'ru'
        ? ['#', 'Продукт', 'Гр/шт', 'Темп °C', 'Время', 'Описание']
        : ['#', 'Ingredient', 'Rg/Pcs', 'Temp C', 'Time', 'Description']);

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
          // Разрешаем только цифры и управление
          if (!/[0-9]|Backspace|Delete|ArrowLeft|ArrowRight/.test(e.key)) {
            e.preventDefault();
          }
        });
      }

      tr.appendChild(tdNum);
      tr.appendChild(tdName);
      tr.appendChild(tdAmount);

      if (sectionName === 'Sous-Vide') {
        const tdTemp = document.createElement('td');
        tdTemp.textContent = ing['Температура С / Temperature C'] || '';
        const tdTime = document.createElement('td');
        tdTime.textContent = ing['Время мин / Time'] || '';
        tr.appendChild(tdTemp);
        tr.appendChild(tdTime);
      }

      // ==== Блок для описания ====
      const tdDesc = document.createElement('td');
      let description = "";

      if (sectionName === 'Preps') {
        // В ПФ описания указываются прямо в ингредиентах
        description = currentLang === 'ru'
          ? ing['Описание'] || ''
          : ing['Description'] || '';

        tdDesc.textContent = description;
        tr.appendChild(tdDesc);

      } else if (sectionName === 'Sous-Vide') {
        // Для Sous-Vide
        if (ing.process && ing.process[currentLang]) {
          // индивидуальный процесс для ингредиента
          description = ing.process[currentLang];
          tdDesc.textContent = description;
          tr.appendChild(tdDesc);
        } else if (i === 0 && dish.defaultProcess && dish.defaultProcess[currentLang]) {
          // общее описание — один раз с rowSpan
          description = dish.defaultProcess[currentLang];
          tdDesc.textContent = description;
          tdDesc.rowSpan = dish.ingredients.length;
          tr.appendChild(tdDesc);
        }
      }
      // ==== конец блока ====

      tbody.appendChild(tr);
    });

    table.appendChild(thead);
    table.appendChild(tbody);
    card.appendChild(table);
    tableContainer.appendChild(card);
  });
}

// Навигация
function goHome() {
  location.href = '/index.html';
}
function goBack() {
  history.back();
}

// Инициализация кнопок
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