import React from 'react'
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
      <div>
        
        <input
          type="number"
          value={mapHeight}
          onChange={handleHeightChange}
          className="nav-input"
          placeholder="Map Height"
        />

      </div>
      <div>
      <input
          type="number"
          value={mapWidth}
          onChange={handleWidthChange}
          className="nav-input"
          placeholder="Map Width"
        />
      </div>
      <div>
      <input
          type="number"
          value={appleRate}
          onChange={handleAppleRateChange}
          className="nav-input"
          placeholder="Apple Spawn Rate"
        />
      </div>
      <div>
      <input
          type="number"
          value={appleNum}
          onChange={handleAppleNumChange}
          className="nav-input"
          placeholder="Apple Spawn #"
        />
      </div>
      <div>
      <input
          type="number"
          value={startSize}
          onChange={handleStartSizeChange}
          className="nav-input"
          placeholder="Start Size"
        />
      </div>
      
      
    </div>
  )
}

export default MapSettings