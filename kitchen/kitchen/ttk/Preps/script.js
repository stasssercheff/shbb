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

// Переключение языка (не закрывает таблицу)
function switchLanguage(lang) {
  currentLang = lang;
  const activeSection = document.querySelector('.section-btn.active');
  if (activeSection) {
    renderSection(activeSection.dataset.section, false);
  }
}

// Отображение раздела
function renderSection(sectionName, toggle = true) {
  const container = document.querySelector('.table-container');
  const btn = document.querySelector(`.section-btn[data-section="${sectionName}"]`);

  document.querySelectorAll('.section-btn').forEach(b => b.classList.remove('active'));

  if (toggle && container.dataset.active === sectionName) {
    container.innerHTML = '';
    container.dataset.active = '';
    return;
  }

  btn.classList.add('active');
  container.dataset.active = sectionName;

  loadData(sectionName, data => {
    if (sectionName === 'Preps') {
      createPFTable(data);
    } else if (sectionName === 'Sous-Vide') {
      createSVTable(data);
    }
  });
}

// ==== ПФ (рабочий старый код, ничего не трогаем) ====
function createPFTable(data) {
  const tableContainer = document.querySelector('.table-container');
  tableContainer.innerHTML = '';

  data.recipes.forEach((dish) => {
    const card = document.createElement('div');
    card.className = 'dish-card';

    const title = document.createElement('div');
    title.className = 'dish-title';
    title.textContent = currentLang === 'ru' ? dish.name?.ru || dish.title : dish.name?.en || dish.title;
    card.appendChild(title);

    const table = document.createElement('table');
    table.className = 'pf-table';

    const thead = document.createElement('thead');
    const tbody = document.createElement('tbody');

    const headers = currentLang === 'ru'
      ? ['#', 'Продукт', 'Гр/шт', 'Описание']
      : ['#', 'Ingredient', 'Gr/Pcs', 'process'];

    const trHead = document.createElement('tr');
    headers.forEach(h => {
      const th = document.createElement('th');
      th.textContent = h;
      trHead.appendChild(th);
    });
    thead.appendChild(trHead);

    dish.ingredients.forEach((ing, i) => {
      const tr = document.createElement('tr');

      const tdNum = document.createElement('td');
      tdNum.textContent = i + 1;

      const tdName = document.createElement('td');
      tdName.textContent = currentLang === 'ru' ? ing['Продукт'] : ing['Ingredient'];

      const tdAmount = document.createElement('td');
      tdAmount.textContent = ing['Шт/гр'];
      tdAmount.dataset.base = ing['Шт/гр'];

      tr.appendChild(tdNum);
      tr.appendChild(tdName);
      tr.appendChild(tdAmount);

      // Описание
      const tdDesc = document.createElement('td');
      if (i === 0) {
        tdDesc.textContent = currentLang === 'ru'
          ? dish.ingredients.map(ing => ing['Описание']).filter(Boolean).join('\n')
          : dish.ingredients.map(ing => ing['process']).filter(Boolean).join('\n');
        tdDesc.rowSpan = dish.ingredients.length;
        tr.appendChild(tdDesc);
      }

      tbody.appendChild(tr);
    });

    table.appendChild(thead);
    table.appendChild(tbody);
    card.appendChild(table);
    tableContainer.appendChild(card);
  });
}

// ==== Сувид (отдельный блок, отображение всех нужных полей) ====
function createSVTable(data) {
  const tableContainer = document.querySelector('.table-container');
  tableContainer.innerHTML = '';

  data.recipes.forEach((dish) => {
    const card = document.createElement('div');
    card.className = 'dish-card';

    const title = document.createElement('div');
    title.className = 'dish-title';
    title.textContent = currentLang === 'ru' ? dish.title : dish.title; // Можно добавить name, если есть
    card.appendChild(title);

    const table = document.createElement('table');
    table.className = 'sv-table';

    const thead = document.createElement('thead');
    const tbody = document.createElement('tbody');

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

    dish.ingredients.forEach((ing, i) => {
      const tr = document.createElement('tr');

      const tdNum = document.createElement('td');
      tdNum.textContent = i + 1;

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

      // Процесс
      const tdProcess = document.createElement('td');
      if (ing.process?.[currentLang]) {
        tdProcess.textContent = ing.process[currentLang];
      } else if (i === 0 && dish.defaultProcess?.[currentLang]) {
        tdProcess.textContent = dish.defaultProcess[currentLang];
        tdProcess.rowSpan = dish.ingredients.length;
      }
      tr.appendChild(tdProcess);

      tbody.appendChild(tr);
    });

    table.appendChild(thead);
    table.appendChild(tbody);
    card.appendChild(table);
    tableContainer.appendChild(card);
  });
}

// Навигация
function goHome() { location.href = '/index.html'; }
function goBack() { history.back(); }

// Инициализация кнопок
document.querySelectorAll('.section-btn').forEach(btn => {
  btn.addEventListener('click', () => renderSection(btn.dataset.section));
});

document.querySelectorAll('.lang-switch button').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.lang-switch button').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    switchLanguage(btn.textContent.toLowerCase());
  });
});