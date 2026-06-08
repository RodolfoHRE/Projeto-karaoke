// Render da tela Fila: lista, reordenar, remover, tocar agora.
import { subscribe, removeAt, move } from './store.js';
import { playSong } from './player.js';

export function initQueue() {
    const list = document.getElementById('queue');
    const empty = document.getElementById('queue-empty');
    const countEls = document.querySelectorAll('[data-queue-count]');

    subscribe(state => {
        // Contador no botão do menu.
        countEls.forEach(el => { el.textContent = String(state.queue.length); });

        empty.classList.toggle('is-hidden', state.queue.length > 0);
        list.innerHTML = '';

        state.queue.forEach((song, i) => {
            const li = document.createElement('li');
            li.className = 'queue__item';
            li.innerHTML = `
                <span class="queue__title"></span>
                <div class="queue__actions">
                    <button class="queue__btn" data-act="up" title="Subir">▲</button>
                    <button class="queue__btn" data-act="down" title="Descer">▼</button>
                    <button class="queue__btn queue__btn--play" data-act="play" title="Tocar agora">▶</button>
                    <button class="queue__btn queue__btn--del" data-act="del" title="Remover">✕</button>
                </div>`;
            li.querySelector('.queue__title').textContent = song.title;

            li.addEventListener('click', e => {
                const act = e.target.closest('[data-act]')?.dataset.act;
                if (act === 'up') move(i, -1);
                else if (act === 'down') move(i, 1);
                else if (act === 'del') removeAt(i);
                else if (act === 'play') { removeAt(i); playSong(song); }
            });

            list.appendChild(li);
        });
    });
}
