<script setup lang="ts">
withDefaults(defineProps<{ tone?: 'dark' | 'neutral' | 'bronze' | 'bronze-solid' | 'success' }>(), { tone: 'neutral' })

const TONES = {
  'dark': 'bg-ink/85 text-white',
  'neutral': 'bg-mist text-ink ring-1 ring-line',
  'bronze': 'bg-bronze/10 text-[#7a5f35] ring-1 ring-bronze/40',
  'bronze-solid': 'bg-bronze text-white',
  'success': 'bg-emerald-50 text-emerald-800 ring-1 ring-emerald-200',
} as const
</script>

<template>
  <span class="inline-flex items-center gap-1.5 rounded-sm px-2 py-1 text-[11px] font-semibold uppercase tracking-[0.08em]" :class="TONES[tone]">
    <slot />
  </span>
</template>
