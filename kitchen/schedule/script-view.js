async function loadSchedule() {
  const response = await fetch('../data/schedule.json');
  const data = await response.json();

  const employees = data.employees;
  const exceptions = data.exceptions || {};
  const scheduleTable = document.getElementById('schedule');
  const tbody = scheduleTable.querySelector('tbody');

  const startDate = new Date();
  startDate.setDate(startDate.getDate() - startDate.getDay() + 1); // понедельник
  const daysToShow = 10;

  const headerDates = document.getElementById('header-dates');
  const headerDays = document.getElementById('header-days');

  for (let i = 0; i < daysToShow; i++) {
    const currentDate = new Date(startDate);
    currentDate.setDate(startDate.getDate() + i);

    const dateStr = currentDate.toISOString().split('T')[0];
    const day = currentDate.toLocaleDateString('ru-RU', { weekday: 'short' });

    const thDate = document.createElement('th');
    thDate.textContent = currentDate.toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit' });
    headerDates.appendChild(thDate);

    const thDay = document.createElement('th');
    thDay.textContent = day;
    headerDays.appendChild(thDay);
  }

  // группы по разделам
  const sections = {};
  for (const id in employees) {
    const emp = employees[id];
    if (!sections[emp.section]) sections[emp.section] = [];
    sections[emp.section].push({ id, ...emp });
  }

  // вывод строк
  for (const section in sections) {
    const sectionRow = document.createElement('tr');
    const td = document.createElement('td');
    td.colSpan = daysToShow + 1;
    td.textContent = section;
    td.classList.add('section-row');
    sectionRow.appendChild(td);
    tbody.appendChild(sectionRow);

    for (const emp of sections[section]) {
      const tr = document.createElement('tr');
      const tdName = document.createElement('td');
      tdName.textContent = emp.name;
      tdName.classList.add('name-col');
      tr.appendChild(tdName);

      for (let i = 0; i < daysToShow; i++) {
        const currentDate = new Date(startDate);
        currentDate.setDate(startDate.getDate() + i);
        const dateStr = currentDate.toISOString().split('T')[0];

        let shift = emp.shifts[i % emp.shifts.length]; // циклично
        if (exceptions[dateStr] && exceptions[dateStr][emp.id]) {
          shift = exceptions[dateStr][emp.id];
        }

        const td = document.createElement('td');
        td.textContent = shift;
        td.classList.add('shift-' + shift);
        tr.appendChild(td);
      }

      tbody.appendChild(tr);
    }
  }
}

loadSchedule();