let currentLang = 'ru';
const dataFile = 'data/recipes.json';

// --- Функция создания таблицы карточки ---
function createTable(sectionArray) {
  if (!sectionArray) return document.createElement('div');

  const table = document.createElement('table');
  table.classList.add('dish-table');

  const thead = document.createElement('thead');
  const headerRow = document.createElement('tr');
  ['№', currentLang === 'ru' ? 'Ингредиент' : 'Ingredient', currentLang === 'ru' ? 'Гр/Шт' : 'Amount', currentLang === 'ru' ? 'Описание' : 'Description']
    .forEach(text => {
      const th = document.createElement('th');
      th.textContent = text;
      headerRow.appendChild(th);
    });
  thead.appendChild(headerRow);
  table.appendChild(thead);

  const tbody = document.createElement('tbody');

  sectionArray.forEach(dish => {
    const dishRow = document.createElement('tr');
    const tdDish = document.createElement('td');
    tdDish.colSpan = 4;
    tdDish.style.fontWeight = '600';
    tdDish.textContent = dish.title?.[currentLang] || '';
    dishRow.appendChild(tdDish);
    tbody.appendChild(dishRow);

    const keyIngredient = dish.key;

    dish.ingredients.forEach((ing, i) => {
      const tr = document.createElement('tr');

      const tdNum = document.createElement('td');
      tdNum.textContent = i + 1;

      const tdName = document.createElement('td');
      tdName.textContent = ing[currentLang] || ing['Продукт'] || ing['Ingredient'];

      const tdAmount = document.createElement('td');
      tdAmount.dataset.base = ing['Шт/гр'];

      if (ing['Продукт'] === keyIngredient) {
        tdAmount.contentEditable = true;
        tdAmount.classList.add('highlight');
        tdAmount.textContent = ing['Шт/гр'];

        tdAmount.addEventListener('input', () => {
          const newVal = parseFloat(tdAmount.textContent) || 0;
          const oldVal = parseFloat(tdAmount.dataset.base) || 1;
          const factor = newVal / oldVal;

          const trs = tdAmount.closest('table').querySelectorAll('tbody tr');
          trs.forEach(r => {
            const cell = r.cells[2];
            if (cell && cell !== tdAmount) {
              const base = parseFloat(cell.dataset.base) || 0;
              cell.textContent = (base * factor).toFixed(1);
            }
          });

          tdAmount.dataset.base = newVal;
        });
      } else {
        tdAmount.textContent = ing['Шт/гр'];
      }

      const tdDesc = document.createElement('td');
      if (i === 0) {
        tdDesc.textContent = dish.process?.[currentLang] || '';
        tdDesc.rowSpan = dish.ingredients.length;
        tdDesc.className = 'description-cell';
      }

      tr.appendChild(tdNum);
      tr.appendChild(tdName);
      tr.appendChild(tdAmount);
      if (i === 0) tr.appendChild(tdDesc);

      tbody.appendChild(tr);
    });
  });

  table.appendChild(tbody);
  return table;
}

// --- Загрузка данных ---
async function loadSection() {
  const panel = document.querySelector('.sections-container');
  panel.innerHTML = '';

  try {
    const response = await fetch(dataFile);
    if (!response.ok) throw new Error('Ошибка загрузки JSON');
    const data = await response.json();

    const tblContainer = document.createElement('div');
    tblContainer.className = 'table-container';
    tblContainer.appendChild(createTable(data));
    panel.appendChild(tblContainer);

  } catch (err) {
    panel.innerHTML = `<p style="color:red">${err.message}</p>`;
    console.error(err);
  }
}

// --- Переключение языка ---
document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('current-date').textContent = new Date().toLocaleDateString();

  document.querySelectorAll('.lang-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      currentLang = btn.dataset.lang;
      loadSection();
    });
  });

  loadSection();
});