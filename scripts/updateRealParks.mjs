import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Map country codes to full names
const countryMap = {
  NL: 'Netherlands',
  DE: 'Germany',
  BE: 'Belgium',
  DK: 'Denmark',
  AT: 'Austria',
  CH: 'Switzerland',
  VK: 'United Kingdom',
  CZ: 'Czech Republic',
};

// Read the real parks JSON file (user should save it as realParks.json)
const realParksPath = path.join(__dirname, 'realParks.json');
const realParksData = JSON.parse(fs.readFileSync(realParksPath, 'utf-8'));

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
  return realParksData.markers.map((marker) => {
    const country = countryMap[marker.measurementPark.country] || 'Unknown';

    // Clean up park name by removing common prefixes
    let parkName = marker.title
      .replace(/^Vakantiepark /i, '')
      .replace(/^Beach Park /i, '')
      .replace(/^Beach Resort /i, '')
      .replace(/^Alps Resorts /i, '')
      .replace(/^Alpen Chalets /i, '')
      .replace(/^Alpen Residences /i, '')
      .replace(/^Waterpark /i, '')
      .replace(/^Resort /i, '')
      .replace(/^Strandappartementen /i, '')
      .trim();

    return {
      id: marker.parkCode,
      name: parkName,
      country: country,
      region: marker.measurementPark.region || 'Unknown',
      coordinates: {
        lat: marker.position.lat,
        lng: marker.position.lng,
      },
      description: `Welcome to ${parkName}, a beautiful vacation park perfect for families and nature lovers.`,
      imageUrl: `https://picsum.photos/seed/${marker.parkCode}/800/600`,
      features: generateFeatures(),
      location: generateLocation(),
      promotion: generatePromotion(),
    };
  });
}

// Write to parks.json
const parks = transformParks();
const outputPath = path.join(__dirname, '..', 'src', 'data', 'parks.json');
fs.writeFileSync(outputPath, JSON.stringify(parks, null, 2));

console.log(`✅ Updated ${parks.length} parks with real coordinates`);
console.log(`📍 Output: ${outputPath}`);

// Print country distribution
const countryCounts = parks.reduce((acc, park) => {
  acc[park.country] = (acc[park.country] || 0) + 1;
  return acc;
}, {});
console.log('\n📊 Distribution by country:');
Object.entries(countryCounts)
  .sort(([, a], [, b]) => b - a)
  .forEach(([country, count]) => console.log(`   ${country}: ${count} parks`));
