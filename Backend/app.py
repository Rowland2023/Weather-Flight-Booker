from flask import Flask, request, jsonify
from flask_cors import CORS
import logging

app = Flask(__name__)
CORS(app)

# Logger setup
logging.basicConfig(
    filename='logs/flask.log',
    level=logging.INFO,
    format='%(asctime)s %(levelname)s: %(message)s'
)

@app.route('/book-flight', methods=['POST'])
def book_flight():
    data = request.get_json()
    location = data.get('location')
    date = data.get('date')

    logging.info(f"Received booking for {location} on {date}")

    itinerary = {
        "location": location,
        "date": date,
        "flight": "Air Nigeria 101",
        "departure": "10:00 AM",
        "arrival": "12:30 PM"
    }

    logging.info(f"Returning itinerary: {itinerary}")
    return jsonify({"confirmation": "Flight booked!", "details": itinerary})

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)

