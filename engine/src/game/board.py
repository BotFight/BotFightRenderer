import numpy as np
import json

from game.game_map import Map
from game.game_queue import Queue
from game.enums import Action, Result, Cell
from game.snake import Snake
from collections.abc import Iterable


class Board():
    """
    Board is the game engine's representation of the current match.

    Any coordinates should be given to the board in the form of x, y.
    Game objects are displayed, indexed, and stored on the 
    board arrays as y, x for geometrical accuracy.

    Check_validity is on by default for most functions, but slows
    down execution. If a player is confident their actions are valid,
    they can directly apply turns and moves with check_validity as false.

    Be wary that invalid actions/turns could lead to functions throwing
    errors, so make sure to handle them with a try/except in case so that
    your program doesn't crash. If an apply function throws an error,
    it is not guarenteed that the board state will be valid or that the state
    will be the same as when the function started.
    """  

    def __init__(self, game_map: Map, time_to_play: float = 20, build_history: bool = False, copy: bool = False):
        """
        Initializes the board with the specified game map and configuration options.

        Parameters:
            game_map (game_map.Map): The map representing the game environment.
            time_to_play (float, optional): The time limit for the game in seconds. Defaults to 65536.
            build_history (bool, optional): Whether to track the history of the game. Defaults to False.
            copy (bool, optional): Whether to initialize a copy of the game map. Defaults to False.
        """

        self.map = game_map
        if(copy is False):
            #map metadata
            self.cells_a = np.zeros((self.map.dim_y, self.map.dim_x), dtype = np.uint8)
            self.cells_b = np.zeros((self.map.dim_y, self.map.dim_x), dtype = np.uint8)
            self.cells_apples = np.zeros((self.map.dim_y, self.map.dim_x), dtype = np.uint8)
            self.cells_traps_a = np.zeros((self.map.dim_y, self.map.dim_x), dtype = np.uint8)
            self.cells_traps_b = np.zeros((self.map.dim_y, self.map.dim_x), dtype = np.uint8)
            
            self.trap_set_a = set()
            self.trap_set_b = set()
            #add snakes
            self.snake_a = Snake(self.map.min_player_size)
            self.snake_b = Snake(self.map.min_player_size)

            #game metadata
            self.turn_count = 0
            self.apple_counter = 0

            #initialize game
            def init_game(game_map = None):
                if(game_map is None):
                    game_map = self.map

                #initialize snakes to starting locations (simulate having eaten an apple of start_size)
                self.snake_a.start(game_map.start_a, game_map.start_size)
                self.snake_b.start(game_map.start_b, game_map.start_size)

                self.cells_a[game_map.start_a[1], game_map.start_a[0]] = 1
                self.cells_b[game_map.start_b[1], game_map.start_b[0]] = 1

                self.spawn_apples()

            init_game()

            #more game metadata
            self.a_to_play = True
            self.bid_resolved = False
            self.winner = None

            self.a_time = time_to_play
            self.b_time = time_to_play
            self.win_reason = None

            self.decay_interval = -1
            self.decay_count = 0
            self.decaying = False

            self.decay_index = -1
            self.decay_applied = False
            self.turn_start_checked = False
            

            #history building
            self.build_history = build_history
            if(build_history):
                self.history = {
                    "start_time": time_to_play,
                    "moves":[], 
                    "times":[],
                    "cells_lost":[],
                    "cells_gained":[],
                    "traps_created":[],
                    "traps_lost":[],
                    "a_length":[],
                    "b_length":[],
                    "game_map" : self.map.get_recorded_map()
                    }
                self.cells_lost_list = []
                self.traps_created_list = []
                self.traps_lost_list = []
                self.cells_gained_list = []

                
    def is_as_turn(self) -> bool:
        """
        Returns:
            bool: If it is player a's turn to play.
        """
        return self.a_to_play

    def get_a_time(self) -> float:
        """
        Returns:
            float: Time in seconds that player a has to make a turn.
        """
        return self.a_time

    def get_b_time(self) -> float:
        """
        Returns:
            float: Time in seconds that player b has to make a turn.
        """
        return self.b_time

    def has_apple_tuple(self, loc: tuple) -> bool:
        """
        Returns whether there is an apple at the provided location. The location should be in the form (x, y).

        Parameters:
            loc (tuple): The coordinates (x, y) of the location to check for an apple.

        Returns:
            bool: True if there is an apple at the specified location, False otherwise.
        """

        return self.cells_apples[loc[1], loc[0]] > 0
    
    def has_apple(self, x: int, y: int) -> bool:
        """
        Returns whether there is an apple at the given coordinates (x, y).

        Parameters:
            x (int): The x-coordinate to check for an apple.
            y (int): The y-coordinate to check for an apple.

        Returns:
            bool: True if there is an apple at the given coordinates, False otherwise.
        """
        return self.cells_apples[y, x] > 0

    def tiebreak(self):
        """
        Tiebreaks the game. Tiebreak occurs first by apples eaten, then by ending length
        of snake. If both are equal result is a tie.
        """
        if(self.snake_a.get_apples_eaten() > self.snake_b.get_apples_eaten()):
            self.set_winner(Result.PLAYER_A, "tiebreak: apples eaten")
        elif(self.snake_a.get_apples_eaten() < self.snake_b.get_apples_eaten()):
            self.set_winner(Result.PLAYER_B, "tiebreak: apples eaten")
        else:
            if(self.snake_a.get_length() > self.snake_b.get_length()):
                self.set_winner(Result.PLAYER_A, "tiebreak: final length")
            elif(self.snake_a.get_length() < self.snake_b.get_length()):
                self.set_winner(Result.PLAYER_B, "tiebreak: final length")

    
    def set_build_history(self, build_history: bool):
        """
        Sets whether the history of the game should be recorded.

        Parameters:
            build_history (bool): Whether to track the game history. True to record, False to not record.
        """

        self.build_history = build_history

    def set_winner(self, result: Result, reason: str = "invalid"):
        """
        Sets the winner and the reason for the game's outcome.

        Parameters:
            result (enums.Result): The winner of the game.
            reason (str, optional): The reason for the outcome. Defaults to "invalid".
        """

        self.winner = result
        self.win_reason = reason

        if(self.build_history):
            self.history["turn_count"] = self.turn_count
            self.history["result"] = result
            self.history["reason"] = reason

    def get_winner(self) -> Result:
        """
        Returns the winner of the game.

        Returns:
            enums.Result: The winner of the game.
        """

        return self.winner

    def get_win_reason(self) -> str:
        """
        Returns the string explaining the reason why the game was won.

        Returns:
            str: The reason for the game's outcome.
        """
        return self.win_reason


    def get_history_json(self):
        """
        Encodes the entire history of the game in a format readable by the renderer.
        """
        import json
        class NpEncoder(json.JSONEncoder):
            def default(self, obj):
                if isinstance(obj, np.integer):
                    return int(obj)
                if isinstance(obj, np.floating):
                    return float(obj)
                if isinstance(obj, np.ndarray):
                    return obj.tolist()
                return super(NpEncoder, self).default(obj)

        return json.dumps(self.history, cls=NpEncoder)


    def is_valid_bid(self, bid: int) -> bool:
        """
        Returns whether a given starting bid is valid.

        Parameters:
            bid (int): The starting bid to check.

        Returns:
            bool: True if the bid is valid, False otherwise.
        """

        return (isinstance(bid, int) or isinstance(bid, np.int64)) and bid >=0 and self.map.start_size - bid >= self.map.min_player_size


    def resolve_bid(self, bidA: int, bidB: int):
        """
        Resolves the bid between two players. The player with the higher bid 
        gets to go first. If the bids are equal, the starting player is 
        determined by a coin toss.

        Parameters:
            bidA (int): The bid from player A.
            bidB (int): The bid from player B.
        """

        if (bidB > bidA):
            self.a_to_play = False
        elif(bidB==bidA):
            self.a_to_play = np.random.rand() < 0.5 

        if(self.a_to_play):
            self.snake_a.apply_bid(bidA)
        else:
            self.snake_b.apply_bid(bidB)
        self.bid_resolved = True

        if(self.build_history):
            self.history["bidA"] = bidA
            self.history["bidB"] = bidB
            self.history["a_start"] = self.a_to_play
            self.history["a_length"].append(self.snake_a.get_length())
            self.history["b_length"].append(self.snake_b.get_length())

    def get_bid_resolved(self) -> bool:
        """
        Returns whether the bid for the first turn has been resolved.

        Returns:
            bool: True if the bid has been resolved, False otherwise.
        """
        return self.bid_resolved

    def is_valid_trap(self, a_to_play: bool = None) -> bool:
        """
        Returns whether the current player can deploy a trap.

        Parameters:
            a_to_play (bool, optional): The player whose turn it is. If not provided, the current player is used.

        Returns:
            bool: True if the current player can apply a trap, False otherwise.
        """

        if(a_to_play is None):
            a_to_play = self.a_to_play
        player = self.snake_a.get_copy() if a_to_play else self.snake_b.get_copy()
        
        if(not self.turn_start_checked):
            head_loc = player.get_head_loc()
            if(self.cells_apples[head_loc[1], head_loc[0]] != 0):
                player.eat_apple()

        if(not self.decay_applied and self.decay_index != -1):
            if(self.decaying or self.decay_count == 0):
                if(player.get_length() - 1 < player.min_player_size):
                    return False
                if(player.length_queued > 1):
                    return player.is_valid_trap(length=player.get_length()-1)
                else:
                    return player.is_valid_trap(length=player.get_length()-1 , unqueued =player.get_unqueued_length()-1 )
        
        return player.is_valid_trap()

    def is_valid_action(self, action: Action, a_to_play: bool = None) -> bool:
        """
        Returns whether the given action is valid for the current player.

        If the action is a trap, it checks if the trap is valid for the current player.
        Otherwise, it checks if the move is valid.

        Parameters:
            action (enums.Action): The action to validate.
            a_to_play (bool, optional): The player whose turn it is. If not provided, the current player is used.

        Returns:
            bool: True if the action is valid, False otherwise.
        """
        if(Action(action) is Action.TRAP):
            return self.is_valid_trap(a_to_play)
        else:
            return self.is_valid_move(action, a_to_play=a_to_play)


    def is_valid_move(self, move:Action, sacrifice: int = None, a_to_play: bool = None) -> bool:
        """
        Returns whether the given move is valid for the current player. Does not check for decay.

        If a sacrifice is applied, it checks if the move is still valid given the sacrifice. 

        Parameters:
            move (enums.Action): The move to validate.
            sacrifice (int, optional): The amount of sacrifice to apply. If not provided, the current sacrifice value is used.
            a_to_play (bool, optional): The player whose turn it is. If not provided, the current player is used.

        Returns:
            bool: True if the move is valid, False otherwise.
        """
        
        if(a_to_play is None):
            a_to_play = self.a_to_play
        player = self.snake_a.get_copy() if a_to_play else self.snake_b.get_copy()
        player_cells_copy = np.array(self.cells_a) if a_to_play else np.array(self.cells_b)
        enemy_cells = self.cells_b if a_to_play else self.cells_a
        enemy_traps = self.cells_traps_b if a_to_play else self.cells_traps_a

        if(not self.turn_start_checked):
            head_loc = player.get_head_loc()
            if(self.cells_apples[head_loc[1], head_loc[0]] != 0):
                player.eat_apple()

        if(not self.decay_applied and self.decay_index != -1):
            if(self.decaying  or self.decay_count == 0):
                if(player.get_length() - 1 < player.min_player_size):
                    return False
                cells_lost = player.apply_sacrifice(1)
                if(cells_lost is not None):
                    player_cells_copy[cells_lost[:, 1], cells_lost[:, 0]] -= 1        
        
        if(not player.can_move(Action(move), sacrifice)):
            return False
        head_loc, cells_lost = player.try_move(Action(move), sacrifice)

        if(cells_lost is not None):
            player_cells_copy[cells_lost[:, 1], cells_lost[:, 0]] -= 1

        if not self.is_valid_cell_copy(head_loc, player_cells_copy, enemy_cells):
            return False 
        if(self.map.cells_portals[head_loc[1], head_loc[0], 0] >= 0):
            portal_x, portal_y = self.map.cells_portals[head_loc[1], head_loc[0]] 
            if not self.is_valid_cell_copy((portal_x, portal_y), player_cells_copy, enemy_cells):
                return False

        if(self.cells_apples[head_loc[1], head_loc[0]] != 0):
            player.eat_apple()

        if(enemy_traps[head_loc[1], head_loc[0]] != 0):
            if(not player.is_valid_sacrifice(2)):
                return False
        
        return True

    def is_valid_turn(self, turn, a_to_play: bool = None) -> bool:
        """
        Returns if the given turn is a valid turn.
        A turn can be an Action or iterable of Actions. Actions can either be
        in the form of enums given in game.enums.Action or the ints to which the Action
        enum is mapped.

        Parameters:
            turn (enums.Action or Iterable[enums.Actions] or Iterable[int]): The action(s) the player takes in sequence.
            a_to_play (bool, optional): The player whose turn it is. If not provided, the current player is used.

        Returns:
            bool: True if the turn is valid, False otherwise.
        """
        if(a_to_play is None):
            a_to_play = self.a_to_play

        player = self.snake_a.get_copy() if a_to_play else self.snake_b.get_copy() 
        cells_apples_copy = np.array(self.cells_apples)
        player_cells_copy = np.array(self.cells_a) if a_to_play else np.array(self.cells_b)
        enemy_cells = self.cells_b if a_to_play else self.cells_a
        enemy_traps_copy = np.array(self.cells_traps_b) if a_to_play else np.array(self.cells_traps_a)
       
        head_loc = player.get_head_loc()
        if(not self.turn_start_checked):
            if(cells_apples_copy[head_loc[1], head_loc[0]] != 0):
                player.eat_apple()
                cells_apples_copy[head_loc[1], head_loc[0]]= 0
                if(self.map.cells_portals[y, x, 0] >= 0):
                    portal_x, portal_y = self.map.cells_portals[y, x]
                    cells_apples_copy[portal_y, portal_x] = 0
            
        if(not self.decay_applied and self.decay_index != -1):
            if(self.decaying or self.decay_count == 0):
                if(player.get_length() - 1 < player.min_player_size):
                    return False
                cells_lost = player.apply_sacrifice(1)

                if(cells_lost is not None):
                    player_cells_copy[cells_lost[:, 1], cells_lost[:, 0]] -= 1

        moved = False
        
        # try:
        if(isinstance(turn, Iterable) and not type(turn) is str):
            # case for turn being a list

            #metadata to simulate the turn
            
            for a in turn:
                
                action = Action(a)                    

                #plays one move out of the sequence
                if(not action is Action.TRAP):
                    if not player.can_move(action):
                        
                        return False
                    moved = True
                    head_loc = player.get_head_loc()     

                    if(not player.can_move(action)):
                        return False       

                    head_loc, cells_lost = player.push_move(action)
                    
                    if(cells_lost is not None):
                        player_cells_copy[cells_lost[:, 1], cells_lost[:, 0]] -= 1
                    

                    if not self.is_valid_cell_copy(head_loc, player_cells_copy, enemy_cells):
                        return False 

                    portal_x, portal_y = None, None
                    if(self.map.cells_portals[head_loc[1], head_loc[0], 0] >= 0):
                        portal_x, portal_y = self.map.cells_portals[head_loc[1], head_loc[0]] 
                        if not self.is_valid_cell_copy((portal_x, portal_y), player_cells_copy, enemy_cells):
                            return False 
                        player.push_head_cell(np.array([portal_y, portal_x]))
                        player_cells_copy[portal_y, portal_x] += 1
                    else:
                        player.push_head_cell(head_loc)
                        player_cells_copy[head_loc[1], head_loc[0]] += 1

                    if(not portal_x is None):
                        if not self.is_valid_cell_copy((portal_x, portal_y), player_cells_copy, enemy_cells):
                            return False 
                        player.push_head_cell(np.array([portal_x, portal_y]))

                    if(cells_apples_copy[head_loc[1], head_loc[0]] != 0):
                        player.eat_apple()

                        if(not portal_x is None):
                            cells_apples_copy[portal_y, portal_x]= 0
                            
                    if(enemy_traps_copy[head_loc[1], head_loc[0]] != 0):
                        if(not player.is_valid_sacrifice(2)):
                            return False
                        cells_lost = player.apply_sacrifice(2)
                        
                        if(cells_lost is not None):
                            player_cells_copy[cells_lost[:, 1], cells_lost[:, 0]] -= 1
                        enemy_traps_copy[head_loc[1], head_loc[0]] = 0

                        if(not portal_x is None):
                            enemy_traps_copy[portal_y, portal_x] = 0
                    #eating an apple                    
                else:
                    if not player.is_valid_trap():
                        return False
                    cells_lost = player.apply_sacrifice(1)
                    
                    if(cells_lost is not None):
                        player_cells_copy[cells_lost[:, 1], cells_lost[:, 0]] -= 1

            
            return moved           
        else:
            #case for single move, no apple calculation necessary
            if Action(turn)==Action.TRAP or not player.can_move(Action(turn)):
                return False

            head_loc, cells_lost = player.push_move(turn)

            if(not cells_lost is None):
                player_cells_copy[cells_lost[:, 1], cells_lost[:, 0]] -= 1

            if not self.is_valid_cell_copy(head_loc,player_cells_copy, enemy_cells):
                return False
            
            if(self.map.cells_portals[head_loc[1], head_loc[0], 0] >= 0):
                portal_x, portal_y =self.map.cells_portals[head_loc[1], head_loc[0]] 
                if not self.is_valid_cell_copy((portal_x, portal_y), player_cells_copy, enemy_cells):
                    return False 

            return True

        # except:
        #     return False
    

    # checks if currently playing snake can move into a cell
    def is_valid_cell(self, loc: tuple | np.ndarray) -> bool:
        """
        Checks if the cell is in bounds of the board, then if it is available to
        be moved into.

        Parameters:
            loc (tuple or numpy.ndarray): The coordinates of the cell to check, in the form (x, y).

        Returns:
            bool: True if the cell is valid (in bounds and available), False otherwise.
        """
        return self.cell_in_bounds(loc) \
            and self.map.cells_walls[loc[1]][loc[0]] == 0 \
            and self.cells_b[loc[1]][loc[0]] == 0 \
            and self.cells_a[loc[1]][loc[0]] == 0 


        return True

    def is_valid_cell_copy(self, loc,cells_player_copy, cells_enemy):
        """
        Checks if the cell is in bounds of the board, then if it is available to
        be moved into using a copy of the player board (in case player snake needs to be mutated).
        For internal usage by board class.
        """     

        
        if(not self.cell_in_bounds(loc)):
            return False
        
        return self.cell_in_bounds(loc) \
            and not self.map.cells_walls[loc[1]][loc[0]] \
            and not cells_player_copy[loc[1]][loc[0]] != 0 \
            and not cells_enemy[loc[1]][loc[0]] != 0
                    
    def cell_in_bounds(self, loc: tuple | np.ndarray) -> bool:
        """
        Checks if a cell is within map bounds.

        Parameters:
            loc (Union[tuple, np.ndarray]): The coordinates of the cell to check, either as a tuple (x, y) or a numpy array.

        Returns:
            bool: True if the cell is within the map bounds, False otherwise.
        """
        return 0 <= loc[0] < self.map.dim_x and 0 <= loc[1] < self.map.dim_y

    def apply_decay(self, a_to_play: bool = None, check_validity: bool = True) -> bool:
        """
        Applies a round of decay.

        Parameters:
            a_to_play (bool, optional): The player whose turn it is. If not provided, the current player is used.
            check_validity (bool, optional): Whether to check the validity of the decay action. Defaults to True.

        Returns:
            bool: True if the decay was applied successfully, False if the trap is invalid.
        """
        if(a_to_play is None):
            a_to_play = self.a_to_play
        
        
        if(not self.decay_applied and self.decay_index != -1):
            self.decay_applied = True
            if(self.decaying or self.decay_count == 0):
                player = self.snake_a if a_to_play else self.snake_b
                player_cells = self.cells_a if a_to_play else self.cells_b
                
                if(check_validity):
                    if(player.get_length() - 1 < player.min_player_size):
                        return False
                cells_lost = player.apply_sacrifice(1)

                if(cells_lost is not None):
                    player_cells[cells_lost[:, 1], cells_lost[:, 0]] -= 1

                    if(self.build_history):
                        self.cells_lost_list.append(cells_lost)
                
                self.decaying = not self.decaying
            self.decay_count = (self.decay_count + 1) % self.decay_interval

        return True


    def increment_decay(self):
        """
        Increments the decay process based on the current turn count and decay timeline.

        The method checks whether the turn count has reached the threshold to apply the next stage of decay 
        as defined in the decay timeline. It updates the decay interval and index accordingly.
        """

        while(self.decay_index < len(self.map.decay_timeline) and self.turn_count >= self.map.decay_timeline[self.decay_index+1][0] and self.decay_count ==0):
            self.decay_index+=1
            self.decay_interval = self.map.decay_timeline[self.decay_index][1]
            
                                

    def apply_turn(self, turn, timer: float = 0, a_to_play=None, check_validity: bool = True) -> bool:
        """
        Applies a turn to the board, mutating the board.

        A turn can be a direction or an iterable of directions. Actions can either be in the form of enums 
        from game.enums.Action or the ints to which the Action enum is mapped.

        If check_validity is enabled, apply_turn performs checks to ensure no errors. If check_validity is 
        disabled, the turn is assumed to be valid and runs without additional checks.

        Parameters:
            turn (enums.Action or Iterable[enums.Actions] or Iterable[int]): The action(s) the player takes in sequence.
            timer (float, optional): The timer associated with the turn. Defaults to 0.
            a_to_play (bool, optional): The player whose turn it is. If not provided, the current player is used.
            check_validity (bool, optional): Whether to perform checks for validity before applying the turn. Defaults to True.

        Returns:
            bool: True if the turn was applied successfully, False otherwise.
        """
        if(a_to_play is None):
            a_to_play = self.a_to_play

        player = self.snake_a if self.a_to_play else self.snake_b

        if(self.build_history):
            self.history["times"].append(timer)
            self.history["moves"].append(turn)
        self.check_turn_start(a_to_play=a_to_play)

        if(check_validity):
            #safe version, always used by game engine
            if(self.a_to_play):
                self.a_time -= timer
                if(self.a_time < 0 ):
                    return False
            else:
                self.b_time -= timer
                if(self.b_time < 0 ):
                    return False

            moved = False
            try:
                if not self.apply_decay(check_validity=True):
                    return False
                
                if(isinstance(turn, Iterable) and not type(turn) is str):
                    # case for turn being a list
                    if(len(turn) <= 0):
                        return False         

                    for action in turn:
                        if(Action(action) is Action.TRAP):
                            if not self.apply_trap(a_to_play=self.a_to_play, check_validity = True):
                                
                                return False
                        else:
                            moved = True
                        
                            if not self.apply_move(action, a_to_play=self.a_to_play, check_validity=True):
                                return False
                        #sacrifice to take an extra move increments by 2 every move
                        if(player.get_length() < self.map.min_player_size):
                            return False

                    self.next_turn()
                    
                    return moved                
                else:
                    
                    # case for turn being a single move
                    valid = Action(turn) != Action.TRAP and self.apply_move(turn, a_to_play=self.a_to_play, check_validity=True)
                    
                    
                    if(player.get_length()  < self.map.min_player_size):
                        return False
                    
                    if valid:
                        self.next_turn()

                    return valid   
            except:
                return False
        else:
            self.apply_decay(check_validity=False)

            if(isinstance(turn, Iterable) and not type(turn) is str):
                if(len(turn) <= 0):
                    return False
                for action in turn:
                    if(Action(action) is Action.TRAP):
                        self.apply_trap(a_to_play=self.a_to_play, check_validity=False)
                    else:
                        self.apply_move(action, a_to_play=self.a_to_play, check_validity = False)
            else:
                self.apply_move(turn, a_to_play=self.a_to_play, check_validity = False)

            self.next_turn()
            
            return True

    def check_turn_start(self, a_to_play = None):
        """
        Checks to see if an apple spawned on top of the player at the turn start.


        Parameters:
            a_to_play (bool, optional): The player whose turn it is. If not provided, the current player is used.
        """
        if(not self.turn_start_checked):
            if(a_to_play is None):
                a_to_play = self.a_to_play

            player = self.snake_a if a_to_play else self.snake_b

            head_loc = player.get_head_loc()
            if(self.cells_apples[head_loc[1], head_loc[0]] != 0):
                player.eat_apple()
                self.cells_apples[head_loc[1], head_loc[0]]= 0
                if(self.map.cells_portals[head_loc[1], head_loc[0], 0] >= 0):
                    portal_x, portal_y = self.map.cells_portals[head_loc[1], head_loc[0],]
                    self.cells_apples[portal_y, portal_x] = 0

            self.turn_start_checked = True

    def apply_trap(self, a_to_play: bool = None, check_validity: bool = True) -> bool:
        """
        Deploys a trap for the current player.

        Parameters:
            a_to_play (bool, optional): The player whose turn it is. If not provided, the current player is used.
            check_validity (bool, optional): Whether to check the validity of the trap action. Defaults to True.

        Returns:
            bool: True if the trap was applied successfully, False if the trap is invalid.
        """

        if(a_to_play is None):
            a_to_play = self.a_to_play
        
        player = self.snake_a if a_to_play else self.snake_b
        player_cells = self.cells_a if a_to_play else self.cells_b
        trap_set = self.trap_set_a if a_to_play else self.trap_set_b
        cells_traps = self.cells_traps_a if a_to_play else self.cells_traps_b
        
        self.check_turn_start(a_to_play=a_to_play)
        
        if(check_validity ):
            if(not self.apply_decay(check_validity=True)):
                return False
            if(not player.is_valid_trap()):
                return False
        else:
            self.apply_decay(check_validity=False)

        trap_created = player.push_trap() 
        

        cells_traps[trap_created[1], trap_created[0]] = self.map.trap_timeout
        player_cells[trap_created[1], trap_created[0]] -= 1
        trap_set.add((trap_created[0], trap_created[1]))

        if(self.map.cells_portals[trap_created[1], trap_created[0], 0] >= 0):
            portal_x, portal_y = self.map.cells_portals[trap_created[1], trap_created[0]] 
            cells_traps[portal_y, portal_x] = self.map.trap_timeout
            trap_set.add((portal_x, portal_y))

        if(self.build_history):
            self.traps_created_list.append(trap_created)
        return True

    def increment_traps(self):
        toRemove = []
        for trap in self.trap_set_a:
            data = self.cells_traps_a[trap[1], trap[0]] - 1
            self.cells_traps_a[trap[1], trap[0]] = data
            if(data == 0):
                toRemove.append(trap)
                

        if(self.build_history):
            for trap in toRemove:
                self.traps_lost_list.append(trap)
                self.trap_set_a.remove(trap)
        else:
            for trap in toRemove:
                self.trap_set_a.remove(trap)
        

        toRemove = []
        for trap in self.trap_set_b:
            data = self.cells_traps_b[trap[1], trap[0]] - 1
            self.cells_traps_b[trap[1], trap[0]] = data
            if(data == 0):
                toRemove.append(trap)

        if(self.build_history):
            for trap in toRemove:
                self.traps_lost_list.append(trap)
                self.trap_set_b.remove(trap)
        else:
            for trap in toRemove:
                self.trap_set_b.remove(trap)

        
    def resolve_square(self, x: int, y: int, a_to_play: bool = None, check_validity: bool = True) -> bool:
        """
        Resolves the state of a square on the board that a player just moved onto. For internal use by board.
        This function resolves apples and interaction with traps when a player moves onto it.

        Parameters:
            x (int): The x-coordinate of the square to resolve.
            y (int): The y-coordinate of the square to resolve.
            a_to_play (bool, optional): The player whose turn it is. If not provided, the current player is used.
            check_validity (bool, optional): Whether to perform checks for validity before resolving the square. Defaults to True.

        Returns:
            bool: True if the square was resolved successfully, False otherwise.
        """
        if(a_to_play is None):
            a_to_play = self.a_to_play

        player = self.snake_a if a_to_play else self.snake_b
        player_cells = self.cells_a if a_to_play else self.cells_b 
        player_traps_cells = self.cells_traps_a if a_to_play else self.cells_traps_b
        enemy_traps_cells = self.cells_traps_b if a_to_play else self.cells_traps_a
        enemy_trap_set = self.trap_set_b if a_to_play else self.trap_set_a
        #eating an apple
        portal_x = None
        portal_y = None
        if(self.map.cells_portals[y, x, 0] >= 0):
            portal_x, portal_y = self.map.cells_portals[y, x]

        if(self.cells_apples[y, x] != 0):
            player.eat_apple()
            self.cells_apples[y, x]= 0     
            if(portal_x != None):
                portal_x, portal_y = self.map.cells_portals[y, x]
                self.cells_apples[portal_y, portal_x] = 0

        if(player_traps_cells[y, x] != 0):
            player_traps_cells[y, x] = self.map.trap_timeout
            if(portal_x != None):
                player_traps_cells[portal_y, portal_x] = self.map.trap_timeout

        if(enemy_traps_cells[y, x] != 0):
            enemy_traps_cells[y, x] = 0
            enemy_trap_set.remove((x, y))
            if(portal_x != None):
                enemy_trap_set.remove((portal_x, portal_y))
                
                enemy_traps_cells[portal_y, portal_x] = 0

            if(self.build_history):
                self.traps_lost_list.append((x, y))

            if(check_validity and player.get_length() - 2 < player.min_player_size):
                return False

            cells_lost = player.apply_sacrifice(2)

            if(cells_lost is not None):
                player_cells[cells_lost[:, 1], cells_lost[:, 0]] -= 1
                if(self.build_history):
                    self.cells_lost_list.append(cells_lost)

        return True
        

    #applies a single move to the players' snake
    def apply_move(self, action: Action, sacrifice: int = None, a_to_play: bool = None, check_validity: bool = True) -> bool:
        """
        Applies a move to the board, mutating the board.

        A move should be in the form of a direction. Actions can either be in the form of enums 
        from game.enums.Action or the ints to which the Action enum is mapped.

        If check_validity is enabled, apply_move performs checks to ensure no errors. 
        If check_validity is disabled, the move is assumed to be valid and runs without additional checks.

        Parameters:
            action (enums.Action): The action representing the direction to move.
            sacrifice (int, optional): The amount of sacrifice applied to the move. Defaults to None.
            a_to_play (bool, optional): The player whose turn it is. If not provided, the current player is used.
            check_validity (bool, optional): Whether to perform checks for validity before applying the move. Defaults to True.

        Returns:
            bool: True if the move was applied successfully, False otherwise.
        """

        if(action == None):
            return False
        if(a_to_play is None):
            a_to_play = self.a_to_play
        player = self.snake_a if a_to_play else self.snake_b
        player_cells = self.cells_a if a_to_play else self.cells_b  

        self.check_turn_start(a_to_play=a_to_play)        
        if(check_validity):
            #apply a single move with checks
            try:
                if not self.apply_decay(check_validity=True):
                    return False
                
                if not player.can_move(action, sacrifice):
                    return False

                head_loc, cells_lost = player.push_move(action, sacrifice)

                if(cells_lost is not None):
                    player_cells[cells_lost[:, 1], cells_lost[:, 0]] -= 1
                    if(self.build_history):
                        self.cells_lost_list.append(cells_lost)

                if not self.is_valid_cell(head_loc):
                    return False 
                
                if(self.map.cells_portals[head_loc[1], head_loc[0], 0] >= 0):
                    portal_x, portal_y = self.map.cells_portals[head_loc[1], head_loc[0]] 
                    if not self.is_valid_cell((portal_x, portal_y)):
                        return False 
                    player.push_head_cell(np.array([portal_x, portal_y]))
                    if(self.build_history):
                        self.cells_gained_list.append(np.array([np.array([portal_x, portal_y])]))
                    player_cells[portal_y, portal_x] += 1
                else:
                    player.push_head_cell(head_loc)
                    if(self.build_history):
                        self.cells_gained_list.append(np.array([head_loc]))
                    player_cells[head_loc[1], head_loc[0]] += 1
                if(not self.resolve_square(head_loc[0], head_loc[1], a_to_play, True)):
                    return False

            
                return True
            except:
                return False
        else:
            #apply a single move with no checks
            self.apply_decay()

            head_loc, cells_lost = player.push_move(action, sacrifice)

            #eating an apple
            if(self.cells_apples[head_loc[1], head_loc[0]] != 0):
                player.eat_apple()
                self.cells_apples[head_loc[1], head_loc[0]]= 0
                if(self.map.cells_portals[head_loc[1], head_loc[0], 0] >= 0):
                    portal_x, portal_y = self.map.cells_portals[y, x]
                    self.cells_apples[portal_y, portal_x] = 0


            if(cells_lost is not None):
                player_cells[cells_lost[:, 1], cells_lost[:, 0]] -= 1

            if(self.map.cells_portals[head_loc[1], head_loc[0], 0] >= 0):
                portal_x, portal_y = self.map.cells_portals[head_loc[1], head_loc[0]] 
                player.push_head_cell(np.array([portal_x, portal_y]))
            else:
                player.push_head_cell(head_loc)

            self.resolve_square(head_loc[0], head_loc[1], a_to_play, False)

            player_cells[head_loc[1], head_loc[0]] += 1

            return True

    def next_turn(self):
        """
        Advances the board to the next turn, recording and managing necessary game metadata.
        """
        if(self.build_history):
            if(len(self.cells_gained_list)>0):
                self.history["cells_gained"].append(np.concatenate(self.cells_gained_list))
            else:
                self.history["cells_gained"].append([])

            if(len(self.cells_lost_list)>0):
                self.history["cells_lost"].append(np.concatenate(self.cells_lost_list))
            else:
                self.history["cells_lost"].append([])

            if(len(self.traps_created_list) > 0):
                self.history["traps_created"].append(np.array(self.traps_created_list))
            else:
                self.history["traps_created"].append([])

            if(len(self.traps_lost_list) > 0):
                self.history["traps_lost"].append(np.array(self.traps_lost_list))
            else:
                self.history["traps_lost"].append([])
            
            self.cells_gained_list = []
            self.cells_lost_list = []
            self.traps_created_list = []
            self.traps_lost_list = []
            self.history["a_length"].append(self.snake_a.get_length())
            self.history["b_length"].append(self.snake_b.get_length())

        self.turn_count+=1
        player = self.snake_a if self.a_to_play else self.snake_b
        player.reset()
        self.a_to_play = not self.a_to_play

        self.decay_applied = False
        self.turn_start_checked = False
        self.spawn_apples()
        self.increment_decay()
        self.increment_traps()
        


    def spawn_apples(self):
        """
        Spawns in apples on the current round.
        """
        while(self.apple_counter < len(self.map.apple_timeline) and self.map.apple_timeline[self.apple_counter][0] <= self.turn_count):
            x, y = self.map.apple_timeline[self.apple_counter][1:]
            self.cells_apples[y, x] = 1
            self.apple_counter +=1

    def get_history(self) -> dict:
        """
        Get a dictionary representation for the renderer.

        Returns:
            dict: A dictionary representing the game history.
        """
        return self.history
    
    def get_map_generated(self) -> str:
        """
        Gets the map that is played on (including apple spawns).

        Returns:
            str: A string representation of the generated map.
        """
        return self.map.get_recorded_map()


    def get_copy(self, build_history: bool = False) -> "Board":
        """
        Returns a deep copy of the board.

        Parameters:
            build_history (bool, optional): Whether to include the history of the game in the copy. Defaults to False.

        Returns:
            Board: A deep copy of the current board object.
        """

        new_board = Board(self.map, build_history=build_history, copy=True)
        new_board.cells_a = np.array(self.cells_a)
        new_board.cells_b = np.array(self.cells_b)
        new_board.cells_apples = np.array(self.cells_apples)
        new_board.cells_traps_a = np.array(self.cells_traps_a)
        new_board.cells_traps_b = np.array(self.cells_traps_b)
        new_board.trap_set_a = set(self.trap_set_a)
        new_board.trap_set_b = set(self.trap_set_b)

        new_board.snake_a = self.snake_a.get_copy()
        new_board.snake_b = self.snake_b.get_copy()

        new_board.apple_counter = self.apple_counter
        new_board.turn_count = self.turn_count

        new_board.a_to_play = self.a_to_play
        new_board.bid_resolved = self.bid_resolved
        new_board.winner = self.winner
        
        new_board.a_time = self.a_time
        new_board.b_time = self.b_time
        new_board.win_reason = self.win_reason

        new_board.decay_interval = self.decay_interval
        new_board.decay_count = self.decay_count
        new_board.decaying = self.decaying

        new_board.decay_index = self.decay_index
        new_board.turn_start_checked = self.turn_start_checked
        new_board.decay_applied = self.decay_applied
    
        new_board.build_history = build_history
        if(build_history):
            new_board.history = json.loads(self.get_history_json())
            new_board.cells_lost_list = [np.array(x) for x in self.cells_lost_list]
            new_board.traps_created_list = [np.array(x) for x in self.traps_created_list]
            new_board.traps_lost_list = [np.array(x) for x in self.traps_lost_list]
            
        return new_board


    def forecast_trap(self, check_validity: bool = True) -> tuple:
        """
        Non-mutating version of apply_trap. Returns a tuple with the new board copy, then
        whether the trap was deployed successfully.

        Parameters:
            check_validity (bool, optional): Whether to validate the trap. Defaults to True.

        Returns:
           tuple: A tuple containing:
                - Board: A copy of the board after the move.
                - bool: True if the trap was successful, False otherwise.
        """
        board_copy = self.get_copy()
        ok = board_copy.apply_trap(check_validity=check_validity)

        return board_copy, ok

    
    def forecast_move(self, move: Action, sacrifice: int = None, check_validity: bool = True) -> tuple:
        """
        Non-mutating version of apply_move. Returns a tuple with the new board copy, then
        whether the move executed properly.

        Parameters:
            move (enums.Action): The action to apply (direction of movement).
            sacrifice (int, optional): The amount of sacrifice to apply. Defaults to None.
            check_validity (bool, optional): Whether to validate the move. Defaults to True.

        Returns:
            tuple: A tuple containing:
                - Board: A copy of the board after the move.
                - bool: True if the move was applied successfully, False otherwise.
        """

        board_copy = self.get_copy()
        ok = board_copy.apply_move(move, sacrifice = sacrifice, check_validity=check_validity)

        return board_copy, ok
    
    def forecast_turn(self, turn, check_validity: bool = True) -> tuple:
        """
        Non-mutating version of apply_turn. Returns a tuple with the new board copy, then
        whether the turn executed properly.

        Parameters:
            turn (enums.Action or Iterable[enums.Actions] or Iterable[int]): The action(s) the player takes in sequence.
            check_validity (bool, optional): Whether to validate the turn. Defaults to True.

        Returns:
            tuple: A tuple containing:
                - Board: A copy of the board after the turn.
                - bool: True if the turn was applied successfully, False otherwise.
        """
        board_copy = self.get_copy()
        ok = board_copy.apply_turn(turn, check_validity=check_validity)

        return board_copy, ok


    # for terminal visualization
    def get_board_string(self) -> str:
        """
        Returns a string representation of the current state of the board, including player positions, apples, and traps. Mostly for internal
        use by developers.

        - Player positions (`A` for snake A's head, `a` for snake A's body, `B` for snake B's head, `b` for snake B's body, and `x` for walls)
        - Apple positions (`. ` for apples)
        - Trap positions (`a ` for traps belonging to snake A, `b ` for traps belonging to snake B)


        Returns:
            tuple: A tuple containing:
                - player_map (str): String representation of player positions.
                - apple_map (str): String representation of apple positions.
                - trap_map (str): String representation of trap positions.
                - snake_a_length (int): Length of snake A.
                - snake_b_length (int): Length of snake B.
        """

        apple_list = []
        player_list = []
        trap_list = []
        for y in range(self.map.dim_y):
            for x in range (self.map.dim_x):
                if(self.cells_apples[y][x] > 0):
                    apple_list.append(". ")
                else:
                    apple_list.append("  ")

                if(self.cells_traps_a[y][x] > 0):
                    trap_list.append("a ")
                elif(self.cells_traps_b[y][x] > 0):
                    trap_list.append("b ")
                else:
                    trap_list.append("  ")

                if(self.map.cells_walls[y][x]):
                    player_list.append("x ")
                elif(self.cells_a[y][x] > 0):
                    if(np.allclose(self.snake_a.get_head_loc(), np.array((x, y)).reshape(1, 2))):
                        player_list.append("A ")
                    else:
                        player_list.append("a ")
                elif(self.cells_b[y][x]):
                    if(np.allclose(self.snake_b.get_head_loc(), np.array((x, y)).reshape(1, 2))):
                        player_list.append("B ")
                    else:
                        player_list.append("b ")
                
                elif(self.cells_apples[y][x]):
                    player_list.append(". ")
                else:
                    player_list.append("  ")


            apple_list.append("\n")
            player_list.append("\n")
            trap_list.append("\n")

        apple_map = "".join(apple_list)
        player_map = "".join(player_list)
        trap_map = "".join(trap_list)

        return player_map, apple_map, trap_map, self.snake_a.get_length(), self.snake_b.get_length()
