export class Board {
    map: number[][];

    is_as_turn: boolean;
    last_move_a: number[];
    last_move_b: number[];
    width: number;
    height: number;

    constructor(width: number, height:number){
        this.map = new Array(height).fill(null).map(
            () => new Array(width).fill(0));

        this.is_as_turn = true;
        this.last_move_a = [-1, -1];
        this.last_move_b = [-1, -1];
        this.width = width;
        this.height = height;

    }

    play_turn(move: number[]): void{
        if(this.is_as_turn){
            let x = move[0]
            let y = move[1]
            if(this.in_map(x, y) && this.map[y][x] == 0){
                this.map[y][x] = 1
                x = this.last_move_a[0]
                y = this.last_move_a[1]

                this.map[y][x] = 3
            } 
        } else{
            let x = move[0]
            let y = move[1]
            if(this.in_map(x, y) && this.map[y][x] == 0){
                this.map[y][x] = 2
                x = this.last_move_b[0]
                y = this.last_move_b[1]

                this.map[y][x] = 3
            } 

        }
        this.is_as_turn = !this.is_as_turn
    }

    in_map(x:number, y:number): boolean{
        return x >= 0 && x < this.width && y >= 0 && y < this.height;

    }
   

    get_enum_map(): number[][] {
        let enum_map:number[][] = new Array(this.height).fill(null).map(
            () => new Array(this.width).fill(0));

        for(let i = 0; i< this.height; i++){
            for(let j = 0; j< this.width; j++){
                enum_map[i][j] = this.map[i][j];
            
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
