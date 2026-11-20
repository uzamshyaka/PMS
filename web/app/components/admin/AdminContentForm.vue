<script setup lang="ts">
import { useVuelidate } from '@vuelidate/core'
import { between, email, helpers, maxLength, required } from '@vuelidate/validators'
import type { ContentSection, ContentValues } from '~/types/admin'
import type { ContentField, ContentGroup } from '~/types/content-form'

/**
 * Simple schema-driven form for website content and settings (no page
 * builder). Loads and saves one content section through the content service.
 */
const props = defineProps<{ section: ContentSection, groups: ContentGroup[], note?: string }>()

const services = useAdminServices()
const { run } = useAdminFeedback()
const saving = ref(false)
const form = reactive<ContentValues>({})

const { data, error, refresh } = useAsyncData(`admin-content-${props.section}`, () => services.content.get(props.section), { server: false })
watch(data, (values) => { if (values) Object.assign(form, structuredClone(toRaw(values))) }, { immediate: true })

const needsVehicles = props.groups.some((g) => g.fields.some((f) => f.type === 'vehicles'))
const { data: vehicles } = useAsyncData(`admin-content-vehicles`, async () => (needsVehicles ? (await services.vehicles.list({ page: 1, perPage: 100, status: 'published', filters: {} })).items : []), { server: false, default: () => [] })

const fields = props.groups.flatMap((g) => g.fields)
const msg = helpers.withMessage
const rules = computed(() => Object.fromEntries(fields.map((f) => {
  const r: Record<string, unknown> = {}
  if (f.required) r.required = msg(`${f.label} is required.`, required)
  if (f.maxLength) r.maxLength = msg(`Keep it under ${f.maxLength} characters.`, maxLength(f.maxLength))
  if (f.type === 'email') r.email = msg('Enter a valid email address.', email)
  if (f.type === 'number' && f.min !== undefined && f.max !== undefined) r.between = msg(`Enter a number from ${f.min} to ${f.max}.`, between(f.min, f.max))
  return [f.key, r]
})))
const v$ = useVuelidate(rules, form)

function fieldError(f: ContentField) {
  const field = v$.value[f.key] as { $dirty: boolean, $errors: { $message: unknown }[] } | undefined
  return field?.$dirty && field.$errors[0] ? String(field.$errors[0].$message) : undefined
}

function toggleVehicle(key: string, id: number) {
  const ids = Array.isArray(form[key]) ? [...(form[key] as number[])] : []
  form[key] = ids.includes(id) ? ids.filter((x) => x !== id) : [...ids, id]
}

const { toast } = useAdminFeedback()
async function pickImage(key: string, files: FileList | null) {
  const file = files?.[0]
  if (!file) return
  const { accepted, errors } = validateImageFiles([file], 0)
  if (errors.length) return toast(errors[0]!, 'error')
  try {
    form[key] = await services.content.uploadImage(accepted[0]!)
  }
  catch (e) {
    toast(toApiError(e).message, 'error')
  }
}

async function save() {
  if (!(await v$.value.$validate())) return
  saving.value = true
  await run(() => services.content.save(props.section, structuredClone(toRaw(form))), 'Changes saved')
  saving.value = false
}
</script>

<template>
  <div>
    <AdminErrorState v-if="error" :error="error" @retry="refresh" />
    <AdminLoadingState v-else-if="!data" />
    <form v-else novalidate class="space-y-6" data-test="content-form" @submit.prevent="save">
      <UiAlert v-if="note" tone="info">{{ note }}</UiAlert>
      <AdminCard v-for="group in groups" :key="group.title" :title="group.title" :description="group.description">
        <div class="grid gap-5 sm:grid-cols-2">
          <template v-for="f in group.fields" :key="f.key">
            <label v-if="f.type === 'checkbox'" class="flex items-center gap-2 text-sm" :class="f.wide && 'sm:col-span-2'">
              <input v-model="form[f.key]" type="checkbox" class="h-4 w-4 accent-ink" :name="f.key"> {{ f.label }}
              <span v-if="f.hint" class="text-slate-500">· {{ f.hint }}</span>
            </label>

            <fieldset v-else-if="f.type === 'vehicles'" class="sm:col-span-2">
              <legend class="mb-2 text-sm font-medium text-slate-700">{{ f.label }}</legend>
              <p v-if="f.hint" class="mb-3 text-xs text-slate-500">{{ f.hint }}</p>
              <div class="grid max-h-72 gap-1.5 overflow-y-auto rounded-lg border border-line p-3 sm:grid-cols-2">
                <label v-for="v in vehicles" :key="v.id" class="flex items-center gap-2 rounded px-2 py-1 text-sm hover:bg-slate-50">
                  <input type="checkbox" class="h-4 w-4 accent-ink" :checked="(form[f.key] as number[] | undefined)?.includes(v.id)" @change="toggleVehicle(f.key, v.id)">
                  <span class="truncate">{{ v.title }}</span>
                </label>
              </div>
            </fieldset>

            <AdminField v-else v-slot="{ id, invalid }" :label="f.label" :error="fieldError(f)" :hint="f.hint" :required="f.required" :class="f.wide && 'sm:col-span-2'">
              <textarea v-if="f.type === 'textarea'" :id="id" v-model="form[f.key] as string" rows="4" class="admin-input" :aria-invalid="invalid" :name="f.key" />
              <select v-else-if="f.type === 'select'" :id="id" v-model="form[f.key]" class="admin-input" :aria-invalid="invalid" :name="f.key">
                <option v-for="o in f.options" :key="o.value" :value="o.value">{{ o.label }}</option>
              </select>
              <div v-else-if="f.type === 'image'" class="flex items-center gap-4">
                <span class="flex h-14 w-28 items-center justify-center overflow-hidden rounded-lg border border-line bg-slate-50">
                  <img v-if="form[f.key]" :src="String(form[f.key])" alt="" class="max-h-full max-w-full object-contain">
                  <UiIcon v-else name="image" class="h-6 w-6 text-slate-300" />
                </span>
                <input :id="id" type="file" accept="image/jpeg,image/png,image/webp" class="text-sm" @change="pickImage(f.key, ($event.target as HTMLInputElement).files)">
              </div>
              <div v-else-if="f.type === 'color'" class="flex items-center gap-3">
                <input :id="id" v-model="form[f.key]" type="color" class="h-10 w-14 cursor-pointer rounded border border-slate-300" :name="f.key">
                <span class="font-mono text-sm text-slate-600">{{ form[f.key] }}</span>
              </div>
              <input
                v-else
                :id="id"
                v-model="form[f.key]"
                :type="f.type"
                :min="f.min"
                :max="f.max"
                class="admin-input"
                :aria-invalid="invalid"
                :name="f.key"
              >
              <p v-if="f.maxLength && typeof form[f.key] === 'string'" class="mt-1 text-right text-[11px] text-slate-400">{{ (form[f.key] as string).length }} / {{ f.maxLength }}</p>
            </AdminField>
          </template>
        </div>
      </AdminCard>
      <div class="flex justify-end gap-2">
        <AdminButton @click="refresh">Discard changes</AdminButton>
        <AdminButton type="submit" variant="primary" :loading="saving" data-test="save-content">Save changes</AdminButton>
      </div>
    </form>
  </div>
</template>
