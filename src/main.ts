import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import VueGoogleMaps from 'vue3-google-map'

const app = createApp(App)

const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

app.use(VueGoogleMaps, {
  load: {
    key: apiKey,
  },
})

app.mount('#app')
