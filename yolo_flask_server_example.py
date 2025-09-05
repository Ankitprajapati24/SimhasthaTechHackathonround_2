# First, you need to install Flask and Flask-CORS.
# Open your terminal and run:
# pip install Flask flask-cors

from flask import Flask, jsonify
from flask_cors import CORS
import time

# --- Your YOLO Code Integration ---
# This is where you would integrate your YOLO person detection logic.
# For this example, we'll just simulate a person count that changes over time.

# Imagine this is the variable your YOLO script updates.
live_person_count = 0

def initialize_yolo():
    """
    This is where you would put your one-time setup code for the YOLO model,
    like loading the model weights.
    """
    print("YOLO model would be initialized here.")
    # For example: model = YOLO('yolov8n.pt')

def get_count_from_yolo_logic():
    """
    This function should contain the logic that gets the current person count
    from your YOLO detection system.

    It should return a single number (the count).
    """
    global live_person_count

    # For this demonstration, we'll just make the number go up and down
    # to simulate people entering and leaving.
    # Replace this simulation with your actual count!
    if int(time.time()) % 10 < 5:
        live_person_count = min(10, live_person_count + 1)
    else:
        live_person_count = max(0, live_person_count - 1)

    print(f"Current simulated count is: {live_person_count}")
    return live_person_count

# --- Flask Server Code ---
# You shouldn't need to change much below this line.

app = Flask(__name__)
# This is important to allow the Next.js app (on a different port) to call this server.
CORS(app)

@app.route('/count')
def get_count_endpoint():
    """
    This function creates the web URL (endpoint) that our Next.js app will call.
    It runs your YOLO logic and returns the count in a format called JSON.
    """
    # 1. Get the latest count from your logic
    current_count = get_count_from_yolo_logic()

    # 2. Return it as JSON
    # The Next.js app expects the format: {"count": <number>}
    return jsonify({'count': current_count})

if __name__ == '__main__':
    # --- Step-by-Step Guide ---
    # 1. Make sure you've installed Flask and Flask-CORS (`pip install Flask flask-cors`).
    #
    # 2. Add your YOLO initialization logic to the `initialize_yolo()` function.
    #
    # 3. Add your person counting logic inside the `get_count_from_yolo_logic()`
    #    function so it returns the current count.
    #
    # 4. Save this file.
    #
    # 5. Open your terminal, navigate to the folder where this file is saved,
    #    and run the command: python yolo_flask_server_example.py
    #
    # 6. Your server is now running! It will be accessible at http://127.0.0.1:5000.
    #
    # 7. Go back to the web application and click the "Live Feed" switch. It will now
    #    start fetching the count from your Python script every few seconds.

    initialize_yolo()
    print("Starting Flask server... Visit http://127.0.0.1:5000/count to see the count.")
    app.run(host='0.0.0.0', port=5000, debug=False)
