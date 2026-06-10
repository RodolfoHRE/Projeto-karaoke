// Render da tela Favoritos: lista músicas marcadas, tocar/enfileirar/desfavoritar.
// Reaproveita o markup .result da busca e o pub/sub do store.
import { subscribe, enqueue, removeFavorite } from './store.js';
import { playSong } from './player.js';

export function initFavorites() {
    const list = document.getElementById('favorites');
    const empty = document.getElementById('favorites-empty');

    subscribe(state => {
        empty.classList.toggle('is-hidden', state.favorites.length > 0);
        list.innerHTML = '';

        state.favorites.forEach(song => {
            const li = document.createElement('li');
            li.className = 'result';
            li.innerHTML = `
                <img class="result__thumb" alt="">
                <span class="result__title"></span>
                <div class="result__actions">
                    <button class="result__btn result__btn--play" data-act="play">▶ Tocar</button>
                    <button class="result__btn" data-act="queue">+ Fila</button>
                    <button class="result__btn result__btn--fav is-active" data-act="unfav" title="Remover dos favoritos">★</button>
                </div>`;
            li.querySelector('.result__thumb').src = song.thumb;
            li.querySelector('.result__title').textContent = song.title;

            li.addEventListener('click', e => {
                const act = e.target.closest('[data-act]')?.dataset.act;
                if (act === 'play') playSong(song);
                else if (act === 'queue') enqueue(song);
                else if (act === 'unfav') removeFavorite(song.id);
            });

            list.appendChild(li);
        });
    });
}
