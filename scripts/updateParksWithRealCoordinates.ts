import fs from 'fs';
import path from 'path';

// Map country codes to full names
const countryMap: Record<string, string> = {
  NL: 'Netherlands',
  DE: 'Germany',
  BE: 'Belgium',
  DK: 'Denmark',
  AT: 'Austria',
  CH: 'Switzerland',
  VK: 'United Kingdom',
  CZ: 'Czech Republic',
};

// Real park data from Landal API
const realParksData = {
  markers: [/* paste the markers array from the user's JSON */]
};

// Generate random features for each park
function generateFeatures() {
  return {
    indoorPool: Math.random() > 0.6,
    swimmingParadise: Math.random() > 0.8,
    petsAllowed: Math.random() > 0.5,
    luxury: Math.random() > 0.7,
    childFriendly: Math.random() > 0.4,
    wellness: Math.random() > 0.6,
    restaurant: Math.random() > 0.5,
  };
}

// Generate random location features
function generateLocation() {
  return {
    nearSea: Math.random() > 0.7,
    forest: Math.random() > 0.6,
    nearLake: Math.random() > 0.7,
  };
}

// Generate promotion
function generatePromotion() {
  const hasPromotion = Math.random() > 0.7;
  if (!hasPromotion) return undefined;

  const promotions = [
    'Last Minute Deal - 20% off',
    'Summer Special - Book now!',
    'Family Week - Kids stay free',
    'Early Bird - 15% discount',
    'Weekend Special - Save 25%',
  ];

  return {
    active: true,
    text: promotions[Math.floor(Math.random() * promotions.length)],
  };
}

// Transform real park data to our format
function transformParks() {
  return realParksData.markers.map((marker, index) => {
    const country = countryMap[marker.measurementPark.country] || 'Unknown';

    return {
      id: marker.parkCode,
      name: marker.title.replace('Vakantiepark ', '').replace('Beach Park ', '').replace('Alps Resorts ', '').replace('Alpen Chalets ', ''),
      country: country,
      region: marker.measurementPark.region || 'Unknown',
      coordinates: {
        lat: marker.position.lat,
        lng: marker.position.lng,
      },
      description: `Welcome to ${marker.title}, a beautiful vacation park perfect for families and nature lovers.`,
      imageUrl: `https://picsum.photos/seed/${marker.parkCode}/800/600`,
      features: generateFeatures(),
      location: generateLocation(),
      promotion: generatePromotion(),
    };
  });
}

// Write to parks.json
const parks = transformParks();
const outputPath = path.join(process.cwd(), 'src', 'data', 'parks.json');
fs.writeFileSync(outputPath, JSON.stringify(parks, null, 2));

console.log(`✅ Updated ${parks.length} parks with real coordinates`);
console.log(`📍 Output: ${outputPath}`);
