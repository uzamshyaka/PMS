<script setup lang="ts">
import { useVuelidate } from '@vuelidate/core'
import { between, helpers, integer, maxLength, minLength, minValue, required } from '@vuelidate/validators'
import type { VehicleInput } from '~/types/admin'

/**
 * Six-step vehicle wizard shared by Create and Edit. It owns the form state
 * and validation; the page decides what saving means (emit `submit`).
 */
const props = withDefaults(defineProps<{
  initial?: VehicleInput
  mode: 'create' | 'edit'
  saving?: boolean
  /** Edit mode: whether "Submit for approval" applies (draft / rejected). */
  canSubmit?: boolean
  /** Edit mode: saving sends a published listing back to review. */
  willRequireReview?: boolean
  serverErrors?: Record<string, string[]>
}>(), { canSubmit: true, saving: false, willRequireReview: false })

const emit = defineEmits<{ submit: [input: VehicleInput, intent: 'draft' | 'submit' | 'save'] }>()

const services = useAdminServices()
const form = reactive<VehicleInput>(props.initial ? structuredClone(toRaw(props.initial)) : emptyVehicleInput())
const step = ref(0)
const visited = ref(new Set([0]))
const stepError = ref('')

const { data: options } = useAsyncData('vehicle-form-options', async () => {
  const [owners, makes, models, features] = await Promise.all([
    services.owners.all(), services.catalogue.makes(), services.catalogue.models(), services.catalogue.features(),
  ])
  return { owners, makes: makes.filter((m) => m.isActive), models: models.filter((m) => m.isActive), features: features.filter((f) => f.isActive) }
}, { server: false, default: () => ({ owners: [], makes: [], models: [], features: [] }) })

const msg = helpers.withMessage
const thisYear = new Date().getFullYear()
const rules = computed(() => ({
  ownerId: { required: msg('Choose the owner.', required) },
  makeId: { required: msg('Choose a make.', required) },
  modelId: { required: msg('Choose a model.', required) },
  year: { required: msg('Enter the manufacturing year.', required), between: msg(`Enter a year between 1980 and ${thisYear + 1}.`, between(1980, thisYear + 1)) },
  title: { required: msg('Enter a listing title.', required), minLength: msg('Use at least 5 characters.', minLength(5)), maxLength: msg('Keep it under 120 characters.', maxLength(120)) },
  description: { required: msg('Describe the vehicle.', required), minLength: msg('Write at least 20 characters.', minLength(20)) },
  listingType: { required: msg('Choose new or used.', required) },
  mileageKm: { required: msg('Enter the mileage (0 for new).', required), minValue: msg('Mileage cannot be negative.', minValue(0)), integer: msg('Whole kilometres only.', integer) },
  priceKes: { required: msg('Enter the price.', required), minValue: msg('Price must be at least KES 50,000.', minValue(50_000)) },
  fuel: { required: msg('Choose a fuel type.', required) },
  transmission: { required: msg('Choose a transmission.', required) },
  bodyStyle: { required: msg('Choose a body style.', required) },
  engineCc: { required: msg('Enter the engine capacity.', required), between: msg('Enter a capacity between 600 and 8,000 cc.', between(600, 8000)) },
  exteriorColour: { required: msg('Enter the exterior colour.', required) },
  drivetrain: { required: msg('Choose the drivetrain.', required) },
  doors: { required: msg('Enter the number of doors.', required), between: msg('Between 2 and 5 doors.', between(2, 5)) },
  seats: { required: msg('Enter the seating capacity.', required), between: msg('Between 2 and 9 seats.', between(2, 9)) },
  conditionGrade: { required: msg('Choose the condition.', required) },
  payment: { required: msg('Choose cash or Lipa Mdogo Mdogo.', required) },
  location: { required: msg('Choose where it is sold from.', required) },
}))

const v$ = useVuelidate(rules, form)

/** First error message per field, shown once the field has been touched; server errors otherwise. */
const errors = computed<Record<string, string | undefined>>(() => {
  const out: Record<string, string | undefined> = {}
  for (const key of Object.keys(rules.value)) {
    const field = v$.value[key as keyof typeof v$.value] as { $dirty: boolean, $errors: { $message: unknown }[] } | undefined
    out[key] = field?.$dirty && field.$errors[0] ? String(field.$errors[0].$message) : props.serverErrors?.[key]?.[0]
  }
  return out
})

// New vehicles have no mileage.
watch(() => form.listingType, (type) => {
  if (type === 'new') { form.mileageKm = 0; form.conditionGrade = 'New' }
})
// A model belongs to a make.
watch(() => form.makeId, (makeId, old) => {
  if (old !== undefined && old !== null && makeId !== old) form.modelId = null
})

function inspectionErrors(): string {
  const today = new Date().toISOString().slice(0, 10)
  const bad = form.inspections.findIndex((i) => !i.title.trim() || !i.summary.trim() || !i.date || i.date > today)
  return bad === -1 ? '' : `Inspection ${bad + 1}: add a title, summary and a date that is not in the future.`
}

async function validateStep(index: number): Promise<boolean> {
  stepError.value = ''
  const fields = VEHICLE_STEP_FIELDS[index] ?? []
  let ok = true
  for (const key of fields) {
    const field = v$.value[key as keyof typeof v$.value] as { $validate?: () => Promise<boolean> } | undefined
    if (field?.$validate && !(await field.$validate())) ok = false
  }
  if (index === 4) {
    stepError.value = inspectionErrors()
    ok = ok && !stepError.value
  }
  if (!ok && !stepError.value) stepError.value = 'Please fix the highlighted fields.'
  return ok
}

async function next() {
  if (!(await validateStep(step.value))) return
  step.value = Math.min(step.value + 1, VEHICLE_FORM_STEPS.length - 1)
  visited.value.add(step.value)
}

async function goTo(index: number) {
  if (index < step.value || visited.value.has(index)) {
    if (index > step.value && !(await validateStep(step.value))) return
    step.value = index
  }
}

async function submit(intent: 'draft' | 'submit' | 'save') {
  // Drafts may be incomplete, but still need owner, make, model and year.
  const minimal: (keyof VehicleInput)[] = ['ownerId', 'makeId', 'modelId', 'year']
  const fieldsToCheck = intent === 'draft' ? [minimal] : VEHICLE_STEP_FIELDS
  for (let i = 0; i < fieldsToCheck.length; i++) {
    for (const key of fieldsToCheck[i]!) {
      const field = v$.value[key as keyof typeof v$.value] as { $validate?: () => Promise<boolean> } | undefined
      if (field?.$validate && !(await field.$validate())) {
        step.value = VEHICLE_STEP_FIELDS.findIndex((f) => f.includes(key))
        stepError.value = intent === 'draft' ? 'A draft needs at least the owner, make, model and year.' : 'Please fix the highlighted fields.'
        return
      }
    }
  }
  if (intent !== 'draft') {
    if (inspectionErrors()) { step.value = 4; stepError.value = inspectionErrors(); return }
    if (intent === 'submit' && !form.images.length) { step.value = 3; stepError.value = 'Add at least one photograph before submitting for approval.'; return }
  }
  emit('submit', structuredClone(toRaw(form)), intent)
}

const isLast = computed(() => step.value === VEHICLE_FORM_STEPS.length - 1)
</script>

<template>
  <div class="grid gap-6 lg:grid-cols-[220px_minmax(0,1fr)]">
    <!-- Step list -->
    <nav aria-label="Form steps" class="lg:sticky lg:top-24 lg:self-start">
      <ol class="flex gap-2 overflow-x-auto pb-2 lg:flex-col lg:gap-1 lg:overflow-visible lg:pb-0" data-test="form-steps">
        <li v-for="(s, i) in VEHICLE_FORM_STEPS" :key="s.key" class="shrink-0">
          <button
            type="button"
            class="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm transition-colors"
            :class="i === step ? 'bg-white font-semibold text-slate-900 shadow-card ring-1 ring-line' : visited.has(i) ? 'text-slate-700 hover:bg-white' : 'cursor-default text-slate-400'"
            :aria-current="i === step ? 'step' : undefined"
            @click="goTo(i)"
          >
            <span class="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold" :class="i === step ? 'bg-ink text-white' : visited.has(i) ? 'bg-bronze/20 text-[#7a5f35]' : 'bg-slate-200 text-slate-500'">{{ i + 1 }}</span>
            <span class="whitespace-nowrap">{{ s.label }}</span>
          </button>
        </li>
      </ol>
    </nav>

    <form novalidate class="min-w-0" data-test="vehicle-form" @submit.prevent="isLast ? submit(mode === 'create' ? 'submit' : canSubmit ? 'submit' : 'save') : next()">
      <UiAlert v-if="stepError" class="mb-4" data-test="step-error">{{ stepError }}</UiAlert>
      <UiAlert v-if="willRequireReview" tone="info" class="mb-4">This listing is live. Saving changes sends it back to review, and the public page keeps showing the last approved version until a reviewer approves.</UiAlert>

      <AdminVehicleStepBasics v-show="step === 0" :form="form" :errors="errors" :options="options" />
      <AdminVehicleStepSpecs v-show="step === 1" :form="form" :errors="errors" />
      <AdminVehicleStepFeatures v-show="step === 2" :form="form" :features="options.features" />
      <AdminVehicleImages v-show="step === 3" v-model="form.images" />
      <AdminVehicleStepCondition v-show="step === 4" :form="form" />
      <AdminVehicleSummary v-if="step === 5" :form="form" :options="options" />

      <div class="mt-6 flex flex-col-reverse gap-3 border-t border-line pt-5 sm:flex-row sm:items-center sm:justify-between">
        <AdminButton v-if="step > 0" variant="ghost" icon="chevron-left" @click="step--">Back</AdminButton>
        <span v-else />
        <div class="flex flex-wrap justify-end gap-2">
          <AdminButton v-if="mode === 'create'" :loading="saving" data-test="save-draft" @click="submit('draft')">Save as Draft</AdminButton>
          <AdminButton v-if="mode === 'edit'" :loading="saving" data-test="save-changes" @click="submit('save')">Save changes</AdminButton>
          <AdminButton v-if="!isLast" type="submit" variant="primary" data-test="next-step">Next: {{ VEHICLE_FORM_STEPS[step + 1]?.label }}</AdminButton>
          <AdminButton v-else-if="mode === 'create' || canSubmit" type="submit" variant="primary" icon="send" :loading="saving" data-test="submit-approval">Submit for Approval</AdminButton>
        </div>
      </div>
    </form>
  </div>
</template>
