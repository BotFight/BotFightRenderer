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

const speeds = [
  { label: "1x", value: 200 },
  { label: "2x", value: 100 },
  { label: "4x", value: 50 },
];

function Navigation({
  onBack,
  onForward,
  onInputChange,
  togglePlay,
  inputValue,
  isPlaying,
  onSpeedChange,
}) {
  return (
    <div className="flex flex-row gap-2 items-center">
      <button onClick={onBack} className="px-2 py-1 border rounded">Back</button>
      <button onClick={togglePlay} className="px-2 py-1 border rounded">
        {isPlaying ? "Pause" : "Play"}
      </button>
      <button onClick={onForward} className="px-2 py-1 border rounded">Forward</button>
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
