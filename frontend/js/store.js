// Estado em memória: fila de músicas e música atual. Pub/sub simples.
// Uma música = { id (videoId do YouTube), title, thumb }.

const state = {
    queue: [],
    current: null
};

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
