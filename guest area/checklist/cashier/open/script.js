document.addEventListener('DOMContentLoaded', () => {
  const chat_id = '-1002915693964'; // твой Telegram чат ID
  const worker_url = 'https://shbb1.stassser.workers.dev/'; // твой Worker

  const buildMessage = (lang) => {
    const today = new Date();
    const date = `${String(today.getDate()).padStart(2,'0')}/${String(today.getMonth()+1).padStart(2,'0')}`;
    let message = `🧾 <b>${lang==='en'?'CHECKLIST':lang==='vi'?'DANH SÁCH':'ЧЕКЛИСТ'}</b>\n\n`;
    message += `📅 ${lang==='en'?'Date':lang==='vi'?'Ngày':'Дата'}: ${date}\n\n`;

    const checklist = document.querySelectorAll('#checklist input[type="checkbox"]');
    let selectedItems = [];
    checklist.forEach((item, index) => {
      if (item.checked) {
        selectedItems.push(`${index + 1}. ${item.dataset[lang]}`);
      }
    });

    if (selectedItems.length === 0) return null;

    message += selectedItems.join('\n');
    return message;
  };

  const sendMessage = (msg) => {
    return fetch(worker_url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id, text: msg })
    }).then(res => res.json());
  };

  const button = document.getElementById('sendBtn');
  button.addEventListener('click', async () => {
    const msgRu = buildMessage('ru');
    const msgEn = buildMessage('en');
    const msgVi = buildMessage('vi');

    if (!msgRu) {
      alert('Выберите хотя бы один пункт / Please select at least one item');
      return;
    }

    try {
      if (msgRu) await sendMessage(msgRu);
      if (msgEn) await sendMessage(msgEn);
      if (msgVi) await sendMessage(msgVi);
      alert('✅ ОТПРАВЛЕНО');
      document.querySelectorAll('#checklist input[type="checkbox"]').forEach(cb => cb.checked = false);
    } catch (err) {
      alert('❌ Ошибка при отправке: ' + err.message);
      console.error(err);
    }
  });
});