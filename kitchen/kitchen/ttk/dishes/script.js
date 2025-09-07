let currentLang = 'ru';

// Пути к JSON-файлам
const dataFiles = {
  breakfast: 'data/breakfast.json',
  soup: 'data/soup.json',
  salad: 'data/salad.json',
  main: 'data/main.json'
};

const dataCache = {}; // сюда будем кэшировать загруженные данные

// Загрузка JSON с сервера
async function loadData(section) {
  if (dataCache[section]) return dataCache[section]; // если уже загружено
  try {
    const response = await fetch(dataFiles[section]);
    if (!response.ok) throw new Error('Ошибка сети при загрузке ' + section);
    const jsonData = await response.json();
    dataCache[section] = jsonData;
    return jsonData;
  } catch (err) {
    console.error(err);
    return [];
  }
}

// Создание таблицы для раздела
function createTable(sectionArray) {
  const table = document.createElement('table');
  table.className = 'dish-table';

  const thead = document.createElement('thead');
  const headerRow = document.createElement('tr');

  const headers = ['№', 'Ингредиент', 'Шт/гр', 'Описание', 'Фото'];
  headers.forEach((text, idx) => {
    const th = document.createElement('th');
    if (currentLang === 'en') {
      if (text === 'Ингредиент') th.textContent = 'Ingredient';
      else if (text === 'Шт/гр') th.textContent = 'Qty';
      else if (text === 'Описание') th.textContent = 'Description';
      else if (text === 'Фото') th.textContent = 'Photo';
      else th.textContent = text;
    } else {
      th.textContent = text;
    }
    headerRow.appendChild(th);
  });
  thead.appendChild(headerRow);
  table.appendChild(thead);

  const tbody = document.createElement('tbody');

  sectionArray.forEach(dish => {
    // Название блюда в отдельной строке
    const dishRow = document.createElement('tr');
    const tdDish = document.createElement('td');
    tdDish.colSpan = 5;
    tdDish.style.fontWeight = '600';
    tdDish.textContent = dish.name[currentLang];
    dishRow.appendChild(tdDish);
    tbody.appendChild(dishRow);

    // Ингредиенты
    dish.ingredients.forEach((ing, idx) => {
      const tr = document.createElement('tr');

      const tdNum = document.createElement('td');
      tdNum.textContent = idx + 1;

      const tdName = document.createElement('td');
      tdName.textContent = ing[currentLang] || '';

      const tdAmount = document.createElement('td');
      tdAmount.textContent = ing.amount || '';

      const tdDesc = document.createElement('td');
      tdDesc.textContent = idx === 0 ? (dish.process ? dish.process[currentLang] || '' : '') : '';

      const tdPhoto = document.createElement('td');
      if (idx === 0 && dish.photo) {
        const img = document.createElement('img');
        img.src = dish.photo;
        img.alt = 'photo';
        img.className = 'dish-photo';
        tdPhoto.appendChild(img);
      }

      tr.appendChild(tdNum);
      tr.appendChild(tdName);
      tr.appendChild(tdAmount);
      tr.appendChild(tdDesc);
      tr.appendChild(tdPhoto);

      tbody.appendChild(tr);
    });
  });

  table.appendChild(tbody);
  return table;
}

// Обработка нажатия на секцию
async function toggleSection(btn) {
  const section = btn.dataset.section;
  const panel = document.getElementById(`${section}-section`);

  if (panel.style.display === 'block') {
    panel.style.display = 'none';
    panel.innerHTML = '';
  } else {
    panel.style.display = 'block';
    panel.innerHTML = '';

    const data = await loadData(section);
    const tblContainer = document.createElement('div');
    tblContainer.className = 'table-container';
    tblContainer.appendChild(createTable(data));
    panel.appendChild(tblContainer);
  }
}

// Инициализация кнопок секций
document.querySelectorAll('.section-btn').forEach(btn => {
  btn.addEventListener('click', () => toggleSection(btn));
});

// Переключение языка
document.querySelectorAll('.lang-btn').forEach(btn => {
  btn.addEventListener('click', async () => {
    currentLang = btn.dataset.lang;

    // Перестроить открытые таблицы
    for (const panel of document.querySelectorAll('.section-panel')) {
      if (panel.style.display === 'block') {
        const section = panel.id.replace('-section', '');
        panel.innerHTML = '';
        const data = await loadData(section);
        const tblContainer = document.createElement('div');
        tblContainer.className = 'table-container';
        tblContainer.appendChild(createTable(data));
        panel.appendChild(tblContainer);
      }
    }
  });
});

// Текущая дата
document.getElementById('current-date').textContent = new Date().toLocaleDateString();