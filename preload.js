const { ipcRenderer } = require('electron');

window.electron = {
    runPythonScript: (args) => ipcRenderer.invoke('run-python-script', args)
};