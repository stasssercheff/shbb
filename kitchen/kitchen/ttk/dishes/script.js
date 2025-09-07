let currentLang = 'ru';

// Вставь свои JSON данные сюда
const data = {
  breakfast: /* вставить JSON массив */,
  soup: /* вставить JSON массив */,
  salad: /* вставить JSON массив */,
  main: /* вставить JSON массив */
};

// Создание таблицы
function createTable(dishes) {
  const table = document.createElement('table');
  table.className = 'dish-table';
  table.style.width = '100%';
  table.style.fontSize = '12px';
  table.style.tableLayout = 'fixed'; // чтобы колонки подгонялись

  const thead = document.createElement('thead');
  const headerRow = document.createElement('tr');
  ['№', currentLang === 'ru' ? 'Ингредиент' : 'Ingredient',
   currentLang === 'ru' ? 'Кол-во' : 'Amount',
   currentLang === 'ru' ? 'Описание' : 'Description'].forEach(text => {
    const th = document.createElement('th');
    th.textContent = text;
    th.style.wordWrap = 'break-word';
    headerRow.appendChild(th);
  });
  thead.appendChild(headerRow);
  table.appendChild(thead);

  const tbody = document.createElement('tbody');

  dishes.forEach((dish) => {
    const dishRow = document.createElement('tr');
    const tdDish = document.createElement('td');
    tdDish.colSpan = 4;
    tdDish.style.fontWeight = '600';
    tdDish.style.wordWrap = 'break-word';
    tdDish.textContent = dish.name[currentLang];
    dishRow.appendChild(tdDish);
    tbody.appendChild(dishRow);

    dish.ingredients.forEach((ing, i) => {
      const tr = document.createElement('tr');
      const tdIndex = document.createElement('td');
      tdIndex.textContent = i + 1;
      const tdName = document.createElement('td');
      tdName.textContent = ing[currentLang];
      tdName.style.wordWrap = 'break-word';
      const tdAmount = document.createElement('td');
      tdAmount.textContent = ing.amount || '';
      const tdDesc = document.createElement('td');
      tdDesc.textContent = i === 0 ? dish.process[currentLang] : '';
      tdDesc.style.wordWrap = 'break-word';

      tr.appendChild(tdIndex);
      tr.appendChild(tdName);
      tr.appendChild(tdAmount);
      tr.appendChild(tdDesc);
      tbody.appendChild(tr);
    });
  });

  table.appendChild(tbody);
  return table;
}

// Кнопки разделов
document.querySelectorAll('.section-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const section = btn.dataset.section;
    const panel = document.getElementById(`${section}-section`);

    if (panel.style.display === 'block') {
      panel.style.display = 'none';
      panel.innerHTML = '';
    } else {
      // закрываем остальные
      document.querySelectorAll('.section-panel').forEach(p => {
        if (p !== panel) {
          p.style.display = 'none';
          p.innerHTML = '';
        }
      });

      panel.style.display = 'block';
      panel.innerHTML = '';
      panel.appendChild(createTable(data[section]));
    }
  });
});

// Переключение языка
document.querySelectorAll('.lang-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    currentLang = btn.dataset.lang;
    document.querySelectorAll('.section-panel').forEach(panel => {
      if (panel.style.display === 'block') {
        const section = panel.id.replace('-section', '');
        panel.innerHTML = '';
        panel.appendChild(createTable(data[section]));
      }
    });
  });
});

// Отображение текущей даты
document.getElementById('current-date').textContent = new Date().toLocaleDateString();