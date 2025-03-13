import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";

import { Button } from "@/components/ui/button";
import { useEffect, useState } from 'react';
import { IconPlayerPlayFilled, IconPlayerPauseFilled, IconPlayerTrackNextFilled, IconPlayerTrackPrevFilled } from '@tabler/icons-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

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

  const stateCount = matchStates ? matchStates.length - 1 : 0;

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
  }, [matchStates]);

  useEffect(() => {
    if (!matchStates) return;
    
    const handleKeyDown = (event) => {
      if (event.key === "ArrowLeft") {
        onBack();
      } else if (event.key === "ArrowRight") {
        onForward();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  },  [matchStates]);


  return (
    <div className="flex flex-row gap-2 items-center bg-zinc-800 p-4 rounded-xl w-full">

      <PlayerButton onClick={onBack} disabled={!matchStates && isRunningInElectron} tooltip="Prev Step">
        <IconPlayerTrackPrevFilled />
      </PlayerButton>

      <PlayerButton onClick={togglePlay} disabled={!matchStates && isRunningInElectron} tooltip={isPlaying ? "Pause" : "Play"}>
        {isPlaying ? <IconPlayerPauseFilled /> : <IconPlayerPlayFilled />}
      </PlayerButton>

      <PlayerButton onClick={onForward} disabled={!matchStates && isRunningInElectron} tooltip="Next Step">
        <IconPlayerTrackNextFilled />
      </PlayerButton>

      {stateCount > 0 ? (
        <Slider min={0} max={stateCount} step={1} className="w-[95%] mx-2" value={[inputValue]} onValueChange={onInputChange} />
      ) : (
        <Slider defaultValue={[0]} min={0} max={1} step={1} className="w-[95%] mx-2" disabled={true} />
      )}

      <Select onValueChange={(value) => onSpeedChange({ target: { value } })} defaultValue={200} disabled={!matchStates && isRunningInElectron}>
        <SelectTrigger className="w-16 bg-zinc-700 border-none text-zinc-50 font-bold rounded px-4 py-2 hover:bg-zinc-700 hover:opacity-80 transition-all duration-300">
          <SelectValue />
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

function PlayerButton({ onClick, disabled, tooltip, children }) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button onClick={onClick} disabled={disabled} className="px-4 py-2 bg-zinc-700 text-zinc-50 font-bold  rounded hover:bg-zinc-700 hover:opacity-80 transition-all duration-300 flex items-center justify-center">
            {children}
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p className="text-md">{tooltip}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}