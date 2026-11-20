<script setup lang="ts">
import type { RouteLocationRaw } from 'vue-router'
import type { IconName } from '~/utils/icons'

/** Compact admin button (the public site uses UiButton's showroom styling). */
const props = withDefaults(defineProps<{
  to?: RouteLocationRaw
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost'
  icon?: IconName
  type?: 'button' | 'submit'
  loading?: boolean
  disabled?: boolean
}>(), { variant: 'secondary', type: 'button' })

const NuxtLink = resolveComponent('NuxtLink')
const VARIANTS = {
  primary: 'bg-ink text-white hover:bg-graphite border border-ink',
  secondary: 'bg-white text-slate-700 border border-slate-300 hover:bg-slate-50',
  danger: 'bg-rose-600 text-white border border-rose-600 hover:bg-rose-700',
  ghost: 'text-slate-600 hover:bg-slate-100 border border-transparent',
} as const
</script>

<template>
  <component
    :is="props.to ? NuxtLink : 'button'"
    :to="props.to"
    :type="props.to ? undefined : props.type"
    :disabled="props.to ? undefined : props.disabled || props.loading"
    class="inline-flex items-center justify-center gap-2 rounded-lg px-3.5 py-2 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50"
    :class="VARIANTS[props.variant]"
  >
    <svg v-if="props.loading" class="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none" aria-hidden="true"><circle cx="12" cy="12" r="9" stroke="currentColor" stroke-opacity=".25" stroke-width="3" /><path d="M21 12a9 9 0 0 0-9-9" stroke="currentColor" stroke-width="3" /></svg>
    <UiIcon v-else-if="props.icon" :name="props.icon" class="h-4 w-4" />
    <slot />
  </component>
</template>
