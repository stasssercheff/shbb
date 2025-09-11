let currentLang = 'ru';
const dataFile = 'data/preps.json';

// --- Функция создания таблицы карточки ---
function createTable(recipes) {
  if (!recipes) return document.createElement('div');

  const table = document.createElement('table');
  table.classList.add('dish-table');

  const thead = document.createElement('thead');
  const headerRow = document.createElement('tr');

  // Устанавливаем заголовки колонок для всех типов данных
  ['№', currentLang === 'ru' ? 'Ингредиент' : 'Ingredient', currentLang === 'ru' ? 'Гр/Шт' : 'Amount', currentLang === 'ru' ? 'Описание' : 'Description']
    .forEach(text => {
      const th = document.createElement('th');
      th.textContent = text;
      headerRow.appendChild(th);
    });
  thead.appendChild(headerRow);
  table.appendChild(thead);

  const tbody = document.createElement('tbody');

  recipes.forEach(dish => {
    // Название блюда
    const dishRow = document.createElement('tr');
    const tdDish = document.createElement('td');
    tdDish.colSpan = 4;
    tdDish.style.fontWeight = '600';
    tdDish.textContent = dish.title || '';
    dishRow.appendChild(tdDish);
    tbody.appendChild(dishRow);

    // Ингредиенты
    dish.ingredients.forEach((ing, i) => {
      const tr = document.createElement('tr');

      // №
      const tdNum = document.createElement('td');
      tdNum.textContent = ing['№'] || i + 1;

      // Название
      const tdName = document.createElement('td');
      tdName.textContent = ing[currentLang] || ing['Продукт'] || ing['Ingredient'] || '';

      // Кол-во
      const tdAmount = document.createElement('td');
      tdAmount.dataset.base = ing['Шт/гр'] || ing.amount || '';
      tdAmount.textContent = tdAmount.dataset.base;

      // Описание
      const tdDesc = document.createElement('td');
      if (i === 0) {
        tdDesc.textContent = ing['Описание'] || dish.process?.[currentLang] || '';
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
    tblContainer.appendChild(createTable(data.recipes || data));
    panel.appendChild(tblContainer);

  } catch (err) {
    panel.innerHTML = `<p style="color:red">${err.message}</p>`;
    console.error(err);
  }
}

// --- Переключение языка ---
document.addEventListener('DOMContentLoaded', () => {
  const dateEl = document.getElementById('current-date');
  if (dateEl) dateEl.textContent = new Date().toLocaleDateString();

  document.querySelectorAll('.lang-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      currentLang = btn.dataset.lang;
      loadSection();
    });
  });

  loadSection();
});