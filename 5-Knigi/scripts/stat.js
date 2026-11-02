document.addEventListener('DOMContentLoaded', () => {
    setTimeout(renderStats, 100);
});

//Отрисовка страницы статистики
function renderStats() {
    const container = document.getElementById('stat-container');
    if (!container) return;

    const books = JSON.parse(localStorage.getItem('books') || '[]');

    if (books.length === 0) {
        container.innerHTML = '<h1>Статистика</h1><p style="color: #999; margin-top: 20px;">Пока нет данных для отображения. Добавьте книги.</p>';
        return;
    }

    const currentYear = new Date().getFullYear();
    const genreCounts = {};

    const stats = books.reduce((acc, book) => {
        acc.totalReadPages += book.progress.read || 0;
        
        if (book.rating) {
            acc.totalRating += book.rating;
            acc.ratedBooksCount++;
        }
        if (book.genre) {
            genreCounts[book.genre] = (genreCounts[book.genre] || 0) + 1;
        }
        if (book.date && new Date(book.date).getFullYear() === currentYear) {
            acc.booksThisYear++;
        }
        return acc;
    }, { totalReadPages: 0, ratedBooksCount: 0, totalRating: 0, booksThisYear: 0 });

    const averageRating = stats.ratedBooksCount > 0 ? (stats.totalRating / stats.ratedBooksCount).toFixed(1) : '0.0';
    
    //Сортировка жанров по популярности, убывание
    const sortedGenres = Object.entries(genreCounts).sort((a, b) => b[1] - a[1]);
    const maxGenreCount = sortedGenres.length > 0 ? sortedGenres[0][1] : 1;

    //Генерация HTML для графиков жанров
    const genresHTML = sortedGenres.map(([genre, count]) => {
        const percent = Math.round((count / maxGenreCount) * 100);
        return `
            <div class="stat-bar-row">
                <span class="stat-bar-label">${genre}</span>
                <div class="stat-bar-wrapper">
                    <div class="stat-bar-fill" style="width: ${percent}%;"></div>
                    <span class="stat-bar-value">${count}</span>
                </div>
            </div>
        `;
    }).join('');

    container.innerHTML = `
        <h1>Статистика</h1>
        
        <div class="stats-grid">
            <div class="stat-card">
                <div class="stat-value">${stats.totalReadPages}</div>
                <div class="stat-title">Прочитано страниц</div>
            </div>
            <div class="stat-card">
                <div class="stat-value">${stats.booksThisYear}</div>
                <div class="stat-title">Прочитано в ${currentYear} году</div>
            </div>
            <div class="stat-card">
                <div class="stat-value">${averageRating} / 10</div>
                <div class="stat-title">Средний рейтинг</div>
            </div>
            <div class="stat-card">
                <div class="stat-value">${books.length}</div>
                <div class="stat-title">Всего книг в базе</div>
            </div>
        </div>

        <div class="stat-section">
            <h2>Книги по жанрам</h2>
            <div class="genres-charts">
                ${genresHTML || '<p style="color: #999;">Жанры не указаны.</p>'}
            </div>
        </div>
    `;
}