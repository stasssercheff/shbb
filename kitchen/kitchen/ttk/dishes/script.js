let currentLang = 'ru';

// Пути к файлам JSON
const jsonFiles = {
  breakfast: 'data/breakfast.json',
  soup: 'data/soup.json',
  salad: 'data/salad.json',
  main: 'data/main.json'
};

// Загрузка данных из JSON
async function loadData(filePath) {
  try {
    const res = await fetch(filePath);
    if (!res.ok) throw new Error(`Ошибка сети: ${res.status}`);
    return await res.json();
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
  ['№', 'Ингредиент', 'Шт/гр', 'Описание', 'Фото'].forEach((txt, i) => {
    const th = document.createElement('th');
    if (currentLang === 'en') {
      const enHeaders = ['No', 'Ingredient', 'Qty', 'Description', 'Photo'];
      th.textContent = enHeaders[i];
    } else {
      th.textContent = txt;
    }
    headerRow.appendChild(th);
  });
  thead.appendChild(headerRow);
  table.appendChild(thead);

  const tbody = document.createElement('tbody');

  sectionArray.forEach(dish => {
    // строка с названием блюда
    const dishRow = document.createElement('tr');
    const tdDish = document.createElement('td');
    tdDish.colSpan = 5;
    tdDish.style.fontWeight = '600';
    tdDish.textContent = dish.name[currentLang];
    dishRow.appendChild(tdDish);
    tbody.appendChild(dishRow);

    dish.ingredients.forEach((ing, i) => {
      const tr = document.createElement('tr');
      const tdNo = document.createElement('td');
      tdNo.textContent = i + 1;
      const tdName = document.createElement('td');
      tdName.textContent = ing[currentLang];
      const tdAmount = document.createElement('td');
      tdAmount.textContent = ing.amount || '';
      const tdDesc = document.createElement('td');
      tdDesc.textContent = i === 0 ? dish.process[currentLang] : '';
      const tdPhoto = document.createElement('td');
      if (i === 0 && dish.photo) {
        const img = document.createElement('img');
        img.src = dish.photo;
        img.className = 'dish-photo';
        tdPhoto.appendChild(img);
      }

      tr.appendChild(tdNo);
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

// Обработчик клика по кнопке раздела
async function openSection(btn) {
  const section = btn.dataset.section;
  const panel = document.getElementById(`${section}-section`);

  // если уже открыт — закрыть
  if (panel.style.display === 'block') {
    panel.style.display = 'none';
    panel.innerHTML = '';
    return;
  }

  // закрыть все остальные разделы
  document.querySelectorAll('.section-panel').forEach(p => {
    p.style.display = 'none';
    p.innerHTML = '';
  });

  // загрузка JSON и отображение
  const data = await loadData(jsonFiles[section]);
  panel.style.display = 'block';
  const tableContainer = document.createElement('div');
  tableContainer.className = 'table-container';
  tableContainer.appendChild(createTable(data));
  panel.appendChild(tableContainer);
}

// Переключение языка
function switchLanguage(lang) {
  currentLang = lang;
  // обновляем открытые панели
  document.querySelectorAll('.section-panel').forEach(panel => {
    if (panel.style.display === 'block') {
      const section = panel.id.replace('-section', '');
      openSection({ dataset: { section } });
    }
  });
}

// Инициализация
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.section-btn').forEach(btn => {
    btn.addEventListener('click', () => openSection(btn));
  });

  document.querySelectorAll('.lang-btn').forEach(btn => {
    btn.addEventListener('click', () => switchLanguage(btn.dataset.lang));
  });

  // текущая дата
  const dateEl = document.getElementById('current-date');
  if (dateEl) dateEl.textContent = new Date().toLocaleDateString();
});