let currentLang = 'ru';

// Пути к JSON
const dataFiles = {
  Preps: 'data/preps.json',
  'Sous-Vide': 'data/sv.json'
};

document.addEventListener('DOMContentLoaded', () => {
  // Кнопки разделов
  document.querySelectorAll('.section-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const section = btn.dataset.section;
      const container = document.querySelector('.table-container');

      // Если уже открыта, закрываем
      if (container.dataset.active === section) {
        container.innerHTML = '';
        container.dataset.active = '';
        return;
      }

      fetch(dataFiles[section])
        .then(res => res.json())
        .then(data => {
          createTable(section, data);
          container.dataset.active = section;
        })
        .catch(err => console.error('Ошибка загрузки JSON:', err));
    });
  });

  // Кнопки языка
  document.querySelectorAll('.lang-btn').forEach(langBtn => {
    langBtn.addEventListener('click', () => {
      currentLang = langBtn.dataset.lang;
      const container = document.querySelector('.table-container');
      if (container.dataset.active) {
        // Перерисовываем текущий раздел
        fetch(dataFiles[container.dataset.active])
          .then(res => res.json())
          .then(data => createTable(container.dataset.active, data))
          .catch(err => console.error(err));
      }
    });
  });
});

function createTable(sectionName, sectionData) {
  const tableContainer = document.querySelector('.table-container');
  tableContainer.innerHTML = '';

  const table = document.createElement('table');
  table.className = 'dish-table';

  const thead = document.createElement('thead');
  const tbody = document.createElement('tbody');

  let headers;
  if (sectionName === 'Preps') {
    headers = ['№', 'Продукт / Ingredient', 'Шт/гр', 'Описание'];
  } else if (sectionName === 'Sous-Vide') {
    headers = ['№', 'Продукт / Ingredient', 'Шт/гр', 'Температура °C', 'Время (мин)', 'Описание'];
  }

  const headerRow = document.createElement('tr');
  headers.forEach((h, idx) => {
    const th = document.createElement('th');
    th.textContent = h;
    // ширина столбцов в %
    if (sectionName === 'Preps') {
      th.style.width = [10, 40, 20, 30][idx] + '%';
    } else if (sectionName === 'Sous-Vide') {
      th.style.width = [10, 30, 15, 15, 15, 15][idx] + '%';
    }
    // шрифт
    th.style.fontSize = ['14px','16px','15px','14px','15px','14px'][idx] || '14px';
    headerRow.appendChild(th);
  });
  thead.appendChild(headerRow);

  sectionData.forEach(dish => {
    // строка с названием блюда
    const dishRow = document.createElement('tr');
    const tdDish = document.createElement('td');
    tdDish.colSpan = headers.length;
    tdDish.style.fontWeight = '600';
    tdDish.textContent = dish.title || '';
    dishRow.appendChild(tdDish);
    tbody.appendChild(dishRow);

    const keyIngredient = dish.key;

    dish.ingredients.forEach((ing, i) => {
      const tr = document.createElement('tr');

      // №
      const tdNum = document.createElement('td');
      tdNum.textContent = i + 1;
      tdNum.style.fontSize = '14px';

      // Название
      const tdName = document.createElement('td');
      tdName.textContent = currentLang === 'ru' ? ing['Продукт'] : ing['Ingredient'];
      tdName.style.fontSize = '16px';

      // Кол-во
      const tdAmount = document.createElement('td');
      tdAmount.dataset.base = ing['Шт/гр'];
      tdAmount.style.fontSize = '15px';

      if (ing['Продукт'] === keyIngredient) {
        tdAmount.contentEditable = true;
        tdAmount.classList.add('highlight');
        tdAmount.style.backgroundColor = '#fff9c0'; // бледно-желтый
        tdAmount.textContent = ing['Шт/гр'];

        tdAmount.addEventListener('input', () => {
          let newVal = parseInt(tdAmount.textContent) || 0;
          let oldVal = parseInt(tdAmount.dataset.base) || 1;
          const factor = newVal / oldVal;

          tdAmount.closest('table').querySelectorAll('tbody tr').forEach(r => {
            const cell = r.cells[2];
            if (cell && cell !== tdAmount) {
              const base = parseInt(cell.dataset.base) || 0;
              cell.textContent = Math.round(base * factor);
            }
          });
          tdAmount.dataset.base = newVal;
        });
      } else {
        tdAmount.textContent = ing['Шт/гр'];
      }

      // Температура и Время (для Су-Вид)
      let tdTemp, tdTime;
      if (sectionName === 'Sous-Vide') {
        tdTemp = document.createElement('td');
        tdTemp.textContent = ing['Температура С / Temperature C'] || '';
        tdTemp.style.fontSize = '15px';

        tdTime = document.createElement('td');
        tdTime.textContent = ing['Время мин / Time'] || '';
        tdTime.style.fontSize = '15px';
      }

      // Описание
      const tdDesc = document.createElement('td');
      if (i === 0) {
        tdDesc.textContent = dish.process?.[currentLang] || '';
        tdDesc.rowSpan = dish.ingredients.length;
        tdDesc.className = 'description-cell';
        tdDesc.style.fontSize = '14px';
      }

      tr.appendChild(tdNum);
      tr.appendChild(tdName);
      tr.appendChild(tdAmount);
      if (sectionName === 'Sous-Vide') {
        tr.appendChild(tdTemp);
        tr.appendChild(tdTime);
      }
      if (i === 0) tr.appendChild(tdDesc);

      tbody.appendChild(tr);
    });
  });

  table.appendChild(thead);
  table.appendChild(tbody);
  tableContainer.appendChild(table);
}