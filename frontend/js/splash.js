// Splash de abertura: mostra o logo animado, depois revela o app.
const HOLD_MS = 1800;

export function initSplash() {
    const splash = document.getElementById('splash');
    if (!splash) return;

    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const hold = reduce ? 300 : HOLD_MS;

    setTimeout(() => {
        splash.classList.add('is-hiding');
        splash.addEventListener('transitionend', () => splash.remove(), { once: true });
        // fallback caso a transição não dispare
        setTimeout(() => splash.remove(), 800);
    }, hold);
}
