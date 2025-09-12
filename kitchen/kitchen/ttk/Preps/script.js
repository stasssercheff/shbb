let currentLang = 'ru';

// Пути к JSON-файлу
const dataFile = 'data/recipes.json';

// Загружаем JSON и инициализируем кнопки
fetch(dataFile)
  .then(response => response.json())
  .then(data => {
    // Находим все кнопки разделов
    document.querySelectorAll('.section-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const section = btn.dataset.section;
        if (data[section]) {
          createTable(data[section]);
        } else {
          console.error(`Раздел ${section} не найден в JSON`);
        }
      });
    });

    // Вешаем переключение языка
    document.querySelectorAll('.lang-btn').forEach(langBtn => {
      langBtn.addEventListener('click', () => {
        currentLang = langBtn.dataset.lang;
        // по умолчанию обновим таблицу "ПФ", если загружена
        if (data['Preps']) createTable(data['Preps']);
      });
    });
  })
  .catch(err => console.error('Ошибка загрузки JSON:', err));

// Функция создания таблицы
function createTable(sectionArray) {
const tableContainer = document.querySelector('.table-container');
  tableContainer.innerHTML = '';

  const table = document.createElement('table');
  const thead = document.createElement('thead');
  const tbody = document.createElement('tbody');

  // Заголовок таблицы
  const headerRow = document.createElement('tr');
  ['№', 'Продукт / Ingredient', 'Шт/гр', 'Описание'].forEach(h => {
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
      tdName.textContent =
        currentLang === 'ru'
          ? ing['Продукт']
          : ing['Ingredient'];

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