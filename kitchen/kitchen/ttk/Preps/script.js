// Создание таблицы для Sous-Vide
function createSousVideTable(dish) {
  const tableContainer = document.querySelector('.table-container');
  tableContainer.innerHTML = '';

  const card = document.createElement('div');
  card.className = 'dish-card';

  // Название карточки
  const title = document.createElement('div');
  title.className = 'dish-title';
  title.textContent = currentLang === 'ru' ? dish.title : dish.title; // Можно добавить name?.en если есть
  card.appendChild(title);

  const table = document.createElement('table');
  table.className = 'sv-table';

  const thead = document.createElement('thead');
  const tbody = document.createElement('tbody');

  // Заголовки
  const headers = currentLang === 'ru'
    ? ['#', 'Продукт', 'Гр/шт', 'Темп °C', 'Время', 'Описание']
    : ['#', 'Ingredient', 'Gr/Pcs', 'Temp C', 'Time', 'process'];

  const trHead = document.createElement('tr');
  headers.forEach(h => {
    const th = document.createElement('th');
    th.textContent = h;
    trHead.appendChild(th);
  });
  thead.appendChild(trHead);

  // Строки ингредиентов
  dish.ingredients.forEach((ing, i) => {
    const tr = document.createElement('tr');

    const tdNum = document.createElement('td');
    tdNum.textContent = ing['№'];
    const tdName = document.createElement('td');
    tdName.textContent = currentLang === 'ru' ? ing['Продукт'] : ing['Ingredient'];
    const tdAmount = document.createElement('td');
    tdAmount.textContent = ing['Шт/гр'];
    const tdTemp = document.createElement('td');
    tdTemp.textContent = ing['Температура С / Temperature C'] || '';
    const tdTime = document.createElement('td');
    tdTime.textContent = ing['Время мин / Time'] || '';

    tr.appendChild(tdNum);
    tr.appendChild(tdName);
    tr.appendChild(tdAmount);
    tr.appendChild(tdTemp);
    tr.appendChild(tdTime);

    tbody.appendChild(tr);
  });

  // Добавляем процесс с объединением вручную
  if (dish.processRanges && dish.processRanges.length) {
    dish.processRanges.forEach(p => {
      const rows = tbody.querySelectorAll('tr');
      const start = p.range[0] - 1;
      const end = p.range[1] - 1;
      if (rows.length > start) {
        const tdDesc = document.createElement('td');
        tdDesc.textContent = p[currentLang] || '';
        tdDesc.rowSpan = end - start + 1;
        rows[start].appendChild(tdDesc);
      }
    });
  }

  table.appendChild(thead);
  table.appendChild(tbody);
  card.appendChild(table);
  tableContainer.appendChild(card);
}