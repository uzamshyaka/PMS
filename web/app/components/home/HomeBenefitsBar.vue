<script setup lang="ts">
import type { IconName } from '~/utils/icons'

// Wording deliberately avoids implying every vehicle is independently verified.
const BENEFITS: { icon: IconName, title: [string, string], text: string }[] = [
  { icon: 'shield', title: ['Quality', 'Assured'], text: 'Inspection information and clear condition details.' },
  { icon: 'document', title: ['Transparent', 'Details'], text: 'Clear specifications and honest vehicle information.' },
  { icon: 'sparkle', title: ['Curated', 'Selection'], text: 'A carefully presented inventory of quality vehicles.' },
  { icon: 'headset', title: ['Customer', 'Support'], text: 'Friendly assistance with every vehicle enquiry.' },
]
</script>

<template>
  <section aria-label="Why buy from us" class="relative z-10 -mt-[60px] px-4 sm:-mt-[54px]" data-test="benefits">
    <ul
      class="mx-auto grid max-w-5xl grid-cols-2 rounded-xl bg-carbon text-white shadow-float ring-1 ring-white/5 lg:grid-cols-4"
    >
      <li
        v-for="(benefit, i) in BENEFITS"
        :key="benefit.icon"
        class="flex flex-col gap-3 px-4 py-5 sm:flex-row sm:gap-4 sm:px-6 sm:py-6"
        :class="[
          i % 2 === 1 && 'border-l border-graphite',
          i >= 2 && 'border-t border-graphite lg:border-t-0',
          i === 2 && 'lg:border-l',
        ]"
        data-test="benefit"
      >
        <UiIcon :name="benefit.icon" class="h-8 w-8 shrink-0 text-bronze sm:h-9 sm:w-9" />
        <div>
          <h3 class="font-display text-[12px] font-bold uppercase leading-snug tracking-[0.08em] sm:text-[13px]">
            {{ benefit.title[0] }}<br>{{ benefit.title[1] }}
          </h3>
          <p class="mt-2 text-[11px] leading-relaxed text-white/60 sm:text-xs">{{ benefit.text }}</p>
        </div>
      </li>
    </ul>
  </section>
</template>
