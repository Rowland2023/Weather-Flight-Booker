// DOM Elements
const originInput = document.getElementById('originInput');
const destinationInput = document.getElementById('destinationInput');
const departureDate = document.getElementById('departureDate');
const getWeatherBtn = document.getElementById('getWeather');
const bookFlightBtn = document.getElementById('bookFlight');
const loader = document.getElementById('loader');
const originWeather = document.getElementById('origin-weather');
const destinationWeather = document.getElementById('destination-weather');
const originForecastDays = document.getElementById('origin-forecast-days');
const destinationForecastDays = document.getElementById('destination-forecast-days');
const flightDetails = document.getElementById('flight-details');
const logDisplay = document.getElementById('log-display');

// IATA Code Mapping
const airportCodes = {
  'Lagos': 'LOS',
  'London': 'LHR',
  'Paris': 'CDG',
  'New York': 'JFK',
  'Toronto': 'YYZ',
  'Accra': 'ACC',
  'Tokyo': 'HND',
  'Berlin': 'BER'
};

// Logger
function log(message, type = 'info') {
  const timestamp = new Date().toLocaleTimeString();
  const logEntry = document.createElement('div');
  const colorMap = {
    info: 'text-gray-400',
    success: 'text-green-500',
    error: 'text-red-500',
    warning: 'text-yellow-500'
  };
  logEntry.className = `p-1 border-b border-gray-800 ${colorMap[type] || 'text-gray-400'}`;
  logEntry.innerHTML = `<span class="text-gray-600">[${timestamp}]</span> ${message}`;
  logDisplay.prepend(logEntry);
  while (logDisplay.children.length > 15) logDisplay.removeChild(logDisplay.lastChild);
  console.log(`[${type.toUpperCase()}] ${timestamp}: ${message}`);
}

// Weather API via backend
async function fetchWeather(location) {
  const response = await fetch(`/weather?city=${encodeURIComponent(location)}`);
  if (!response.ok) throw new Error(`Weather data not found for ${location}`);
  return await response.json();
}

function formatWeather(data, labelColor) {
  const temp = `${Math.round(data.list[0].main.temp)}°C`;
  const conditions = data.list[0].weather[0].description;
  const icon = data.list[0].weather[0].icon;
  const wind = `${data.list[0].wind.speed} m/s`;
  const visibility = data.list[0].visibility ? `${data.list[0].visibility / 1000} km` : 'N/A';
  const pressure = `${data.list[0].main.pressure} hPa`;

  return `
    <div class="flex items-center gap-3">
      <img src="https://openweathermap.org/img/wn/${icon}@2x.png" alt="${conditions}" />
      <div>
        <p class="text-xl font-bold ${labelColor} capitalize">${conditions}</p>
        <p class="text-4xl font-extrabold text-gray-900">${temp}</p>
      </div>
    </div>
    <ul class="text-sm space-y-1 mt-3 text-gray-700">
      <li><strong>Wind:</strong> ${wind}</li>
      <li><strong>Visibility:</strong> ${visibility}</li>
      <li><strong>Pressure:</strong> ${pressure}</li>
    </ul>
  `;
}

function formatForecastDays(data) {
  const daily = {};
  data.list.forEach(entry => {
    const date = entry.dt_txt.split(' ')[0];
    if (!daily[date] && entry.dt_txt.includes('12:00:00')) {
      daily[date] = entry;
    }
  });

  const days = Object.keys(daily).slice(0, 3);
  return days.map(date => {
    const entry = daily[date];
    const icon = entry.weather[0].icon;
    const temp = `${Math.round(entry.main.temp)}°C`;
    const condition = entry.weather[0].description;
    return `
      <div class="flex items-center gap-3 text-sm text-gray-700">
        <img src="https://openweathermap.org/img/wn/${icon}.png" alt="${condition}" />
        <div>
          <p class="font-semibold">${date}</p>
          <p class="capitalize">${condition} — ${temp}</p>
        </div>
      </div>
    `;
  }).join('');
}
// Amadeus API credentials PART 2
const amadeusKey = 'GFB9M1zGXs6tto0bKjYFfGhy6TvftuWR';
const amadeusSecret = 'bFJKPGJunj7kgIrF';

async function getAccessToken() {
  const response = await fetch('https://test.api.amadeus.com/v1/security/oauth2/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'client_credentials',
      client_id: amadeusKey,
      client_secret: amadeusSecret
    })
  });
  const data = await response.json();
  return data.access_token;
}

async function searchFlights(origin, destination, date, token) {
  const originCode = airportCodes[origin] || origin;
  const destinationCode = airportCodes[destination] || destination;
  const url = `https://test.api.amadeus.com/v2/shopping/flight-offers?originLocationCode=${originCode}&destinationLocationCode=${destinationCode}&departureDate=${date}&adults=1`;
  const response = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` }
  });
  const data = await response.json();
  return data.data;
}

// Event Handlers
async function handleGetWeather() {
  const origin = originInput.value.trim();
  const destination = destinationInput.value.trim();
  if (!origin || !destination) {
    log('Please enter both origin and destination.', 'warning');
    return;
  }

  log(`Fetching weather for ${origin} and ${destination}...`, 'info');
  loader.classList.remove('hidden');
  getWeatherBtn.disabled = true;

  try {
    const [originData, destinationData] = await Promise.all([
      fetchWeather(origin),
      fetchWeather(destination)
    ]);

    originWeather.innerHTML = formatWeather(originData, 'text-green-700');
    destinationWeather.innerHTML = formatWeather(destinationData, 'text-indigo-700');
    originForecastDays.innerHTML = formatForecastDays(originData);
    destinationForecastDays.innerHTML = formatForecastDays(destinationData);

    log(`Weather loaded for both locations.`, 'success');
  } catch (error) {
    log(`Failed to fetch weather: ${error.message}`, 'error');
    originWeather.innerHTML = `<p class="text-red-500">Error loading origin weather.</p>`;
    destinationWeather.innerHTML = `<p class="text-red-500">Error loading destination weather.</p>`;
    originForecastDays.innerHTML = '';
    destinationForecastDays.innerHTML = '';
  } finally {
    loader.classList.add('hidden');
    getWeatherBtn.disabled = false;
  }
}

async function handleBookFlight() {
  const origin = originInput.value.trim();
  const destination = destinationInput.value.trim();
  const date = departureDate.value;

  if (!origin || !destination || !date) {
    log('Origin, destination, and date are required.', 'warning');
    return;
  }

  log(`Searching flights from ${origin} to ${destination} on ${date}...`, 'info');
  loader.classList.remove('hidden');
  bookFlightBtn.disabled = true;

  try {
    const token = await getAccessToken();
    const flights = await searchFlights(origin, destination, date, token);

    if (!flights || flights.length === 0) {
      throw new Error('No flights found.');
    }

    const flight = flights[0];
    const itinerary = flight.itineraries[0];
    const segment = itinerary.segments[0];
    const price = flight.price.total;
    const airline = segment.carrierCode;
    const stops = itinerary.segments.length - 1;

    flightDetails.innerHTML = `
      <ul class="space-y-2">
        <li><strong>Route:</strong> ${origin} → ${destination}</li>
        <li><strong>Date:</strong> ${date}</li>
        <li><strong>Airline:</strong> ${airline}</li>
        <li><strong>Stops:</strong> ${stops === 0 ? 'Non-stop' : stops}</li>
        <li><strong>Price:</strong> $${price}</li>
        <li><strong>Status:</strong> Available</li>
      </ul>
    `;

    log(`Flight found: ${airline} for $${price}`, 'success');
  } catch (error) {
    log(`Flight search failed: ${error.message}`, 'error');
    flightDetails.innerHTML = `
      <ul class="space-y-2 text-red-500">
        <li><strong>Error:</strong> Could not load flight data.</li>
        <li><strong>Fallback:</strong> Simulated flight from ${origin} to ${destination} on ${date}</li>
        <li><strong>Price:</strong> ₦250,000</li>
        <li><strong>Status:</strong> On Time</li>
      </ul>
    `;
  } finally {
    loader.classList.add('hidden');
    bookFlightBtn.disabled = false;
  }
}

// Final Listeners
getWeatherBtn.addEventListener('click', handleGetWeather);
bookFlightBtn.addEventListener('click', handleBookFlight);
window.onload = () => log('Extension popup ready.', 'info');
