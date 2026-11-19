<script setup lang="ts">
withDefaults(defineProps<{ tone?: 'dark' | 'light' }>(), { tone: 'dark' })
const { appName } = useRuntimeConfig().public
</script>

<template>
  <NuxtLink to="/" class="flex items-center gap-3" :class="tone === 'dark' ? 'text-ink' : 'text-white'" :aria-label="`${appName} home`">
    <!-- Original mark: an open "C" arc enclosing a road line. -->
    <svg viewBox="0 0 40 40" class="h-10 w-10 shrink-0" fill="none" aria-hidden="true">
      <path d="M31 9.5A15 15 0 1 0 31 30.5" stroke="currentColor" stroke-width="3.2" stroke-linecap="square" />
      <path d="M14 20h18" stroke="#b08d57" stroke-width="2.4" />
      <path d="M22 15.5h10M22 24.5h10" stroke="currentColor" stroke-width="1.4" />
    </svg>
    <span class="whitespace-nowrap leading-none">
      <span class="block font-display text-[15px] font-bold uppercase tracking-[0.18em] sm:text-[17px] sm:tracking-[0.22em]">Car Showcase</span>
      <span class="mt-1 block text-[9px] font-semibold uppercase tracking-[0.42em] opacity-70">Quality Vehicles</span>
    </span>
  </NuxtLink>
</template>
