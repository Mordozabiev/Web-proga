let dragged = null;
const message = document.getElementById('message');

document.querySelectorAll('.cont-drag').forEach(function (card) {
    card.addEventListener('dragstart', function (e) {
        dragged = card;
        e.dataTransfer.setData('text/plain', '');
        card.classList.add('dragging');
    });
    card.addEventListener('dragend', function () {
        card.classList.remove('dragging');
        dragged = null;
    });
});

document.querySelectorAll('.drop .cont').forEach(function (cell) {
    cell.addEventListener('dragover', function (e) {
        e.preventDefault();
    });
    cell.addEventListener('drop', function (e) {
        e.preventDefault();
        if (!dragged) return;
        if (cell.querySelector('.cont-drag')) return;
        cell.appendChild(dragged);

        message.textContent = cell.classList.contains('penalty')
            ? 'Вы пропускаете ход'
            : '';
    });
});

const home = document.getElementById('home');
home.addEventListener('dragover', function (e) {
    e.preventDefault();
});
home.addEventListener('drop', function (e) {
    e.preventDefault();
    if (dragged) home.appendChild(dragged);
    message.textContent = '';
});

const sides = [1, 1, 1, 1, 1, 2, 3, 4, 5, 6];
document.getElementById('roll').addEventListener('click', function () {
    const value = sides[Math.floor(Math.random() * sides.length)];
    document.getElementById('dice-result').textContent = value;
});