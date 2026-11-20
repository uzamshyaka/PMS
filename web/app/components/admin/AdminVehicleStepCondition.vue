<script setup lang="ts">
import type { InspectionSource } from '~/types/vehicle'
import type { VehicleInput } from '~/types/admin'

const props = defineProps<{ form: VehicleInput }>()

const SOURCES: { value: InspectionSource, label: string, hint: string }[] = [
  { value: 'owner_declared', label: 'Declared by owner', hint: 'What the owner told us; not checked by our team.' },
  { value: 'admin_recorded', label: 'Recorded by our team', hint: 'Checked by our staff during intake.' },
  { value: 'independently_verified', label: 'Independent inspection', hint: 'Shows "Verified" only with a report attached.' },
]

const today = new Date().toISOString().slice(0, 10)

function add() {
  props.form.inspections.push({ source: 'admin_recorded', title: '', date: today, summary: '', hasEvidence: false })
}
</script>

<template>
  <div class="space-y-6">
    <AdminCard title="Condition notes" description="Known wear, damage or anything a buyer should know.">
      <textarea v-model.trim="form.conditionNotes" rows="4" class="admin-input" aria-label="Condition notes" name="conditionNotes" />
    </AdminCard>

    <AdminCard title="Inspection records" description="Each record states who stands behind it.">
      <template #actions><AdminButton icon="plus" data-test="add-inspection" @click="add">Add inspection</AdminButton></template>
      <p v-if="!form.inspections.length" class="text-sm text-slate-500">No inspection records yet.</p>
      <ol class="space-y-4">
        <li v-for="(insp, i) in form.inspections" :key="i" class="rounded-lg border border-line p-4" data-test="inspection-row">
          <div class="grid gap-4 sm:grid-cols-3">
            <AdminField v-slot="{ id }" label="Source of information" required>
              <select :id="id" v-model="insp.source" class="admin-input">
                <option v-for="s in SOURCES" :key="s.value" :value="s.value">{{ s.label }}</option>
              </select>
            </AdminField>
            <AdminField v-slot="{ id }" label="Title" required>
              <input :id="id" v-model.trim="insp.title" class="admin-input" placeholder="e.g. Pre-sale inspection">
            </AdminField>
            <AdminField v-slot="{ id }" label="Inspection date" required>
              <input :id="id" v-model="insp.date" type="date" :max="today" class="admin-input">
            </AdminField>
            <AdminField v-slot="{ id }" label="Summary" required class="sm:col-span-2">
              <input :id="id" v-model.trim="insp.summary" class="admin-input">
            </AdminField>
            <AdminField v-if="insp.source === 'independently_verified'" v-slot="{ id }" label="Inspector / organisation">
              <input :id="id" v-model.trim="insp.inspector" class="admin-input">
            </AdminField>
          </div>
          <div class="mt-3 flex flex-wrap items-center justify-between gap-3">
            <p class="text-xs text-slate-500">{{ SOURCES.find((s) => s.value === insp.source)?.hint }}</p>
            <div class="flex items-center gap-4">
              <label v-if="insp.source === 'independently_verified'" class="flex items-center gap-2 text-sm">
                <input v-model="insp.hasEvidence" type="checkbox" class="h-4 w-4 accent-ink"> Report attached
              </label>
              <button type="button" class="text-sm text-rose-600 hover:underline" @click="form.inspections.splice(i, 1)">Remove</button>
            </div>
          </div>
        </li>
      </ol>
    </AdminCard>
  </div>
</template>
