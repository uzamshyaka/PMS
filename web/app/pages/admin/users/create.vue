<script setup lang="ts">
import type { AdminUserInput } from '~/types/admin'

definePageMeta({ layout: 'admin', permission: PERMISSIONS.users, title: 'Add user', section: { label: 'Users & Roles', to: '/admin/users' } })

const services = useAdminServices()
const { toast } = useAdminFeedback()
const saving = ref(false)
const serverErrors = ref<Record<string, string[]>>({})

async function save(input: AdminUserInput) {
  saving.value = true
  try {
    const user = await services.users.create(input)
    toast('User added')
    await navigateTo(`/admin/users/${user.id}`)
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
    <AdminPageHeader title="Add a user" />
    <AdminUserForm submit-label="Add user" :saving="saving" :server-errors="serverErrors" @submit="save" />
  </div>
</template>
