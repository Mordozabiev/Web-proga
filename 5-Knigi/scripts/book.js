document.addEventListener('DOMContentLoaded', () => {
    setTimeout(renderBookDetail, 100);
});

//Отрисовка детальной страницы книги
function renderBookDetail() {
    const container = document.getElementById('book-detail-container');
    if (!container) return;

    const bookId = sessionStorage.getItem('viewBookId');
    const books = JSON.parse(localStorage.getItem('books') || '[]');
    const book = books.find(b => b.id === bookId);

    if (!book) {
        container.innerHTML = '<h1>Книга не найдена</h1><a href="index.html">Вернуться на главную</a>';
        return;
    }

    //Формирование HTML карточки
    const coverStyle = book.cover ? `background-image: url(${book.cover}); background-size: cover; background-position: center;` : '';
    const percent = book.pages > 0 ? Math.round((book.progress.read / book.pages) * 100) : 0;
    
    container.innerHTML = `
        <div class="detail-card">
            <div class="detail-cover" style="${coverStyle}">
                ${!book.cover ? book.title : ''}
            </div>
            <div class="detail-info">
                <button class="edit-btn large-edit" title="Редактировать"></button>
                
                <h1>${book.title}</h1>
                <h3>${book.author}</h3>
                <p class="detail-genre">Жанр: ${book.genre}</p>
                
                <div class="progress-block">
                    <span class="book-status ${book.status.toLowerCase().replace(' ', '-')}">${book.status}</span>
                    
                    <div class="progress-wrapper">
                        <div class="progress-bar" style="width: ${percent}%;"></div>
                        <span class="progress-text">${percent}%</span>
                    </div>
                    
                    <p class="progress-info">Прочитано ${book.progress.read} страниц из ${book.pages}</p>
                </div>

                ${book.date ? `<p><strong>Дата прочтения:</strong> ${book.date}</p>` : ''}
                
                <div class="detail-notes">
                    <h4>Заметки:</h4>
                    <p>${book.notes || 'Нет заметок'}</p>
                </div>

                <button onclick="window.location.href='index.html'" class="back-btn">Вернуться назад</button>
            </div>
        </div>
    `;

    container.querySelector('.large-edit').addEventListener('click', function() {
        sessionStorage.setItem('editBookId', book.id);
        sessionStorage.setItem('isEditing', 'true');
        window.location.href = 'add.html';
    });
}