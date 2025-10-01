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

// Environment detection
const isExtension = window.location.protocol === 'chrome-extension:';
const BASE_URL = isExtension ? '' : 'https://weather-flight-booker.onrender.com';

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
  const response = await fetch(`${BASE_URL}/weather?city=${encodeURIComponent(location)}`);
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
//                 part 2
// Flight booking via backend
async function bookFlight(location, date) {
  const response = await fetch(`${BASE_URL}/spawn-booking`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ location, date })
  });
  if (!response.ok) throw new Error('Booking failed');
  return await response.json();
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
  const destination = destinationInput.value.trim();
  const date = departureDate.value;

  if (!destination || !date) {
    log('Destination and date are required.', 'warning');
    return;
  }

  log(`Booking flight to ${destination} on ${date}...`, 'info');
  loader.classList.remove('hidden');
  bookFlightBtn.disabled = true;

  try {
    const result = await bookFlight(destination, date);
    const details = result.details;

    flightDetails.innerHTML = `
      <ul class="space-y-2">
        <li><strong>Location:</strong> ${details.location}</li>
        <li><strong>Date:</strong> ${details.date}</li>
        <li><strong>Flight:</strong> ${details.flight}</li>
        <li><strong>Departure:</strong> ${details.departure}</li>
        <li><strong>Arrival:</strong> ${details.arrival}</li>
        <li><strong>Status:</strong> Confirmed</li>
      </ul>
    `;

    log(`Flight booked: ${details.flight}`, 'success');
  } catch (error) {
    log(`Booking failed: ${error.message}`, 'error');
    flightDetails.innerHTML = `
      <ul class="space-y-2 text-red-500">
        <li><strong>Error:</strong> Could not book flight.</li>
        <li><strong>Fallback:</strong> Simulated flight to ${destination} on ${date}</li>
        <li><strong>Flight:</strong> Air Nigeria 101</li>
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
window.onload = () => log('Popup ready.', 'info');
