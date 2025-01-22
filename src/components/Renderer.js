import React, { useEffect ,useState } from 'react';
import Game from './Game';
import Selector from './Selector';
import Navigation from './Navigation';
import { processData} from "../replay/process_replay"
import PlayerStats from './PlayerStats';


export default function Renderer() {
 const [currentMatchStateIndex, setCurrentMatchStateIndex] = useState(0);
 const [validationMatch, setValidationMatch] = useState(true)
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
  let value = event.target.value;

  if (value === "") {
    setCurrentMatchStateIndex(0);
    return;
  }

  const parsedValue = parseInt(value, 10);

  if (!isNaN(parsedValue) && parsedValue >= 0 && parsedValue < matchStates.length) {
    setCurrentMatchStateIndex(parsedValue);
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
   const fetchData = async () => {
     if (matchId) {
      try {
        const response = await fetch('https://botfightwebserver.onrender.com/api/v1/game-match-log/id?id=' + matchId);
        if (!response.ok) {
          throw new Error('Failed to fetch match data ', response.status);
        }
        const data = await response.json();
        if (data["matchLog"] == "Validation match, no game played") {
          setValidationMatch(true)
        } else {
          setValidationMatch(false)
          const matchLog = await JSON.parse(data["matchLog"]);
          const m = await processData(matchLog);
          setMatchStates(m.match_states);
        }
      } catch (error) {
        console.error("Error processing match data ", error);
      }
    }
 }
 setIsPlaying(false)
 setCurrentMatchStateIndex(0);
 fetchData();
 }, [matchId]);


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


 return (
   <div className='min-h-screen flex flex-col items-center justify-center gap-4'>
     <Selector setMatchId={setMatchId}/>
     <PlayerStats
      currentMatchStateIndex={currentMatchStateIndex}
      matchStates={matchStates}
     />
     <Game
       currentMatchStateIndex={currentMatchStateIndex}
       matchStates={matchStates}
     />
      {validationMatch ? (
        <p className="text-red-500">This is a validation match. No gameplay data is available.</p>
      ) : (
        <Navigation
          onBack={handleBack}
          onForward={handleForward}
          onInputChange={handleInputChange}
          togglePlay={togglePlay}
          inputValue={currentMatchStateIndex}
          isPlaying={isPlaying}
          onSpeedChange={handleSpeedChange}
        />
      )}
   </div>
 );
}