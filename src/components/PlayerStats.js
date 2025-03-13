import { useEffect, useState } from 'react';

export default function PlayerStats({ currentMatchStateIndex, matchStates }) {
  const currentMatchState = matchStates ? matchStates[currentMatchStateIndex] : null;
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

  if (!currentMatchState) {
    if (isRunningInElectron) {
      return (
        <div className="p-4 border border-zinc-700 rounded-lg shadow-md w-full text-zinc-500 h-[16.5rem] flex justify-center items-center italic text-lg bg-zinc-900">
          Play a match to view stats
        </div>
      );
    }
    return (
      <div className="p-4 border border-zinc-700 rounded-lg shadow-md w-full text-zinc-500 h-[16.5rem] flex justify-center items-center italic text-lg bg-zinc-900">
        Loading match states...
      </div>
    )
  }

  const { a_apples_eaten, b_apples_eaten, a_length, b_length, a_to_play, time_a, time_b } = currentMatchState;

  return (
    <div className="player-stats p-4 border border-zinc-700 rounded-lg shadow-md w-full text-white bg-zinc-900 flex flex-row gap-4 h-[16.5rem]">
        <div className={`flex flex-col items-center p-4 rounded-lg bg-zinc-900 w-full text-center gap-2 border-2 ${a_to_play ? "border-green-800" : "border-zinc-800"}`}>
          <h3 className="mb-2">Player <span className="text-green-500 font-bold">A</span></h3>
          <div className="flex p-2 rounded-md bg-zinc-800 w-full text-sm justify-center items-center text-zinc-300">
              Apples Eaten:<span className="text-zinc-50 font-bold ml-1">{a_apples_eaten}</span>
          </div>
          <div className="flex p-2 rounded-md bg-zinc-800 w-full text-sm justify-center items-center text-zinc-300">
              Length:<span className="text-zinc-50 font-bold ml-1">{a_length}</span>
          </div>
          <div className="flex p-2 rounded-md bg-zinc-800 w-full text-sm justify-center items-center text-zinc-300">
              Time:<span className="text-zinc-50 font-bold ml-1">{time_a.toFixed(2)}</span>
          </div>
          <div className="flex p-2 rounded-md bg-green-600 w-full text-sm justify-center items-center text-zinc-300 mt-2"></div>
        </div>
        
        <div className={`flex flex-col items-center p-4 rounded-lg bg-zinc-900 w-full text-center gap-2 border-2 ${a_to_play ? "border-zinc-800" : "border-blue-800"}`}>
          <h3 className="mb-2">Player <span className="text-blue-500 font-bold">B</span></h3>
          <div className="flex p-2 rounded-md bg-zinc-800 w-full text-sm justify-center items-center text-zinc-300">
              Apples Eaten:<span className="text-zinc-50 font-bold ml-1">{b_apples_eaten}</span>
          </div>
          <div className="flex p-2 rounded-md bg-zinc-800 w-full text-sm justify-center items-center text-zinc-300">
              Length:<span className="text-zinc-50 font-bold ml-1">{b_length}</span>
          </div>
          <div className="flex p-2 rounded-md bg-zinc-800 w-full text-sm justify-center items-center text-zinc-300">
              Time:<span className="text-zinc-50 font-bold ml-1">{time_b.toFixed(2)}</span>
          </div>
          <div className="flex p-2 rounded-md bg-blue-600 w-full text-sm justify-center items-center text-zinc-300 mt-2"></div>
        </div>
      </div>
  );
}