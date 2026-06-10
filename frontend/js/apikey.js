// Dono da "chave efetiva" da YouTube Data API no renderer.
// Precedência: chave do usuário (userData) > chave do .env (window.karaoke.ytApiKey).
// A chave do usuário é persistida em arquivo pelo processo principal (IPC).

const envKey = () => (window.karaoke && window.karaoke.ytApiKey) || '';

let currentKey = envKey();

export function getKey() {
    return currentKey;
}

export function hasKey() {
    return Boolean(currentKey);
}

// Carrega a chave do usuário do arquivo. Se existir, sobrepõe a do .env.
export async function hydrateKey() {
    const saved = await window.karaoke?.getApiKey?.();
    if (saved) currentKey = saved;
}

export async function saveKey(k) {
    currentKey = k;
    await window.karaoke?.saveApiKey?.(k);
}

// Remove a chave do usuário; volta a valer a do .env (se houver).
export async function clearKey() {
    currentKey = envKey();
    await window.karaoke?.saveApiKey?.('');
}

// Valida uma chave fazendo 1 busca mínima. Retorna { ok } ou { ok:false, msg }.
export async function validateKey(k) {
    const key = (k || '').trim();
    if (!key) return { ok: false, msg: 'Cole uma chave primeiro.' };

    const url = new URL('https://www.googleapis.com/youtube/v3/search');
    url.searchParams.set('part', 'snippet');
    url.searchParams.set('type', 'video');
    url.searchParams.set('maxResults', '1');
    url.searchParams.set('q', 'teste');
    url.searchParams.set('key', key);

    let res;
    try {
        res = await fetch(url);
    } catch {
        return { ok: false, msg: 'Sem conexão para validar.' };
    }
    if (res.ok) return { ok: true };

    let reason = '';
    try {
        const data = await res.json();
        reason = data?.error?.errors?.[0]?.reason || data?.error?.status || '';
    } catch { /* corpo não-JSON */ }

    if (res.status === 400 || reason === 'keyInvalid' || reason === 'badRequest') {
        return { ok: false, msg: 'Chave inválida.' };
    }
    if (res.status === 403) {
        if (reason === 'accessNotConfigured' || reason === 'SERVICE_DISABLED') {
            return { ok: false, msg: 'API YouTube Data v3 não habilitada nesse projeto.' };
        }
        if (reason === 'quotaExceeded' || reason === 'dailyLimitExceeded') {
            return { ok: false, msg: 'Cota da chave esgotada (tente amanhã).' };
        }
        return { ok: false, msg: 'Chave sem permissão (verifique restrições).' };
    }
    return { ok: false, msg: `Erro ao validar: ${res.status}.` };
}
