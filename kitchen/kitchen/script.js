// Функции навигации (оставляем для совместимости со всем сайтом)
function goHome() {
    location.href = '/index.html';
}

function goBack() {
    history.back();
}

// Обновление даты через lang.js (при загрузке страницы или смене языка)
document.addEventListener("DOMContentLoaded", () => {
    const dateEl = document.getElementById("current-date");
    if (dateEl) {
        const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        // Берём текущий язык из localStorage, если есть
        const lang = localStorage.getItem("lang") || "ru";
        dateEl.textContent = new Date().toLocaleDateString(lang, options);
    }
});
