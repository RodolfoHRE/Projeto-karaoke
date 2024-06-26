const { app, BrowserWindow} = require('electron')

let main_window

app.on('ready', () => {
    main_window = new BrowserWindow({
       
    })
    main_window.loadURL(`file://${__dirname}/frontend/index.html`)
})