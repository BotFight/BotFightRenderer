import numpy as np

class Map:
    """
    Map is an internal utility class used by board to initialize 
    constants and store immutable map data.
    """
    def __init__(self, map_string):
        self.decay_timeline = [(1000, 15), (1600, 10),(1800,5), (1950, 2)]
        self.trap_timeout = 50
        #initializes a map from map string
        self.map_string = map_string

        self.infos = map_string.split("#")

        


        # print(self.infos)
        # print(len(self.infos))
        info_dim = self.infos[0].split(",")
        self.dim_x = int(info_dim[0])
        self.dim_y = int(info_dim[1])

        

        info_a = self.infos[1].split(",")
        info_b = self.infos[2].split(",")
        self.start_a = np.array((int(info_a[0]), int(info_a[1])), dtype = int)
        self.start_b = np.array((int(info_b[0]), int(info_b[1])), dtype = int)


        self.start_size = int(self.infos[3])

        self.min_player_size = int(self.infos[4])
        


        self.is_record = int(self.infos[8])
        
        self.cells_walls = np.empty((self.dim_y, self.dim_x), dtype = np.uint8)
        self.max_turns = 2000

        # should be all 0s and 1s
        for i in range(len(self.infos[7])):
            self.cells_walls[i // self.dim_x, i % self.dim_x] = int(self.infos[7][i])

        self.portal_dict = dict()
        self.cells_portals = -1 * np.ones((self.dim_y, self.dim_x, 2), dtype = np.int8)
        portal_list = self.infos[5].split("_")
        if(len(portal_list) > 0 and portal_list[0] != ''):
            for i in range(len(portal_list)):
                portal = portal_list[i].split(",")
                if(len(portal) == 4):
                    x1 = int(portal[0])
                    y1 = int(portal[1])
                    x2 = int(portal[2])
                    y2 = int(portal[3])

                    self.portal_dict[(x1, y1)] = (x2, y2)
                    
                    self.cells_portals[y1, x1, 0] = x2
                    self.cells_portals[y1, x1, 1] = y2

        
        if(self.is_record):
            apples = self.infos[6].split("_")
            if(len(apples) > 0 and apples[0] != ''):
            
                # timeline of apple spawns given by time, x, y
                self.apple_timeline = np.empty((len(apples), 3), dtype = int)
            
                for i in range(len(apples)):
                    apple = apples[i].split(",")
                    if(len(apple) == 3):
                        self.apple_timeline[i, 0] = int(apple[0])
                        self.apple_timeline[i, 1] = int(apple[1])
                        self.apple_timeline[i, 2] = int(apple[2])
            else:
                self.apple_timeline = np.empty((0, 3), dtype = int)
        else:
            
            stats = self.infos[6].split(",")
            apple_rate = int(stats[0])
            num_apples = int(stats[1])
            symmetry = stats[2] 

            space_coords = np.array(np.where(self.cells_walls == 0))
            space_coords[[0, 1], :] = space_coords[[1, 0], :]               
            spaces = np.transpose(space_coords)
            considered = set()
            select_from = []
            considered.add((self.start_a[0], self.start_a[1]))
            considered.add((self.start_b[0], self.start_b[1]))

            for x, y in spaces:
                if(not (x, y) in considered):
                    select_from.append(np.array([x, y]))
                    considered.add((x, y))
                    considered.add(self.reflect((x, y), symmetry))
            # get all the spaces where apples can spawn
            

            apples = []
            apples_possible_first_round = np.array(select_from)
            spawn_round = 0  

            self.add_apple_spawns(
                apples_possible_first_round,
                num_apples,
                apples,
                spawn_round,
                symmetry
            )
            
            select_from.append(np.array(self.start_a))
            apples_possible = np.array(select_from)
            spawn_round += apple_rate
            # every round after the first round, apples can spawn at 
            # snake spawn points

            while(spawn_round < self.max_turns):
                self.add_apple_spawns(
                    apples_possible,
                    num_apples,
                    apples,
                    spawn_round,
                    symmetry
                )
                spawn_round += apple_rate
            self.apple_timeline = np.array(apples)
                

    def add_apple_spawns(self, apples_possible, num_apples, apples, turn_num, symmetry):
        """
        Algorithm for determining random apple spawns in O(N*T) grid spaces,
        Where N is the number of possible spaces and T is the number of grid spaces.
        """
        np.random.shuffle(apples_possible)
        apple_count = 0
        i = 0
        while(apple_count < num_apples and i < len(apples_possible)):
            x, y = apples_possible[i]
            reflection = self.reflect((x, y),symmetry)

            if(x, y) == reflection:
                apple_count+=1
                apples.append(np.array([turn_num, x, y])) 
            elif self.cells_portals[y, x, 0] >= 0:
                apple_count+=1
                apples.append(np.array([turn_num, x, y])) 
                apples.append(np.array([turn_num, self.cells_portals[y, x, 0], self.cells_portals[y, x, 1]]))  
            else:
                apple_count+=2
                apples.append(np.array([turn_num, x, y]))   
                apples.append(np.array([turn_num, reflection[0], reflection[1]]))         

            i+=1


    def get_recorded_map(self):
        """
        Replaces random apple spawns in the given string with generated spawns.
        """
        if(self.is_record):
            return self.map_string
        
        record = self.infos.copy()
        apple_tuples =[]

        for time, x, y in self.apple_timeline:
            apple_tuples.append(",".join([str(int(time)), str(int(x)), str(int(y))]))
        
        apple_string = "_".join(apple_tuples)
        record[6] = apple_string
        record[8] = "1"

        return "#".join(record)

        

    def reflect(self, coords, symmetry):
        """
        Reflects coordinates across the map given a type of symmetry.
        """
        x, y = coords
        match symmetry:
            case "Horizontal":
                return (x, self.dim_y-1-y)
            case "Vertical":
                return (self.dim_x-1-x, y)
            case "Origin":
                return (self.dim_x-1-x, self.dim_y-1-y)


