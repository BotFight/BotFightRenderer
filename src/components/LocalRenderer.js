import React, { useEffect } from 'react'
import Game from './Game'
import Navigation from './Navigation';
import LocalSelector from './LocalSelector';
import { useState } from 'react';
import { processData} from "../replay/process_replay"
import ReassignDirectory from './ReassignDirectory';
import GameOutputs from './GameOutputs';

const path = require('path');

function LocalRenderer() {
  const [currentMatchStateIndex, setCurrentMatchStateIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playSpeed, setPlaySpeed] = useState(50); 
  const [matchStates, setMatchStates] = useState(null);
  const [finalBot1File, setFinalBot1File] = useState(null);
  const [finalBot2File, setFinalBot2File] = useState(null);
  const [shouldPlayMatch, setShouldPlayMatch] = useState(false);
  const [engineOutput, setEngineOutput] = useState(null);
  
  const handleBack = () => {
    setCurrentMatchStateIndex((prevIndex) => Math.max(prevIndex - 1, 0));
  };

  const handleForward = () => {
    setCurrentMatchStateIndex((prevIndex) => Math.min(prevIndex + 1, matchStates.length - 1));
  };

  const handleInputChange = (event) => {
    const value = parseInt(event.target.value, 10);
    if (!isNaN(value) && value >= 0 && value < matchStates.length) {
      setCurrentMatchStateIndex(value);
    }
  };

  const togglePlay = () => {
    setIsPlaying((prevIsPlaying) => !prevIsPlaying);
  };

  const handleSpeedChange = (event) => {
    const value = parseInt(event.target.value, 10);
    if (!isNaN(value)) {
        setPlaySpeed(value);
    }
  };

  useEffect(() => {
      let interval;
      if (isPlaying) {
        interval = setInterval(() => {
          setCurrentMatchStateIndex((prevIndex) => {
              if (matchStates && prevIndex < matchStates.length - 1) {
                return prevIndex + 1;
              }
              return prevIndex;
            });      }, playSpeed);
      } else if (!isPlaying && interval) {
        clearInterval(interval);
      }
      return () => clearInterval(interval);
    }, [isPlaying]);

  useEffect(() => {
    const runMatch = async () => {
      const directoryPathObject = await window.electron.storeGet('directory');
      const directoryPath = directoryPathObject ? directoryPathObject.path : null;

      if (!shouldPlayMatch || !finalBot1File || !finalBot2File) {
        return;
      }
      try {
        setMatchStates(null);
        setCurrentMatchStateIndex(0);
        setIsPlaying(false);
        console.log("Running match with ", finalBot1File, finalBot2File, directoryPath);
        const scriptArgs = [
          '-a', finalBot1File.name,
          '-b', finalBot2File.name,
          '-m', 'pillars',
          '-r'
        ];
        setEngineOutput(await window.electron.runPythonScript(scriptArgs, directoryPath));
        const resultFilePath = path.join(directoryPath, 'game_env', 'match_runs', 'result.json');
        const resultFileContent = await window.electron.readFile(resultFilePath);
        const matchLog = JSON.parse(resultFileContent);
        

        const m = await processData(matchLog);
        setMatchStates(m.match_states);
      }
      catch (error) {
        console.error("Error running match ", error);
      }
      setShouldPlayMatch(false);
    };
    runMatch();
  }, [shouldPlayMatch]);



  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-800 relative">
      <div className="absolute top-4 left-4">
        <ReassignDirectory />
      </div>
      <div className='flex flex-row h-full'>
        <Game
          currentMatchStateIndex={currentMatchStateIndex}
          setCurrentMatchStateIndex={setCurrentMatchStateIndex}
          matchStates={matchStates}
        />
        <GameOutputs engineOutput={engineOutput} />
      </div>
      <LocalSelector setFinalBot1File={setFinalBot1File} setFinalBot2File={setFinalBot2File} setShouldPlayMatch={setShouldPlayMatch}/>
      <Navigation
        onBack={handleBack}
        onForward={handleForward}
        onInputChange={handleInputChange}
        togglePlay={togglePlay}
        inputValue={currentMatchStateIndex}
        isPlaying={isPlaying}
        onSpeedChange={handleSpeedChange}
      />
    </div>
  );
}
export default LocalRenderer