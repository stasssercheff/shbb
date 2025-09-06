let currentLang = 'ru';

const breakfastData = `сюда вставить данные жсон завтрак`;
const soupData = `сюда вставить суп жсон`;
const saladData = `сюда вставить салаты жсон`;
const mainData = `сюда вставить основные блюда жсон`;

// Парсим JSON
const data = {
  breakfast: JSON.parse(breakfastData),
  soup: JSON.parse(soupData),
  salad: JSON.parse(saladData),
  main: JSON.parse(mainData)
};

// Отображение таблиц
function createTable(sectionArray) {
  const table = document.createElement('table');
  const thead = document.createElement('thead');
  const headerRow = document.createElement('tr');
  ['Ингредиент', 'Кол-во', 'Описание'].forEach(text => {
    const th = document.createElement('th');
    th.textContent = currentLang === 'ru' ? text : text === 'Ингредиент' ? 'Ingredient' : text === 'Кол-во' ? 'Amount' : 'Description';
    headerRow.appendChild(th);
  });
  thead.appendChild(headerRow);
  table.appendChild(thead);

  const tbody = document.createElement('tbody');

  sectionArray.forEach(dish => {
    const dishRow = document.createElement('tr');
    const tdDish = document.createElement('td');
    tdDish.colSpan = 3;
    tdDish.style.fontWeight = '600';
    tdDish.textContent = dish.name[currentLang];
    dishRow.appendChild(tdDish);
    tbody.appendChild(dishRow);

    dish.ingredients.forEach(ing => {
      const tr = document.createElement('tr');
      const tdName = document.createElement('td');
      tdName.textContent = ing[currentLang];
      const tdAmount = document.createElement('td');
      tdAmount.textContent = ing.amount || '';
      const tdDesc = document.createElement('td');
      tdDesc.textContent = dish.process[currentLang] || '';
      tr.appendChild(tdName);
      tr.appendChild(tdAmount);
      tr.appendChild(tdDesc);
      tbody.appendChild(tr);
    });
  });

  table.appendChild(tbody);
  return table;
}

// Инициализация
document.querySelectorAll('.section-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const section = btn.dataset.section;
    const panel = document.getElementById(`${section}-section`);
    if (panel.style.display === 'block') {
      panel.style.display = 'none';
      panel.innerHTML = '';
    } else {
      panel.style.display = 'block';
      panel.innerHTML = '';
      const tblContainer = document.createElement('div');
      tblContainer.className = 'table-container';
      tblContainer.appendChild(createTable(data[section]));
      panel.appendChild(tblContainer);
    }
  });
});

// Переключение языка
document.querySelectorAll('.lang-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    currentLang = btn.dataset.lang;
    // обновляем открытые таблицы
    document.querySelectorAll('.section-panel').forEach(panel => {
      if (panel.style.display === 'block') {
        const section = panel.id.replace('-section', '');
        panel.innerHTML = '';
        const tblContainer = document.createElement('div');
        tblContainer.className = 'table-container';
        tblContainer.appendChild(createTable(data[section]));
        panel.appendChild(tblContainer);
      }
    });
  });
});

// Текущая дата
document.getElementById('current-date').textContent = new Date().toLocaleDateString();