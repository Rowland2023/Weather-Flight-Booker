chrome.runtime.onInstalled.addListener(() => {
  console.log("Weather & Flight Booker Extension installed.");
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "logWeatherCheck") {
    console.log(`User checked weather for: ${message.location}`);
    sendResponse({ status: "logged" });
  }

  if (message.type === "logFlightBooking") {
    console.log(`User booked flight to: ${message.location}`);
    sendResponse({ status: "logged" });
  }
});
