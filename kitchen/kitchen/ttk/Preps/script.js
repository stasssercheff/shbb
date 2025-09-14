// script.js
let currentLang = 'ru';
let lastSection = null;
let lastData = null;

// Пути к JSON по разделам
const sectionFiles = {
  'Preps': 'data/preps.json',
  'Sous-Vide': 'data/sv.json'
};

document.addEventListener('DOMContentLoaded', () => {
  // обработчики на кнопки разделов
  document.querySelectorAll('.section-btn').forEach(btn => {
    btn.addEventListener('click', () => loadSection(btn.dataset.section));
  });

  // глобальная функция для переключения языка (onclick в HTML)
  window.switchLanguage = function(lang) {
    currentLang = lang;
    if (lastSection && lastData) {
      if (lastSection === 'Preps') renderPreps(lastData);
      else if (lastSection === 'Sous-Vide') renderSousVide(lastData);
    }
  };

  // по умолчанию грузим ПФ
  if (document.querySelector('.section-btn[data-section="Preps"]')) {
    loadSection('Preps');
  }
});

function loadSection(section) {
  const file = sectionFiles[section];
  const tableContainer = document.querySelector('.table-container');
  if (!tableContainer) return console.error('Контейнер .table-container не найден');

  if (!file) {
    tableContainer.innerHTML = `<p style="color:red">Раздел "${section}" не настроен</p>`;
    return;
  }

  lastSection = section;
  tableContainer.innerHTML = '<p>Загрузка...</p>';

  fetch(file)
    .then(res => {
      if (!res.ok) throw new Error('Ошибка загрузки JSON: ' + res.status);
      return res.json();
    })
    .then(data => {
      lastData = data;
      if (section === 'Preps') renderPreps(data);
      else if (section === 'Sous-Vide') renderSousVide(data);
    })
    .catch(err => {
      console.error(err);
      tableContainer.innerHTML = `<p style="color:red">${err.message}</p>`;
    });
}

// === Рендер ПФ (с пересчётом) ===
function renderPreps(data) {
  const recipes = data.recipes || data;
  const tableContainer = document.querySelector('.table-container');
  tableContainer.innerHTML = '';

  const table = document.createElement('table');
  table.className = 'dish-table';

  const thead = document.createElement('thead');
  const headerRow = document.createElement('tr');
  [
    '№',
    currentLang === 'ru' ? 'Ингредиент' : 'Ingredient',
    currentLang === 'ru' ? 'Гр/Шт' : 'Amount',
    currentLang === 'ru' ? 'Описание' : 'Description'
  ].forEach(text => {
    const th = document.createElement('th');
    th.textContent = text;
    headerRow.appendChild(th);
  });
  thead.appendChild(headerRow);

  const tbody = document.createElement('tbody');

  recipes.forEach(dish => {
    const title = dish.name?.[currentLang] || dish.title?.[currentLang] || dish.title || dish.name?.ru || dish.name?.en || '';
    const dishRow = document.createElement('tr');
    const tdDish = document.createElement('td');
    tdDish.colSpan = 4;
    tdDish.style.fontWeight = '600';
    tdDish.textContent = title;
    dishRow.appendChild(tdDish);
    tbody.appendChild(dishRow);

    const keyIngredient = dish.key;
    const ingredients = dish.ingredients || [];

    ingredients.forEach((ing, i) => {
      const tr = document.createElement('tr');

      const tdNum = document.createElement('td');
      tdNum.textContent = i + 1;

      const tdName = document.createElement('td');
      tdName.textContent = currentLang === 'ru'
        ? (ing['Продукт'] || ing['Ingredient'] || '')
        : (ing['Ingredient'] || ing['Продукт'] || '');

      const tdAmount = document.createElement('td');
      tdAmount.dataset.base = (ing['Шт/гр'] || '').toString();

      const ingMatchesKey = keyIngredient &&
        ((ing['Продукт'] && ing['Продукт'] === keyIngredient) ||
         (ing['Ingredient'] && ing['Ingredient'] === keyIngredient));

      if (ingMatchesKey) {
        tdAmount.contentEditable = true;
        tdAmount.classList.add('highlight');
        tdAmount.textContent = ing['Шт/гр'] || '';

        tdAmount.addEventListener('input', () => {
          const newVal = parseFloat(tdAmount.textContent) || 0;
          const oldVal = parseFloat(tdAmount.dataset.base) || 1;
          const factor = oldVal === 0 ? 0 : newVal / oldVal;

          const trs = tdAmount.closest('table').querySelectorAll('tbody tr');
          trs.forEach(r => {
            const cell = r.cells[2];
            if (cell && cell !== tdAmount && cell.dataset.base !== undefined) {
              const base = parseFloat(cell.dataset.base) || 0;
              cell.textContent = (base * factor).toFixed(1);
            }
          });

          tdAmount.dataset.base = newVal.toString();
        });
      } else {
        tdAmount.textContent = ing['Шт/гр'] || '';
      }

      const tdDesc = document.createElement('td');
      if (i === 0) {
        tdDesc.textContent = dish.process?.[currentLang] || '';
        tdDesc.rowSpan = ingredients.length || 1;
        tdDesc.className = 'description-cell';
      }

      tr.appendChild(tdNum);
      tr.appendChild(tdName);
      tr.appendChild(tdAmount);
      if (i === 0) tr.appendChild(tdDesc);

      tbody.appendChild(tr);
    });
  });

  table.appendChild(thead);
  table.appendChild(tbody);
  tableContainer.appendChild(table);
}

// === Рендер Су-Вид (простая таблица) ===
function renderSousVide(data) {
  const recipes = data.recipes || data;
  const tableContainer = document.querySelector('.table-container');
  tableContainer.innerHTML = '';

  let html = '<h2>Су-Вид / SOUS-VIDE</h2>';
  html += `<table class="dish-table">
    <thead>
      <tr>
        <th>№</th>
        <th>Продукт / Ingredient</th>
        <th>Шт/гр</th>
        <th>Температура °C</th>
        <th>Время (мин)</th>
        <th>Описание</th>
      </tr>
    </thead>
    <tbody>`;

  recipes.forEach(recipe => {
    (recipe.ingredients || []).forEach(ing => {
      html += `<tr>
        <td>${ing['№'] || ''}</td>
        <td>${ing['Продукт'] || ''}<br><em>${ing['Ingredient'] || ''}</em></td>
        <td>${ing['Шт/гр'] || ''}</td>
        <td>${ing['Температура С / Temperature C'] || ''}</td>
        <td>${ing['Время мин / Time'] || ''}</td>
        <td>${ing['Описание'] || ''}</td>
      </tr>`;
    });
  });

  html += '</tbody></table>';
  tableContainer.innerHTML = html;
}