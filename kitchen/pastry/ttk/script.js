let currentLang = 'ru';

const dataFiles = {
  Preps: 'data/preps.json'
};

// Загрузка JSON
function loadData(sectionName, callback) {
  fetch(dataFiles[sectionName])
    .then(res => res.json())
    .then(data => callback(data))
    .catch(err => console.error(err));
}

// Переключение языка (только перерисовка)
function switchLanguage(lang) {
  currentLang = lang;
  renderSection('Preps', false);
}

// Отображение раздела
function renderSection(sectionName, toggle = true) {
  loadData(sectionName, data => createTable(data, sectionName));
}

// Создание таблицы с перерасчетом
function createTable(data, sectionName) {
  const tableContainer = document.querySelector('.table-container');
  tableContainer.innerHTML = ''; // очищаем контейнер

  data.recipes.forEach((dish) => {
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
      : ['#', 'Ingredient', 'Gr/Pcs', 'process'];

    const trHead = document.createElement('tr');
    headers.forEach(h => {
      const th = document.createElement('th');
      th.textContent = h;
      trHead.appendChild(th);
    });
    thead.appendChild(trHead);

    // Заполняем ингредиенты с перерасчетом
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

      const tdDesc = document.createElement('td');
      if (i === 0) {
        tdDesc.textContent = dish.process?.[currentLang] || "";
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

// Навигация
function goHome() { location.href = '/index.html'; }
function goBack() { history.back(); }

// Инициализация: отображаем Preps сразу
document.addEventListener('DOMContentLoaded', () => renderSection('Preps'));