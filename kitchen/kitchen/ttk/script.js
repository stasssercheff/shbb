// ==== Данные блюд ====
const menuData = [
  {
    "раздел": {"ru":"Супы","en":"Soups"},
    "блюда":[
      {
        "название":{"ru":"Борщ","en":"Borscht"},
        "image":"borscht.jpg",
        "порции":1,
        "ингредиенты":[
          {"название":{"ru":"Свекла","en":"Beet"},"кол-во":200,"ед":"г"},
          {"название":{"ru":"Картофель","en":"Potatoes"},"кол-во":300,"ед":"г"},
          {"название":{"ru":"Морковь","en":"Carrot"},"кол-во":100,"ед":"г"}
        ]
      }
    ]
  },
  {
    "раздел": {"ru":"Салаты","en":"Salads"},
    "блюда":[
      {
        "название":{"ru":"Цезарь","en":"Caesar Salad"},
        "image":"caesar.jpg",
        "порции":1,
        "ингредиенты":[
          {"название":{"ru":"Курица","en":"Chicken"},"кол-во":200,"ед":"г"},
          {"название":{"ru":"Салат","en":"Lettuce"},"кол-во":100,"ед":"г"},
          {"название":{"ru":"Сыр Пармезан","en":"Parmesan"},"кол-во":50,"ед":"г"}
        ]
      }
    ]
  }
];

// ==== Переменные ====
let currentLang = 'ru';
const menuContainer = document.getElementById('menu-container');
const ttkCard = document.getElementById('ttk-card');
const ttkTitle = document.getElementById('ttk-title');
const ttkImage = document.getElementById('ttk-image');
const portionInput = document.getElementById('portion-input');
const ttkTbody = ttkCard.querySelector('tbody');
const backBtn = document.getElementById('back-btn');
const langSelect = document.getElementById('lang-select');

let currentDish = null;
let baseQuantities = [];

// ==== Функции ====
function renderMenu() {
  menuContainer.innerHTML = '';
  menuData.forEach(section => {
    const sectionTitle = document.createElement('div');
    sectionTitle.className = 'section-title';
    sectionTitle.textContent = section.раздел[currentLang];
    menuContainer.appendChild(sectionTitle);
    
    section.блюда.forEach(dish => {
      const dishDiv = document.createElement('div');
      dishDiv.className = 'dish-name';
      dishDiv.textContent = dish.название[currentLang];
      dishDiv.addEventListener('click', () => showDish(dish));
      menuContainer.appendChild(dishDiv);
    });
  });
}

function showDish(dish) {
  currentDish = dish;
  ttkTitle.textContent = dish.название[currentLang];
  ttkImage.src = dish.image;
  portionInput.value = dish.порции;
  baseQuantities = dish.ингредиенты.map(i => i.кол-во);
  renderTTKTable(1);
  menuContainer.style.display = 'none';
  ttkCard.style.display = 'block';
}

function renderTTKTable(multiplier=1) {
  ttkTbody.innerHTML = '';
  currentDish.ингредиенты.forEach((ing, idx) => {
    const tr = document.createElement('tr');
    tr.innerHTML = `<td>${ing.название[currentLang]}</td>
                    <td contenteditable="true" style="background:#fffae6">${(baseQuantities[idx]*multiplier).toFixed(0)}</td>
                    <td>${ing.ед}</td>`;
    ttkTbody.appendChild(tr);
    tr.children[1].addEventListener('input', (e)=>{
      const newVal = parseFloat(e.target.textContent);
      if(!isNaN(newVal)) renderTTKTable(newVal/baseQuantities[idx]);
    });
  });
}

// ==== События ====
portionInput.addEventListener('input', ()=>{
  const p = parseFloat(portionInput.value);
  if(!isNaN(p)) renderTTKTable(p);
});

backBtn.addEventListener('click', ()=>{
  ttkCard.style.display = 'none';
  menuContainer.style.display = 'block';
});

langSelect.addEventListener('change', ()=>{
  currentLang = langSelect.value;
  if(currentDish) showDish(currentDish);
  else renderMenu();
});

// ==== Инициализация ====
renderMenu();