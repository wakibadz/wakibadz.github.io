// Code from Radu Mariescu-Istodor
// https://www.youtube.com/watch?v=Uki99zJ2UQs

// Calculating speed
// https://stackoverflow.com/questions/47028071/calculating-speed-from-set-of-longitude-and-latitudes-values-obtained-in-one-min

let CURRENT_LOCATION = null;
let savedPoints = []; // Array to store multiple points
let locationHistory = []; // Store past locations

function main() {
    let geolocation = null;
    if (window.navigator && window.navigator.geolocation) {
        geolocation = window.navigator.geolocation;
    }

    if (geolocation) {
        geolocation.watchPosition(onLocationUpdate, onError, {
            enableHighAccuracy: true,
            maximumAge: 1000
        });
    } else {
        alert("Cannot access location");
    }

    updateInfo(); // Ensure speed is displayed immediately
}

function onLocationUpdate(event) {
    CURRENT_LOCATION = {
        latitude: event.coords.latitude,
        longitude: event.coords.longitude,
        timestamp: event.timestamp // Store time for speed calculations
    };

    locationHistory.push(CURRENT_LOCATION);

    // Keep only the last 6 points for average speed calculation
    if (locationHistory.length > 6) {
        locationHistory.shift();
    }

    document.getElementById("loc").innerHTML = 
        `Latitude: ${CURRENT_LOCATION.latitude}, Longitude: ${CURRENT_LOCATION.longitude}`;

    updateInfo(); // Update distances and speed dynamically
}

function onError(err) {
    alert("Cannot access location: " + err.message);
}

function addPoint() {
    if (CURRENT_LOCATION) {
        savedPoints.push({ 
            latitude: CURRENT_LOCATION.latitude, 
            longitude: CURRENT_LOCATION.longitude 
        });
        updateInfo();
    }
}

function updateInfo() {
    let infoHTML = "";

    if (savedPoints.length > 0) {
        savedPoints.forEach((point, index) => {
            let distance = getDistance(CURRENT_LOCATION, point).toFixed(2);
            let direction = getDirection(CURRENT_LOCATION, point);

            if (distance < 5) { 
                // If within 5 meters, show green dot
                infoHTML += `<div class="point">
                    <span class="dot green"></span> Point ${index + 1} (Reached)
                </div>`;
            } else {
                // Show arrow, direction, and distance
                infoHTML += `<div class="point">
                    <span class="arrow">➡ ${direction}</span> Point ${index + 1}: ${distance} meters
                </div>`;
            }
        });
    }

    document.getElementById("info").innerHTML = infoHTML;

    // Show current and average speed
    let currentSpeed = getCurrentSpeed(locationHistory).toFixed(2);
    let avgSpeed = getAverageSpeed(locationHistory).toFixed(2);
    
    document.getElementById("speedInfo").innerHTML = 
        `Current speed: ${currentSpeed} m/s<br>Average speed: ${avgSpeed} m/s`;
}

// Get cardinal direction (N, NE, E, etc.)
function getDirection(start, end) {
    let deltaLat = end.latitude - start.latitude;
    let deltaLon = end.longitude - start.longitude;
    let angle = Math.atan2(deltaLon, deltaLat) * (180 / Math.PI);

    if (angle < 0) angle += 360;

    const directions = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"];
    return directions[Math.round(angle / 45) % 8];
}

function latlonToXYZ(latlon, R) {
    const xyz = { x: 0, y: 0, z: 0 };
    xyz.y = Math.sin(degToRad(latlon.latitude)) * R;
    const r = Math.cos(degToRad(latlon.latitude)) * R;
    xyz.x = Math.sin(degToRad(latlon.longitude)) * r;
    xyz.z = Math.cos(degToRad(latlon.longitude)) * r;
    return xyz;
}

function degToRad(degree) {
    return degree * Math.PI / 180;
}

function getDistance(latlon1, latlon2) {
    const R = 6371000; // Earth radius in meters
    const xyz1 = latlonToXYZ(latlon1, R);
    const xyz2 = latlonToXYZ(latlon2, R);
    return euclidean(xyz1, xyz2);
}

function getAverageSpeed(points) {
    if (points.length < 2) return 0; // Ensure speed is 0 initially

    let totalDistance = 0;
    let totalTime = 0;

    for (let i = 0; i < points.length - 1; i++) {
        const dist = getDistance(points[i], points[i + 1]);
        const timeDiff = (points[i + 1].timestamp - points[i].timestamp) / 1000; 

        if (timeDiff > 0) { 
            totalDistance += dist;
            totalTime += timeDiff;
        }
    }

    return totalTime > 0 ? totalDistance / totalTime : 0;
}

function getCurrentSpeed(points) {
    if (points.length < 2) return 0; // Ensure speed is 0 initially

    let lastPoint = points[points.length - 1];
    let secondLastPoint = points[points.length - 2];

    let distance = getDistance(secondLastPoint, lastPoint);
    let timeDiff = (lastPoint.timestamp - secondLastPoint.timestamp) / 1000;

    return timeDiff > 0 ? distance / timeDiff : 0 ;
}

function euclidean(p1, p2) {
    return Math.sqrt(
        (p1.x - p2.x) * (p1.x - p2.x) +
        (p1.y - p2.y) * (p1.y - p2.y) +
        (p1.z - p2.z) * (p1.z - p2.z)
    );
}
