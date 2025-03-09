import React, { useState } from 'react';
import { Upload, FileText, X } from 'lucide-react';
import { Button } from '@/components/ui/button'

const LocalSelector = ({map, setFinalBot1File, setFinalBot2File, setShouldPlayMatch}) => {

  const [bot1File, setBot1File] = useState(null);
  const [bot2File, setBot2File] = useState(null);

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

  const handleBattleStart = () => {
    // clearSelection(1);
    // clearSelection(2);
    setFinalBot1File(bot1File);
    setFinalBot2File(bot2File);
    setShouldPlayMatch(true);
  }

  const FileUploadBox = ({ botNumber, file, onFileChange, onClear }) => (
    <div className="w-64">
      <h3 className="text-sm font-semibold mb-2 text-white">Bot {botNumber}</h3>
      <div
        className={`border-2 border-dashed rounded-lg p-3 text-center transition-colors
          ${file ? 'bg-green-50 border-green-200' : 'border-gray-300 hover:border-gray-400 bg-gray-800'}`}
      >
        {!file ? (
          <div className="space-y-2">
            <Upload className="mx-auto text-gray-300" size={20} />
            <div>
              <label className="cursor-pointer">
                <span className="bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600 transition-colors">
                  Select Bot {botNumber}
                </span>
                <button onClick={onFileChange} style={{display: 'none'}} id="selectFolderBtn"/>
              </label>
            </div>
            <p className="text-gray-300 text-xs">Click or drag file</p>
          </div>
        ) : (
          <div className="flex items-center justify-between p-2 bg-white rounded shadow-sm">
            <div className="flex items-center space-x-2">
              <FileText className="text-blue-500" size={16} />
              <span className="font-medium text-gray-700 text-sm truncate max-w-48">{file.name}</span>
            </div>
            <button
              onClick={onClear}
              className="p-1 hover:bg-gray-100 rounded transition-colors"
            >
              <X className="text-gray-500" size={14} />
            </button>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="p-4">
      <div className="flex flex-row items-start space-x-8 justify-center">
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
      <div className="flex justify-center mt-6">
        <Button 
          className={`px-4 py-2 rounded text-sm text-white
            ${(bot1File && bot2File && map != null)
              ? 'bg-green-500 hover:bg-green-600' 
              : 'bg-gray-600 cursor-not-allowed'}`}
          disabled={!bot1File || !bot2File}
          onClick={handleBattleStart}
        >
          Start Battle
        </Button>
      </div>
    </div>
  );
};

export default LocalSelector;