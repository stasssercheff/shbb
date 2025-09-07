let currentLang = 'ru';
const dataFiles = {
  breakfast: 'data/breakfast.json',
  soup: 'data/soup.json',
  salad: 'data/salad.json',
  main: 'data/main.json'
};

function createTable(sectionArray) {
  const table = document.createElement('table');
  table.classList.add('dish-table');

  const thead = document.createElement('thead');
  const headerRow = document.createElement('tr');
  ['№', currentLang==='ru'?'Ингредиент':'Ingredient', currentLang==='ru'?'Кол-во':'Amount', currentLang==='ru'?'Описание':'Description', currentLang==='ru'?'Фото':'Photo']
    .forEach(text => { const th = document.createElement('th'); th.textContent=text; headerRow.appendChild(th); });
  thead.appendChild(headerRow);
  table.appendChild(thead);

  const tbody = document.createElement('tbody');

  sectionArray.forEach(dish=>{
    const dishRow=document.createElement('tr');
    const tdDish=document.createElement('td');
    tdDish.colSpan=5;
    tdDish.style.fontWeight='600';
    tdDish.textContent=dish.name[currentLang];
    dishRow.appendChild(tdDish);
    tbody.appendChild(dishRow);

    dish.ingredients.forEach((ing,i)=>{
      const tr=document.createElement('tr');

      const tdNum=document.createElement('td'); tdNum.textContent=i+1;
      const tdName=document.createElement('td'); tdName.textContent=ing[currentLang];
      const tdAmount=document.createElement('td'); tdAmount.textContent=ing.amount||'';

      const tdDesc=document.createElement('td');
      if(i===0){ tdDesc.textContent=dish.process[currentLang]||''; tdDesc.rowSpan=dish.ingredients.length; }

      const tdPhoto=document.createElement('td');
      if(i===0 && dish.photo){ const img=document.createElement('img'); img.src=dish.photo; img.alt=dish.name[currentLang]; img.className='dish-photo'; tdPhoto.appendChild(img); tdPhoto.rowSpan=dish.ingredients.length; }

      tr.append(tdNum,tdName,tdAmount,tdDesc,tdPhoto);
      tbody.appendChild(tr);
    });
  });

  table.appendChild(tbody);
  return table;
}

async function loadSection(section){
  const panel=document.getElementById(section);
  document.querySelectorAll('.section-panel').forEach(p=>{
    if(p!==panel){ p.style.display='none'; p.innerHTML=''; }
  });

  if(panel.style.display==='block'){ panel.style.display='none'; panel.innerHTML=''; return; }

  panel.style.display='block'; panel.innerHTML='';

  try{
    const res=await fetch(dataFiles[section]);
    if(!res.ok) throw new Error('Ошибка загрузки JSON: '+section);
    const data=await res.json();

    const container=document.createElement('div');
    container.className='table-container';
    container.appendChild(createTable(data));
    panel.appendChild(container);
  }catch(err){ panel.innerHTML=`<p style="color:red">${err.message}</p>`; console.error(err); }
}

document.addEventListener('DOMContentLoaded',()=>{
  document.getElementById('current-date').textContent=new Date().toLocaleDateString();
  document.querySelectorAll('.section-btn').forEach(btn=>btn.addEventListener('click',()=>loadSection(btn.dataset.section)));
  document.querySelectorAll('.lang-btn').forEach(btn=>btn.addEventListener('click',()=>{
    currentLang=btn.dataset.lang;
    document.querySelectorAll('.section-panel').forEach(panel=>{
      if(panel.style.display==='block'){
        const section=panel.id;
        panel.innerHTML='';
        fetch(dataFiles[section]).then(r=>r.json()).then(data=>{
          const container=document.createElement('div');
          container.className='table-container';
          container.appendChild(createTable(data));
          panel.appendChild(container);
        });
      }
    });
  }));
});