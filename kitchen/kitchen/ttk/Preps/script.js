let currentLang = localStorage.getItem('lang') || 'ru';
const dataFile = 'data/preps.json'; // <-- путь к JSON

// --- Создание карточки блюда ---
function createCard(dish) {
  const card = document.createElement('div');
  card.className = 'dish-card';

  // Название
  const title = document.createElement('h3');
  title.textContent = dish.name[currentLang];
  card.appendChild(title);

  // Таблица ингредиентов
  const ingTable = document.createElement('table');
  ingTable.className = 'dish-table';

  // Шапка таблицы
  const thead = document.createElement('thead');
  const headerRow = document.createElement('tr');
  ['№', currentLang === 'ru' ? 'Ингредиент' : 'Ingredient', currentLang === 'ru' ? 'Гр/Шт' : 'Amount', currentLang === 'ru' ? 'Описание' : 'Description', currentLang === 'ru' ? 'Фото' : 'Photo']
    .forEach(text => {
      const th = document.createElement('th');
      th.textContent = text;
      headerRow.appendChild(th);
    });
  thead.appendChild(headerRow);
  ingTable.appendChild(thead);

  // Тело таблицы
  const tbody = document.createElement('tbody');
  const ingCount = dish.ingredients.length;
  const descText = dish.process[currentLang] || '';

  dish.ingredients.forEach((ing, i) => {
    const tr = document.createElement('tr');

    const tdNum = document.createElement('td');
    tdNum.textContent = i + 1;

    const tdName = document.createElement('td');
    tdName.textContent = ing[currentLang];

    const tdAmount = document.createElement('td');
    tdAmount.textContent = ing.amount || '';

    const tdDesc = document.createElement('td');
    if (i === 0) {
      tdDesc.textContent = descText;
      tdDesc.rowSpan = ingCount;
      tdDesc.className = 'description-cell';
    }

    const tdPhoto = document.createElement('td');
    if (i === 0 && dish.photo) {
      const img = document.createElement('img');
      img.src = dish.photo;
      img.alt = dish.name[currentLang];
      img.className = 'dish-photo-img';
      tdPhoto.appendChild(img);
      tdPhoto.rowSpan = ingCount;

      // Кликабельное фото
      img.addEventListener('click', () => {
        const photoModal = document.getElementById('photo-modal');
        const modalImg = photoModal.querySelector('img');
        modalImg.src = img.src;
        modalImg.alt = img.alt;
        photoModal.style.display = 'flex';
      });
    }

    tr.appendChild(tdNum);
    tr.appendChild(tdName);
    tr.appendChild(tdAmount);
    if (i === 0) tr.appendChild(tdDesc);
    tr.appendChild(tdPhoto);

    tbody.appendChild(tr);
  });

  ingTable.appendChild(tbody);
  card.appendChild(ingTable);

  return card;
}

// --- Загрузка данных и отрисовка ---
async function loadAllPreps() {
  const container = document.querySelector('.sections-container');
  container.innerHTML = ''; // очистка

  try {
    const response = await fetch(dataFile);
    if (!response.ok) throw new Error('Ошибка загрузки JSON');
    const data = await response.json();

    data.forEach(dish => {
      const card = createCard(dish);
      container.appendChild(card);
    });

  } catch (err) {
    console.error(err);
    const errorDiv = document.createElement('div');
    errorDiv.style.color = 'red';
    errorDiv.textContent = err.message;
    container.appendChild(errorDiv);
  }
}

// --- Модалка для фото ---
function createPhotoModal() {
  let modal = document.getElementById('photo-modal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'photo-modal';
    const img = document.createElement('img');
    modal.appendChild(img);
    document.body.appendChild(modal);

    modal.addEventListener('click', () => {
      modal.style.display = 'none';
    });
  }
}

// --- Инициализация ---
document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('current-date').textContent = new Date().toLocaleDateString();

  createPhotoModal();
  loadAllPreps();

  // Смена языка
  document.querySelectorAll('.lang-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      currentLang = btn.dataset.lang;
      localStorage.setItem('lang', currentLang);
      loadAllPreps();
    });
  });
});