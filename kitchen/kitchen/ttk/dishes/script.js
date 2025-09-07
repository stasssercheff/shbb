let currentLang = 'ru';

// Пути к JSON-файлам
const dataFiles = {
  breakfast: 'data/breakfast.json',
  soup: 'data/soup.json',
  salad: 'data/salad.json',
  main: 'data/main.json'
};

// Функция создания таблицы
function createTable(sectionArray) {
  if (!sectionArray || !Array.isArray(sectionArray)) return null;

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

  sectionArray.forEach(dish => {
    // --- Название блюда ---
    const dishRow = document.createElement('tr');
    const tdDish = document.createElement('td');
    tdDish.colSpan = 5;
    tdDish.style.fontWeight = '600';
    tdDish.style.textAlign = 'center';
    tdDish.textContent = dish.name[currentLang];
    dishRow.appendChild(tdDish);
    tbody.appendChild(dishRow);

    // --- Ингредиенты + описание ---
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
        tdDesc.rowSpan = dish.ingredients.length;
        tdDesc.textContent = dish.process[currentLang] || '';
      }

      const tdPhoto = document.createElement('td');
      if (i === 0 && dish.photo) {
        const img = document.createElement('img');
        img.src = dish.photo;
        img.alt = dish.name[currentLang];
        img.className = 'dish-photo';
        tdPhoto.appendChild(img);
        tdPhoto.rowSpan = dish.ingredients.length;
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

// Загрузка данных раздела
async function loadSection(section) {
  const panel = document.getElementById(section);

  // Закрыть все панели
  document.querySelectorAll('.section-panel').forEach(p => {
    if (p !== panel) {
      p.style.display = 'none';
      p.innerHTML = '';
    }
  });

  if (panel.style.display === 'block') {
    panel.style.display = 'none';
    panel.innerHTML = '';
    return;
  }

  panel.style.display = 'block';
  panel.innerHTML = '';

  try {
    const response = await fetch(dataFiles[section]);
    if (!response.ok) throw new Error('Ошибка загрузки JSON: ' + section);
    const sectionData = await response.json();

    const tblContainer = document.createElement('div');
    tblContainer.className = 'table-container';
    const table = createTable(sectionData);
    if (table) tblContainer.appendChild(table);
    panel.appendChild(tblContainer);

  } catch (err) {
    panel.innerHTML = `<p style="color:red">${err.message}</p>`;
    console.error(err);
  }
}

// Инициализация кнопок и переключателя языка
document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('current-date').textContent = new Date().toLocaleDateString();

  document.querySelectorAll('.section-btn').forEach(btn => {
    btn.addEventListener('click', () => loadSection(btn.dataset.section));
  });

  document.querySelectorAll('.lang-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      currentLang = btn.dataset.lang;

      // Обновляем открытые панели
      document.querySelectorAll('.section-panel').forEach(panel => {
        if (panel.style.display === 'block') {
          const section = panel.id;
          panel.innerHTML = '';
          fetch(dataFiles[section])
            .then(resp => resp.json())
            .then(sectionData => {
              const tblContainer = document.createElement('div');
              tblContainer.className = 'table-container';
              const table = createTable(sectionData);
              if (table) tblContainer.appendChild(table);
              panel.appendChild(tblContainer);
            })
            .catch(err => console.error(err));
        }
      });
    });
  });
});