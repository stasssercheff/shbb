document.addEventListener("DOMContentLoaded", () => {
  console.log("✅ DOM загружен");

  const sections = document.querySelectorAll(".nav-btn");

  sections.forEach((btn) => {
    btn.addEventListener("click", async () => {
      const section = btn.dataset.section;
      console.log("🔘 Нажата кнопка:", section);

      const panel = document.getElementById(section);
      if (!panel) {
        console.error("❌ Не найден panel для:", section);
        return;
      }

      // переключение открытия/закрытия
      if (panel.style.display === "block") {
        panel.style.display = "none";
        console.log("⬅️ Панель закрыта:", section);
        return;
      }

      // спрячем все панели кроме текущей
      document.querySelectorAll(".panel").forEach((p) => (p.style.display = "none"));
      panel.style.display = "block";

      // грузим JSON
      try {
        const response = await fetch(`data/${section}.json?nocache=${Date.now()}`);
        console.log("📂 Загружаем:", `data/${section}.json`);

        if (!response.ok) {
          throw new Error(`Ошибка загрузки JSON (${response.status})`);
        }

        const data = await response.json();
        console.log("📦 Данные получены:", data);

        renderDishes(panel, data);
      } catch (err) {
        console.error("❌ Ошибка при загрузке/парсинге JSON:", err);
        panel.innerHTML = `<p style="color:red;">Ошибка загрузки данных: ${err.message}</p>`;
      }
    });
  });

  function renderDishes(panel, data) {
    console.log("🎨 Рисуем блюда...");

    panel.innerHTML = ""; // очистим старое

    data.forEach((dish, dishIndex) => {
      console.log(`🍳 Блюдо ${dishIndex + 1}:`, dish.name?.ru);

      // заголовок
      const title = document.createElement("h3");
      title.textContent = dish.name?.ru || "Без названия";
      panel.appendChild(title);

      // таблица
      const table = document.createElement("table");
      table.classList.add("dish-table");

      const thead = document.createElement("thead");
      thead.innerHTML = `
        <tr>
          <th>№</th>
          <th>Наименование продукта</th>
          <th>Количество</th>
          <th>Технология</th>
          <th>Фото</th>
        </tr>`;
      table.appendChild(thead);

      const tbody = document.createElement("tbody");

      if (dish.ingredients && dish.ingredients.length > 0) {
        dish.ingredients.forEach((ing, i) => {
          const tr = document.createElement("tr");

          // номер
          const tdNum = document.createElement("td");
          tdNum.textContent = String(i + 1);
          tr.appendChild(tdNum);

          // продукт
          const tdIng = document.createElement("td");
          tdIng.textContent = ing.ru || "";
          tr.appendChild(tdIng);

          // количество
          const tdAmount = document.createElement("td");
          tdAmount.textContent = ing.amount || "";
          tr.appendChild(tdAmount);

          // технология (rowspan)
          if (i === 0) {
            const tdProcess = document.createElement("td");
            tdProcess.textContent = dish.process?.ru || "";
            tdProcess.rowSpan = dish.ingredients.length;
            tr.appendChild(tdProcess);

            const tdPhoto = document.createElement("td");
            if (dish.photo) {
              const img = document.createElement("img");
              img.src = dish.photo;
              img.alt = "Фото";
              img.style.maxWidth = "120px";
              img.style.display = "block";
              tdPhoto.appendChild(img);
            } else {
              tdPhoto.textContent = "-";
            }
            tdPhoto.rowSpan = dish.ingredients.length;
            tr.appendChild(tdPhoto);
          }

          tbody.appendChild(tr);
        });
      }

      table.appendChild(tbody);
      panel.appendChild(table);
    });
  }
});