document.addEventListener("DOMContentLoaded", async () => {
  console.log("✅ DOM загружен");

  const panel = document.getElementById("breakfast-section");

  try {
    const response = await fetch("data/breakfast.json?nocache=" + Date.now());
    if (!response.ok) throw new Error("Ошибка HTTP " + response.status);

    const data = await response.json();
    console.log("📦 Данные получены:", data);

    renderBreakfast(panel, data);
  } catch (err) {
    console.error("❌ Ошибка при загрузке JSON:", err);
    panel.innerHTML = `<p style="color:red;">Ошибка: ${err.message}</p>`;
  }
});

function renderBreakfast(panel, data) {
  panel.innerHTML = "";

  const table = document.createElement("table");
  table.classList.add("dish-table");

  // заголовок таблицы
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

  data.forEach((dish) => {
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

      // технология и фото только в первой строке
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
  });

  table.appendChild(tbody);
  panel.appendChild(table);
}