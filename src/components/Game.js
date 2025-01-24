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
 const cellSize = 30;


 useEffect(() => {

  const canvas = canvasRef.current;
  const ctx = canvas.getContext('2d');

  const drawTile = (x, y, color) => {
    ctx.fillStyle = color;
    ctx.fillRect(x * cellSize, y * cellSize, cellSize, cellSize);
  }

  if (matchStates) {
    
    const gridSizeWidth = matchStates[0].map_state.length;
    const gridSizeHeight = matchStates[0].map_state[0].length;


    const width = gridSizeWidth * cellSize;
    const height = gridSizeHeight * cellSize;


    canvas.width = width;
    canvas.height = height;


    
      


      const drawWall = (x, y) => {
        const padding = 4;
        const cornerRadius = 4;
      
        const left = x * cellSize + padding;
        const top = y * cellSize + padding;
        const width = cellSize - 2 * padding;
        const height = cellSize - 2 * padding;
      
        ctx.fillStyle = 'brown';
      
        ctx.beginPath();
        ctx.moveTo(left + cornerRadius, top);
        ctx.lineTo(left + width - cornerRadius, top); // Top edge
        ctx.quadraticCurveTo(left + width, top, left + width, top + cornerRadius); // Top-right corner
        ctx.lineTo(left + width, top + height - cornerRadius); // Right edge
        ctx.quadraticCurveTo(left + width, top + height, left + width - cornerRadius, top + height); // Bottom-right corner
        ctx.lineTo(left + cornerRadius, top + height); // Bottom edge
        ctx.quadraticCurveTo(left, top + height, left, top + height - cornerRadius); // Bottom-left corner
        ctx.lineTo(left, top + cornerRadius); // Left edge
        ctx.quadraticCurveTo(left, top, left + cornerRadius, top); // Top-left corner
        ctx.closePath();
        ctx.fill();
      }


      const drawCell = (x, y) => {
        switch (matchStates[currentMatchStateIndex].map_state[x][y]) {
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
          if (x % 2 == 0) {
            if (y % 2 == 0) {
              drawTile(x, y, '#ffea00');
            } else {
              drawTile(x, y, '#ffdd00');
            }
          } else {
            if (y % 2 == 0) {
              drawTile(x, y, '#ffdd00');
            } else {
              drawTile(x, y, '#ffea00');
            }
          }
        }
    }


    for (let x = 0; x < gridSizeHeight; x++) {
        for (let y = 0; y < gridSizeWidth; y++) {
            drawCell(x, y);
        }
    }
  } else {
    canvas.width = 17 * cellSize;
    canvas.height = 17 * cellSize;

    for (let x = 0; x < 17; x++) {
      for (let y = 0; y < 17; y++) {
        if (x % 2 == 0) {
          if (y % 2 == 0) {
            drawTile(x, y, '#ffea00');
          } else {
            drawTile(x, y, '#ffdd00');
          }
        } else {
          if (y % 2 == 0) {
            drawTile(x, y, '#ffdd00');
          } else {
            drawTile(x, y, '#ffea00');
          }
        }
      }
  }
  }
 }, [matchStates, currentMatchStateIndex]);


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
