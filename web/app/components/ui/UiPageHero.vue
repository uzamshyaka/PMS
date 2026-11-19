<script setup lang="ts">
defineProps<{ eyebrow: string, title: string, intro?: string, image?: string }>()
</script>

<template>
  <section class="relative isolate overflow-hidden bg-ink text-white">
    <UiImage v-if="image" :src="image" alt="" eager class="absolute inset-0 -z-10" img-class="opacity-60">
      <template #fallback><SiteShowroomBackdrop class="absolute inset-0" /></template>
    </UiImage>
    <SiteShowroomBackdrop v-else class="absolute inset-0 -z-10" />
    <div class="absolute inset-0 -z-10 bg-gradient-to-b from-black/50 to-black/80" aria-hidden="true" />
    <div class="container-site flex min-h-[260px] flex-col justify-end pb-12 pt-20 sm:min-h-[300px]">
      <p class="label-caps text-white/75">{{ eyebrow }}</p>
      <h1 class="mt-3 font-display text-3xl font-bold uppercase tracking-[0.04em] sm:text-5xl">{{ title }}</h1>
      <p v-if="intro" class="mt-4 max-w-2xl text-white/75">{{ intro }}</p>
    </div>
  </section>
</template>
