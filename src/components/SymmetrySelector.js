import React, { useEffect, useState } from 'react'

export default function Selector({handleSymmetryChange}) {
    const [ids, setIds] = useState(["Vertical, Horizontal, Origin"]);
    useEffect(() => {
    }, []);
    


  return (
    <div>
        <select onChange={handleSymmetryChange}>
            {ids.map(id => <option key={id} value={id}>{id}</option>)}
        </select>
    </div>
  )
}
