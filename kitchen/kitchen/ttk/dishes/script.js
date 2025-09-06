// script.js — надежная отладочная версия для "Завтраки"
(() => {
  const DEBUG = true; // покажет лог на странице, если true
  let breakfastLoaded = false;
  let breakfastData = null;

  // ---- helper: visible logger ----
  function makeLogger() {
    const logs = [];
    const appendToDom = (msg, level = "log") => {
      if (!DEBUG) return;
      let dbg = document.getElementById("ttk-debug");
      if (!dbg) {
        dbg = document.createElement("pre");
        dbg.id = "ttk-debug";
        dbg.style.cssText = "position:fixed;right:10px;bottom:10px;max-width:420px;max-height:240px;overflow:auto;background:rgba(0,0,0,0.8);color:#fff;padding:8px;border-radius:6px;font-size:12px;z-index:9999;";
        document.body.appendChild(dbg);
      }
      const time = new Date().toLocaleTimeString();
      dbg.textContent += `\n[${time}] ${level.toUpperCase()}: ${msg}`;
      dbg.scrollTop = dbg.scrollHeight;
    };

    return {
      log: (msg) => { console.log(msg); appendToDom(msg, "log"); },
      error: (msg) => { console.error(msg); appendToDom(msg, "error"); }
    };
  }
  const logger = makeLogger();

  // ---- utilities ----
  function el(name, opts = {}) {
    const e = document.createElement(name);
    Object.entries(opts).forEach(([k, v]) => {
      if (k === "text") e.textContent = v;
      else if (k === "html") e.innerHTML = v;
      else e.setAttribute(k, v);
    });
    return e;
  }

  // ---- main flow ----
  document.addEventListener("DOMContentLoaded", () => {
    logger.log("DOM loaded");

    // Найдём кнопку-завтраки: .accordion[data-section="breakfast"]
    const breakfastBtn = document.querySelector('.accordion[data-section="breakfast"]');
    if (!breakfastBtn) {
      logger.error('Кнопка: .accordion[data-section="breakfast"] НЕ найдена в DOM. Убедись в разметке.');
      return;
    }

    // Убедимся, что есть панель с id breakfast-section
    const panelId = 'breakfast-section';
    let panel = document.getElementById(panelId);
    if (!panel) {
      // если нет — создаём, чтобы гарантированно отрисовать
      panel = el('div', { id: panelId, class: 'panel' });
      breakfastBtn.insertAdjacentElement('afterend', panel);
      logger.log(`Контейнер с id="${panelId}" не найден — создан автоматически.`);
    }

    // Навесим обработчик клика
    breakfastBtn.addEventListener('click', async () => {
      logger.log('Нажата кнопка "Завтраки"');
      // toggle видимости панели
      if (panel.style.display === 'block') {
        panel.style.display = 'none';
        logger.log('Панель скрыта');
        return;
      }

      // показать панель
      panel.style.display = 'block';

      // если уже загружено — просто отрисовать / показать
      if (breakfastLoaded && breakfastData) {
        logger.log('Данные уже загружены — перерисовка');
        renderAllBreakfasts(panel, breakfastData);
        return;
      }

      // загрузить JSON (с cache-bust)
      const url = 'data/breakfast.json';
      logger.log(`Запрос JSON: ${url}`);
      try {
        const resp = await fetch(url + '?_=' + Date.now());
        if (!resp.ok) {
          const msg = `Fetch error ${resp.status} ${resp.statusText} для ${url}`;
          logger.error(msg);
          panel.innerHTML = `<div style="color:red;padding:10px;">Ошибка загрузки: ${resp.status} ${resp.statusText}. Проверь путь: <code>${url}</code></div>`;
          return;
        }
        const data = await resp.json();
        breakfastLoaded = true;
        breakfastData = data;
        logger.log('JSON успешно загружен, элементов: ' + (Array.isArray(data) ? data.length : 'not array'));
        renderAllBreakfasts(panel, data);
      } catch (err) {
        logger.error('Ошибка fetch/parsing: ' + (err && err.message ? err.message : err));
        panel.innerHTML = `<div style="color:red;padding:10px;">Ошибка загрузки данных: ${err && err.message ? err.message : err}. Если открываешь файл по file:// — запусти локальный сервер (например: <code>python -m http.server</code>), или залей на GitHub Pages.</div>`;
      }
    });
  });

  // ---- render ----
  function renderAllBreakfasts(container, data) {
    container.innerHTML = ''; // очищаем
    if (!Array.isArray(data)) {
      container.innerHTML = `<div style="color:red">Ошибка: JSON не массив</div>`;
      return;
    }

    data.forEach((dish, dishIndex) => {
      // Title
      const title = el('h3', { text: dish?.name?.ru || `Блюдо ${dishIndex + 1}` });
      title.style.margin = '14px 0 6px';
      container.appendChild(title);

      // Table wrapper
      const wrapper = el('div', { class: 'table-container' });
      container.appendChild(wrapper);

      const table = el('table', { class: 'dish-table' });
      wrapper.appendChild(table);

      // THEAD
      const thead = el('thead');
      thead.innerHTML = `
        <tr>
          <th style="width:48px;">№</th>
          <th>Наименование продукта</th>
          <th style="width:100px;">Кол-во</th>
          <th style="min-width:280px;">Технология</th>
          <th style="width:140px;">Фото</th>
        </tr>`;
      table.appendChild(thead);

      // TBODY
      const tbody = el('tbody');
      table.appendChild(tbody);

      const ingredients = Array.isArray(dish.ingredients) ? dish.ingredients : [];

      // если нет ингредиентов — создаём одну строку-заглушку
      const rowsCount = ingredients.length > 0 ? ingredients.length : 1;

      for (let i = 0; i < rowsCount; i++) {
        const tr = el('tr');
        // №
        const tdNum = el('td', { text: String(i + 1) });
        tdNum.style.textAlign = 'center';
        tr.appendChild(tdNum);

        // Наименование
        const ingText = ingredients[i] ? (ingredients[i].ru || '') : '-';
        const tdIng = el('td', { text: ingText });
        tdIng.style.whiteSpace = 'nowrap'; // не ломаем ширину, подпираем под содержимое
        tr.appendChild(tdIng);

        // Кол-во
        const qtyText = ingredients[i] ? (String(ingredients[i].amount || '')) : '-';
        const tdQty = el('td', { text: qtyText });
        tdQty.style.textAlign = 'center';
        tr.appendChild(tdQty);

        // Технология (rowspan) — только в первой строке
        if (i === 0) {
          const procText = (dish.process && (dish.process.ru || '')) || '-';
          const tdProc = el('td', { text: procText });
          tdProc.rowSpan = rowsCount;
          tdProc.style.verticalAlign = 'top';
          tdProc.style.wordBreak = 'break-word';
          tr.appendChild(tdProc);

          // Фото
          const tdPhoto = el('td');
          tdPhoto.rowSpan = rowsCount;
          tdPhoto.style.verticalAlign = 'top';
          if (dish.photo) {
            const img = el('img');
            img.src = dish.photo;
            img.alt = dish.name?.ru || '';
            img.style.maxWidth = '120px';
            img.style.height = 'auto';
            img.style.display = 'block';
            tdPhoto.appendChild(img);
          } else {
            tdPhoto.textContent = '-';
          }
          tr.appendChild(tdPhoto);
        }

        tbody.appendChild(tr);
      } // end for ingredients

      // after each table, small spacer
      const hr = el('div');
      hr.style.height = '6px';
      container.appendChild(hr);
    }); // end for dishes

    // apply minimal table styles if missing
    applyTableStylesOnce();
  }

  // minimal CSS injection to ensure visible borders (won't override your file)
  let stylesInjected = false;
  function applyTableStylesOnce() {
    if (stylesInjected) return;
    stylesInjected = true;
    const s = document.createElement('style');
    s.innerHTML = `
      .dish-table { width:100%; border-collapse:collapse; margin:8px 0 16px; font-size:14px; }
      .dish-table th, .dish-table td { border:1px solid #444; padding:6px 8px; text-align:left; vertical-align:top; }
      .dish-table th { background:#f6f6f6; font-weight:600; }
    `;
    document.head.appendChild(s);
  }
})();