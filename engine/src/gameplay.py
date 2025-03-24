
from game import board, game_map, player_board
from game.board import Board
from game.game_map import Map
from game.enums import Result, Action
from game.player_board import PlayerBoard
from collections.abc import Iterable




def init_display(board, player_a_name, player_b_name, a_bid, b_bid):
    print(player_a_name+ " vs. "+player_b_name)

    line1 = "a bid:"+str(a_bid) +"  b bid:"+str(b_bid)
    line1 += "\nA to play" if board.is_as_turn() else "\nB to play"

    print(line1)


#prints board to terminal, clearing on each round
def print_board(board, a_time, b_time, clear_screen):
    player_map, apple_map, trap_map, a_length, b_length = board.get_board_string()

    import os

    if(clear_screen):
        os.system("cls||clear")

    board_list  = []

    board_list.append("TURN "+str(board.turn_count)+"\n")
    if(board.is_as_turn()):
        board_list.append("A to play, Time left:"+str(a_time)+"\n")
    else:
        board_list.append("B to play, Time left:"+str(b_time)+"\n")
    
    board_list.append("MAP:\n")
    board_list.append(player_map+"\n")
    board_list.append("Player A:"+str(a_length) + " Player B:"+ str(b_length)+"\n\n")
    board_list.append("TRAPS:\n")
    board_list.append(trap_map+"\n")

    if(board.is_as_turn()):
        board_list.append("Player A plays:")
    else:
        board_list.append("Player B plays:")

    print("".join(board_list), end="")

# prints a player's move on a given turn
def print_moves(moves, timer):
    try:
        if(moves is None):
            print("None", end='')
        elif(isinstance(moves, Iterable)):
            move_list = [Action(move).name for move in moves]
            print(", ".join(move_list), end='')
        else:
            print(Action(moves), end='')
    except:
        print("Invalid", end='')


    print(f" in {timer} seconds")

def validate_submission(map_string, directory_a, player_a_name, limit_resources=False):
    from multiprocessing import Process, Queue, set_start_method
    
    

    import traceback
    import importlib.util
    import sys
    player_a_process = None
    try:
        if(not directory_a  in sys.path):
            sys.path.append(directory_a)

        module_a = importlib.import_module(player_a_name)

        #setup main thread queue for getting results
        main_q = Queue()

        #setup two thread queues for passing commands to players
        player_a_q = Queue()
        map_to_play = Map(map_string)

        queues = [player_a_q, main_q]

        out_queue = Queue()

        game_board = Board(map_to_play, build_history=False) 
        
        player_a_process = Process(target = run_player_process, args = (player_a_name, directory_a, player_a_q, main_q, limit_resources, out_queue))
        player_a_process.start()

        success_a = main_q.get(block = True, timeout = 10) 
        if(success_a is False):
            return False


        init_timeout = 5
        bid_timeout = 15
        


        success_a, message = run_timed_constructor(player_a_process, init_timeout, 5, player_a_q, main_q)
        if(success_a is False):
            return False
        a_bid, a_bid_time, message = run_timed_bid(player_a_process, True, game_board, bid_timeout, 5, player_a_q, main_q)
        terminate_validation(player_a_process, queues, out_queue)

        if a_bid is None or not game_board.is_valid_bid(int(a_bid)):
            return False      
        else:
            return True
    except:
        print(traceback.format_exc())

        if(player_a_process):
            terminate_validation(player_a_process, queues, out_queue)
        return False
    
def delete_module(name):
    import sys
    if name in sys.modules:
        del sys.modules[name]


def terminate_validation(process_a, queues, out_queue):

    delete_module("player_a"+"."+"controller")
    delete_module("player_a")

    

    terminate_process_and_children(process_a)

    for q in queues:
        try:
            while True:
                q.get_nowait()
        except:
            pass

    try:
        while True:
            out_queue.get_nowait()
    except:
        pass
    

# Listener function to continuously listen to the queue
def listen_for_output(output_queue, stop_event):
    while not stop_event.is_set():
        try:
            print(output_queue.get(timeout=1))  # Wait for 1 second for output
        except:
            continue  # No output yet, continue listening

def play_game(map_string, directory_a, directory_b, player_a_name, player_b_name, display_game = False, clear_screen=True, record = True, limit_resources=False):
    #setup main environment, import player modules
    from multiprocessing import Process, Queue, set_start_method
    import traceback

    import threading
    import sys
    import os

    if(not directory_a  in sys.path):
        sys.path.append(directory_a)

    if(not directory_b  in sys.path):
        sys.path.append(directory_b)

    init_timeout = 5
    extra_ret_time = 5
    bid_timeout = 15
    play_time = 220
    if(not limit_resources):
        init_timeout = 10
        bid_timeout = 15
        play_time = 220


    #setup main thread queue for getting results
    main_q = Queue()

    #setup two thread queues for passing commands to players
    player_a_q = Queue()
    player_b_q = Queue()

    #game init
    map_to_play = Map(map_string)
    game_board = Board(map_to_play, play_time, build_history=record) 

    

    out_queue = Queue()
    stop_event = None
    if(not limit_resources):
        stop_event = threading.Event()
        listener_thread = threading.Thread(target=listen_for_output, args=(out_queue, stop_event))
        listener_thread.daemon = True
        listener_thread.start()

    queues = [player_a_q, player_b_q, main_q]

    #startup two player processes    
    player_a_process = Process(target = run_player_process, args = (player_a_name, directory_a, player_a_q, main_q, limit_resources, out_queue))
    player_b_process = Process(target = run_player_process, args = (player_b_name, directory_b, player_b_q, main_q, limit_resources, out_queue))
    success_a = False
    success_b = False

    message_a = ""
    message_b = ""
    
    try:
        player_a_process.start()
        success_a = main_q.get(block = True, timeout = 10) 
    except Exception as e:
        message_a = traceback.format_exc()
        print("Player a crashed during initialization")
    
    try:
        player_b_process.start() 
        success_b = main_q.get(block = True, timeout = 10) 
        pause_process_and_children(player_b_process, limit_resources)
    except Exception as e:
        message_b = traceback.format_exc()
        print("Player b crashed during initialization")  


    if(success_a and success_b):
        success_a, message_a = run_timed_constructor(player_a_process, init_timeout, extra_ret_time, player_a_q, main_q)
        pause_process_and_children(player_a_process, limit_resources)

        restart_process_and_children(player_b_process, limit_resources)
        success_b, message_b = run_timed_constructor(player_b_process, init_timeout, extra_ret_time, player_b_q, main_q)
        pause_process_and_children(player_b_process, limit_resources)

    game_board.set_errlog(message_a, True)
    game_board.set_errlog(message_b, False)
    
    if(not success_a and not success_b):
        game_board.set_winner(Result.TIE, "failed init")
        terminate_game(player_a_process, player_b_process, queues, out_queue, stop_event)
        return game_board
    elif(not success_a):
        game_board.set_winner(Result.PLAYER_B, "failed init")
        terminate_game(player_a_process, player_b_process, queues, out_queue, stop_event)
        return game_board
    elif(not success_b):
        game_board.set_winner(Result.PLAYER_A, "failed init")
        terminate_game(player_a_process, player_b_process, queues, out_queue, stop_event)
        return game_board

    # start actual gameplay     
    # 
    
    timer = 0
    while(game_board.turn_count < 2000 and game_board.get_winner() is None):

        if(not game_board.get_bid_resolved()):
            #get bids

            # run bid functions
            restart_process_and_children(player_a_process, limit_resources)
            a_bid, a_bid_time, message_a = run_timed_bid(player_a_process, True, game_board, bid_timeout, extra_ret_time, player_a_q, main_q)
            pause_process_and_children(player_a_process, limit_resources)

            restart_process_and_children(player_b_process, limit_resources)
            b_bid, b_bid_time, message_b = run_timed_bid(player_b_process, False, game_board, bid_timeout, extra_ret_time, player_b_q, main_q)
            pause_process_and_children(player_b_process, limit_resources)
            
            if(display_game):
                print(f"bid: a {int(a_bid)}, b {int(b_bid)}")

            game_board.set_errlog(message_a, True)
            game_board.set_errlog(message_b, False)

            a_valid = game_board.is_valid_bid(a_bid)
            b_valid = game_board.is_valid_bid(b_bid)
            if(not a_valid and not b_valid):
                game_board.set_winner(Result.TIE, "failed bid")
                terminate_game(player_a_process, player_b_process, queues, out_queue, stop_event)
                return game_board
            elif(not a_valid):
                game_board.set_winner(Result.PLAYER_B, "failed bid")
                terminate_game(player_a_process, player_b_process, queues, out_queue, stop_event)
                return game_board
            elif(not b_valid):
                game_board.set_winner(Result.PLAYER_A, "failed bid")
                terminate_game(player_a_process, player_b_process, queues, out_queue, stop_event)
                return game_board
            
            #finish bid
            game_board.resolve_bid(a_bid, b_bid)

            if display_game:
                init_display(game_board, "PLAYER A", "PLAYER B", a_bid, b_bid)

        if(display_game):
            print_board(game_board, game_board.get_a_time(), game_board.get_b_time(), clear_screen)

        moves = None
        timer = 0

        

        if(game_board.is_as_turn()):
            # run a's turn
            restart_process_and_children(player_a_process, limit_resources)
            moves, timer, message_a = run_timed_play(player_a_process, True, game_board, game_board.get_a_time(), extra_ret_time, player_a_q, main_q)
            pause_process_and_children(player_a_process, limit_resources)

            if(not moves is None and (Action.FF is moves or (isinstance(moves, Iterable) and Action.FF in moves))):
                game_board.set_winner(Result.PLAYER_B, "forfeit")

            game_board.set_errlog(message_a, True)
         
            if(game_board.get_winner() is None):
                
                if moves is None:
                    if(timer == -1):
                        game_board.set_winner(Result.PLAYER_B, "player code crash")
                    elif(timer == -2):
                        game_board.set_winner(Result.PLAYER_B, "memory error")
                    else:
                        game_board.set_winner(Result.PLAYER_B, "timeout")
                else:
                    valid = game_board.apply_turn(moves, timer)

                    if game_board.get_b_time() <= 0:
                        game_board.set_winner(Result.PLAYER_B, "timeout")

                    elif not valid:
                        game_board.set_errlog(f"{moves}", True)
                        game_board.set_winner(Result.PLAYER_B, "invalid turn")

        else:
            # run b's turn
            restart_process_and_children(player_b_process, limit_resources)
            moves, timer, message_b = run_timed_play(player_b_process, False, game_board, game_board.get_b_time(), extra_ret_time, player_b_q, main_q)
            pause_process_and_children(player_b_process, limit_resources)

            if(not moves is None and (Action.FF is moves or (isinstance(moves, Iterable) and Action.FF in moves))):
                game_board.set_winner(Result.PLAYER_A, "forfeit")

            game_board.set_errlog(message_b, False)
            
            if(game_board.get_winner() is None):
                if moves is None:
                    if(timer == -1):
                        game_board.set_winner(Result.PLAYER_A, "player code crash")
                    elif(timer == -2):
                        game_board.set_winner(Result.PLAYER_A, "memory error")
                    else:
                        game_board.set_winner(Result.PLAYER_A, "timeout")
                else:
                    valid = game_board.apply_turn(moves, timer)

                    if game_board.get_b_time() <= 0:
                        game_board.set_winner(Result.PLAYER_A, "timeout")

                    elif not valid:
                        game_board.set_errlog(f"{moves}", False)
                        game_board.set_winner(Result.PLAYER_A, "invalid turn")

            
        if(display_game):
            print_moves(moves, timer)

        if(not game_board.get_winner() is None):
            terminate_game(player_a_process, player_b_process, queues, out_queue, stop_event)
            return game_board
                
    
    #last tiebreak based on time (beat other player by error seconds, buffer error of 5s given for potential latency)
    if(game_board.get_winner() is None):
        game_board.tiebreak()
        if(game_board.get_winner() is None):
            error = 5
            if(int(game_board.a_time) > int(game_board.b_time) + error):
                game_board.set_winner(Result.PLAYER_A, "tiebreak: time left")
            elif (int(game_board.b_time) > int(game_board.a_time) + error):
                game_board.set_winner(Result.PLAYER_B, "tiebreak: time left")
            else:
                game_board.set_winner(Result.TIE, "tiebreak")

    terminate_game(player_a_process, player_b_process, queues, out_queue, stop_event)
    return game_board


# closes down player processes
def terminate_game(process_a, process_b, queues, out_queue, stop_event):

    delete_module("player_a"+"."+"controller")
    delete_module("player_a")
    delete_module("player_b"+"."+"controller")
    delete_module("player_b")


    if(not stop_event is None):
        stop_event.set()
        try:
            while True:
                print(out_queue.get_nowait())
        except:
            pass
    
    terminate_process_and_children(process_a)
    terminate_process_and_children(process_b)
    
    for q in queues:
        try:
            while True:
                q.get_nowait()
        except:
            pass
    

def terminate_process_and_children(process):
    import psutil
    # Find the process by PID
    pid = process.pid  
    parent_process = None
    children = None
    try:
        parent_process = psutil.Process(pid)
    except psutil.NoSuchProcess as e:
        print(f"Process has already been closed.")
    
    if(not parent_process is None):
        children = parent_process.children(recursive=True)

    # Kill the parent process
    if not parent_process is None and parent_process.is_running():
        try:
            parent_process.terminate()
        except psutil.NoSuchProcess as e:
            print(f"Process has already been closed.")
        except Exception as e:
            print(f"Error while killing process: {e}")    
    
    if not children is None:
        for child in children:
            if child.is_running():
                try:
                    child.terminate()

                except psutil.NoSuchProcess as e:
                    print(f"Process  does not exist.")
                except Exception as e:
                    print(f"Error while killing process: {e}")

    if not parent_process is None and parent_process.is_running():
        try:
            parent_process.kill()   
        except psutil.NoSuchProcess:
            print(f"Process  does not exist.")
        except Exception as e:
            print(f"Error while killing process: {e}")  

    if not children is None:
        for child in children:
            if child.is_running():
                try:
                    child.kill()   
                except psutil.NoSuchProcess:
                    print(f"Process  does not exist.")
                except Exception as e:
                    print(f"Error while killing process: {e}")


def pause_process_and_children(process, limit_resources = False):
    
    # Find the process by PID
    if(limit_resources):
        import time
        import signal
        import os
        import psutil
        try:
            pid = process.pid
            parent_process = psutil.Process(pid)
            
            children = parent_process.children(recursive=True)
            
            # send sigstop to parent process
            if parent_process.is_running():
                try:
                    os.kill(pid, signal.SIGSTOP)
                except psutil.NoSuchProcess:
                    print(f"Process  does not exist.")
                except Exception as e:
                    print(f"Error while killing process: {e}")    

            i = 0
            while(parent_process.status() == psutil.STATUS_RUNNING and i < 50):
                time.sleep(0.001) 
                i+=1
            if(parent_process.status() == psutil.STATUS_RUNNING):
                os.kill(child.pid, signal.SIGKILL)   

            for child in children:
                if child.is_running():
                    try:
                        os.kill(child.pid, signal.SIGSTOP)
                    except psutil.NoSuchProcess:
                        print(f"Process  does not exist.")
                    except Exception as e:
                        print(f"Error while killing process: {e}")    
            
            for child in children:
                i = 0
                while(child.status() == psutil.STATUS_RUNNING and i < 50):
                    time.sleep(0.001) 
                    i+=1
                if(child.status()== psutil.STATUS_RUNNING):
                    os.kill(child.pid, signal.SIGKILL)

        except:
            print("error pausing processes")


def restart_process_and_children(process, limit_resources = False):
    
    if(limit_resources):
        import psutil
        import os
        import time
        import signal
    
        pid = process.pid
        parent_process = psutil.Process(pid)
        
        children = parent_process.children(recursive=True)

        try:

            for child in children:
                if child.is_running():
                    try:
                        os.kill(child.pid, signal.SIGCONT)
                    except psutil.NoSuchProcess:
                        print(f"Process does not exist.")
                    except Exception as e:
                        print(f"Error while killing process: {e}") 

            for child in children:
                i = 0
                while(child.status() != psutil.STATUS_STOPPED and i < 50):
                    time.sleep(0.001) 
                    i+=1
    
            
            # send sigstop to parent process
            if parent_process.is_running():
                try:
                    os.kill(pid, signal.SIGCONT)
                except psutil.NoSuchProcess:
                    print(f"Process does not exist.")
                except Exception as e:
                    print(f"Error while killing process: {e}")    

          
            i = 0
            while(parent_process.status() == psutil.STATUS_STOPPED and i < 50):
                time.sleep(0.001) 
                i+=1
        
            
        except:
            print("error restarting processes")

    

def apply_seccomp():
    try:
        import seccomp
    except ImportError:
        import pyseccomp as seccomp
    import prctl
    import signal
    import os

    

    

    prctl.set_ptracer(None)
    prctl.set_no_new_privs(True)
    ctx = seccomp.SyscallFilter(defaction=seccomp.ALLOW)
    # filesystem
    ctx.add_rule(seccomp.KILL, 'chdir')
    ctx.add_rule(seccomp.KILL, 'chmod')
    ctx.add_rule(seccomp.KILL, 'fchmod')
    ctx.add_rule(seccomp.KILL, 'fchmodat')
    ctx.add_rule(seccomp.KILL, 'chown')
    ctx.add_rule(seccomp.KILL, 'fchown')
    ctx.add_rule(seccomp.KILL, 'lchown')
    ctx.add_rule(seccomp.KILL, 'chroot')
    # ctx.add_rule(seccomp.KILL, 'unlink')
    ctx.add_rule(seccomp.KILL, 'unlinkat')
    ctx.add_rule(seccomp.KILL, 'rename')
    ctx.add_rule(seccomp.KILL, 'renameat')
    ctx.add_rule(seccomp.KILL, 'rmdir')
    ctx.add_rule(seccomp.KILL, 'mkdir')
    ctx.add_rule(seccomp.KILL, 'mount')
    ctx.add_rule(seccomp.KILL, 'umount2')
    ctx.add_rule(seccomp.KILL, 'symlink')
    # ctx.add_rule(seccomp.KILL, 'link')
    ctx.add_rule(seccomp.KILL, 'creat')
    ctx.add_rule(seccomp.KILL, 'truncate')
    ctx.add_rule(seccomp.KILL, 'ftruncate')
    ctx.add_rule(seccomp.KILL, 'pwrite64')

    # #time
    ctx.add_rule(seccomp.KILL, 'adjtimex')
    ctx.add_rule(seccomp.KILL, 'clock_settime')
    ctx.add_rule(seccomp.KILL, 'clock_adjtime')
    ctx.add_rule(seccomp.KILL, 'settimeofday')

    # #network    
    ctx.add_rule(seccomp.KILL, 'socket')
    ctx.add_rule(seccomp.KILL, 'bind')
    ctx.add_rule(seccomp.KILL, 'accept')
    ctx.add_rule(seccomp.KILL, 'connect')
    ctx.add_rule(seccomp.KILL, 'listen')
    ctx.add_rule(seccomp.KILL, 'setsockopt')
    ctx.add_rule(seccomp.KILL, 'getsockopt')
    ctx.add_rule(seccomp.KILL, "sendto")
    ctx.add_rule(seccomp.KILL, "recvfrom")
    ctx.add_rule(seccomp.KILL, "sendmsg")
    ctx.add_rule(seccomp.KILL, "recvmsg")
    ctx.add_rule(seccomp.KILL, 'unshare')
    
    # kernel
    ctx.add_rule(seccomp.KILL, 'reboot')
    ctx.add_rule(seccomp.KILL, 'shutdown')
    ctx.add_rule(seccomp.KILL, 'sysfs')
    ctx.add_rule(seccomp.KILL, 'sysinfo')
    ctx.add_rule(seccomp.KILL, "delete_module")
    ctx.add_rule(seccomp.KILL, 'prctl')
    ctx.add_rule(seccomp.KILL, 'execve')
    ctx.add_rule(seccomp.KILL, 'execveat')
    ctx.add_rule(seccomp.KILL, 'seccomp')

    # #i/o
    # ctx.add_rule(seccomp.KILL, 'ioctl')
    # ctx.add_rule(seccomp.KILL, 'keyctl')
    # ctx.add_rule(seccomp.KILL, 'perf_event_open')
    ctx.add_rule(seccomp.KILL, 'kexec_load')
    # ctx.add_rule(seccomp.KILL, 'iopl')
    # ctx.add_rule(seccomp.KILL, 'ioperm')
    
    #process limiting + scheduling
    ctx.add_rule(seccomp.KILL, 'exit')
    ctx.add_rule(seccomp.KILL, 'setuid')
    ctx.add_rule(seccomp.KILL, 'setgid')
    ctx.add_rule(seccomp.KILL, 'capset')
    ctx.add_rule(seccomp.KILL, 'capget')
    ctx.add_rule(seccomp.KILL, 'kill')
    ctx.add_rule(seccomp.KILL, 'tkill')
    ctx.add_rule(seccomp.KILL, 'tgkill')
    ctx.add_rule(seccomp.KILL, "setrlimit")
    ctx.add_rule(seccomp.KILL, "setpriority")
    ctx.add_rule(seccomp.KILL, "sched_setparam")
    ctx.add_rule(seccomp.KILL, "sched_setscheduler")
    
    ctx.load()
    
# starts up a player process ready to recieve instructions
def run_player_process(player_name, submission_dir, player_queue, return_queue, limit_resources, out_queue):
    try:
    

        import traceback
        import sys
        import importlib
        import os
        
        import time
        import psutil
        import os

        sys.path.append(submission_dir)

        
        if(limit_resources):
            import resource

            limit_mb = 1536
            limit_bytes = limit_mb * 1024 * 1024 #set limit to 1 gb
            resource.setrlimit(resource.RLIMIT_RSS, (limit_bytes, limit_bytes)) # only allow current process to run

            def checkMemory():
                pid = os.getpid()
                process = psutil.Process(pid)

                total_memory = process.memory_info().rss

                for child in process.children(recursive=True):
                    total_memory += child.memory_info().rss

                if(total_memory > limit_bytes):
                    raise MemoryError("Allocated too much memory on physical RAM")
                
                return total_memory

            apply_seccomp()
            def get_cur_time():
                # total time correct
                return time.perf_counter()
        else:
            class QueueWriter:
                def __init__(self, queue):
                    self.queue = queue
                    self.turn = ""

                def set_turn(self, t):
                    self.turn = t

                def write(self, message):
                    # This method is called by print, we send message to out_queue
                    if message != '\n':  # Ignore empty newlines that can be printed
                        self.queue.put("".join(["[", player_name," | ", self.turn, "]: ", message]))

                def flush(self):
                    pass
            
            printer = QueueWriter(out_queue)
            sys.stdout = printer

            def get_cur_time():
                return time.perf_counter()

            def checkMemory():
                pid = os.getpid()
                process = psutil.Process(pid)

                total_memory = process.memory_info().rss
                for child in process.children(recursive=True):
                    total_memory += child.memory_info().rss
                
                return total_memory

        importlib.import_module(player_name)
        module = importlib.import_module(player_name+".controller")

        player = None
        start = 0
        stop = 0
        return_queue.put(True)
    except:
        print(traceback.format_exc())
        return_queue.put(False)


    while True:
        func = player_queue.get()

        # called to play a turn
        if(func == "play"):
            try:
                temp_board, time_left = player_queue.get()
                if(not limit_resources):
                    printer.set_turn(f"turn #{temp_board.get_turn_count()}")

                try:
                    start = get_cur_time()
                    def time_left_func():
                        return time_left - (get_cur_time() - start)
                    player_move = player.play(temp_board, time_left_func)            
                    stop = get_cur_time()
                except:
                    
                    print(traceback.format_exc())
                    return_queue.put((None, -1, traceback.format_exc()))
                    continue

                try:
                    checkMemory()
                except MemoryError:
                    print(traceback.format_exc())
                    return_queue.put(("Memory", -1, traceback.format_exc()))
                    continue

                return_queue.put((player_move, stop-start, ""))
            except:
                return_queue.put(("Fail", -1, traceback.format_exc()))

        # called to return a bid at the start of the match
        elif(func == "bid"):
            try:
                temp_board, time_left = player_queue.get()
                if(not limit_resources):
                    printer.set_turn("bid")

                try:
                    start = get_cur_time()
                    def time_left_func():
                        return time_left - (get_cur_time() - start)
                    player_bid = player.bid(temp_board, time_left_func)            
                    stop = get_cur_time()
                except:
                    print(traceback.format_exc())
                    return_queue.put((None, -1, traceback.format_exc()))
                    continue

                try:
                    checkMemory()
                except MemoryError:
                    return_queue.put(("Memory", -1, traceback.format_exc()))
                    continue

                
                return_queue.put((player_bid, stop-start, ""))
            except:
                print(traceback.format_exc())
                return_queue.put(("Fail", -1, traceback.format_exc()))

        # called to construct the player class
        elif(func == "construct"):
            try:
                if(not limit_resources):
                    printer.set_turn("construct")
                try:
                    start = get_cur_time()
                    def time_left_func():
                        return time_left - (get_cur_time() - start)
                    player = module.PlayerController(time_left_func)
                    stop = get_cur_time()
                except:
                    return_queue.put((False, -1,traceback.format_exc()))
                    continue
                
                try:
                    checkMemory()
                except MemoryError:
                    print(traceback.format_exc())
                    return_queue.put(("Memory", -1, traceback.format_exc()))
                    continue

                return_queue.put((True, stop-start, ""))
            except:
                print(traceback.format_exc())
                return_queue.put(("Fail", -1, traceback.format_exc()))


# def check_process(process, finish, return_queue, return_value):
#     import time
#     """Check if the player process is still alive."""
#     while process.is_alive():
#         time.sleep(1)

#         if(finish.is_set()):
#             return
#     if(finish.is_set()):
#         return


#     return_queue.put(return_value)
#     print("Player process crashed")
#     return
    
        

#runs player construct command
def run_timed_constructor(process, timeout, extra_ret_time, player_queue, return_queue):
    # import threading
    
    # finished = threading.Event()
    # checker_thread = threading.Thread(target=check_process, args=(process, finished, return_queue, False))
    # checker_thread.start()

    player_queue.put("construct")

    try:
        ok, timer, message = return_queue.get(block = True, timeout = timeout + extra_ret_time) 
        # finished.set()

        if(ok == False):
            return False, message
        if(ok=="Memory" and timer == -1):
            print("Memory error")
            return False, message
        if(ok=="Fail" and timer == -1):
            raise RuntimeError(f"Something went wrong while running player constructor.\n {message}")
        
        return timer < timeout, message
    except:
        # finished.set()
        return False, "Timeout"



#runs player bid command
def run_timed_bid(process, is_player_a, game_board, timeout, extra_ret_time, player_queue, return_queue):

    temp_board = PlayerBoard(is_player_a, game_board.get_copy(False))

    player_queue.put("bid")
    player_queue.put((temp_board, timeout))

    timer = timeout

    try:
        

        bid, timer, message = return_queue.get(block = True, timeout = timeout + extra_ret_time) 
        if(bid == None):
            print("Player code caused exception")
            return None, -1, message
        if(bid=="Memory" and timer == -1):
            print("Memory error")
            return None, -2, message
        if(bid=="Fail" and timer == -1):
            raise RuntimeError(f"Something went wrong while running player bid \n {message}")

        if(timer < timeout):
            return bid, timer, message

        return None, timeout, "Timeout"
    except:
        return None, -1, "Timeout"

#runs player play command
def run_timed_play(process, is_player_a, game_board, timeout, extra_ret_time, player_queue, return_queue):

    temp_board = PlayerBoard(is_player_a, game_board.get_copy(False))

    player_queue.put("play")
    player_queue.put((temp_board, timeout))

    try:
        moves, timer, message = return_queue.get(block = True, timeout = timeout + extra_ret_time) 

        if(moves == None):
            print("Player code caused exception")
            return None, -1, message
        if(moves=="Memory" and timer == -1):
            print("Memory error")
            return None, -2, message
        if(moves=="Fail" and timer == -1):
            raise RuntimeError(f"Something went wrong while running player move. \n{message}")
        
        if(timer < timeout):
            return moves, timer, message
        return None, timeout, "Timeout"
    except:
        return None, -1, "Timeout"

    

