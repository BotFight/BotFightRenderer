import React, { useEffect, useState } from 'react'
import {
 Select,
 SelectContent,
 SelectGroup,
 SelectItem,
 SelectLabel,
 SelectTrigger,
 SelectValue,
} from "@/components/ui/select"

export default function Selector({setMatchId}) {
  const [ids, setIds] = useState([]);
  useEffect(() => {
  fetch('https://botfightwebserver.onrender.com/api/v1/game-match-log/ids')
      .then(response => response.json())
      .then(data => {
          console.log('Fetched IDs:', data); // Log the response
          setIds(data);
        })    }, []);
 
  const handleChange = (value) => {
      setMatchId(value);
  }




return (
  <Select onValueChange={handleChange}>
    <SelectTrigger className="w-[180px]">
      <SelectValue placeholder="Select an Match ID" />
    </SelectTrigger>
    <SelectContent>
      <SelectGroup>
        <SelectLabel>Match IDs</SelectLabel>
        {ids.map((id) => (
          <SelectItem key={id} value={id}>
            {id}
          </SelectItem>
        ))}
      </SelectGroup>
    </SelectContent>
  </Select>
)
}
