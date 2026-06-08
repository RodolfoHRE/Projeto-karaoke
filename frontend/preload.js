// Ponte entre o processo principal e o renderer.
// A chave da API chega via additionalArguments (--yt-api-key=...) e é exposta
// ao renderer de forma controlada (o .env nunca é lido pelo browser).
const { contextBridge } = require('electron')

const keyArg = process.argv.find(a => a.startsWith('--yt-api-key='))
const ytApiKey = keyArg ? keyArg.slice('--yt-api-key='.length) : ''

contextBridge.exposeInMainWorld('karaoke', {
    version: '1.0.0',
    ytApiKey
})
