<script setup lang="ts">
// Site name, accent colour and default SEO come from Admin → Website (branding, SEO).
const site = useSiteContent()
const appName = site.branding.siteName

useHead({
  titleTemplate: (title?: string) => (title ? `${title} · ${appName}` : appName),
  style: /^#[0-9a-fA-F]{6}$/.test(site.branding.accentColour) ? [{ key: 'brand-accent', innerHTML: `:root{--color-bronze:${site.branding.accentColour}}` }] : [],
})
useSeoMeta({
  description: site.seo.metaDescription,
  ogTitle: site.seo.metaTitle,
  ogDescription: site.seo.metaDescription,
  ogImage: site.seo.ogImageUrl || undefined,
})
</script>

<template>
  <NuxtRouteAnnouncer />
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>
