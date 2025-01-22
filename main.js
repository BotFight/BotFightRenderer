const { app, BrowserWindow, ipcMain, dialog } = require('electron')  // Added dialog here
const { spawn } = require('child_process')
const path = require('path')
const fs = require('fs').promises;
require('@electron/remote/main').initialize()

let win;
let store;

function createWindow() {
    win = new BrowserWindow({
        fullscreen: true,
        
        webPreferences: {
            enableRemoteModule: true,
            contextIsolation: false,
            preload: path.join(__dirname, 'preload.js')
        }
    })
    require('@electron/remote/main').enable(win.webContents)
    win.loadURL('http://localhost:3000/electron')
}

ipcMain.handle('run-python-script', async (event, scriptArgs, directoryPath) => {
  console.log('ipcMain.handle called with args:', scriptArgs, directoryPath);
    return new Promise((resolve, reject) => {
        console.log('Running python script with args:', scriptArgs, directoryPath);
        const pythonScript = path.join(directoryPath,'/engine/src', 'run_game.py');
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

ipcMain.handle('store-set', async (event, key, value) => {
  if (!store) {
      const Store = (await import('electron-store')).default;
      store = new Store();
  }
  store.set(key, value);
});

ipcMain.handle('store-get', async (event, key) => {
  if (!store) {
      const Store = (await import('electron-store')).default;
      store = new Store();
  }
  return store.get(key);
});

ipcMain.handle('read-file', async (event, filePath) => {
  try {
      const data = await fs.readFile(filePath, 'utf8');
      return data;
  } catch (error) {
      throw new Error(`Failed to read file: ${error.message}`);
  }
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