const fetch = require("node-fetch");

exports.distanceCalculator = (user, driver) => {
  const lat1 = user.lat;
  const lon1 = user.lng;
  
  const lat2 = driver.lat;
  const lon2 = driver.lng;
  
  const R = 6371e3; // metres
  const lat1InRad = lat1 * Math.PI/180; // φ, λ in radians
  const lat2INRad = lat2 * Math.PI/180;
  const latDiffInRad = (lat2-lat1) * Math.PI/180;
  const lngDiffInRad = (lon2-lon1) * Math.PI/180;
  
  const a = Math.sin(latDiffInRad/2) * Math.sin(latDiffInRad/2) +
    Math.cos(lat1InRad) * Math.cos(lat2INRad) *
    Math.sin(lngDiffInRad/2) * Math.sin(lngDiffInRad/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  
  return R * c; // distance is in meters
}

exports.fetchDistanceFromGoogle = async (lat, lng, toLat, toLng) => {
  const url = `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${lat},${lng}&destinations=${toLat},${toLng}&mode=driving&language=en-EN&sensor=false&key=${process.env.GOOGLE_API_KEY}`;
  try {
    const response = await fetch(url);
    return await response.json();
  } catch (err) {
    console.error(err);
  }
};