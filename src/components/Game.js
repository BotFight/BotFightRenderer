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


    
    const drawPlayer = (x, y, color) => {
      const padding = 4;
      const size = cellSize - padding * 2; // The knight shape will fit inside the available space
    
      // Draw the main body of the knight (the horse head)
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.moveTo(x * cellSize + size / 4, y * cellSize + size / 4); // Start at the neck
      ctx.lineTo(x * cellSize + size / 2, y * cellSize + size / 2); // Draw to the middle of the horse's head
      ctx.lineTo(x * cellSize + size, y * cellSize + size / 4); // Draw to the top of the horse's head
      ctx.lineTo(x * cellSize + size, y * cellSize + size / 1.5); // Right side of the knight's body
      ctx.lineTo(x * cellSize + size / 4, y * cellSize + size); // Bottom of the body
      ctx.lineTo(x * cellSize + size / 4, y * cellSize + size / 2); // Back to the neck
      ctx.closePath();
      ctx.fill();
    
      // Draw the eyes of the knight (a small white dot)
      ctx.fillStyle = 'white';
      ctx.beginPath();
      ctx.arc(x * cellSize + size / 1.5, y * cellSize + size / 3, 3, 0, 2 * Math.PI);
      ctx.fill();
    
      // Draw the mane of the knight (a few lines behind the horse's head)
      ctx.strokeStyle = 'black';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(x * cellSize + size / 2, y * cellSize + size / 2); // Start from the neck
      ctx.lineTo(x * cellSize + size / 2, y * cellSize + size / 4); // Short mane line
      ctx.moveTo(x * cellSize + size / 2.5, y * cellSize + size / 2); // Start second line
      ctx.lineTo(x * cellSize + size / 2.5, y * cellSize + size / 4); // Second mane line
      ctx.stroke();
    }


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
