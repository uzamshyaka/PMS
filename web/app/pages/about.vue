<script setup lang="ts">
useSeoMeta({
  title: 'About Us',
  description: 'Who we are and how we present every vehicle: clear specifications, honest condition notes and transparent inspection information.',
})

const VALUES = [
  { title: 'Honesty first', text: 'We show who recorded each piece of information: the owner, our team or an independent inspector.' },
  { title: 'Reviewed listings', text: 'Every listing is reviewed before it is published, and changes are reviewed again.' },
  { title: 'No pressure', text: 'Browse at your own pace and contact us when you are ready.' },
]
</script>

<template>
  <div>
    <UiPageHero eyebrow="About us" title="Quality vehicles, clearly presented" image="/images/about-hero.webp" />

    <section class="container-site grid gap-12 py-20 lg:grid-cols-2 lg:gap-16">
      <div>
        <p class="label-caps flex items-center gap-4">Our story <span class="h-px w-10 bg-bronze" /></p>
        <h2 class="mt-2 font-display text-2xl font-bold uppercase tracking-[0.04em] sm:text-[28px]">A better way to find your next car</h2>
        <p class="mt-5 leading-relaxed text-muted">
          Car Showcase presents quality vehicles with the information buyers actually need: clear
          specifications, honest condition notes and transparent inspection details.
        </p>
        <p class="mt-4 leading-relaxed text-muted">
          Our team prepares and reviews every listing before it goes live, so what you see online is
          what you will find in the showroom.
        </p>
      </div>
      <UiImage src="/images/showroom.webp" alt="Inside our showroom" class="relative aspect-[4/3] bg-carbon">
        <template #fallback><SiteShowroomBackdrop class="absolute inset-0" /></template>
      </UiImage>
    </section>

    <section class="bg-mist">
      <div class="container-site py-20">
        <UiSectionHeading eyebrow="What we stand for" title="Our values" />
        <ul class="mt-10 grid gap-6 md:grid-cols-3">
          <li v-for="value in VALUES" :key="value.title" class="border-t-2 border-bronze bg-white p-8">
            <h3 class="font-display text-base font-bold uppercase tracking-[0.06em]">{{ value.title }}</h3>
            <p class="mt-3 text-sm leading-relaxed text-muted">{{ value.text }}</p>
          </li>
        </ul>
      </div>
    </section>

    <HomeContactCta />
  </div>
</template>
