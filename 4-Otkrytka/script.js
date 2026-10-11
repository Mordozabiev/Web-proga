const textInput = document.getElementById('text');
const fromInput = document.getElementById('from');
const toInput = document.getElementById('to');
const themeSelect = document.getElementById('theme');
const sendBtn = document.getElementById('send');
const history = document.getElementById('history');

let cards = JSON.parse(localStorage.getItem('cards') || '[]');

function updateButton() {
    sendBtn.disabled = !(textInput.value.trim() && fromInput.value.trim() && toInput.value.trim());
}

function save() {
    localStorage.setItem('cards', JSON.stringify(cards));
}

function renderCard(card) {
    const div = document.createElement('div');
    div.className = 'card ' + card.theme;

    const p = document.createElement('p');
    p.textContent = card.text;

    const small = document.createElement('small');
    small.textContent = 'От: ' + card.from + ' — Кому: ' + card.to;

    div.append(p, small);
    history.appendChild(div);
}

function renderAll() {
    history.innerHTML = '';

    if (!cards.length) {
        const msg = document.createElement('p');
        msg.className = 'empty';
        msg.textContent = 'Пока открыток нет';
        history.appendChild(msg);
        return;
    }

    cards.forEach(renderCard);
}

function addCard() {
    cards.push({
        text: textInput.value.trim(),
        from: fromInput.value.trim(),
        to: toInput.value.trim(),
        theme: themeSelect.value
    });

    save();
    renderAll();

    textInput.value = '';
    fromInput.value = '';
    toInput.value = '';
    updateButton();
    textInput.focus();
}

function clearAll() {
    cards = [];
    localStorage.removeItem('cards');
    renderAll();
}

[textInput, fromInput, toInput].forEach(inp => inp.addEventListener('input', updateButton));

sendBtn.addEventListener('click', addCard);
document.getElementById('clear').addEventListener('click', clearAll);

renderAll();