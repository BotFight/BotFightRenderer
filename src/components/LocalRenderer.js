"use client";
import { useEffect } from 'react'
import Game from './Game'
import Navigation from './Navigation';
import LocalSelector from './LocalSelector';
import MapSelector from './MapSelector';
import { useState } from 'react';
import { processData } from "../replay/process_replay"
import GameOutputs from './GameOutputs';
import PlayerStats from './PlayerStats';
import { Button } from '@/components/ui/button';
import { Bot } from 'lucide-react';


const path = require('path');

function LocalRenderer() {
  const [currentMatchStateIndex, setCurrentMatchStateIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playSpeed, setPlaySpeed] = useState(50);
  const [matchStates, setMatchStates] = useState(null);
  const [bot1File, setBot1File] = useState(null);
  const [bot2File, setBot2File] = useState(null);
  const [shouldPlayMatch, setShouldPlayMatch] = useState(false);
  const [engineOutput, setEngineOutput] = useState(null);
  const [map, setMap] = useState(null);

  const botCount = (bot1File && bot2File ? 2 : bot1File || bot2File ? 1 : 0);
  const canStart = bot1File && bot2File && map;

  const handleBack = () => {
    setCurrentMatchStateIndex((prevIndex) => Math.max(prevIndex - 1, 0));
  };

  const handleForward = () => {
    setCurrentMatchStateIndex((prevIndex) => Math.min(prevIndex + 1, matchStates.length - 1));
  };

  const handleInputChange = (value) => {
    if (!isNaN(value[0]) && value[0] >= 0 && value[0] < matchStates.length) {
      setCurrentMatchStateIndex(value[0]);
    } else {
      setCurrentMatchStateIndex(0);
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

  const handleBattleStart = () => {
    setBot1File(bot1File);
    setBot2File(bot2File);
    setShouldPlayMatch(true);
  }

  useEffect(() => {
    let interval;
    if (isPlaying) {
      interval = setInterval(() => {
        setCurrentMatchStateIndex((prevIndex) => {
          if (matchStates && prevIndex < matchStates.length - 1) {
            return prevIndex + 1;
          }
          setIsPlaying(false);
          return prevIndex;
        });
      }, playSpeed);
    } else if (!isPlaying && interval) {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isPlaying]);

  useEffect(() => {
    const runMatch = async () => {
      if (!shouldPlayMatch || !canStart) {
        return;
      }
      setEngineOutput("Playing match...");
      try {
        let num = await window.electron.storeGet("numMatches")
        let outdir = await window.electron.storeGet("matchDir")
        setMatchStates(null);
        setCurrentMatchStateIndex(0);
        setIsPlaying(false);
        console.log("Running match with ", bot1File, bot2File, map, 1);

        const resultFilePath = path.join(outdir, `${num}.json`);
        const scriptArgs = [
          '--a_dir', `"${bot1File}"`,
          '--b_dir', `"${bot2File}"`,
          '--map_string', `"${map}"`,
          '--output_dir', `"${resultFilePath}"`
        ];
        setEngineOutput(await window.electron.runPythonScript(scriptArgs));

        try {
          const resultFileContent = await window.electron.readFile(resultFilePath);
          const matchLog = JSON.parse(resultFileContent);
          await window.electron.copyMatch(resultFilePath, num);
          await window.electron.storeSet("numMatches", (num + 1) % 100000)

          const m = await processData(matchLog);
          setMatchStates(m.match_states);

          setIsPlaying(false)
          setCurrentMatchStateIndex(0);
          setCurrentMatchStateIndex(0);
        } catch {
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
    <div className="flex-grow flex flex-col items-center justify-center bg-zinc-900 relative gap-2 p-4 w-full">
      <div className='flex flex-col lg:flex-row items-center lg:items-stretch gap-8 w-full justify-center'>
        <div className='flex flex-col gap-4 items-center'>
          <LocalSelector bot1File={bot1File} bot2File={bot2File} setBot1File={setBot1File} setBot2File={setBot2File} />
          <div className="flex flex-col justify-center items-center text-center gap-4 mt-4 mb-4 lg:mb-0">
          <p className="text-zinc-500 italic text-lg">Sponsored By</p>
          <img src="/google_logo_icon.png" alt="robot" width={100} height={100} />
          </div>
        </div>
        <div className="flex flex-col items-center gap-4">
          <div className="w-full flex gap-3 items-stretch">
            <div className={`${botCount == 2 ? "border border-green-700" : ""} bg-zinc-800 flex-grow rounded-lg flex items-center justify-center gap-2`}>
              <Bot size={24} />
              <p className="text-sm text-zinc-300">
                <span className="font-bold text-white">{botCount}/2</span> Robots Selected
              </p>
            </div>
            <MapSelector onSelectMap={setMap} />
            <Button
              className={`px-4 py-2 rounded text-sm text-white
            ${(bot1File && bot2File && map != null)
                  ? 'bg-green-500 hover:bg-green-600'
                  : 'bg-zinc-600 cursor-not-allowed'}`}
              disabled={!canStart}
              onClick={handleBattleStart}
            >
              Start Battle
            </Button>
          </div>
          <Game
            currentMatchStateIndex={currentMatchStateIndex}
            setCurrentMatchStateIndex={setCurrentMatchStateIndex}
            matchStates={matchStates}
          />
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


        <div className="flex flex-col gap-4 items-stretch max-w-lg w-full">
          <GameOutputs engineOutput={engineOutput} />
          <PlayerStats currentMatchStateIndex={currentMatchStateIndex} matchStates={matchStates}></PlayerStats>
        </div>
      </div>
    </div>
  );
}
export default LocalRenderer