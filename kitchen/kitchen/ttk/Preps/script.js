let currentLang = 'ru';
let currentData = null;

// Сопоставление кнопки → JSON-файл
const sectionFiles = {
  'Preps': 'data/preps.json',
  'Sous-Vide': 'data/sv.json'
};

// Инициализация кнопок разделов
document.querySelectorAll('.section-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const section = btn.dataset.section;
    const file = sectionFiles[section];
    if (!file) return;

    fetch(file)
      .then(response => response.json())
      .then(data => {
        currentData = data.recipes || [];
        renderTable(currentData);
      })
      .catch(err => console.error('Ошибка загрузки JSON:', err));
  });
});

// Переключение языка
function switchLanguage(lang) {
  currentLang = lang;
  if (currentData) renderTable(currentData);
}

// Функция создания таблицы
function renderTable(data) {
  const container = document.querySelector('.table-container');
  container.innerHTML = '';

  data.forEach(dish => {
    const table = document.createElement('table');
    table.className = 'dish-table';

    // Заголовок блюда
    const dishRow = document.createElement('tr');
    const tdDish = document.createElement('td');
    tdDish.colSpan = 4;
    tdDish.style.fontWeight = '600';
    tdDish.textContent = dish.title || '';
    dishRow.appendChild(tdDish);
    const thead = document.createElement('thead');
    thead.appendChild(dishRow);

    // Заголовки колонок
    const headerRow = document.createElement('tr');
    ['№', 'Продукт / Ingredient', 'Шт/гр', 'Описание'].forEach(h => {
      const th = document.createElement('th');
      th.textContent = h;
      headerRow.appendChild(th);
    });
    thead.appendChild(headerRow);
    table.appendChild(thead);

    const tbody = document.createElement('tbody');
    const keyIngredient = dish.key;

    dish.ingredients.forEach((ing, i) => {
      const tr = document.createElement('tr');

      const tdNum = document.createElement('td');
      tdNum.textContent = i + 1;

      const tdName = document.createElement('td');
      tdName.textContent = currentLang === 'ru' ? ing['Продукт'] : ing['Ingredient'];

      const tdAmount = document.createElement('td');
      tdAmount.dataset.base = ing['Шт/гр'];

      if (ing['Продукт'] === keyIngredient) {
        tdAmount.contentEditable = true;
        tdAmount.classList.add('highlight');
        tdAmount.textContent = ing['Шт/гр'];

        tdAmount.addEventListener('input', () => {
          let newVal = parseInt(tdAmount.textContent) || 0;
          const oldVal = parseInt(tdAmount.dataset.base) || 1;
          const factor = newVal / oldVal;

          // Перерасчёт всех остальных ячеек
          const trs = tdAmount.closest('table').querySelectorAll('tbody tr');
          trs.forEach(r => {
            const cell = r.cells[2];
            if (cell && cell !== tdAmount) {
              const base = parseInt(cell.dataset.base) || 0;
              cell.textContent = Math.round(base * factor);
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

    table.appendChild(tbody);
    container.appendChild(table);
  });
}