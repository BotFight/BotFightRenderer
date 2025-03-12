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

export default function MatchSelector({ matchId, setMatchId, matches }) {

  const handleChange = (value) => {
    setMatchId(value);
  }

  return (
    <Select value={matchId} onValueChange={handleChange}>
      <SelectTrigger className="w-[120px] bg-zinc-800">
        <SelectValue >{matchId && matchId.length > 5 ? matchId.substring(0, matchId.length - 5) : "(None)"}</SelectValue>
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectLabel>Match IDs</SelectLabel>
          {matches.map((id) => (
            <SelectItem key={id} value={id}>
              {id.substring(0, id.length - 5)}
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  )
}
