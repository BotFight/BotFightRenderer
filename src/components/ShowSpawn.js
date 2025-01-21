import React, { useState } from 'react';

function ShowSpawn ({
    showSnakeStart, handleShowSnakeStart
  }){

  return (
    <div>
      <label
        style={{
          color: 'black',              // text color
          backgroundColor: 'white',    // white background for label
          padding: '2px 2px',         // padding inside the label for spacing
          borderRadius: '2px',         // optional: rounded corners for label
          alignItems: 'center',        // vertically align checkbox and text
        }}
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