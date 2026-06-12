const { app, BrowserWindow, ipcMain, Menu, shell } = require('electron')
const path = require('path')
const fs = require('fs')
const http = require('http')

let main_window
let server
let serverPort

// Lê o .env da raiz do projeto (parser mínimo, sem dependências).
function loadEnv() {
    const env = {}
    try {
        const raw = fs.readFileSync(path.join(__dirname, '.env'), 'utf8')
        for (const line of raw.split('\n')) {
            const trimmed = line.trim()
            if (!trimmed || trimmed.startsWith('#')) continue
            const eq = trimmed.indexOf('=')
            if (eq === -1) continue
            const key = trimmed.slice(0, eq).trim()
            let val = trimmed.slice(eq + 1).trim()
            if ((val.startsWith('"') && val.endsWith('"')) ||
                (val.startsWith("'") && val.endsWith("'"))) {
                val = val.slice(1, -1)
            }
            env[key] = val
        }
    } catch { /* .env ausente: segue sem chave */ }
    return env
}

const MIME = {
    '.html': 'text/html',
    '.js': 'text/javascript',     // obrigatório p/ módulos ES carregarem via http
    '.css': 'text/css',
    '.json': 'application/json',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.png': 'image/png',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon',
    '.woff2': 'font/woff2',
    '.woff': 'font/woff'
}

// Servidor estático servindo a raiz do projeto.
// Dá ao renderer um origin http real (necessário p/ a IFrame API do YouTube).
function startServer() {
    return new Promise((resolve, reject) => {
        const root = __dirname
        server = http.createServer((req, res) => {
            const urlPath = decodeURIComponent(req.url.split('?')[0])
            const resolved = path.normalize(path.join(root, urlPath))

            // Guard contra path traversal: tem que ficar dentro da raiz.
            if (resolved !== root && !resolved.startsWith(root + path.sep)) {
                res.writeHead(403); res.end('Forbidden'); return
            }

            fs.readFile(resolved, (err, data) => {
                if (err) { res.writeHead(404); res.end('Not found'); return }
                const type = MIME[path.extname(resolved).toLowerCase()] || 'application/octet-stream'
                res.writeHead(200, { 'Content-Type': type })
                res.end(data)
            })
        })
        server.on('error', reject)
        server.listen(0, '127.0.0.1', () => {
            serverPort = server.address().port
            resolve(serverPort)
        })
    })
}

function createWindow() {
    const env = loadEnv()

    main_window = new BrowserWindow({
        width: 1100,
        height: 720,
        minWidth: 800,
        minHeight: 600,
        backgroundColor: '#1a0b2e',
        frame: false,
        icon: path.join(__dirname, 'build', 'icon.png'),
        webPreferences: {
            preload: path.join(__dirname, 'frontend', 'preload.js'),
            contextIsolation: true,
            nodeIntegration: false,
            autoplayPolicy: 'no-user-gesture-required',
            // Passa a chave ao preload sem expor o .env ao renderer.
            additionalArguments: [`--yt-api-key=${env.YOUTUBE_API_KEY || ''}`]
        }
    })

    main_window.loadURL(`http://127.0.0.1:${serverPort}/frontend/index.html`)
}

// Persistência simples de favoritos: arquivo JSON no userData.
// Independe da porta efêmera do servidor (origin muda a cada boot, então
// localStorage não serve). Lido/escrito só pelo processo principal via IPC.
function registerFavoritesIpc() {
    const favPath = path.join(app.getPath('userData'), 'favorites.json')
    ipcMain.handle('favorites:load', () => {
        try { return JSON.parse(fs.readFileSync(favPath, 'utf8')) } catch { return [] }
    })
    ipcMain.handle('favorites:save', (_e, list) => {
        try { fs.writeFileSync(favPath, JSON.stringify(list)); return true } catch { return false }
    })
}

// Persistência da chave da YouTube API (escolhida pelo usuário) + abrir links.
function registerApiKeyIpc() {
    const keyPath = path.join(app.getPath('userData'), 'apikey.json')
    ipcMain.handle('apikey:load', () => {
        try { return JSON.parse(fs.readFileSync(keyPath, 'utf8')).key || '' } catch { return '' }
    })
    ipcMain.handle('apikey:save', (_e, k) => {
        try { fs.writeFileSync(keyPath, JSON.stringify({ key: k })); return true } catch { return false }
    })
    ipcMain.on('open-external', (_e, url) => {
        if (typeof url === 'string' && url.startsWith('https://')) shell.openExternal(url)
    })
}

// Controles da janela frameless (titlebar custom no renderer).
function registerWindowIpc() {
    ipcMain.on('window:minimize', (e) => BrowserWindow.fromWebContents(e.sender)?.minimize())
    ipcMain.on('window:toggle-max', (e) => {
        const w = BrowserWindow.fromWebContents(e.sender)
        if (w?.isMaximized()) w.unmaximize(); else w?.maximize()
    })
    ipcMain.on('window:close', (e) => BrowserWindow.fromWebContents(e.sender)?.close())
}

app.whenReady().then(async () => {
    Menu.setApplicationMenu(null)        // sem menu nativo File/Edit/View/Window
    registerFavoritesIpc()
    registerWindowIpc()
    registerApiKeyIpc()
    await startServer()
    createWindow()

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) createWindow()
    })
})

app.on('window-all-closed', () => {
    if (server) server.close()
    if (process.platform !== 'darwin') app.quit()
})

app.on('before-quit', () => {
    if (server) server.close()
})
