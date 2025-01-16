import React, { useEffect, useState } from 'react'

export default function Selector({setCellType}) {
    const [ids, setIds] = useState(["Space", "Apple", "Wall", "Snake A", "Snake B"]);
    useEffect(() => {
    }, []);
    
    const handleCellChange = (event) => {
      const value = event.target.value;

      switch(value) {
          case "Space":
              setCellType(GridValues.EMPTY);
              break;
          case "Apple":
              setCellType(GridValues.APPLE);
              break;
          case "Walls":
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

  return (
    <div>
        <select onChange={handleCellChange}>
            {ids.map(id => <option key={id} value={id}>{id}</option>)}
        </select>
    </div>
  )
}
