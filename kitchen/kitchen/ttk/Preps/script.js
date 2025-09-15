let currentLang = 'ru';

const dataFiles = {
  Preps: 'data/preps.json',
  'Sous-Vide': 'data/sv.json'
};

// Храним загруженные данные, чтобы не перезапрашивать JSON при смене языка
const loadedData = {};

// === Загрузка данных ===
function loadData(sectionName, callback) {
  if (loadedData[sectionName]) {
    callback(loadedData[sectionName]);
    return;
  }
  fetch(dataFiles[sectionName])
    .then(res => res.json())
    .then(data => {
      loadedData[sectionName] = data;
      callback(data);
    })
    .catch(err => console.error(err));
}

// === Переключение языка ===
function switchLanguage(lang) {
  currentLang = lang;

  // Меняем только текст в открытой таблице
  const container = document.querySelector('.table-container');
  const activeSection = container.dataset.active;
  if (activeSection) {
    renderSection(activeSection, false); // false = не закрывать таблицу
  }
}

// === Отображение/скрытие раздела ===
function renderSection(sectionName, closeIfActive = true) {
  const container = document.querySelector('.table-container');
  const btn = document.querySelector(`.section-btn[data-section="${sectionName}"]`);

  document.querySelectorAll('.section-btn').forEach(b => b.classList.remove('active'));

  if (closeIfActive && container.dataset.active === sectionName) {
    container.innerHTML = '';
    container.dataset.active = '';
    return;
  }

  btn.classList.add('active');
  container.dataset.active = sectionName;

  loadData(sectionName, data => createTable(data, sectionName));
}

// === Создание таблицы ===
function createTable(data, sectionName) {
  const container = document.querySelector('.table-container');
  container.innerHTML = '';

  data.recipes.forEach((dish, dishIndex) => {
    const card = document.createElement('div');
    card.className = 'dish-card';

    // Заголовок карточки с названием и языковым переключателем
    const cardHeader = document.createElement('div');
    cardHeader.className = 'dish-header';

    const title = document.createElement('h2');
    title.textContent = dish.name?.[currentLang] || dish.title || '';
    title.className = 'dish-title';
    cardHeader.appendChild(title);

    card.appendChild(cardHeader);

    // Таблица
    const table = document.createElement('table');
    table.className = 'dish-table ' + (sectionName === 'Preps' ? 'pf-table' : 'sv-table');

    // Заголовки
    const thead = document.createElement('thead');
    const headerRow = document.createElement('tr');

    let headers;
    if (sectionName === 'Preps') {
      headers = currentLang === 'ru'
        ? ['#', 'Продукт', 'Гр/Шт', 'Описание']
        : ['#', 'Ingredient', 'Gr/Pcs', 'Description'];
    } else { // Sous-Vide
      headers = currentLang === 'ru'
        ? ['#', 'Продукт', 'Гр/Шт', 'Темп °C', 'Время', 'Описание']
        : ['#', 'Ingredient', 'Gr/Pcs', 'Temp °C', 'Time', 'Description'];
    }

    headers.forEach(h => {
      const th = document.createElement('th');
      th.textContent = h;
      headerRow.appendChild(th);
    });
    thead.appendChild(headerRow);
    table.appendChild(thead);

    const tbody = document.createElement('tbody');

    dish.ingredients.forEach((ing, i) => {
      const tr = document.createElement('tr');

      const tdNum = document.createElement('td');
      tdNum.textContent = i + 1;

      const tdName = document.createElement('td');
      tdName.textContent = currentLang === 'ru' ? ing['Продукт'] : ing['Ingredient'];

      const tdAmount = document.createElement('td');
      tdAmount.textContent = ing['Шт/гр'];
      tdAmount.dataset.base = ing['Шт/гр'];

      // Перерасчет ключевого ингредиента
      if (ing['Продукт'] === dish.key) {
        tdAmount.contentEditable = true;
        tdAmount.classList.add('key-ingredient');

        tdAmount.addEventListener('input', e => {
          let newVal = parseFloat(tdAmount.textContent.replace(/[^\d.]/g, ''));
          if (!newVal) newVal = 0;

          const oldVal = parseFloat(tdAmount.dataset.base) || 1;
          const factor = newVal / oldVal;

          const trs = tdAmount.closest('table').querySelectorAll('tbody tr');
          trs.forEach(r => {
            const cell = r.cells[2];
            if (cell && cell !== tdAmount) {
              const base = parseFloat(cell.dataset.base) || 0;
              cell.textContent = Math.round(base * factor);
            }
          });

          tdAmount.dataset.base = newVal;
          tdAmount.textContent = newVal;
          // Ставим курсор в конец
          placeCaretAtEnd(tdAmount);
        });

        // Предотвращение странного поведения курсора
        tdAmount.addEventListener('keydown', e => {
          if (e.key === 'Enter') e.preventDefault();
        });
      }

      tr.appendChild(tdNum);
      tr.appendChild(tdName);
      tr.appendChild(tdAmount);

      if (sectionName === 'Sous-Vide') {
        const tdTemp = document.createElement('td');
        tdTemp.textContent = ing['Температура С / Temperature C'] || '';
        const tdTime = document.createElement('td');
        tdTime.textContent = ing['Время мин / Time'] || '';
        tr.appendChild(tdTemp);
        tr.appendChild(tdTime);
      }

      // Описание
      if (i === 0) {
        const tdDesc = document.createElement('td');
        tdDesc.textContent = dish.process?.[currentLang] || '';
        tdDesc.rowSpan = dish.ingredients.length;
        tr.appendChild(tdDesc);
      }

      tbody.appendChild(tr);
    });

    table.appendChild(tbody);
    card.appendChild(table);
    container.appendChild(card);
  });
}

// === Функция установки курсора в конец ячейки ===
function placeCaretAtEnd(el) {
  const range = document.createRange();
  const sel = window.getSelection();
  range.selectNodeContents(el);
  range.collapse(false);
  sel.removeAllRanges();
  sel.addRange(range);
  el.focus();
}

// === Инициализация кнопок ===
document.querySelectorAll('.section-btn').forEach(btn => {
  btn.addEventListener('click', () => renderSection(btn.dataset.section));
});
document.querySelectorAll('.lang-switch button').forEach(btn => {
  btn.addEventListener('click', () => switchLanguage(btn.textContent.toLowerCase()));
});