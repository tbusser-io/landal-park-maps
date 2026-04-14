import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import VueGoogleMaps from 'vue3-google-map'

const app = createApp(App)

console.log('All env vars:', import.meta.env);
const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || 'AIzaSyBFndI0-S8lHHyfTIzNApFxOLPfFDVBEAM';
console.log('Google Maps API Key:', apiKey);
console.log('API Key type:', typeof apiKey);

app.use(VueGoogleMaps, {
  load: {
    key: apiKey,
  },
})

app.mount('#app')
