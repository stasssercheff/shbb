// script.js — отображение текущей даты и навигация
document.addEventListener("DOMContentLoaded", () => {
    const dateEl = document.getElementById("current-date");
    if (!dateEl) return;

    const lang = localStorage.getItem('lang') || (navigator.language || 'ru').slice(0,2);
    const localeMap = { ru: 'ru-RU', en: 'en-US', vi: 'vi-VN' };
    const locale = localeMap[lang] || 'ru-RU';

    const today = new Date();
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    dateEl.textContent = today.toLocaleDateString(locale, options);
});

function goHome() { location.href = '/index.html'; }
function goBack() { history.back(); }