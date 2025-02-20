import Selector from './Selector';
import React, { useEffect ,useState } from 'react';


function Deleter() {

  const [match, setMatch] = useState(null);
  const [map, setMap] = useState(null);

  const [maps, setMaps] = useState({});
  const [matches, setMatches] = useState([]);

  const handleDeleteMap = async() => {
    await window.electron.deleteMap(map);
    
    delete maps[map]
    setMaps(maps)
    setMap(null);
  }

  const handleDeleteMaps = async() => {
    await window.electron.deleteMaps();
    setMap(null);
    const mapPairs = await window.electron.storeGet("maps")
    setMaps(mapPairs)
  }

  const handleDeleteMatch = async() => {
    const matchJSON = match +".json";
    const updatedMatches = matches.filter(m => m !== match);
    setMatches(updatedMatches)
    setMatch(null)
    await window.electron.deleteMatch(matchJSON);
    
    
  }

  const handleDeleteMatches = async() => {
    setMatches([]);
    setMatch(null);
    await window.electron.deleteMatches();
    
  }

  useEffect(()=>{
    const start = async () => {
      
      const matchJSONS = await window.electron.getMatches();
      const matchIDs = matchJSONS.map(word => {
        return word.length > 5 ? word.slice(0, -5) : word;
      });
      setMatches(matchIDs);

      console.log("hello")

      const mapPairs = await window.electron.storeGet("maps")
      setMaps(mapPairs)


      console.log(matchIDs)
      console.log(mapPairs)
      
    }
    start();
  }, []);
  

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-800 gap-2" >
    <div>
      <Selector dict={Object.keys(maps)} setValue={setMap} message={"Select a map"} label={"Map"}/>
      <button
        onClick={handleDeleteMap}
        className="px-4 py-2 rounded bg-red-800 text-white hover:bg-red-700">
          Delete Map
        </button>

        <button
        onClick={handleDeleteMaps}
        className="px-4 py-2 rounded bg-red-800 text-white hover:bg-red-700">
          Delete Custom Maps
        </button>
        
    </div>

      <div>
      <Selector dict={matches} setValue={setMatch} message={"Select a match"} label={"Match ID"}/>
        <button
          onClick={handleDeleteMatch}
          className="px-4 py-2 rounded bg-red-800 text-white hover:bg-red-700">
            Delete Match
          </button>

          <button
          onClick={handleDeleteMatches}
          className="px-4 py-2 rounded bg-red-800 text-white hover:bg-red-700">
            Delete All Matches
          </button>
        
      </div>
    </div>
      
  );
}

export default Deleter;