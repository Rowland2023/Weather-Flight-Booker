# Weather & Flight Booker Extension

This Chrome Extension allows users to check the weather forecast using the 7Timer API and book flights via a Flask-powered itinerary backend.

## Features

- 🌤 Check weather forecast for any location
- ✈️ Book flights directly from the extension
- 🔗 Connects to a local Flask API for flight logic

## Folder Structure

weather-flight-extension/ ├── manifest.json ├── popup.html ├── popup.js ├── background.js ├── assets/ │ ├── icon16.png │ ├── icon48.png │ ├── icon128.png ├── styles/ │ └── popup.css └── README.md

Code

## Setup

1. Clone this repo.
2. Run the Flask server:
   ```bash
   python app.py
Load the extension in Chrome:

Go to chrome://extensions

Enable "Developer mode"

Click "Load unpacked"

Select the weather-flight-extension folder

APIs Used
7Timer Weather API

Local Flask API (/book-flight)

License
MIT