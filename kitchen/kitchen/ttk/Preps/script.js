let currentLang = 'ru';

// Пути к JSON-файлам
const dataFiles = {
  preps: 'data/preps.json',
  sv: 'data/sv.json'
};

// --- Создание таблицы ---
function createTable(sectionData) {
  if (!sectionData || !sectionData.recipes) return document.createElement('div');

  const table = document.createElement('table');
  table.classList.add('dish-table');

  // Шапка
  const thead = document.createElement('thead');
  const headerRow = document.createElement('tr');

  ['№', currentLang === 'ru' ? 'Продукт' : 'Ingredient', currentLang === 'ru' ? 'Шт/гр' : 'Amount', currentLang === 'ru' ? 'Описание' : 'Description']
    .forEach(text => {
      const th = document.createElement('th');
      th.textContent = text;
      headerRow.appendChild(th);
    });

  thead.appendChild(headerRow);
  table.appendChild(thead);

  const tbody = document.createElement('tbody');

  sectionData.recipes.forEach(recipe => {
    // Название рецепта
    const titleRow = document.createElement('tr');
    const tdTitle = document.createElement('td');
    tdTitle.colSpan = 4;
    tdTitle.style.fontWeight = '600';
    tdTitle.textContent = recipe.title;
    titleRow.appendChild(tdTitle);
    tbody.appendChild(titleRow);

    const descText = recipe.ingredients.map(ing => ing['Описание'] || '').join('\n');
    const keyIngredients = recipe.key ? [recipe.key] : [];

    recipe.ingredients.forEach((ing, i) => {
      const tr = document.createElement('tr');

      const tdNum = document.createElement('td');
      tdNum.textContent = ing['№'] || '';

      const tdName = document.createElement('td');
      tdName.textContent = currentLang === 'ru' ? ing['Продукт'] : ing['Ingredient'];

      // Подсветка ключевых ингредиентов
      if (keyIngredients.includes(ing['Продукт'])) tdName.style.backgroundColor = 'lightyellow';

      const tdAmount = document.createElement('td');
      // Округляем до целого
      tdAmount.textContent = ing['Шт/гр'] ? Math.round(Number(ing['Шт/гр'])) : '';

      // Описание в первом ряду рецепта
      const tdDesc = document.createElement('td');
      if (i === 0) {
        tdDesc.textContent = descText;
        tdDesc.rowSpan = recipe.ingredients.length;
      }

      tr.appendChild(tdNum);
      tr.appendChild(tdName);
      tr.appendChild(tdAmount);
      if (i === 0) tr.appendChild(tdDesc);

      tbody.appendChild(tr);
    });
  });

  table.appendChild(tbody);
  return table;
}

// --- Загрузка раздела ---
async function loadSection(section) {
  const panel = document.getElementById(section);

  // Закрываем все остальные панели
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
    tblContainer.appendChild(createTable(sectionData));
    panel.appendChild(tblContainer);
  } catch (err) {
    panel.innerHTML = `<p style="color:red">${err.message}</p>`;
    console.error(err);
  }
}

// --- Инициализация ---
document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('current-date').textContent = new Date().toLocaleDateString();

  // Кнопки секций
  document.querySelectorAll('.section-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      loadSection(btn.dataset.section);
    });
  });

  // Переключение языка
  document.querySelectorAll('.lang-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      currentLang = btn.dataset.lang;
      // Перерисуем открытые таблицы
      document.querySelectorAll('.section-panel').forEach(panel => {
        if (panel.style.display === 'block') {
          const section = panel.id;
          panel.innerHTML = '';
          fetch(dataFiles[section])
            .then(res => res.json())
            .then(data => {
              const tblContainer = document.createElement('div');
              tblContainer.className = 'table-container';
              tblContainer.appendChild(createTable(data));
              panel.appendChild(tblContainer);
            });
        }
      });
    });
  });
});