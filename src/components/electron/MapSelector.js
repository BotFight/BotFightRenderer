import React, { useEffect, useState } from 'react';

function MapSelector({ onSelectMap }) {
  const [maps, setMaps] = useState([]);
  const [selectedMap, setSelectedMap] = useState('');
  const [pairs, setPairs] = useState({});

  useEffect(() => {
    const fetchMaps = async() => {
      const mapPairs = await window.electron.storeGet("maps");

      const maps = Object.keys(mapPairs);



      setMaps(maps);
      setPairs(mapPairs);
      onSelectMap(mapPairs[maps[0]])
    };
    fetchMaps();
  }, []);

  const handleChange = (event) => {
    const selectedMap = event.target.value;
    setSelectedMap(selectedMap);
    if (onSelectMap) {
      onSelectMap(pairs[selectedMap]);
    }
  };

  return (
    <div className='flex flex-col items-center'>
      <h1 className='text-white'>Map</h1>
      <select value={selectedMap} onChange={handleChange} className="p-2 border rounded">
        {maps.map((map) => (
          <option key={map} value={map}>
            {map}
          </option>
        ))}
      </select>
    </div>
  );
}

export default MapSelector;