# echo karaoke

Aplicativo de karaokê desktop em [Electron](https://www.electronjs.org/). Busca e toca
vídeos de karaokê do **YouTube**. Interface em pt-BR, SPA em JavaScript puro (sem bundler).
Identidade visual própria (tema escuro, marca de onda sonora, splash animado).

Telas: **Menu** · **Busca** · **Player** · **Fila**.

## Requisitos

- [Node.js](https://nodejs.org/) (LTS recomendado) + npm

## Instalação

```bash
npm install
```

## Configuração da chave do YouTube

A **busca por texto** usa a YouTube Data API v3, que precisa de uma chave gratuita.
(Tocar colando um **link/ID** do YouTube funciona sem chave.)

1. Copie o molde e edite:
   ```bash
   cp .env.example .env
   ```
2. No [Google Cloud Console](https://console.cloud.google.com):
   - Crie um projeto (seletor de projeto → **Novo projeto**).
   - **APIs e serviços → Biblioteca** → busque **"YouTube Data API v3"** → **Ativar**.
   - **APIs e serviços → Credenciais** → **+ Criar credenciais → Chave de API**.
   - *(Recomendado)* **Restringir chave** → Restrições de API → **YouTube Data API v3**.
3. Cole a chave no `.env` (sem aspas):
   ```
   YOUTUBE_API_KEY=AIza...sua_chave
   ```

O `.env` é **gitignored** (não vai para o repositório). A chave é lida pelo processo
principal e repassada ao renderer pelo `preload` — o `.env` nunca é lido pelo browser.

**Cota:** grátis, ~10.000 unidades/dia (cada busca ≈ 100 → ~100 buscas/dia). Estourou a
cota, a API só para até resetar (meia-noite, horário do Pacífico). Não gera cobrança.

## Executar

```bash
npm run dev
```

O app sobe um servidor estático local e carrega a UI por `http://127.0.0.1:<porta>`.
Rodar por `npm run dev` é necessário — abrir o HTML direto (`file://`) quebra o player
do YouTube (ver [Solução de problemas](#solução-de-problemas)).

## Estrutura

```
echo-karaoke/
├── main.js               # Processo principal: servidor estático http + BrowserWindow
├── frontend/             # Renderer (SPA), servido por http
│   ├── index.html        # Splash + 4 telas <section>: menu, busca, player, fila
│   ├── styles.css        # Estilos: tokens OKLCH, tema escuro, splash, telas
│   ├── preload.js        # Ponte: injeta a chave da API em window.karaoke
│   ├── fonts/            # Fontes self-hosted (Clash Display, General Sans)
│   └── js/
│       ├── app.js        # Bootstrap + UI da busca
│       ├── splash.js     # Tempo do splash de abertura
│       ├── router.js     # Troca de telas (SPA) + evento screen:change
│       ├── store.js      # Estado: fila + música atual (pub/sub)
│       ├── search.js     # Busca: YouTube Data API v3 + fallback link/ID
│       ├── player.js     # Player: YouTube IFrame Player API
│       └── queue.js      # Fila: render, reordenar, remover
├── backend/
│   └── app.py            # Backend Python (planejado, ainda vazio)
├── img/                  # Fundo + marca (echo logo.svg, echo logotipo.png)
├── PRODUCT.md / DESIGN.md # Contexto da marca e tokens de design
├── .env.example          # Molde da chave (copie para .env)
└── package.json
```

## Scripts disponíveis

| Comando        | Ação                          |
|----------------|-------------------------------|
| `npm run dev`  | Inicia o app no Electron      |

Ainda não há scripts de teste, lint ou build.

## Solução de problemas

- **O vídeo não aparece / não toca**: rode sempre via `npm run dev`. O app precisa
  ser servido por http (origin real) para a IFrame Player API do YouTube funcionar;
  abrir `frontend/index.html` direto (`file://`) impede o player de carregar o vídeo.
- **Busca não retorna nada**: confira se o `.env` existe e tem `YOUTUBE_API_KEY`
  preenchida, e se a "YouTube Data API v3" está ativada no projeto do Google Cloud.
  Sem chave, cole um link/ID do YouTube na busca para tocar.

## Roteiro (próximos passos)

- [ ] Tela de Configurações (volume, tema)
- [ ] Backend Python (biblioteca local de músicas)
- [ ] Letras sincronizadas (.lrc)
- [ ] Tooling de teste/lint/build

## Licença

[MIT](https://opensource.org/licenses/MIT) — © Rodolfo HRE
