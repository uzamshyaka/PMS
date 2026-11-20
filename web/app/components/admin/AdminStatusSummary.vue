<script setup lang="ts">
import type { VehicleStatus } from '~/types/admin'

/**
 * Listing status summary: one series (vehicle count per status) as a
 * horizontal bar list. Single hue, values as text beside each bar (doubles as
 * the table view), each row links to the filtered vehicle list.
 */
const props = defineProps<{ counts: Record<VehicleStatus, number>, linkable: boolean }>()

const max = computed(() => Math.max(1, ...Object.values(props.counts)))
const total = computed(() => Object.values(props.counts).reduce((a, b) => a + b, 0))
const NuxtLink = resolveComponent('NuxtLink')
</script>

<template>
  <figure data-test="status-summary">
    <figcaption class="sr-only">Number of vehicles in each listing status, {{ total }} in total.</figcaption>
    <ul class="space-y-2.5">
      <li v-for="s in VEHICLE_STATUSES" :key="s.value">
        <component
          :is="linkable ? NuxtLink : 'div'"
          :to="linkable ? { path: '/admin/vehicles', query: { status: s.value } } : undefined"
          class="group grid grid-cols-[8.5rem_minmax(0,1fr)_2.5rem] items-center gap-3 rounded-md px-1 py-1"
          :class="linkable && 'hover:bg-slate-50'"
          :title="`${s.label}: ${counts[s.value]} of ${total} vehicles`"
        >
          <span class="truncate text-sm text-slate-600">{{ s.label }}</span>
          <span class="h-2 rounded-full bg-slate-100" aria-hidden="true">
            <span class="block h-2 rounded-full bg-[#8a6d3b] transition-[width] group-hover:bg-ink" :style="{ width: `${(counts[s.value] / max) * 100}%`, minWidth: counts[s.value] ? '4px' : '0' }" />
          </span>
          <span class="text-right text-sm font-semibold tabular-nums text-slate-900">{{ counts[s.value] }}</span>
        </component>
      </li>
    </ul>
  </figure>
</template>
