let currentLang = 'ru';

// Пути к JSON-файлам
const dataFiles = {
  preps: 'data/preps.json',
  sv: 'data/sv.json'
};

// Создание таблицы
function createTable(recipe) {
  const table = document.createElement('table');
  table.className = 'recipe-table';

  const thead = document.createElement('thead');
  const headerRow = document.createElement('tr');
  const headers = ["№", "Продукт", "Ingredient", "Шт/гр", "Описание"];
  headers.forEach(h => {
    const th = document.createElement('th');
    th.textContent = h;
    headerRow.appendChild(th);
  });
  thead.appendChild(headerRow);
  table.appendChild(thead);

  const tbody = document.createElement('tbody');
  let descriptionCell;

  recipe.ingredients.forEach((ing, idx) => {
    const row = document.createElement('tr');

    // Номер
    const num = document.createElement('td');
    num.textContent = ing["№"] || '';
    row.appendChild(num);

    // Название RU / EN
    const name = document.createElement('td');
    name.textContent = ing["Продукт"] || '';
    row.appendChild(name);

    const nameEn = document.createElement('td');
    nameEn.textContent = ing["Ingredient"] || '';
    row.appendChild(nameEn);

    // Количество
    const qty = document.createElement('td');
    qty.textContent = ing["Шт/гр"] || '';
    if (recipe.key && ing["Продукт"] === recipe.key) {
      qty.contentEditable = true;
      qty.style.backgroundColor = "#fff6b3"; // подсветка
      qty.addEventListener('input', () => recalc(recipe, tbody, recipe.key, parseFloat(qty.textContent) || 0));
    }
    row.appendChild(qty);

    // Описание
    if (idx === 0) {
      descriptionCell = document.createElement('td');
      descriptionCell.rowSpan = recipe.ingredients.length;
      descriptionCell.textContent = ing["Описание"] || '';
      row.appendChild(descriptionCell);
    }

    tbody.appendChild(row);
  });

  table.appendChild(tbody);
  return table;
}

// Перерасчет
function recalc(recipe, tbody, keyName, newKeyValue) {
  const keyIng = recipe.ingredients.find(ing => ing["Продукт"] === keyName);
  if (!keyIng) return;

  const baseValue = parseFloat(keyIng["Шт/гр"]) || 1;
  const coef = newKeyValue / baseValue;

  [...tbody.rows].forEach((row, idx) => {
    const ing = recipe.ingredients[idx];
    if (ing["Продукт"] === keyName) return;
    const cell = row.cells[3];
    const baseQty = parseFloat(ing["Шт/гр"]);
    if (!isNaN(baseQty)) {
      cell.textContent = Math.round(baseQty * coef);
    }
  });
}

// Отрисовка секций
function renderSection(sectionId, recipes) {
  const panel = document.getElementById(sectionId);
  panel.innerHTML = '';

  recipes.forEach(recipe => {
    const container = document.createElement('div');
    container.className = 'recipe-card';

    const title = document.createElement('h3');
    title.textContent = recipe.title;
    container.appendChild(title);

    container.appendChild(createTable(recipe));
    panel.appendChild(container);
  });
}

// Загрузка данных
async function loadSection(sectionId, filePath) {
  try {
    const response = await fetch(filePath);
    const data = await response.json();
    renderSection(sectionId, data.recipes);
  } catch (err) {
    console.error(`Ошибка загрузки ${filePath}:`, err);
  }
}

// Переключение языков
document.querySelectorAll('.lang-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    currentLang = btn.dataset.lang;
    location.reload();
  });
});

// Кнопки секций
document.querySelectorAll('.section-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const sectionId = btn.dataset.section;
    loadSection(sectionId, dataFiles[sectionId]);
  });
});

// Дата
document.getElementById('current-date').textContent = new Date().toLocaleDateString();