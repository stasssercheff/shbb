let currentLang = 'ru';

// загрузка json и построение таблицы
async function loadBreakfast() {
    try {
        const response = await fetch('data/breakfast.json');
        if (!response.ok) throw new Error("Ошибка сети");
        const data = await response.json();

        const container = document.getElementById('content');
        container.innerHTML = ""; // очистка

        data.forEach((dish, index) => {
            const table = document.createElement('table');
            table.classList.add('dish-table');

            // Заголовок таблицы (название блюда)
            const caption = document.createElement('caption');
            caption.textContent = `${dish.name.ru} / ${dish.name.en}`;
            table.appendChild(caption);

            // Шапка таблицы
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

            // Тело таблицы (ингредиенты)
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

            container.appendChild(table);
        });

    } catch (error) {
        console.error("Ошибка загрузки:", error);
        document.getElementById('content').innerHTML =
            `<p style="color:red">Ошибка загрузки: ${error.message}</p>`;
    }
}

// переключение языка
function switchLanguage(lang) {
    currentLang = lang;
    loadBreakfast();
}

// загрузка при старте
document.addEventListener('DOMContentLoaded', () => {
    loadBreakfast();

    document.getElementById('lang-ru').addEventListener('click', () => switchLanguage('ru'));
    document.getElementById('lang-en').addEventListener('click', () => switchLanguage('en'));
});