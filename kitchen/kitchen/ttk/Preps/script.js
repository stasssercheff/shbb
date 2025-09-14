let currentLang = 'ru';

const dataFiles = {
  Preps: 'data/preps.json',
  'Sous-Vide': 'data/sv.json'
};

// Настройки столбцов для каждого раздела
const columnSettings = {
  Preps: {
    widths: ['10%','30%','20%','40%'],      // ширины столбцов
    fonts: ['14px','16px','14px','14px']    // шрифты
  },
  'Sous-Vide': {
    widths: ['10%','30%','15%','15%','15%','15%'],
    fonts: ['14px','16px','14px','14px','14px','14px']
  }
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
  table.className = 'dish-table';

  const thead = document.createElement('thead');
  const tbody = document.createElement('tbody');

  const settings = columnSettings[sectionName];
  const headers = sectionName === 'Preps' ? ['№','Продукт / Ingredient','Шт/гр','Описание'] : ['№','Продукт / Ingredient','Шт/гр','Темп °C','Время','Описание'];

  // Заголовок
  const headerRow = document.createElement('tr');
  headers.forEach((h,i)=>{
    const th = document.createElement('th');
    th.textContent = h;
    th.style.width = settings.widths[i];
    th.style.fontSize = settings.fonts[i];
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
      tdNum.style.fontSize = settings.fonts[0];

      const tdName = document.createElement('td');
      tdName.textContent = currentLang==='ru'?ing['Продукт']:ing['Ingredient'];
      tdName.style.fontSize = settings.fonts[1];

      const tdAmount = document.createElement('td');
      tdAmount.textContent = ing['Шт/гр'];
      tdAmount.style.fontSize = settings.fonts[2];

      // подсветка ключевого ингридиента и пересчет
      if(ing['Продукт'] === dish.key){
        tdAmount.contentEditable = true;
        tdAmount.classList.add('key-ingredient');
        tdAmount.dataset.base = ing['Шт/гр'];

        tdAmount.addEventListener('input', ()=>{
          const newVal = Math.round(parseFloat(tdAmount.textContent) || 0);
          const oldVal = parseFloat(tdAmount.dataset.base) || 1;
          const factor = newVal/oldVal;

          const trs = tdAmount.closest('table').querySelectorAll('tbody tr');
          trs.forEach(r=>{
            const cell = r.cells[2];
            if(cell && cell!==tdAmount){
              const base = parseFloat(cell.dataset.base) || 0;
              cell.textContent = Math.round(base*factor);
            }
          });
          tdAmount.dataset.base = newVal;
          tdAmount.textContent = newVal;
        });
      }

      // Остальные столбцы для Су-Вид
      const extraCols = sectionName==='Sous-Vide'? ['Температура С / Temperature C','Время мин / Time'] : [];
      const tdExtras = extraCols.map((colName, idx)=>{
        const td = document.createElement('td');
        td.textContent = ing[colName] || '';
        td.style.fontSize = settings.fonts[3+idx];
        return td;
      });

      // Описание объединяем
      const tdDesc = document.createElement('td');
      if(i===0){
        tdDesc.textContent = dish.process?.[currentLang] || '';
        tdDesc.rowSpan = dish.ingredients.length;
        tdDesc.style.fontSize = settings.fonts[settings.fonts.length-1];
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
