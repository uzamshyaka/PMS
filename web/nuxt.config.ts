import tailwindcss from '@tailwindcss/vite'

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2026-11-01',
  // The floating Nuxt DevTools button is off; enable locally if you need it.
  devtools: { enabled: false },

  modules: ['@pinia/nuxt', '@nuxt/fonts'],

  css: ['~/assets/css/main.css'],

  vite: {
    plugins: [tailwindcss()],
  },

  // Self-hosted at build time: no third-party font requests from visitors.
  fonts: {
    families: [
      { name: 'Montserrat', provider: 'google', weights: [600, 700, 800], styles: ['normal'], global: true },
      { name: 'Inter', provider: 'google', weights: [400, 500, 600, 700], styles: ['normal'], global: true },
      { name: 'Mr Dafoe', provider: 'google', weights: [400], styles: ['normal'], global: true },
    ],
  },

  // Overridden at runtime by NUXT_PUBLIC_* environment variables.
  runtimeConfig: {
    // Server-only: the API's address for server-side rendering (NUXT_API_BASE_SERVER), e.g. http://api:8000 in Docker.
    apiBaseServer: '',
    public: {
      apiBase: 'http://localhost:8081',
      appName: 'Car Showcase',
      // true = labelled sample vehicles instead of the public API (automated layout tests).
      demoCatalogue: false,
      // Admin data source: 'api' (Laravel) or 'mock' (in-memory prototype for tests/demos).
      adminDataSource: 'api',
      // Fallback showroom contact, used only if the API is unreachable. Manage the real
      // values under Admin → Website → Contact details.
      contact: {
        phone: '+254 700 000 000',
        whatsapp: '254700000000',
        email: 'hello@carshowcase.example',
        address: 'Showroom address, Nairobi, Kenya',
        hours: 'Mon–Sat, 8:00 – 18:00',
      },
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
