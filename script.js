let currentLang = "ru";

function switchLanguage(lang) {
  currentLang = lang;
  document.getElementById("page-title").textContent =
    lang === "ru" ? "Завтраки" : "Breakfasts";
  loadBreakfasts();
}

function goBack() {
  history.back();
}

function goHome() {
  window.location.href = "index.html";
}

function loadBreakfasts() {
  fetch("data/breakfast.json")
    .then(res => {
      if (!res.ok) throw new Error("Ошибка сети " + res.status);
      return res.json();
    })
    .then(data => renderBreakfasts(data))
    .catch(err => {
      console.error("Ошибка загрузки:", err);
      document.getElementById("breakfast-list").innerHTML =
        `<p style="color:red">Ошибка загрузки данных</p>`;
    });
}

function renderBreakfasts(data) {
  const list = document.getElementById("breakfast-list");
  list.innerHTML = "";

  data.forEach((dish, index) => {
    const dishDiv = document.createElement("div");
    dishDiv.className = "dish";

    const title = document.createElement("div");
    title.className = "dish-title";
    title.textContent = dish.name[currentLang];
    title.onclick = () => {
      const details = dishDiv.querySelector(".dish-details");
      details.style.display =
        details.style.display === "block" ? "none" : "block";
    };

    const details = document.createElement("div");
    details.className = "dish-details";

    // ингредиенты
    if (dish.ingredients && dish.ingredients.length > 0) {
      const ingTitle = document.createElement("p");
      ingTitle.innerHTML = "<b>" + (currentLang === "ru" ? "Ингредиенты:" : "Ingredients:") + "</b>";
      details.appendChild(ingTitle);

      const ingList = document.createElement("ul");
      dish.ingredients.forEach(ing => {
        const li = document.createElement("li");
        li.textContent = `${ing[currentLang]} — ${ing.amount}`;
        ingList.appendChild(li);
      });
      details.appendChild(ingList);
    }

    // процесс
    if (dish.process && dish.process[currentLang]) {
      const proc = document.createElement("p");
      proc.innerHTML = "<b>" + (currentLang === "ru" ? "Процесс:" : "Process:") + "</b> " + dish.process[currentLang];
      details.appendChild(proc);
    }

    // фото
    if (dish.photo) {
      const img = document.createElement("img");
      img.src = "фото/" + dish.photo;
      img.alt = dish.name[currentLang];
      details.appendChild(img);
    }

    dishDiv.appendChild(title);
    dishDiv.appendChild(details);
    list.appendChild(dishDiv);
  });
}

// загружаем при старте
document.addEventListener("DOMContentLoaded", loadBreakfasts);