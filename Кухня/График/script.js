const tbody = document.getElementById("schedule-body");

staff.forEach((group, groupIndex) => {
    group.names.forEach((name,i)=>{
        const tr = document.createElement("tr");

        // Первая колонка — имя
        const tdName = document.createElement("td");
        tdName.textContent = `${group.role}: ${name}`;
        tdName.classList.add("fixed-column","name-cell");
        tr.appendChild(tdName);

        for(let j=0;j<totalDays;j++){
            const td = document.createElement("td");
            let work = 0;
            if(group.role === "Шеф") work = group.schedule[j % 7];
            else if(group.role === "Кухня") {
                const offset = group.offset[i];
                work = group.schedule[(j+offset)%6];
            } else {
                work = 0; // десерты пока пусто
            }
            td.textContent = work;
            tr.appendChild(td);
        }

        tbody.appendChild(tr);
    });

    // Добавляем визуальный разрыв после каждой группы, кроме последней
    if(groupIndex < staff.length - 1){
        const separator = document.createElement("tr");
        const td = document.createElement("td");
        td.colSpan = totalDays + 1; // +1 за столбец с именем
        td.style.background = "#ccc";
        td.style.height = "4px";
        td.style.padding = "0";
        separator.appendChild(td);
        tbody.appendChild(separator);
    }
});
