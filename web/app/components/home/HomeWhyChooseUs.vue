<script setup lang="ts">
const POINTS = [
  { n: '01', title: 'Clear information', text: 'Specifications, condition and inspection details are shown up front, with who recorded each one.' },
  { n: '02', title: 'Reviewed listings', text: 'Every listing is reviewed by our team before it appears on the website.' },
  { n: '03', title: 'Direct contact', text: 'Call or message the showroom about any vehicle. No accounts or sign-ups needed.' },
]
</script>

<template>
  <section class="container-site py-20" aria-labelledby="why-title">
    <UiSectionHeading eyebrow="Why choose us" title="Buying made simple" />
    <ol class="mt-10 grid gap-px overflow-hidden border border-line bg-line md:grid-cols-3">
      <li v-for="point in POINTS" :key="point.n" class="bg-white p-8">
        <span class="font-display text-sm font-bold text-bronze">{{ point.n }}</span>
        <h3 class="mt-4 font-display text-base font-bold uppercase tracking-[0.06em]">{{ point.title }}</h3>
        <p class="mt-3 text-sm leading-relaxed text-muted">{{ point.text }}</p>
      </li>
    </ol>
  </section>
</template>
