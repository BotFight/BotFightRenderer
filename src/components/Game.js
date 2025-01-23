'use client';

import { useEffect, useRef, useState } from 'react';
import { Direction } from '../replay/game_engine';

const GridValues = {
    EMPTY: 0,
    PLAYER_A: 1,
    PLAYER_B: 2,
    WALL:3
}

export default function Game({ currentMatchStateIndex,  matchStates }) {
  const canvasRef = useRef(null);
  const [grid, setGrid] = useState([]);    
  const [gridSizeWidth, setGridSizeWidth] = useState(0); 
  const [gridSizeHeight, setGridSizeHeight] = useState(0);
  const cellSize = 30;

  useEffect(() => {
    if (!matchStates) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    setGridSizeHeight(matchStates[0].map_state.length);
    setGridSizeWidth(matchStates[0].map_state[0].length);
    setGrid(matchStates[currentMatchStateIndex].map_state);

    const width = gridSizeWidth * cellSize;
    const height = gridSizeHeight * cellSize;

    canvas.width = width;
    canvas.height = height;

    const drawTile = (x, y, color) => {
        ctx.fillStyle = color;
        ctx.fillRect(x * cellSize, y * cellSize, cellSize, cellSize);
    }
       
    const drawPlayer = (x, y, color) => {
       
      }
       

       const drawWall = (x, y) => {
        ctx.fillStyle = 'black';
        ctx.fillRect(x * cellSize, y * cellSize, cellSize, cellSize);
       }

       const drawCell = (x, y) => {
        switch (grid[x][y]) {
            case GridValues.WALL:
                drawWall(y, x);
                break;
            case GridValues.PLAYER_A:
                drawPlayer(y, x, 'green');
                break;
            case GridValues.PLAYER_B:
                drawPlayer(y, x, 'blue');
                break;
        }
    }


    
    for (let x = 0; x < gridSizeHeight; x++) {
        for (let y = 0; y < gridSizeWidth; y++) {
            drawTile(x, y, '#B19E4E');
        }
    }

    for (let x = 0; x < gridSizeHeight; x++) {
        for (let y = 0; y < gridSizeWidth; y++) {
            drawCell(x, y);
        }
    }
  }, [grid, matchStates, gridSizeWidth, gridSizeHeight, cellSize, currentMatchStateIndex]);

  return (
    <div className="flex justify-center items-center bg-gray-100 min-w-screen">
      <canvas
        ref={canvasRef}
        width={400}
        height={400}
        className="border border-gray-300 bg-white"
      />
    </div>
  );
}