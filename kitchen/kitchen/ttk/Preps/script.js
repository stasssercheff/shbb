let currentLang = 'ru';
let openSection = null; // Для отслеживания открытого раздела

// Сопоставление кнопка → JSON
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

    const container = document.querySelector('.table-container');

    // Закрываем раздел, если он уже открыт
    if (openSection === section) {
      container.innerHTML = '';
      openSection = null;
      return;
    }

    fetch(file)
      .then(res => res.json())
      .then(data => {
        openSection = section;
        renderTable(data.recipes, section);
      })
      .catch(err => console.error('Ошибка загрузки JSON:', err));
  });
});

// Переключение языка
function switchLanguage(lang) {
  currentLang = lang;
  if (openSection) {
    const file = sectionFiles[openSection];
    fetch(file)
      .then(res => res.json())
      .then(data => renderTable(data.recipes, openSection))
      .catch(err => console.error('Ошибка загрузки JSON:', err));
  }
}

// Настройки отображения столбцов (ширина в %, шрифт)
const columnSettings = {
  '№': { width: '5%', font: 'bold 14px sans-serif' },
  'Продукт / Ingredient': { width: '35%', font: '14px sans-serif' },
  'Шт/гр': { width: '15%', font: '14px sans-serif' },
  'Описание': { width: '45%', font: '14px sans-serif' }
};

// Функция создания таблицы
function renderTable(data, section) {
  const container = document.querySelector('.table-container');
  container.innerHTML = '';

  data.forEach(dish => {
    const table = document.createElement('table');
    table.className = 'dish-table';

    const thead = document.createElement('thead');
    const tbody = document.createElement('tbody');

    // Заголовок блюда
    const dishRow = document.createElement('tr');
    const tdDish = document.createElement('td');
    tdDish.colSpan = section === 'Sous-Vide' ? 3 : 4; // Су-Вид половина столбцов
    tdDish.style.fontWeight = '600';
    tdDish.textContent = dish.title || '';
    dishRow.appendChild(tdDish);
    thead.appendChild(dishRow);

    // Заголовки колонок
    const headerRow = document.createElement('tr');
    const headers = section === 'Sous-Vide' 
      ? ['№', 'Продукт / Ingredient', 'Шт/гр'] 
      : ['№', 'Продукт / Ingredient', 'Шт/гр', 'Описание'];

    headers.forEach(h => {
      const th = document.createElement('th');
      th.textContent = h;
      if (columnSettings[h]) {
        th.style.width = columnSettings[h].width;
        th.style.font = columnSettings[h].font;
      }
      headerRow.appendChild(th);
    });
    thead.appendChild(headerRow);
    table.appendChild(thead);

    const keyIngredient = dish.key;

    dish.ingredients.forEach((ing, i) => {
      const tr = document.createElement('tr');

      const tdNum = document.createElement('td');
      tdNum.textContent = i + 1;
      tdNum.style.font = columnSettings['№'].font;

      const tdName = document.createElement('td');
      tdName.textContent = currentLang === 'ru' ? ing['Продукт'] : ing['Ingredient'];
      tdName.style.font = columnSettings['Продукт / Ingredient'].font;

      const tdAmount = document.createElement('td');
      tdAmount.dataset.base = ing['Шт/гр'];
      tdAmount.style.font = columnSettings['Шт/гр'].font;

      // Подсветка ключевого ингредиента и перерасчёт
      if (ing['Продукт'] === keyIngredient) {
        tdAmount.contentEditable = true;
        tdAmount.style.backgroundColor = '#fff8b0'; // бледно-желтый
        tdAmount.textContent = ing['Шт/гр'];

        tdAmount.addEventListener('input', () => {
          let newVal = parseInt(tdAmount.textContent) || 0;
          const oldVal = parseInt(tdAmount.dataset.base) || 1;
          const factor = newVal / oldVal;

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

      tr.appendChild(tdNum);
      tr.appendChild(tdName);
      tr.appendChild(tdAmount);

      if (section !== 'Sous-Vide') {
        const tdDesc = document.createElement('td');
        if (i === 0) {
          tdDesc.textContent = dish.process?.[currentLang] || '';
          tdDesc.rowSpan = dish.ingredients.length;
          tdDesc.style.font = columnSettings['Описание'].font;
          tdDesc.className = 'description-cell';
        }
        if (i === 0) tr.appendChild(tdDesc);
      }

      tbody.appendChild(tr);
    });

    table.appendChild(tbody);
    container.appendChild(table);
  });
}