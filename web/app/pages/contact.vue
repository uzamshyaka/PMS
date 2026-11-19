<script setup lang="ts">
import type { IconName } from '~/utils/icons'

const contact = useShowroomContact()

useSeoMeta({
  title: 'Contact',
  description: 'Contact our showroom team by phone, WhatsApp or email, or visit us in person.',
})

const CHANNELS: { icon: IconName, label: string, value: string, href?: string }[] = [
  { icon: 'phone', label: 'Phone', value: contact.phone, href: contact.telHref },
  { icon: 'whatsapp', label: 'WhatsApp', value: contact.phone, href: contact.whatsappHref() },
  { icon: 'mail', label: 'Email', value: contact.email, href: contact.mailHref },
  { icon: 'pin', label: 'Showroom', value: contact.address },
  { icon: 'clock', label: 'Opening hours', value: contact.hours },
]
</script>

<template>
  <div>
    <UiPageHero eyebrow="Contact" title="Speak to our team" intro="Questions about a vehicle or want to arrange a viewing? Get in touch." />

    <section class="container-site grid gap-12 py-20 lg:grid-cols-[1fr_1.2fr] lg:gap-16">
      <div>
        <p class="label-caps flex items-center gap-4">Get in touch <span class="h-px w-10 bg-bronze" /></p>
        <h2 class="mt-2 font-display text-2xl font-bold uppercase tracking-[0.04em] sm:text-[28px]">We're here to help</h2>
        <p class="mt-5 leading-relaxed text-muted">
          Call or message us about any vehicle in our inventory. Mention the vehicle name so we can help you quickly.
        </p>
        <div class="mt-8 flex flex-wrap gap-3">
          <UiButton :href="contact.telHref"><UiIcon name="phone" class="h-4 w-4" /> Call Us</UiButton>
          <UiButton :href="contact.whatsappHref()" variant="outline" target="_blank" rel="noopener"><UiIcon name="whatsapp" class="h-4 w-4" /> WhatsApp</UiButton>
        </div>
      </div>

      <ul class="divide-y divide-line border-y border-line">
        <li v-for="channel in CHANNELS" :key="channel.label" class="flex items-start gap-5 py-5">
          <UiIcon :name="channel.icon" class="mt-0.5 h-6 w-6 shrink-0 text-bronze" />
          <div class="min-w-0">
            <p class="label-caps text-[10px] text-muted">{{ channel.label }}</p>
            <a v-if="channel.href" :href="channel.href" class="mt-1 block break-words font-semibold hover:underline" :target="channel.icon === 'whatsapp' ? '_blank' : undefined" :rel="channel.icon === 'whatsapp' ? 'noopener' : undefined">{{ channel.value }}</a>
            <p v-else class="mt-1 font-semibold">{{ channel.value }}</p>
          </div>
        </li>
      </ul>
    </section>
  </div>
</template>
