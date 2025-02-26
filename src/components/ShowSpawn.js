import React, { useState } from 'react';

function ShowSpawn ({
    showSnakeStart, handleShowSnakeStart
  }){

  return (
    <div>
      <label
        className="w-32 px-2 py-1 border rounded"
      >
        <input
          type="checkbox"
          checked={showSnakeStart} // bind the checkbox to the state
          onChange={handleShowSnakeStart} // handle the change event
                   
        />
        Show Spawn Location
      </label>
    </div>
  );
};

export default ShowSpawn;