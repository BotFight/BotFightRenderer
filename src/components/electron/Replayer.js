import React, { useEffect } from 'react'
import Game from '../Game'
import Navigation from '../Navigation';

import { useState } from 'react';
import { processData} from "../../replay/process_replay"

import GameOutputs from './GameOutputs';
import MatchSelector from './MatchSelector'


const path = require('path');

function Replayer() {
    const [currentMatchStateIndex, setCurrentMatchStateIndex] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);
    const [playSpeed, setPlaySpeed] = useState(200);
    const [matchStates, setMatchStates] = useState(null);
    const [matchId, setMatchId] = useState(null);
   

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
            setIsPlaying(false)
            return prevIndex;
          });      
       }, playSpeed);
    } else if (!isPlaying) {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isPlaying, playSpeed]);
 

  useEffect(()=>{

    const fetchMatch = async () => {
        if (matchId != null && matchId.substring(0, matchId.length-5) >= 0) {
            console.log(matchId)
            
            const matchFile = await window.electron.readMatch(matchId);
            const matchLog = JSON.parse(matchFile);
            const m = await processData(matchLog);
            setMatchStates(m.match_states);
    
            setIsPlaying(false)
            setCurrentMatchStateIndex(0);
    
        }
    }
    fetchMatch()
    
    
  }, [matchId]);



  return (
    <div className="flex-grow flex flex-col items-center justify-center bg-gray-800 relative gap-6">


      <MatchSelector setMatchId={setMatchId} />
      
      <div className='flex flex-row'>
        <Game
          currentMatchStateIndex={currentMatchStateIndex}
          setCurrentMatchStateIndex={setCurrentMatchStateIndex}
          matchStates={matchStates}
        />
      </div>
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
  );
}
export default Replayer