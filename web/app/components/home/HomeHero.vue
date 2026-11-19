<template>
  <section class="relative isolate overflow-hidden bg-ink text-white" aria-labelledby="hero-title" data-test="hero">
    <!-- Photo: public/images/hero.webp (2400x1350). Falls back to a CSS showroom. -->
    <UiImage
      src="/images/hero.webp"
      alt="A premium vehicle in a dark, glass-walled showroom"
      eager
      class="absolute inset-0 -z-20"
      img-class="object-[50%_70%]"
    >
      <template #fallback><SiteShowroomBackdrop class="absolute inset-0" /></template>
    </UiImage>
    <div class="absolute inset-0 -z-10 bg-gradient-to-b from-black/45 via-black/20 to-black/60" aria-hidden="true" />

    <div class="container-site flex h-[clamp(560px,78vh,760px)] flex-col items-center pt-10 text-center sm:pt-14">
      <p class="label-caps text-white/85">Quality cars. Trusted service.</p>
      <span class="mt-4 h-px w-14 bg-bronze" aria-hidden="true" />

      <h1 id="hero-title" class="mt-6 leading-none">
        <span class="block font-display text-[clamp(56px,9vw,112px)] font-extrabold uppercase tracking-[0.02em]">Drive</span>
        <span class="-mt-[0.32em] block font-script text-[clamp(68px,10.5vw,136px)] font-normal leading-[1.1] text-bronze-soft [text-shadow:0_4px_24px_rgba(0,0,0,0.5)]">
          Excellence
        </span>
      </h1>

      <p class="mt-4 max-w-md text-[15px] leading-relaxed text-white/85 sm:text-base">
        Discover quality vehicles selected for your next journey.
      </p>

      <UiButton to="/inventory" variant="light" arrow class="mt-8">Browse Inventory</UiButton>
    </div>
  </section>
</template>
