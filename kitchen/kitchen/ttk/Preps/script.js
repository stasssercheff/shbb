let currentLang = 'ru';

// Пути к JSON
const dataFiles = {
  pf: 'preps.json',
  sv: 'sv.json'
};

// Данные
let tableData = {
  pf: [],
  sv: []
};

// Загрузка данных
async function loadData(type) {
  try {
    const response = await fetch(dataFiles[type]);
    const data = await response.json();
    tableData[type] = data.recipes; // предполагаем, что в JSON массив под recipes
    renderTable(type);
  } catch (err) {
    console.error(`Ошибка загрузки ${type}:`, err);
  }
}

// Создание таблицы
function renderTable(type) {
  const panel = document.getElementById(type);
  panel.innerHTML = '';

  const container = document.createElement('div');
  container.className = 'table-container';

  const table = document.createElement('table');
  table.className = 'dish-table';

  // Заголовок
  const thead = document.createElement('thead');
  const headerRow = document.createElement('tr');
  ['№', 'Ингредиент', 'Кол-во', 'Описание'].forEach(h => {
    const th = document.createElement('th');
    th.textContent = h;
    headerRow.appendChild(th);
  });
  thead.appendChild(headerRow);
  table.appendChild(thead);

  // Тело таблицы
  const tbody = document.createElement('tbody');

  tableData[type].forEach((item, index) => {
    const row = document.createElement('tr');

    // №
    const tdIndex = document.createElement('td');
    tdIndex.textContent = index + 1;
    row.appendChild(tdIndex);

    // Ингредиент (редактируемый)
    const tdIngredient = document.createElement('td');
    tdIngredient.contentEditable = true;
    tdIngredient.textContent = item.key || '';
    tdIngredient.style.backgroundColor = '#fff8dc'; // подсветка
    tdIngredient.addEventListener('input', () => {
      item.key = tdIngredient.textContent;
      recalcQuantity(item, type);
    });
    row.appendChild(tdIngredient);

    // Количество
    const tdQuantity = document.createElement('td');
    tdQuantity.textContent = formatQuantity(item.quantity || 0);
    row.appendChild(tdQuantity);

    // Описание
    const tdDesc = document.createElement('td');
    tdDesc.textContent = item.description || '';
    tdDesc.className = 'description-cell';
    row.appendChild(tdDesc);

    tbody.appendChild(row);
  });

  table.appendChild(tbody);
  container.appendChild(table);
  panel.appendChild(container);
}

// Пересчёт по ключевым ингредиентам
function recalcQuantity(item, type) {
  // Пример формулы перерасчета: оставляем количество целым числом
  item.quantity = Math.round(item.quantity);
  renderTable(type);
}

// Форматирование количества без десятичных
function formatQuantity(q) {
  return Math.round(q);
}

// Кнопки разделов
document.querySelectorAll('.section-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const section = btn.dataset.section;
    const panel = document.getElementById(section);
    panel.style.display = (panel.style.display === 'block') ? 'none' : 'block';
  });
});

// Загрузка данных
loadData('pf');
loadData('sv');

// Отображение даты
document.getElementById('current-date').textContent = new Date().toLocaleDateString();