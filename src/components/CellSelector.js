import { useState } from 'react'

export default function CellSelector({handleCellChange}) {
  const [ids, setIds] = useState(["Space", "Wall", "Snake A", "Snake B", "Portal 1", "Portal 2"]);

    
  return (
    <div>
        <select onChange={handleCellChange} className="w-32 px-2 py-1 border rounded">
            {ids.map(id => <option key={id} value={id}>{id}</option>)}
        </select>
    </div>
  )
}
