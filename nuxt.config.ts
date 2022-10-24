import { defineNuxtConfig } from 'nuxt'


// https://v3.nuxtjs.org/api/configuration/nuxt.config
export default defineNuxtConfig({
  env: {
    baseUrl: 'http://localhost:3000'
  },
  components: {
    global: true,
    dirs: ['~/components']
  },
  
})
