let currentLang = 'ru';

// Пути к JSON
const dataFiles = {
  preps: 'data/preps.json',
  sv: 'data/sv.json'
};

// Загрузка JSON и рендер таблицы
function loadSection(section) {
  fetch(dataFiles[section])
    .then(res => res.json())
    .then(data => renderRecipes(data, section));
}

function renderRecipes(data, section) {
  const container = document.getElementById('content');
  container.innerHTML = '';

  data.recipes.forEach(recipe => {
    // Заголовок
    const title = document.createElement('h2');
    title.textContent = recipe.title;
    container.appendChild(title);

    // Таблица
    const table = document.createElement('table');
    table.classList.add('recipe-table');

    const headerRow = document.createElement('tr');
    ['№', 'Продукт', 'Ingredient', 'Шт/гр', 'Описание'].forEach(h => {
      const th = document.createElement('th');
      th.textContent = h;
      headerRow.appendChild(th);
    });
    table.appendChild(headerRow);

    // Найдём ключевой ингредиент
    const keyName = recipe.key;

    recipe.ingredients.forEach((ing, idx) => {
      const row = document.createElement('tr');

      // №
      const tdNum = document.createElement('td');
      tdNum.textContent = ing['№'];
      row.appendChild(tdNum);

      // Продукт
      const tdRu = document.createElement('td');
      tdRu.textContent = ing['Продукт'];
      row.appendChild(tdRu);

      // Ingredient
      const tdEn = document.createElement('td');
      tdEn.textContent = ing['Ingredient'];
      row.appendChild(tdEn);

      // Шт/гр (пересчёт)
      const tdAmount = document.createElement('td');

      if (ing['Продукт'] === keyName) {
        // Ключевой → input
        const input = document.createElement('input');
        input.type = 'number';
        input.value = ing['Шт/гр'];
        input.dataset.index = idx;
        input.classList.add('key-input');
        input.addEventListener('input', e => recalc(recipe, idx, e.target.value, table));
        tdAmount.appendChild(input);
        row.classList.add('highlight');
      } else {
        tdAmount.textContent = ing['Шт/гр'];
      }

      row.appendChild(tdAmount);

      // Описание
      const tdDesc = document.createElement('td');
      tdDesc.textContent = ing['Описание'];
      row.appendChild(tdDesc);

      table.appendChild(row);
    });

    container.appendChild(table);
  });
}

// Перерасчёт
function recalc(recipe, keyIdx, newValue, table) {
  const keyIng = recipe.ingredients[keyIdx];
  const oldVal = parseFloat(keyIng['Шт/гр']);
  const newVal = parseFloat(newValue);

  if (isNaN(newVal) || newVal <= 0) return;

  const ratio = newVal / oldVal;

  // Обновляем данные
  recipe.ingredients.forEach((ing, idx) => {
    if (idx === keyIdx) {
      ing['Шт/гр'] = Math.round(newVal);
    } else {
      ing['Шт/гр'] = Math.round(parseFloat(ing['Шт/гр']) * ratio);
    }
  });

  // Перерисовка таблицы
  const section = table.parentElement;
  section.innerHTML = '';
  renderRecipes({ recipes: [recipe] });
}

// Переключение языка
document.querySelectorAll('.lang-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    currentLang = btn.dataset.lang;
    // при необходимости можешь допилить перевод статичных заголовков
  });
});

// Кнопки разделов
document.getElementById('btn-preps').addEventListener('click', () => loadSection('preps'));
document.getElementById('btn-sv').addEventListener('click', () => loadSection('sv'));

// Загружаем ПФы по умолчанию
loadSection('preps');