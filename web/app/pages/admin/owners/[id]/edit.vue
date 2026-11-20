<script setup lang="ts">
import type { OwnerInput } from '~/types/admin'

definePageMeta({ layout: 'admin', permission: PERMISSIONS.vehicles, title: 'Edit owner', section: { label: 'Owners', to: '/admin/owners' } })

const id = Number(useRoute().params.id)
const services = useAdminServices()
const { toast } = useAdminFeedback()
const saving = ref(false)
const serverErrors = ref<Record<string, string[]>>({})

const { data: owner, error, refresh } = useAsyncData(`admin-owner-edit-${id}`, () => services.owners.get(id), { server: false })
useAdminTitle(() => (owner.value ? `Edit ${owner.value.name}` : undefined))

const initial = computed<OwnerInput | undefined>(() => {
  if (!owner.value) return undefined
  const { id: _id, createdAt: _c, vehicleCount: _v, ...input } = owner.value
  return input
})

async function save(input: OwnerInput) {
  saving.value = true
  try {
    await services.owners.update(id, input)
    toast('Owner updated')
    await navigateTo(`/admin/owners/${id}`)
  }
  catch (e) {
    const err = toApiError(e)
    serverErrors.value = err.errors
    toast(err.message, 'error')
  }
  finally { saving.value = false }
}
</script>

<template>
  <div>
    <AdminErrorState v-if="error" :error="error" @retry="refresh" />
    <AdminLoadingState v-else-if="!initial" />
    <template v-else>
      <AdminPageHeader :title="`Edit ${owner?.name}`" />
      <AdminOwnerForm :initial="initial" submit-label="Save changes" :saving="saving" :server-errors="serverErrors" @submit="save" />
    </template>
  </div>
</template>
