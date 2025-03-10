from game.board import Board
from game.enums import Cell, Action, Result
import numpy as np
from enum import IntEnum, auto



class PlayerBoard:
    """
    A wrapper around the Board class to be able to call board and
    snake functions from the player's perspective.

    Any coordinates should be given to the board in the form of x, y.
    Game objects are displayed, indexed, and stored on the 
    board arrays as arr[y, x] for geometrical accuracy. Mask functions return
    arrays that should be indexed by [y, x].

    Check_validity is on by default for most functions, but slows
    down execution. If a player is confident their actions are valid,
    they can directly apply turns and moves with check_validity as false.

    Be wary that invalid actions/turns/function calls could lead to functions throwing
    errors, so make sure to handle them with a try/except in case so that
    your program doesn't crash. If an apply function throws an error,
    it is not guarenteed that the board state will be valid or that the state
    will be the same as when the function started.
    """
    def __init__(self, is_player_a:bool, game_board: Board):
        """
        Parameters:  
            is_player_a (bool): If True, the player is player A; if False, the player is player B.
            game_board (Board): The game board object that holds the state of the current match.
        """
        
        self.game_board = game_board
        self.is_player_a = is_player_a

        self.player_snake = game_board.snake_a if is_player_a else game_board.snake_b
        self.enemy_snake = game_board.snake_b if is_player_a else game_board.snake_a

        self.player_cells = game_board.cells_a if is_player_a else game_board.cells_b
        self.enemy_cells = game_board.cells_b if is_player_a else game_board.cells_a


        self.player_trap_cells = game_board.cells_traps_a if is_player_a else game_board.cells_traps_b
        self.enemy_trap_cells = game_board.cells_traps_b if is_player_a else game_board.cells_traps_a


    def get_dim_x(self) -> int:
        """
        Returns the x dimension of the board.

        Returns:  
            (int): Width of the board.
        """
        return self.game_board.map.dim_x

    def get_dim_y(self) -> int:
        """
        Returns the y dimension of the board.

        Returns:  
            (int): Height of the board.
        """
        return self.game_board.map.dim_y


    def get_direction(self, enemy:bool = False) -> Action:
        """
        Returns the direction of the snake

        Parameters:   
            enemy (bool, optional): If True, returns the direction of the enemy snake. Defaults to False (for the current player).

        Returns:  
            Action: The direction of the snake.
        """
        if(enemy):
            return self.enemy_snake.direction
        return self.player_snake.direction

    def is_valid_bid(self, bid:int) -> bool:
        """
        Checks if a bid is valid.

        Parameters:  
            bid (int): The bid amount to check.

        Returns:  
            bool: True if the bid is valid, False otherwise.
        """
        return self.game_board.is_valid_bid(bid)


    def apply_bid(self, my_bid:int, enemy_bid:int):
        """
        Applies the bids to each snake.

        Parameters:   
            my_bid (int): The bid made by the player.  
            enemy_bid (int): The bid made by the enemy.
        """
        if(self.is_player_a):
            self.game_board.resolve_bid(my_bid, enemy_bid)
        else:
            self.game_board.resolve_bid(enemy_bid, my_bid)


    def forecast_bid(self, my_bid:int, enemy_bid:int) -> "PlayerBoard":
        """
        Forecasts the result of a bid and predicts the new state of the game.

        Parameters:   
            my_bid (int): The bid made by the player.  
            enemy_bid (int): The bid made by the enemy.

        Returns:  
            PlayerBoard: A copy of the game with the game state after the bids.
        """
        player_board_copy = self.get_copy()
        player_board_copy.apply_bid(my_bid, enemy_bid)

        return player_board_copy
        
    
    def is_game_over(self) -> bool:
        """
        Checks if the game is over by determining if there is a winner.

        Returns:  
            bool: True if the game is over, False otherwise.
        """
        return not self.game_board.winner is None
       
    def get_min_player_size(self) -> int:
        """
        Gets the minimum size below which a player cannot go.

        Returns:  
            int: The minimum player size.
        """
        return self.game_board.map.min_player_size

    def get_current_apples(self) -> np.ndarray:
        """
        Returns an apple x 2 numpy array of apple coordinates currently on the board
        in (x, y) format.

        Returns:  
            numpy.ndarray: A 2D array with each row representing the coordinates 
                        of an apple in (x, y) format.
        """

        apples = np.transpose(np.where(self.game_board.cells_apples > 0))
        apples[:, [0, 1]] = apples[:, [1, 0]]
        return apples
    
    def get_future_apples(self) -> list:
        """
        Returns a list of 3-integer tuples representing the future apples on the board,
        where each tuple is in the format (spawn time, x, y).

        Returns:  
            list: A list of tuples, each containing the (time, x, y) coordinates 
                for each future apple.
        """
        return self.game_board.map.apple_timeline[self.game_board.apple_counter: len(self.game_board.map.apple_timeline)]

    def get_head_location(self, enemy: bool = False) -> np.ndarray:
        """
        Returns the head location of the snake's head in the form of (x, y).

        Parameters:  
            enemy (bool, optional): If True, returns the head location of the enemy's snake. 
                                    Defaults to False, which returns the player's snake head location.

        Returns:  
            numpy.ndarray: The (x, y) coordinates of the snake's head.
        """
        if not enemy:
            return self.player_snake.get_head_loc()
        return self.enemy_snake.get_head_loc()
    
    def get_tail_location(self, enemy: bool = False) -> np.ndarray:
        """
        Returns the tail location of the snake in the form of (x, y).

        Parameters:  
            enemy (bool, optional): If True, returns the tail location of the enemy's snake. 
                                    Defaults to False, which returns the player's snake tail location.

        Returns:  
            numpy.ndarray: The (x, y) coordinates of the snake's tail.
        """
        if not enemy:
            return self.player_snake.get_tail_loc()
        return self.enemy_snake.get_tail_loc()

    def get_head_cells(self, num_cells:int, enemy=False) -> np.ndarray:
        """
        Retrieves num_cells physically occupied positions from the head of the snake.

        Parameters:  
            num_cells (int): The number of physically occupied cells from the head of the snake.  
            enemy (bool, optional): If True, get the positions of the enemy snake's head; otherwise, for the player's snake.

        Returns:  
            numpy.ndarray: A numpy array containing the positions of the head and the following cells of the snake.
        """
        if(enemy):
            return self.enemy_snake.get_first_cells(num_cells)
        return self.player_snake.get_first_cells(num_cells)

    
    def get_tail_cells(self, num_cells:int, enemy=False)-> np.ndarray:
        """
        Retrieves num_cells physically occupied positions from the tail of the snake.

        Parameters:  
            num_cells (int): The number of positions to retrieve from the tail of the snake.  
            enemy (bool, optional): If True, get the positions of the enemy snake's tail; otherwise, for the player's snake.

        Returns:  
            numpy.ndarray: A numpy array containing the positions of the tail and the preceding cells of the snake.
        """
        if(enemy):
            return self.enemy_snake.get_last_cells(num_cells)
        return self.player_snake.get_last_cells(num_cells)


    def get_all_locations(self, enemy: bool = False) -> np.ndarray:
        """
        Returns all physically occupied locations of either the player's or the opponent's snake.

        Parameters:  
            enemy (bool, optional): If True, returns the locations of the enemy's snake. 
                                    Defaults to False, which returns the player's snake locations.

        Returns:  
            numpy.ndarray: A numpy array of length * 2 representing all locations of the snake as (x, y).
        """

        if not enemy:
            return self.player_snake.get_all_loc()
        return self.enemy_snake.get_all_loc()
    
    def get_length(self, enemy:bool = False) -> int:
        """
        Returns length of a snake

        Parameters:  
            enemy (bool, optional): If True, returns the length of the enemy's snake. 
                                    Defaults to False, which returns the player's snake length

        Returns:  
            int: The length of the snake.
        """
        if not enemy:
            return self.player_snake.get_length()
        return self.enemy_snake.get_length()


    def get_unqueued_length(self, enemy:bool = False) -> int:
        """
        Returns the number of squares a snake physically occupies

        Parameters:  
            enemy (bool, optional): If True, returns the length of the enemy's snake. 
                                    Defaults to False, which returns the player's snake length

        Returns:  
            int: Unqueued length of the snake.
        """
        if not enemy:
            return self.player_snake.get_unqueued_length()
        return self.enemy_snake.get_unqueued_length()

    def get_queued_length(self, enemy:bool = False) -> int:
        """
        Returns the amount of length a snake will accrue due to apples.

        Parameters:  
            enemy (bool, optional): If True, returns the length of the enemy's snake. 
                                    Defaults to False, which returns the player's snake length

        Returns:  
            int: Queued length of the snake.
        """
        if not enemy:
            return self.player_snake.length_queued
        return self.enemy_snake.length_queued
    

    def get_am_player_a(self, enemy: bool = False) -> bool:
        """
        Returns if the calling player is player A or player B.

        Parameters:  
            enemy (bool, optional): If True, checks if the current player is the enemy. 
                                    Defaults to False, which checks for player A.

        Returns:  
            bool: True if the calling player is player A, False if the calling player is player B.
        """
        return self.is_player_a != enemy

    def get_time_left(self, enemy: bool = False) -> float:
        """
        Returns the time left on the clock for a player.

        Parameters:  
            enemy (bool, optional): If True, returns the time left for the opponent. Defaults to False, 
                                    which returns the time left for the calling player.

        Returns:  
            float: The time left on the clock for the specified player.
        """

        if not enemy:
            if self.is_player_a:
                return self.game_board.get_a_time()
            else:
                return self.game_board.get_b_time()
        else:
            if self.is_player_a:
                return self.game_board.get_b_time()
            else:
                return self.game_board.get_a_time()

    def is_possible_direction(self, action: Action, enemy: bool = False) -> bool:
        """
        Checks directions to move in given snake's current direction it is facing,
        not accounting for board bounds or cell occupancy.

        Parameters:  
            action (enums.Action): The direction to check.  
            enemy (bool, optional): If True, checks for the opponent's snake. Defaults to False, 
                                    which checks for the player's snake.

        Returns:  
            bool: True if the direction is valid for the given snake, False otherwise.
        """

        if not enemy:
            return self.player_snake.is_valid_direction(action)
        return self.enemy_snake.is_valid_direction(action)

    def is_possible_move(self, move: Action, sacrifice: int = None, enemy: bool = False) -> bool:
        """
        Checks if the snake can make a move based on the specified action, sacrifice, and direction,
        accounting for board bound. Does not account for cell occupancy or length changes.
        from traps.

        Parameters:  
            move (enums.Action): The direction to move (e.g., Action.NORTH, Action.SOUTH).  
            sacrifice (int, optional): The sacrifice value to check. If not provided, the current sacrifice value is used.  
            enemy (bool, optional): If True, checks for the opponent's snake. Defaults to False, which checks for the player's snake.

        Returns:  
            bool: True if the snake can make the move based on the specified conditions, False otherwise.
        """

        loc = self.get_loc_after_move(move, enemy)
        if not self.cell_in_bounds(loc):
            return False
        if not enemy:
            return self.player_snake.can_move(move, sacrifice)
        return self.enemy_snake.can_move(move, sacrifice)

    
    def is_valid_action(self, action:Action, enemy:bool = False) -> bool:
        """
        Checks if the given action is valid for a player.

        Parameters:  
            action (enums.Action): The action to validate (e.g., Action.NORTH, Action.SOUTH).  
            enemy (bool, optional): If True, checks the validity for the opponent. Defaults to False.  

        Returns:  
            bool: True if the action is valid for the player, False otherwise.
        """
        return self.game_board.is_valid_action(Action(action), self.is_player_a != enemy)
        

    def is_valid_move(self, move: Action, sacrifice: int = None, enemy: bool = False) -> bool:
        """
        Checks if the given move is valid for the current player, accounting for the direction, sacrifice, and enemy.

        Parameters:  
            move (enums.Action): The move to validate.  
            sacrifice (int, optional): The amount of sacrifice to apply. If not provided, the current sacrifice value is used.  
            enemy (bool, optional): If True, checks the validity for the opponent. Defaults to False.

        Returns:  
            bool: True if the move is valid for the player, False otherwise.
        """

        return self.game_board.is_valid_move(Action(move), sacrifice, self.is_player_a != enemy)

    def is_valid_trap(self, enemy:bool=False) -> bool:
        """
        Returns whether the player can deploy a trap.

        Parameters:  
            enemy (bool, optional): If True, checks the validity for the opponent. Defaults to False.

        Returns:  
            bool: True if the player can apply a trap, False otherwise.
        """
        if not enemy:
            return self.player_snake.is_valid_trap()
        return self.enemy_snake.is_valid_trap()

    def is_valid_turn(self, turn, enemy:bool=False) -> bool:
        """
        Returns if the given turn is a valid turn.
        A turn can be an Action or iterable of Actions. Actions can either be
        in the form of enums given in game.enums.Action or the ints to which the Action
        enum is mapped.

        Parameters:  
            turn (enums.Action or Iterable[enums.Actions] or Iterable[int]): The action(s) the player takes in sequence.  
            enemy (bool, optional): If True, checks the validity for the opponent. Defaults to False.    

        Returns:  
            bool: True if the turn is valid, False otherwise.
        """
        return self.game_board.is_valid_turn(turn, self.is_player_a != enemy)

    def get_loc_after_move(self, action: Action, enemy: bool = False) -> np.ndarray:
        """
        Simulates the location of the snake's head after the given action is applied.

        Parameters:  
            action (enums.Action): The action to simulate (e.g., Action.NORTH, Action.SOUTH).  
            enemy (bool, optional): If True, simulates the opponent's snake's head movement. Defaults to False, simulating the player's snake's head movement.

        Returns:  
            numpy.ndarray: The simulated location of the snake's head after the move.
        """

        if not enemy:
            return self.player_snake.get_next_loc(action)
        return self.enemy_snake.get_next_loc(action)

    def get_possible_directions(self, enemy: bool = False) -> list:
        """
        Retrieves the possible directions the snake can move in, without considering the board state or cell occupancy.

        Parameters:  
            enemy (bool, optional): If True, retrieves the possible directions for the opponent's snake. Defaults to False, retrieving for the player's snake.

        Returns:  
            list: A list of valid directions (as Action enum values) that the snake can move in.
        """

        if not enemy:
            return self.player_snake.get_valid_directions()
        return self.enemy_snake.get_valid_directions()


    def get_apples_eaten(self, enemy: bool = False) -> int:
        """
        Retrieves the number of apples eaten by the snake.

        Parameters:  
            enemy (bool, optional): If True, retrieves the number of apples eaten by the opponent's snake. Defaults to False, retrieving for the player's snake.

        Returns:  
            int: The number of apples eaten by the snake.
        """
        if not enemy:
            return self.player_snake.get_apples_eaten()
        return self.enemy_snake.get_apples_eaten()

    def cell_in_bounds(self, loc: tuple | np.ndarray) -> bool:
        """
        Checks if the given location is within the bounds of the board.

        Parameters:  
            loc (tuple or numpy.ndarray): The coordinates to check, represented as (x, y).

        Returns:  
            bool: True if the location is within bounds, False otherwise.
        """
        return self.game_board.cell_in_bounds(loc)

    def cell_in_bounds_xy(self, x:int, y:int) -> bool:
        """
        Checks if the given location is within the bounds of the board.

        Parameters:  
            x (int): x coordinate to check  
            y (int): y coordinate to check

        Returns:  
            bool: True if the location is within bounds, False otherwise.
        """
        return self.game_board.cell_in_bounds((x, y))

    def try_move(self, action: Action, sacrifice: int = None, enemy: bool = False) -> bool:
        """
        Returns the tail cells that would be los in the event of a move
        as well as the new head location.

        Parameters:  
            action (enums.Action): The action representing the move to be made (e.g., Action.NORTH, Action.SOUTH).  
            sacrifice (int, optional): The amount of sacrifice to apply. If not provided, the current sacrifice value is used.  
            enemy (bool, optional): If True, applies the move for the enemy. Defaults to False (for the current player).

         Returns:  
            tuple: A tuple containing:
                - numpy.ndarray: The new location of the snake's head.
                - list: The cells that would be lost from the tail if the move is applied.
        """
        if(not enemy):
            return self.player_snake.try_move(action, sacrifice)
        return self.enemy_snake.try_move(action, sacrifice)

    def try_trap(self, enemy: bool = False) -> np.ndarray:
        """
        Returns the cell at the tail of the snake, which would represent the trap.

        Parameters:  
            enemy (bool, optional): If True, applies the trap for the enemy. Defaults to False (for the current player).

        Returns:  
            numpy.ndarray: The cell at the tail of the snake, which would represent the trap.
        """
        if(not enemy):
            return self.player_snake.try_trap()
        return self.enemy_snake.try_trap()

    def try_action(self, action: Action, enemy: bool = False) -> np.ndarray:
        """
        Returns changes to the snake that would occur if an action performed.

        Parameters:  
            action (enums.Action): The action to perform (e.g., Action.TRAP, Action.MOVE).  
            enemy (bool, optional): If True, performs the action for the enemy. Defaults to False (for the current player).

        Returns:  
            numpy.ndarray: The resulting cell after performing the action (either the trap or the new position after move).
        """

        if(not enemy):
            if(action == Action.TRAP):
                return self.player_snake.try_trap()
            else:
                return self.player_snake.try_move()
        else:
            if(action == Action.TRAP):
                return self.enemy_snake.try_trap()
            else:
                return self.enemy_snake.try_move()

    def try_sacrifice(self, sacrifice: int = None, enemy: bool = False) -> list:
        """
        Tries to apply a sacrifice (removal of cells from the snake's tail) for the player or the enemy.

        Parameters:  
            sacrifice (int, optional): The amount of sacrifice. If not provided, the current sacrifice value is used.  
            enemy (bool, optional): If True, applies the sacrifice for the enemy. Defaults to False (for the current player).

        Returns:  
            list: A list of cells that would be removed from the tail of the snake if the sacrifice is applied.
        """

        if(not enemy):
            return self.player_snake.try_sacrifice(sacrifice)
        return self.enemy_snake.try_sacrifice(sacrifice)

    def apply_sacrifice(self, sacrifice: int = None, enemy: bool = False) -> list:
        """
        Applies a sacrifice (removal of cells from the snake's tail) for the player or the enemy.  

        Parameters:  
            sacrifice (int, optional): The amount of sacrifice to apply. If not provided, the current sacrifice value is used.  
            enemy (bool, optional): If True, applies the sacrifice for the enemy. Defaults to False (for the current player).

        Returns:  
            list: A list of cells that are removed from the tail of the snake after the sacrifice is applied.
        """

        if(not enemy):
            return self.player_snake.apply_sacrifice(sacrifice)
        return self.enemy_snake.apply_sacrifice(sacrifice)
        

    def apply_action(self, action:Action, check_validity:bool = True) -> bool:
        """
        Performs an action, mutating the board.

        Parameters:  
            action (enums.Action): The action to perform (e.g., Action.TRAP, Action.MOVE).  
            enemy (bool, optional): If True, performs the action for the enemy. Defaults to False (for the current player).

        Returns:  
            bool: If the action succeeded or not.
        """
        if(Action(action) == Action.TRAP):
            return self.game_board.apply_trap(check_validity = check_validity)
        else:
            return self.game_board.apply_move(action, check_validity=check_validity)
       

    def apply_trap(self, check_validity: bool = True) -> bool:
        """
        Deploys a trap for the current player, mutating the board.

        Parameters:  
            check_validity (bool, optional): Whether to check the validity of the trap action. Defaults to True.

        Returns:  
            bool: True if the trap was applied successfully, False if the trap is invalid.
        """

        return self.game_board.apply_trap(check_validity=check_validity)


    def apply_move(self, move: Action, sacrifice: int = None, check_validity: bool = True) -> bool:
        """
        Applies a move to the board, mutating the board.

        A move should be in the form of a direction. Actions can either be in the form of enums 
        from game.enums.Action or the ints to which the Action enum is mapped.

        If check_validity is enabled, apply_move performs checks to ensure no errors. 
        If check_validity is disabled, the move is assumed to be valid and runs without additional checks.

        Parameters:  
            move (enums.Action): The action representing the direction to move.  
            sacrifice (int, optional): The amount of sacrifice applied to the move. Defaults to None.  
            check_validity (bool, optional): Whether to perform checks for validity before applying the move. Defaults to True.

        Returns:  
            bool: True if the move was applied successfully, False otherwise.
        """

        return self.game_board.apply_move(move, sacrifice, check_validity=check_validity)

    def apply_turn(self, turn, check_validity:bool=True, reverse:bool=False) -> bool:
        """
        Applies a turn to the board, mutating the board, ending the current turn, and passing the move to the next player.

        A turn can be a direction or an iterable of directions. Actions can either be in the form of enums 
        from game.enums.Action or the ints to which the Action enum is mapped.

        If check_validity is enabled, apply_turn performs checks to ensure no errors. If check_validity is 
        disabled, the turn is assumed to be valid and runs without additional checks.

        Parameters:  
            turn (enums.Action or Iterable[enums.Actions] or Iterable[int]): The action(s) the player takes in sequence.  
            check_validity (bool, optional): Whether to perform checks for validity before applying the turn. Defaults to True.  
            reverse (bool, optional): Reverses the perspective the board is seen from following application of the turn. Defaults to False.
        
        Returns:  
            bool: True if the turn was applied successfully, False otherwise.
        """
        success = self.game_board.apply_turn(turn, check_validity=check_validity)
        if reverse:
            self.reverse_perspective()
        return success
    

    def end_turn(self, reverse:bool=False):
        """
        Ends the current turn and optionally reverses the board state.

        Parameters:  
            reverse (bool, optional): Whether to reverse the board state after ending the turn. Defaults to False.
        """
        self.game_board.next_turn()
        if reverse:
            self.reverse_perspective()

    def forecast_action(self, action:Action, check_validity:bool=True) -> tuple:
        """
        Simulates the application of an action (move or trap) on a copy
        of the current board and returns the resulting board state.

        Parameters:  
            action (enums.Action): The action to forecast (e.g., move or trap).  
            check_validity (bool, optional): Whether to check the validity of the action. Defaults to True.

        Returns:  
            tuple: A tuple containing:  
                - The board state after applying the action (as a copy of the current board).  
                - A boolean indicating whether the action was successfully applied (True if successful, False if not).
        """

        player_board_copy = self.get_copy()
        if(Action(action) == Action.TRAP):
            success = player_board_copy.apply_trap(check_validity = check_validity)
        else:
            success = player_board_copy.apply_move(action, check_validity=check_validity)
        return player_board_copy, success


    def forecast_trap(self, check_validity:bool=True) -> tuple:
        """
        Simulates the application of a trap on a copy of the current board and returns the resulting board state.

        Parameters:  
            check_validity (bool, optional): Whether to check the validity of the trap action. Defaults to True.

        Returns:  
            tuple: A tuple containing:  
                - The board state after applying the trap (as a copy of the current board).  
                - A boolean indicating whether the trap was successfully applied (True if successful, False if not).
        """

        player_board_copy = self.get_copy()
        success = player_board_copy.apply_trap(check_validity = check_validity)
        
        return player_board_copy, success

    def forecast_move(self, move:Action, sacrifice:int=None, check_validity:bool=False) -> tuple:
        """
        Simulates the application of a move (with or without sacrifice) on a copy of the current board 
        and returns the resulting board state.

        Parameters:  
            move (enums.Action): The action representing the move to be made (e.g., Action.NORTH, Action.SOUTH).  
            sacrifice (int, optional): The amount of sacrifice to apply. Defaults to None.  
            check_validity (bool, optional): Whether to check the validity of the move. Defaults to True.
            

        Returns:  
            tuple: A tuple containing:  
                - The board state after applying the move (as a copy of the current board).  
                - A boolean indicating whether the move was successfully applied (True if successful, False if not).
        """

        player_board_copy = self.get_copy()
        success = player_board_copy.apply_move(move, sacrifice, check_validity=check_validity)

        return player_board_copy, success

    def forecast_turn(self, turn, check_validity: bool = True, reverse:bool=False) -> tuple:
        """
        Simulates the application of a whole turn (multiple moves) on a copy of the current board and returns the resulting board state.

        Parameters:  
            turn (enums.Action or Iterable[enums.Actions] or Iterable[int]): The action(s) the player takes in sequence.  
            check_validity (bool, optional): Whether to check the validity of each action in the turn. Defaults to True.  
            reverse (bool, optional): reverses the perspective the board is seen from following application of the turn. Defaults to False.

        Returns:  
            tuple: A tuple containing:  
                - The board state after applying the turn (as a copy of the current board).  
                - A boolean indicating whether the turn was successfully applied (True if successful, False if not).
        """

        player_board_copy = self.get_copy()
        success = player_board_copy.apply_turn(turn, check_validity=check_validity)
        if(reverse):
            player_board_copy.reverse_perspective()

        return player_board_copy, success

    def reverse_perspective(self):
        """
        Reverses the perspective the board is seen from.
        """
        self.is_player_a = not self.is_player_a

        self.player_snake, self.enemy_snake = self.enemy_snake, self.player_snake
        self.player_cells, self.enemy_cells = self.enemy_cells, self.player_cells
        self.player_trap_cells, self.enemy_trap_cells = self.enemy_trap_cells, self.player_trap_cells

    def is_my_turn(self) -> bool:
        """
        Returns whether it is the player's turn or not.

        Returns:  
            bool: True if it's the player's turn, False otherwise.
        """
        return self.is_player_a == self.game_board.is_as_turn()

    def is_enemy_turn(self) -> bool:
        """
        Returns whether it is the enemy's turn or not.

        Returns:  
            bool: True if it's the enemy's turn, False otherwise.
        """
        return self.is_player_a != self.game_board.is_as_turn()

    def get_copy(self) -> "PlayerBoard":
        """
        Returns a copy of this board.

        Returns:  
            PlayerBoard: A new instance of PlayerBoard representing a copy of the current board.
        """
        return PlayerBoard(self.is_player_a, self.game_board.get_copy(build_history=False))

    def is_occupied(self, x: int, y: int) -> bool:
        """
        Returns whether the cell at (x, y) is occupied or not.

        Parameters:  
            x (int): The x-coordinate of the cell to check.  
            y (int): The y-coordinate of the cell to check.

        Returns:  
            bool: True if the cell is occupied, False otherwise.
        """
        return self.game_board.map.cells_walls[y, x] > 0 or \
            self.player_cells[y, x] > 0 or \
            self.enemy_cells[y, x] > 0


    def get_my_trap_life(self, x: int, y: int) -> int:
        """
        Returns the remaining life of the player's trap at the specified coordinates.

        Parameters:  
            x (int): The x-coordinate of the trap.  
            y (int): The y-coordinate of the trap.

        Returns:  
            int: The remaining life of the player's trap at the given coordinates.
        """
        return self.player_trap_cells[y, x]

    def get_enemy_trap_life(self, x: int, y: int) -> int:
        """
        Returns the remaining life of the enemy's trap at the specified coordinates.

        Parameters:  
            x (int): The x-coordinate of the trap.  
            y (int): The y-coordinate of the trap.  

        Returns:  
            int: The remaining life of the enemy's trap at the given coordinates.
        """
        return self.enemy_trap_cells[y, x]

    def has_my_trap(self, x: int, y: int) -> bool:
        """
        Checks if the player has a trap at the specified coordinates.

        Parameters:  
            x (int): The x-coordinate to check for a player's trap.  
            y (int): The y-coordinate to check for a player's trap.

        Returns:  
            bool: True if the player has a trap at the given coordinates, False otherwise.
        """
        return self.player_trap_cells[y, x] > 0

    def has_enemy_trap(self, x: int, y: int) -> bool:
        """
        Checks if the enemy has a trap at the specified coordinates.

        Parameters:  
            x (int): The x-coordinate to check for the enemy's trap.  
            y (int): The y-coordinate to check for the enemy's trap.  

        Returns:  
            bool: True if the enemy has a trap at the given coordinates, False otherwise.
        """
        return self.enemy_trap_cells[y, x] > 0

    
    def has_apple(self, x: int, y: int) -> bool:
        """
        Returns whether the specified cell contains an apple.

        Parameters:  
            x (int): The x-coordinate of the cell to check.  
            y (int): The y-coordinate of the cell to check.  

        Returns:  
            bool: True if the cell contains an apple, False otherwise.
        """
        return self.game_board.has_apple(x, y)

    
    def get_snake_mask(self, my_snake: bool = True, enemy_snake: bool = False) -> np.ndarray:
        """
        Returns a map-sized array with cells occupied by the player's snake
        and/or the enemy's snake as specified in arguments. Players' snakes' heads and
        bodies are denoted by their relevant enums.Cell enum values.

        Parameters:  
            my_snake (bool, optional): If True, includes the player's snake. Defaults to True.  
            enemy_snake (bool, optional): If True, includes the enemy's snake. Defaults to False.

        Returns:  
            numpy.ndarray: A 2D numpy array with the snake's body and head marked according to the enums.
        """
        mask = np.zeros((self.game_board.map.dim_y, self.game_board.map.dim_x), dtype=np.uint8)

        if(my_snake):
            mask = np.where(self.player_cells > 0, int(Cell.PLAYER_BODY), mask)
            p_head = self.player_snake.get_head_loc()
            mask[p_head[1], p_head[0]] = int(Cell.PLAYER_HEAD)
        if(enemy_snake):
            mask = np.where(self.enemy_cells > 0, int(Cell.ENEMY_BODY), mask)
            e_head = self.enemy_snake.get_head_loc()
            mask[e_head[1], e_head[0]] = int(Cell.ENEMY_HEAD)
            
        return mask

    def get_trap_mask(self, my_traps: bool = True, enemy_traps: bool = False) -> np.ndarray:
        """
        Returns a mask representing the lifetime of traps for the player and the enemy.
        Positive values represent the player's trap lifetime, and negative values represent
        the enemy's trap lifetime.

        Parameters:  
            my_traps (bool, optional): If True, includes the player's traps. Defaults to True.  
            enemy_traps (bool, optional): If True, includes the enemy's traps. Defaults to False.

        Returns:  
            numpy.ndarray: A 2D numpy array where positive values correspond to the player's trap lifetime
                        and negative values correspond to the enemy's trap lifetime.
        """
        return np.array(self.player_trap_cells) - np.array(self.enemy_trap_cells)

    def get_trap_mask_enemy(self, my_traps: bool = False, enemy_traps: bool = True) -> np.ndarray:
        """
        Returns a mask representing the lifetime of enemy traps and the player's traps.
        Positive values represent the enemy's trap lifetime, and negative values represent
        the player's trap lifetime.

        Parameters:  
            my_traps (bool, optional): If True, includes the player's traps. Defaults to False.  
            enemy_traps (bool, optional): If True, includes the enemy's traps. Defaults to True.

        Returns:  
            numpy.ndarray: A 2D numpy array where positive values correspond to the enemy's trap lifetime
                        and negative values correspond to the player's trap lifetime.
        """
        return np.array(self.enemy_trap_cells) - np.array(self.player_trap_cells)


    def get_wall_mask(self) -> np.ndarray:
        """
        Returns a map-sized array with only walls, represented by their enum (1).

        Returns:
            numpy.ndarray: A 2D numpy array where cells containing walls are represented by the enum value (1).
        """
        return np.array(self.game_board.map.cells_walls)


    # def get_winner(self) -> Result:
    #     """
    #     Returns result enum, either (Result.PLAYER_A, Result.)
    #     """
    #     return self.game_board.winner

    def get_portal_mask(self, descriptive:bool = False) -> np.ndarray:
        """
        Returns a map-sized array with portals. If descriptive is marked as True, returns 
        non-portal locations as (-1, -1) and portal locations in the form of a 2-dim coordinate
        in the form (destination_x, destination_y) at mask[y, x]. Otherwise, returns 0/1
        mask of if coordinates are portals or not.

        Parameters:  
        descriptive (bool, optional): If True, the function will return a detailed mask with portal coordinates
                             (destination_x, destination_y) for portal locations and -1 for non-portal locations.
                             If False, it returns a binary mask where 1 indicates portal locations and 0 indicates non-portal locations.
                             Default is False.

        Returns:  
            numpy.ndarray: A numpy array of the same size as the map, where each entry corresponds to the portal at 
            that location on the map.

        """
        if(descriptive):
            return np.array(self.game_board.map.cells_portals)
        else:
            return np.where(self.game_board.map.cells_portals >= 0, 1, 0)

    def get_portal_dest(self, x: int, y: int) -> np.ndarray:
        """
        Returns the destination portal of the source portal given by coordinates (x, y) on the game board.

        Parameters:  
            x (int): The x-coordinate of the portal.  
            y (int): The y-coordinate of the portal.

        Returns:  
            np.ndarray: The portal destination at the specified portal (x, y) on the game board. Returns (-1, -1) for an
                        invalid cell.
                        The value represents the destination of the portal in the form of (x, y) coordinates.
        """
        return np.array(self.game_board.map.cells_portals[y, x])



    def is_portal(self, x: int, y: int) -> bool:
        """
        Checks whether the given coordinates (x, y) represent a portal on the game board.

        Parameters:  
            x (int): The x-coordinate on the game board.  
            y (int): The y-coordinate on the game board.

        Returns:  
            bool: True if the coordinates (x, y) represent a portal, False otherwise.
        """
        return self.game_board.map.cells_portals[y, x, 0] >= 0



    def get_portal_dict(self) -> dict:
        """
        Returns a dictionary mapping pairs of portals together (each) pair of portals appears
        twice in this dict, each one once as the key tuple and once as the value tuple.

        Returns:  
            dict: A dictionary where the keys and values are tuples representing the coordinates of the portals
                and their respective destination coordinates. 
        """
        return dict(self.game_board.map.portal_dict)
   

    def get_apple_mask(self) -> np.ndarray:
        """
        Returns a map-sized array with only apples, represented by their enum (2).

        Returns:  
            numpy.ndarray: A 2D numpy array where cells containing apples are represented by the enum value (2).
        """
        return np.array(self.game_board.cells_apples) * int(Cell.APPLE)

    
    def get_turn_count(self) -> int:
        """
        Returns the current turn count of the game.

        Returns:  
            int: The current number of turns that have passed in the game.
        """
        return self.game_board.turn_count

    def get_traps_until_limit(self, enemy:bool = False) -> int:
        """
        Returns the number of traps the player can still deploy on this turn until they reach
        the limiting number of traps.

        Parameters:  
            enemy (bool): If True, the function returns the number of traps remaining for the enemy.
                        If False, it returns the number of traps remaining for the player. Default is False.

        Returns:  
            int: The number of remaining traps the player (or enemy, if `enemy` is True) can still play 
                until they reach the trap limit for the turn.
        """
        if(enemy):
            return self.enemy_snake.get_max_traps() - self.enemy_snake.traps_placed
        return self.player_snake.get_max_traps() - self.player_snake.traps_placed

    def get_traps_placed(self, enemy: bool = False) -> int:
        """
        Returns the number of traps that have been placed on this turn by the player (or enemy, if `enemy` is True.

        Parameters:  
            enemy (bool): If True, the function returns the number of traps placed by the enemy. 
                        If False, it returns the number of traps placed by the player. Default is False.

        Returns:  
            int: The number of traps placed by the player or the enemy this turn.
        """
        if enemy:
            return self.enemy_snake.traps_placed
        return self.player_snake.traps_placed


    def get_traps_limit(self, enemy: bool = False) -> int:
        """
        Returns the maximum number of traps that the player (or enemy, if `enemy` is True) can place on a turn.

        Parameters:  
            enemy (bool): If True, the function returns the maximum number of traps the enemy can place.
                        If False, it returns the maximum number of traps the player can place. Default is False.

        Returns:  
            int: The maximum number of traps the player or the enemy can place this turn.
        """
        if enemy:
            return self.enemy_snake.get_max_traps()
        return self.player_snake.get_max_traps()


    def get_max_length(self, enemy: bool = False) -> int:
        """
        Returns the maximum length the player (or enemy, if `enemy` is True) has achieved this game.

        Parameters:  
            enemy (bool): If True, the function returns the maximum length for the enemy. 
                        If False, it returns the maximum length for the player. Default is False.

        Returns:  
            int: The maximum length the player or the enemy has achieved has achieved this game.
        """
        if enemy:
            return self.enemy_snake.max_length
        return self.player_snake.max_length


    def cell_occupied_by(self, x: int, y: int) -> Cell:
        """
        Returns the relevant enum for what a cell is currently occupied by (excluding apples).

        Parameters:  
            x (int): The x-coordinate of the cell.  
            y (int): The y-coordinate of the cell.

        Returns:  
            enums.Cell: The enum representing what occupies the cell (e.g., WALL, PLAYER_HEAD, PLAYER_BODY, SPACE).
        """
        if(self.game_board.map.cells_walls[y][x]):
            return Cell.WALL
        if(self.player_cells[y][x]>0):
            head_p = self.player_snake.get_head_loc()
            if(head_p[0] == x and head_p[1] == y):
                return Cell.PLAYER_HEAD
            else:
                return Cell.PLAYER_BODY

                
        if(self.enemy_cells[y][x]>0):
            head_e = self.enemy_snake.get_head_loc()
            if(head_e[0] == x and head_e[1] == y):
                return Cell.ENEMY_HEAD
            else:
                return Cell.ENEMY_BODY

        return Cell.SPACE 


    def currently_decaying(self) -> bool:
        """
        Returns whether snakes will decay at the beginning
        of this turn.

        Returns:  
            bool: If snakes will decay at the beginning of this turn.
        """
        return self.game_board.decaying or self.game_board.decay_count == 0

    def get_current_decay_interval(self) -> int:
        """
        Returns the current decay interval from the game board. Returns -1 if decays have not begun yet.

        Returns:  
            int: The current decay interval value.
        """
        return self.game_board.decay_interval

    def get_future_decay_intervals(self) -> list:
        """
        Returns a list of future decay intervals from the decay timeline.

        Returns:  
            list: A list of tuples representing future decay intervals in (start turn, interval) format.
        """
        return self.game_board.map.decay_timeline[self.game_board.decay_index+1:]

    
    def get_next_decay_interval(self) -> tuple:
        """
        Returns a the next decay interval after the current one. Returns the current
        one if current is already the last decay interval.

        Returns:  
            tuple: Tuple representing next decay interval in (start turn, interval) format.
        """
        return self.game_board.map.decay_timeline[self.game_board.decay_index] \
            if self.game_board.decay_index == len(self.game_board.map.decay_timeline) - 1 \
            else self.game_board.map.decay_timeline[self.game_board.decay_index + 1]            

    def get_next_decay_event(self) -> int:
        """
        Returns the turns until thse next decay event.

        Returns:  
            int: Returns the number of turns until the next turn that snakes will start decaying at.
        """
        if(self.game_board.decay_index==-1):
            return self.game_board.map.decay_timeline[0][0]
        return self.game_board.map.decay_interval - self.game_board.map.decay_count

