let currentLang = 'ru';

// Пути к JSON
const dataFiles = {
  preps: 'preps.json',
  sv: 'sv.json'
};

// --- Создание таблицы ---
function createTable(sectionData) {
  const table = document.createElement('table');
  table.classList.add('dish-table');

  // Шапка таблицы
  const thead = document.createElement('thead');
  const headerRow = document.createElement('tr');

  const headers = ['№', 'Ингредиент', 'Шт/гр', 'Описание'];
  headers.forEach(text => {
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
    tdTitle.colSpan = headers.length;
    tdTitle.style.fontWeight = '600';
    tdTitle.textContent = recipe.title;
    titleRow.appendChild(tdTitle);
    tbody.appendChild(titleRow);

    const ingCount = recipe.ingredients.length;

    recipe.ingredients.forEach((ing, i) => {
      const tr = document.createElement('tr');

      const tdNum = document.createElement('td');
      tdNum.textContent = ing['№'] || i + 1;

      const tdName = document.createElement('td');
      tdName.textContent = ing['Продукт'];
      if (recipe.key === ing['Продукт'] && currentLang === 'ru') {
        tdName.classList.add('key-cell', 'editable');
        tdName.contentEditable = true;
        tdName.addEventListener('input', () => recalcKey(tdName.textContent, recipe));
      }

      const tdAmount = document.createElement('td');
      tdAmount.textContent = ing['Шт/гр'];

      const tdDesc = document.createElement('td');
      if (i === 0) {
        tdDesc.textContent = ing['Описание'] || '';
        tdDesc.rowSpan = ingCount;
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

// --- Перерасчет по ключевым данным ---
function recalcKey(newVal, recipe) {
  recipe.ingredients.forEach(ing => {
    if (ing['Продукт'] === recipe.key) {
      let num = parseInt(newVal);
      if (!isNaN(num)) ing['Шт/гр'] = num; // без десятичных
    }
  });
}

// --- Загрузка данных ---
async function loadSection(section) {
  const panel = document.getElementById(section);

  // Закрыть все панели кроме текущей
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

  try {
    const response = await fetch(dataFiles[section]);
    if (!response.ok) throw new Error('Ошибка загрузки JSON: ' + section);
    const sectionData = await response.json();

    panel.innerHTML = '';
    panel.appendChild(createTable(sectionData));
    panel.style.display = 'block';
  } catch (err) {
    panel.innerHTML = `<p style="color:red">${err.message}</p>`;
    console.error(err);
  }
}

// --- Инициализация кнопок и языка ---
document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('current-date').textContent = new Date().toLocaleDateString();

  document.querySelectorAll('.section-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const section = btn.dataset.section;
      loadSection(section);
    });
  });

  document.querySelectorAll('.lang-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      currentLang = btn.dataset.lang;
      // Перезагрузка активной панели
      document.querySelectorAll('.section-panel').forEach(panel => {
        if (panel.style.display === 'block') {
          loadSection(panel.id);
        }
      });
    });
  });
});