let currentLang = 'ru';

const dataFiles = {
  preps: 'data/preps.json',
  sv: 'data/sv.json'
};

let recipesCache = [];

// --- Утилита ---
function toNumber(v) {
  const n = parseFloat(String(v).replace(',', '.'));
  return Number.isFinite(n) ? n : 0;
}

// --- Рендер рецептов ---
function renderRecipes(recipes) {
  const container = document.getElementById('content');
  container.innerHTML = '';
  recipesCache = JSON.parse(JSON.stringify(recipes));

  recipes.forEach((recipe, rIdx) => {
    const table = document.createElement('table');
    table.className = 'recipe-table';

    const thead = document.createElement('thead');
    const rowHead = document.createElement('tr');
    ['№', currentLang === 'ru' ? 'Продукт' : 'Product', 
     currentLang === 'ru' ? 'Ingredient' : 'Ingredient', 
     currentLang === 'ru' ? 'Шт/гр' : 'Amount', 
     currentLang === 'ru' ? 'Описание' : 'Description']
      .forEach(t => {
        const th = document.createElement('th');
        th.textContent = t;
        rowHead.appendChild(th);
      });
    thead.appendChild(rowHead);
    table.appendChild(thead);

    const tbody = document.createElement('tbody');

    // Название рецепта
    const trTitle = document.createElement('tr');
    const tdTitle = document.createElement('td');
    tdTitle.colSpan = 5;
    tdTitle.style.fontWeight = '700';
    tdTitle.style.textAlign = 'center';
    tdTitle.textContent = recipe.title || '';
    trTitle.appendChild(tdTitle);
    tbody.appendChild(trTitle);

    const keyName = recipe.key?.trim() || '';

    recipe.ingredients.forEach((ing, i) => {
      const tr = document.createElement('tr');

      // №
      const tdNum = document.createElement('td');
      tdNum.textContent = ing['№'] || i + 1;
      tr.appendChild(tdNum);

      // Продукт
      const tdProd = document.createElement('td');
      tdProd.textContent = ing['Продукт'] || '';
      tr.appendChild(tdProd);

      // Ingredient
      const tdIng = document.createElement('td');
      tdIng.textContent = ing['Ingredient'] || '';
      tr.appendChild(tdIng);

      // Кол-во
      const tdAmount = document.createElement('td');
      let base = toNumber(ing['Шт/гр']);
      if (String(ing['Продукт']).trim() === keyName) {
        const input = document.createElement('input');
        input.type = 'number';
        input.value = Math.round(base);
        input.className = 'key-input';
        tdAmount.classList.add('highlight');

        input.addEventListener('input', e => {
          const newVal = toNumber(e.target.value);
          if (newVal > 0) doRecalc(recipe, keyName, newVal, table);
        });

        tdAmount.appendChild(input);
      } else {
        tdAmount.textContent = Math.round(base);
        tdAmount.classList.add('amount');
        tdAmount.dataset.product = ing['Продукт'];
      }
      tr.appendChild(tdAmount);

      // Описание
      const tdDesc = document.createElement('td');
      tdDesc.textContent = ing['Описание'] || '';
      tr.appendChild(tdDesc);

      tbody.appendChild(tr);
    });

    table.appendChild(tbody);
    container.appendChild(table);
  });
}

// --- Перерасчёт ---
function doRecalc(recipe, keyName, newVal, table) {
  const keyIng = recipe.ingredients.find(ing => String(ing['Продукт']).trim() === keyName);
  const oldVal = toNumber(keyIng['Шт/гр']);
  if (!oldVal) return;

  const ratio = newVal / oldVal;

  recipe.ingredients.forEach(ing => {
    ing['Шт/гр'] = Math.round(toNumber(ing['Шт/гр']) * ratio);
  });

  // Перерисовать таблицу
  renderRecipes(recipesCache);
}

// --- Загрузка ---
async function loadSection(section) {
  const container = document.getElementById('content');
  container.innerHTML = '<p>Загрузка...</p>';

  try {
    const res = await fetch(dataFiles[section]);
    const data = await res.json();
    renderRecipes(data.recipes || []);
  } catch (e) {
    container.innerHTML = `<p style="color:red">Ошибка загрузки: ${e.message}</p>`;
  }
}

// --- Инициализация ---
document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('current-date').textContent = new Date().toLocaleDateString();

  document.getElementById('btn-preps').addEventListener('click', () => loadSection('preps'));
  document.getElementById('btn-sv').addEventListener('click', () => loadSection('sv'));

  document.querySelectorAll('.lang-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      currentLang = btn.dataset.lang;
      renderRecipes(recipesCache);
    });
  });

  loadSection('preps'); // по умолчанию
});