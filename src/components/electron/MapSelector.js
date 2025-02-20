import React, { useEffect, useState } from 'react';

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
 } from "@/components/ui/select"

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
    };
    fetchMaps();
  }, []);

  const handleChange = (value) => {
    const selectedMap = value;
    setSelectedMap(selectedMap);
    if (onSelectMap) {
      onSelectMap(pairs[selectedMap]);
    }
  };

  return (
     <Select onValueChange={handleChange}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Select a Map" />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectLabel>Maps</SelectLabel>
            {maps.map((map) => (
              <SelectItem key={map} value={map}>
                {map}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>


  );
}

export default MapSelector;