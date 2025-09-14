let currentLang = 'ru';

const dataFiles = {
  'Preps': 'data/preps.json',
  'Sous-Vide': 'data/sv.json'
};

// Загрузка JSON
async function loadData(sectionName) {
  try {
    const res = await fetch(dataFiles[sectionName]);
    const data = await res.json();
    return data.recipes;
  } catch (err) {
    console.error(err);
    return [];
  }
}

// Переключение языка
function switchLanguage(lang) {
  currentLang = lang;
  document.querySelectorAll('.section-btn.active').forEach(btn=>{
    renderSection(btn.dataset.section);
  });
}

// Отображение/скрытие таблицы
async function renderSection(sectionName) {
  const btn = document.querySelector(`.section-btn[data-section="${sectionName}"]`);
  const container = document.querySelector(`.table-container[data-section="${sectionName}"]`);

  // Деклассифицируем все кнопки
  document.querySelectorAll('.section-btn').forEach(b => b.classList.remove('active'));

  if (container) {
    // уже открыта — закрыть
    container.remove();
    return;
  }

  btn.classList.add('active');

  // Создаем контейнер для таблицы
  const tableContainer = document.createElement('div');
  tableContainer.className = 'table-container';
  tableContainer.dataset.section = sectionName;
  btn.after(tableContainer);

  const recipes = await loadData(sectionName);

  recipes.forEach(recipe => {
    createRecipeTable(recipe, sectionName, tableContainer);
  });
}

// Создание таблицы для одного рецепта
function createRecipeTable(recipe, sectionName, container) {
  const title = document.createElement('h2');
  title.className = 'recipe-title';
  title.textContent = recipe.name ? recipe.name[currentLang] || '' : recipe.title || '';
  container.appendChild(title);

  const table = document.createElement('table');
  table.className = 'dish-table ' + (sectionName === 'Preps' ? 'pf-table' : 'sv-table');

  const thead = document.createElement('thead');
  const tbody = document.createElement('tbody');

  const headers = sectionName === 'Preps'
    ? ['№','Продукт / Ingredient','Шт/гр','Описание']
    : ['№','Продукт / Ingredient','Шт/гр','Темп °C','Время','Описание'];

  // Заголовок
  const headerRow = document.createElement('tr');
  headers.forEach(h=>{
    const th = document.createElement('th');
    th.textContent = h;
    headerRow.appendChild(th);
  });
  thead.appendChild(headerRow);

  recipe.ingredients.forEach((ing, i) => {
    const tr = document.createElement('tr');

    const tdNum = document.createElement('td');
    tdNum.textContent = ing['№'];

    const tdName = document.createElement('td');
    tdName.textContent = currentLang==='ru' ? ing['Продукт'] : ing['Ingredient'];

    const tdAmount = document.createElement('td');
    tdAmount.textContent = ing['Шт/гр'];
    tdAmount.dataset.base = ing['Шт/гр'];

    // Если ключевой ингредиент, делаем editable и перерасчет
    if (recipe.key && ing['Продукт'] === recipe.key) {
      tdAmount.contentEditable = true;
      tdAmount.classList.add('key-ingredient');

      tdAmount.addEventListener('input', ()=>{
        let val = parseFloat(tdAmount.textContent.replace(/[^\d.]/g,'')) || 0;
        tdAmount.textContent = val;
        const factor = val / parseFloat(tdAmount.dataset.base || 1);

        tbody.querySelectorAll('tr').forEach(r=>{
          const cell = r.cells[2];
          if(cell && cell!==tdAmount){
            const base = parseFloat(cell.dataset.base) || 0;
            cell.textContent = Math.round(base * factor);
          }
        });
        tdAmount.dataset.base = val;
      });
    }

    const tdExtras = [];
    if (sectionName === 'Sous-Vide') {
      const temp = document.createElement('td');
      temp.textContent = ing['Температура С / Temperature C'] || '';
      tdExtras.push(temp);

      const time = document.createElement('td');
      time.textContent = ing['Время мин / Time'] || '';
      tdExtras.push(time);
    }

    const tdDesc = document.createElement('td');
    tdDesc.textContent = ing['Описание'] || (i===0 ? (recipe.process ? recipe.process[currentLang] : '') : '');
    if(i===0 && sectionName==='Preps') tdDesc.rowSpan = recipe.ingredients.length;

    tr.appendChild(tdNum);
    tr.appendChild(tdName);
    tr.appendChild(tdAmount);
    tdExtras.forEach(td => tr.appendChild(td));
    tr.appendChild(tdDesc);

    tbody.appendChild(tr);
  });

  table.appendChild(thead);
  table.appendChild(tbody);
  container.appendChild(table);
}

// Инициализация кнопок
document.querySelectorAll('.section-btn').forEach(btn=>{
  btn.addEventListener('click', ()=>renderSection(btn.dataset.section));
});
document.querySelectorAll('.lang-switch button').forEach(btn=>{
  btn.addEventListener('click', ()=>switchLanguage(btn.textContent.toLowerCase()));
});