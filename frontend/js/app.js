// Bootstrap: liga router, player, fila e a tela de busca.
import { initRouter } from './router.js';
import { initSplash } from './splash.js';
import { initQueue } from './queue.js';
import { initPlayer, playSong } from './player.js';
import { enqueue } from './store.js';
import { search, hasApiKey } from './search.js';

function initSearch() {
    const form = document.getElementById('search-form');
    const input = document.getElementById('search-input');
    const hint = document.getElementById('search-hint');
    const results = document.getElementById('results');

    if (!hasApiKey()) {
        hint.textContent = 'Busca por texto desativada (sem chave da API). Cole um link/ID do YouTube.';
    }

    form.addEventListener('submit', async e => {
        e.preventDefault();
        const q = input.value.trim();
        if (!q) return;

        hint.textContent = 'Buscando…';
        results.innerHTML = '';
        try {
            const songs = await search(q);
            hint.textContent = songs.length ? '' : 'Nenhum resultado.';
            renderResults(results, songs);
        } catch (err) {
            hint.textContent = err.code === 'no-key'
                ? 'Sem chave da API: digite um link/ID do YouTube para tocar.'
                : `Erro na busca: ${err.message}`;
        }
    });
}

function renderResults(container, songs) {
    container.innerHTML = '';
    for (const song of songs) {
        const li = document.createElement('li');
        li.className = 'result';
        li.innerHTML = `
            <img class="result__thumb" alt="">
            <span class="result__title"></span>
            <div class="result__actions">
                <button class="result__btn result__btn--play" data-act="play">▶ Tocar</button>
                <button class="result__btn" data-act="queue">+ Fila</button>
            </div>`;
        li.querySelector('.result__thumb').src = song.thumb;
        li.querySelector('.result__title').textContent = song.title;
        li.addEventListener('click', e => {
            const act = e.target.closest('[data-act]')?.dataset.act;
            if (act === 'play') playSong(song);
            else if (act === 'queue') enqueue(song);
        });
        container.appendChild(li);
    }
}

initSplash();
initRouter();
initQueue();
initSearch();
initPlayer();          // assíncrono; carrega a IFrame API em segundo plano
