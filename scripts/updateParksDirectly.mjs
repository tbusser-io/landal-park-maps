import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Country code mapping
const countryMap = {
  NL: 'Netherlands', DE: 'Germany', BE: 'Belgium', DK: 'Denmark',
  AT: 'Austria', CH: 'Switzerland', VK: 'United Kingdom', CZ: 'Czech Republic'
};

// Features & location generators
const feat = () => ({
  indoorPool: Math.random() > 0.6, swimmingParadise: Math.random() > 0.8,
  petsAllowed: Math.random() > 0.5, luxury: Math.random() > 0.7,
  childFriendly: Math.random() > 0.4, wellness: Math.random() > 0.6,
  restaurant: Math.random() > 0.5
});

const loc = () => ({
  nearSea: Math.random() > 0.7, forest: Math.random() > 0.6, nearLake: Math.random() > 0.7
});

const promo = () => {
  if (Math.random() > 0.7) return undefined;
  const promos = ['Last Minute - 20% off', 'Summer Special', 'Family Week', 'Early Bird - 15%', 'Weekend Special - 25%'];
  return { active: true, text: promos[Math.floor(Math.random() * promos.length)] };
};

// Embedded park data - continuing with a function to read from file
console.log('Reading real parks JSON from your provided data...');

// Instead of embedding all the data, let's read it from stdin or a file
// For now, I'll create a simpler solution

const realParksDataJSON = process.argv[2] || 'scripts/realParks.json';

if (!fs.existsSync(path.join(__dirname, '..', realParksDataJSON))) {
  console.error('❌ Please create scripts/realParks.json with your parks data');
  console.error('   Or run: npm run update-coords path/to/your/parks.json');
  process.exit(1);
}

const realParksData = JSON.parse(fs.readFileSync(path.join(__dirname, '..', realParksDataJSON), 'utf-8'));

const parks = realParksData.markers.map((m) => {
  const name = m.title.replace(/^(Vakantiepark|Beach Park|Beach Resort|Alps Resorts|Alpen Chalets|Alpen Residences|Waterpark|Resort|Strandappartementen) /i, '').trim();
  return {
    id: m.parkCode,
    name,
    country: countryMap[m.measurementPark.country] || 'Unknown',
    region: m.measurementPark.region || 'Unknown',
    coordinates: m.position,
    description: `Welcome to ${name}, a beautiful vacation park perfect for families and nature lovers.`,
    imageUrl: `https://picsum.photos/seed/${m.parkCode}/800/600`,
    features: feat(),
    location: loc(),
    promotion: promo()
  };
});

fs.writeFileSync(path.join(__dirname, '..', 'src', 'data', 'parks.json'), JSON.stringify(parks, null, 2));
console.log(`✅ Updated ${parks.length} parks with real coordinates`);

const counts = parks.reduce((a, p) => ({ ...a, [p.country]: (a[p.country] || 0) + 1 }), {});
console.log('\n📊 Distribution:');
Object.entries(counts).sort(([, a], [, b]) => b - a).forEach(([c, n]) => console.log(`   ${c}: ${n}`));
