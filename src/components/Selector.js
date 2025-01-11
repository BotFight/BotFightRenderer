import React, { useEffect, useState } from 'react'

export default function Selector({setMatchId}) {
    const [ids, setIds] = useState([]);
    useEffect(() => {
    fetch('https://botfightwebserver.onrender.com/api/v1/game-match-log/ids')
        .then(response => response.json())
        .then(data => {
            console.log('Fetched IDs:', data); // Log the response
            setIds(data);
          })    }, []);
    
    const handleChange = (event) => {
        setMatchId(event.target.value);
    }


  return (
    <div>
        <select onChange={handleChange}>
            {ids.map(id => <option key={id} value={id}>{id}</option>)}
        </select>
    </div>
  )
}
