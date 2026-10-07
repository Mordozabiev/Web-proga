const taskInput = document.getElementById('taskInput');
const addBtn = document.getElementById('addBtn');
const stickers = document.getElementById('stickers');
const board = document.getElementById('board');

const STICKER_IMAGES = [
    'images/sticker1.png',
    'images/sticker2.png',
    'images/sticker3.png',
    'images/sticker4.png',
    'images/sticker5.png'
];

let dragged = null;
let offsetX = 0;
let offsetY = 0;

function rand(min, max) {
    return Math.random() * (max - min) + min;
}

function clampSticker(sticker, x, y) {
    const p = sticker.parentElement;
    const maxX = p.clientWidth - sticker.offsetWidth;
    const maxY = p.clientHeight - sticker.offsetHeight;
    sticker.style.left = Math.max(0, Math.min(x, maxX)) + 'px';
    sticker.style.top = Math.max(0, Math.min(y, maxY)) + 'px';
}

function addTask() {
    const text = taskInput.value.trim();
    if (!text) return;

    const sticker = document.createElement('div');
    sticker.className = 'sticker';
    sticker.style.backgroundImage = `url('${STICKER_IMAGES[Math.floor(Math.random() * STICKER_IMAGES.length)]}')`;
    sticker.style.transform = `rotate(${rand(-10, 10)}deg)`;

    const span = document.createElement('span');
    span.textContent = text;

    const del = document.createElement('button');
    del.className = 'delete-btn';
    del.textContent = '×';
    del.addEventListener('click', function (e) {
        e.stopPropagation();
        sticker.remove();
    });

    sticker.append(span, del);
    sticker.addEventListener('mousedown', startDrag);
    stickers.appendChild(sticker);

    const n = stickers.querySelectorAll('.sticker').length - 1;
    clampSticker(sticker, 15 + (n % 4) * 20, 60 + (n % 8) * 25);

    taskInput.value = '';
    taskInput.focus();
}

function startDrag(e) {
    if (e.target.classList.contains('delete-btn')) return;
    dragged = e.currentTarget;
    const r = dragged.getBoundingClientRect();
    offsetX = e.clientX - r.left;
    offsetY = e.clientY - r.top;
    dragged.classList.add('dragging');
    e.preventDefault();
}

document.addEventListener('mousemove', function (e) {
    if (!dragged) return;
    const r = dragged.parentElement.getBoundingClientRect();
    clampSticker(dragged, e.clientX - r.left - offsetX, e.clientY - r.top - offsetY);
});

document.addEventListener('mouseup', function (e) {
    if (!dragged) return;
    dragged.classList.remove('dragging');

    const r = board.getBoundingClientRect();
    const overBoard = e.clientX >= r.left && e.clientX <= r.right &&
                      e.clientY >= r.top && e.clientY <= r.bottom;

    const target = overBoard ? board : stickers;

    if (target !== dragged.parentElement) {
        const tr = target.getBoundingClientRect();
        target.appendChild(dragged);
        clampSticker(dragged, e.clientX - tr.left - offsetX, e.clientY - tr.top - offsetY);
    }

    dragged = null;
});

document.querySelectorAll('.clear-btn').forEach(function (btn) {
    btn.addEventListener('click', function () {
        document.getElementById(btn.dataset.target)
            .querySelectorAll('.sticker')
            .forEach(s => s.remove());
    });
});

addBtn.addEventListener('click', addTask);
taskInput.addEventListener('keydown', e => { if (e.key === 'Enter') addTask(); });