// Router SPA: mostra uma <section data-screen> por vez.
const screens = new Map();
let current = null;

export function initRouter() {
    document.querySelectorAll('[data-screen]').forEach(el => {
        screens.set(el.dataset.screen, el);
        if (el.classList.contains('is-active')) current = el.dataset.screen;
    });

    // Qualquer elemento com data-nav="<tela>" navega ao ser clicado.
    document.addEventListener('click', e => {
        const target = e.target.closest('[data-nav]');
        if (target) go(target.dataset.nav);
    });
}

export function go(name) {
    const next = screens.get(name);
    if (!next || name === current) return;
    if (current) screens.get(current).classList.remove('is-active');
    next.classList.add('is-active');
    current = name;
    document.dispatchEvent(new CustomEvent('screen:change', { detail: { name } }));
}

export function currentScreen() {
    return current;
}
