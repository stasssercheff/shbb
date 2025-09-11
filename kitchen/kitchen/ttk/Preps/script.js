let currentLang = 'ru';

// Пути к JSON-файлам
const dataFiles = {
  breakfast: 'data/breakfast.json',
  soup: 'data/soup.json',
  salad: 'data/salad.json',
  main: 'data/main.json',
  preps: 'data/preps.json',
  sv: 'data/sv.json'
};

// Функция создания таблицы для раздела
function createTable(sectionArray) {
  if (!sectionArray) return document.createElement('div');

  const table = document.createElement('table');
  table.classList.add('dish-table');

  // Шапка таблицы
  const thead = document.createElement('thead');
  const headerRow = document.createElement('tr');
  const headers = [
    '№',
    currentLang === 'ru' ? 'Ингредиент' : 'Ingredient',
    currentLang === 'ru' ? 'Гр/Шт' : 'Amount',
    currentLang === 'ru' ? 'Описание' : 'Description',
    currentLang === 'ru' ? 'Фото' : 'Photo'
  ];
  headers.forEach(text => {
    const th = document.createElement('th');
    th.textContent = text;
    headerRow.appendChild(th);
  });
  thead.appendChild(headerRow);
  table.appendChild(thead);

  // Тело таблицы
  const tbody = document.createElement('tbody');

  sectionArray.forEach(dish => {
    // Название блюда
    const dishRow = document.createElement('tr');
    const tdDish = document.createElement('td');
    tdDish.colSpan = 5;
    tdDish.style.fontWeight = '600';
    tdDish.textContent = dish.name ? dish.name[currentLang] : (dish.title || '');
    dishRow.appendChild(tdDish);
    tbody.appendChild(dishRow);

    const descText = dish.process ? (dish.process[currentLang] || '') : '';
    const ingCount = dish.ingredients ? dish.ingredients.length : 0;

    dish.ingredients?.forEach((ing, i) => {
      const tr = document.createElement('tr');

      const tdNum = document.createElement('td');
      tdNum.textContent = i + 1;

      const tdName = document.createElement('td');
      tdName.textContent = ing[currentLang] || ing['Продукт'] || ing['Ingredient'] || '';

      const tdAmount = document.createElement('td');
      tdAmount.contentEditable = true; // редактируемое поле
      tdAmount.style.backgroundColor = '#fffacd'; // подсветка бледно-жёлтым
      tdAmount.textContent = ing.amount || ing['Шт/гр'] || '';

      const tdDesc = document.createElement('td');
      if (i === 0 && descText) {
        tdDesc.textContent = descText;
        tdDesc.rowSpan = ingCount;
      }

      const tdPhoto = document.createElement('td');
      if (i === 0 && dish.photo) {
        const img = document.createElement('img');
        img.src = dish.photo;
        img.alt = dish.name ? dish.name[currentLang] : '';
        img.className = 'dish-photo';
        tdPhoto.appendChild(img);
        tdPhoto.rowSpan = ingCount;
      }

      tr.appendChild(tdNum);
      tr.appendChild(tdName);
      tr.appendChild(tdAmount);
      if (i === 0 && descText) tr.appendChild(tdDesc);
      tr.appendChild(tdPhoto);

      tbody.appendChild(tr);
    });
  });

  table.appendChild(tbody);

  // === Логика перерасчета ===
  setupRecalculation(table);

  return table;
}

// --- Настройка перерасчёта по ключевым данным ---
function setupRecalculation(table) {
  const editableCells = table.querySelectorAll('td[contenteditable="true"]');

  editableCells.forEach(cell => {
    cell.addEventListener('input', () => {
      const row = cell.parentElement.parentElement;
      const rows = [...row.querySelectorAll('tr')];
      const factor = parseFloat(cell.textContent) / parseFloat(cell.dataset.original || cell.textContent);

      if (!isNaN(factor) && factor > 0) {
        editableCells.forEach(c => {
          if (c !== cell) {
            const base = parseFloat(c.dataset.original || c.textContent);
            if (!isNaN(base)) {
              c.textContent = (base * factor).toFixed(1);
            }
          }
        });
      }
    });

    if (!cell.dataset.original) {
      const baseVal = parseFloat(cell.textContent);
      if (!isNaN(baseVal)) {
        cell.dataset.original = baseVal;
      }
    }
  });
}

// --- Создание модалки для фото (один раз) ---
function createPhotoModal() {
  let photoModal = document.getElementById('photo-modal');
  if (!photoModal) {
    photoModal = document.createElement('div');
    photoModal.id = 'photo-modal';
    const modalImg = document.createElement('img');
    photoModal.appendChild(modalImg);
    document.body.appendChild(photoModal);

    Object.assign(photoModal.style, {
      display: 'none',
      position: 'fixed',
      top: '0',
      left: '0',
      width: '100%',
      height: '100%',
      background: 'rgba(0,0,0,0.8)',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: '9999',
      cursor: 'pointer',
    });

    // Закрытие по клику
    photoModal.addEventListener('click', () => {
      photoModal.style.display = 'none';
    });

    // Стили для фото внутри модалки
    modalImg.style.maxWidth = '90%';
    modalImg.style.maxHeight = '90%';
    modalImg.style.boxShadow = '0 0 20px rgba(0,0,0,0.5)';
  }
  return photoModal;
}

// Загрузка данных для раздела
async function loadSection(section) {
  const panel = document.getElementById(section);

  // Закрыть все панели кроме текущей
  document.querySelectorAll('.section-panel').forEach(p => {
    if (p !== panel) {
      p.style.display = 'none';
      p.innerHTML = '';
    }
  });

  if (panel.style.display === 'block') {
    panel.style.display = 'none';
    panel.innerHTML = '';
    return;
  }

  panel.style.display = 'block';
  panel.innerHTML = '';

  try {
    const response = await fetch(dataFiles[section]);
    if (!response.ok) throw new Error('Ошибка загрузки JSON: ' + section);
    const sectionData = await response.json();

    const tblContainer = document.createElement('div');
    tblContainer.className = 'table-container';
    tblContainer.appendChild(createTable(sectionData.recipes || sectionData));
    panel.appendChild(tblContainer);

    // --- Кликабельность фото ---
    const photoModal = createPhotoModal();
    tblContainer.querySelectorAll('.dish-photo').forEach(img => {
      img.style.cursor = 'pointer';
      img.addEventListener('click', () => {
        const modalImg = photoModal.querySelector('img');
        modalImg.src = img.src;
        modalImg.alt = img.alt;
        photoModal.style.display = 'flex';
      });
    });

  } catch (err) {
    panel.innerHTML = `<p style="color:red">${err.message}</p>`;
    console.error(err);
  }
}

// Инициализация кнопок и языкового переключателя
document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('current-date').textContent = new Date().toLocaleDateString();

  document.querySelectorAll('.section-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const section = btn.dataset.section;
      loadSection(section);
    });
  });

  document.querySelectorAll('.lang-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      currentLang = btn.dataset.lang;
      document.querySelectorAll('.section-panel').forEach(panel => {
        if (panel.style.display === 'block') {
          const section = panel.id;
          panel.innerHTML = '';
          const tblContainer = document.createElement('div');
          tblContainer.className = 'table-container';
          fetch(dataFiles[section])
            .then(res => res.json())
            .then(data => {
              tblContainer.appendChild(createTable(data.recipes || data));
              panel.appendChild(tblContainer);

              // --- Кликабельность фото после обновления языка ---
              const photoModal = createPhotoModal();
              tblContainer.querySelectorAll('.dish-photo').forEach(img => {
                img.style.cursor = 'pointer';
                img.addEventListener('click', () => {
                  const modalImg = photoModal.querySelector('img');
                  modalImg.src = img.src;
                  modalImg.alt = img.alt;
                  photoModal.style.display = 'flex';
                });
              });
            });
        }
      });
    });
  });
});