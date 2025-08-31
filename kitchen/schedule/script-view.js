async function loadSchedule() {
  const res = await fetch("../Data/schedule.json");
  const data = await res.json();

  const tableBody = document.querySelector("#schedule tbody");
  const headerDates = document.getElementById("header-dates");
  const headerDays = document.getElementById("header-days");

  // показываем 10 дней от сегодня
  const daysToShow = 10;
  const today = new Date();

  for (let i = 0; i < daysToShow; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() + i);

    const dateStr = date.toISOString().split("T")[0];
    const dayName = date.toLocaleDateString("ru-RU", { weekday: "short" });

    const thDate = document.createElement("th");
    thDate.textContent = dateStr;
    headerDates.appendChild(thDate);

    const thDay = document.createElement("th");
    thDay.textContent = dayName;
    headerDays.appendChild(thDay);
  }

  for (const section in data) {
    if (section === "exceptions") continue;

    const sectionRow = document.createElement("tr");
    sectionRow.classList.add("section-row");
    const td = document.createElement("td");
    td.textContent = section;
    td.colSpan = daysToShow + 1;
    sectionRow.appendChild(td);
    tableBody.appendChild(sectionRow);

    for (const name in data[section]) {
      const row = document.createElement("tr");
      const nameTd = document.createElement("td");
      nameTd.textContent = name;
      nameTd.classList.add("name-col");
      row.appendChild(nameTd);

      for (let i = 0; i < daysToShow; i++) {
        const date = new Date(today);
        date.setDate(today.getDate() + i);
        const dateStr = date.toISOString().split("T")[0];

        let baseShift = data[section][name][i % data[section][name].length];
        let finalShift = baseShift;

        // проверяем исключения
        if (data.exceptions?.[section]?.[name]?.[dateStr]) {
          finalShift = data.exceptions[section][name][dateStr];
        }

        const td = document.createElement("td");
        td.textContent = finalShift;

        td.classList.add(
          finalShift === "1" ? "shift-1" :
          finalShift === "0" ? "shift-0" :
          finalShift === "О" ? "shift-O" :
          finalShift === "Б" ? "shift-Б" :
          ""
        );

        row.appendChild(td);
      }
      tableBody.appendChild(row);
    }
  }
}

loadSchedule();