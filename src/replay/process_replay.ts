import {Direction, Board} from './game_engine'


class Match{
    match_states: MatchState[];
    win_reason: string;

    constructor(match_states:MatchState[], win_reason:string){
        this.match_states = match_states;
        this.win_reason = win_reason;
    }

}

class MatchState{
    map_state: number[][];

    constructor(b:Board){
        this.map_state = b.get_enum_map();
    }

    
}

export async function processData(history: BoardHistory): Promise<Match> {
    let match_states: MatchState[] = new Array(history.moves.length+1).fill(null);

    let b:Board = new Board(history.width, history.height, history.player1_rooks, history.player2_rooks)
    
    if(history.moves.length>0){
        match_states[0] = new MatchState(b)
        for(let i:number = 1; i<= history.moves.length; i++){
            console.log(i);
            b.play_turn(history.moves[i-1]);
            match_states[i] = new MatchState(b);
        }
    }

    let match:Match = new Match(match_states, history.win_reason);

    return match;    
}

interface BoardHistory{
    moves:(string|number)[][],
    winner:string,
    win_reason: string,
    width:number,
    height:number,
    player1_rooks:string[],
    player2_rooks:string[]
}