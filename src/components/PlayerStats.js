import React, { useEffect, useState } from 'react';

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
        <div className="player-stats p-4 border rounded shadow-md w-full max-w-md text-white space-y-2">
          <h2 className="text-lg font-bold mb-4">Player Stats</h2>
          <div className="flex flex-col gap-2">
            <div>
              <strong >Player <span className='text-green-500'>A</span> :</strong> 
              <span> Apples Eaten: N/A, Length: N/A</span>
            </div>
            <div>
              <strong>Player <span className='text-blue-500'>B</span>:</strong> 
              <span> Apples Eaten: N/A, Length: N/A</span>
            </div>
            <div>
              <strong>Turn:</strong> N/A
            </div>
          </div>
          <div className="flex flex-row justify-between">
            <div className="space-x-2"> 
              <strong>Player <span className='text-green-500'>A</span> Time:</strong>
              <div>N/A</div>              
            </div>
            <div className="space-x-2"> 
              <strong>Player <span className='text-blue-500'>B</span> Time:</strong>              
              <div>N/A</div>              
            </div>
        </div>
        </div>
      );
    }
    return <div>Loading match states...</div>;
  }
  
  const { a_apples_eaten, b_apples_eaten, a_length, b_length, a_to_play, time_a, time_b } = currentMatchState;

  return (
    <div className="player-stats p-4 border rounded shadow-md w-full max-w-md text-white space-y-2">
      <h2 className="text-lg font-bold mb-4">Player Stats</h2>
      <div className="flex flex-col gap-2">
        <div>
          <strong>Player  <span className='text-green-500'>A</span>:</strong> 
          <span> Apples Eaten: {a_apples_eaten}, Length: {a_length}</span>
        </div>
        <div>
          <strong>Player <span className='text-blue-500'>B</span>:</strong> 
          <span> Apples Eaten: {b_apples_eaten}, Length: {b_length}</span>
        </div>
        <div>
          <strong>Turn:</strong> {a_to_play ?  <span className='text-green-500'>A</span> : <span className='text-blue-500'>B</span>}
        </div>
      </div>
      <div className="flex flex-row justify-between space-x-4">
            <div className="space-x-2 flex flex-col"> 
              <strong>Player <span className='text-green-500'>A</span> Time:</strong>
              <span>{time_a.toFixed(2)}</span>
            </div>
            <div className="space-x-2 flex flex-col"> 
              <strong>Player <span className='text-blue-500'>B</span> Time:</strong>
              <span>{time_b.toFixed(2)}</span>
            </div>
        </div>
    </div>
  );
}