import tailwindcss from '@tailwindcss/vite'

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2026-11-01',
  devtools: { enabled: true },

  modules: ['@pinia/nuxt'],

  css: ['~/assets/css/main.css'],

  vite: {
    plugins: [tailwindcss()],
  },

  // Overridden at runtime by NUXT_PUBLIC_API_BASE / NUXT_PUBLIC_APP_NAME.
  runtimeConfig: {
    public: {
      apiBase: 'http://localhost:8081',
      appName: 'Car Showcase',
    },
  },

  // Public pages are server-rendered for SEO. The admin area is a client-only
  // SPA: it talks to the API with the browser's Sanctum session cookie.
  routeRules: {
    '/admin': { ssr: false },
    '/admin/**': { ssr: false },
  },

  app: {
    head: {
      htmlAttrs: { lang: 'en' },
      link: [{ rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' }],
    },
  },

  typescript: {
    strict: true,
  },
})
