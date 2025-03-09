from game.game_queue import Queue 
from game.enums import Action
import numpy as np

class Snake:
    """
    This class represents a snake. It is built as a wrapper
    around the numpy-vectorized queue `game.game_queue`.
    """
    def __init__(self, min_player_size:int = 2, copy:bool = False):
        """
        Initializes the Snake object with the minimum player size and copy flag.

        Parameters:
            min_player_size (int, optional): The minimum size of the snake. Defaults to 2.
            copy (bool, optional): Whether to initialize the snake as a copy. Defaults to False.
        """
        self.min_player_size = min_player_size
        if(not copy):
            self.q = Queue()

            self.direction = None
            self.length_queued = 0
            self.apples_eaten = 0
            
            self.lengthen = 2
            self.sacrifice = 1
            self.max_length = 0

            self.traps_placed = 0


    def get_max_traps(self) -> int:
        """
        Returns the maximum number of traps that can be placed based on the maximum length of the snake.

        Returns:
            int: The maximum number of traps that can be placed. This value is determined by dividing 
                the maximum length achieved by 2.
        """
        return self.max_length // 2

        
    def start(self, start_loc: np.ndarray, start_size: int):
        """
        Initializes the snake to the starting position and size.

        Parameters:
            start_loc (numpy.ndarray): A NumPy array representing the starting location of the snake.
            start_size (int): The initial size of the snake.

        """
        self.q.push(start_loc)
        self.length_queued = start_size - 1
        self.max_length = start_size
    
    def get_lengthen_coef(self) -> int:
        """
        Returns the coefficient by which the snake lengthens when it eats an apple.

        Returns:
            int: The amount by which the snake lengthens when it eats an apple.
        """
        return self.lengthen

    def increment_sacrifice(self):
        """
        Increments the sacrifice necessary for a move by 2.
        """
        self.sacrifice+=2
    
    def reset(self):
        """
        Resets the sacrifice for a move to 1.
        """
        self.sacrifice = 1
        self.traps_placed = 0

    def get_head_loc(self) -> np.ndarray:
        """
        Retrieves the location of the head of the snake as a (x, y) coordinate.

        Returns:
            numpy.ndarray: A numpy array representing the location of the head of the snake.
        """
        return self.q.peek_tail()

    def get_tail_loc(self) -> np.ndarray:
        """
        Retrieves the location of the tail of the snake as a (x, y) coordinate.

        Returns:
            numpy.ndarray: A numpy array representing the location of the tail of the snake.
        """
        return self.q.peek_head()

    def get_all_loc(self) -> np.ndarray:
        """
        Retrieves the locations of all parts of the snake as an array of (x, y) coordinates.

        Returns:
            numpy.ndarray: A numpy array containing the locations of all parts of the snake.
        """

        return self.q.peek_all()

    def get_direction(self) -> Action:
        """
        Retrieves the current direction of the snake.

        Returns:
            Action: An Action enum value representing the current direction of the snake (e.g., Action.NORTH, Action.SOUTH).
        """
        return self.direction


    def get_unqueued_length(self) -> int:
        """
        Retrieves the current physical length of the snake (discounts queued length)

        Returns:
            int: The physical length of the snake
        """

        return self.q.size

    def get_length(self) -> int:
        """
        Retrieves the current total length of the snake, including any pending length from apples eaten.

        Returns:
            int: The total length of the snake, including any length gained from eating apples.
        """

        return self.q.size + self.length_queued

    def get_next_loc(self, action: Action, head_loc=None) -> np.ndarray:
        """
        Simulates the location of the snake's head if the given action is taken.

        Parameters:
            action (enums.Action): The action to simulate (e.g., Action.NORTH, Action.SOUTH).
            head_loc (numpy.ndarray, optional): The current location of the snake's head to simulate the movement from. If not provided, the current head location is used.

        Returns:
            - numpy.ndarray: The simulated location of the snake's head after taking the action.
                
        """
        if(head_loc is None):
            loc = self.get_head_loc()
        else:
            loc = np.array(head_loc)
    
        match action:
            case Action.NORTH:
                loc[1]-=1
            case Action.NORTHEAST:
                loc[1]-=1
                loc[0]+=1
            case Action.EAST:
                loc[0]+=1
            case Action.SOUTHEAST:
                loc[1]+=1
                loc[0]+=1
            case Action.SOUTH:
                loc[1]+=1
            case Action.SOUTHWEST:
                loc[1]+=1
                loc[0]-=1
            case Action.WEST:
                loc[0]-=1
            case Action.NORTHWEST:
                loc[1]-=1
                loc[0]-=1

            case _:
                return None
        return loc


    def is_valid_bid(self, bid: int) -> bool:
        """
        Checks if a bid is valid for the snake based on its current length.

        Parameters:
            bid (int): The bid to be validated.

        Returns:
            bool: True if the bid is valid (i.e., the snake's length minus the bid is greater than or equal to the minimum player size), otherwise False.
        """

        return bid >=0 and self.get_length() - bid >= self.min_player_size


    def is_valid_trap(self, length: int = None, unqueued: int = None, traps_placed:int = None, max_traps:int = None) -> bool:
        """
        Checks if the snake can trap based on length and unqueued length.

        Parameters:
            length (int, optional): The current length of the snake. If not provided, the current length is used.
            unqueued (int, optional): The unqueued length of the snake. If not provided, the current unqueued length is used.

        Returns:
            bool: True if the snake can trap (i.e., unqueued length is greater than 1 and total length is greater than the minimum player size), otherwise False.
        """

        if(length is None):
            length = self.get_length()
        if(unqueued is None):
            unqueued = self.get_unqueued_length()
        if(traps_placed is None):
            traps_placed = self.traps_placed
        if(max_traps is None):
            max_traps = self.get_max_traps()
        return traps_placed < max_traps and unqueued > 2 and length > self.min_player_size

    def is_valid_direction(self, action: Action, direction: Action = None) -> bool:
        """
        Checks if a given action is a valid direction based on the current direction of the snake.

        Parameters:
            action (enums.Action): The action to be validated (e.g., Action.NORTH, Action.SOUTH).
            direction (enums.Action, optional): The current direction of the snake. If not provided, the current direction is used.

        Returns:
            bool: True if the action is a valid direction to move (i.e., not opposite or invalid relative to the current direction), otherwise False.
        """

        if(direction is None):
            direction = self.direction

        return direction is None or ((int(action) + 3) %8 != direction and (int(action) + 4) %8 != direction and (int(action)+5) %8 != direction)
    

    def is_valid_sacrifice(self, sacrifice: int = None, length: int = None) -> bool:
        """
        Checks if the snake can perform a sacrifice based on its length and the specified sacrifice value.

        Parameters:
            sacrifice (int, optional): The value representing the sacrifice. If not provided, it defaults to None.
            length (int, optional): The current length of the snake. If not provided, the current length is used.

        Returns:
            bool: If the sacrifice is valid.
        """

        if(sacrifice is None):
            sacrifice = self.sacrifice

        if(length is None):
            length = self.get_length()

        return not sacrifice > self.get_length() - self.min_player_size

    def can_move(self, action: Action, sacrifice: int = None, direction: Action = None, length: int = None) -> bool:
        """
        Checks if the snake can make a move based on the specified action, sacrifice, and direction.

        Parameters:
            action (enums.Action): The action representing the move to be made (e.g., Action.NORTH, Action.SOUTH).
            sacrifice (int, optional): The sacrifice value to check. If not provided, the current sacrifice value is used.
            direction (enums.Action, optional): The current direction of the snake. If not provided, the current direction is used.
            length (int, optional): The current length of the snake. If not provided, the current length is used.

        Returns:
            bool: True if the move is valid (i.e., the sacrifice is within acceptable limits, and the direction is not invalid), otherwise False.
        """

        if(sacrifice is None):
            sacrifice = self.sacrifice
        
        if(direction is None):
            direction = self.direction
        if(length is None):
            length = self.get_length()


        if(sacrifice-1 > length - self.min_player_size):
            return False        
        if(0 <= int(action) < 8 ):
            return direction is None or ((int(action) + 3) %8 != direction and (int(action) + 4) %8 != direction and (int(action)+5) %8 != direction)
        else:
            return False
       
        return True


    def get_valid_directions(self, direction: Action = None) -> list:
        """
        Retrieves the possible directions the snake can move in, without considering the board state.

        Parameters:
            direction (Action, optional): The current direction of the snake. If not provided, the current direction is used.

        Returns:
            list: A list of valid directions (as Action enum values) that the snake can move in.
        """

        if(direction is None):
            direction = self.direction
        if(direction is None):
            return [enum.value for enum in Action][:8]

        x = int (self.direction)
        return [Action((x-2+8)%8), Action((x-1+8)%8),self.direction,  Action((x+1)%8),Action((x+2)%8)]


    def eat_apple(self):
        """
        Simulate eating an apple, queuing length and modifying max length achieved as necessary.
        """
        self.length_queued += self.lengthen
        self.apples_eaten += 1

        length = self.get_length()
        if(length > self.max_length):
            self.max_length = length

    def get_apples_eaten(self) -> int:
        """
        Retrieves the total number of apples the snake has eaten.

        Returns:
            int: The total number of apples eaten by the snake.
        """

        return self.apples_eaten

    def apply_bid(self, bid: int):
        """
        Decreases the snake's length by the specified bid amount for the first turn.

        Parameters:
            bid (int): The amount by which the snake's length will be decreased.
        """
        self.length_queued -= bid
        
    def get_last_cells(self, num_cells: int = 1) -> np.ndarray:
        """
        Retrieves the last `num_cells` cells from the tail side of the snake.

        Parameters:
            num_cells (int, optional): The number of tail-side cells to retrieve. Defaults to 1.

        Returns:
            numpy.ndarray: a numpy array representing the  last cells of the snake as num_cells (x, y)
        """
        return self.q.peek_many_head(num_cells)

    def get_first_cells(self, num_cells: int = 1) -> np.ndarray:
        """
        Retrieves the first `num_cells` cells from the head side of the snake.

        Parameters:
            num_cells (int, optional): The number of head-side cells to retrieve. Defaults to 1.

        Returns:
            numpy.ndarray: a numpy array representing the first cells of a the snake as num_cells (x, y)
        """
        return self.q.peek_many_tail(num_cells)
        

    def try_sacrifice(self, sacrifice: int = None) ->  np.ndarray:
        """
        Returns the cells that would be removed from the tail of the snake if a sacrifice is applied.

        Parameters:
            sacrifice (int, optional): The amount of sacrifice. If not provided, the current sacrifice value is used.

        Returns:
            numpy.ndarray: An array of cells that would be removed from the tail of the snake if the sacrifice is applied.
        """

        if(sacrifice is None):
            sacrifice = self.sacrifice

        length_remaining = self.length_queued - sacrifice
        cells_lost = None
        if(length_remaining < 0):
            cells_lost = self.q.peek_many_head(-length_remaining)

        return cells_lost

    def apply_sacrifice(self, sacrifice: int = None) -> list :
        """
        Applies the sacrifice to the snake and returns the cells to be removed from the tail.

        Parameters:
            sacrifice (int, optional): The amount of sacrifice to apply. If not provided, the current sacrifice value is used.

        Returns:
            list: A list of cells that are removed from the tail of the snake after the sacrifice is applied.
        """

        if(sacrifice is None):
            sacrifice = self.sacrifice

        self.length_queued -= sacrifice
        cells_lost = None

        if(self.length_queued < 0):
            cells_lost = self.q.pop_many(-self.length_queued)
            self.length_queued = 0

        return cells_lost

    def apply_head_move(self, action: Action) -> np.ndarray:
        """
        Moves the head to the next location according to the action taken and updates the direction.

        Parameters:
            action (enums.Action): The action representing the direction in which the snake's head should move.

        Returns:
            numpy.ndarray: The new location of the snake's head after the move.
        """
        head_loc = self.get_head_loc()

        match Action(action):
            case Action.NORTH:
                head_loc[1]-=1
            case Action.NORTHEAST:
                head_loc[1]-=1
                head_loc[0]+=1
            case Action.EAST:
                head_loc[0]+=1
            case Action.SOUTHEAST:
                head_loc[1]+=1
                head_loc[0]+=1
            case Action.SOUTH:
                head_loc[1]+=1
            case Action.SOUTHWEST:
                head_loc[1]+=1
                head_loc[0]-=1
            case Action.WEST:
                head_loc[0]-=1
            case Action.NORTHWEST:
                head_loc[1]-=1
                head_loc[0]-=1
            case _:
                return None
        
        self.direction = action
        self.q.push(head_loc)


        return head_loc

    def try_trap(self) -> np.ndarray:
        """
        Returns the cell at the tail of the snake, which would represent the trap.

        Returns:
            numpy.ndarray: The cell at the tail of the snake.
        """
        return self.q.peek_head()
    
    def try_move(self, action: Action, sacrifice: int = None) -> tuple:
        """
        Simulates the move and returns the tail cells that would be lost, 
        as well as the new head location.

        Parameters:
            action (enums.Action): The action representing the direction the snake will move.
            sacrifice (int, optional): The amount of sacrifice. Defaults to the current sacrifice value if not provided.

        Returns:
            tuple: A tuple containing:
                - numpy.ndarray: The new location of the snake's head.
                - list: The cells that would be lost from the tail if the move is applied.
        """

        if(sacrifice is None):
            sacrifice = self.sacrifice   

        cells_lost = self.try_sacrifice(sacrifice)
        head_loc = self.get_next_loc(action)

        return head_loc, cells_lost


    def push_trap(self) -> np.ndarray:
        """
        Removes and returns the cell at the tail of the snake, representing the trap created.

        Returns:
            numpy.ndarray: The cell at the tail of the snake.
        """
        self.traps_placed += 1
        return self.q.pop()

    def push_head_cell(self, loc:np.ndarray):
        """
        Enqueues the snake's new head location into the interanal queue.

        Parameters:
            loc (numpy.ndarray): The head location to enqueue.

        """
        
        self.q.push(loc)


        
    def push_move(self, action: Action, sacrifice: int = None) -> tuple:
        """
        Applies the move and returns the tail cells that would be lost, 
        as well as the new head location. Does not enqueue the new location (could potentially require portal transformation).

        Parameters:
            action (enums.Action): The action representing the direction the snake will move.
            sacrifice (int, optional): The amount of sacrifice. Defaults to the current sacrifice value if not provided.

        Returns:
            tuple: A tuple containing:
                - numpy.ndarray: The new location of the snake's head.
                - list: The cells that would be lost from the tail if the move is applied.
        """

        if(sacrifice is None):
            sacrifice = self.sacrifice   
        
        cells_lost = self.apply_sacrifice(sacrifice)

        self.increment_sacrifice()
        self.direction = action
        head_loc = self.get_next_loc(action)
        
        return head_loc, cells_lost

    
    def get_copy(self) -> "Snake":
        """
        Return a deep copy of the snake.

        Returns:
            Snake: A deep copy of the current snake object.
        """

        new_snake = Snake(self.min_player_size, True)

        new_snake.direction = None if self.direction is None else Action(self.direction)
        new_snake.length_queued = self.length_queued
        new_snake.apples_eaten = self.apples_eaten
        new_snake.lengthen = self.lengthen
        new_snake.sacrifice = self.sacrifice
        new_snake.max_length = self.max_length
        new_snake.traps_placed = self.traps_placed

        new_snake.q = self.q.get_copy()
        return new_snake