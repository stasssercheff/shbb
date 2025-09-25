// Показ даты (если она есть на странице)
document.addEventListener("DOMContentLoaded", () => {
  const dateEl = document.getElementById("current-date");
  if (dateEl) {
    const today = new Date();
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    dateEl.textContent = today.toLocaleDateString(localStorage.getItem("lang") || "ru", options);
  }
});

function goHome() {
  location.href = "http://stasssercheff.github.io/shbb/";
}

function goBack() {
  history.back();
}
