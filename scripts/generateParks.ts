import fs from 'fs';
import type { Park } from '../src/types/Park';

// Real Landal park names and approximate locations across Europe
const REAL_PARKS = [
  { name: 'Strand Resort Nieuwvliet-Bad', country: 'Netherlands', region: 'Zeeland', lat: 51.3789, lng: 3.4564 },
  { name: 'Beach Resort Ooghduyne', country: 'Netherlands', region: 'Noord-Holland', lat: 52.7456, lng: 4.6234 },
  { name: 'Résidence Terschelling', country: 'Netherlands', region: 'Friesland', lat: 53.3928, lng: 5.2145 },
  { name: 'Marinella', country: 'Netherlands', region: 'Noord-Holland', lat: 52.6234, lng: 4.7456 },
  { name: 'Strand Resort Ouddorp Duin', country: 'Netherlands', region: 'Zuid-Holland', lat: 51.8123, lng: 3.9345 },
  { name: 'Beach Villas Hoek van Holland', country: 'Netherlands', region: 'Zuid-Holland', lat: 51.9789, lng: 4.1234 },
  { name: 'Aerwinkel', country: 'Netherlands', region: 'Zeeland', lat: 51.5678, lng: 3.6789 },
  { name: 'Het Vennenbos', country: 'Netherlands', region: 'Noord-Brabant', lat: 51.4234, lng: 5.1234 },
  { name: 'Hoog Vaals', country: 'Netherlands', region: 'Limburg', lat: 50.7678, lng: 6.0123 },
  { name: 'Miggelenberg', country: 'Netherlands', region: 'Gelderland', lat: 51.9456, lng: 5.8234 },
  { name: 'De Lommerbergen', country: 'Netherlands', region: 'Gelderland', lat: 51.8567, lng: 5.9123 },
  { name: 'Coldenhove', country: 'Netherlands', region: 'Gelderland', lat: 52.1234, lng: 5.6789 },
  { name: 'Orveltermarke', country: 'Netherlands', region: 'Drenthe', lat: 52.7123, lng: 6.3456 },
  { name: 'Dwergter Sand', country: 'Netherlands', region: 'Drenthe', lat: 52.8234, lng: 6.4567 },
  { name: 'Rabbit Hill', country: 'Netherlands', region: 'Drenthe', lat: 52.9123, lng: 6.5678 },
  { name: 'Sonnenberg', country: 'Germany', region: 'Hessen', lat: 51.2345, lng: 9.1234 },
  { name: 'Warsberg', country: 'Germany', region: 'Rheinland-Pfalz', lat: 49.8234, lng: 6.8456 },
  { name: 'Hochwald', country: 'Germany', region: 'Rheinland-Pfalz', lat: 49.7123, lng: 6.9567 },
  { name: 'Mont Royal', country: 'Germany', region: 'Rheinland-Pfalz', lat: 49.9456, lng: 7.0678 },
  { name: 'Winterberg', country: 'Germany', region: 'Nordrhein-Westfalen', lat: 51.1956, lng: 8.5234 },
  { name: 'Am Rothaarsteig', country: 'Germany', region: 'Nordrhein-Westfalen', lat: 51.1234, lng: 8.4567 },
  { name: 'Salztal Paradies', country: 'Germany', region: 'Nordrhein-Westfalen', lat: 51.0678, lng: 8.3456 },
  { name: 'Residenz Am Sternberg', country: 'Germany', region: 'Hessen', lat: 50.9234, lng: 8.7123 },
  { name: 'Eifeler Tor', country: 'Germany', region: 'Nordrhein-Westfalen', lat: 50.5456, lng: 6.4234 },
  { name: 'Village les Gottales', country: 'Belgium', region: 'Luxembourg', lat: 50.0123, lng: 5.3456 },
  { name: 'Mont des Pins', country: 'Belgium', region: 'Namur', lat: 50.1234, lng: 5.4567 },
  { name: 'Le Moulin', country: 'Belgium', region: 'Luxembourg', lat: 49.9234, lng: 5.2345 },
  { name: 'Rønbjerg', country: 'Denmark', region: 'Nordjylland', lat: 57.2345, lng: 9.8234 },
  { name: 'Skærbæk', country: 'Denmark', region: 'Syddanmark', lat: 55.1567, lng: 8.7645 },
  { name: 'Ebeltoft', country: 'Denmark', region: 'Midtjylland', lat: 56.1945, lng: 10.6823 },
];

async function generateParks() {
  console.log('🔄 Generating mock park data...');

  try {
    // Generate 100 parks by reusing and varying the real parks
    const enhancedParks: Park[] = [];
    const targetCount = 100;

    for (let i = 0; i < targetCount; i++) {
      const basePark = REAL_PARKS[i % REAL_PARKS.length];
      const variation = Math.floor(i / REAL_PARKS.length);

      // Add slight coordinate variation for duplicates
      const latVariation = (Math.random() - 0.5) * 0.5;
      const lngVariation = (Math.random() - 0.5) * 0.5;

      const parkName = variation > 0 ? `${basePark.name} ${variation + 1}` : basePark.name;

      enhancedParks.push({
        id: `park-${i + 1}`,
        name: parkName,
        country: basePark.country,
        region: basePark.region,
        coordinates: {
          lat: basePark.lat + latVariation,
          lng: basePark.lng + lngVariation,
        },
        description: generateDescription(parkName),
        imageUrl: `https://picsum.photos/seed/park${i}/800/600`,
        features: generateFeatures(parkName),
        location: generateLocationTypes(parkName, basePark.lat, basePark.lng),
        promotion: Math.random() < 0.3 ? generatePromotion() : undefined,
      });
    }

    const outputPath = './src/data/parks.json';
    fs.writeFileSync(outputPath, JSON.stringify(enhancedParks, null, 2));

    console.log(`✅ Generated ${enhancedParks.length} parks → ${outputPath}`);

    // Show distribution
    const countryCount: Record<string, number> = {};
    enhancedParks.forEach((park) => {
      countryCount[park.country] = (countryCount[park.country] || 0) + 1;
    });
    console.log('📊 Distribution by country:', countryCount);
  } catch (error) {
    console.error('❌ Failed to generate parks:', error);
    process.exit(1);
  }
}

function generateFeatures(parkName: string) {
  const lowerName = parkName.toLowerCase();
  const hasPool = Math.random() < 0.6;
  const hasParadise = lowerName.includes('resort') ? Math.random() < 0.4 : Math.random() < 0.1;

  return {
    indoorPool: hasPool,
    swimmingParadise: hasParadise,
    petsAllowed: Math.random() < 0.5,
    luxury: Math.random() < 0.3,
    childFriendly: Math.random() < 0.7,
    wellness: Math.random() < 0.4,
    restaurant: Math.random() < 0.6,
  };
}

function generateLocationTypes(name: string, lat: number, lng: number) {
  const lowerName = name.toLowerCase();

  return {
    nearSea:
      lowerName.includes('strand') ||
      lowerName.includes('beach') ||
      lowerName.includes('coast') ||
      lowerName.includes('zee'),
    forest:
      lowerName.includes('bos') ||
      lowerName.includes('forest') ||
      lowerName.includes('wood') ||
      lowerName.includes('wald'),
    nearLake:
      lowerName.includes('meer') ||
      lowerName.includes('lake') ||
      lowerName.includes('see'),
  };
}

function generateDescription(parkName: string): string {
  const templates = [
    `Welcome to ${parkName}, a beautiful vacation park perfect for families and nature lovers.`,
    `${parkName} offers a unique blend of comfort and outdoor adventure in a stunning natural setting.`,
    `Discover ${parkName}, where relaxation meets recreation for an unforgettable holiday experience.`,
    `Experience the charm of ${parkName}, your ideal destination for a peaceful getaway.`,
  ];
  return templates[Math.floor(Math.random() * templates.length)];
}

function generatePromotion() {
  const promotions = [
    '20% off spring bookings',
    'Summer special: 3 nights for the price of 2',
    'Early bird discount: book now and save',
    'Weekend special offer',
    'Last minute deal - limited availability',
    'Autumn discount: up to 25% off',
  ];

  return {
    active: true,
    text: promotions[Math.floor(Math.random() * promotions.length)],
  };
}

function deriveCountryFromCoordinates(lat: number, lng: number): string {
  // Simple heuristic based on coordinate ranges
  // Netherlands: roughly 50.75-53.5 N, 3.3-7.2 E
  if (lat > 50.5 && lat < 53.7 && lng > 3 && lng < 7.5) return 'Netherlands';

  // Germany: roughly 47-55 N, 5.9-15 E
  if (lat > 47 && lat < 55.5 && lng > 5.8 && lng < 15.5) return 'Germany';

  // Belgium: roughly 49.5-51.5 N, 2.5-6.4 E
  if (lat > 49 && lat < 51.7 && lng > 2 && lng < 6.5) return 'Belgium';

  // Denmark: roughly 54.5-58 N, 8-15 E
  if (lat > 54 && lat < 58.5 && lng > 7.5 && lng < 15.5) return 'Denmark';

  // Austria: roughly 46.4-49 N, 9.5-17 E
  if (lat > 46 && lat < 49.5 && lng > 9 && lng < 17.5) return 'Austria';

  // Switzerland: roughly 45.8-47.8 N, 5.9-10.5 E
  if (lat > 45.5 && lat < 48 && lng > 5.5 && lng < 11) return 'Switzerland';

  // UK: roughly 49.9-60.9 N, -8 to 2 E
  if (lat > 49.5 && lat < 61 && lng > -8.5 && lng < 2.5) return 'United Kingdom';

  return 'Europe';
}

generateParks().catch((error) => {
  console.error('Unexpected error:', error);
  process.exit(1);
});
