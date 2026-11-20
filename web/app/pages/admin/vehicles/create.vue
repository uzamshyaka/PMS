<script setup lang="ts">
import type { VehicleInput } from '~/types/admin'

definePageMeta({ layout: 'admin', permission: PERMISSIONS.vehicles, title: 'Add vehicle', section: { label: 'Vehicles', to: '/admin/vehicles' } })

const services = useAdminServices()
const { run } = useAdminFeedback()
const saving = ref(false)

async function save(input: VehicleInput, intent: 'draft' | 'submit' | 'save') {
  saving.value = true
  const vehicle = await run(
    () => services.vehicles.create(input, intent === 'submit' ? 'submit' : 'draft'),
    intent === 'submit' ? 'Vehicle submitted for approval' : 'Vehicle saved as draft',
  )
  saving.value = false
  if (vehicle) await navigateTo(`/admin/vehicles/${vehicle.id}`)
}
</script>

<template>
  <div>
    <AdminPageHeader title="Add a vehicle" description="Save a draft at any time, or complete every step and submit it for approval." />
    <AdminVehicleForm mode="create" :saving="saving" @submit="save" />
  </div>
</template>
