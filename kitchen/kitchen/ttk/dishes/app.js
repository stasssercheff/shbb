let currentLang = "ru";
let data = [];

async function loadData() {
  const res = await fetch("../data/breakfast.json");
  data = await res.json();
  renderDishList();
}

function switchLanguage(lang) {
  currentLang = lang;
  document.getElementById("page-title").textContent =
    lang === "ru" ? "Завтраки" : "Breakfasts";
  renderDishList();
  document.getElementById("ttk-container").innerHTML = "";
}

function renderDishList() {
  const list = document.getElementById("dish-list");
  list.innerHTML = "";
  data.forEach((dish, idx) => {
    const btn = document.createElement("button");
    btn.className = "nav-btn";
    btn.textContent = dish.name[currentLang] || dish.name["ru"];
    btn.onclick = () => showDish(idx);
    list.appendChild(btn);
  });
}

function showDish(index) {
  const dish = data[index];
  const c = document.getElementById("ttk-container");
  c.innerHTML = `
    <div class="ttk-card">
      <h2>${dish.name[currentLang]}</h2>
      ${dish.photo ? `<img src="../фото/${dish.photo}" alt="${dish.name[currentLang]}">` : ""}
      <table>
        <tr>
          <th>${currentLang === "ru" ? "Ингредиенты" : "Ingredients"}</th>
          <th>${currentLang === "ru" ? "Количество" : "Amount"}</th>
        </tr>
        ${dish.ingredients.map(i => `
          <tr>
            <td>${i.name[currentLang]}</td>
            <td>${i.amount}</td>
          </tr>
        `).join("")}
      </table>
      <h3>${currentLang === "ru" ? "Процесс" : "Process"}</h3>
      <p>${dish.process[currentLang]}</p>
    </div>
  `;
}

loadData();