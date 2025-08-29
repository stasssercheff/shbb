// Отображение текущей даты
document.addEventListener("DOMContentLoaded", () => {
    const dateEl = document.getElementById("current-date");
    const today = new Date();
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    dateEl.textContent = today.toLocaleDateString('ru-RU', options);
});

// Функция возврата на сираницу назад
function goHome() {
    location.href = '/index.html';
}
