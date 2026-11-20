<script setup lang="ts">
import type { Owner, VehicleInput, VehicleMake, VehicleModel } from '~/types/admin'

const props = defineProps<{
  form: VehicleInput
  errors: Record<string, string | undefined>
  options: { owners: Owner[], makes: VehicleMake[], models: VehicleModel[] }
}>()

const models = computed(() => props.options.models.filter((m) => m.makeId === props.form.makeId))
const years = Array.from({ length: new Date().getFullYear() + 2 - 1980 }, (_, i) => new Date().getFullYear() + 1 - i)
</script>

<template>
  <AdminCard title="Basic information" description="Who owns the vehicle and what it is.">
    <div class="grid gap-5 sm:grid-cols-2">
      <AdminField v-slot="{ id, invalid }" label="Owner" :error="errors.ownerId" required class="sm:col-span-2" hint="Owners are managed under Owners.">
        <select :id="id" v-model.number="form.ownerId" class="admin-input" :aria-invalid="invalid" name="ownerId">
          <option :value="null" disabled>Select owner…</option>
          <option v-for="o in options.owners" :key="o.id" :value="o.id">{{ o.name }} · {{ o.location }}</option>
        </select>
      </AdminField>
      <AdminField v-slot="{ id, invalid }" label="Make" :error="errors.makeId" required>
        <select :id="id" v-model.number="form.makeId" class="admin-input" :aria-invalid="invalid" name="makeId">
          <option :value="null" disabled>Select make…</option>
          <option v-for="m in options.makes" :key="m.id" :value="m.id">{{ m.name }}</option>
        </select>
      </AdminField>
      <AdminField v-slot="{ id, invalid }" label="Model" :error="errors.modelId" required :hint="form.makeId ? undefined : 'Choose a make first.'">
        <select :id="id" v-model.number="form.modelId" class="admin-input" :aria-invalid="invalid" :disabled="!form.makeId" name="modelId">
          <option :value="null" disabled>Select model…</option>
          <option v-for="m in models" :key="m.id" :value="m.id">{{ m.name }}</option>
        </select>
      </AdminField>
      <AdminField v-slot="{ id, invalid }" label="Manufacturing year" :error="errors.year" required>
        <select :id="id" v-model.number="form.year" class="admin-input" :aria-invalid="invalid" name="year">
          <option :value="null" disabled>Select year…</option>
          <option v-for="y in years" :key="y" :value="y">{{ y }}</option>
        </select>
      </AdminField>
      <AdminField v-slot="{ id, invalid }" label="Listing title" :error="errors.title" required hint="e.g. 2021 Toyota Land Cruiser Prado TX-L">
        <input :id="id" v-model.trim="form.title" class="admin-input" :aria-invalid="invalid" name="title" maxlength="120">
      </AdminField>
      <AdminField v-slot="{ id, invalid }" label="Description" :error="errors.description" required class="sm:col-span-2">
        <textarea :id="id" v-model.trim="form.description" rows="5" class="admin-input" :aria-invalid="invalid" name="description" />
      </AdminField>
    </div>
  </AdminCard>
</template>
