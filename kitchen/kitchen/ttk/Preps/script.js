let currentLang = 'ru';

const dataFiles = {
  Preps: 'data/preps.json',
  'Sous-Vide': 'data/sv.json'
};

// Функция загрузки JSON
function loadData(sectionName, callback) {
  fetch(dataFiles[sectionName])
    .then(res => res.json())
    .then(data => callback(data))
    .catch(err => console.error(err));
}

// Переключение языка
function switchLanguage(lang) {
  currentLang = lang;
  const activeSection = document.querySelector('.section-btn.active');
  if (activeSection) {
    renderSection(activeSection.dataset.section);
  }
}

// Отображение/скрытие раздела
function renderSection(sectionName) {
  const container = document.querySelector('.table-container');
  const btn = document.querySelector(`.section-btn[data-section="${sectionName}"]`);
  
  // Деклассифицируем все кнопки
  document.querySelectorAll('.section-btn').forEach(b=>b.classList.remove('active'));

  if (container.dataset.active === sectionName) {
    // закрыть
    container.innerHTML = '';
    container.dataset.active = '';
    return;
  }

  btn.classList.add('active');
  container.dataset.active = sectionName;

  loadData(sectionName, data => createTable(data, sectionName));
}

// Создание таблицы
function createTable(data, sectionName) {
  const tableContainer = document.querySelector('.table-container');
  tableContainer.innerHTML = '';

  const table = document.createElement('table');
  table.className = 'dish-table ' + (sectionName === 'Preps' ? 'pf-table' : 'sv-table');

  const thead = document.createElement('thead');
  const tbody = document.createElement('tbody');

  const headers = sectionName === 'Preps' 
    ? ['№','Продукт / Ingredient','Шт/гр','Описание'] 
    : ['№','Продукт / Ingredient','Шт/гр','Темп °C','Время','Описание'];

  // Заголовок
  const headerRow = document.createElement('tr');
  headers.forEach(h => {
    const th = document.createElement('th');
    th.textContent = h;
    headerRow.appendChild(th);
  });
  thead.appendChild(headerRow);

  data.recipes.forEach(dish=>{
    const dishRow = document.createElement('tr');
    const tdDish = document.createElement('td');
    tdDish.colSpan = headers.length;
    tdDish.style.fontWeight = '600';
    tdDish.textContent = dish.title || '';
    dishRow.appendChild(tdDish);
    tbody.appendChild(dishRow);

    dish.ingredients.forEach((ing,i)=>{
      const tr = document.createElement('tr');

      const tdNum = document.createElement('td');
      tdNum.textContent = i+1;

      const tdName = document.createElement('td');
      tdName.textContent = currentLang==='ru'?ing['Продукт']:ing['Ingredient'];

      const tdAmount = document.createElement('td');
      tdAmount.textContent = ing['Шт/гр'];

      // подсветка ключевого ингридиента и пересчет
      if(ing['Продукт'] === dish.key){
        tdAmount.contentEditable = true;
        tdAmount.classList.add('key-ingredient');
        tdAmount.dataset.base = ing['Шт/гр'];

tdAmount.addEventListener('input', ()=>{
  const newVal = Math.round(parseFloat(tdAmount.textContent) || 0);
  const oldVal = parseFloat(tdAmount.dataset.base) || 1;
  const factor = newVal / oldVal;

  // пересчёт только внутри текущего блюда
  const ingredientRows = Array.from(tdAmount.closest('tbody').querySelectorAll('tr'))
    .filter(tr => tr.cells.length > 2 && !tr.cells[0].colSpan); // исключаем строки с заголовком блюда

  ingredientRows.forEach(r=>{
    const cell = r.cells[2];
    if(cell && cell !== tdAmount){
      let base = parseFloat(cell.dataset.base);
      if(!base) base = parseFloat(cell.textContent) || 0;
      cell.dataset.base = base;
      cell.textContent = Math.round(base * factor);
    }
  });

  tdAmount.dataset.base = newVal;
  tdAmount.textContent = newVal;
});
      }

      // Остальные столбцы для Су-Вид
      const extraCols = sectionName==='Sous-Vide'? ['Температура С / Temperature C','Время мин / Time'] : [];
      const tdExtras = extraCols.map(colName=>{
        const td = document.createElement('td');
        td.textContent = ing[colName] || '';
        return td;
      });

      // Описание объединяем
      const tdDesc = document.createElement('td');
      if(i===0){
        tdDesc.textContent = dish.process?.[currentLang] || '';
        tdDesc.rowSpan = dish.ingredients.length;
      }

      tr.appendChild(tdNum);
      tr.appendChild(tdName);
      tr.appendChild(tdAmount);
      tdExtras.forEach(td=>tr.appendChild(td));
      if(i===0) tr.appendChild(tdDesc);

      tbody.appendChild(tr);
    });
  });

  table.appendChild(thead);
  table.appendChild(tbody);
  tableContainer.appendChild(table);
}

// Инициализация кнопок
document.querySelectorAll('.section-btn').forEach(btn=>{
  btn.addEventListener('click', ()=>renderSection(btn.dataset.section));
});
document.querySelectorAll('.lang-switch button').forEach(btn=>{
  btn.addEventListener('click', ()=>switchLanguage(btn.textContent.toLowerCase()));
});