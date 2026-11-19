<script setup lang="ts">
const config = useRuntimeConfig()
</script>

<template>
  <div class="flex min-h-screen flex-col">
    <header class="border-b border-slate-200 bg-white">
      <div class="mx-auto flex h-16 max-w-6xl items-center px-4">
        <NuxtLink to="/" class="text-lg font-semibold text-slate-900">{{ config.public.appName }}</NuxtLink>
      </div>
    </header>
    <main class="mx-auto w-full max-w-6xl flex-1 px-4 py-10">
      <slot />
    </main>
    <footer class="border-t border-slate-200 bg-white py-6 text-center text-sm text-slate-500">
      © {{ new Date().getFullYear() }} {{ config.public.appName }}
    </footer>
  </div>
</template>
