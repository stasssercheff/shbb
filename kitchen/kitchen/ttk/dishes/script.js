(() => {
  const sections = [
    { id: "breakfast", title: "Завтраки", json: "data/breakfast.json" },
    { id: "soup", title: "Супы", json: "data/soup.json" },
    { id: "salad", title: "Салаты", json: "data/salad-starter.json" },
    { id: "main", title: "Основные блюда", json: "data/main.json" }
  ];

  const DEBUG = true;

  function log(msg, level="log") {
    if (!DEBUG) return;
    console[level](msg);
  }

  function el(tag, opts={}) {
    const e = document.createElement(tag);
    for (const [k,v] of Object.entries(opts)) {
      if (k==="text") e.textContent = v;
      else if (k==="html") e.innerHTML = v;
      else e.setAttribute(k,v);
    }
    return e;
  }

  document.addEventListener("DOMContentLoaded", () => {
    // модалка для фото
    const modal = el("div", { id: "photo-modal" });
    const modalImg = el("img");
    modal.appendChild(modalImg);
    document.body.appendChild(modal);

    modal.addEventListener('click', e => {
      if(e.target.id==="photo-modal" || e.target.tagName==="IMG") modal.style.display="none";
    });

    sections.forEach(section => {
      const btn = document.querySelector(`.section-btn[data-section="${section.id}"]`);
      const panel = document.getElementById(`${section.id}-section`);
      if (!btn || !panel) return;

      btn.addEventListener("click", async () => {
        panel.style.display = panel.style.display==="block" ? "none" : "block";
        if(panel.innerHTML.trim()!=="") return; // уже загружено

        try {
          const res = await fetch(section.json+"?_="+Date.now());
          if(!res.ok) throw new Error(res.statusText);
          const data = await res.json();
          renderSection(panel, data, modal);
        } catch(err){
          panel.innerHTML = `<div style="color:red;padding:6px;">Ошибка загрузки ${section.title}: ${err.message}</div>`;
        }
      });
    });
  });

  function renderSection(panel, data, modal){
    panel.innerHTML="";
    if(!Array.isArray(data)||!data.length){
      panel.innerHTML=`<div style="color:#666;padding:6px;">Нет данных</div>`;
      return;
    }

    data.forEach((dish,i)=>{
      const title = el("h3",{text: dish.name?.ru || `Блюдо ${i+1}`});
      title.style.margin='12px 0 6px';
      panel.appendChild(title);

      const wrapper = el("div",{class:"table-container"});
      panel.appendChild(wrapper);

      const table = el("table",{class:"dish-table"});
      wrapper.appendChild(table);

      const thead = el("thead");
      thead.innerHTML=`
        <tr>
          <th style="width:40px;">№</th>
          <th>Наименование продукта</th>
          <th style="width:100px;">Кол-во</th>
          <th style="min-width:250px;">Технология</th>
          <th style="width:140px;">Фото</th>
        </tr>`;
      table.appendChild(thead);

      const tbody = el("tbody");
      const ingredients = Array.isArray(dish.ingredients)?dish.ingredients:[];
      const rowsCount = ingredients.length || 1;

      for(let j=0;j<rowsCount;j++){
        const tr = el("tr");
        const ingText = ingredients[j]?.ru || '-';
        const qtyText = ingredients[j]?.amount || '-';
        tr.innerHTML=`
          <td style="text-align:center;">${j+1}</td>
          <td>${ingText}</td>
          <td style="text-align:center;">${qtyText}</td>
        `;

        if(j===0){
          const tdProc = el("td",{text: dish.process?.ru || '-'});
          tdProc.rowSpan = rowsCount;
          tdProc.style.verticalAlign='top';
          tdProc.style.wordBreak='break-word';
          tr.appendChild(tdProc);

          const tdPhoto = el("td",{class:"dish-photo"});
          tdPhoto.rowSpan = rowsCount;

          if(dish.photo){
            const img = el("img",{src:dish.photo, alt:dish.name?.ru||''});
            img.addEventListener('click',()=>{
              modal.querySelector('img').src=dish.photo;
              modal.style.display='flex';
            });
            tdPhoto.appendChild(img);
          } else tdPhoto.textContent="-";
          tr.appendChild(tdPhoto);
        }

        tbody.appendChild(tr);
      }
      table.appendChild(tbody);
    });
  }

})();