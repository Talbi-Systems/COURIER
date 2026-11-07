// script.js

// Function to get coordinates of a city using Nominatim API
async function getCoordinates(city) {
const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(city)}`;

    try {
        const response = await fetch(url);
        const data = await response.json();
        if (data.length > 0) {
            return {
                lat: parseFloat(data[0].lat),
                lon: parseFloat(data[0].lon),
            };
        } else {
            throw new Error("City not found.");
        }
    } catch (error) {
        console.error("Error fetching coordinates:", error);
        alert(`Could not find coordinates for ${city}.`);
        return null;
    }
}

// Function to calculate the distance between two points using OpenRouteService API
async function getDistance(origin, destination) {
    const apiKey = "YOUR_OPENROUTESERVICE_API_KEY"; // Replace with your ORS API key
    const url = "https://api.openrouteservice.org/v2/matrix/driving-car";
    const requestBody = {
        locations: [
            [origin.lon, origin.lat],
            [destination.lon, destination.lat],
        ],
        metrics: ["distance"],
    };

    try {
        const response = await fetch(url, {
            method: "POST",
            headers: {
                "Authorization": apiKey,
                "Content-Type": "application/json",
            },
            body: JSON.stringify(requestBody),
        });
        const data = await response.json();
        if (data.distances) {
            return data.distances[0][1] / 1000; // Convert meters to kilometers
        } else {
            throw new Error("Unable to calculate distance.");
        }
    } catch (error) {
        console.error("Error fetching distance:", error);
        alert("Could not calculate distance. Please try again.");
        return null;
    }
}

// Event listener for the Calculate button
document.getElementById("calculate-button").addEventListener("click", async function () {
    const loadingCity = document.getElementById("loading-city").value;
    const deliveringCity = document.getElementById("delivering-city").value;
    const weight = parseFloat(document.getElementById("weight").value);
    const urgencyFactor = parseFloat(document.getElementById("urgency").value);

    if (!loadingCity || !deliveringCity || isNaN(weight) || isNaN(urgencyFactor)) {
        alert("Please fill in all fields correctly.");
        return;
    }

    // Get coordinates for both cities
    const loadingCoordinates = await getCoordinates(loadingCity);
    const deliveringCoordinates = await getCoordinates(deliveringCity);

    if (!loadingCoordinates || !deliveringCoordinates) {
        return; // Exit if coordinates couldn't be found
    }

    // Get the road distance between the cities
    const distance = await getDistance(loadingCoordinates, deliveringCoordinates);

    if (distance === null) {
        return; // Exit if distance couldn't be calculated
    }

    // Base pricing logic
    const basePricePerKm = 1.5; // €0.5 per km
    const basePricePerKg = 0.5; // €0.2 per kg

    // Calculate total price
    const price = (distance * basePricePerKm + weight * basePricePerKg) * urgencyFactor;

    // Display result
    document.getElementById("result").textContent = `€${price.toFixed(2)}`;
});
