let currentLang = 'ru';

// Пути к JSON-файлам
const dataFiles = {
  breakfast: 'data/breakfast.json',
  soup: 'data/soup.json',
  salad: 'data/salad.json',
  main: 'data/main.json'
};

// Загрузка и создание таблицы
async function loadSection(section) {
  const panel = document.getElementById(section);

  // Закрыть все панели
  document.querySelectorAll('.section-panel').forEach(p => {
    if (p !== panel) {
      p.style.display = 'none';
      p.innerHTML = '';
    }
  });

  // Переключаем отображение текущей панели
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
    const sectionArray = await response.json();

    const table = document.createElement('table');
    table.className = 'dish-table';

    // Шапка таблицы
    const thead = document.createElement('thead');
    const headerRow = document.createElement('tr');
    ['№', currentLang === 'ru' ? 'Ингредиент' : 'Ingredient', currentLang === 'ru' ? 'Кол-во' : 'Amount', currentLang === 'ru' ? 'Описание' : 'Description', currentLang === 'ru' ? 'Фото' : 'Photo']
      .forEach(text => {
        const th = document.createElement('th');
        th.textContent = text;
        headerRow.appendChild(th);
      });
    thead.appendChild(headerRow);
    table.appendChild(thead);

    // Тело таблицы
    const tbody = document.createElement('tbody');

    sectionArray.forEach((dish, index) => {
      const numIngredients = dish.ingredients.length;

      dish.ingredients.forEach((ing, i) => {
        const tr = document.createElement('tr');

        // №
        const tdNum = document.createElement('td');
        tdNum.textContent = i + 1;
        tr.appendChild(tdNum);

        // Название ингредиента
        const tdName = document.createElement('td');
        tdName.textContent = ing[currentLang];
        tr.appendChild(tdName);

        // Кол-во
        const tdAmount = document.createElement('td');
        tdAmount.textContent = ing.amount || '';
        tr.appendChild(tdAmount);

        // Описание технологии (только на первой строке, объединяем)
        if (i === 0) {
          const tdDesc = document.createElement('td');
          tdDesc.textContent = dish.process[currentLang] || '';
          tdDesc.rowSpan = numIngredients;
          tdDesc.style.verticalAlign = 'top';
          tr.appendChild(tdDesc);
        }

        // Фото (только на первой строке, объединяем)
        if (i === 0) {
          const tdPhoto = document.createElement('td');
          tdPhoto.rowSpan = numIngredients;
          tdPhoto.style.verticalAlign = 'top';
          if (dish.photo) {
            const img = document.createElement('img');
            img.src = dish.photo;
            img.alt = dish.name[currentLang];
            img.className = 'dish-photo';
            tdPhoto.appendChild(img);
          }
          tr.appendChild(tdPhoto);
        }

        tbody.appendChild(tr);
      });
    });

    table.appendChild(tbody);
    panel.appendChild(table);

  } catch (err) {
    panel.innerHTML = `<p style="color:red">${err.message}</p>`;
    console.error(err);
  }
}

// Инициализация кнопок и переключателя языка
document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('current-date').textContent = new Date().toLocaleDateString();

  // Кнопки разделов
  document.querySelectorAll('.section-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const section = btn.dataset.section;
      loadSection(section);
    });
  });

  // Языковой переключатель
  document.querySelectorAll('.lang-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      currentLang = btn.dataset.lang;

      // Обновляем открытые панели
      document.querySelectorAll('.section-panel').forEach(panel => {
        if (panel.style.display === 'block') {
          const section = panel.id;
          panel.innerHTML = '';
          loadSection(section);
        }
      });
    });
  });
});