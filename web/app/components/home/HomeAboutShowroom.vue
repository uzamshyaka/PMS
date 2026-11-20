<template>
  <section class="bg-mist" aria-labelledby="about-title">
    <div class="container-site grid items-center gap-10 py-20 lg:grid-cols-2 lg:gap-16">
      <UiImage src="/images/showroom.webp" alt="Inside our showroom" class="relative aspect-[4/3] bg-carbon">
        <template #fallback><SiteShowroomBackdrop class="absolute inset-0" /></template>
      </UiImage>
      <div>
        <p class="label-caps flex items-center gap-4">About the showroom <span class="h-px w-10 bg-bronze" /></p>
        <h2 id="about-title" class="mt-2 font-display text-2xl font-bold uppercase tracking-[0.04em] sm:text-[28px]">
          A showroom built on trust
        </h2>
        <p class="mt-5 leading-relaxed text-muted">
          Every vehicle we present is listed with clear specifications, honest condition notes and
          the inspection information available for it, so you know exactly what you are looking at.
        </p>
        <p class="mt-4 leading-relaxed text-muted">
          Take your time online, then visit us to see the car in person and speak to our team.
        </p>
        <UiButton to="/about" variant="outline" size="sm" arrow class="mt-8">More About Us</UiButton>
      </div>
    </div>
  </section>
</template>
