let currentLang = 'ru';

const sections = [
    { id: "breakfasts", title: { ru: "Завтраки", en: "Breakfasts" }, file: "data/breakfast.json" },
    { id: "soups", title: { ru: "Супы", en: "Soups" }, file: "data/soup.json" },
    { id: "salads", title: { ru: "Салаты и закуски", en: "Salads & Snacks" }, file: "data/salad.json" },
    { id: "mains", title: { ru: "Основные блюда", en: "Main Courses" }, file: "data/main.json" }
];

// инициализация кнопок разделов
function init() {
    const container = document.getElementById("sections-container");
    container.innerHTML = "";

    sections.forEach(sec => {
        const secBtn = document.createElement("button");
        secBtn.className = "section-btn";
        secBtn.textContent = sec.title[currentLang];
        secBtn.onclick = () => loadSection(sec.id, sec.file);
        container.appendChild(secBtn);

        const secContent = document.createElement("div");
        secContent.className = "section-content";
        secContent.id = `section-${sec.id}`;
        container.appendChild(secContent);
    });
}

// загрузка конкретного раздела
async function loadSection(sectionId, jsonFile) {
    const content = document.getElementById(`section-${sectionId}`);

    // закрыть все остальные разделы
    document.querySelectorAll(".section-content").forEach(el => {
        el.style.display = "none";
        el.innerHTML = "";
    });

    try {
        const response = await fetch(jsonFile);
        if (!response.ok) throw new Error("Ошибка сети");
        const dishes = await response.json();

        content.style.display = "block";
        content.innerHTML = ""; // очистка

        dishes.forEach((dish, index) => {
            const table = document.createElement('table');
            table.classList.add('dish-table');

            // Заголовок
            const caption = document.createElement('caption');
            caption.textContent = `${dish.name.ru} / ${dish.name.en}`;
            table.appendChild(caption);

            // Шапка
            const thead = document.createElement('thead');
            thead.innerHTML = `
                <tr>
                    <th>№</th>
                    <th>${currentLang === 'ru' ? 'Ингредиент' : 'Ingredient'}</th>
                    <th>${currentLang === 'ru' ? 'Шт/гр' : 'Qty'}</th>
                    <th>${currentLang === 'ru' ? 'Описание' : 'Description'}</th>
                    <th>${currentLang === 'ru' ? 'Фото' : 'Photo'}</th>
                </tr>
            `;
            table.appendChild(thead);

            // Тело
            const tbody = document.createElement('tbody');
            dish.ingredients.forEach((ing, i) => {
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td>${i + 1}</td>
                    <td>${ing[currentLang]}</td>
                    <td>${ing.amount}</td>
                    <td>${i === 0 ? dish.process[currentLang] : ''}</td>
                    <td>${i === 0 && dish.photo ? `<img src="${dish.photo}" alt="photo" class="dish-photo">` : ''}</td>
                `;
                tbody.appendChild(tr);
            });
            table.appendChild(tbody);

            content.appendChild(table);
        });

    } catch (error) {
        console.error("Ошибка загрузки:", error);
        content.innerHTML = `<p style="color:red">Ошибка загрузки: ${error.message}</p>`;
    }
}

// переключение языка
function switchLanguage(lang) {
    currentLang = lang;
    init(); // перерисовать кнопки
}

// загрузка при старте
document.addEventListener("DOMContentLoaded", () => {
    init();
    document.getElementById('lang-ru').addEventListener('click', () => switchLanguage('ru'));
    document.getElementById('lang-en').addEventListener('click', () => switchLanguage('en'));
});