<script setup lang="ts">
import { useVuelidate } from '@vuelidate/core'
import { email, helpers, maxLength, required, requiredIf } from '@vuelidate/validators'
import type { OwnerInput } from '~/types/admin'

/** Create/edit form for vehicle owners (individuals or businesses). Owners never log in. */
const props = defineProps<{ initial?: OwnerInput, saving?: boolean, submitLabel: string, serverErrors?: Record<string, string[]> }>()
const emit = defineEmits<{ submit: [input: OwnerInput] }>()

const form = reactive<OwnerInput>(props.initial ? structuredClone(toRaw(props.initial)) : {
  type: 'individual', name: '', contactPerson: '', phone: '', whatsapp: '', email: '', location: '', status: 'active', notes: '',
})

// Kenyan mobile numbers: +254 7xx/1xx xxx xxx or 07xx/01xx xxx xxx.
const kenyanPhone = (value: string) => !value || /^(?:\+?254|0)[17]\d{8}$/.test(value.replace(/[\s-]/g, ''))
const msg = helpers.withMessage
const rules = computed(() => ({
  name: { required: msg(form.type === 'business' ? 'Enter the business name.' : 'Enter the owner\'s name.', required), maxLength: msg('Too long.', maxLength(120)) },
  contactPerson: { requiredIf: msg('Enter a contact person for the business.', requiredIf(() => form.type === 'business')) },
  phone: { required: msg('Enter a phone number.', required), kenyanPhone: msg('Enter a Kenyan number, e.g. +254 712 345 678.', kenyanPhone) },
  whatsapp: { kenyanPhone: msg('Enter a Kenyan number, e.g. +254 712 345 678.', kenyanPhone) },
  email: { email: msg('Enter a valid email address.', email) },
  location: { required: msg('Choose a location.', required) },
}))
const v$ = useVuelidate(rules, form)

const errors = computed(() => Object.fromEntries(Object.keys(rules.value).map((key) => {
  const field = v$.value[key as keyof typeof v$.value] as { $dirty: boolean, $errors: { $message: unknown }[] }
  return [key, field.$dirty && field.$errors[0] ? String(field.$errors[0].$message) : props.serverErrors?.[key]?.[0]]
})) as Record<string, string | undefined>)

async function submit() {
  if (await v$.value.$validate()) emit('submit', structuredClone(toRaw(form)))
}
</script>

<template>
  <form novalidate class="space-y-6" data-test="owner-form" @submit.prevent="submit">
    <AdminCard title="Owner details" description="Owners are managed by staff and never log in.">
      <fieldset class="mb-5">
        <legend class="mb-2 text-sm font-medium text-slate-700">Owner type</legend>
        <div class="flex gap-3">
          <label v-for="t in [{ v: 'individual', l: 'Individual' }, { v: 'business', l: 'Business' }]" :key="t.v" class="flex cursor-pointer items-center gap-2 rounded-lg border px-4 py-2 text-sm" :class="form.type === t.v ? 'border-ink bg-slate-50' : 'border-slate-300'">
            <input v-model="form.type" type="radio" :value="t.v" class="accent-ink" name="type"> {{ t.l }}
          </label>
        </div>
      </fieldset>
      <div class="grid gap-5 sm:grid-cols-2">
        <AdminField v-slot="{ id, invalid }" :label="form.type === 'business' ? 'Business name' : 'Full name'" :error="errors.name" required>
          <input :id="id" v-model.trim="form.name" class="admin-input" :aria-invalid="invalid" name="name">
        </AdminField>
        <AdminField v-if="form.type === 'business'" v-slot="{ id, invalid }" label="Contact person" :error="errors.contactPerson" required>
          <input :id="id" v-model.trim="form.contactPerson" class="admin-input" :aria-invalid="invalid" name="contactPerson">
        </AdminField>
        <AdminField v-slot="{ id, invalid }" label="Phone" :error="errors.phone" required>
          <input :id="id" v-model.trim="form.phone" type="tel" class="admin-input" :aria-invalid="invalid" placeholder="+254 712 345 678" name="phone">
        </AdminField>
        <AdminField v-slot="{ id, invalid }" label="WhatsApp" :error="errors.whatsapp" hint="Leave blank if same as phone or not used.">
          <input :id="id" v-model.trim="form.whatsapp" type="tel" class="admin-input" :aria-invalid="invalid" name="whatsapp">
        </AdminField>
        <AdminField v-slot="{ id, invalid }" label="Email" :error="errors.email">
          <input :id="id" v-model.trim="form.email" type="email" class="admin-input" :aria-invalid="invalid" name="email">
        </AdminField>
        <AdminField v-slot="{ id, invalid }" label="Location" :error="errors.location" required>
          <select :id="id" v-model="form.location" class="admin-input" :aria-invalid="invalid" name="location">
            <option value="" disabled>Select town…</option>
            <option v-for="l in LOCATIONS" :key="l" :value="l">{{ l }}</option>
          </select>
        </AdminField>
        <AdminField v-slot="{ id }" label="Status">
          <select :id="id" v-model="form.status" class="admin-input" name="status">
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </AdminField>
        <AdminField v-slot="{ id }" label="Internal notes" hint="Visible to staff only." class="sm:col-span-2">
          <textarea :id="id" v-model.trim="form.notes" rows="3" class="admin-input" name="notes" />
        </AdminField>
      </div>
    </AdminCard>
    <div class="flex justify-end gap-2">
      <AdminButton to="/admin/owners">Cancel</AdminButton>
      <AdminButton type="submit" variant="primary" :loading="saving" data-test="save-owner">{{ submitLabel }}</AdminButton>
    </div>
  </form>
</template>
