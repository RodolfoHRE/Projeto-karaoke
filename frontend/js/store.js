// Estado em memória: fila de músicas e música atual. Pub/sub simples.
// Uma música = { id (videoId do YouTube), title, thumb }.

const state = {
    queue: [],
    current: null,
    favorites: []      // [{ id, title, thumb }], persistido em arquivo via main (hydrateFavorites)
};

function persistFavorites() {
    window.karaoke?.saveFavorites?.(state.favorites);
}

// Carrega favoritos do arquivo (userData) na inicialização. Async: ao resolver,
// notifica os subscribers para re-renderizar a tela de Favoritos e os estados ★.
export async function hydrateFavorites() {
    const saved = await window.karaoke?.getFavorites?.();
    if (Array.isArray(saved)) {
        state.favorites = saved;
        notify();
    }
}

const listeners = new Set();

function notify() {
    for (const fn of listeners) fn(state);
}

export function subscribe(fn) {
    listeners.add(fn);
    fn(state);                       // dispara estado inicial
    return () => listeners.delete(fn);
}

export function getState() {
    return state;
}

export function enqueue(song) {
    state.queue.push(song);
    notify();
}

export function removeAt(index) {
    if (index < 0 || index >= state.queue.length) return;
    state.queue.splice(index, 1);
    notify();
}

export function move(index, delta) {
    const to = index + delta;
    if (to < 0 || to >= state.queue.length) return;
    const [item] = state.queue.splice(index, 1);
    state.queue.splice(to, 0, item);
    notify();
}

// Define a música atual. Se `song` vier de dentro da fila, removível por id.
export function setCurrent(song) {
    state.current = song;
    notify();
}

// Tira a próxima da fila e torna atual. Retorna a música ou null.
export function playNext() {
    const next = state.queue.shift() || null;
    state.current = next;
    notify();
    return next;
}

export function peekNext() {
    return state.queue[0] || null;
}

// ===== Favoritos (persistidos em localStorage) =====

export function isFavorite(id) {
    return state.favorites.some(s => s.id === id);
}

export function addFavorite(song) {
    if (!song || isFavorite(song.id)) return;
    state.favorites.push({ id: song.id, title: song.title, thumb: song.thumb });
    persistFavorites();
    notify();
}

export function removeFavorite(id) {
    state.favorites = state.favorites.filter(s => s.id !== id);
    persistFavorites();
    notify();
}

export function toggleFavorite(song) {
    if (isFavorite(song.id)) removeFavorite(song.id);
    else addFavorite(song);
}
