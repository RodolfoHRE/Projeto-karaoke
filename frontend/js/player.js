// Player do YouTube via IFrame Player API (não precisa de chave para tocar).
import { setCurrent, playNext, peekNext, getState } from './store.js';
import { go } from './router.js';

let yt = null;          // instância YT.Player
let ready = false;
let pending = null;     // videoId aguardando a API carregar

// Carrega a IFrame API uma única vez e cria o player no host.
function loadApi() {
    return new Promise(resolve => {
        if (window.YT && window.YT.Player) return resolve();
        const tag = document.createElement('script');
        tag.src = 'https://www.youtube.com/iframe_api';
        window.onYouTubeIframeAPIReady = () => resolve();
        document.head.appendChild(tag);
    });
}

export async function initPlayer() {
    await loadApi();
    yt = new window.YT.Player('player-host', {
        width: '100%',
        height: '100%',
        playerVars: { autoplay: 1, rel: 0, modestbranding: 1, origin: window.location.origin },
        events: {
            onReady: () => {
                ready = true;
                if (pending) { yt.loadVideoById(pending); pending = null; }
            },
            onStateChange: e => {
                // 0 = ended → toca a próxima da fila automaticamente.
                if (e.data === window.YT.PlayerState.ENDED) skip();
            },
            onError: e => onError(e.data)
        }
    });

    bindControls();
}

// Toca uma música (objeto { id, title, thumb }) e vai para a tela do player.
export function playSong(song) {
    if (!song) return;
    setCurrent(song);
    go('player');
    if (ready && yt) yt.loadVideoById(song.id);
    else pending = song.id;
    refreshBar();
}

export function skip() {
    const next = playNext();
    if (next) {
        if (ready && yt) yt.loadVideoById(next.id);
        else pending = next.id;
    } else if (ready && yt) {
        yt.stopVideo();
    }
    refreshBar();
}

// Erros do player: 2 ID inválido, 5 erro HTML5, 100 indisponível,
// 101/150 embed bloqueado pelo dono. Avisa e pula para a próxima da fila.
function onError(code) {
    const reason = (code === 101 || code === 150)
        ? 'Vídeo bloqueado para reprodução externa'
        : code === 100 ? 'Vídeo indisponível'
        : code === 2   ? 'ID de vídeo inválido'
        : 'Erro ao reproduzir';

    const next = peekNext();
    const title = document.getElementById('player-title');
    if (next) {
        title.textContent = `${reason} — pulando…`;
        setTimeout(skip, 2000);
    } else {
        title.textContent = `${reason}. Fila vazia.`;
    }
}

function toggle() {
    if (!ready || !yt) return;
    const s = yt.getPlayerState();
    if (s === window.YT.PlayerState.PLAYING) yt.pauseVideo();
    else yt.playVideo();
}

function bindControls() {
    document.getElementById('player-toggle').addEventListener('click', toggle);
    document.getElementById('player-skip').addEventListener('click', skip);

    // Pausa ao sair da tela do player; retoma ao voltar.
    document.addEventListener('screen:change', e => {
        if (!ready || !yt) return;
        const PS = window.YT.PlayerState;
        if (e.detail.name === 'player') {
            if (getState().current && yt.getPlayerState() === PS.PAUSED) yt.playVideo();
        } else if (yt.getPlayerState() === PS.PLAYING) {
            yt.pauseVideo();
        }
    });
}

function refreshBar() {
    const { current } = getState();
    document.getElementById('player-title').textContent =
        current ? current.title : 'Nada tocando';
    const next = peekNext();
    document.getElementById('player-next').textContent =
        next ? `A seguir: ${next.title}` : '';
}
