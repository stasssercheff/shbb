let currentLang = 'ru';

const dataFiles = {
  Preps: 'data/preps.json',
  'Sous-Vide': 'data/sv.json'
};

// Загрузка JSON
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

// Отображение раздела
function renderSection(sectionName) {
  const container = document.querySelector('.table-container');
  const btn = document.querySelector(`.section-btn[data-section="${sectionName}"]`);
  
  document.querySelectorAll('.section-btn').forEach(b => b.classList.remove('active'));

  if (container.dataset.active === sectionName) {
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

  data.recipes.forEach((dish, dishIndex) => {
    const card = document.createElement('div');
    card.className = 'dish-card';

    // Название карточки
    const title = document.createElement('div');
    title.className = 'dish-title';
    title.textContent = currentLang==='ru' ? dish.name?.ru || dish.title : dish.name?.en || dish.title;
    card.appendChild(title);

    // Таблица
    const table = document.createElement('table');
    table.className = sectionName === 'Preps' ? 'pf-table' : 'sv-table';

    const thead = document.createElement('thead');
    const tbody = document.createElement('tbody');

    const headers = sectionName==='Preps'
      ? (currentLang==='ru' ? ['#','Продукт','Гр/шт','Описание'] : ['#','Ingredient','Rg/Pcs','Description'])
      : (currentLang==='ru' ? ['#','Продукт','Гр/шт','Темп °C','Время','Описание'] : ['#','Ingredient','Rg/Pcs','Temp C','Time','Description']);

    const trHead = document.createElement('tr');
    headers.forEach(h=>{
      const th = document.createElement('th');
      th.textContent = h;
      trHead.appendChild(th);
    });
    thead.appendChild(trHead);

    // Заполняем ингредиенты
    dish.ingredients.forEach((ing, i)=>{
      const tr = document.createElement('tr');

      const tdNum = document.createElement('td');
      tdNum.textContent = i+1;

      const tdName = document.createElement('td');
      tdName.textContent = currentLang==='ru'?ing['Продукт']:ing['Ingredient'];

      const tdAmount = document.createElement('td');
      tdAmount.textContent = ing['Шт/гр'];
      tdAmount.dataset.base = ing['Шт/гр'];

      // Ключевой ингредиент
      if(ing['Продукт'] === dish.key){
        tdAmount.contentEditable = true;
        tdAmount.classList.add('key-ingredient');

        tdAmount.addEventListener('input', e=>{
          let newVal = parseFloat(tdAmount.textContent.replace(/[^0-9.]/g,'')) || 0;
          if(tdAmount.dataset.base==0) tdAmount.dataset.base = 1; // защита от деления на 0
          const factor = newVal / parseFloat(tdAmount.dataset.base);

          const rows = tdAmount.closest('table').querySelectorAll('tbody tr');
          rows.forEach(r=>{
            const cell = r.cells[2];
            if(cell && cell!==tdAmount){
              let base = parseFloat(cell.dataset.base) || 0;
              cell.textContent = Math.round(base*factor);
            }
          });
          tdAmount.dataset.base = newVal;
          tdAmount.textContent = newVal;
        });

        tdAmount.addEventListener('keydown', e=>{
          // чтобы курсор не прыгал в начало
          e.stopPropagation();
        });
      }

      tr.appendChild(tdNum);
      tr.appendChild(tdName);
      tr.appendChild(tdAmount);

      if(sectionName==='Sous-Vide'){
        const tdTemp = document.createElement('td');
        tdTemp.textContent = ing['Температура С / Temperature C'] || '';
        const tdTime = document.createElement('td');
        tdTime.textContent = ing['Время мин / Time'] || '';
        tr.appendChild(tdTemp);
        tr.appendChild(tdTime);
      }

      if(i===0){
        const tdDesc = document.createElement('td');
        tdDesc.textContent = dish.process?.[currentLang] || '';
        tdDesc.rowSpan = dish.ingredients.length;
        tr.appendChild(tdDesc);
      }

      tbody.appendChild(tr);
    });

    table.appendChild(thead);
    table.appendChild(tbody);
    card.appendChild(table);
    tableContainer.appendChild(card);
  });
}

// Инициализация кнопок
document.querySelectorAll('.section-btn').forEach(btn=>{
  btn.addEventListener('click', ()=>renderSection(btn.dataset.section));
});
document.querySelectorAll('.lang-switch button').forEach(btn=>{
  btn.addEventListener('click', ()=>switchLanguage(btn.textContent.toLowerCase()));
});