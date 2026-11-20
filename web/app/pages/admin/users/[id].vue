<script setup lang="ts">
import type { AdminUserInput } from '~/types/admin'
import type { TimelineItem } from '~/types/admin-ui'

definePageMeta({ layout: 'admin', permission: PERMISSIONS.users, title: 'User', section: { label: 'Users & Roles', to: '/admin/users' } })

const id = Number(useRoute().params.id)
const auth = useAuthStore()
const services = useAdminServices()
const { toast } = useAdminFeedback()
const saving = ref(false)
const serverErrors = ref<Record<string, string[]>>({})
const formKey = ref(0)

const { data, error, refresh } = useAsyncData(`admin-user-${id}`, async () => {
  const user = await services.users.get(id)
  return { user, activity: await services.users.activity(id) }
}, { server: false })
useAdminTitle(() => data.value?.user.name)

const initial = computed<AdminUserInput | undefined>(() => data.value ? { name: data.value.user.name, email: data.value.user.email, roles: [...data.value.user.roles], isActive: data.value.user.isActive } : undefined)
const isSelf = computed(() => data.value?.user.email === auth.user?.email)
const permissions = computed(() => [...new Set(ROLE_DEFINITIONS.filter((r) => data.value?.user.roles.includes(r.name)).flatMap((r) => r.permissions))])
const activity = computed<TimelineItem[]>(() => (data.value?.activity ?? []).map((a) => ({ id: a.id, title: a.details, at: a.at, actor: a.userName })))

async function save(input: AdminUserInput) {
  saving.value = true
  try {
    await services.users.update(id, input)
    toast('User updated')
    await refresh()
    formKey.value++
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
    <AdminLoadingState v-else-if="!data || !initial" />
    <template v-else>
      <AdminPageHeader :title="data.user.name">
        <template #meta>
          <div class="mt-2 flex items-center gap-2 text-sm text-slate-500">{{ data.user.email }} <AdminStatusBadge :status="data.user.isActive ? 'active' : 'inactive'" /></div>
        </template>
      </AdminPageHeader>
      <div class="grid gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
        <AdminUserForm :key="formKey" :initial="initial" submit-label="Save changes" :saving="saving" :server-errors="serverErrors" :is-self="isSelf" @submit="save" />
        <div class="space-y-6">
          <AdminCard title="Effective permissions" description="From the assigned roles.">
            <ul class="space-y-1.5 text-sm">
              <li v-for="p in permissions" :key="p" class="flex items-center gap-2"><UiIcon name="check" class="h-4 w-4 text-emerald-600" />{{ PERMISSION_LABELS[p] }}</li>
            </ul>
          </AdminCard>
          <AdminCard title="Account activity"><AdminTimeline :items="activity" empty="No recorded activity." /></AdminCard>
        </div>
      </div>
    </template>
  </div>
</template>
