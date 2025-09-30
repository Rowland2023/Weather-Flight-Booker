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

const apiKey = '078a0109c369079731b557bebe2157c6';

function normalizeLocation(location) {
  const city = location.trim();
  const presets = {
    'Lagos': 'Lagos,NG',
    'London': 'London,GB',
    'Paris': 'Paris,FR',
    'Accra': 'Accra,GH',
    'New York': 'New York,US',
    'Toronto': 'Toronto,CA',
    'Berlin': 'Berlin,DE',
    'Tokyo': 'Tokyo,JP'
  };
  return presets[city] || city;
}

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

async function fetchWeather(location) {
  const normalized = normalizeLocation(location);
  const url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(normalized)}&units=metric&appid=${apiKey}`;
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Weather data not found for ${location}`);
  return await response.json();
}

async function fetchForecast(location) {
  const normalized = normalizeLocation(location);
  const url = `https://api.openweathermap.org/data/2.5/forecast?q=${encodeURIComponent(normalized)}&units=metric&appid=${apiKey}`;
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Forecast data not found for ${location}`);
  return await response.json();
}

function formatWeather(data, labelColor) {
  const temp = `${Math.round(data.main.temp)}°C`;
  const conditions = data.weather[0].description;
  const icon = data.weather[0].icon;
  const wind = `${data.wind.speed} m/s`;
  const visibility = data.visibility ? `${data.visibility / 1000} km` : 'N/A';
  const pressure = `${data.main.pressure} hPa`;

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
    const [originData, destinationData, originForecast, destinationForecast] = await Promise.all([
      fetchWeather(origin),
      fetchWeather(destination),
      fetchForecast(origin),
      fetchForecast(destination)
    ]);

    originWeather.innerHTML = formatWeather(originData, 'text-green-700');
    destinationWeather.innerHTML = formatWeather(destinationData, 'text-indigo-700');
    originForecastDays.innerHTML = formatForecastDays(originForecast);
    destinationForecastDays.innerHTML = formatForecastDays(destinationForecast);

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

function handleBookFlight() {
  const origin = originInput.value.trim();
  const destination = destinationInput.value.trim();
  const date = departureDate.value;

  if (!origin || !destination || !date) {
    log('Origin, destination, and date are required.', 'warning');
    return;
  }

  log(`Booking flight from ${origin} to ${destination} on ${date}...`, 'info');

  flightDetails.innerHTML = `
    <ul class="space-y-2">
      <li><strong>Route:</strong> ${origin} → ${destination}</li>
      <li><strong>Date:</strong> ${date}</li>
      <li><strong>Price:</strong> ₦250,000</li>
      <li><strong>Status:</strong> On Time</li>
      <li><strong>Cancellation:</strong> Refundable within 24 hours</li>
    </ul>
  `;

  if (chrome.tabs) {
    const searchUrl = `https://www.google.com/search?q=book+flights+from+${encodeURIComponent(origin)}+to+${encodeURIComponent(destination)}+on+${encodeURIComponent(date)}`;
    chrome.tabs.create({ url: searchUrl });
    log(`Opened tab for flight search.`, 'success');
  } else {
    log('Simulated booking. Chrome API not available.', 'warning');
  }
}

getWeatherBtn.addEventListener('click', handleGetWeather);
bookFlightBtn.addEventListener('click', handleBookFlight);
window.onload = () => log('Extension popup ready.', 'info');
