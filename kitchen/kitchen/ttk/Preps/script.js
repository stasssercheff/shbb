let currentLang = 'ru'; // текущий язык

// Пути к JSON-файлам
const dataFiles = {
  preps: 'preps.json',
  sv: 'sv.json'
};

// Функция создания таблицы
function createTable(data) {
  const table = document.createElement('table');
  table.classList.add('dish-table');

  // Заголовки
  const thead = document.createElement('thead');
  const headerRow = document.createElement('tr');
  ['№', 'Продукт', 'Количество', 'Описание'].forEach(text => {
    const th = document.createElement('th');
    th.textContent = text;
    headerRow.appendChild(th);
  });
  thead.appendChild(headerRow);
  table.appendChild(thead);

  // Тело таблицы
  const tbody = document.createElement('tbody');

  data.recipes.forEach(recipe => {
    recipe.ingredients.forEach((ing, idx) => {
      const tr = document.createElement('tr');

      // №
      const tdNum = document.createElement('td');
      tdNum.textContent = ing['№'];
      tr.appendChild(tdNum);

      // Продукт
      const tdProduct = document.createElement('td');
      tdProduct.textContent = ing['Продукт'];
      // Подсветка ключевого ингредиента
      if (ing['Продукт'] === recipe.key) {
        tdProduct.classList.add('key-cell');
        tdProduct.contentEditable = true; // разрешаем редактировать
        tdProduct.addEventListener('input', () => recalcKey(recipe, tdProduct.textContent));
      }
      tr.appendChild(tdProduct);

      // Количество
      const tdQty = document.createElement('td');
      tdQty.textContent = ing['Шт/гр'];
      tdQty.classList.add('qty-cell');
      tr.appendChild(tdQty);

      // Описание
      const tdDesc = document.createElement('td');
      tdDesc.textContent = ing['Описание'] || '';
      tdDesc.classList.add('description-cell');
      tr.appendChild(tdDesc);

      tbody.appendChild(tr);
    });
  });

  table.appendChild(tbody);
  return table;
}

// Функция пересчета ключевых ингредиентов
function recalcKey(recipe, newKey) {
  recipe.key = newKey; // обновляем ключ
  const tableRows = document.querySelectorAll('.dish-table tbody tr');

  tableRows.forEach(row => {
    const productCell = row.cells[1];
    const qtyCell = row.cells[2];
    if (productCell.textContent === newKey) {
      let val = parseInt(qtyCell.textContent, 10);
      qtyCell.textContent = val; // округляем без десятичных
      productCell.classList.add('key-cell');
    } else {
      productCell.classList.remove('key-cell');
    }
  });
}

// Функция для загрузки JSON
async function loadData(file) {
  const res = await fetch(file);
  const data = await res.json();
  return data;
}

// Инициализация страницы
async function init() {
  const prepsData = await loadData(dataFiles.preps);
  const svData = await loadData(dataFiles.sv);

  const container = document.createElement('div');
  container.classList.add('sections-container');

  // Создаем кнопки и панели
  [['ПФ', prepsData], ['Су-вид', svData]].forEach(([title, data]) => {
    const sectionDiv = document.createElement('div');
    sectionDiv.classList.add('section');

    const btn = document.createElement('button');
    btn.classList.add('section-btn');
    btn.textContent = title;
    sectionDiv.appendChild(btn);

    const panel = document.createElement('div');
    panel.classList.add('section-panel');
    panel.appendChild(createTable(data));
    sectionDiv.appendChild(panel);

    btn.addEventListener('click', () => {
      panel.style.display = panel.style.display === 'none' || panel.style.display === '' ? 'block' : 'none';
    });

    container.appendChild(sectionDiv);
  });

  document.querySelector('.main-container').appendChild(container);
}

init();