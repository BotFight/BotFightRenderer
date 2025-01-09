export class Map{
    dim_x: number;
    dim_y: number;
    start_a: [number, number];
    start_b: [number, number];
    start_size: number;
    min_player_size: number;
    apple_timeline: number[][];
    cells_walls: number[][];

    constructor(map_string: string){
        let infos:string[] = map_string.split("#");
        let info_dim:string[] = infos[0].split(",");
        this.dim_x = parseInt(info_dim[0]);
        this.dim_y = parseInt(info_dim[1]);

        let info_a:string[] = infos[1].split(",")
        let info_b:string[] = infos[2].split(",")
        this.start_a = [parseInt(info_a[0]), parseInt(info_a[1])]
        this.start_b = [parseInt(info_b[0]), parseInt(info_b[1])]

        this.start_size = parseInt(infos[3])
        this.min_player_size = parseInt(infos[4])

        let apples:string[] = infos[5].split("|")
        this.apple_timeline = new Array(apples.length).fill(null).map(
            () => new Array(3).fill(0));

        for(let i = 0; i< apples.length; i++){
            let apple:string[] = apples[i].split(',');
            for(let j = 0; j < 3; j++){
                this.apple_timeline[i][j] = parseInt(apple[j]);
            }   
        }

        this.cells_walls = new Array(this.dim_y).fill(null).map(
            () => new Array(this.dim_x).fill(0));

        for(let i = 0; i< this.dim_y; i++){
            for(let j = 0; j < this.dim_x; j++){
                this.cells_walls[i][j] = parseInt(infos[6][i*this.dim_x+j]);
            }   
        }

    }
}




class Snake{
    apples_eaten: number;
    head_loc: [number, number];
    dir:Direction;

    constructor(start_loc:[number, number], start_size:number){
        this.apples_eaten = 0;
        this.head_loc = start_loc;
        this.dir = Direction.NORTH;
    }

    push_move(action:Direction): void {
        this.dir = action;

        switch (action){
            case Direction.NORTH:
                this.head_loc[1]-=1;
                break;
            case Direction.NORTHEAST:
                this.head_loc[1]-=1;
                this.head_loc[0]+=1;
                break;
            case Direction.EAST:
                this.head_loc[0]+=1;
                break;
            case Direction.SOUTHEAST:
                this.head_loc[1]+=1;
                this.head_loc[0]+=1;
                break;
            case Direction.SOUTH:
                this.head_loc[1]+=1;
                break;
            case Direction.SOUTHWEST:
                this.head_loc[1]+=1;
                this.head_loc[0]-=1;
                break;
            case Direction.WEST:
                this.head_loc[0]-=1;
                break;
            case Direction.NORTHWEST:
                this.head_loc[1]-=1;
                this.head_loc[0]-=1;
                break;

        }

    }
        
}

export class Board {
    map: Map;
    cells_a: number[][];
    cells_b: number[][];
    cells_apples: number[][];
    is_as_turn: boolean;
    a_time: number;
    b_time: number;
    apple_counter: number;
    turn_count:number;

    snake_a:Snake;
    snake_b:Snake;

    constructor(map: Map, a_start:boolean, start_time:number, a_length:number, b_length:number){
        this.map = map;
        this.cells_a = new Array(map.dim_y).fill(null).map(
            () => new Array(map.dim_x).fill(0));
        this.cells_b = new Array(map.dim_y).fill(null).map(
            () => new Array(map.dim_x).fill(0));
        this.cells_apples = new Array(map.dim_y).fill(null).map(
            () => new Array(map.dim_x).fill(0));

        this.is_as_turn = a_start;
        this.a_time = start_time;
        this.b_time = start_time;
        this.apple_counter = 0;
        this.turn_count = 0;

        this.snake_a = new Snake(map.start_a, map.start_size);
        this.snake_b = new Snake(map.start_b, map.start_size);

        this.cells_a[this.map.start_a[1]][this.map.start_a[0]] = a_length
        this.cells_b[this.map.start_b[1]][this.map.start_b[0]] = b_length
    }

    play_turn(turn: Direction[], cells_lost:number[][], time:number): void{
        if(this.is_as_turn){
            turn.forEach((action, index)=>{
                this.snake_a.push_move(action);

                let x:number = this.snake_a.head_loc[0]
                let y:number = this.snake_a.head_loc[1]
                
                if(this.cells_apples[y][x] > 0){
                    this.snake_a.apples_eaten+=this.cells_apples[y][x];
                    this.cells_apples[y][x] = 0;
                }
                
            })

            cells_lost.forEach((cell, index)=>{
                this.cells_a[cell[1]][cell[0]]-=1;
            })

            this.a_time-=time;
            
        } else{
            turn.forEach((action, index)=>{
                this.snake_b.push_move(action);

                let x:number = this.snake_b.head_loc[0]
                let y:number = this.snake_b.head_loc[1]

                if(this.cells_apples[y][x] > 0){
                    this.snake_b.apples_eaten+=this.cells_apples[y][x];
                    this.cells_apples[y][x] = 0;
                }
            })

            cells_lost.forEach((cell, index)=>{
                this.cells_b[cell[1]][cell[0]]-=1;
            })


            this.b_time-=time;

        }       
    }

    next_turn(): void {
        this.is_as_turn = !this.is_as_turn;
        this.turn_count++;

        while(this.apple_counter < this.map.apple_timeline.length 
            && this.map.apple_timeline[this.apple_counter][0] <= 
            this.get_round_num()){

            let x:number = this.map.apple_timeline[this.apple_counter][1]
            let y:number = this.map.apple_timeline[this.apple_counter][2]

            this.cells_apples[y][x] = 1
            this.apple_counter++;
        }
    }

    get_round_num(): number {
        return Math.trunc(this.turn_count/2);
    }

    get_enum_map(): number[][] {
        let enum_map:number[][] = new Array(this.map.dim_y).fill(null).map(
            () => new Array(this.map.dim_x).fill(0));

        for(let i = 0; i< this.map.dim_y; i++){
            for(let j = 0; j< this.map.dim_x; j++){
                if(this.cells_apples[i][j]){
                    enum_map[i][j] = 2;
                } else if(this.map.cells_walls[i][j]){
                    enum_map[i][j] = 1;
                }
                else if(this.cells_a[i][j]>0){
                    if(this.snake_a.head_loc[0]==j && this.snake_a.head_loc[1]==i){
                        enum_map[i][j] = 3;
                    } else{
                        enum_map[i][j] = 4;
                    }
                }else if(this.cells_b[i][j]>0){
                    if(this.snake_b.head_loc[0]==j && this.snake_b.head_loc[1]==i){
                        enum_map[i][j] = 5;
                    } else{
                        enum_map[i][j] = 6;
                    }
                } else{
                    enum_map[i][j] = 0;
                }
                
            
            }

        }
        return enum_map;
    }

    
}

export enum Direction{
    NORTH = 0,
    NORTHEAST = 1,
    EAST = 2,
    SOUTHEAST = 3,
    SOUTH = 4,
    SOUTHWEST = 5,
    WEST = 6,
    NORTHWEST = 7
}


export enum Result {
    PLAYER_A = 0,
    PLAYER_B = 1,
    TIE = 2,
    ERROR = 3
}
