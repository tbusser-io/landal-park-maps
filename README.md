# Landal Parks Map

A Vue 3 + TypeScript application for visualizing and filtering Landal vacation parks across Europe.

## Features

- 🗺️ Interactive Google Maps with 100+ Landal parks
- 🔍 Real-time filtering by country, amenities, and location
- 👤 User authentication with booking history
- 📱 Fully responsive (mobile, tablet, desktop)
- 🎯 Marker clustering for better map visualization
- 🏷️ Promotion badges on parks
- ✓ Visited/not-visited park filtering

## Tech Stack

- Vue 3 + Composition API
- TypeScript
- Google Maps JavaScript API
- Vite
- Scoped CSS

## Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Get Google Maps API Key

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable "Maps JavaScript API"
4. Create credentials → API Key
5. (Optional) Restrict the key to your domain

### 3. Configure Environment

Replace `YOUR_API_KEY_HERE` in `index.html` with your actual Google Maps API key:

```html
<script src="https://maps.googleapis.com/maps/api/js?key=YOUR_ACTUAL_KEY"></script>
```

### 4. Run Development Server

```bash
npm run dev
```

The app will be available at `http://localhost:5173`

## Mock Data

The app uses 100 mock parks with realistic Landal park names and locations across Europe:
- 55 parks in Netherlands
- 27 parks in Germany
- 9 parks in Belgium
- 9 parks in Denmark

To regenerate the mock data:

```bash
npm run generate-parks
```

## Demo Accounts

- **Email:** demo@landal.com | **Visited Parks:** 8
- **Email:** test@landal.com | **Visited Parks:** 6

Password: Any password works (it's a mock login)

## Project Structure

```
src/
├── components/          # Vue components
│   ├── AppHeader.vue
│   ├── FilterSidebar.vue
│   ├── MapView.vue
│   ├── SidePanel.vue
│   ├── MarkerLegend.vue
│   └── LoginModal.vue
├── composables/         # Composition API logic
│   ├── useAuth.ts
│   ├── useFilters.ts
│   ├── useMap.ts
│   └── useParks.ts
├── data/
│   └── parks.json       # Mock park data
├── types/
│   └── Park.ts          # TypeScript types
└── App.vue              # Main app component
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run generate-parks` - Generate mock park data

## Filters

- **Countries:** NL, DE, BE, DK, AT, CH, UK
- **Amenities:** Indoor Pool, Swimming Paradise, Pets Allowed, Luxury, Child Friendly, Wellness & Spa, Restaurant
- **Location Types:** Near Sea, Forest Area, Near Lake
- **Special:** Promotions, Visited/Not Visited (requires login)

## Design

See `DESIGN.md` for complete architecture and design decisions.

## Deployment

Build the app for production:

```bash
npm run build
```

Deploy the `dist/` folder to:
- Vercel
- Netlify
- GitHub Pages
- Any static hosting service

## License

Built for hackathon demo purposes.
