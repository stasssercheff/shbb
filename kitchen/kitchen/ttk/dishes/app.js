let currentLang = "ru";
let recipes = [];

async function loadRecipes() {
  const response = await fetch("data/breakfast.json");
  recipes = await response.json();
  renderDishList();
}

function switchLanguage(lang) {
  currentLang = lang;
  document.getElementById("section-title").textContent = recipes.category[lang];
  renderDishList();
  document.getElementById("recipe-container").innerHTML = ""; // очистка при смене языка
}

function renderDishList() {
  const dishList = document.getElementById("dish-list");
  dishList.innerHTML = "";
  recipes.dishes.forEach((dish, index) => {
    const btn = document.createElement("button");
    btn.className = "nav-btn";
    btn.textContent = dish.name[currentLang];
    btn.onclick = () => showRecipe(index);
    dishList.appendChild(btn);
  });
}

function showRecipe(index) {
  const dish = recipes.dishes[index];
  const container = document.getElementById("recipe-container");
  container.innerHTML = `
    <div class="recipe-card active">
      <h2>${dish.name[currentLang]}</h2>
      <img src="${dish.photo}" alt="${dish.name[currentLang]}">
      <h3>${currentLang === "ru" ? "Ингредиенты" : "Ingredients"}</h3>
      <table>
        <tr>
          <th>${currentLang === "ru" ? "Название" : "Name"}</th>
          <th>${currentLang === "ru" ? "Количество" : "Quantity"}</th>
        </tr>
        ${dish.ingredients.map(ing => `
          <tr>
            <td>${ing.name[currentLang]}</td>
            <td>${ing.quantity}</td>
          </tr>
        `).join("")}
      </table>
      <h3>${currentLang === "ru" ? "Процесс приготовления" : "Process"}</h3>
      <p>${dish.process[currentLang]}</p>
    </div>
  `;
}

loadRecipes();