import React, { useEffect ,useState } from 'react';
import Game from './Game';
import Navigation from './Navigation';
import { processData} from "../replay/process_replay"

export default function Renderer() {
  const [currentMatchStateIndex, setCurrentMatchStateIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playSpeed, setPlaySpeed] = useState(1000); 
  const [matchStates, setMatchStates] = useState(null);

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
    const fetchData = async () => {
      const m = await processData("./result.json");
      setMatchStates(m.match_states);
    };

    fetchData();
  }, []);

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

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-800">
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
      />
    </div>
  );
}