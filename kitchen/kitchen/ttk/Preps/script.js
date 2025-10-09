// ---- FIXED script.js (без дублирования перевода) ----
window.currentLang = window.currentLang || localStorage.getItem("lang") || 'ru';

// ==== Навигация ====
function goHome() {
  location.href = "https://stasssercheff.github.io/shbb/";
}

function goBack() {
  const currentPath = window.location.pathname;
  const parentPath = currentPath.substring(0, currentPath.lastIndexOf("/"));
  const upperPath = parentPath.substring(0, parentPath.lastIndexOf("/"));
  window.location.href = upperPath + "/index.html";
}

// ==== Пути к данным ====
const dataFiles = {
  'Preps': 'data/preps.json',
  'Sous-Vide': 'data/sv.json'
};

// ==== Загрузка JSON ====
function loadData(sectionName, callback) {
  const path = dataFiles[sectionName];
  if (!path) {
    console.error('Нет пути для секции:', sectionName);
    return;
  }
  fetch(path)
    .then(res => {
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return res.json();
    })
    .then(data => callback(data))
    .catch(err => console.error(`Ошибка загрузки ${sectionName}:`, err));
}

// ==== Отображение раздела ====
function renderSection(sectionName, toggle = true) {
  const container = document.querySelector('.table-container');
  if (!container) return;

  const btn = document.querySelector(`.section-btn[data-section="${sectionName}"]`);
  document.querySelectorAll('.section-btn').forEach(b => b.classList.remove('active'));

  if (toggle && container.dataset.active === sectionName) {
    container.innerHTML = '';
    container.dataset.active = '';
    return;
  }

  if (btn) btn.classList.add('active');
  container.dataset.active = sectionName;

  loadData(sectionName, data => {
    if (sectionName === 'Preps') createTable(data);
    else if (sectionName === 'Sous-Vide') renderSousVide(data);
  });
}

// ==== Таблица Preps ====
function createTable(data) {
  const container = document.querySelector('.table-container');
  container.innerHTML = '';

  if (!data?.recipes?.length) {
    container.textContent = 'Нет данных для отображения';
    return;
  }

  data.recipes.forEach(dish => {
    const card = document.createElement('div');
    card.className = 'dish-card';

    const title = document.createElement('div');
    title.className = 'dish-title';
    title.textContent = (currentLang === 'ru')
      ? (dish.name?.ru || dish.title)
      : (dish.name?.en || dish.title);
    card.appendChild(title);

    const table = document.createElement('table');
    table.className = 'pf-table';

    const thead = document.createElement('thead');
    const tbody = document.createElement('tbody');

    const headers = (currentLang === 'ru')
      ? ['#', 'Продукт', 'Гр/шт', 'Описание']
      : ['#', 'Ingredient', 'Gr/Pcs', 'Process'];

    const trHead = document.createElement('tr');
    headers.forEach(h => {
      const th = document.createElement('th');
      th.textContent = h;
      trHead.appendChild(th);
    });
    thead.appendChild(trHead);

    (dish.ingredients || []).forEach((ing, i) => {
      const tr = document.createElement('tr');

      const tdNum = document.createElement('td');
      tdNum.textContent = i + 1;

      const tdName = document.createElement('td');
      tdName.textContent = (currentLang === 'ru')
        ? (ing['Продукт'] || '')
        : (ing['Ingredient'] || '');

      const tdAmount = document.createElement('td');
      tdAmount.textContent = ing['Шт/гр'] || '';
      tdAmount.dataset.base = ing['Шт/гр'] || '0';

      if (dish.key && ing['Продукт'] === dish.key) {
        tdAmount.contentEditable = true;
        tdAmount.classList.add('key-ingredient');

        tdAmount.addEventListener('input', () => {
          const newVal = parseFloat(tdAmount.textContent.replace(/[^0-9.]/g, '')) || 0;
          const baseVal = parseFloat(tdAmount.dataset.base) || 1;
          const factor = newVal / baseVal;

          const rows = tdAmount.closest('table').querySelectorAll('tbody tr');
          rows.forEach(r => {
            const cell = r.cells[2];
            if (cell && cell !== tdAmount) {
              const base = parseFloat(cell.dataset.base) || 0;
              cell.textContent = Math.round(base * factor);
            }
          });
        });
      }

      tr.appendChild(tdNum);
      tr.appendChild(tdName);
      tr.appendChild(tdAmount);

      if (i === 0) {
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
    container.appendChild(card);
  });
}

// ==== Таблица Sous-Vide ====
function renderSousVide(data) {
  const container = document.querySelector('.table-container');
  container.innerHTML = '';

  if (!data?.recipes?.length) {
    container.textContent = 'Нет данных для отображения';
    return;
  }

  data.recipes.forEach(dish => {
    const card = document.createElement('div');
    card.className = 'dish-card';

    const title = document.createElement('div');
    title.className = 'dish-title';
    title.textContent = dish.title;
    card.appendChild(title);

    const table = document.createElement('table');
    table.className = 'sv-table';

    const thead = document.createElement('thead');
    const tbody = document.createElement('tbody');

    const headers = (currentLang === 'ru')
      ? ['#', 'Продукт', 'Гр/шт', 'Темп °C', 'Время', 'Описание']
      : ['#', 'Ingredient', 'Gr/Pcs', 'Temp °C', 'Time', 'Process'];

    const trHead = document.createElement('tr');
    headers.forEach(h => {
      const th = document.createElement('th');
      th.textContent = h;
      trHead.appendChild(th);
    });
    thead.appendChild(trHead);

    (dish.ingredients || []).forEach((ing, i) => {
      const tr = document.createElement('tr');

      const temp = ing['Температура С / Temperature C'] || '';
      const time = ing['Время мин / Time'] || '';

      let procText = '';
      if (Array.isArray(dish.process)) {
        const proc = dish.process.find(p => i + 1 >= p.range[0] && i + 1 <= p.range[1]);
        procText = proc ? (proc[currentLang] || '') : '';
      } else {
        procText = dish.process?.[currentLang] || '';
      }

      tr.innerHTML = `
        <td>${ing['№'] || (i + 1)}</td>
        <td>${(currentLang === 'ru') ? (ing['Продукт'] || '') : (ing['Ingredient'] || '')}</td>
        <td>${ing['Шт/гр'] || ''}</td>
        <td>${temp}</td>
        <td>${time}</td>
        <td>${procText}</td>
      `;

      tbody.appendChild(tr);
    });

    table.appendChild(thead);
    table.appendChild(tbody);
    card.appendChild(table);
    container.appendChild(card);
  });
}

// ==== Инициализация ====
document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll('.section-btn').forEach(btn => {
    btn.addEventListener('click', () => renderSection(btn.dataset.section));
  });

  // Языки теперь управляются через lang.js, поэтому здесь ничего не трогаем
});