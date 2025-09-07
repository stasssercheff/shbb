let currentLang = 'ru';

// Пути к JSON-файлам
const dataFiles = {
  breakfast: 'data/breakfast.json', // сюда вставить путь к завтракам
  soup: 'data/soup.json',           // сюда вставить путь к супам
  salad: 'data/salad.json',         // сюда вставить путь к салатам
  main: 'data/main.json'            // сюда вставить путь к основным блюдам
};

// Кэш для загруженных данных
const dataCache = {};

// Создание таблицы блюд
function createTable(dishes) {
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

  dishes.forEach(dish => {
    // Название блюда
    const trTitle = document.createElement('tr');
    const tdTitle = document.createElement('td');
    tdTitle.colSpan = 5;
    tdTitle.style.fontWeight = '600';
    tdTitle.textContent = dish.name[currentLang];
    trTitle.appendChild(tdTitle);
    tbody.appendChild(trTitle);

    // Ингредиенты
    dish.ingredients.forEach((ing, i) => {
      const tr = document.createElement('tr');
      const tdNum = document.createElement('td');
      tdNum.textContent = i + 1;
      const tdName = document.createElement('td');
      tdName.textContent = ing[currentLang];
      const tdAmount = document.createElement('td');
      tdAmount.textContent = ing.amount || '';
      const tdDesc = document.createElement('td');
      tdDesc.textContent = i === 0 ? dish.process[currentLang] || '' : '';
      const tdPhoto = document.createElement('td');
      tdPhoto.innerHTML = i === 0 && dish.photo ? `<img src="${dish.photo}" class="dish-photo">` : '';
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

  // если открыт — закрываем
  if (panel.style.display === 'block') {
    panel.style.display = 'none';
    panel.innerHTML = '';
    return;
  }

  panel.style.display = 'block';
  panel.innerHTML = 'Загрузка...';

  // Загружаем данные JSON, если не в кэше
  if (!dataCache[section]) {
    try {
      const resp = await fetch(dataFiles[section]);
      if (!resp.ok) throw new Error('Ошибка сети');
      const json = await resp.json();
      dataCache[section] = json;
    } catch (err) {
      panel.innerHTML = `<p style="color:red">Ошибка загрузки: ${err.message}</p>`;
      return;
    }
  }

  panel.innerHTML = '';
  panel.appendChild(createTable(dataCache[section]));
}

// Назначаем клики на кнопки разделов
document.querySelectorAll('.section-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const section = btn.dataset.section;
    loadSection(section);
  });
});

// Переключение языка
document.querySelectorAll('.lang-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    currentLang = btn.dataset.lang;
    document.querySelectorAll('.section-panel').forEach(panel => {
      if (panel.style.display === 'block') {
        const section = panel.id.replace('-section', '');
        panel.innerHTML = '';
        panel.appendChild(createTable(dataCache[section]));
      }
    });
  });
});

// Текущая дата
document.getElementById('current-date').textContent = new Date().toLocaleDateString();