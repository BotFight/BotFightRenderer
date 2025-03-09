"""
This document provides a introduction to the documentation for how to play the game. Documentation for classes
available to players can be found to the left, and source code can be viewed from documentation as well.

**About PlayerBoard**

Eacn turn and bid, you will be given a `PlayerBoard` (in `game.player_board`) instance, representing
a copy of the current game state. You will also be given a callable `time_left()` function that, when called, will provide you 
with the amount of time you have left for your turn in seconds. 

A couple types of functions to look out for:

- `get_` type functions (i.e. `get_dim_x`, `get_direction`, `get_portal_dict`): return information about the board or player
- `get_mask` type functions (i.e. `get_trap_mask`, `get_snake_mask`): returns a board-sized array with only the cells containing
    the relevant type of cell
- `is_` type functions (i.e. `is_possible_direction`, `is_portal`): checks if some condition is true
- `is_valid` type functions (i.e. `is_valid_action`, `is_valid_turn`): checks if a given action or turn is valid
- `try_` type functions (i.e. `try_action`, `try_trap`): returns the outputs of a specific action if it were to occur, without changing the board
- `apply_` type functions (i.e. `apply_action`, `apply_turn`): applies a bid, action, or turn to the board. Returns if the operation was successful.
- `forecast_` type functions (i.e. `forecast_bid`, `forecast_turn`): : applies a bid, action, or turn to a copy of the board, then returns the board copy along with if the operation was successful
:
Both apply_turn and forecast_turn end a turn and pass to the next player, whereas other apply and forecast functions do not.
`PlayerBoard.end_turn()` may be used to complete/pass a turn.

Finally, remember that coordinates are returned in (x, y) form, but any arrays representing
the board should be indexed in the form of [y, x]

**Getting Started**

If you're lost about where to get started, we recommend that you take a look at
the following PlayerBoard functions: `get_possible_directions`, `is_valid_turn`, `is_valid_action`, `apply_turn`, `apply_action`, `forecast_turn`, and `forecast_action`,
as well as looking at the possible Actions in `game.enums`

**Extending the Board**

The `PlayerBoard` class provides basic, low-level ways to interact with the board.
You can write your own methods that use `PlayerBoard` as a parameter for more complex functionality,
and you can even wrap the `PlayerBoard` class in a class that you design.

You can use also methods from the underlying classes that `PlayerBoard` wraps,
such as `Board`, `Snake`, and `Queue`. You can do this by accessing the `PlayerBoard.game_board`
variable, and using its functions/variables.

If you want to extend these classes we recommend that you at least read the documentation and if you're curious read the 
source code either from the scaffold we give you or from the documentation.
"""




import glob
import os

from . import game_queue, board, enums, game_map, player_board, snake

folder_path = os.path.dirname(__file__)  # or specify the path directly
py_files = glob.glob(os.path.join(folder_path, "*.py"))

# Extract the file names without the .py extension
module_names = [os.path.basename(f)[:-3] for f in py_files if os.path.basename(f) != '__init__.py']

# Set __all__ to the list of module names
__all__ = module_names






