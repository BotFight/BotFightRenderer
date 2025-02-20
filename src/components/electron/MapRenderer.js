import React, { useEffect ,useState } from 'react';
import MapSettings from './MapSettings';
import ShowSpawn from './ShowSpawn';
import MapVis from './MapVis';
import CellSelector from './CellSelector'
import SymmetrySelector from './SymmetrySelector'

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
    const [appleRate, setAppleRate] = useState(50);
    const [appleNum, setAppleNum] = useState(1);
    const [symmetry, setSymmetry] = useState("Vertical");
    const [canvasRerender, setCanvasRerender] = useState(false)
    const [startSize, setStartSize] = useState(5)
    const [mapName, setMapName] = useState("")




    const [mapString, setMapString] = useState("");
    const [showMapString, setShowMapString] = useState(false);
    const [copied, setCopied] = useState(false);

    const min_map = 5;
    const max_map = 64;
    const min_apple_num = 1;
    const max_apple_num = 5;
    const min_apple_rate = 50;
    const max_apple_rate = 150;
    const min_start_size = 3;
    const max_start_size = 64;
    const min_size = 2;

    const reflect = (x, y) => {
      if(symmetry=="Vertical"){

        return [(mapWidth-1)-x, y];

      } else if(symmetry=="Horizontal"){
        return [x, (mapHeight-1)-y];

      } else if(symmetry=="Origin"){
        return [(mapWidth-1)-x, (mapHeight-1)-y];

      }
      
    }

    const handleCellChange = (event) => {
      const value = event.target.value;
      switch(value) {
          case "Space":
              setCellType(GridValues.EMPTY);
              break;
        //   case "Apple":
        //       setCellType(GridValues.APPLE);
        //       break;
          case "Wall":
              setCellType(GridValues.WALL);
              break;
          case "Snake A":
              setCellType(GridValues.SNAKE_A_HEAD);
              break;
          case "Snake B":
              setCellType(GridValues.SNAKE_B_HEAD);
              break;
      }
  };


    const handleHeightChange = (event) => {
        const value = parseInt(event.target.value, 10);
        const f = Math.max(Math.min(max_map, value), min_map)
        setMapHeight(f);
        setWalls(new Array(f).fill().map(() => new Array(mapWidth).fill(false)));
        setASpawn([-1, -1])
        setBSpawn([-1, -1])
    };

    const handleWidthChange = (event) => {
        const value = parseInt(event.target.value, 10);
        const f = Math.max(Math.min(max_map, value), min_map)
        setMapWidth(f);
        setWalls(new Array(mapHeight).fill().map(() => new Array(f).fill(false)));
        setASpawn([-1, -1])
        setBSpawn([-1, -1])
    };

    const handleAppleRateChange = (event) => {
      const value = parseInt(event.target.value, 10);
        setAppleRate(Math.max(Math.min(max_apple_rate, value), min_apple_rate))
    };

    const handleAppleNumChange = (event) => {
      const value = parseInt(event.target.value, 10);
        setAppleNum(Math.max(Math.min(max_apple_num, value), min_apple_num))
    };

    const handleShowSnakeStart = (event) => {
      setShowSnakeStart(event.target.checked); 
      setCanvasRerender(!canvasRerender)
    };

    const handleStartSizeChange = (event) => {
      const value = parseInt(event.target.value, 10);
        setStartSize(Math.max(Math.min(max_start_size, value), min_start_size))
    };


    const handleChangeMapName = (event) => {
        setMapName(event.target.value)
    };

    const handleSymmetryChange = (event) => {
      const value = event.target.value;
      setSymmetry(value);
      setWalls(new Array(mapHeight).fill().map(() => new Array(mapWidth).fill(false)));
      setASpawn([-1, -1])
      setBSpawn([-1, -1])
      
    };

    const handleSaveMap = async() => {
      const invalidChars = /[<>:"/\\|?*]/;
      if(mapName !="" && !invalidChars.test(mapName)){
        let mapPairs = await window.electron.storeGet("maps");
        let generated_string = getMapString();

        mapPairs[mapName] = generated_string;
        
        try {
          await window.electron.storeSet("maps", mapPairs);  // Send data to Electron to write to file
        } catch (error) {
          console.error('Error:', error);
        }

      }
      

    }

    const getMapString = () => {
      setShowMapString(true);

      let parts = [

      ]

      parts.push(mapWidth.toString()+","+mapHeight.toString());
      parts.push(aSpawn[0].toString()+","+aSpawn[1].toString());
      parts.push(bSpawn[0].toString()+","+bSpawn[1].toString());
      parts.push(startSize.toString());
      parts.push(min_size.toString());
      parts.push(appleRate.toString()+","+appleNum.toString()+","+symmetry);

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

      const generated_string = parts.join("#")

      return generated_string;
    }

    const handleGenerateMap = () => {
      
      let generated_string = getMapString();
      setMapString(generated_string);
      navigator.clipboard.writeText(generated_string).then(() => {
        setCopied(true); // Set "copied" state to true after copying
        setTimeout(() => setCopied(false), 5000); // Reset "copied" feedback after 2 seconds
      });
      return generated_string;
      
    }

  
    const setTile = (x, y) =>{
      if(cellType==GridValues.EMPTY){
        
        if(x==aSpawn[0] && y ==aSpawn[1]){
          setASpawn([-1, -1])
          setBSpawn([-1, -1])
          setCanvasRerender(!canvasRerender)
        } else if(x==bSpawn[0] && y ==bSpawn[1]){
          setASpawn([-1, -1])
          setBSpawn([-1, -1])
          setCanvasRerender(!canvasRerender)
        } else if(walls != null && walls[y][x]){
          
          walls[y][x] = false;
          const reflection = reflect(x, y);
          walls[reflection[1]][reflection[0]] = false;
          setCanvasRerender(!canvasRerender)
        }
      } else if(cellType == GridValues.SNAKE_A_HEAD){
        const reflection = reflect(x, y);
        if(reflection[0] != x || reflection[1] != y){
          if(walls != null && walls[y][x]){
            walls[y][x] = false;
            walls[reflection[1]][reflection[0]] = false;
          }
          if(reflection[0]!= x || reflection[1]!=y){
            setASpawn([x, y])
            setBSpawn(reflection)
          }
        }

        
      } else if(cellType == GridValues.SNAKE_B_HEAD){
        const reflection = reflect(x, y);
        if(reflection[0] != x || reflection[1] != y){
          if(walls != null && walls[y][x]){
            walls[y][x] = false;
            walls[reflection[1]][reflection[0]] = false;
          }
          if(reflection[0]!= x || reflection[1]!=y){
            setBSpawn([x, y])
            setASpawn(reflection)
          }
        }
        
      } else if(cellType == GridValues.WALL){
        if(x==aSpawn[0] && y ==aSpawn[1]){
          setASpawn([-1, -1])
          setBSpawn([-1, -1])
        } else if(x==bSpawn[0] && y ==bSpawn[1]){
          setASpawn([-1, -1])
          setBSpawn([-1, -1])
        }
        walls[y][x] = true;
        const reflection = reflect(x, y);
        walls[reflection[1]][reflection[0]] = true;
        setCanvasRerender(!canvasRerender)
      }
    }

    useEffect(() => {

      if(walls==null){
        setWalls(new Array(mapHeight).fill().map(() => new Array(mapWidth).fill(false)));
      }
    }, []);


  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-800 gap-2" >
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
      <div className="flex flex-row items-center justify-start gap-5">
      
      <CellSelector handleCellChange={handleCellChange}/>
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
        startSize={startSize}
        handleStartSizeChange={handleStartSizeChange}
      />
      
      </div>

      <div>
        <input
          type="text"
          value={mapName}
          onChange={handleChangeMapName}
          className="nav-input"
          placeholder="Map Name"
        />
        <button 
          onClick={handleSaveMap}

          style={{
            padding: '10px 20px',      // padding inside the button
            borderRadius: '25px',      // rounded corners
            backgroundColor: 'white',  // white background
            color: 'black',            // black text color
            border: '2px solid black', // black border
            cursor: 'pointer',        // pointer cursor on hover
            margin: '10px',            // margin outside the button (space outside the button)
            fontSize: '16px',          // text size
            fontWeight: 'bold'         // font weight
          }}
        >Save Map</button>
        <button 
          onClick={handleGenerateMap}

          style={{
            padding: '10px 20px',      // padding inside the button
            borderRadius: '25px',      // rounded corners
            backgroundColor: 'white',  // white background
            color: 'black',            // black text color
            border: '2px solid black', // black border
            cursor: 'pointer',        // pointer cursor on hover
            margin: '10px',            // margin outside the button (space outside the button)
            fontSize: '16px',          // text size
            fontWeight: 'bold'         // font weight
          }}
        >Copy Map String</button>
        
      </div>
      

      

      {/* {showMapString && (
          <div>
            <p>{mapString}</p>
          </div>
        )} */}

        {copied && <p style={{ color: 'green' }}>Copied to clipboard!</p>}
    </div>
  );
}