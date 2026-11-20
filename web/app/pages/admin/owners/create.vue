<script setup lang="ts">
import type { OwnerInput } from '~/types/admin'

definePageMeta({ layout: 'admin', permission: PERMISSIONS.vehicles, title: 'Add owner', section: { label: 'Owners', to: '/admin/owners' } })

const services = useAdminServices()
const { toast } = useAdminFeedback()
const saving = ref(false)
const serverErrors = ref<Record<string, string[]>>({})

async function save(input: OwnerInput) {
  saving.value = true
  try {
    const owner = await services.owners.create(input)
    toast('Owner added')
    await navigateTo(`/admin/owners/${owner.id}`)
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
    <AdminPageHeader title="Add an owner" />
    <AdminOwnerForm submit-label="Add owner" :saving="saving" :server-errors="serverErrors" @submit="save" />
  </div>
</template>
