const form = document.getElementById('addForm');
const submitBtn = form.querySelector('button[type="submit"]');
const formTitle = document.getElementById('formTitle');
const dropZone = document.getElementById('drop-zone');
const dropText = document.getElementById('drop-text');
const fileInput = document.getElementById('cover-file');
const removeCoverBtn = document.getElementById('remove-cover');
const deleteBtn = document.getElementById('delete-btn');
let coverBase64 = null;

const isEditing = sessionStorage.getItem('isEditing') === 'true';
const editId = isEditing ? sessionStorage.getItem('editBookId') : null;
const draftKey = isEditing ? 'draft_edit_' + editId : 'draft_add';

const rules = {
    title: { regex: /^.{2,200}$/s, msg: 'От 2 до 200 символов' },
    author: { regex: /^[a-zа-яё \*]{2,100}$/i, msg: 'Только буквы от 2 до 100 и пробелы' },
    genre: { regex: /^[a-zа-яё ]{2,50}$/i, msg: 'Только буквы от 2 до 50 и пробелы' },
    count: { regex: /^(?:[1-9]\d{0,3}|10000)$/, msg: 'Число от 1 до 10000' },
    rcount: { regex: /^(?:[0-9]\d{0,3}|10000)$/, msg: 'Число от 0 до 10000' },
    date: { regex: /^.*$/, msg: '' },
    rating: { regex: /^(?:[1-9]|10)?$/, msg: 'Число от 1 до 10 или оставьте пустым' },
    note: { regex: /^.{0,1000}$/s, msg: 'До 1000 символов' }
};

//Восстановление данных при загрузке страницы
function initForm() {
    let dataToFill = null;

    if (isEditing) {
        form.classList.add('is-editing');
        submitBtn.textContent = 'Изменить книгу';
        if (formTitle) formTitle.textContent = 'Изменить книгу';

        const savedDraft = localStorage.getItem(draftKey);
        if (savedDraft) {
            dataToFill = JSON.parse(savedDraft);
        } else {
            const books = JSON.parse(localStorage.getItem('books') || '[]');
            const book = books.find(b => b.id === editId);
            if (book) {
                dataToFill = {
                    title: book.title, author: book.author, genre: book.genre,
                    count: book.pages, rcount: book.progress.read,
                    rating: book.rating, note: book.notes, cover: book.cover, date: book.date
                };
            }
        }
    } else {
        const draft = localStorage.getItem(draftKey);
        if (draft) dataToFill = JSON.parse(draft);
    }

    if (dataToFill) {
        for (const key in dataToFill) {
            if (key === 'cover' && dataToFill[key]) {
                coverBase64 = dataToFill[key];
                dropZone.classList.add('has-file');
                dropText.textContent = 'Фото загружено';
                removeCoverBtn.style.display = 'flex';
            } else if (form.elements[key] && dataToFill[key] !== null) {
                form.elements[key].value = dataToFill[key];
            }
        }
    }
}

initForm();

//Сохранение черновика в процессе ввода текста
form.addEventListener('input', function(e) {
    const name = e.target.name;
    if (!rules[name]) return;

    const input = e.target;
    const errEl = document.getElementById('err-' + name);
    const valid = rules[name].regex.test(input.value);
    
    errEl.textContent = valid ? '' : rules[name].msg;
    
    input.classList.toggle('invalid', !valid);
});

dropZone.addEventListener('click', () => fileInput.click());
dropZone.addEventListener('dragover', (e) => {
    e.preventDefault();
    dropZone.classList.add('dragover');
});
dropZone.addEventListener('dragleave', () => dropZone.classList.remove('dragover'));
dropZone.addEventListener('drop', (e) => {
    e.preventDefault();
    dropZone.classList.remove('dragover');
    if (e.dataTransfer.files.length > 0) handleFile(e.dataTransfer.files[0]);
});

fileInput.addEventListener('change', () => {
    if (fileInput.files.length > 0) handleFile(fileInput.files[0]);
});

form.addEventListener('submit', function (e) {
    e.preventDefault();
    let ok = true;

    for (const name in rules) {
        const input = form.elements[name];
        const errEl = document.getElementById('err-' + name);
        const valid = rules[name].regex.test(input.value);
        errEl.textContent = valid ? '' : rules[name].msg;
        if (!valid) ok = false;
    }

    const count = parseInt(form.elements['count'].value) || 0;
    const rcount = parseInt(form.elements['rcount'].value) || 0;
    if (rcount > count) {
        document.getElementById('err-rcount').textContent = 'Не может быть больше общего числа страниц';
        ok = false;
    }

    if (ok) {
        let books = JSON.parse(localStorage.getItem('books') || '[]');

        if (isEditing) books = books.filter(b => b.id !== editId);

        const values = Object.fromEntries(new FormData(form).entries());
        
        const newBook = {
            id: editId || Date.now().toString(),
            title: values.title.trim(), author: values.author.trim(), genre: values.genre.trim(),
            pages: count,
            status: rcount === count ? 'Прочитано' : (rcount > 0 ? 'В процессе' : 'Запланировано'),
            rating: values.rating ? parseInt(values.rating) : null,
            notes: values.note.trim(), cover: coverBase64, date: values.date,
            quotes: [], progress: { read: rcount, total: count }
        };

        books.push(newBook);
        localStorage.setItem('books', JSON.stringify(books));
        localStorage.removeItem(draftKey);
        sessionStorage.removeItem('editBookId');
        sessionStorage.removeItem('isEditing');
        window.location.href = 'index.html';
    }
});

//Удаления обложки
removeCoverBtn.addEventListener('click', function(e) {
    e.stopPropagation();
    coverBase64 = null;
    fileInput.value = '';
    dropZone.classList.remove('has-file');
    dropText.textContent = 'Перетащите сюда фото';
    removeCoverBtn.style.display = 'none';
    form.dispatchEvent(new Event('input'));
});

//Чтения файла и сохранения его в переменную
function handleFile(file) {
    if (!['image/jpeg', 'image/jpg', 'image/png'].includes(file.type)) {
        document.getElementById('err-cover').textContent = 'Только JPG или PNG';
        return;
    }
    document.getElementById('err-cover').textContent = '';

    const reader = new FileReader();
    reader.onload = function(event) {
        coverBase64 = event.target.result;
        dropZone.classList.add('has-file');
        dropText.textContent = 'Фото загружено';
        removeCoverBtn.style.display = 'flex';
        form.dispatchEvent(new Event('input'));
    };
    reader.readAsDataURL(file);
}

// Удаление книги
deleteBtn.addEventListener('click', function() {
    if (confirm('Вы уверены, что хотите удалить эту книгу?')) {
        let books = JSON.parse(localStorage.getItem('books') || '[]');
        books = books.filter(b => b.id !== editId);
        localStorage.setItem('books', JSON.stringify(books));
        
        localStorage.removeItem(draftKey);
        sessionStorage.removeItem('editBookId');
        sessionStorage.removeItem('isEditing');
        
        window.location.href = 'index.html';
    }
});