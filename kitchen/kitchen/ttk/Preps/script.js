let currentLang = 'ru';
const dataFile = 'data/preps.json';

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

  sectionArray.forEach((dish, index) => {
    const dishRow = document.createElement('tr');
    const tdDish = document.createElement('td');
    tdDish.colSpan = 4;
    tdDish.style.fontWeight = '600';
    tdDish.textContent = dish.name[currentLang];
    dishRow.appendChild(tdDish);
    tbody.appendChild(dishRow);

    const keyIngredient = dish.key; // ключевое поле для перерасчета
    const keyValue = dish.ingredients.find(ing => ing.key === keyIngredient)?.amount || 1;

    dish.ingredients.forEach((ing, i) => {
      const tr = document.createElement('tr');

      const tdNum = document.createElement('td');
      tdNum.textContent = i + 1;

      const tdName = document.createElement('td');
      tdName.textContent = ing[currentLang];

      const tdAmount = document.createElement('td');
      if (ing.key === keyIngredient) {
        const input = document.createElement('input');
        input.type = 'number';
        input.value = ing.amount;
        input.className = 'key-input';
        input.dataset.base = ing.amount;
        tdAmount.appendChild(input);
      } else {
        tdAmount.textContent = ing.amount;
        tdAmount.dataset.base = ing.amount;
      }

      const tdDesc = document.createElement('td');
      if (i === 0) {
        tdDesc.textContent = dish.process[currentLang] || '';
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

    // --- Перерасчет при изменении ключевого поля ---
    tblContainer.addEventListener('input', e => {
      if (!e.target.classList.contains('key-input')) return;

      const newVal = parseFloat(e.target.value) || 0;
      const oldVal = parseFloat(e.target.dataset.base) || 1;
      const factor = newVal / oldVal;

      const row = e.target.closest('tr');
      const table = e.target.closest('table');

      table.querySelectorAll('td[data-base]').forEach(td => {
        td.textContent = (parseFloat(td.dataset.base) * factor).toFixed(1);
      });

      e.target.dataset.base = newVal;
    });

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