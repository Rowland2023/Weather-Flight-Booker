from flask import Flask, request, jsonify
from flask_cors import CORS
import logging
import os

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})  # You can restrict origins if needed

# Logger setup
os.makedirs('logs', exist_ok=True)
logging.basicConfig(
    filename='logs/flask.log',
    level=logging.INFO,
    format='%(asctime)s %(levelname)s: %(message)s'
)

@app.route('/book-flight', methods=['POST'])
def book_flight():
    data = request.get_json(force=True)
    location = data.get('location', 'Unknown')
    date = data.get('date', 'Unspecified')

    logging.info(f"Received booking request: {data}")

    itinerary = {
        "location": location,
        "date": date,
        "flight": "Air Nigeria 101",
        "departure": "10:00 AM",
        "arrival": "12:30 PM"
    }

    logging.info(f"Returning itinerary: {itinerary}")
    return jsonify({
        "confirmation": "Flight booked!",
        "details": itinerary
    })

if __name__ == '__main__':
    port = int(os.environ.get('FLASK_PORT', 5000))
    app.run(host='0.0.0.0', port=port)
