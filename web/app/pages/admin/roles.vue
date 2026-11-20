<script setup lang="ts">
import type { Permission } from '~/utils/permissions'

definePageMeta({ layout: 'admin', permission: PERMISSIONS.roles, title: 'Roles', section: { label: 'Users & Roles', to: '/admin/users' } })

const services = useAdminServices()
const { data: roles, error, refresh } = useAsyncData('admin-roles', () => services.users.roles(), { server: false })
const ALL = Object.values(PERMISSIONS) as Permission[]
</script>

<template>
  <div>
    <AdminPageHeader title="Roles & permissions" description="The four roles and what each can do. Roles are defined on the server (RolesAndPermissionsSeeder); assign them to users on the Users page." />
    <AdminErrorState v-if="error" :error="error" @retry="refresh" />
    <AdminLoadingState v-else-if="!roles" />
    <template v-else>
      <div class="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <AdminCard v-for="r in roles" :key="r.name">
          <p class="font-semibold text-slate-900">{{ r.label }}</p>
          <p class="mt-1 text-sm text-slate-500">{{ r.description }}</p>
          <p class="mt-3 text-xs text-slate-500">{{ r.userCount }} user(s) · {{ r.permissions.length }} permission(s)</p>
        </AdminCard>
      </div>

      <div class="overflow-x-auto rounded-xl border border-line bg-white shadow-card">
        <table class="w-full text-sm" data-test="permission-matrix">
          <caption class="sr-only">Permissions by role</caption>
          <thead class="border-b border-line bg-slate-50/70 text-xs uppercase tracking-wider text-slate-500">
            <tr>
              <th scope="col" class="px-4 py-3 text-left font-semibold">Permission</th>
              <th v-for="r in roles" :key="r.name" scope="col" class="px-4 py-3 text-center font-semibold">{{ r.label }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="p in ALL" :key="p" class="border-b border-line last:border-0">
              <th scope="row" class="px-4 py-3 text-left font-normal text-slate-700">{{ PERMISSION_LABELS[p] }}<span class="ml-2 font-mono text-xs text-slate-400">{{ p }}</span></th>
              <td v-for="r in roles" :key="r.name" class="px-4 py-3 text-center">
                <UiIcon v-if="r.permissions.includes(p)" name="check" class="mx-auto h-4 w-4 text-emerald-600" />
                <span v-else class="text-slate-300" aria-hidden="true">—</span>
                <span class="sr-only">{{ r.permissions.includes(p) ? 'Allowed' : 'Not allowed' }}</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </template>
  </div>
</template>
