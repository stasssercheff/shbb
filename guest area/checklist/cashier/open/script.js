document.addEventListener("DOMContentLoaded", () => {
  console.log("✅ script.js загружен");

  // --- ЛОГИКА ЧЕКЛИСТА ---
  const sendBtn = document.getElementById("sendBtn");
  const resultDiv = document.getElementById("result");

  if (sendBtn) {
    sendBtn.addEventListener("click", () => {
      const checklistItems = document.querySelectorAll("#checklist input[type='checkbox']");
      let completed = [];
      let notCompleted = [];

      checklistItems.forEach((item) => {
        const label = item.parentElement.querySelector("label").textContent.trim();
        if (item.checked) {
          completed.push(label);
        } else {
          notCompleted.push(label);
        }
      });

      // Формируем текст результата
      let resultText = "";
      if (completed.length > 0) {
        resultText += `✅ Выполнено:\n- ${completed.join("\n- ")}\n\n`;
      }
      if (notCompleted.length > 0) {
        resultText += `❌ Осталось сделать:\n- ${notCompleted.join("\n- ")}`;
      }

      resultDiv.textContent = resultText || "Все задачи выполнены!";
    });
  }
});
