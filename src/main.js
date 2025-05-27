const { app, BrowserWindow } = require('electron');
const path = require('path');
const { loadUserData } = require('./userData');
const { registerIpcHandlers, setMainWindow } = require('./ipcHandlers');

let mainWindow;

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 1000,
        height: 800,
        webPreferences: {
            preload: path.join(__dirname, '..', 'preload.js'),
            contextIsolation: true,
            enableRemoteModule: false,
            nodeIntegration: false
        }
    });

    setMainWindow(mainWindow);
    mainWindow.loadFile('index.html');
}

app.whenReady().then(() => {
    createWindow();
    loadUserData();
    registerIpcHandlers();

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow();
        }
    });
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});