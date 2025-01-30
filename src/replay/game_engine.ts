export class Board {
    map: number[][];

    last_move_a1: number[];
    last_move_a2: number[];
    last_move_b1: number[];
    last_move_b2: number[];
    width: number;
    height: number;
    p1_rooks: string[];
    p2_rooks: string[];

    constructor(width: number, height:number, p1_rooks:string[], p2_rooks:string[]){
        this.map = new Array(height).fill(null).map(
            () => new Array(width).fill(0));
        this.last_move_a1 = [-1, -1];
        this.last_move_a2 = [-1, -1];
        this.last_move_b1 = [-1, -1];
        this.last_move_b2 = [-1, -1];
        this.width = width;
        this.height = height;
        this.p1_rooks = p1_rooks
        this.p2_rooks = p2_rooks

    }

    play_turn(move: (string|number)[]): void{
        let rook:string = String(move[0])

        let x:number = Number(move[1])
        let y:number = Number(move[2])

        let arr:number[] = [];
        let player_enum:number = 0;

        if(rook === this.p1_rooks[0]){
            arr = this.last_move_a1
            player_enum = 1;
        } else if (rook === this.p1_rooks[1]){
            arr = this.last_move_a2
            player_enum = 1;
        } else if(rook === this.p2_rooks[0]){
            arr = this.last_move_b1
            player_enum = 2;
        } else if(rook === this.p2_rooks[1]){
            arr = this.last_move_b2;
            player_enum = 2;
        }

    
        if(this.in_map(x, y) && this.map[y][x] == 0){
            let last_x:number = arr[0]
            let last_y:number = arr[1]

            if(this.in_map(last_x, last_y)) {
                this.map[last_y][last_x] = 3
            }

            this.map[y][x] = player_enum;

            arr[0] = last_x;
            arr[1] = last_y;
        } 
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
