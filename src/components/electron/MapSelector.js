import React, { useEffect, useState } from 'react';

function MapSelector({ onSelectMap }) {
  const [maps, setMaps] = useState([]);
  const [selectedMap, setSelectedMap] = useState('');

  useEffect(() => {
    const fetchMaps = async () => {
      const maps = await window.electron.storeGet('maps');
      if (maps) {
        setMaps(maps);
        setSelectedMap(maps[0]); // Set the first map as the default selected map
      }
    };
    fetchMaps();
  }, []);

  const handleChange = (event) => {
    const selectedMap = event.target.value;
    setSelectedMap(selectedMap);
    if (onSelectMap) {
      onSelectMap(selectedMap);
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