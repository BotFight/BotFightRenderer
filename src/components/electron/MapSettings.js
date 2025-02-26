import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

function MapSettings({
  mapHeight, handleHeightChange,
  mapWidth, handleWidthChange,
  appleRate, handleAppleRateChange,
  appleNum, handleAppleNumChange,
  startSize, handleStartSizeChange
}) {
    return (
      <div className="flex flex-row items-start justify-start gap-5">
        <div >
          <label htmlFor="mapHeight" className="block text-white font-bold">Map Height:</label>
          <input
            id="mapHeight"
            type="number"
            value={mapHeight}
            onChange={handleHeightChange}
            className="nav-input px-2 py-1 border rounded"
            placeholder="Map Height"
          />
        </div>

        <div>
          <label htmlFor="mapWidth" className="block text-white font-bold">Map Width:</label>
          <input
            id="mapWidth"
            type="number"
            value={mapWidth}
            onChange={handleWidthChange}
            className="nav-input px-2 py-1 border rounded"
            placeholder="Map Width"
          />
        </div>

        <div>
          <label htmlFor="appleRate" className="block text-white font-bold">Apple Spawn Rate:</label>
          <input
            id="appleRate"
            type="number"
            value={appleRate}
            onChange={handleAppleRateChange}
            className="nav-input px-2 py-1 border rounded"
            placeholder="Apple Spawn Rate"
          />
        </div>

        <div>
          <label htmlFor="appleNum" className="block text-white font-bold">Apple Spawn #:</label>
          <input
            id="appleNum"
            type="number"
            value={appleNum}
            onChange={handleAppleNumChange}
            className="nav-input px-2 py-1 border rounded"
            placeholder="Apple Spawn #"
          />
        </div>

        <div>
          <label htmlFor="startSize" className="block text-white font-bold">Start Size:</label>
          <input
            id="startSize"
            type="number"
            value={startSize}
            onChange={handleStartSizeChange}
            className="nav-input px-2 py-1 border rounded"
            placeholder="Start Size"
          />
        </div>
      </div>
    );
}

export default MapSettings;
