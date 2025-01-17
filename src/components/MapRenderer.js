import React, { useEffect ,useState } from 'react';
import Game from './Game';
import Selector from './Selector';
import Navigation from './Navigation';
import { processData} from "../replay/process_replay"
import MapSettings from './MapSettings';
import ShowSpawn from './ShowSpawn';
import GenerateMap from './GenerateMap';
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
    const [cellType, setCellType] = useState(GridValues.EMPTY);
    const [appleRate, setAppleRate] = useState(0);
    const [appleNum, setAppleNum] = useState(0);
    const [symmetry, setSymmetry] = useState("Vertical");
    const [canvasRerender, setCanvasRerender] = useState(false)

    const [mapString, setMapString] = useState("");
    const [showMapString, setShowMapString] = useState(false);
    const [copied, setCopied] = useState(false);

    const min_map = 5;
    const max_map = 64;
    const min_apple_num = 1;
    const max_apple_num = 5;
    const min_apple_rate = 50;
    const max_apple_rate = 150;

    const reflect = (x, y) => {
      center = Math.floor(coords.length / 2)

      if(symmetry=="Vertical"){

        return [(mapWidth-1)-x, y];

      } else if(symmetry=="Horizontal"){
        return [x, (mapHeight-1)-y];

      } else if(symmetry=="Origin"){
        return [(mapWidth-1)-x, (mapHeight-1)-y];

      }
      
    }


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
        setAppleNum(Math.max(Math.min(max_apple_num, value), min_apple_num))
    };

    const handleShowSnakeStart = (event) => {
      setShowSnakeStart(event.target.checked); 
    };

    const handleSymmetryChange = (event) => {
      const value = event.target.value;
      setSymmetry(value);
      setWalls(new Array(mapHeight).fill().map(() => new Array(mapWidth).fill(false)));
    };

    const handleGenerateMap = () => {
      setShowMapString(true);

      let parts = [

      ]

      parts.push(mapWidth.toString()+","+mapHeight.toString());
      parts.push(aSpawn[0].toString()+","+aSpawn[1].toString());
      parts.push(bSpawn[0].toString()+","+bSpawn[1].toString());
      parts.push(appleRate.toString()+","+appleNum.toString());

      let wallarr = []

      for(let i = 0; i< mapHeight; i++){
        for(let j = 0; j< mapWidth; j++){
          if(walls[i][j]){
            wallarr.push("1");
          } else{
            wallarr.push("0");
          }
        }
      }
      let wallstring = wallarr.join("");

      parts.push(wallstring);
      parts.push("0");

      generated_string = parts.join("#")


      setMapString(generated_string)
      navigator.clipboard.writeText(generated_string).then(() => {
        setCopied(true); // Set "copied" state to true after copying
        setTimeout(() => setCopied(false), 200); // Reset "copied" feedback after 2 seconds
      });

      
    }
  
    const setTile = (x, y) =>{
      if(cellType==GridValues.EMPTY){
        if(y==aSpawn[0] && x ==aSpawn[1]){
          setASpawn([-1, -1])
          setBSpawn([-1, -1])
          setCanvasRerender(!canvasRerender)
        } else if(y==bSpawn[0] && x ==bSpawn[1]){
          setASpawn([-1, -1])
          setBSpawn([-1, -1])
          setCanvasRerender(!canvasRerender)
        } else if(walls[y][x]){
          walls[y][x] = false;
          const reflection = reflect(x, y);
          walls[reflection[1]][reflection[0]] = false;
          setCanvasRerender(!canvasRerender)
        }
      } else if(cellType == GridValues.SNAKE_A_HEAD){
        const reflection = reflect(x, y);
        if(reflection[0]!= x || reflection[1]!=y){
          setASpawn([x, y])
          setBSpawn(reflection)
        }
      } else if(cellType == GridValues.SNAKE_B_HEAD){
        const reflection = reflect(x, y);
        if(reflection[0]!= x || reflection[1]!=y){
          setBSpawn([x, y])
          setASpawn(reflection)
        }
        
      } else if(cellType == GridValues.WALL){
        walls[y][x] = true;
        const reflection = reflect(x, y);
        walls[reflection[1]][reflection[0]] = true;
        setCanvasRerender(!canvasRerender)
      }
    }


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
        setASpawn={setASpawn}
        setBSpawn={setBSpawn}
        setTile={setTile}
        rerender={canvasRerender}

      />
      <CellSelector setCellType={setCellType}/>
      <SymmetrySelector handleSymmetryChange={handleSymmetryChange}/>
      <ShowSpawn showSnakeStart={showSnakeStart} handleShowSnakeStart={handleShowSnakeStart}/>
      </div>

      <div>
      <MapSettings 
        mapHeight={mapHeight}
        handleHeightChange={handleHeightChange}
        mapWidth={mapWidth}
        handleWidthChange={handleWidthChange}
        appleRate={appleRate}
        handleAppleRateChange={handleAppleRateChange}
        appleNum={appleNum}
        handleAppleNumChange={handleAppleNumChange}
      />
      
      </div>

      <div>
        <button onClick={handleGenerateMap}>Generate Map</button>
        {showMapString && (
          <div>
            <p>{mapString}</p>
          </div>
        )}

        {copied && <p style={{ color: 'green' }}>Copied to clipboard!</p>}
      </div>
    </div>
  );
}