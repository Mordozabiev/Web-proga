const form = document.getElementById('regForm');

const rules = {
    fio: {
        regex: /^[A-Za-zА-Яа-яЁё\s]+$/,
        msg: 'Только буквы и пробел'
    },
    login: {
        regex: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d.*\d.*\d)(?=.*[^A-Za-z0-9]).{15,}$/,
        msg: 'Латиница, есть заглавные и строчные, 3 цифры, спецсимвол, минимум 15 символов'
    },
    email: {
        regex: /^[A-Za-z]+@[A-Za-z]+\.[A-Za-z]+$/,
        msg: 'Только латиница, формат имя@домен.зона'
    },
    age: {
        regex: /^(1[89]|[2-9]\d)$/,
        msg: 'Возраст от 18 до 99'
    },
    password: {
        regex: /^(?=.*[а-яё])(?=.*[А-ЯЁ])(?=.*\d.*\d.*\d)(?=.*[^А-Яа-я0-9]).{15,}$/,
        msg: 'Кириллица, есть заглавные и строчные, 3 цифры, спецсимвол, минимум 15 символов'
    }
};

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

    document.body.classList.toggle('error-bg', !ok);

    if (ok) {
        window.location.href = 'register.html';
    }
});