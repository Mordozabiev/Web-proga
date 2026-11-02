document.addEventListener('DOMContentLoaded', () => {
    setTimeout(renderBooks, 100);
});

let currentSort = 'date';
let isReversed = false;
let filterStatus = 'all';
let filterGenre = 'all';
let filterAuthor = 'all';

//Отрисовка карточек книг на главной странице
function renderBooks() {
    const main = document.querySelector('main');
    if (!main) return;

    let container = document.getElementById('booksContainer');
    
    if (!container) {
        main.innerHTML = `
            <div class="cont__center" style="width: 100%;">
                <h1>Мои книги</h1>
                <div class="controls-panel">
                    <select id="sortSelect">
                        <option value="date">По дате</option>
                        <option value="title">По названию</option>
                        <option value="author">По автору</option>
                        <option value="rating">По рейтингу</option>
                    </select>
                    <button id="reverseBtn" class="icon-btn" title="Перевернуть сортировку">⇅</button>
                    <select id="statusFilter">
                        <option value="all">Все статусы</option>
                        <option value="Прочитано">Прочитано</option>
                        <option value="В процессе">В процессе</option>
                        <option value="Запланировано">Запланировано</option>
                    </select>
                    <select id="genreFilter"><option value="all">Все жанры</option></select>
                    <select id="authorFilter"><option value="all">Все авторы</option></select>
                </div>
                <div id="booksContainer" class="books-grid"></div>
            </div>
        `;
        container = document.getElementById('booksContainer');

        document.getElementById('sortSelect').addEventListener('change', (e) => { currentSort = e.target.value; renderBooks(); });
        document.getElementById('reverseBtn').addEventListener('click', () => { isReversed = !isReversed; renderBooks(); });
        document.getElementById('statusFilter').addEventListener('change', (e) => { filterStatus = e.target.value; renderBooks(); });
        document.getElementById('genreFilter').addEventListener('change', (e) => { filterGenre = e.target.value; renderBooks(); });
        document.getElementById('authorFilter').addEventListener('change', (e) => { filterAuthor = e.target.value; renderBooks(); });
    }

    let books = JSON.parse(localStorage.getItem('books') || '[]');

    if (books.length === 0) {
        container.innerHTML = '<p style="color: #999;">Вы еще не добавили ни одной книги.</p>';
        return;
    }

    //Сбор уникальных данных для фильтров
    const fillSelect = (id, data) => {
        const select = document.getElementById(id);
        if (select.options.length <= 1) {
            data.forEach(item => {
                const opt = document.createElement('option');
                opt.value = item;
                opt.textContent = item;
                select.appendChild(opt);
            });
        }
    };
    fillSelect('genreFilter', [...new Set(books.map(b => b.genre))].sort());
    fillSelect('authorFilter', [...new Set(books.map(b => b.author))].sort());

    //Фильтрация
    if (filterStatus !== 'all') books = books.filter(b => b.status === filterStatus);
    if (filterGenre !== 'all') books = books.filter(b => b.genre === filterGenre);
    if (filterAuthor !== 'all') books = books.filter(b => b.author === filterAuthor);

    //Сортировка
    books.sort((a, b) => {
        let result = 0;

        if (currentSort === 'title') {
            result = a.title.localeCompare(b.title);
        } else if (currentSort === 'author') {
            result = a.author.localeCompare(b.author) || a.title.localeCompare(b.title);
        } else if (currentSort === 'rating') {
            result = (b.rating || 0) - (a.rating || 0) || a.title.localeCompare(b.title);
        } else {
            const getCategory = (book) => {
                if (book.status === 'Запланировано') return 1;
                if (book.status === 'В процессе') return 2;
                if (book.status === 'Прочитано') return 3;
                return 4;
            };

            const catA = getCategory(a);
            const catB = getCategory(b);

            if (catA !== catB) {
                result = catA - catB;
            } else {
                if (a.date && b.date) {
                    result = new Date(b.date) - new Date(a.date) || a.title.localeCompare(b.title);
                } else if (a.date) {
                    result = -1;
                } else if (b.date) {
                    result = 1;
                } else {
                    result = a.title.localeCompare(b.title);
                }
            }
        }

        return isReversed ? -result : result;
    });

    container.innerHTML = '';

    if (books.length === 0) {
        container.innerHTML = '<p style="color: #999;">По вашему запросу ничего не найдено.</p>';
        return;
    }

    //Создание карточки книги
    books.forEach(book => {
        const card = document.createElement('div');
        card.className = 'book-card';

        card.addEventListener('click', function (e) {
            if (e.target.closest('.edit-btn')) return;
            sessionStorage.setItem('viewBookId', book.id);
            window.location.href = 'book.html';
        });

        const editBtn = document.createElement('button');
        editBtn.className = 'edit-btn';
        editBtn.title = 'Редактировать';
        editBtn.addEventListener('click', function (e) {
            e.stopPropagation();
            sessionStorage.setItem('editBookId', book.id);
            sessionStorage.setItem('isEditing', 'true');
            window.location.href = 'add.html';
        });

        const cover = document.createElement('div');
        cover.className = 'book-cover';
        if (book.cover) {
            cover.style.backgroundImage = `url(${book.cover})`;
            cover.style.backgroundSize = 'cover';
            cover.style.backgroundPosition = 'center';
        } else {
            cover.textContent = book.title;
        }

        const info = document.createElement('div');
        info.className = 'book-info';

        const title = document.createElement('h3');
        title.textContent = book.title;

        const author = document.createElement('p');
        author.className = 'book-author';
        author.textContent = book.author;

        const genre = document.createElement('p');
        genre.className = 'book-genre';
        genre.textContent = book.genre;

        const meta = document.createElement('div');
        meta.className = 'book-meta';

        const status = document.createElement('span');
        status.className = 'book-status ' + book.status.toLowerCase().replace(' ', '-');
        status.textContent = book.status;

        const rating = document.createElement('span');
        rating.className = 'book-rating';
        rating.textContent = book.rating ? `★ ${book.rating}/10` : 'Без оценки';

        meta.append(status, rating);
        info.append(title, author, genre);

        if (book.date) {
            const date = document.createElement('p');
            date.className = 'book-date';
            date.textContent = 'Прочитано: ' + book.date; 
            info.append(date);
        }

        info.append(meta);
        card.append(editBtn, cover, info);
        container.appendChild(card);
    });
}