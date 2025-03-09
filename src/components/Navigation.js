import React from 'react'
import { Input } from './ui/input';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { Button } from "@/components/ui/button";
import { useEffect, useState } from 'react';

const speeds = [
  { label: "1x", value: 200 },
  { label: "2x", value: 100 },
  { label: "4x", value: 50 },
  { label: "8x", value: 25 }
];

function Navigation({
  onBack,
  onForward,
  onInputChange,
  togglePlay,
  inputValue,
  isPlaying,
  onSpeedChange,  
  matchStates  
}) {
  const [isRunningInElectron, setIsRunningInElectron] = useState(false);

  useEffect(() => {
    const checkElectron = () => {
      return (
        navigator.userAgent.indexOf('Electron') !== -1 ||
        !!(window.process && window.process.versions && window.process.versions.electron)
      );
    };
    
    setIsRunningInElectron(checkElectron());
  }, []);

  useEffect(() => {
    console.log("match states", matchStates);
    console.log(isRunningInElectron);
  } , [matchStates]);


  
  return (
    <div className="flex flex-row gap-2 items-center">
      <Button onClick={onBack} disabled={!matchStates && isRunningInElectron} className="px-4 py-2 bg-yellow-500 text-black font-bold  rounded hover:bg-yellow-400">
        Back
      </Button>
      <Button onClick={togglePlay} disabled={!matchStates && isRunningInElectron} className="px-4 py-2 bg-yellow-500 text-black font-bold rounded hover:bg-yellow-400">
        {isPlaying ? "Pause" : "Play"}
      </Button>
      <Button onClick={onForward} disabled={!matchStates && isRunningInElectron}  className="px-4 py-2 bg-yellow-500 text-black font-bold rounded hover:bg-yellow-400">
        Forward
      </Button>
      <Input
        type="number"
        value={inputValue}
        onChange={onInputChange}
        className="w-16 px-2 py-1 border rounded"
      />
      <Select onValueChange={(value) => onSpeedChange({ target: { value } })}>
        <SelectTrigger className="w-[120px]">
          <SelectValue placeholder="Speed" />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            {speeds.map((speed) => (
              <SelectItem key={speed.value} value={speed.value}>
                {speed.label}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
    </div>
  );
}

export default Navigation;
