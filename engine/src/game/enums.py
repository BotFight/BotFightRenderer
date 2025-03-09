from enum import IntEnum, auto
class Result(IntEnum):
    PLAYER_A = 0
    PLAYER_B = 1
    TIE = 2
    ERROR = 3

class Action(IntEnum):
    NORTH = 0
    NORTHEAST = 1
    EAST = 2
    SOUTHEAST = 3
    SOUTH = 4
    SOUTHWEST = 5
    WEST = 6
    NORTHWEST = 7
    TRAP = 8
    FF = 9


class Cell(IntEnum):
    SPACE = 0
    WALL = 1
    APPLE = 2
    PLAYER_HEAD = 3
    PLAYER_BODY = 4
    ENEMY_HEAD = 5
    ENEMY_BODY = 6
    
    
