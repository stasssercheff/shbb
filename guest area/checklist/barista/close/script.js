document.addEventListener('DOMContentLoaded', () => {
  console.log("✅ DOM загружен, инициализация скрипта");

  const chat_id = '-1002915693964';
  const worker_url = 'https://shbb1.stassser.workers.dev/';
  const button = document.getElementById('sendBtn');

  if (!button) {
    console.error("❌ Кнопка #sendBtn не найдена на странице!");
    return;
  }

  // ✅ массив языков для отправки (берётся из sendConfig.js)
  const sendLangs = window.sendLangs || ["ru"];
  console.log("🌍 Языки отправки:", sendLangs);

  // 🟢 словарь для перевода шапки и системных сообщений
  const uiDict = {
    title: {
      ru: "Бариста закрытие. Выполнено из 11:",
      en: "Barista close. Done from 11:",
      vi: "Barista đóng làm được trong 11"
    },
    date: {
      ru: "Дата",
      en: "Date",
      vi: "Ngày"
    },
    alerts: {
      empty: {
        ru: "Выберите хотя бы один пункт",
        en: "Select at least one item",
        vi: "Chọn ít nhất một mục"
      },
      success: {
        ru: "✅ Отправлено",
        en: "✅ Sent",
        vi: "✅ Đã gửi"
      },
      error: {
        ru: "❌ Ошибка",
        en: "❌ Error",
        vi: "❌ Lỗi"
      }
    }
  };

  const buildMessage = (lang) => {
    console.log(`🛠 Формируем сообщение полностью на языке: ${lang}`);

    const today = new Date();
   
