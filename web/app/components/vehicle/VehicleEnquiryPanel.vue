<script setup lang="ts">
import type { PublicVehicle } from '~/types/vehicle'

const props = defineProps<{ vehicle: PublicVehicle }>()
const contact = useShowroomContact()

// Business contact only. Owner details are never shown on the public site.
const whatsapp = computed(() =>
  contact.whatsappHref(
    `Hello, I'm interested in the ${props.vehicle.year} ${vehicleTitle(props.vehicle)} in ${props.vehicle.location}`
    + `${props.vehicle.payment === 'lipa-mdogo-mdogo' ? ' on Lipa Mdogo Mdogo' : ''} (ref: ${props.vehicle.slug}).`,
  ),
)
</script>

<template>
  <aside class="bg-ink p-6 text-white sm:p-8" aria-labelledby="enquiry-title" data-test="enquiry-panel">
    <p class="label-caps text-bronze">Enquire</p>
    <h2 id="enquiry-title" class="mt-2 font-display text-xl font-bold uppercase tracking-[0.04em]">Interested in this vehicle?</h2>
    <p class="mt-3 text-sm leading-relaxed text-white/70">Speak to our showroom team to ask questions or arrange a viewing.</p>

    <div class="mt-6 grid gap-3">
      <UiButton :href="contact.telHref" variant="light" class="w-full" data-test="call">
        <UiIcon name="phone" class="h-4 w-4" /> Call {{ contact.phone }}
      </UiButton>
      <UiButton :href="whatsapp" variant="outline-light" class="w-full" target="_blank" rel="noopener" data-test="whatsapp">
        <UiIcon name="whatsapp" class="h-4 w-4" /> WhatsApp Us
      </UiButton>
    </div>
    <p class="mt-5 flex items-center gap-2 text-xs text-white/50"><UiIcon name="clock" class="h-4 w-4" />{{ contact.hours }}</p>
  </aside>
</template>
