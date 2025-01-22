import React, { useEffect } from 'react';

export default function PlayerStats({ currentMatchStateIndex, matchStates }) {
  const currentMatchState = matchStates ? matchStates[currentMatchStateIndex] : null;

  if (!currentMatchState) {
    return <div>Loading Player Stats...</div>;
  }

  const { a_apples_eaten, b_apples_eaten, a_length, b_length, a_to_play } = currentMatchState;

  return (
    <div className="player-stats p-4 border rounded shadow-md w-full max-w-md">
      <h2 className="text-lg font-bold mb-4">Player Stats</h2>
      <div className="flex flex-col gap-2">
        <div>
          <strong>Player A:</strong> 
          <span> Apples Eaten: {a_apples_eaten}, Length: {a_length}</span>
        </div>
        <div>
          <strong>Player B:</strong> 
          <span> Apples Eaten: {b_apples_eaten}, Length: {b_length}</span>
        </div>
        <div>
          <strong>Turn:</strong> {a_to_play ? "Player A" : "Player B"}
        </div>
      </div>
    </div>
  );
}
