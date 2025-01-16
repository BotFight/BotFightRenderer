import React, { useEffect ,useState } from 'react';
import Game from './Game';
import Selector from './Selector';
import Navigation from './Navigation';
import { processData} from "../replay/process_replay"
const GridValues = {
    EMPTY: 0,
    WALL: 1,
    APPLE: 2,
    SNAKE_A_HEAD: 3,
    SNAKE_A_BODY: 4,
    SNAKE_B_HEAD: 5,
    SNAKE_B_BODY: 6,
}

export default function MapRenderer() {
    const [showSnakeStart, setShowSnakeStart] = useState(true); 
    const [aSpawn, setASpawn] = useState([-1, -1]); 
    const [bSpawn, setBSpawn] = useState([-1, -1]);
    const [mapHeight, setMapHeight] = useState(20); 
    const [mapWidth, setMapWidth] = useState(20);  
    const [walls, setWalls] = useState(null);  // Array to store wall positions, initially empty
    const cellSize = 30;
    const [cellType, setCellType] = useState(0);
    const [appleRate, setAppleRate] = useState(0);
    const [appleNums, setAppleNums] = useState(0);
    const min_map = 5;
    const max_map = 64;
    const min_apple_num = 1;
    const max_apple_num = 5;
    const min_apple_rate = 50;
    const max_apple_rate = 150;


    const handleHeightChange = (event) => {
        const value = parseInt(event.target.value, 10);
        setMapHeight(Math.max(Math.min(max_map, value), min_map));
    };

    const handleWidthChange = (event) => {
        const value = parseInt(event.target.value, 10);
        setMapWidth(Math.max(Math.min(max_map, value), min_map));
    };

    const handleAppleRateChange = (event) => {
        setAppleRate(Math.max(Math.min(max_apple_rate, value), min_apple_rate))
    };

    const handleAppleNumChange = (event) => {
        setAppleRate(Math.max(Math.min(max_apple_num, value), min_apple_num))
    };


  useEffect(() => {

  fetchData();
  setCurrentMatchStateIndex(0);
  }, [matchId]);

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
    setMatchState(matchStates[currentMatchStateIndex]) 
    return () => clearInterval(interval);
  }, [isPlaying]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-800">
      <div>
      <MapVis
        showSnakeStart={showSnakeStart}
        aSpawn={aSpawn}
        bSpawn={bSpawn}
        mapHeight={mapHeight}
        mapWidth={mapWidth}
        walls={walls}
        cellType={cellType}
      />
      <CellSelector setCellType={setCellType}/>
      </div>
    </div>
  );
}