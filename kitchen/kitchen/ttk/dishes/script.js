// tbody
const tbody = document.createElement('tbody');

sectionArray.forEach(dish => {
  const ingredients = Array.isArray(dish.ingredients) ? dish.ingredients : [];
  const rowspan = ingredients.length || 1;

  // название блюда
  const rowTitle = document.createElement('tr');
  const tdTitle = document.createElement('td');
  tdTitle.colSpan = 5;
  tdTitle.style.fontWeight = '600';
  tdTitle.textContent = dish.name?.ru || 'Без названия';
  rowTitle.appendChild(tdTitle);
  tbody.appendChild(rowTitle);

  if (ingredients.length === 0) {
    const tr = document.createElement('tr');
    tr.innerHTML = `<td>—</td><td>-</td><td>-</td><td>${dish.process?.ru || ''}</td><td>-</td>`;
    tbody.appendChild(tr);
  } else {
    ingredients.forEach((ing, i) => {
      const tr = document.createElement('tr');

      const tdNum = document.createElement('td');
      tdNum.textContent = String(i + 1);
      tdNum.style.textAlign = 'center';
      tr.appendChild(tdNum);

      const tdName = document.createElement('td');
      tdName.textContent = ing.ru || '';
      tr.appendChild(tdName);

      const tdAmt = document.createElement('td');
      tdAmt.textContent = ing.amount || '';
      tdAmt.style.textAlign = 'center';
      tr.appendChild(tdAmt);

      // Технология — объединяем на все строки ингредиентов
      if (i === 0) {
        const tdProc = document.createElement('td');
        tdProc.textContent = dish.process?.ru || '';
        tdProc.rowSpan = rowspan;
        tdProc.style.verticalAlign = 'top';
        tr.appendChild(tdProc);

        const tdPhoto = document.createElement('td');
        tdPhoto.rowSpan = rowspan;
        tdPhoto.style.verticalAlign = 'top';
        if (dish.photo) {
          const img = document.createElement('img');
          img.src = dish.photo;
          img.alt = dish.name?.ru || '';
          img.style.maxWidth = '70px';
          img.style.height = 'auto';
          img.style.cursor = 'pointer';
          img.addEventListener('click', () => openPhotoModal(dish.photo));
          tdPhoto.appendChild(img);
        } else {
          tdPhoto.textContent = '-';
        }
        tr.appendChild(tdPhoto);
      }

      tbody.appendChild(tr);
    });
  }
});