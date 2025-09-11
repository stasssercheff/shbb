let currentLang = 'ru';

// Пути к JSON-файлам
const dataFiles = {
  preps: 'data/preps.json',
  sv: 'data/sv.json'
};

// Ключевые столбцы для перерасчёта
const keyColumns = ["Шт/гр", "Qty"];

// Функция загрузки данных
async function loadData(section) {
  try {
    const response = await fetch(dataFiles[section]);
    if (!response.ok) throw new Error(`Ошибка загрузки ${section}`);
    return await response.json();
  } catch (err) {
    console.error(err);
    return null;
  }
}

// Создание таблицы
function createTable(sectionArray) {
  const table = document.createElement('table');
  table.className = 'recipe-table';

  sectionArray.forEach(recipe => {
    // Заголовок
    const caption = document.createElement('caption');
    caption.textContent = recipe.title;
    table.appendChild(caption);

    if (!recipe.ingredients || recipe.ingredients.length === 0) return;

    // Заголовок таблицы
    const thead = document.createElement('thead');
    const headRow = document.createElement('tr');

    Object.keys(recipe.ingredients[0]).forEach(key => {
      const th = document.createElement('th');
      th.textContent = key;
      headRow.appendChild(th);
    });

    thead.appendChild(headRow);
    table.appendChild(thead);

    // Тело таблицы
    const tbody = document.createElement('tbody');

    recipe.ingredients.forEach((ing, rowIndex) => {
      const row = document.createElement('tr');

      Object.entries(ing).forEach(([key, value]) => {
        const td = document.createElement('td');

        if (keyColumns.includes(key)) {
          const input = document.createElement('input');
          input.type = 'number';
          input.value = value;
          input.classList.add('key-input');
          input.addEventListener('input', () => recalcRow(row, rowIndex, recipe.ingredients, key, input.value));
          td.appendChild(input);
        } else {
          td.textContent = value;
        }

        row.appendChild(td);
      });

      tbody.appendChild(row);
    });

    table.appendChild(tbody);
  });

  return table;
}

// Перерасчёт значений в строке
function recalcRow(row, rowIndex, ingredients, key, newValue) {
  const oldValue = ingredients[rowIndex][key];
  const factor = parseFloat(newValue) / parseFloat(oldValue);

  if (!isFinite(factor) || factor <= 0) return;

  ingredients[rowIndex][key] = newValue;

  // Обновляем все значения в этой строке
  const cells = row.querySelectorAll('td');
  let i = 0;
  for (const [colKey, colVal] of Object.entries(ingredients[rowIndex])) {
    if (keyColumns.includes(colKey) && colKey !== key) {
      const newVal = Math.round(parseFloat(colVal) * factor * 100) / 100;
      ingredients[rowIndex][colKey] = newVal;
      const input = cells[i].querySelector('input');
      if (input) input.value = newVal;
    }
    i++;
  }
}

// Отображение секции
async function displaySection(section) {
  const panel = document.getElementById(section);
  panel.innerHTML = '';

  const data = await loadData(section);
  if (!data) return;

  const tblContainer = document.createElement('div');
  tblContainer.className = 'table-container';
  tblContainer.appendChild(createTable(data.recipes));
  panel.appendChild(tblContainer);
}

// Переключатель секций
document.querySelectorAll('.section-btn').forEach(btn => {
  btn.addEventListener('click', async () => {
    const section = btn.dataset.section;
    const panel = document.getElementById(section);

    if (panel.classList.contains('open')) {
      panel.classList.remove('open');
      panel.innerHTML = '';
    } else {
      await displaySection(section);
      panel.classList.add('open');
    }
  });
});

// Переключатель языка
document.querySelectorAll('.lang-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    currentLang = btn.dataset.lang;
    document.documentElement.lang = currentLang;
    document.querySelectorAll('.section-panel.open').forEach(panel => {
      const section = panel.id;
      displaySection(section);
    });
  });
});

// Дата
document.addEventListener('DOMContentLoaded', () => {
  const dateEl = document.getElementById('current-date');
  const now = new Date();
  dateEl.textContent = now.toLocaleDateString('ru-RU', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });
});