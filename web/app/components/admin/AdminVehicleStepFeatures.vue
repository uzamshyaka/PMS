<script setup lang="ts">
import type { VehicleFeature, VehicleInput } from '~/types/admin'

const props = defineProps<{ form: VehicleInput, features: VehicleFeature[] }>()

const search = ref('')
const grouped = computed(() => {
  const term = search.value.toLowerCase().trim()
  const groups = new Map<string, VehicleFeature[]>()
  for (const f of props.features) {
    if (term && !f.name.toLowerCase().includes(term)) continue
    groups.set(f.category, [...(groups.get(f.category) ?? []), f])
  }
  return [...groups.entries()]
})

function toggle(id: number) {
  const ids = props.form.featureIds
  const i = ids.indexOf(id)
  if (i === -1) ids.push(id)
  else ids.splice(i, 1)
}
</script>

<template>
  <AdminCard title="Features" :description="`${form.featureIds.length} selected`">
    <label class="relative mb-5 block sm:w-80">
      <span class="sr-only">Search features</span>
      <UiIcon name="search" class="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
      <input v-model="search" type="search" class="admin-input pl-9" placeholder="Search features…" data-test="feature-search">
    </label>
    <div v-if="grouped.length" class="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
      <fieldset v-for="[category, items] in grouped" :key="category">
        <legend class="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-500">{{ category }}</legend>
        <div class="space-y-1.5">
          <label v-for="f in items" :key="f.id" class="flex cursor-pointer items-center gap-2.5 rounded-md px-2 py-1 text-sm hover:bg-slate-50">
            <input type="checkbox" class="h-4 w-4 rounded border-slate-300 accent-ink" :checked="form.featureIds.includes(f.id)" @change="toggle(f.id)">
            {{ f.name }}
          </label>
        </div>
      </fieldset>
    </div>
    <p v-else class="text-sm text-slate-500">No features match "{{ search }}".</p>
  </AdminCard>
</template>
