<script setup lang="ts">
import { useVuelidate } from '@vuelidate/core'
import { email, helpers, required } from '@vuelidate/validators'

const auth = useAuthStore()
const route = useRoute()

const form = reactive({ email: '', password: '', remember: false })
const serverErrors = ref<Record<string, string[]>>({})

const rules = {
  email: {
    required: helpers.withMessage('Email is required.', required),
    email: helpers.withMessage('Enter a valid email address.', email),
  },
  password: {
    required: helpers.withMessage('Password is required.', required),
  },
}

const v$ = useVuelidate(rules, form)

function fieldError(field: 'email' | 'password'): string | undefined {
  const clientError = v$.value[field].$errors[0]?.$message
  return (typeof clientError === 'string' ? clientError : undefined) ?? serverErrors.value[field]?.[0]
}

async function submit() {
  serverErrors.value = {}
  if (!(await v$.value.$validate())) return

  try {
    await auth.login({ ...form })
    await navigateTo(safeAdminRedirect(route.query.redirect))
  } catch (e) {
    serverErrors.value = toApiError(e).errors
  }
}

const inputClass =
  'w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm placeholder:text-slate-400 focus:border-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-500/20 aria-[invalid=true]:border-rose-400'
</script>

<template>
  <form novalidate class="space-y-5" @submit.prevent="submit">
    <UiAlert v-if="auth.error && !Object.keys(serverErrors).length">{{ auth.error }}</UiAlert>

    <div class="space-y-1.5">
      <label for="email" class="block text-sm font-medium text-slate-700">Email address</label>
      <input
        id="email"
        v-model.trim="form.email"
        type="email"
        autocomplete="username"
        :aria-invalid="!!fieldError('email')"
        :class="inputClass"
        @blur="v$.email.$touch()"
      >
      <p v-if="fieldError('email')" data-test="email-error" class="text-xs text-rose-600">{{ fieldError('email') }}</p>
    </div>

    <div class="space-y-1.5">
      <label for="password" class="block text-sm font-medium text-slate-700">Password</label>
      <input
        id="password"
        v-model="form.password"
        type="password"
        autocomplete="current-password"
        :aria-invalid="!!fieldError('password')"
        :class="inputClass"
        @blur="v$.password.$touch()"
      >
      <p v-if="fieldError('password')" data-test="password-error" class="text-xs text-rose-600">{{ fieldError('password') }}</p>
    </div>

    <label class="flex items-center gap-2 text-sm text-slate-600">
      <input v-model="form.remember" type="checkbox" class="h-4 w-4 rounded border-slate-300 accent-slate-800">
      Keep me signed in
    </label>

    <button
      type="submit"
      :disabled="auth.loading"
      class="w-full rounded-lg bg-slate-900 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
    >
      {{ auth.loading ? 'Signing in…' : 'Sign in' }}
    </button>
  </form>
</template>
