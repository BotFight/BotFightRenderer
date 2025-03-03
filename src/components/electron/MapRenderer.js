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
    START_PORTAL:7,
    END_PORTAL:8
}

export default function MapRenderer() {
    const [showSnakeStart, setShowSnakeStart] = useState(true); 
    const [aSpawn, setASpawn] = useState([-1, -1]); 
    const [bSpawn, setBSpawn] = useState([-1, -1]);
    const [mapHeight, setMapHeight] = useState(20); 
    const [mapWidth, setMapWidth] = useState(20);  
    const [walls, setWalls] = useState(null);  // Array to store wall positions, initially empty
    const [portals, setPortals] = useState(null);  // Array to store wall positions, initially empty
    const [cellType, setCellType] = useState(GridValues.EMPTY);
    const [appleRate, setAppleRate] = useState(50);
    const [appleNum, setAppleNum] = useState(1);
    const [symmetry, setSymmetry] = useState("Vertical");
    const [canvasRerender, setCanvasRerender] = useState(false)
    const [startSize, setStartSize] = useState(5)
    const [mapName, setMapName] = useState("")
    const [startPortal, setStartPortal] = useState([-1, -1])
    const [endPortal, setEndPortal] = useState([-1, -1])

    const min_map = 1;
    const max_map = 64;
    const min_apple_num = 1;
    const max_apple_num = 5;
    const min_apple_rate = 1;
    const max_apple_rate = 150;
    const min_start_size = 1;
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
          case "Portal 1":
              setCellType(GridValues.START_PORTAL)
              break;
          case "Portal 2":
              setCellType(GridValues.END_PORTAL)
              break
      }
  };


    const handleHeightChange = (event) => {
        const value = parseInt(event.target.value, 10);
        const f = Math.max(Math.min(max_map, value), min_map)
        setMapHeight(f);
        setWalls(new Array(f).fill().map(() => new Array(mapWidth).fill(false)));
        setPortals(new Array(f).fill().map(() => new Array(mapWidth).fill(-1)));
        setASpawn([-1, -1])
        setBSpawn([-1, -1])
        setStartPortal([-1, -1])
        setEndPortal([-1, -1])
    };

    const handleWidthChange = (event) => {
        const value = parseInt(event.target.value, 10);
        const f = Math.max(Math.min(max_map, value), min_map)
        setMapWidth(f);
        setWalls(new Array(mapHeight).fill().map(() => new Array(f).fill(false)));
        setPortals(new Array(mapHeight).fill().map(() => new Array(f).fill(-1)));
        setASpawn([-1, -1])
        setBSpawn([-1, -1])
        setStartPortal([-1, -1])
        setEndPortal([-1, -1])
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
      setPortals(new Array(mapHeight).fill().map(() => new Array(mapWidth).fill(-1)));
      setASpawn([-1, -1])
      setBSpawn([-1, -1])
      setStartPortal([-1, -1])
      setEndPortal([-1, -1])
      
    };

    const handleSaveMap = async() => {
      const invalidChars = /[<>:"/\\|?*]/;
      if(mapName !="" && !invalidChars.test(mapName)){
        let mapPairs = await window.electron.storeGet("maps");
        let generated_string = getMapString();

        mapPairs[mapName] = generated_string;
        
        try {
          await window.electron.storeSet("maps", mapPairs);  // Send data to Electron to write to file
          alert("Map saved successfully!");
        } catch (error) {
          console.error('Error:', error);
        }

      }
      

    }

    const getMapString = () => {
      let parts = [

      ]
      
      let portalList=[]

      for(let i = 0; i< mapHeight; i++){
        for(let j = 0; j< mapWidth; j++){
          let portalString = []
          if(portals[i][j] >= 0){
            let othery = Math.floor(portals[i][j] / mapWidth)
            let otherx = portals[i][j] % mapWidth

            portalString.push(j)
            portalString.push(i)
            portalString.push(otherx)
            portalString.push(othery)

            portalList.push(portalString.join(","))

          } 
        }
      }

      parts.push(mapWidth.toString()+","+mapHeight.toString());
      parts.push(aSpawn[0].toString()+","+aSpawn[1].toString());
      parts.push(bSpawn[0].toString()+","+bSpawn[1].toString());
      parts.push(startSize.toString());
      parts.push(min_size.toString());
      parts.push(portalList.join("|"));
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
      navigator.clipboard.writeText(generated_string).then(() => {
        alert("Map string copied to clipboard!");
      });
      return generated_string;
      
    }

  
    const setTile = (x, y) =>{
      if(cellType != GridValues.START_PORTAL && cellType != GridValues.END_PORTAL){
        setStartPortal([-1, -1])
        setEndPortal([-1, -1])
      }
      if(cellType==GridValues.EMPTY){
        if(x==aSpawn[0] && y ==aSpawn[1]){
          setASpawn([-1, -1])
          setBSpawn([-1, -1])

        } else if(x==bSpawn[0] && y ==bSpawn[1]){
          setASpawn([-1, -1])
          setBSpawn([-1, -1])
        } else if(walls != null && walls[y][x]){
          
          walls[y][x] = false;
          const reflection = reflect(x, y);
          walls[reflection[1]][reflection[0]] = false;
        } else if(portals != null && portals[y][x] >= 0){
          const partnerPortal = portals[y][x]

          const partnerPortalX = partnerPortal % mapWidth
          const partnerPortalY = Math.floor(partnerPortal / mapWidth)

          portals[y][x] = -1;
          portals[partnerPortalY][partnerPortalX] = -1;
        }
      } else if(cellType == GridValues.SNAKE_A_HEAD){
        const reflection = reflect(x, y);
        if(reflection[0] != x || reflection[1] != y){
          if(walls != null && walls[y][x]){
            walls[y][x] = false;
            walls[reflection[1]][reflection[0]] = false;
          } else if(portals != null && portals[y][x] >= 0){
            const partnerPortal = portals[y][x]
  
            const partnerPortalX = partnerPortal % mapWidth
            const partnerPortalY = Math.floor(partnerPortal / mapWidth)
  
            portals[y][x] = -1;
            portals[partnerPortalY][partnerPortalX] = -1;
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
          }else if(portals != null && portals[y][x] >= 0){
            const partnerPortal = portals[y][x]
  
            const partnerPortalX = partnerPortal % mapWidth
            const partnerPortalY = Math.floor(partnerPortal / mapWidth)
  
            portals[y][x] = -1;
            portals[partnerPortalY][partnerPortalX] = -1;
          }
          if(reflection[0]!= x || reflection[1]!=y){
            setBSpawn([x, y])
            setASpawn(reflection)
          }
        }
        
      } else if(cellType == GridValues.WALL){
        const reflection = reflect(x, y);
        if(x==aSpawn[0] && y ==aSpawn[1]){
          setASpawn([-1, -1])
          setBSpawn([-1, -1])
        } else if(x==bSpawn[0] && y ==bSpawn[1]){
          setASpawn([-1, -1])
          setBSpawn([-1, -1])
        } else if(portals != null && portals[y][x] >= 0){
          const partnerPortal = portals[y][x]

          const partnerPortalX = partnerPortal % mapWidth
          const partnerPortalY = Math.floor(partnerPortal / mapWidth)

          portals[y][x] = -1;
          portals[partnerPortalY][partnerPortalX] = -1;
        }
        walls[y][x] = true;
        walls[reflection[1]][reflection[0]] = true;
      } else if(cellType == GridValues.START_PORTAL){
        const reflection = reflect(x, y);
        if(x==aSpawn[0] && y ==aSpawn[1]){
          setASpawn([-1, -1])
          setBSpawn([-1, -1])
        } else if(x==bSpawn[0] && y ==bSpawn[1]){
          setASpawn([-1, -1])
          setBSpawn([-1, -1])
        } else if(walls != null && walls[y][x]){
          walls[y][x] = 0;
          walls[reflection[1]][reflection[0]] = 0;
        } else if(portals != null && portals[y][x] >= 0){
          const partnerPortal = portals[y][x]

          const partnerPortalX = partnerPortal % mapWidth
          const partnerPortalY = Math.floor(partnerPortal / mapWidth)

          portals[y][x] = -1;
          portals[partnerPortalY][partnerPortalX] = -1;
        

        }

        if(endPortal[0] != -1){
          portals[y][x] = endPortal[1] * mapWidth + endPortal[0]
          portals[endPortal[1]][endPortal[0]] = y * mapWidth + x
          setEndPortal([-1, -1])

        } else{
          setStartPortal([x, y])
        }
      } else if(cellType == GridValues.END_PORTAL){
        const reflection = reflect(x, y);
        if(x==aSpawn[0] && y ==aSpawn[1]){
          setASpawn([-1, -1])
          setBSpawn([-1, -1])
        } else if(x==bSpawn[0] && y ==bSpawn[1]){
          setASpawn([-1, -1])
          setBSpawn([-1, -1])
        } else if(walls != null && walls[y][x] > 0){
          walls[y][x] = 0;
          walls[reflection[1]][reflection[0]] = 0;
        } else if(portals != null && portals[y][x] >= 0){
          const partnerPortal = portals[y][x]

          const partnerPortalX = partnerPortal % mapWidth
          const partnerPortalY = Math.floor(partnerPortal / mapWidth)

          portals[y][x] = -1;
          portals[partnerPortalY][partnerPortalX] = -1;
        }
        if(startPortal[0] != -1){
          portals[y][x] = startPortal[1] * mapWidth + startPortal[0]
          portals[startPortal[1]][startPortal[0]] = y * mapWidth + x
          setStartPortal([-1, -1])

        } else{
          setEndPortal([x, y])
        }
      }
      setCanvasRerender(!canvasRerender)
    }

    useEffect(() => {

      if(walls==null){
        setWalls(new Array(mapHeight).fill().map(() => new Array(mapWidth).fill(false)));
      }
      if(portals == null){
        setPortals(new Array(mapHeight).fill().map(() => new Array(mapWidth).fill(-1)));
      }
    }, []);


  return (
    <div className="flex-grow flex flex-col items-center justify-center bg-gray-800 gap-5" >
      <MapVis
        showSnakeStart={showSnakeStart}
        aSpawn={aSpawn}
        bSpawn={bSpawn}
        startPortal={startPortal}
        endPortal={endPortal}
        mapHeight={mapHeight}
        mapWidth={mapWidth}
        walls={walls}
        portals={portals}
        cellType={cellType}
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

      <div className="flex flex-row gap-5 items-center">
        <input
          type="text"
          value={mapName}
          onChange={handleChangeMapName}
          className="nav-input px-2 py-1 border rounded"
          placeholder="Map Name"
        />
        <button 
          onClick={handleSaveMap}

          className="px-4 py-2 bg-yellow-500 text-black font-bold  rounded hover:bg-yellow-400"
        >Save Map</button>
        <button 
          onClick={handleGenerateMap}
          className="px-4 py-2 bg-yellow-500 text-black font-bold  rounded hover:bg-yellow-400"
        >Copy Map String</button>
        
      </div>

    </div>
  );
}