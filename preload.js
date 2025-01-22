const { ipcRenderer } = require('electron');

window.electron = {
    runPythonScript: (args, directoryPath) => ipcRenderer.invoke('run-python-script', args, directoryPath),
    selectFile: () => ipcRenderer.invoke('dialog:selectFile'),
    storeSet: (key, value) => ipcRenderer.invoke('store-set', key, value),
    storeGet: (key) => ipcRenderer.invoke('store-get', key),
    readFile: (filePath) => ipcRenderer.invoke('read-file', filePath),
};