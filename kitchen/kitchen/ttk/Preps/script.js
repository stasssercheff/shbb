let currentLang = 'ru';

// Пути к JSON-файлам
const files = {
  Preps: 'data/preps.json',
  SousVide: 'data/sv.json'
};

// --- Загрузка данных по кнопке раздела ---
document.querySelectorAll('.section-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const section = btn.dataset.section;
    if (!files[section]) {
      console.error(`Нет JSON для раздела ${section}`);
      return;
    }

    fetch(files[section])
      .then(res => res.json())
      .then(data => {
        if (section === 'Preps') {
          createPrepsTable(data);
        } else if (section === 'SousVide') {
          createSousVideTable(data);
        }
      })
      .catch(err => console.error('Ошибка загрузки JSON:', err));
  });
});

// --- Переключение языка ---
document.querySelectorAll('.lang-btn').forEach(langBtn => {
  langBtn.addEventListener('click', () => {
    currentLang = langBtn.dataset.lang;
  });
});

// === Таблица ПФ с перерасчётом ===
function createPrepsTable(sectionArray) {
  const tableContainer = document.querySelector('.table-container');
  tableContainer.innerHTML = '';

  const table = document.createElement('table');
  table.className = 'dish-table';

  const thead = document.createElement('thead');
  const tbody = document.createElement('tbody');

  // Заголовок
  const headerRow = document.createElement('tr');
  ['№', 'Продукт / Ingredient', 'Шт/гр', 'Описание'].forEach(h => {
    const th = document.createElement('th');
    th.textContent = h;
    headerRow.appendChild(th);
  });
  thead.appendChild(headerRow);

  // Перебор блюд
  sectionArray.forEach(dish => {
    // строка-название
    const dishRow = document.createElement('tr');
    const tdDish = document.createElement('td');
    tdDish.colSpan = 4;
    tdDish.style.fontWeight = '600';
    tdDish.textContent = dish.title || '';
    dishRow.appendChild(tdDish);
    tbody.appendChild(dishRow);

    const keyIngredient = dish.key;

    dish.ingredients.forEach((ing, i) => {
      const tr = document.createElement('tr');

      const tdNum = document.createElement('td');
      tdNum.textContent = i + 1;

      const tdName = document.createElement('td');
      tdName.textContent =
        currentLang === 'ru' ? ing['Продукт'] : ing['Ingredient'];

      const tdAmount = document.createElement('td');
      tdAmount.dataset.base = ing['Шт/гр'];

      if (ing['Продукт'] === keyIngredient) {
        tdAmount.contentEditable = true;
        tdAmount.classList.add('highlight');
        tdAmount.textContent = ing['Шт/гр'];

        tdAmount.addEventListener('input', () => {
          const newVal = parseFloat(tdAmount.textContent) || 0;
          const oldVal = parseFloat(tdAmount.dataset.base) || 1;
          const factor = newVal / oldVal;

          const trs = tdAmount.closest('table').querySelectorAll('tbody tr');
          trs.forEach(r => {
            const cell = r.cells[2];
            if (cell && cell !== tdAmount) {
              const base = parseFloat(cell.dataset.base) || 0;
              if (base) cell.textContent = Math.round(base * factor);
            }
          });
          tdAmount.dataset.base = newVal;
        });
      } else {
        tdAmount.textContent = ing['Шт/гр'];
      }

      const tdDesc = document.createElement('td');
      if (i === 0) {
        tdDesc.textContent = dish.process?.[currentLang] || '';
        tdDesc.rowSpan = dish.ingredients.length;
        tdDesc.className = 'description-cell';
      }

      tr.appendChild(tdNum);
      tr.appendChild(tdName);
      tr.appendChild(tdAmount);
      if (i === 0) tr.appendChild(tdDesc);

      tbody.appendChild(tr);
    });
  });

  table.appendChild(thead);
  table.appendChild(tbody);
  tableContainer.appendChild(table);
}

// === Таблица Су-Вид ===
function createSousVideTable(data) {
  const tableContainer = document.querySelector('.table-container');
  tableContainer.innerHTML = '';

  let html = '<h2>Су-Вид / SOUS-VIDE</h2>';
  html += `<table class="dish-table">
    <thead>
      <tr>
        <th>№</th>
        <th>Продукт / Ingredient</th>
        <th>Шт/гр</th>
        <th>Температура °C</th>
        <th>Время (мин)</th>
        <th>Описание</th>
      </tr>
    </thead>
    <tbody>`;

  data.recipes.forEach(recipe => {
    recipe.ingredients.forEach(ing => {
      html += `<tr>
        <td>${ing['№'] || ''}</td>
        <td>${ing['Продукт'] || ''}<br><em>${ing['Ingredient'] || ''}</em></td>
        <td>${ing['Шт/гр'] || ''}</td>
        <td>${ing['Температура С / Temperature C'] || ''}</td>
        <td>${ing['Время мин / Time'] || ''}</td>
        <td>${ing['Описание'] || ''}</td>
      </tr>`;
    });
  });

  html += '</tbody></table>';
  tableContainer.innerHTML = html;
}