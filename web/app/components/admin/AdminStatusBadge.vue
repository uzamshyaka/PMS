<script setup lang="ts">
/** One badge for every admin status: vehicle, enquiry, owner/user active state. */
const props = defineProps<{ status: string }>()

const STYLES: Record<string, [string, string]> = {
  draft: ['Draft', 'bg-slate-100 text-slate-700 ring-slate-200'],
  pending_approval: ['Pending Approval', 'bg-amber-50 text-amber-800 ring-amber-200'],
  published: ['Published', 'bg-emerald-50 text-emerald-800 ring-emerald-200'],
  rejected: ['Rejected', 'bg-rose-50 text-rose-700 ring-rose-200'],
  sold: ['Sold', 'bg-sky-50 text-sky-800 ring-sky-200'],
  unavailable: ['Unavailable', 'bg-orange-50 text-orange-800 ring-orange-200'],
  archived: ['Archived', 'bg-slate-100 text-slate-500 ring-slate-200'],
  new: ['New', 'bg-sky-50 text-sky-800 ring-sky-200'],
  contacted: ['Contacted', 'bg-emerald-50 text-emerald-800 ring-emerald-200'],
  follow_up: ['Follow-up Required', 'bg-amber-50 text-amber-800 ring-amber-200'],
  closed: ['Closed', 'bg-slate-100 text-slate-600 ring-slate-200'],
  active: ['Active', 'bg-emerald-50 text-emerald-800 ring-emerald-200'],
  inactive: ['Inactive', 'bg-slate-100 text-slate-500 ring-slate-200'],
}

const style = computed(() => STYLES[props.status] ?? [props.status, 'bg-slate-100 text-slate-700 ring-slate-200'])
</script>

<template>
  <span class="inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset" :class="style[1]" data-test="status-badge">
    <span class="h-1.5 w-1.5 rounded-full bg-current opacity-70" aria-hidden="true" />{{ style[0] }}
  </span>
</template>
