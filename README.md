# Landal Parks Map

A Vue 3 + TypeScript application for visualizing and filtering Landal vacation parks across Europe.

## Features

- 🗺️ Interactive Google Maps with 100+ Landal parks
- 🔍 Advanced tri-state filtering (must have, neutral, exclude) by country, amenities, and location
- 👤 User authentication with booking history
- 📱 Fully responsive (mobile, tablet, desktop)
- 🎯 Smart marker clustering with dynamic sizing based on park density
- 🏷️ Promotion badges on parks
- ✓ Visited/not-visited park filtering
- 🎨 Landal brand styling throughout
- ⚡ Optimized map loading with skeleton screen

## Tech Stack

- Vue 3 + Composition API
- TypeScript
- Google Maps JavaScript API (via vue3-google-map)
- @googlemaps/markerclusterer for clustering
- Vite
- CSS Variables (Landal brand colors)
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

### 3. Configure Environment (Optional)

The app currently has a demo API key hardcoded. For production use, you should use environment variables:

1. Copy `.env.local.example` to `.env.local`:
   ```bash
   cp .env.local.example .env.local
   ```

2. Add your Google Maps API key to `.env.local`:
   ```
   VITE_GOOGLE_MAPS_API_KEY=your_actual_api_key_here
   ```

3. Update `src/components/MapView.vue` to use the environment variable:
   ```vue
   :api-key="import.meta.env.VITE_GOOGLE_MAPS_API_KEY"
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
│   ├── AppHeader.vue          # Header with logo and auth
│   ├── FilterSidebar.vue      # Advanced filtering UI
│   ├── MapView.vue            # Google Maps integration
│   ├── SidePanel.vue          # Park details panel
│   ├── MarkerLegend.vue       # Map marker legend
│   ├── LoginModal.vue         # Authentication modal
│   ├── TriStateToggle.vue     # Must/Neutral/Exclude toggle
│   └── TwoStateToggle.vue     # On/Off toggle
├── composables/         # Composition API logic
│   ├── useAuth.ts             # Authentication state
│   ├── useFilters.ts          # Tri-state filter logic
│   └── useParks.ts            # Park data & filtering
├── data/
│   └── parks.json       # Mock park data (100+ parks)
├── types/
│   └── Park.ts          # TypeScript types
├── assets/              # Static assets
└── App.vue              # Main app component
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run generate-parks` - Generate mock park data

## Filters

### Tri-State Filters (Must Have / Neutral / Exclude)
- **Countries:** Netherlands, Germany, Belgium, Denmark, Austria, Switzerland, United Kingdom
- **Amenities:** Indoor Pool, Swimming Paradise, Pets Allowed, Luxury, Child Friendly, Wellness & Spa, Restaurant
- **Location Types:** Near Sea, Forest Area, Near Lake

### Toggle Filters
- **Special:** Promotions Only, Visited Only, Not Visited Only (requires login)

The tri-state filtering allows you to:
- ✓ **Must have** - Only show parks with this feature
- ○ **Neutral** - Don't filter by this feature
- ✕ **Exclude** - Hide parks with this feature

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
