let currentLang = 'ru';

// Пути к JSON
const dataFiles = {
  breakfast: 'data/breakfast.json',
  soup: 'data/soup.json',
  salad: 'data/salad.json',
  main: 'data/main.json'
};

// Кэш данных
const dataCache = {};

// Отображение таблицы
function createTable(sectionArray) {
  const table = document.createElement('table');
  table.className = 'dish-table';

  const thead = document.createElement('thead');
  thead.innerHTML = `
    <tr>
      <th>№</th>
      <th>${currentLang === 'ru' ? 'Ингредиент' : 'Ingredient'}</th>
      <th>${currentLang === 'ru' ? 'Шт/гр' : 'Qty'}</th>
      <th>${currentLang === 'ru' ? 'Описание' : 'Description'}</th>
      <th>${currentLang === 'ru' ? 'Фото' : 'Photo'}</th>
    </tr>
  `;
  table.appendChild(thead);

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

    dish.ingredients.forEach((ing, i) => {
      const tr = document.createElement('tr');

      const tdNum = document.createElement('td');
      tdNum.textContent = i + 1;

      const tdName = document.createElement('td');
      tdName.textContent = ing[currentLang] || '';

      const tdAmount = document.createElement('td');
      tdAmount.textContent = ing.amount || '';

      const tdDesc = document.createElement('td');
      tdDesc.textContent = i === 0 ? dish.process[currentLang] || '' : '';

      const tdPhoto = document.createElement('td');
      if (i === 0 && dish.photo) {
        const img = document.createElement('img');
        img.src = dish.photo;
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

// Загрузка раздела
async function loadSection(section) {
  const panel = document.getElementById(`${section}-section`);

  // Если уже открыт, закрываем
  if (panel.style.display === 'block') {
    panel.style.display = 'none';
    panel.innerHTML = '';
    return;
  }

  // Скрыть все другие разделы
  document.querySelectorAll('.section-panel').forEach(p => {
    p.style.display = 'none';
    p.innerHTML = '';
  });

  // Получаем данные из кэша или JSON
  if (!dataCache[section]) {
    try {
      const response = await fetch(dataFiles[section]);
      if (!response.ok) throw new Error('Ошибка загрузки JSON');
      dataCache[section] = await response.json();
    } catch (err) {
      panel.innerHTML = `<p style="color:red">Ошибка: ${err.message}</p>`;
      panel.style.display = 'block';
      return;
    }
  }

  const tableContainer = document.createElement('div');
  tableContainer.className = 'table-container';
  tableContainer.appendChild(createTable(dataCache[section]));
  panel.appendChild(tableContainer);
  panel.style.display = 'block';
}

// Инициализация кнопок
document.querySelectorAll('.section-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    loadSection(btn.dataset.section);
  });
});

// Переключение языка
document.querySelectorAll('.lang-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    currentLang = btn.dataset.lang;
    // обновляем открытые разделы
    document.querySelectorAll('.section-panel').forEach(panel => {
      if (panel.style.display === 'block') {
        const section = panel.id.replace('-section', '');
        panel.innerHTML = '';
        const tableContainer = document.createElement('div');
        tableContainer.className = 'table-container';
        tableContainer.appendChild(createTable(dataCache[section]));
        panel.appendChild(tableContainer);
      }
    });
  });
});

// Текущая дата
document.getElementById('current-date').textContent = new Date().toLocaleDateString();