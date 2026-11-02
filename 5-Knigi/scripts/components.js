async function loadComponent(selector, file) {
    try {
        const response = await fetch(file);
        const html = await response.text();
        document.querySelector(selector).outerHTML = html;
    } catch (error) {
        console.error(`Ошибка загрузки ${file}:`, error);
    }
}

document.addEventListener('DOMContentLoaded', async () => {
    await loadComponent('header', 'components/header.html');
    await loadComponent('footer', 'components/footer.html');
});