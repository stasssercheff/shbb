document.addEventListener("DOMContentLoaded", () => {
    const scheduleBody = document.getElementById("schedule-body");
    const dateRow = document.getElementById("date-row");
    const dayRow = document.getElementById("day-row");

    // Список сотрудников по разделам
    const workers = [
        { section: "Шеф", names: ["Стас"] },
        { section: "Кухня", names: ["Максим", "Мигель", "Шавкат"] },
        { section: "Кондитеры", names: ["Тимофей", "Ирина"] }
    ];

    // Настройки
    const daysToShow = 10;
    const today = new Date();

    // Генерация заголовков (даты и дни недели)
    dateRow.innerHTML = "<th>Дата</th>";
    dayRow.innerHTML = "<th>День</th>";

    for (let i = 0; i < daysToShow; i++) {
        const d = new Date(today);
        d.setDate(today.getDate() + i);

        const dateStr = d.toLocaleDateString("ru-RU", { day: "2-digit", month: "2-digit" });
        const dayStr = d.toLocaleDateString("ru-RU", { weekday: "short" });

        const isToday = i === 0 ? "today" : "";

        dateRow.innerHTML += `<th class="${isToday}">${dateStr}</th>`;
        dayRow.innerHTML += `<th class="${isToday}">${dayStr}</th>`;
    }

    // Генерация строк сотрудников
    scheduleBody.innerHTML = "";

    workers.forEach(group => {
        // строка с названием секции
        const sectionRow = document.createElement("tr");
        const sectionCell = document.createElement("td");
        sectionCell.colSpan = daysToShow + 1;
        sectionCell.textContent = group.section;
        sectionCell.classList.add("section-cell");
        sectionRow.appendChild(sectionCell);
        scheduleBody.appendChild(sectionRow);

        // строки с именами
        group.names.forEach(name => {
            const row = document.createElement("tr");

            // имя
            const nameCell = document.createElement("td");
            nameCell.textContent = name;
            nameCell.classList.add("name-cell");
            row.appendChild(nameCell);

            // смены на 10 дней (рандомно для примера)
            for (let i = 0; i < daysToShow; i++) {
                const shift = Math.round(Math.random()); // 0 или 1
                const isToday = i === 0 ? "today" : "";

                const cell = document.createElement("td");
                cell.textContent = shift;
                cell.classList.add(shift === 1 ? "shift-yes" : "shift-no");
                if (isToday) cell.classList.add("today");
                row.appendChild(cell);
            }

            scheduleBody.appendChild(row);
        });
    });
});