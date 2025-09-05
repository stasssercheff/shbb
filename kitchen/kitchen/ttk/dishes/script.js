/* kitchen/script.js
   - Поддерживает разделы (завтраки/супы/салаты/основные)
   - Загружает JSON из ../data/
   - Строит список блюд; каждое блюдо открывается/закрывается отдельно.
   - Поддерживает переключение языка (RU/EN).
*/

(() => {
  const sections = [
    { id: "breakfasts", title: { ru: "Завтраки", en: "Breakfasts" }, file: "../data/breakfast.json" },
    { id: "soups", title: { ru: "Супы", en: "Soups" }, file: "../data/soup.json" },
    { id: "salads", title: { ru: "Салаты и закуски", en: "Salads & Snacks" }, file: "../data/salad.json" },
    { id: "mains", title: { ru: "Основные блюда", en: "Main Courses" }, file: "../data/main.json" }
  ];

  let currentLang = 'ru';
  const cache = {}; // кеш JSON по файлам, чтобы не перезагружать

  // helpers для безопасного чтения полей (поддерживает разные структуры)
  function getDishName(dish) {
    if (!dish) return '';
    return dish.name?.[currentLang] ?? dish.name?.ru ?? dish.title ?? '';
  }

  function getProcess(dish) {
    return dish.process?.[currentLang] ?? dish.description?.[currentLang] ?? dish.process?.ru ?? dish.description?.ru ?? '';
  }

  function getIngredientText(ing) {
    if (!ing) return '';
    // если объект вида { ingredient: {ru, en}, amount: "..." }
    if (ing.ingredient && typeof ing.ingredient === 'object') {
      return ing.ingredient[currentLang] ?? ing.ingredient.ru ?? '';
    }
    // если объект вида { ru: "...", en: "...", amount: "..." }
    if (ing[currentLang]) return ing[currentLang];
    if (ing.ru) return ing.ru;
    // если строка
    if (typeof ing === 'string') return ing;
    return '';
  }

  function getIngredientAmount(ing) {
    return ing.amount ?? ing['Шт/гр'] ?? ing.qty ?? ing.qty ?? '';
  }

  function makeSectionButton(sec) {
    const btn = document.createElement('button');
    btn.className = 'section-btn';
    btn.textContent = sec.title[currentLang] ?? sec.title.ru;
    btn.type = 'button';
    return btn;
  }

  // инициализация интерфейса: секции
  function init() {
    const container = document.getElementById('sections-container');
    container.innerHTML = '';

    sections.forEach(sec => {
      const secWrapper = document.createElement('div');

      const secBtn = makeSectionButton(sec);
      secBtn.addEventListener('click', () => toggleSection(sec));

      const secContent = document.createElement('div');
      secContent.className = 'section-content';
      secContent.id = `section-${sec.id}`;

      secWrapper.appendChild(secBtn);
      secWrapper.appendChild(secContent);
      container.appendChild(secWrapper);
    });
  }

  // показать/скрыть раздел
  async function toggleSection(sec) {
    const content = document.getElementById(`section-${sec