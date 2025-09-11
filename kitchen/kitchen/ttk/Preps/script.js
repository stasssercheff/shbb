let currentLang = 'ru';

// Пути к JSON-файлам
const dataFiles = {
  preps: 'preps.json',
  sv: 'sv.json'
};

// Секция контейнеры
const sectionsContainer = document.querySelector('.sections-container');

// Создаем кнопки PF и Sous-Vide
const pfBtn = document.createElement('button');
pfBtn.textContent = 'PF';
pfBtn.classList.add('section-btn');
pfBtn.dataset.section = 'preps';
sectionsContainer.appendChild(pfBtn);

const svBtn = document.createElement('button');
svBtn.textContent = 'Sous-Vide';
svBtn.classList.add('section-btn');
svBtn.dataset.section = 'sv';
sectionsContainer.appendChild(svBtn);

// Контейнеры для таблиц
const pfPanel = document.createElement('div');
pfPanel.classList.add('section-panel');
pfPanel.id = 'preps';
sectionsContainer.appendChild(pfPanel);

const svPanel = document.createElement('div');
svPanel.classList.add('section-panel');
svPanel.id = 'sv';
sectionsContainer.appendChild(svPanel);

// Функция переключения секций
sectionsContainer.addEventListener('click', (e) => {
  if (e.target.classList.contains('section-btn')) {
    const section = e.target.dataset.section;
    document.querySelectorAll('.section-panel').forEach(panel => {
      panel.style.display = panel.id === section ? 'block' : 'none';
    });
    if (section === 'preps') loadTable('preps', pfPanel);
    if (section === 'sv') loadTable('sv', svPanel);
  }
});

// Функция загрузки JSON и создания таблицы
async function loadTable(type, container) {
  container.innerHTML = ''; // очищаем
  const response = await fetch(dataFiles[type]);
  const data = await response.json();

  data.recipes.forEach(recipe => {
    const tableContainer = document.createElement('div');
    tableContainer.classList.add('table-container');

    const table = document.createElement('table');
    table.classList.add('dish-table');

    // Заголовок
    const thead = document.createElement('thead');
    const headRow = document.createElement('tr');
    ['№', 'Ингредиент', 'Количество', 'Описание'].forEach(text => {
      const th = document.createElement('th');
      th.textContent = text;
      headRow.appendChild(th);
    });
    thead.appendChild(headRow);
    table.appendChild(thead);

    // Тело таблицы
    const tbody = document.createElement('tbody');

    recipe.ingredients.forEach(ing => {
      const row = document.createElement('tr');

      // №
      const tdNum = document.createElement('td');
      tdNum.textContent = ing['№'];
      row.appendChild(tdNum);

      // Ингредиент
      const tdIng = document.createElement('td');
      tdIng.textContent = ing['Продукт'];
      if (ing['key'] || ing['Key']) {
        tdIng.setAttribute('contenteditable', 'true');
        tdIng.style.backgroundColor = '#fff8dc'; // бледно-жёлтый
      }
      row.appendChild(tdIng);

      // Количество
      const tdQty = document.createElement('td');
      tdQty.textContent = ing['Шт/гр'];
      tdQty.setAttribute('contenteditable', 'true');
      tdQty.addEventListener('input', () => recalc(tbody));
      row.appendChild(tdQty);

      // Описание
      const tdDesc = document.createElement('td');
      tdDesc.textContent = ing['Описание'];
      tdDesc.classList.add('description-cell');
      tdDesc.setAttribute('colspan', '1');
      row.appendChild(tdDesc);

      tbody.appendChild(row);
    });

    table.appendChild(tbody);
    tableContainer.appendChild(table);
    container.appendChild(tableContainer);
  });
}

// Функция перерасчета
function recalc(tbody) {
  tbody.querySelectorAll('tr').forEach(row => {
    const qtyCell = row.children[2];
    if (!isNaN(qtyCell.textContent)) {
      let val = parseFloat(qtyCell.textContent);
      qtyCell.textContent = Math.round(val); // убираем десятичные
    }
  });
}

// Изначально скрываем все панели
document.querySelectorAll('.section-panel').forEach(panel => panel.style.display = 'none');