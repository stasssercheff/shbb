// --- Дата и день недели ---
function updateDateTime() {
    const now = new Date();
    const daysRU = ["Воскресенье","Понедельник","Вторник","Среда","Четверг","Пятница","Суббота"];
    const daysEN = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
    const lang = document.documentElement.lang;

    const dayName = lang === 'ru' ? daysRU[now.getDay()] : daysEN[now.getDay()];
    const dateStr = now.toLocaleDateString(lang);
    document.getElementById('datetime').textContent = `${dayName}, ${dateStr}`;
    
    const hour = now.getHours();
    let greeting = "";
    if(hour < 12) greeting = lang==='ru'?"Доброе утро":"Good morning";
    else if(hour < 18) greeting = lang==='ru'?"Добрый день":"Good afternoon";
    else greeting = lang==='ru'?"Добрый вечер":"Good evening";
    document.getElementById('greeting').textContent = greeting;
}

setInterval(updateDateTime, 1000);
updateDateTime();

// --- Переключение языка ---
function setLang(lang) {
    document.documentElement.lang = lang;
    updateDateTime();

    document.querySelectorAll('[data-ru]').forEach(el=>{
        el.textContent = el.dataset[lang];
    });
}

// --- Переход по папкам ---
function goToFolder(folderName) {
    window.location.href = `${folderName}/index.html`;
}