// Ponte entre o processo principal e o renderer.
// A chave da API chega via additionalArguments (--yt-api-key=...) e é exposta
// ao renderer de forma controlada (o .env nunca é lido pelo browser).
const { contextBridge, ipcRenderer } = require('electron')

const keyArg = process.argv.find(a => a.startsWith('--yt-api-key='))
const ytApiKey = keyArg ? keyArg.slice('--yt-api-key='.length) : ''

contextBridge.exposeInMainWorld('karaoke', {
    version: '1.0.0',
    ytApiKey,
    getFavorites: () => ipcRenderer.invoke('favorites:load'),
    saveFavorites: (list) => ipcRenderer.invoke('favorites:save', list),
    win: {
        minimize: () => ipcRenderer.send('window:minimize'),
        toggleMax: () => ipcRenderer.send('window:toggle-max'),
        close: () => ipcRenderer.send('window:close')
    },
    getApiKey: () => ipcRenderer.invoke('apikey:load'),
    saveApiKey: (k) => ipcRenderer.invoke('apikey:save', k),
    openExternal: (url) => ipcRenderer.send('open-external', url)
})
