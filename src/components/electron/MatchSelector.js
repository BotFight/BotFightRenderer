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

export default function MatchSelector({setMatchId}) {
  const [ids, setIds] = useState([]);
  useEffect(() => {
    const fetchMatches = async () => {
      const files = await window.electron.getMatches();
      setIds(files);
    }
    fetchMatches();
  }, []);
 
  const handleChange = (value) => {
      setMatchId(value);
  }


return (
  <Select onValueChange={handleChange}>
    <SelectTrigger className="w-[180px]">
      <SelectValue placeholder="Select a Match ID" />
    </SelectTrigger>
    <SelectContent>
      <SelectGroup>
        <SelectLabel>Match IDs</SelectLabel>
        {ids.map((id) => (
          <SelectItem key={id} value={id}>
            {id.substring(0, id.length-5)}
          </SelectItem>
        ))}
      </SelectGroup>
    </SelectContent>
  </Select>
)
}
