// Tela Configurações / wizard de setup da chave da YouTube API.
// Mesma tela serve aos dois: banner+pular aparecem quando não há chave;
// com chave salva, mostra o estado "configurada" + remover.
import { go } from './router.js';
import { getKey, hasKey, saveKey, clearKey, validateKey } from './apikey.js';

const CLOUD_URL = 'https://console.cloud.google.com/flows/enableapi?apiid=youtube.googleapis.com';

function mask(key) {
    if (!key) return '';
    return key.length <= 4 ? '••••' : `••••…${key.slice(-4)}`;
}

export function initConfig() {
    const welcome = document.getElementById('config-welcome');
    const skip = document.getElementById('config-skip');
    const current = document.getElementById('config-current');
    const currentLabel = document.getElementById('config-current-label');
    const form = document.getElementById('config-form');
    const input = document.getElementById('config-key');
    const status = document.getElementById('config-status');
    const searchHint = document.getElementById('search-hint');

    function refreshUI() {
        const has = hasKey();
        welcome.classList.toggle('is-hidden', has);
        skip.classList.toggle('is-hidden', has);
        current.classList.toggle('is-hidden', !has);
        if (has) currentLabel.textContent = `✓ Chave configurada (${mask(getKey())})`;
    }

    document.getElementById('config-open-cloud').addEventListener('click', () => {
        window.karaoke?.openExternal?.(CLOUD_URL);
    });

    skip.addEventListener('click', () => go('menu'));

    form.addEventListener('submit', async e => {
        e.preventDefault();
        const k = input.value.trim();
        const wasFirstRun = !hasKey();

        status.className = 'config__status';
        status.textContent = 'Validando…';

        const result = await validateKey(k);
        if (!result.ok) {
            status.classList.add('config__status--err');
            status.textContent = `✗ ${result.msg}`;
            return;
        }

        await saveKey(k);
        input.value = '';
        status.classList.add('config__status--ok');
        status.textContent = '✓ Chave válida e salva!';
        if (searchHint) searchHint.textContent = '';   // limpa aviso de "sem chave" na busca
        refreshUI();

        if (wasFirstRun) go('menu');
    });

    document.getElementById('config-remove').addEventListener('click', async () => {
        await clearKey();
        status.className = 'config__status';
        status.textContent = '';
        if (searchHint && !hasKey()) {
            searchHint.textContent = 'Busca por texto desativada (sem chave da API). Cole um link/ID do YouTube.';
        }
        refreshUI();
    });

    refreshUI();
}
