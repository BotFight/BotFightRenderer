

def main():
    import os    
    import argparse
    import sys

    from multiprocessing import freeze_support
    freeze_support()

    from gameplay import play_game
    from game.enums import Result
    import traceback

    import time
    import json
    try:    
    

        parser = argparse.ArgumentParser(description='Run a game between two players')
        
    
        parser.add_argument('--a_dir', '-a', type=str, help='Directory of player A submission', required=True)
        parser.add_argument('--b_dir', '-b', type=str, help='Directory of player B submission', required=True)
        parser.add_argument('--map_string', '-m', type=str, help='Name of map to play', required=True)
        parser.add_argument('--output_dir', '-o', type=str, help='Output Directory', required=True)

        args = parser.parse_args(sys.argv[1:])
        
        a_name = os.path.basename(args.a_dir)
        b_name = os.path.basename(args.b_dir)

        a_sub = os.path.dirname(args.a_dir)
        b_sub = os.path.dirname(args.b_dir)

        if not "controller.py" in os.listdir(args.a_dir):
            print("Error: Bot 1 directory incorrect.")
            return

        if not "controller.py" in os.listdir(args.b_dir):
            print("Error: Bot 2 directory incorrect.")
            return

        map_string = args.map_string
        
        if(map_string is None):
            print("map not found")
            return

        sim_time = time.perf_counter()
        final_board = play_game(map_string, a_sub, b_sub, a_name, b_name, display_game=False, record=True, limit_resources=False)


        if (final_board.get_winner()== Result.PLAYER_A):
            print("a won by "+final_board.get_win_reason())
        elif(final_board.get_winner() == Result.PLAYER_B):
            print("b won by "+final_board.get_win_reason())
        elif(final_board.get_winner() == Result.TIE):
            print("tie by "+final_board.get_win_reason())

        

        sim_time = time.perf_counter() - sim_time
        turn_count = final_board.turn_count
        print(f"{sim_time} seconds elapsed to simulate {turn_count} rounds.")

        try:
            print(args.output_dir)
            with open(args.output_dir, 'w') as fp:
                fp.write(final_board.get_history_json())
        except:
            print("Failed to write game to output directory.")
    except:
        print(traceback.format_exc())
        print("Game crashed due to unknown reason.")


if __name__=="__main__":
    main()
