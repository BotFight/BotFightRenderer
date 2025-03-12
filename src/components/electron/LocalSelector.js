import React, { useState } from 'react';
import { Upload, FileText, X } from 'lucide-react';

const LocalSelector = ({ map, bot1File, bot2File, setBot1File, setBot2File, setShouldPlayMatch }) => {

  const handleFileChange = (botNumber) => (event) => {
    const directory = event.target.files[0];

    const dirInfo = {
      name: directory.webkitRelativePath.split('/')[0],
      path: directory
    };

    if (botNumber === 1) {
      setBot1File(dirInfo);
    } else {
      setBot2File(dirInfo);
    }
  };

  const handleFolderSelect = (botNumber) => async () => {
    console.log("pressed");
    console.log(window.electron);
    const folder = await window.electron.selectFolder(); // Invoke the Electron function
    if (botNumber === 1) {
      setBot1File(folder);
    } else {
      setBot2File(folder);
    }
  };

  const clearSelection = (botNumber) => {
    if (botNumber === 1) {
      setBot1File(null);
    } else {
      setBot2File(null);
    }
  };

  const FileUploadBox = ({ botNumber, file, onFileChange, onClear }) => {

    const splitFile = file ? file.split("\\") : null;
    const fileName = splitFile ? splitFile[splitFile.length - 1] : null;

    return (
      <div
        className={`w-64 min-h-32 border-2 rounded-lg p-3 text-center transition-colors flex flex-col justify-center items-center
          ${file ? 'bg-zinc-800 border-zinc-700' : 'border-zinc-600 hover:border-zinc-400 bg-zinnc-800 border-dashed'}`}
      >
        {!file ? (
          <div className="flex flex-col items-center gap-4">
            <Upload className="mx-auto text-zinc-400" size={20} />
            <div>
              <label className="cursor-pointer">
                <span className="bg-blue-500 text-white px-3 py-2 rounded text-sm hover:bg-blue-600 transition-colors">
                  Select Bot {botNumber}
                </span>
                <button onClick={onFileChange} style={{ display: 'none' }} id="selectFolderBtn" />
              </label>
            </div>
            <p className="text-zinc-400 text-xs italic">Click or drag folder</p>
          </div>
        ) : (
          <div className="w-full flex flex-col gap-1 pb-2">
            <h3 className="text-md font-semibold mb-2 text-white">Bot <span className={`font-bold ${botNumber == 1 ? "text-green-500" : "text-blue-500"}`}>{botNumber == 1 ? "A" : "B"}</span></h3>
            <div className="flex items-center justify-between p-2 rounded shadow-sm w-full bg-white">
              <div className="flex items-center space-x-2 flex-grow">
                <FileText className={`${botNumber == 1 ? "text-green-700" : "text-blue-500"}`} size={16} />
                <div className="font-medium text-gray-700 text-sm w-full">{fileName}</div>
              </div>
              <button
                onClick={onClear}
                className="p-1 hover:bg-gray-100 rounded transition-colors"
              >
                <X className="text-gray-500" size={14} />
              </button>
            </div>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center gap-6 p-4 border border-zinc-700 rounded-lg h-fit">
      <p className="text-lg font-bold text-zinc-50 mt-1">Select Bots</p>
      <FileUploadBox
        botNumber={1}
        file={bot1File}
        onFileChange={handleFolderSelect(1)}
        onClear={() => clearSelection(1)}
      />
      <FileUploadBox
        botNumber={2}
        file={bot2File}
        onFileChange={handleFolderSelect(2)}
        onClear={() => clearSelection(2)}
      />
    </div>
  );
};

export default LocalSelector;