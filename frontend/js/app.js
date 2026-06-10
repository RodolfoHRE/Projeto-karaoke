// Bootstrap: liga router, player, fila, busca e favoritos.
import { initRouter, go } from './router.js';
import { initSplash } from './splash.js';
import { initQueue } from './queue.js';
import { initFavorites } from './favorites.js';
import { initPlayer, playSong } from './player.js';
import { enqueue, getState, peekNext, removeAt, toggleFavorite, isFavorite, hydrateFavorites } from './store.js';
import { search } from './search.js';
import { hasKey, hydrateKey } from './apikey.js';
import { initConfig } from './config.js';

function initSearch() {
    const form = document.getElementById('search-form');
    const input = document.getElementById('search-input');
    const hint = document.getElementById('search-hint');
    const results = document.getElementById('results');

    if (!hasKey()) {
        hint.textContent = 'Busca por texto desativada (sem chave da API). Configure em Configurações ou cole um link/ID do YouTube.';
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
                <button class="result__btn result__btn--fav" data-act="fav" title="Favoritar">★</button>
            </div>`;
        li.querySelector('.result__thumb').src = song.thumb;
        li.querySelector('.result__title').textContent = song.title;
        const favBtn = li.querySelector('[data-act="fav"]');
        favBtn.classList.toggle('is-active', isFavorite(song.id));
        li.addEventListener('click', e => {
            const act = e.target.closest('[data-act]')?.dataset.act;
            if (act === 'play') playSong(song);
            else if (act === 'queue') enqueue(song);
            else if (act === 'fav') {
                toggleFavorite(song);
                favBtn.classList.toggle('is-active', isFavorite(song.id));
            }
        });
        container.appendChild(li);
    }
}

// "Cantar agora": fila com músicas → toca a 1ª; fila vazia → vai pra busca com aviso.
function initMenu() {
    const btn = document.getElementById('btn-cantar');
    btn.addEventListener('click', () => {
        if (getState().queue.length) {
            const first = peekNext();
            removeAt(0);
            playSong(first);
        } else {
            go('busca');
            document.getElementById('search-hint').textContent =
                'Fila vazia. Busque uma música para começar a cantar.';
        }
    });
}

// Botões da titlebar custom (janela frameless).
function initTitlebar() {
    document.getElementById('win-min').addEventListener('click', () => window.karaoke?.win?.minimize());
    document.getElementById('win-max').addEventListener('click', () => window.karaoke?.win?.toggleMax());
    document.getElementById('win-close').addEventListener('click', () => window.karaoke?.win?.close());
}

async function boot() {
    await hydrateKey();    // carrega a chave salva antes de decidir hint/gate
    initTitlebar();
    initSplash();
    initRouter();
    initQueue();
    initFavorites();
    initSearch();
    initMenu();
    initConfig();
    initPlayer();          // assíncrono; carrega a IFrame API em segundo plano
    hydrateFavorites();    // carrega favoritos do arquivo; notifica ao resolver

    if (!hasKey()) go('config');   // 1º uso sem chave: abre o wizard
}

boot();
