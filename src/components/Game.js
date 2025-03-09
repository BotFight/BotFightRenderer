'use client';


import { useEffect, useRef, useState } from 'react';
import { Action } from '../replay/game_engine';


const GridValues = {
   EMPTY: 0,
   WALL: 1,
   APPLE: 2,
   SNAKE_A_HEAD: 3,
   SNAKE_A_BODY: 4,
   SNAKE_B_HEAD: 5,
   SNAKE_B_BODY: 6,
   PORTAL:7
}


export default function Game({ currentMatchStateIndex,  matchStates }) {
 const canvasRef = useRef(null);
 const [cellSize, setCellSize] = useState(30);


 useEffect(() => {

  const canvas = canvasRef.current;
  const ctx = canvas.getContext('2d');

  let drawTile = (x, y, color) => {
    ctx.fillStyle = color;
    ctx.fillRect(x * cellSize, y * cellSize, cellSize, cellSize);
  }

  if (matchStates != null  && matchStates.length > 0 && matchStates[0] != null) {
    const gridSizeWidth = matchStates[0].map_state.length;
    const gridSizeHeight = matchStates[0].map_state[0].length;


    const maxSize = 512

    let cellCalc = Math.min(maxSize/gridSizeWidth, maxSize/gridSizeHeight)
    const minSize = 15
    cellCalc = Math.max(cellCalc, minSize)

    setCellSize(cellCalc)

    drawTile = (x, y, color) => {
      ctx.fillStyle = color;
      ctx.fillRect(x * cellSize, y * cellSize, cellSize, cellSize);
    }

    const width =  gridSizeHeight * cellSize;
    const height = gridSizeWidth * cellSize;


    canvas.width = width;
    canvas.height = height;


    let drawSnake = (x, y, color) => {
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(
          x * cellSize + cellSize / 2,  // center x
          y * cellSize + cellSize / 2,  // center y
          cellSize / 2.2,                 // radius
          0,                           // start angle
          Math.PI * 2                  // end angle (full circle)
        );
        ctx.fill();   
    }


    let drawFood = (x, y) => {
      ctx.fillStyle = 'red';
      ctx.beginPath();
      ctx.arc(
        x * cellSize + cellSize / 2,
        y * cellSize + cellSize / 2,
        cellSize / 4,
        0,
        Math.PI * 2
      );
      ctx.fill();
    
      // Border
      // ctx.strokeStyle = 'darkred';
      // ctx.lineWidth = 2;
      // ctx.stroke();
      }
    
    let drawSnakeHead = (x, y, color, direction) => {
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(
        x * cellSize + cellSize / 2,
        y * cellSize + cellSize / 2,
        cellSize / 2.2,
        0,
        Math.PI * 2
      );
      ctx.fill();
      // ctx.strokeStyle = 'black';
      // ctx.lineWidth = 2;
      // ctx.stroke();


      ctx.fillStyle = 'white';

      let  drawEyes=(x1, y1, x2, y2)=> {
        ctx.fillStyle = 'white';
        ctx.beginPath();
        ctx.arc(x1 * cellSize, y1 * cellSize, 2*cellSize /15, 0, Math.PI * 2);
        ctx.arc(x2 * cellSize, y2 * cellSize, 2*cellSize /15, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.fillStyle = 'black';
        ctx.beginPath();
        ctx.arc(x1 * cellSize, y1 * cellSize, cellSize /15, 0, Math.PI * 2);
        ctx.arc(x2 * cellSize, y2 * cellSize, cellSize /15, 0, Math.PI * 2);
        ctx.fill();
      }
      
      switch(direction) {
        case Action.EAST:
          drawEyes(x + 3/4, y + 1/3, x + 3/4, y + 2/3);
          break;
        case Action.WEST:
          drawEyes(x + 1/4, y + 1/3, x + 1/4, y + 2/3);
          break;
        case Action.NORTH:
          drawEyes(x + 1/3, y + 1/4, x + 2/3, y + 1/4);
          break;
        case Action.SOUTH:
          drawEyes(x + 1/3, y + 3/4, x + 2/3, y + 3/4);
          break;
        case Action.NORTHEAST:
          drawEyes(x + 9/16, y + 1/5, x + 4/5, y + 7/16);
          break;
        case Action.NORTHWEST:
          drawEyes(x + 7/16, y + 1/5, x + 1/5, y + 7/16);
          break;
        case Action.SOUTHEAST:
          drawEyes(x + 9/16, y + 4/5, x + 4/5, y + 9/16);
          break;
        case Action.SOUTHWEST:
          drawEyes(x + 7/16, y + 4/5, x + 1/5, y + 9/16);
          break;
      } 
    }


    let drawWall = (x, y, color) => {
      const padding = 4;
      const cornerRadius = 4;
    
      const left = x * cellSize + padding;
      const top = y * cellSize + padding;
      const width = cellSize - 2 * padding;
      const height = cellSize - 2 * padding;
    
      ctx.fillStyle = color;
    
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

    const drawOccupancy = (x, y) => {
      
      switch (matchStates[currentMatchStateIndex].map_state[y][x]) {
        case GridValues.WALL:
            drawWall(x, y, 'brown');
            break;
        case GridValues.SNAKE_A_HEAD:
            drawSnakeHead(x, y, 'green', matchStates[currentMatchStateIndex].a_dir);
            break;
        case GridValues.SNAKE_A_BODY:
            drawSnake(x, y, 'green');
            break;
        case GridValues.SNAKE_B_HEAD:
            drawSnakeHead(x, y, 'blue',  matchStates[currentMatchStateIndex].b_dir);
            break;
        case GridValues.SNAKE_B_BODY:
            drawSnake(x, y, 'blue');
            break;
      }
    }

    const drawPortal = (x, y) => {
      if(matchStates[currentMatchStateIndex].portals[y][x] > 0){
        ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        ctx.beginPath();
        ctx.arc(
          x * cellSize + cellSize / 2,
          y * cellSize + cellSize / 2,
          cellSize / 2.2,
          0,
          Math.PI * 2
        );
        ctx.fill();
        ctx.strokeStyle = 'black';
        ctx.lineWidth = 2;
        ctx.stroke();

        
      }
    }


    const drawApple = (x, y) => {
      if(matchStates[currentMatchStateIndex].apple_state[y][x] > 0){
        drawFood(x, y)
      }
    }

    const drawTrap = (x, y) => {
      switch(matchStates[currentMatchStateIndex].trap_state[y][x]){
        case 1:
          drawWall(x, y, 'rgba(0, 255, 0, 0.5)');
          break;
        case 2:
          drawWall(x, y, 'rgba(0, 0, 255, 0.5)');
          break;
        default:
          break;
      }
    }

    const drawCell = (x, y) => {
      drawPortal(x, y)
      drawApple(x, y) 
      drawOccupancy(x, y)
      if (matchStates[currentMatchStateIndex].map_state[y][x] === GridValues.EMPTY) {
        drawTrap(x, y);
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
 }, [matchStates, currentMatchStateIndex, cellSize]);


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
