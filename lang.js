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
    photo: "Фото"
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
    photo: "Photo"
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
    photo: "Ảnh"
  }
};

// === Переключение языка ===
function switchLanguage(lang) {
  document.documentElement.lang = lang;
  document.querySelectorAll("[data-i18n]").forEach(el => {
    const key = el.getAttribute("data-i18n");
    if (translations[lang] && translations[lang][key]) {
      el.textContent = translations[lang][key];
    }
  });
}

// === Вешаем события на кнопки ===
document.addEventListener("DOMContentLoaded", () => {
  const lang = localStorage.getItem("lang") || "ru";
  switchLanguage(lang);

  document.querySelectorAll(".lang-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const selectedLang = btn.getAttribute("data-lang");
      localStorage.setItem("lang", selectedLang);
      switchLanguage(selectedLang);
    });
  });
});