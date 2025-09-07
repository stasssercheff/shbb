let currentLang = 'ru';

// Пути к JSON
const dataFiles = {
  breakfast: 'data/breakfast.json',
  soup: 'data/soup.json',
  salad: 'data/salad.json',
  main: 'data/main.json'
};

// Хранилище данных
const data = {};

// Загрузка данных из JSON
async function loadData(section) {
  if (!data[section]) {
    try {
      const res = await fetch(dataFiles[section]);
      if (!res.ok) throw new Error('Ошибка загрузки JSON');
      data[section] = await res.json();
    } catch (err) {
      console.error(err);
      data[section] = [];
    }
  }
  return data[section];
}

// Создание таблицы
function createTable(dishes) {
  const table = document.createElement('table');
  table.className = 'dish-table';
  table.style.fontSize = '12px';
  table.style.width = '100%';
  table.style.tableLayout = 'fixed';

  const thead = document.createElement('thead');
  thead.innerHTML = `
    <tr>
      <th style="width:30px">№</th>
      <th style="width:180px">${currentLang === 'ru' ? 'Ингредиент' : 'Ingredient'}</th>
      <th style="width:60px">${currentLang === 'ru' ? 'Кол-во' : 'Amount'}</th>
      <th>${currentLang === 'ru' ? 'Описание' : 'Description'}</th>
      <th style="width:100px">${currentLang === 'ru' ? 'Фото' : 'Photo'}</th>
    </tr>
  `;
  table.appendChild(thead);

  const tbody = document.createElement('tbody');

  dishes.forEach((dish, idx) => {
    const headerRow = document.createElement('tr');
    const th = document.createElement('td');
    th.colSpan = 5;
    th.style.fontWeight = '600';
    th.textContent = dish.name[currentLang];
    headerRow.appendChild(th);
    tbody.appendChild(headerRow);

    dish.ingredients.forEach((ing, i) => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${i + 1}</td>
        <td>${ing[currentLang]}</td>
        <td>${ing.amount || ''}</td>
        <td>${i === 0 ? dish.process[currentLang] : ''}</td>
        <td>${i === 0 && dish.photo ? `<img src="${dish.photo}" class="dish-photo">` : ''}</td>
      `;
      tbody.appendChild(tr);
    });
  });

  table.appendChild(tbody);
  return table;
}

// Обработчик кнопок разделов
document.querySelectorAll('.section-btn').forEach(btn => {
  btn.addEventListener('click', async () => {
    const section = btn.dataset.section;
    const panel = document.getElementById(`${section}-section`);

    if (panel.style.display === 'block') {
      panel.style.display = 'none';
      panel.innerHTML = '';
    } else {
      panel.style.display = 'block';
      panel.innerHTML = '';
      const dishes = await loadData(section);
      const tblContainer = document.createElement('div');
      tblContainer.appendChild(createTable(dishes));
      panel.appendChild(tblContainer);
    }
  });
});

// Переключение языка
document.querySelectorAll('.lang-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    currentLang = btn.dataset.lang;
    // обновляем открытые панели
    document.querySelectorAll('.section-panel').forEach(panel => {
      if (panel.style.display === 'block') {
        const section = panel.id.replace('-section', '');
        panel.innerHTML = '';
        const tblContainer = document.createElement('div');
        tblContainer.appendChild(createTable(data[section]));
        panel.appendChild(tblContainer);
      }
    });
  });
});

// Текущая дата
document.getElementById('current-date').textContent = new Date().toLocaleDateString();