// ===== СЛОВАРЬ ПЕРЕВОДОВ =====
const translations = {
  ru: {
    menu: "Меню",
    description: "Описание блюда",
    send: "Отправить",
    back: "Назад",
    home: "На главную",
    date: "Дата",
    order: "Заказ",
    name: "Имя",
    comment: "Комментарий",
    ingredients: "Ингредиенты",
    amount: "Гр.",
    process: "Описание",
    photo: "Фото",
    kitchen: "Кухня",
    guest_area: "Зал"
  },
  en: {
    menu: "Menu",
    description: "Dish description",
    send: "Send",
    back: "Back",
    home: "Home",
    date: "Date",
    order: "Order",
    name: "Name",
    comment: "Comment",
    ingredients: "Ingredients",
    amount: "Gr.",
    process: "Description",
    photo: "Photo",
    kitchen: "Kitchen",
    guest_area: "Hall"
  },
  vi: {
    menu: "Thực đơn",
    description: "Mô tả món ăn",
    send: "Gửi",
    back: "Quay lại",
    home: "Trang chủ",
    date: "Ngày",
    order: "Đơn hàng",
    name: "Tên",
    comment: "Bình luận",
    ingredients: "Nguyên liệu",
    amount: "Gram",
    process: "Mô tả",
    photo: "Ảnh",
    kitchen: "Bếp",
    guest_area: "Khu vực khách"
  }
};

// ===== ТЕКУЩИЙ ЯЗЫК =====
let currentLang = localStorage.getItem("lang") || "ru";

// ===== ПРИМЕНЕНИЕ ПЕРЕВОДА =====
function applyTranslations() {
  document.documentElement.lang = currentLang;
  document.querySelectorAll("[data-i18n]").forEach(el => {
    const key = el.getAttribute("data-i18n");
    if (translations[currentLang][key]) {
      el.textContent = translations[currentLang][key];
    }
  });
}

// ===== СМЕНА ЯЗЫКА =====
function switchLanguage(lang) {
  if (!translations[lang]) return;
  currentLang = lang;
  localStorage.setItem("lang", lang);
  applyTranslations();
}

// ===== ИНИЦИАЛИЗАЦИЯ =====
document.addEventListener("DOMContentLoaded", () => {
  applyTranslations();

  document.querySelectorAll(".lang-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      switchLanguage(btn.dataset.lang);
    });
  });
});