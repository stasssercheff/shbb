let currentLang = 'ru'; // текущий язык

const sections = [
  { id: "breakfast", file: "data/breakfast.json" },
  { id: "soup", file: "data/soup.json" },
  { id: "salad", file: "data/salad.json" },
  { id: "main", file: "data/main.json" }
];

// функция для создания таблицы из массива блюд
function createTable(dishes) {
  const table = document.createElement('table');
  table.className = 'dish-table';

  // шапка таблицы
  const thead = document.createElement('thead');
  const headerRow = document.createElement('tr');
  ['№', currentLang === 'ru' ? 'Ингредиент' : 'Ingredient',
   currentLang === 'ru' ? 'Кол-во' : 'Amount',
   currentLang === 'ru' ? 'Описание' : 'Description'].forEach(text => {
    const th = document.createElement('th');
    th.textContent = text;
    headerRow.appendChild(th);
  });
  thead.appendChild(headerRow);
  table.appendChild(thead);

  // тело таблицы
  const tbody = document.createElement('tbody');

  dishes.forEach((dish, dishIndex) => {
    // строка с названием блюда
    const dishRow = document.createElement('tr');
    const tdDish = document.createElement('td');
    tdDish.colSpan = 4;
    tdDish.style.fontWeight = '600';
    tdDish.textContent = dish.name[currentLang];
    dishRow.appendChild(tdDish);
    tbody.appendChild(dishRow);

    // строки ингредиентов
    dish.ingredients.forEach((ing, i) => {
      const tr = document.createElement('tr');
      const tdIndex = document.createElement('td');
      tdIndex.textContent = i + 1;
      const tdName = document.createElement('td');
      tdName.textContent = ing[currentLang];
      const tdAmount = document.createElement('td');
      tdAmount.textContent = ing.amount || '';
      const tdDesc = document.createElement('td');
      tdDesc.textContent = i === 0 ? dish.process[currentLang] : '';
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

// функция загрузки раздела через fetch
async function loadSection(sectionId, filePath) {
  const panel = document.getElementById(`${sectionId}-section`);

  // закрываем все панели
  document.querySelectorAll('.section-panel').forEach(p => {
    if (p !== panel) {
      p.style.display = 'none';
      p.innerHTML = '';
    }
  });

  // если уже открыта — закрываем
  if (panel.style.display === 'block') {
    panel.style.display = 'none';
    panel.innerHTML = '';
    return;
  }

  try {
    const response = await fetch(filePath);
    if (!response.ok) throw new Error('Ошибка сети при загрузке JSON');
    const data = await response.json();

    panel.innerHTML = '';
    panel.style.display = 'block';
    const tblContainer = document.createElement('div');
    tblContainer.className = 'table-container';
    tblContainer.appendChild(createTable(data));
    panel.appendChild(tblContainer);

  } catch (err) {
    panel.innerHTML = `<p style="color:red">Ошибка загрузки: ${err.message}</p>`;
    panel.style.display = 'block';
  }
}

// инициализация кнопок
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.section-btn').forEach(btn => {
    const sectionId = btn.dataset.section;
    const section = sections.find(s => s.id === sectionId);
    btn.addEventListener('click', () => loadSection(sectionId, section.file));
  });

  document.querySelectorAll('.lang-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      currentLang = btn.dataset.lang;
      // обновляем открытые панели
      document.querySelectorAll('.section-panel').forEach(panel => {
        if (panel.style.display === 'block') {
          const sectionId = panel.id.replace('-section', '');
          const section = sections.find(s => s.id === sectionId);
          loadSection(sectionId, section.file);
        }
      });
    });
  });

  // текущая дата
  document.getElementById('current-date').textContent = new Date().toLocaleDateString();
});