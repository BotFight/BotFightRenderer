const { app, BrowserWindow, ipcMain, dialog } = require('electron')  // Added dialog here
const { spawn } = require('child_process')
const path = require('path')
require('@electron/remote/main').initialize()

let win

function createWindow() {
    win = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            enableRemoteModule: true,
            contextIsolation: false,
            preload: path.join(__dirname, 'preload.js')
        }
    })
    require('@electron/remote/main').enable(win.webContents)
    win.loadURL('http://localhost:3000/electron')
    win.webContents.openDevTools()
}

ipcMain.handle('run-python-script', async (event, scriptArgs) => {
    return new Promise((resolve, reject) => {
        console.log('Running python script with args:', scriptArgs);
        const pythonScript = path.join('/Users/tylerkwok/Library/CloudStorage/OneDrive-GeorgiaInstituteofTechnology/CodingStuffs/Personal/ByteFight/BotFightEngine/engine/src', 'run_game.py');
        const pythonProcess = spawn('python3', [pythonScript, ...scriptArgs]);
        let scriptOutput = '';
        let scriptError = '';
        
        pythonProcess.stdout.on('data', (data) => {
            scriptOutput += data.toString();
        });
        
        pythonProcess.stderr.on('data', (data) => {
            scriptError += data.toString();
        });
        
        pythonProcess.on('close', (code) => {
            if (code !== 0) {
                reject(new Error(`Python script error: ${scriptError}`));
            } else {
                resolve(scriptOutput);
            }
        });
    });
});

app.on('ready', createWindow)

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit()
    }
})

app.on('activate', () => {
    if (win === null) {
        createWindow()
    }
})