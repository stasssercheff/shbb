let currentLang = 'ru';

const dataFiles = {
  Preps: 'data/preps.json',
  'Sous-Vide': 'data/sv.json'
};

// Переключение языка
function switchLanguage(lang) {
  currentLang = lang;
  document.querySelectorAll('.section-btn.active').forEach(btn=>{
    renderSection(btn.dataset.section);
  });
}

// Рендер раздела (таблицы) под кнопкой
function renderSection(sectionName) {
  const btn = document.querySelector(`.section-btn[data-section="${sectionName}"]`);
  const existingContainer = btn.nextElementSibling;

  // Если уже открыта — закрыть
  if(existingContainer && existingContainer.classList.contains('table-container') && existingContainer.dataset.section===sectionName){
    existingContainer.remove();
    btn.classList.remove('active');
    return;
  }

  // Деклассифицируем все кнопки
  document.querySelectorAll('.section-btn').forEach(b=>b.classList.remove('active'));
  document.querySelectorAll('.table-container').forEach(c=>c.remove());

  btn.classList.add('active');

  // Создаем новый контейнер
  const container = document.createElement('div');
  container.className = 'table-container';
  container.dataset.section = sectionName;
  btn.insertAdjacentElement('afterend', container);

  // Загружаем данные
  fetch(dataFiles[sectionName])
    .then(res=>res.json())
    .then(data=>createTable(data, container, sectionName));
}

// Создание таблицы
function createTable(data, container, sectionName){
  container.innerHTML = '';

  // Название карточки
  const title = document.createElement('div');
  title.className = 'table-title';
  title.textContent = data.title || sectionName;
  container.appendChild(title);

  // Таблица
  const table = document.createElement('table');
  table.className = 'dish-table ' + (sectionName==='Preps' ? 'pf-table' : 'sv-table');

  const thead = document.createElement('thead');
  const tbody = document.createElement('tbody');

  const headers = sectionName==='Preps' 
    ? ['№','Продукт / Ingredient','Шт/гр','Описание'] 
    : ['№','Продукт / Ingredient','Шт/гр','Темп °C','Время','Описание'];

  const headerRow = document.createElement('tr');
  headers.forEach(h=>{
    const th = document.createElement('th');
    th.textContent = h;
    headerRow.appendChild(th);
  });
  thead.appendChild(headerRow);

  data.recipes.forEach(dish=>{
    // Название блюда в отдельной строке
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
      tdName.textContent = currentLang==='ru' ? ing['Продукт'] : ing['Ingredient'];

      const tdAmount = document.createElement('td');
      tdAmount.textContent = ing['Шт/гр'];

      // Ключевой ингредиент: editable и перерасчет
      if(ing['Продукт'] === dish.key){
        tdAmount.contentEditable = true;
        tdAmount.classList.add('key-ingredient');
        tdAmount.dataset.base = ing['Шт/гр'];

        tdAmount.addEventListener('input', ()=>{
          let val = parseFloat(tdAmount.textContent.replace(/\D/g,'')) || 0;
          tdAmount.textContent = val; // фикс вставки цифр
          const factor = val / (parseFloat(tdAmount.dataset.base)||1);

          // Перерасчет только по tbody данной таблицы
          tbody.querySelectorAll('tr').forEach(r=>{
            const cell = r.cells[2];
            if(cell && cell!==tdAmount && !cell.isHeader){
              const base = parseFloat(cell.dataset.base) || parseFloat(cell.textContent)||0;
              cell.textContent = Math.round(base*factor);
            }
          });
          tdAmount.dataset.base = val;
        });
      }

      // Остальные столбцы для Су-Вид
      const extraCols = sectionName==='Sous-Vide'? ['Температура С / Temperature C','Время мин / Time'] : [];
      const tdExtras = extraCols.map(col=>{
        const td = document.createElement('td');
        td.textContent = ing[col] || '';
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
  container.appendChild(table);
}

// Инициализация кнопок разделов
document.querySelectorAll('.section-btn').forEach(btn=>{
  btn.addEventListener('click', ()=>renderSection(btn.dataset.section));
});