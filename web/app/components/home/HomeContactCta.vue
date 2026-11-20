<script setup lang="ts">
const contact = useShowroomContact()
</script>

<template>
  <section class="relative isolate overflow-hidden bg-carbon text-white" aria-labelledby="cta-title">
    <SiteShowroomBackdrop class="absolute inset-0 -z-10 opacity-70" />
    <div class="container-site flex flex-col items-start gap-8 py-16 md:flex-row md:items-center md:justify-between">
      <div>
        <span class="block h-px w-14 bg-bronze" aria-hidden="true" />
        <h2 id="cta-title" class="mt-5 font-display text-2xl font-bold uppercase tracking-[0.04em] sm:text-3xl">Visit or contact us</h2>
        <p class="mt-3 max-w-lg text-white/70">Questions about a vehicle or want to arrange a viewing? Our showroom team is happy to help.</p>
      </div>
      <div class="flex flex-wrap gap-3">
        <UiButton :href="contact.telHref" variant="light">
          <UiIcon name="phone" class="h-4 w-4" /> Call Us
        </UiButton>
        <UiButton to="/contact" variant="outline-light" arrow>Contact</UiButton>
      </div>
    </div>
  </section>
</template>
