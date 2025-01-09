'use client';

import { useEffect, useRef, useState } from 'react';

const GridValues = {
    EMPTY: 0,
    WALL: 1,
    APPLE: 2,
    SNAKE_A_HEAD: 3,
    SNAKE_A_BODY: 4,
    SNAKE_B_HEAD: 5,
    SNAKE_B_BODY: 6,
}

export default function Game() {
  const canvasRef = useRef(null);
  const [grid, setGrid] = useState([
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0],
    [0,0,0,0,0,0,0,0,2,4,0,0,0,0,0,0,0],
    [0,1,0,1,0,1,0,1,4,1,4,1,0,1,0,1,0],
    [0,0,0,0,4,4,4,4,0,0,4,4,4,4,0,0,0],
    [0,1,0,1,4,1,5,1,0,1,0,1,0,1,0,1,0],
    [0,0,0,0,3,0,6,6,0,0,0,0,0,0,0,0,0],
    [0,1,0,1,0,1,0,1,6,1,0,1,0,1,0,1,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0],
    [2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2],
  ]);  

  const gridSizeWidth = grid[0].length;
  const gridSizeHeight = grid.length;
  const cellSize = 30;

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const width = gridSizeWidth * cellSize;
    const height = gridSizeHeight * cellSize;

    canvas.width = width;
    canvas.height = height;

    const drawGrid = () => {
        ctx.strokeStyle = '#ddd';
        ctx.beginPath();
        for (let i = 0; i <= width; i += cellSize) {
            ctx.moveTo(i, 0);
            ctx.lineTo(i, height);
        }
        for (let i = 0; i <= height; i += cellSize) {
            ctx.moveTo(0, i);
            ctx.lineTo(width, i);
        }
        ctx.stroke();
    }

    const drawTile = (x, y, color) => {
        ctx.fillStyle = color;
        ctx.fillRect(x * cellSize, y * cellSize, cellSize, cellSize);
    }
    const drawSnake = (x, y, color) => {
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(
          x * cellSize + cellSize / 2,  // center x
          y * cellSize + cellSize / 2,  // center y
          cellSize / 2,                 // radius
          0,                           // start angle
          Math.PI * 2                  // end angle (full circle)
        );
        ctx.fill();    
    }

     const drawFood = (x, y) => {
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
        ctx.strokeStyle = 'darkred';
        ctx.lineWidth = 2;
        ctx.stroke();
       }
       
       const drawSnakeHead = (x, y, color, direction) => {
        // Body circle
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(
          x * cellSize + cellSize / 2,
          y * cellSize + cellSize / 2,
          cellSize / 2,
          0,
          Math.PI * 2
        );
        ctx.fill();
        ctx.strokeStyle = 'black';
        ctx.lineWidth = 2;
        ctx.stroke();
       
        // Eyes based on direction
        const eyeOffset = cellSize / 4;
        ctx.fillStyle = 'white';
        
        switch(direction) {
          case 'right':
            drawEyes(x + 3/4, y + 1/3, x + 3/4, y + 2/3);
            break;
          case 'left':
            drawEyes(x + 1/4, y + 1/3, x + 1/4, y + 2/3);
            break;
          case 'up':
            drawEyes(x + 1/3, y + 1/4, x + 2/3, y + 1/4);
            break;
          case 'down':
            drawEyes(x + 1/3, y + 3/4, x + 2/3, y + 3/4);
            break;
          case 'upRight':
            drawEyes(x + 2/3, y + 1/3, x + 3/4, y + 1/4);
            break;
          case 'upLeft':
            drawEyes(x + 1/3, y + 1/3, x + 1/4, y + 1/4);
            break;
          case 'downRight':
            drawEyes(x + 2/3, y + 2/3, x + 3/4, y + 3/4);
            break;
          case 'downLeft':
            drawEyes(x + 1/3, y + 2/3, x + 1/4, y + 3/4);
            break;
        }
       
        function drawEyes(x1, y1, x2, y2) {
            // White of eyes
            ctx.fillStyle = 'white';
            ctx.beginPath();
            ctx.arc(x1 * cellSize, y1 * cellSize, 4, 0, Math.PI * 2);
            ctx.arc(x2 * cellSize, y2 * cellSize, 4, 0, Math.PI * 2);
            ctx.fill();
            
            // Black pupils
            ctx.fillStyle = 'black';
            ctx.beginPath();
            ctx.arc(x1 * cellSize, y1 * cellSize, 2, 0, Math.PI * 2);
            ctx.arc(x2 * cellSize, y2 * cellSize, 2, 0, Math.PI * 2);
            ctx.fill();
          }
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
            case GridValues.APPLE:
                drawFood(y, x);
                break;
            case GridValues.SNAKE_A_HEAD:
                drawSnakeHead(y, x, 'green', 'right');
                break;
            case GridValues.SNAKE_A_BODY:
                drawSnake(y, x, 'green');
                break;
            case GridValues.SNAKE_B_HEAD:
                drawSnakeHead(y, x, 'blue', 'right');
                break;
            case GridValues.SNAKE_B_BODY:
                drawSnake(y, x, 'blue');
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

    // drawGrid();


  }, []);

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <canvas
        ref={canvasRef}
        width={800}
        height={800}
        className="border border-gray-300 bg-white"
      />
    </div>
  );
}