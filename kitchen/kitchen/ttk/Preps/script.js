let currentLang = 'ru';

const dataFiles = {
  preps: 'data/preps.json',
  sv: 'data/sv.json'
};

// Загрузка данных
async function loadSection(section) {
  const panel = document.getElementById(section);
  panel.innerHTML = '';

  try {
    const response = await fetch(dataFiles[section]);
    const data = await response.json();

    data.recipes.forEach(recipe => {
      const container = document.createElement('div');
      container.className = 'table-container';

      const title = document.createElement('h3');
      title.textContent = recipe.title;
      container.appendChild(title);

      const table = createTable(recipe.ingredients);
      container.appendChild(table);

      panel.appendChild(container);
    });
  } catch (e) {
    console.error(`Ошибка загрузки ${section}:`, e);
    panel.innerHTML = '<p>Ошибка загрузки данных.</p>';
  }
}

// Создание таблицы
function createTable(ingredients) {
  const table = document.createElement('table');

  const headerRow = document.createElement('tr');
  Object.keys(ingredients[0]).forEach(key => {
    const th = document.createElement('th');
    th.textContent = key;
    headerRow.appendChild(th);
  });
  table.appendChild(headerRow);

  ingredients.forEach(row => {
    const tr = document.createElement('tr');
    Object.keys(row).forEach(key => {
      const td = document.createElement('td');

      // ключевой ингредиент
      if (row.key === true && key === "Шт/гр") {
        td.contentEditable = "true";
        td.classList.add('key-cell');
        td.addEventListener('input', () => recalcRow(table, ingredients, row, td));
      }

      td.textContent = row[key];
      tr.appendChild(td);
    });
    table.appendChild(tr);
  });

  return table;
}

// Перерасчёт
function recalcRow(table, ingredients, baseRow, editedCell) {
  const newValue = parseFloat(editedCell.textContent);
  if (isNaN(newValue) || newValue <= 0) return;

  const baseIndex = ingredients.indexOf(baseRow);
  const oldValue = parseFloat(baseRow["Шт/гр"]);

  const coef = newValue / oldValue;

  ingredients.forEach((row, i) => {
    if (i !== baseIndex) {
      if (!isNaN(parseFloat(row["Шт/гр"]))) {
        row["Шт/гр"] = Math.round(parseFloat(row["Шт/гр"]) * coef);
      }
    } else {
      row["Шт/гр"] = newValue;
    }
  });

  const newTable = createTable(ingredients);
  table.replaceWith(newTable);
}

// Переключение секций
document.querySelectorAll('.section-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const section = btn.dataset.section;
    const panel = document.getElementById(section);
    panel.style.display = panel.style.display === 'block' ? 'none' : 'block';
    if (panel.style.display === 'block') {
      loadSection(section);
    }
  });
});

// Дата
function updateDate() {
  const el = document.getElementById('current-date');
  const now = new Date();
  el.textContent = now.toLocaleDateString(currentLang, {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
  });
}
updateDate();

// Смена языка
document.querySelectorAll('.lang-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    currentLang = btn.dataset.lang;
    updateDate();
  });
});