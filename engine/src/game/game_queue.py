import numpy as np

class Queue:
    """
    This class implements a byte queue implemented using a circular
    array, optimized by numpy vectorization. Note that self.head
    and self.tail point to valid values. Thus, the queue runs on
    the interval [self.head, self.tail] inclusive. Adding and removing elements is
    done without emptiness checking: the queue's tail and head wil always
    increment on push or pop. When the queue is initialized or reinitialized via 
    resizing, the tail is set to self.size-1 instead to
    conform to this protocol, potentially causing the tail to be
    negative during part of the calculation.
    """
    def __init__(self, dim: int = 2, init_capacity: int = 50, copy: bool = False):
        """
        Initializes the queue with specified dimensions and capacity.

        Parameters:
            dim (int, optional): The dimension of the queue. Defaults to 2.
            init_capacity (int, optional): The initial capacity of the queue. Defaults to 50.
            copy (bool, optional): Whether the queue is initializing as a copy.
        """

        self.capacity = init_capacity
        self.dim=dim

        if(not copy):
            self.q = np.empty((init_capacity, dim), dtype =np.int8)
            self.size = 0
            self.head = 0
            self.tail = self.size-1


    def get_copy(self) -> "Queue":
        """
        Returns: 
            Queue: A deep copy of the current queue.
        """
        new_q = Queue(self.dim, self.capacity)
        new_q.q = np.array(self.q)
        new_q.size = self.size
        new_q.head = self.head
        new_q.tail = self.tail

        return new_q

    def push(self, move:np.ndarray):
        """
        Enqueues a value at the tail of the queue.

        Parameters:
            move (numpy.ndarray): The value to enqueue.
        """
        if(self.size+1 >= self.capacity):
            new_array = np.empty((self.capacity * 2, self.dim), dtype = int)

            r = self.q[self.head:self.tail+1, :]
            if(self.tail < self.head):
                r = np.concatenate((self.q[self.head:self.capacity, :], self.q[0:self.tail+1, :]), axis=0)

            new_array[0:self.size, :] = r
            self.capacity = self.capacity *2
            self.head = 0
            self.tail = (self.size-1) #note that this can cause the tail to be negative
            self.q = new_array

        self.tail = (self.tail+1) % self.capacity
        self.q[self.tail, :] = move
        self.size += 1 
    
    def peek_head(self) -> np.ndarray:
        """
        Retrieves the value at the head of the queue without removing it.

        Returns:
            np.array: The value at the head of the queue.
        """
        return np.array(self.q[self.head])

    def peek_tail(self) -> np.ndarray:
        """
        Retrieves the value at the tail of the queue without removing it.

        Returns:
            np.array: The value at the tail of the queue.
        """
        return np.array(self.q[self.tail])

    def peek_all(self) -> np.ndarray:
        """
        Retrieves all values in the queue without removing them.

        Returns:
            numpy.ndarray: A numpy array containing all values in the queue.
        """

        r = self.q[self.head:self.tail+1, :]
        if(self.tail < self.head):
            r = np.concatenate((self.q[self.head:self.capacity, :], self.q[0:self.tail+1, :]), axis = 0)
        return np.array(r)

    def peek_many_tail(self, num_moves: int) -> np.ndarray:
        """
        Retrieves `num_moves` values starting from the tail and progressing toward the head, without removing them.
        Returns values in order starting with closest to head.

        Parameters:
            num_moves (int): The number of values to retrieve from the tail toward the head.

        Returns:
            numpy.ndarray: A NumPy array containing the values starting from the tail and progressing toward the head.
        """
        start = (self.tail+1-num_moves+self.capacity)% self.capacity
        end = self.tail+1
        if(end < start):
            return np.concatenate((self.q[start:self.capacity, :], self.q[0:end, :]), axis = 0)
        
        return np.array(self.q[start:end])

    def peek_many_head(self, num_moves: int) -> np.ndarray:
        """
        Retrieves `num_moves` values starting from the head and progressing toward the tail, without removing them.

        Parameters:
            num_moves (int): The number of values to retrieve from the head toward the tail.

        Returns:
            numpy.ndarray: A NumPy array containing the values starting from the head and progressing toward the tail.
        """

        start = self.head
        end = (self.head+num_moves)%self.capacity
        if(end < start):
            return np.concatenate((self.q[start:self.capacity, :], self.q[0:end, :]), axis = 0)
        
        return np.array(self.q[start:end])

    def push_many(self, moves: np.ndarray) :
        """
        Enqueues multiple values at the tail of the queue.

        Parameters:
            moves (numpy.ndarray): The values to enqueue.
        """

        if(self.size+len(moves) >= self.capacity):
            new_array = np.empty(((self.capacity +len(moves))* 2, self.dim), dtype = int)
            r = self.q[self.head:self.tail+1, :]
            if(self.size > 0 and self.tail < self.head):
                r = np.concatenate((self.q[self.head:self.capacity, :], self.q[0:self.tail+1, :]), axis = 0)
            new_array[0:self.size, :] = r
            self.capacity = (self.capacity +len(moves))* 2
            self.head = 0
            self.tail = (self.size-1) #note that this can cause the tail to be negative
            self.q = new_array

        self.tail = (self.tail+1) % self.capacity
        self.q[np.arange(self.tail, self.tail+len(moves)) % self.capacity, :] = moves.reshape(-1, self.dim)
        self.tail = (self.tail+len(moves)-1) % self.capacity
        self.size += len(moves)

    def pop(self) -> np.ndarray:
        """
        Removes and returns a value at the head of the queue.

        Returns:
            numpy.ndarray: The value removed from the head of the queue.
        """
        if(self.size==0):
            raise IndexError("Popped on empty Queue")
        
        data = self.q[self.head]
        self.head = (self.head+1) % self.capacity
        self.size -= 1
        return np.array(data)

    def pop_many(self, num_moves: int) -> np.ndarray:
        """
        Removes and returns multiple values from the head of the queue.

        Parameters:
            num_moves (int): The number of values to remove from the head of the queue.

        Returns:
            numpy.ndarray: An array containing the values removed from the head of the queue.
        """

        if(self.size-num_moves < 0):
            raise IndexError("Popped too many elements from Queue")
        data = self.q[self.head:self.head+num_moves,:]
        self.head = (self.head+num_moves) % self.capacity
        self.size -= num_moves
        return np.array(data)
    
    def is_empty(self) -> bool:
        """
        Returns whether the queue is empty.

        Returns:
            bool: `True` if the queue is empty, `False` otherwise.
        """

        return self.size == 0


