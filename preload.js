const { ipcRenderer, contextBridge } = require('electron');


window.electron = {
    runPythonScript: (args, directoryPath) => ipcRenderer.invoke('run-python-script', args, directoryPath),
    selectFile: () => ipcRenderer.invoke('dialog:selectFile'),
    storeSet: (key, value) => ipcRenderer.invoke('store-set', key, value),
    selectFolder: () => ipcRenderer.invoke('dialog:selectFolder'),
    storeGet: (key) => ipcRenderer.invoke('store-get', key),
    readFile: (filePath) => ipcRenderer.invoke('read-file', filePath),
    readMap: () => ipcRenderer.invoke('read-map'),
    writeMap: (mapPairs) => ipcRenderer.invoke('write-map', mapPairs),
    writeMatch: (num, match) => ipcRenderer.invoke('write-match', num, match),
    getMatches: () => ipcRenderer.invoke('get-matches'),
    readMatch: (match_json) => ipcRenderer.invoke('read-match', match_json),
    copyMatch: (sourcefile, num) => ipcRenderer.invoke('copy-match', sourcefile, num),
};