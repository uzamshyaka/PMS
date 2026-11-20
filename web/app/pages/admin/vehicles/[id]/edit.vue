<script setup lang="ts">
import type { VehicleInput } from '~/types/admin'

definePageMeta({ layout: 'admin', permission: PERMISSIONS.vehicles, title: 'Edit vehicle', section: { label: 'Vehicles', to: '/admin/vehicles' } })

const route = useRoute()
const id = Number(route.params.id)
const services = useAdminServices()
const { run } = useAdminFeedback()
const saving = ref(false)

const { data: vehicle, error, refresh } = useAsyncData(`admin-vehicle-edit-${id}`, () => services.vehicles.get(id), { server: false })
useAdminTitle(() => (vehicle.value ? `Edit ${vehicle.value.reference}` : undefined))

const editable = computed(() => !!vehicle.value && canTransition(vehicle.value.status, 'edit'))
const initial = computed(() => (vehicle.value ? toVehicleInput(vehicle.value) : undefined))

async function save(input: VehicleInput, intent: 'draft' | 'submit' | 'save') {
  saving.value = true
  const updated = await run(() => services.vehicles.update(id, input, intent === 'submit' ? 'submit' : 'save'), intent === 'submit' ? 'Changes submitted for approval' : 'Changes saved')
  saving.value = false
  if (updated) await navigateTo(`/admin/vehicles/${id}`)
}
</script>

<template>
  <div>
    <AdminErrorState v-if="error" :error="error" @retry="refresh" />
    <AdminLoadingState v-else-if="!vehicle" />
    <template v-else>
      <AdminPageHeader :title="vehicle.title">
        <template #meta><div class="mt-2 flex items-center gap-2 text-sm text-slate-500">{{ vehicle.reference }} <AdminStatusBadge :status="vehicle.status" /></div></template>
      </AdminPageHeader>
      <UiAlert v-if="!editable">A {{ vehicleStatusLabel(vehicle.status).toLowerCase() }} vehicle cannot be edited.</UiAlert>
      <AdminVehicleForm
        v-else-if="initial"
        mode="edit"
        :initial="initial"
        :saving="saving"
        :can-submit="vehicle.status === 'draft' || vehicle.status === 'rejected'"
        :will-require-review="vehicle.status === 'published' || vehicle.status === 'unavailable'"
        @submit="save"
      />
    </template>
  </div>
</template>
