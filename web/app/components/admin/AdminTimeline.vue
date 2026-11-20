<script setup lang="ts">
import type { TimelineItem } from '~/types/admin-ui'

defineProps<{ items: TimelineItem[], empty?: string }>()

const DOT = { default: 'bg-slate-300', success: 'bg-emerald-500', danger: 'bg-rose-500', warning: 'bg-amber-500' } as const
const when = (iso: string) => new Intl.DateTimeFormat('en-GB', { dateStyle: 'medium', timeStyle: 'short', timeZone: 'Africa/Nairobi' }).format(new Date(iso))
</script>

<template>
  <ol v-if="items.length" class="relative space-y-5 border-l border-line pl-5" data-test="timeline">
    <li v-for="item in items" :key="item.id" class="relative">
      <span class="absolute -left-[25px] top-1.5 h-2.5 w-2.5 rounded-full ring-4 ring-white" :class="DOT[item.tone ?? 'default']" aria-hidden="true" />
      <p class="text-sm font-medium text-slate-900">{{ item.title }}</p>
      <p class="text-xs text-slate-500"><time :datetime="item.at">{{ when(item.at) }}</time><template v-if="item.actor"> · {{ item.actor }}</template></p>
      <p v-if="item.body" class="mt-1.5 rounded-lg bg-slate-50 px-3 py-2 text-sm text-slate-700">{{ item.body }}</p>
    </li>
  </ol>
  <p v-else class="text-sm text-slate-500">{{ empty ?? 'No history yet.' }}</p>
</template>
