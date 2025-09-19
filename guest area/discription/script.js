let currentLang = 'ru';

// Пути к JSON-файлам (пока только один)
const dataFiles = {
  descriptiondish: 'data/descriptiondish.json',
};

// Функция создания таблицы для раздела
function createTable(sectionArray) {
  if (!sectionArray) return document.createElement('div');

  const table = document.createElement('table');
  table.classList.add('dish-table');

  // Шапка таблицы
  const thead = document.createElement('thead');
  const headerRow = document.createElement('tr');
  [
    currentLang === 'ru' ? 'Ингредиенты' : 'Ingredients',
    currentLang === 'ru' ? 'Гр.' : 'Gr.',
    currentLang === 'ru' ? 'Описание' : 'Description',
    currentLang === 'ru' ? 'Фото' : 'Photo'
  ].forEach(text => {
    const th = document.createElement('th');
    th.textContent = text;
    headerRow.appendChild(th);
  });
  thead.appendChild(headerRow);
  table.appendChild(thead);

  // Тело таблицы
  const tbody = document.createElement('tbody');

  sectionArray.forEach(dish => {
    // Новая строка для названия блюда
    const trName = document.createElement('tr');
    const tdName = document.createElement('td');
    tdName.textContent = dish.name[currentLang];
    tdName.colSpan = 4; // объединяем все колонки
    tdName.style.fontWeight = '600';
    tdName.style.textAlign = 'left';
    trName.appendChild(tdName);
    tbody.appendChild(trName);

    // Строка с ингредиентами, количеством, описанием и фото
    const tr = document.createElement('tr');

    // Ингредиенты
    const tdIngr = document.createElement('td');
    const ul = document.createElement('ul');
    dish.ingredients.forEach(ing => {
      const li = document.createElement('li');
      li.textContent = ing[currentLang];
      ul.appendChild(li);
    });
    tdIngr.appendChild(ul);

    // Выход
    const tdAmount = document.createElement('td');
    tdAmount.textContent = dish.amount || '';

    // Описание
    const tdDesc = document.createElement('td');
    tdDesc.textContent = dish.process[currentLang] || '';

    // Фото
// Фото
const tdPhoto = document.createElement('td');
if (dish.photo) {
  const img = document.createElement('img');
  
  // Базовый путь к фото
  const basePath = 'kitchen/kitchen/ttk/dishes/photos/'; // путь к папке с фото
  img.src = basePath + dish.photo;  // dish.photo из JSON, например 'beef.png'
  
  img.alt = dish.name[currentLang];
  img.className = 'dish-photo';
  img.style.maxWidth = '120px';
  img.style.cursor = 'pointer';
  
  tdPhoto.appendChild(img);
}

    tr.appendChild(tdIngr);
    tr.appendChild(tdAmount);
    tr.appendChild(tdDesc);
    tr.appendChild(tdPhoto);

    tbody.appendChild(tr);
  });

  table.appendChild(tbody);
  return table;
}

// Создание модалки для фото
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

// Загрузка данных
async function loadSection(section) {
  const panel = document.getElementById(section);

  // Закрыть другие панели
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
    tblContainer.appendChild(createTable(sectionData));
    panel.appendChild(tblContainer);

    // Кликабельность фото
    const photoModal = createPhotoModal();
    tblContainer.querySelectorAll('img.dish-photo').forEach(img => {
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

// Инициализация
document.addEventListener('DOMContentLoaded', () => {
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
              tblContainer.appendChild(createTable(data));
              panel.appendChild(tblContainer);

              const photoModal = createPhotoModal();
              tblContainer.querySelectorAll('img.dish-photo').forEach(img => {
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
