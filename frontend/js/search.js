// Busca de músicas no YouTube.
// - Se o texto for um link/ID do YouTube: resolve direto, sem chave.
// - Caso contrário: usa a YouTube Data API v3 (precisa de chave).
// A chave efetiva (usuário > .env) vem de apikey.js.
import { getKey, hasKey } from './apikey.js';

export { hasKey as hasApiKey };

const ID_RE = /^[a-zA-Z0-9_-]{11}$/;

// Extrai o videoId de um link do YouTube ou de um ID puro. Retorna null se não for.
export function parseVideoId(text) {
    const t = text.trim();
    if (ID_RE.test(t)) return t;
    try {
        const url = new URL(t);
        if (url.hostname === 'youtu.be') {
            const id = url.pathname.slice(1);
            return ID_RE.test(id) ? id : null;
        }
        if (url.hostname.includes('youtube.com')) {
            const v = url.searchParams.get('v');
            if (v && ID_RE.test(v)) return v;
            const parts = url.pathname.split('/');     // /embed/<id>, /shorts/<id>
            const last = parts[parts.length - 1];
            return ID_RE.test(last) ? last : null;
        }
    } catch { /* não é URL */ }
    return null;
}

const thumbFor = id => `https://i.ytimg.com/vi/${id}/mqdefault.jpg`;

// Busca por texto. Retorna array de { id, title, thumb }.
// Lança Error('no-key') se faltar a chave e o texto não for um link/ID.
export async function search(query) {
    const directId = parseVideoId(query);
    if (directId) {
        return [{ id: directId, title: `Vídeo ${directId}`, thumb: thumbFor(directId) }];
    }

    const key = getKey();
    if (!key) {
        const err = new Error('no-key');
        err.code = 'no-key';
        throw err;
    }

    const url = new URL('https://www.googleapis.com/youtube/v3/search');
    url.searchParams.set('part', 'snippet');
    url.searchParams.set('type', 'video');
    url.searchParams.set('videoEmbeddable', 'true');   // só vídeos que podem ser embutidos
    url.searchParams.set('maxResults', '15');
    url.searchParams.set('q', `${query} karaoke`);
    url.searchParams.set('key', key);

    const res = await fetch(url);
    if (!res.ok) throw new Error(`API ${res.status}`);
    const data = await res.json();

    return (data.items || []).map(item => ({
        id: item.id.videoId,
        title: item.snippet.title,
        thumb: item.snippet.thumbnails?.medium?.url || thumbFor(item.id.videoId)
    }));
}
