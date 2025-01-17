const GridValues = {
  EMPTY: 0,
  WALL: 1,
  APPLE: 2,
  SNAKE_A_HEAD: 3,
  SNAKE_A_BODY: 4,
  SNAKE_B_HEAD: 5,
  SNAKE_B_BODY: 6,
}

export default function MapVis({
  showSnakeStart, 
  aSpawn,
  bSpawn,
  mapHeight, mapWidth, 
  walls,
  cellType,
  setASpawn,
  setBSpawn,
  setTile,
  rerender


}) {
  const cellSize = 30;
  const canvasRef = useRef(null);
  
  const [mouseCellX, setMouseCellX] = useState(-1); 
  const [mouseCellY, setMouseCellY] = useState(-1); 
  const [rerender, setRerender] = useState(rerender); 

  const handleMouseMove = (e) => {
    const offsetX = e.clientX - rectBounding.left;
    const offsetY = e.clientY - rectBounding.top;

    // Check if mouse is over the rectangle
    setMouseCellX(Math.floor(offsetX/cellSize));
    setMouseCellY(Math.floor(offsetY/cellSize));
  };

  const handleMouseOut = () => {
    setMouseCellX(-1);
    setMouseCellY(-1);
  };

  const handleClick = (event) => {
    const offsetX = e.clientX - rectBounding.left;
    const offsetY = e.clientY - rectBounding.top;

    const cellX = Math.floor(offsetX/cellSize);
    const cellY = Math.floor(offsetY/cellSize);

    setTile(cellX, cellY);
  };

  useEffect(() => {
    setRerender(rerender)
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    const width = mapWidth * cellSize;
    const height = mapHeight * cellSize;

    canvas.width = width;
    canvas.height = height;

    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mouseout', handleMouseOut);
    canvas.addEventListener('click', handleClick);

    const drawTile = (x, y, color) => {
        ctx.fillStyle = color;
        ctx.fillRect(x * cellSize, y * cellSize, cellSize, cellSize);

        if(x==mouseCellX && y == mouseCellY){
          ctx.strokeStyle = 'black';
          ctx.lineWidth = 5; 
          ctx.strokeRect(rectX, rectY, rectWidth, rectHeight);
        }
        
    }

    const drawSnakeHead = (x, y, color, direction) => {
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

        ctx.fillStyle = 'white';
        
        switch(direction) {
          case Direction.EAST:
            drawEyes(x + 3/4, y + 1/3, x + 3/4, y + 2/3);
            break;
          case Direction.WEST:
            drawEyes(x + 1/4, y + 1/3, x + 1/4, y + 2/3);
            break;
          case Direction.NORTH:
            drawEyes(x + 1/3, y + 1/4, x + 2/3, y + 1/4);
            break;
          case Direction.SOUTH:
            drawEyes(x + 1/3, y + 3/4, x + 2/3, y + 3/4);
            break;
          case Direction.NORTHEAST:
            drawEyes(x + 2/3, y + 1/3, x + 3/4, y + 1/4);
            break;
          case Direction.NORTHWEST:
            drawEyes(x + 1/3, y + 1/3, x + 1/4, y + 1/4);
            break;
          case Direction.SOUTHEAST:
            drawEyes(x + 2/3, y + 2/3, x + 3/4, y + 3/4);
            break;
          case Direction.SOUTHWEST:
            drawEyes(x + 1/3, y + 2/3, x + 1/4, y + 3/4);
            break;
        }
       
        function drawEyes(x1, y1, x2, y2) {
            ctx.fillStyle = 'white';
            ctx.beginPath();
            ctx.arc(x1 * cellSize, y1 * cellSize, 4, 0, Math.PI * 2);
            ctx.arc(x2 * cellSize, y2 * cellSize, 4, 0, Math.PI * 2);
            ctx.fill();
            
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
          if(walls[y][x]){
            drawWall(y, x);
          }
          else if(showSnakeStart && x == aSpawn[1] && y == aSpawn[0]){
            drawSnakeHead(y, x, 'green', direction.NORTH);
          }
          else if(showSnakeStart && x == bSpawn[1] && y == bSpawn[0]){
            drawSnakeHead(y, x, 'blue', direction.NORTH);
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
    return () => {
      canvas.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('mouseout', handleMouseOut);
    };
    
  }, [
    aSpawn, 
    bSpawn, 
    mapHeight, 
    mapWidth, 
    walls, 
    mouseCellX,
    mouseCellY,
    rerender
  ]);

  return (
    <div className="flex justify-center items-center bg-gray-100 min-w-screen">
      <canvas
        ref={canvasRef}
        width={800}
        height={800}
        className="border border-gray-300 bg-white"
      />
    </div>
  );
}