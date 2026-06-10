# echo karaoke

Aplicativo de karaokê desktop em [Electron](https://www.electronjs.org/). Busca e toca
vídeos de karaokê do **YouTube**. Interface em pt-BR, SPA em JavaScript puro (sem bundler).
Identidade visual própria (tema escuro, marca de onda sonora, splash animado, janela
frameless com titlebar custom).

Telas: **Menu** · **Busca** · **Player** · **Fila** · **Favoritos** · **Configurações**.

## Requisitos

- [Node.js](https://nodejs.org/) (LTS recomendado) + npm

## Instalação

```bash
npm install
```

## Executar

```bash
npm run dev
```

O app sobe um servidor estático local e carrega a UI por `http://127.0.0.1:<porta>`.
Rodar por `npm run dev` é necessário — abrir o HTML direto (`file://`) quebra o player
do YouTube (ver [Solução de problemas](#solução-de-problemas)).

## Chave do YouTube (busca por texto)

A **busca por nome** usa a YouTube Data API v3, que precisa de uma chave gratuita.
Tocar colando um **link/ID** do YouTube funciona **sem chave**.

Há duas formas de configurar a chave:

### 1. Pela própria interface (recomendado p/ usuário final)

No primeiro uso sem chave, o app abre a tela **Configurações** (também acessível pelo
menu). Lá você:

1. Clica em **Abrir Google Cloud** (abre o navegador na página de ativar a API).
2. Cria um projeto, ativa a **YouTube Data API v3**, gera uma **Chave de API**.
3. Cola a chave e clica **Validar e salvar** — o app testa a chave na hora (✓/✗).

A chave é salva em um arquivo no diretório de dados do app (`userData/apikey.json`),
persiste entre reinícios e vale **na hora**, sem reiniciar. Dá pra trocar/remover a
qualquer momento em Configurações.

### 2. Por `.env` (atalho de desenvolvimento)

```bash
cp .env.example .env
# edite e cole:  YOUTUBE_API_KEY=AIza...sua_chave
```

O `.env` é **gitignored** e **não** entra nos builds empacotados. A chave salva pela
interface tem **precedência** sobre a do `.env`.

**Cota:** grátis, ~10.000 unidades/dia (cada busca ≈ 100 → ~100 buscas/dia). Estourou a
cota, a API só para até resetar (meia-noite, horário do Pacífico). Não gera cobrança.

## Empacotar (gerar instalável)

```bash
npm run pack    # build rápido, sem instalador → dist/linux-unpacked/
npm run dist    # gera .deb + AppImage → dist/
```

- **`.deb`** (Debian/Ubuntu): `sudo apt install ./dist/echo-karaoke_<versão>_amd64.deb`.
  Instala o app + ícone no sistema. Desinstalar: `sudo apt remove echo-karaoke`.
- **AppImage**: precisa do **FUSE 2** (`sudo apt install libfuse2`) para rodar com duplo
  clique; sem ele, rode com `"./dist/echo karaoke-<versão>.AppImage" --appimage-extract-and-run`.

O app empacotado **não** traz chave de API — o usuário configura a dele pela tela
Configurações (ver acima).

## Estrutura

```
echo-karaoke/
├── main.js               # Processo principal: servidor http estático + BrowserWindow
│                         #   frameless + IPC (favoritos, chave, controles da janela)
├── frontend/             # Renderer (SPA), servido por http
│   ├── index.html        # Splash + titlebar custom + 6 telas <section>
│   ├── styles.css        # Estilos: tokens OKLCH, tema escuro, splash, telas
│   ├── preload.js        # Ponte: expõe window.karaoke (chave, IPC, controles)
│   ├── fonts/            # Fontes self-hosted (Clash Display, General Sans)
│   └── js/
│       ├── app.js        # Bootstrap async + UI da busca + Cantar agora + titlebar
│       ├── splash.js     # Tempo do splash de abertura
│       ├── router.js     # Troca de telas (SPA) + evento screen:change
│       ├── store.js      # Estado: fila + atual + favoritos (pub/sub, persistido)
│       ├── search.js     # Busca: YouTube Data API v3 + fallback link/ID
│       ├── apikey.js     # Chave efetiva (usuário > .env), validação, persistência
│       ├── config.js     # Tela Configurações / wizard de setup da chave
│       ├── favorites.js  # Tela Favoritos: tocar, enfileirar, desfavoritar
│       ├── player.js     # Player: YouTube IFrame Player API
│       └── queue.js      # Fila: render, reordenar, remover, favoritar
├── backend/
│   └── app.py            # Backend Python (planejado, ainda vazio)
├── build/
│   └── icon.png          # Ícone 512×512 (app empacotado e janela)
├── img/                  # Fundo + marca (echo logo.svg/.png, echo logotipo.png)
├── PRODUCT.md / DESIGN.md # Contexto da marca e tokens de design
├── .env.example          # Molde da chave (opcional; dev)
└── package.json          # Inclui config de build (electron-builder)
```

## Scripts disponíveis

| Comando         | Ação                                        |
|-----------------|---------------------------------------------|
| `npm run dev`   | Inicia o app no Electron                    |
| `npm run pack`  | Build unpacked em `dist/linux-unpacked/`    |
| `npm run dist`  | Gera `.deb` + AppImage em `dist/`           |

Ainda não há scripts de teste ou lint.

## Solução de problemas

- **O vídeo não aparece / não toca**: rode sempre via `npm run dev`. O app precisa
  ser servido por http (origin real) para a IFrame Player API do YouTube funcionar;
  abrir `frontend/index.html` direto (`file://`) impede o player de carregar o vídeo.
- **Busca por nome não retorna nada**: configure a chave (tela Configurações ou `.env`)
  e confirme que a "YouTube Data API v3" está ativada no projeto do Google Cloud.
  Sem chave, cole um link/ID do YouTube para tocar.
- **AppImage não abre** (`libfuse.so.2`): instale `libfuse2` ou use
  `--appimage-extract-and-run` (ver [Empacotar](#empacotar-gerar-instalável)).
- **Ícone genérico após instalar o `.deb`**: cache do GNOME — faça logout/login, ou
  `sudo gtk-update-icon-cache -f /usr/share/icons/hicolor`.

## Roteiro (próximos passos)

- [ ] Corrigir bug da Fila (investigar causa raiz)
- [ ] Backend Python (proxy da API / biblioteca local de músicas)
- [ ] Letras sincronizadas (.lrc)
- [ ] Pontuação por voz (pitch/tempo) — ambicioso
- [ ] Tooling de teste/lint

## Licença

[MIT](https://opensource.org/licenses/MIT) — © Rodolfo HRE
