document.addEventListener("DOMContentLoaded", () => {
    const sections = {
        breakfast: "data/breakfast.json",
        soup: "data/soup.json",
        salad: "data/salad.json",
        main: "data/main.json"
    };

    let currentLang = "ru"; // по умолчанию русский

    // Переключение языка
    document.querySelectorAll(".lang-btn").forEach(btn => {
        btn.addEventListener("click", () => {
            currentLang = btn.dataset.lang;
            document.documentElement.lang = currentLang;
        });
    });

    // Загрузка JSON по разделам
    Object.keys(sections).forEach(sectionId => {
        const btn = document.getElementById(sectionId);
        const container = document.getElementById(`${sectionId}-content`);

        btn.addEventListener("click", async () => {
            // сворачивание/разворачивание раздела
            if (container.style.display === "block") {
                container.style.display = "none";
                container.innerHTML = "";
                return;
            }

            try {
                const res = await fetch(sections[sectionId]);
                if (!res.ok) throw new Error("Ошибка HTTP " + res.status);
                const data = await res.json();

                container.innerHTML = "";
                container.style.display = "block";

                // список блюд
                data.forEach((dish, index) => {
                    const dishDiv = document.createElement("div");
                    dishDiv.className = "dish-entry";

                    const titleBtn = document.createElement("button");
                    titleBtn.className = "dish-btn";
                    titleBtn.textContent = dish.name[currentLang] || dish.name["ru"] || `Блюдо ${index + 1}`;

                    const detailsDiv = document.createElement("div");
                    detailsDiv.className = "dish-details";
                    detailsDiv.style.display = "none";

                    // таблица
                    const table = document.createElement("table");
                    table.className = "dish-table";

                    const thead = document.createElement("thead");
                    thead.innerHTML = `
                        <tr>
                            <th>№</th>
                            <th>${currentLang === "ru" ? "Ингредиент" : "Ingredient"}</th>
                            <th>${currentLang === "ru" ? "Кол-во" : "Amount"}</th>
                            <th>${currentLang === "ru" ? "Описание" : "Description"}</th>
                            <th>${currentLang === "ru" ? "Фото" : "Photo"}</th>
                        </tr>
                    `;
                    table.appendChild(thead);

                    const tbody = document.createElement("tbody");

                    dish.ingredients.forEach((ing, i) => {
                        const tr = document.createElement("tr");

                        // №
                        const tdNum = document.createElement("td");
                        tdNum.textContent = i + 1;
                        tr.appendChild(tdNum);

                        // ингредиент
                        const tdIng = document.createElement("td");
                        tdIng.textContent = ing.name[currentLang] || ing.name["ru"];
                        tr.appendChild(tdIng);

                        // количество
                        const tdQty = document.createElement("td");
                        tdQty.textContent = ing.amount;
                        tr.appendChild(tdQty);

                        // описание (одна ячейка на всё блюдо)
                        if (i === 0) {
                            const tdDesc = document.createElement("td");
                            tdDesc.textContent = dish.description[currentLang] || "";
                            tdDesc.rowSpan = dish.ingredients.length;
                            tr.appendChild(tdDesc);

                            const tdPhoto = document.createElement("td");
                            if (dish.photo) {
                                const img = document.createElement("img");
                                img.src = dish.photo;
                                img.alt = dish.name[currentLang] || "";
                                img.className = "dish-photo";
                                tdPhoto.appendChild(img);
                            }
                            tdPhoto.rowSpan = dish.ingredients.length;
                            tr.appendChild(tdPhoto);
                        }

                        tbody.appendChild(tr);
                    });

                    table.appendChild(tbody);
                    detailsDiv.appendChild(table);

                    // раскрытие/сворачивание блюда
                    titleBtn.addEventListener("click", () => {
                        detailsDiv.style.display = detailsDiv.style.display === "block" ? "none" : "block";
                    });

                    dishDiv.appendChild(titleBtn);
                    dishDiv.appendChild(detailsDiv);
                    container.appendChild(dishDiv);
                });

            } catch (err) {
                container.innerHTML = `<p class="error">Ошибка загрузки: ${err.message}</p>`;
                container.style.display = "block";
            }
        });
    });
});