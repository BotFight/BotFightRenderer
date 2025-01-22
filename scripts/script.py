# script.py
import sys
import json

def main():
    # Get arguments passed from Node.js
    args = sys.argv[1:]
    
    # Your Python logic here
    result = {
        "message": "Hello from Python!",
        "args": args
    }
    
    # Print result as JSON so it can be parsed in Node.js
    print(json.dumps(result))

if __name__ == "__main__":
    main()