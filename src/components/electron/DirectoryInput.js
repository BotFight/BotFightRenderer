'use client';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
const path = require('path');

export default function DirectoryInput() {
  const router = useRouter();
  const [directory, setDirectory] = useState(null);
  const [inputPath, setInputPath] = useState('');

  useEffect(() => {
    const fetchStoredDirectory = async () => {
      const storedDirectory = await window.electron.storeGet('directory');
      if (storedDirectory) {
        setDirectory(storedDirectory);
        setInputPath(storedDirectory.path);
        router.push(`/electron/render?path`);
      }
    };
    fetchStoredDirectory();
  }, []);

  const handleInputChange = (event) => {
    setInputPath(event.target.value);
  };

  const handleDirectorySubmit = async () => {
    if (inputPath) {
      const dirName = inputPath.split('/').pop() || inputPath;
      const newDirectory = { name: dirName, path: inputPath };
      setDirectory(newDirectory);

      const mapsFilePath = path.join(newDirectory.path, 'game_env', 'maps.json');
      const mapsFileContent = await window.electron.readFile(mapsFilePath);
      const mapPairs = JSON.parse(mapsFileContent);
      
      const maps = Object.keys(mapPairs);
      console.log(maps);
      await window.electron.storeSet('maps', maps);
      await window.electron.storeSet('directory', newDirectory);

      router.push(`/electron/render?path`);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-100 p-5">
      <h1 className="mb-5 text-2xl font-bold">Enter Directory Path</h1>
      <input
        type="text"
        value={inputPath}
        onChange={handleInputChange}
        placeholder="Enter absolute directory path"
        className="w-72 p-2 mb-3 rounded border border-gray-300"
      />
      <button
        onClick={handleDirectorySubmit}
        className="px-4 py-2 rounded bg-blue-500 text-white hover:bg-blue-700"
      >
        Submit
      </button>
      {directory && (
        <div className="mt-5 p-3 rounded bg-white shadow">
          <h2 className="text-xl font-semibold">Selected Directory:</h2>
          <p><strong>Name:</strong> {directory.name}</p>
          <p><strong>Path:</strong> {directory.path}</p>
        </div>
      )}
    </div>
  );
}