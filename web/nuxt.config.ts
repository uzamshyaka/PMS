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
    public: {
      apiBase: 'http://localhost:8081',
      appName: 'Car Showcase',
      // Serve the labelled demonstration vehicles until the public API exists.
      demoCatalogue: true,
      // Showroom (business) contact. PLACEHOLDER values: replace before going live.
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
