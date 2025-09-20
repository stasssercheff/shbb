// script.js — вспомогательные функции для навигации и даты

document.addEventListener("DOMContentLoaded", () => {
    const dateEl = document.getElementById("current-date");
    if (!dateEl) return;

    // Если lang.js уже установил язык, возьмем его
    const lang = localStorage.getItem('lang') || (navigator.language || 'ru').slice(0, 2);
    const localeMap = {
        ru: 'ru-RU',
        en: 'en-US',
        vi: 'vi-VN'
    };
    const locale = localeMap[lang] || 'ru-RU';

    const today = new Date();
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    dateEl.textContent = today.toLocaleDateString(locale, options);
});

// Функция возврата на главную страницу
function goHome() {
    location.href = '/index.html';
}

// Функция возврата на предыдущую страницу
function goBack() {
    history.back();
}