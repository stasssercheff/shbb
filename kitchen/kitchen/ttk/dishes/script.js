let currentLang = 'ru';

// Пути к JSON-файлам
const dataFiles = {
  breakfast: 'data/breakfast.json',
  soup: 'data/soup.json',
  salad: 'data/salad.json',
  main: 'data/main.json'
};

// Функция создания таблицы для раздела
function createTable(sectionArray) {
  if (!sectionArray) return document.createElement('div');

  const table = document.createElement('table');
  table.classList.add('dish-table');

  // Шапка таблицы
  const thead = document.createElement('thead');
  const headerRow = document.createElement('tr');
  ['№', currentLang === 'ru' ? 'Ингредиент' : 'Ingredient', currentLang === 'ru' ? 'Кол-во' : 'Amount', currentLang === 'ru' ? 'Описание' : 'Description', currentLang === 'ru' ? 'Фото' : 'Photo']
    .forEach(text => {
      const th = document.createElement('th');
      th.textContent = text;
      headerRow.appendChild(th);
    });
  thead.appendChild(headerRow);
  table.appendChild(thead);

  // Тело таблицы
  const tbody = document.createElement('tbody');

  sectionArray.forEach((dish, index) => {
    // Название блюда
    const dishRow = document.createElement('tr');
    const tdDish = document.createElement('td');
    tdDish.colSpan = 5;
    tdDish.style.fontWeight = '600';
    tdDish.textContent = dish.name[currentLang];
    dishRow.appendChild(tdDish);
    tbody.appendChild(dishRow);

    // Ингредиенты и описание
    const descText = dish.process[currentLang] || '';
    const ingCount = dish.ingredients.length;

    dish.ingredients.forEach((ing, i) => {
      const tr = document.createElement('tr');

      const tdNum = document.createElement('td');
      tdNum.textContent = i + 1;

      const tdName = document.createElement('td');
      tdName.textContent = ing[currentLang];

      const tdAmount = document.createElement('td');
      tdAmount.textContent = ing.amount || '';

      const tdDesc = document.createElement('td');
      if (i === 0) {
        tdDesc.textContent = descText;
        tdDesc.rowSpan = ingCount; // объединяем ячейки
        tdDesc.className = "description-cell"; // ✅ для стилей
      }

      const tdPhoto = document.createElement('td');
      if (i === 0 && dish.photo) {
        const img = document.createElement('img');
        img.src = dish.photo;
        img.alt = dish.name[currentLang];
        img.className = 'dish-photo';
        tdPhoto.appendChild(img);
      }

      tr.appendChild(tdNum);
      tr.appendChild(tdName);
      tr.appendChild(tdAmount);
      if (i === 0) tr.appendChild(tdDesc);
      tr.appendChild(tdPhoto);

      tbody.appendChild(tr);
    });
  });

  table.appendChild(tbody);
  return table;
}