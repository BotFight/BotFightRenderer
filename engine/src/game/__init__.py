import glob
import os


from . import game_queue, board, enums, game_map, player_board, snake

folder_path = os.path.dirname(__file__)  # or specify the path directly
py_files = glob.glob(os.path.join(folder_path, "*.py"))

# Extract the file names without the .py extension
module_names = [os.path.basename(f)[:-3] for f in py_files if os.path.basename(f) != '__init__.py']

# Set __all__ to the list of module names
__all__ = module_names