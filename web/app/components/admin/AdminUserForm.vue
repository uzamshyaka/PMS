<script setup lang="ts">
import { useVuelidate } from '@vuelidate/core'
import { email, helpers, maxLength, minLength, required, requiredIf } from '@vuelidate/validators'
import type { AdminUserInput } from '~/types/admin'

/** Create/edit admin users and assign roles (existing Phase 0 roles; no new authorization system). */
const props = defineProps<{ initial?: AdminUserInput, saving?: boolean, submitLabel: string, serverErrors?: Record<string, string[]>, isSelf?: boolean }>()
const emit = defineEmits<{ submit: [input: AdminUserInput] }>()

const form = reactive<Required<AdminUserInput>>(props.initial ? { ...structuredClone(toRaw(props.initial)), password: '' } : { name: '', email: '', roles: [], isActive: true, password: '' })

const msg = helpers.withMessage
const rules = {
  name: { required: msg('Enter the user\'s name.', required), maxLength: msg('Too long.', maxLength(100)) },
  email: { required: msg('Enter an email address.', required), email: msg('Enter a valid email address.', email) },
  roles: { minLength: msg('Assign at least one role.', minLength(1)) },
  password: {
    requiredIf: msg('Set an initial password.', requiredIf(() => !props.initial)),
    minLength: msg('Use at least 12 characters.', minLength(12)),
  },
}
const v$ = useVuelidate(rules, form)
const err = (key: 'name' | 'email' | 'roles' | 'password') => (v$.value[key].$dirty && v$.value[key].$errors[0] ? String(v$.value[key].$errors[0].$message) : props.serverErrors?.[key]?.[0])

async function submit() {
  if (!(await v$.value.$validate())) return
  const { password, ...rest } = structuredClone(toRaw(form))
  emit('submit', password ? { ...rest, password } : rest)
}
</script>

<template>
  <form novalidate class="space-y-6" data-test="user-form" @submit.prevent="submit">
    <AdminCard title="Account">
      <div class="grid gap-5 sm:grid-cols-2">
        <AdminField v-slot="{ id, invalid }" label="Full name" :error="err('name')" required>
          <input :id="id" v-model.trim="form.name" class="admin-input" :aria-invalid="invalid" name="name">
        </AdminField>
        <AdminField v-slot="{ id, invalid }" label="Email" :error="err('email')" required hint="Used to sign in.">
          <input :id="id" v-model.trim="form.email" type="email" class="admin-input" :aria-invalid="invalid" name="email">
        </AdminField>
        <AdminField v-slot="{ id, invalid }" :label="initial ? 'New password' : 'Initial password'" :error="err('password')" :required="!initial" :hint="initial ? 'Leave blank to keep the current password.' : 'At least 12 characters. Share it securely; the user should change it after signing in.'">
          <input :id="id" v-model="form.password" type="password" autocomplete="new-password" class="admin-input" :aria-invalid="invalid" name="password">
        </AdminField>
        <label class="flex items-center gap-2 text-sm sm:col-span-2">
          <input v-model="form.isActive" type="checkbox" class="h-4 w-4 accent-ink" :disabled="isSelf" name="isActive">
          Account active <span class="text-slate-500">{{ isSelf ? '(you cannot deactivate yourself)' : '(inactive users cannot sign in)' }}</span>
        </label>
      </div>
    </AdminCard>

    <AdminCard title="Roles" description="Roles decide which modules a user can open. The server enforces them.">
      <fieldset>
        <legend class="sr-only">Roles</legend>
        <div class="grid gap-3 md:grid-cols-2">
          <label v-for="role in ROLE_DEFINITIONS" :key="role.name" class="flex cursor-pointer gap-3 rounded-lg border p-4" :class="form.roles.includes(role.name) ? 'border-ink bg-slate-50' : 'border-line'">
            <input v-model="form.roles" type="checkbox" :value="role.name" class="mt-0.5 h-4 w-4 accent-ink" :data-test="`role-${role.name}`">
            <span>
              <span class="block text-sm font-semibold text-slate-900">{{ role.label }}</span>
              <span class="block text-xs text-slate-500">{{ role.description }}</span>
            </span>
          </label>
        </div>
        <p v-if="err('roles')" class="mt-2 text-xs text-rose-600" data-test="field-error">{{ err('roles') }}</p>
      </fieldset>
    </AdminCard>

    <div class="flex justify-end gap-2">
      <AdminButton to="/admin/users">Cancel</AdminButton>
      <AdminButton type="submit" variant="primary" :loading="saving" data-test="save-user">{{ submitLabel }}</AdminButton>
    </div>
  </form>
</template>
