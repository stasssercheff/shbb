let currentLang = 'ru';

// Пути к JSON по разделам
const dataFiles = {
  Preps: 'data/preps.json',
  'Sous-Vide': 'data/sous-vide.json'
};

// Функция создания таблицы
function createTable(sectionArray) {
  const tableContainer = document.getElementById('tableContainer');
  tableContainer.innerHTML = '';

  const table = document.createElement('table');
  const thead = document.createElement('thead');
  const tbody = document.createElement('tbody');

  // Заголовок таблицы
  const headerRow = document.createElement('tr');
  ['№', currentLang === 'ru' ? 'Продукт' : 'Ingredient', 
   currentLang === 'ru' ? 'Шт/гр' : 'Amount', 
   currentLang === 'ru' ? 'Описание' : 'Description'].forEach(h => {
    const th = document.createElement('th');
    th.textContent = h;
    headerRow.appendChild(th);
  });
  thead.appendChild(headerRow);

  // Перебираем блюда
  sectionArray.forEach(dish => {
    // строка с названием блюда
    const dishRow = document.createElement('tr');
    const tdDish = document.createElement('td');
    tdDish.colSpan = 4;
    tdDish.style.fontWeight = '600';
    tdDish.textContent = dish.title || '';
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

  table.appendChild(thead);
  table.appendChild(tbody);
  tableContainer.appendChild(table);
}

// Загрузка данных по разделу
async function loadSection(section) {
  const panel = document.getElementById(section);
  panel.innerHTML = '<p>Загрузка...</p>';

  try {
    const response = await fetch(dataFiles[section]);
    if (!response.ok) throw new Error('Ошибка загрузки JSON');
    const data = await response.json();

    const tableContainer = document.createElement('div');
    tableContainer.id = 'tableContainer';
    tableContainer.appendChild(createTable(data.recipes));
    panel.innerHTML = '';
    panel.appendChild(tableContainer);

  } catch (err) {
    panel.innerHTML = `<p style="color:red">${err.message}</p>`;
    console.error(err);
  }
}

// Переключение языка и запуск
document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('current-date').textContent = new Date().toLocaleDateString();

  // обработка кнопок разделов
  document.querySelectorAll('.section-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      loadSection(btn.dataset.section);
    });
  });

  // обработка кнопок языка
  document.querySelectorAll('.lang-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      currentLang = btn.dataset.lang;
      const activeSection = document.querySelector('.section-panel:not(:empty)');
      if (activeSection) loadSection(activeSection.id);
    });
  });
});