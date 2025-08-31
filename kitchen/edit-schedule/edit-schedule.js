let scheduleData = {};

async function loadData() {
  const response = await fetch('../data/schedule.json');
  scheduleData = await response.json();

  const employeeSelect = document.getElementById('employee');
  for (const id in scheduleData.employees) {
    const emp = scheduleData.employees[id];
    const option = document.createElement('option');
    option.value = id;
    option.textContent = `${emp.name} (${emp.section})`;
    employeeSelect.appendChild(option);
  }
}

document.getElementById('save').addEventListener('click', () => {
  const date = document.getElementById('date').value;
  const employeeId = document.getElementById('employee').value;
  const value = document.getElementById('value').value;

  if (!scheduleData.exceptions) scheduleData.exceptions = {};
  if (!scheduleData.exceptions[date]) scheduleData.exceptions[date] = {};
  scheduleData.exceptions[date][employeeId] = value;

  alert('Исключение сохранено. Теперь скачайте JSON и замените файл на сервере.');
});

document.getElementById('download').addEventListener('click', () => {
  const blob = new Blob([JSON.stringify(scheduleData, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'schedule.json';
  a.click();
  URL.revokeObjectURL(url);
});

loadData();