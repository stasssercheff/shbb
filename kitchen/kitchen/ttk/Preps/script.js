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
  document.querySelectorAll('.section-btn.active').forEach(btn=>{
    renderSection(btn.dataset.section);
  });
}

// Вставка курсора в конец contentEditable
function placeCaretAtEnd(el) {
  el.focus();
  if (typeof window.getSelection != "undefined"
      && typeof document.createRange != "undefined") {
    const range = document.createRange();
    range.selectNodeContents(el);
    range.collapse(false); // конец
    const sel = window.getSelection();
    sel.removeAllRanges();
    sel.addRange(range);
  }
}

// Отображение таблицы
function renderSection(sectionName) {
  const container = document.querySelector('.table-container');
  const btn = document.querySelector(`.section-btn[data-section="${sectionName}"]`);
  
  // Деклассифицируем все кнопки
  document.querySelectorAll('.section-btn').forEach(b=>b.classList.remove('active'));

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
  const container = document.querySelector('.table-container');
  container.innerHTML = '';

  data.recipes.forEach(dish=>{
    const card = document.createElement('div');
    card.className = 'dish-card';

    // Заголовок блюда
    const title = document.createElement('div');
    title.className = 'dish-title';
    title.textContent = dish.name ? dish.name[currentLang] : dish.title || '';
    card.appendChild(title);

    // Таблица
    const table = document.createElement('table');
    table.className = 'dish-table ' + (sectionName==='Preps'?'pf-table':'sv-table');

    const thead = document.createElement('thead');
    const tbody = document.createElement('tbody');

    const headers = sectionName==='Preps'
      ? ['№', 'Продукт / Ingredient', 'Шт/гр', 'Описание']
      : ['№', 'Продукт / Ingredient', 'Шт/гр', 'Темп °C', 'Время', 'Описание'];

    const headerRow = document.createElement('tr');
    headers.forEach(h=>{
      const th = document.createElement('th');
      th.textContent = h;
      headerRow.appendChild(th);
    });
    thead.appendChild(headerRow);

    dish.ingredients.forEach((ing,i)=>{
      const tr = document.createElement('tr');

      const tdNum = document.createElement('td');
      tdNum.textContent = ing['№'] || i+1;

      const tdName = document.createElement('td');
      tdName.textContent = currentLang==='ru'?ing['Продукт']:ing['Ingredient'];

      const tdAmount = document.createElement('td');
      tdAmount.textContent = ing['Шт/гр'];
      tdAmount.dataset.base = ing['Шт/гр'];

      if(ing['Продукт'] === dish.key){
        tdAmount.contentEditable = true;
        tdAmount.classList.add('key-ingredient');

        tdAmount.addEventListener('input', e=>{
          let val = parseFloat(e.target.textContent.replace(/[^\d.]/g,'')) || 0;
          const oldVal = parseFloat(e.target.dataset.base) || 1;
          e.target.dataset.base = val;
          e.target.textContent = val;
          placeCaretAtEnd(e.target); // курсор в конец

          // Перерасчет остальных
          tbody.querySelectorAll('tr').forEach(r=>{
            const cell = r.cells[2];
            if(cell && cell!==e.target){
              const cbase = parseFloat(cell.dataset.base) || 0;
              cell.textContent = Math.round(cbase * (val/oldVal));
            }
          });
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

      const tdDesc = document.createElement('td');
      if(i===0){
        tdDesc.textContent = dish.process?.[currentLang] || '';
        tdDesc.rowSpan = dish.ingredients.length;
      }
      if(i===0) tr.appendChild(tdDesc);

      tbody.appendChild(tr);
    });

    table.appendChild(thead);
    table.appendChild(tbody);
    card.appendChild(table);
    container.appendChild(card);
  });
}

// Инициализация кнопок
document.querySelectorAll('.section-btn').forEach(btn=>{
  btn.addEventListener('click', ()=>renderSection(btn.dataset.section));
});
document.querySelectorAll('.lang-switch button').forEach(btn=>{
  btn.addEventListener('click', ()=>switchLanguage(btn.textContent.toLowerCase()));
});