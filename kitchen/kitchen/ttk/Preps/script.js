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
    renderSection(activeSection.dataset.section, true);
  }
}

// Отображение раздела
function renderSection(sectionName, keepData=false) {
  const container = document.querySelector('.table-container');
  const btn = document.querySelector(`.section-btn[data-section="${sectionName}"]`);
  
  document.querySelectorAll('.section-btn').forEach(b => b.classList.remove('active'));

  if (!keepData && container.dataset.active === sectionName) {
    container.innerHTML = '';
    container.dataset.active = '';
    return;
  }

  btn.classList.add('active');
  container.dataset.active = sectionName;

  loadData(sectionName, data => createTable(data, sectionName, keepData));
}

// Создание таблицы
function createTable(data, sectionName, keepData=false) {
  const tableContainer = document.querySelector('.table-container');
  if(!keepData) tableContainer.innerHTML = '';

  data.recipes.forEach((dish, dishIndex) => {
    let card;
    if(!keepData){
      card = document.createElement('div');
      card.className = 'dish-card';
      tableContainer.appendChild(card);
    } else {
      card = tableContainer.children[dishIndex];
    }

    // Название карточки
    let title;
    if(!keepData){
      title = document.createElement('div');
      title.className = 'dish-title';
      card.appendChild(title);
    } else {
      title = card.querySelector('.dish-title');
    }
    title.textContent = currentLang==='ru' ? dish.name?.ru || dish.title : dish.name?.en || dish.title;

    // Таблица
    let table;
    if(!keepData){
      table = document.createElement('table');
      table.className = sectionName === 'Preps' ? 'pf-table' : 'sv-table';
      card.appendChild(table);
    } else {
      table = card.querySelector('table');
    }

    // Заголовки
    if(!keepData){
      const thead = document.createElement('thead');
      const trHead = document.createElement('tr');
      const headers = sectionName==='Preps'
        ? (currentLang==='ru' ? ['#','Продукт','Гр/шт','Описание'] : ['#','Ingredient','Rg/Pcs','Description'])
        : (currentLang==='ru' ? ['#','Продукт','Гр/шт','Темп °C','Время','Описание'] : ['#','Ingredient','Rg/Pcs','Temp C','Time','Description']);
      headers.forEach(h=>{
        const th = document.createElement('th');
        th.textContent = h;
        trHead.appendChild(th);
      });
      thead.appendChild(trHead);
      if(!table.querySelector('thead')) table.appendChild(thead);
    }

    const tbody = table.querySelector('tbody') || document.createElement('tbody');
    if(!keepData) tbody.innerHTML = '';

    dish.ingredients.forEach((ing, i)=>{
      let tr;
      if(keepData){
        tr = tbody.children[i] || document.createElement('tr');
      } else {
        tr = document.createElement('tr');
      }

      const tdNum = tr.children[0] || document.createElement('td');
      tdNum.textContent = i+1;

      const tdName = tr.children[1] || document.createElement('td');
      tdName.textContent = currentLang==='ru'?ing['Продукт']:ing['Ingredient'];

      const tdAmount = tr.children[2] || document.createElement('td');
      tdAmount.dataset.base = tdAmount.dataset.base || ing['Шт/гр'];
      tdAmount.textContent = tdAmount.textContent || ing['Шт/гр'];

      // Ключевой ингредиент
      if(ing['Продукт'] === dish.key){
        tdAmount.contentEditable = true;
        tdAmount.classList.add('key-ingredient');

        tdAmount.addEventListener('input', e=>{
          let newVal = parseFloat(tdAmount.textContent.replace(/[^0-9.]/g,'')) || 0;
          if(tdAmount.dataset.base==0) tdAmount.dataset.base = 1;
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
          e.stopPropagation(); 
        });
      }

      tr.appendChild(tdNum);
      tr.appendChild(tdName);
      tr.appendChild(tdAmount);

      if(sectionName==='Sous-Vide'){
        const tdTemp = tr.children[3] || document.createElement('td');
        tdTemp.textContent = ing['Температура С / Temperature C'] || '';
        const tdTime = tr.children[4] || document.createElement('td');
        tdTime.textContent = ing['Время мин / Time'] || '';
        if(!tr.contains(tdTemp)) tr.appendChild(tdTemp);
        if(!tr.contains(tdTime)) tr.appendChild(tdTime);
      }

      if(i===0){
        const tdDesc = tr.children[tr.children.length] || document.createElement('td');
        tdDesc.textContent = dish.process?.[currentLang] || '';
        tdDesc.rowSpan = dish.ingredients.length;
        if(!tr.contains(tdDesc)) tr.appendChild(tdDesc);
      }

      if(!tbody.contains(tr)) tbody.appendChild(tr);
    });

    if(!table.contains(tbody)) table.appendChild(tbody);
  });
}

// Инициализация кнопок
document.querySelectorAll('.section-btn').forEach(btn=>{
  btn.addEventListener('click', ()=>renderSection(btn.dataset.section));
});
document.querySelectorAll('.lang-switch button').forEach(btn=>{
  btn.addEventListener('click', ()=>switchLanguage(btn.textContent.toLowerCase()));
});