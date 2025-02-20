const { app, BrowserWindow, ipcMain, dialog } = require('electron')  // Added dialog here
const { spawn } = require('child_process')
const path = require('path');
const { match } = require('assert');
const fs = require('fs').promises;
require('@electron/remote/main').initialize()

let win;
let store;


const userDataPath = app.getPath('userData');  // Get the user data directory
const metaFilePath = path.join(userDataPath, 'meta.json')
const dataFilePath = path.join(userDataPath, 'maps.json')
const matchPath = path.join(userDataPath, 'match_runs')
async function initMaps() {

    if (!store) {
        const Store = (await import('electron-store')).default;
        store = new Store();
    }

    // initialize maps
    let mapPairs = {}
    try{
        await fs.stat(dataFilePath)

        let response = await fs.readFile(dataFilePath, 'utf8');
        mapPairs = JSON.parse(response);
        
    }catch (error){

    }
    let ogResponse = await fs.readFile(path.join(app.getAppPath(), 'src','engine', '_internal', 'maps.json'));
    let originalMaps = JSON.parse(ogResponse);
    
    Object.keys(originalMaps).forEach(key => {
        mapPairs[key] = originalMaps[key];
    });
    
    store.set("maps", mapPairs)


    
  }

async function initMatches(){
    let metadata = {
        "numMatches":0
    }
    try{
        await fs.stat(metaFilePath)
        let response = await fs.readFile(metaFilePath, 'utf8');
        metadata = JSON.parse(response);
    }catch (error){
        
    }

    store.set("numMatches", metadata["numMatches"]);

    try{
        await fs.access(matchPath);
    } catch{
        await fs.mkdir(matchPath, { recursive: true }, (err) => {
            if (err) {
              console.error('Error creating directory:', err);
            } else {
              console.log('Directory created successfully!');
            }
        })

    }
}

function createWindow() {
    initMaps()
    win = new BrowserWindow({
        fullscreen: false,
        
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
  console.log('ipcMain.handle called with args:', scriptArgs);
    return new Promise((resolve, reject) => {
        console.log('Running python script with args:', scriptArgs);
        const gameScript = path.join(path.resolve(),'src','engine', 'run_game_dist.exe');
        const pythonProcess = spawn(gameScript, [...scriptArgs],{
            cwd: path.join(path.resolve(),'src','engine'),
            shell: true
        });
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

ipcMain.handle('read-map', async (event) => {
    try {
        console.log(dataFilePath)
        const data = await fs.readFile(dataFilePath, 'utf8');
        console.log(data);
        return data;
    } catch (error) {
        throw new Error(`Failed to read file: ${error.message}`);
    }
  });

ipcMain.handle('dialog:selectFolder', async () => {
    const result = await dialog.showOpenDialog({
      properties: ['openDirectory'], 
    });
    return result.filePaths[0];
  });

  ipcMain.handle('write-map', async (event, data) => {

    try {
    
      await fs.writeFile(dataFilePath, JSON.stringify(data, null, 2));  // Writing data to JSON file
      return { success: true };
    } catch (error) {
      console.error('Error writing to JSON file:', error);
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle('get-matches', async (event,)=>{
    try{
        const files = await fs.readdir(matchPath);
        return files
    }
    catch(err){

    }
    
  })


  ipcMain.handle('read-match', async (event,match_json)=>{
    try{
        const data = await fs.readFile(path.join(matchPath, match_json), 'utf8');
        console.log(data);
        return data;
    }
    catch(err){
        console.log(err);
    }
    
  })



  ipcMain.handle('load-match', async (event, sourcefile, num)=>{
    try {
        await fs.copyFile(sourcefile, path.join(matchPath, `${num}.json`));
    } catch (error) {
        throw new Error(`Failed to read file: ${error.message}`);
    }
  })


  ipcMain.handle('copy-match', async (event, sourcefile, num)=>{
    try {
        await fs.copyFile(sourcefile, path.join(matchPath, `${num}.json`));
    } catch (error) {
        throw new Error(`Failed to read file: ${error.message}`);
    }
  })


  ipcMain.handle('write-match', async (event) => {
    try {
        const data = await fs.readFile(dataFilePath, 'utf8');
        return data;
    } catch (error) {
        throw new Error(`Failed to read file: ${error.message}`);
    }
  });
  
  
app.on('before-quit', async()=>{
    num = 0
    maps = {}
    if (store) {
        num = store.get("numMatches");
        maps = store.get("maps");
    }

    console.log("writing")
    await fs.writeFile(dataFilePath, JSON.stringify(maps, null, 2));  // Writing data to JSON file
    await fs.writeFile(metaFilePath, JSON.stringify({"numMatches" : num}, null, 2)); 
})

app.on('ready', async () => {
    await initMaps();  // Check if file exists and create it if necessary
    await initMatches();
    createWindow();
    }
)

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