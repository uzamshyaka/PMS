<script setup lang="ts">
withDefaults(defineProps<{ eyebrow?: string, title: string, tone?: 'dark' | 'light', as?: 'h1' | 'h2' }>(), {
  tone: 'dark',
  as: 'h2',
})
</script>

<template>
  <div class="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
    <div>
      <p v-if="eyebrow" class="label-caps flex items-center gap-4" :class="tone === 'dark' ? 'text-ink' : 'text-white/80'">
        {{ eyebrow }}
        <span class="h-px w-10 bg-bronze" aria-hidden="true" />
      </p>
      <component
        :is="as"
        class="mt-2 font-display text-2xl font-bold uppercase tracking-[0.04em] sm:text-[28px]"
        :class="tone === 'dark' ? 'text-ink' : 'text-white'"
      >
        {{ title }}
      </component>
    </div>
    <div v-if="$slots.action" class="shrink-0">
      <slot name="action" />
    </div>
  </div>
</template>
