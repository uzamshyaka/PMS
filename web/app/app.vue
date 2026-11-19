<script setup lang="ts">
const { appName } = useRuntimeConfig().public

useHead({
  titleTemplate: (title?: string) => (title ? `${title} · ${appName}` : appName),
})
</script>

<template>
  <NuxtRouteAnnouncer />
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>
