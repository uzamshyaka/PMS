<script setup lang="ts">
import type { RouteLocationRaw } from 'vue-router'

const props = withDefaults(defineProps<{
  to?: RouteLocationRaw
  href?: string
  variant?: 'dark' | 'light' | 'outline' | 'outline-light'
  size?: 'sm' | 'md'
  arrow?: boolean
  type?: 'button' | 'submit'
}>(), { variant: 'dark', size: 'md', arrow: false, type: 'button' })

const NuxtLink = resolveComponent('NuxtLink')

const tag = computed(() => (props.to ? NuxtLink : props.href ? 'a' : 'button'))

const VARIANTS = {
  'dark': 'bg-ink text-white hover:bg-graphite',
  'light': 'bg-white text-ink hover:bg-mist',
  'outline': 'border border-ink/80 text-ink hover:bg-ink hover:text-white',
  'outline-light': 'border border-white/70 text-white hover:bg-white hover:text-ink',
} as const
</script>

<template>
  <component
    :is="tag"
    :to="to"
    :href="href"
    :type="tag === 'button' ? type : undefined"
    class="inline-flex items-center justify-center gap-3 font-semibold uppercase tracking-[0.12em] transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-bronze"
    :class="[VARIANTS[variant], size === 'sm' ? 'h-10 px-5 text-[11px]' : 'h-12 px-6 text-xs']"
  >
    <slot />
    <UiIcon v-if="arrow" name="arrow-right" class="h-4 w-4 shrink-0" />
  </component>
</template>
