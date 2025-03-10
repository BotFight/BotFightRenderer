"use client";
import React, { useEffect } from 'react'
import Game from '../Game'
import Navigation from '../Navigation';
import LocalSelector from './LocalSelector';
import MapSelector from './MapSelector';
import { useState } from 'react';
import { processData} from "../../replay/process_replay"
import ReassignDirectory from './ReassignDirectory';
import GameOutputs from './GameOutputs';
import PlayerStats from '../PlayerStats';


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
  const [map, setMap] = useState(null);

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
      if (!shouldPlayMatch || !finalBot1File || !finalBot2File) {
        return;
      }
      setEngineOutput("Playing match...");
      try {
        let num = await window.electron.storeGet("numMatches")
        let outdir = await window.electron.storeGet("matchDir")
        setMatchStates(null);
        setCurrentMatchStateIndex(0);
        setIsPlaying(false);
        console.log("Running match with ", finalBot1File, finalBot2File, map, 1);
        
        const resultFilePath = path.join(outdir, `${num}.json`);
        const scriptArgs = [
          '--a_dir', `"${finalBot1File}"`,
          '--b_dir', `"${finalBot2File}"`,
          '--map_string', `"${map}"`,
          '--output_dir', `"${resultFilePath}"`
        ];
        setEngineOutput(await window.electron.runPythonScript(scriptArgs));

        try{
          const resultFileContent = await window.electron.readFile(resultFilePath);
          const matchLog = JSON.parse(resultFileContent);
          await window.electron.copyMatch(resultFilePath, num);
          await window.electron.storeSet("numMatches", (num+1)%100000)

          const m = await processData(matchLog);
          setMatchStates(m.match_states);

          setIsPlaying(false)
          setCurrentMatchStateIndex(0);
          setCurrentMatchStateIndex(0);
        } catch{
          console.error("match not found")
        }
        
      }
      catch (error) {
        console.error("Error running match ", error);
      }
      setShouldPlayMatch(false);
    };
    runMatch();
  }, [shouldPlayMatch]);



  return (
    <div className="flex-grow flex flex-col items-center justify-center bg-gray-800 relative gap-2">            
      <div className='flex flex-row space-x-4 mt-4'>
      <PlayerStats currentMatchStateIndex={currentMatchStateIndex} matchStates={matchStates}></PlayerStats>        
      <div className="flex flex-col items-center gap-4"> 
      <MapSelector onSelectMap={setMap} />
          <Game
            currentMatchStateIndex={currentMatchStateIndex}
            setCurrentMatchStateIndex={setCurrentMatchStateIndex}
            matchStates={matchStates}
          />       
        </div>
        <div className="flex flex-col gap-4 items-center">
          <h1 className="text-white font-bold"> Debug Outputs </h1>
          <GameOutputs engineOutput={engineOutput} />
        </div>
      </div>
      <LocalSelector map={map} setFinalBot1File={setFinalBot1File} setFinalBot2File={setFinalBot2File} setShouldPlayMatch={setShouldPlayMatch}/>      
      <div className='mb-4'>
      <Navigation
        onBack={handleBack}
        onForward={handleForward}
        onInputChange={handleInputChange}
        togglePlay={togglePlay}
        inputValue={currentMatchStateIndex}
        isPlaying={isPlaying}
        onSpeedChange={handleSpeedChange}
        matchStates={matchStates}
      />
      </div>
    </div>
  );
}
export default LocalRenderer