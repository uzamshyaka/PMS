<script setup lang="ts">
import type { RouteLocationRaw } from 'vue-router'
import type { IconName } from '~/utils/icons'

defineProps<{ label: string, value: number | string | undefined, icon: IconName, to?: RouteLocationRaw, hint?: string }>()
const NuxtLink = resolveComponent('NuxtLink')
</script>

<template>
  <component :is="to ? NuxtLink : 'div'" :to="to" class="group flex items-start justify-between rounded-xl border border-line bg-white p-5 shadow-card transition-colors" :class="to && 'hover:border-slate-300'" data-test="stat-card">
    <div>
      <p class="text-xs font-semibold uppercase tracking-wider text-slate-500">{{ label }}</p>
      <p class="mt-2 text-2xl font-semibold tabular-nums text-slate-900">{{ value ?? '—' }}</p>
      <p v-if="hint" class="mt-1 text-xs text-slate-500">{{ hint }}</p>
    </div>
    <span class="flex h-10 w-10 items-center justify-center rounded-lg bg-mist text-bronze ring-1 ring-line"><UiIcon :name="icon" class="h-5 w-5" /></span>
  </component>
</template>
