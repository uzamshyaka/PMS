<script setup lang="ts">
import type { CatalogueKind } from '~/services/contracts'
import type { VehicleFeature, VehicleMake, VehicleModel } from '~/types/admin'
import type { AdminColumn } from '~/types/admin-ui'

/**
 * One management screen for makes, models and features: list, search,
 * add/edit in a dialog, activate/deactivate. Nothing is ever deleted, so
 * vehicles keep their references.
 */
const props = defineProps<{ kind: CatalogueKind }>()

type Item = VehicleMake & Partial<VehicleModel> & Partial<VehicleFeature>

const services = useAdminServices()
const { confirm, run, toast } = useAdminFeedback()

const LABEL = { makes: 'make', models: 'model', features: 'feature' }[props.kind]

const { data, pending, error, refresh } = useAsyncData(`admin-catalogue-${props.kind}`, async () => {
  const [items, makes] = await Promise.all([
    props.kind === 'makes' ? services.catalogue.makes() : props.kind === 'models' ? services.catalogue.models() : services.catalogue.features(),
    services.catalogue.makes(),
  ])
  return { items: items as Item[], makes }
}, { server: false })

const search = ref('')
const makeFilter = ref<string | undefined>()
const makeName = (id?: number) => data.value?.makes.find((m) => m.id === id)?.name ?? '—'

const rows = computed(() => (data.value?.items ?? []).filter((item) => {
  const term = search.value.toLowerCase().trim()
  const haystack = `${item.name} ${item.category ?? ''} ${props.kind === 'models' ? makeName(item.makeId) : ''}`.toLowerCase()
  return (!term || haystack.includes(term)) && (!makeFilter.value || String(item.makeId) === makeFilter.value)
}))

const columns = computed<AdminColumn[]>(() => [
  { key: 'name', label: 'Name' },
  ...(props.kind === 'models' ? [{ key: 'make', label: 'Make' }] : []),
  ...(props.kind === 'features' ? [{ key: 'category', label: 'Category' }] : []),
  ...(props.kind === 'makes' ? [{ key: 'models', label: 'Models', align: 'right' as const, hideBelow: 'sm' as const }] : []),
  { key: 'status', label: 'Status' },
  { key: 'actions', label: 'Actions', align: 'right' },
])

const modelCount = ref<Record<number, number>>({})
watchEffect(async () => {
  if (props.kind !== 'makes') return
  const models = await services.catalogue.models()
  modelCount.value = models.reduce<Record<number, number>>((acc, m) => ({ ...acc, [m.makeId]: (acc[m.makeId] ?? 0) + 1 }), {})
})

// ---- add / edit dialog
const dialog = ref<HTMLDialogElement | null>(null)
const draft = reactive<{ id?: number, name: string, makeId?: number, category?: string }>({ name: '' })
const formErrors = ref<Record<string, string[]>>({})
const saving = ref(false)

function openEditor(item?: Item) {
  Object.assign(draft, { id: item?.id, name: item?.name ?? '', makeId: item?.makeId ?? (makeFilter.value ? Number(makeFilter.value) : undefined), category: item?.category ?? '' })
  formErrors.value = {}
  dialog.value?.showModal()
}

async function save() {
  saving.value = true
  formErrors.value = {}
  try {
    const payload = { id: draft.id, name: draft.name, ...(props.kind === 'models' ? { makeId: draft.makeId } : {}), ...(props.kind === 'features' ? { category: draft.category } : {}) }
    await services.catalogue.save(props.kind, payload)
    toast(`${draft.id ? 'Updated' : 'Added'} ${LABEL} "${draft.name}"`)
    dialog.value?.close()
    await refresh()
  }
  catch (e) {
    const err = toApiError(e)
    formErrors.value = err.errors
    if (!Object.keys(err.errors).length) toast(err.message, 'error')
  }
  finally { saving.value = false }
}

async function toggle(item: Item) {
  const deactivate = item.isActive
  const { confirmed } = await confirm({
    title: `${deactivate ? 'Deactivate' : 'Activate'} ${LABEL}?`,
    message: deactivate ? `"${item.name}" will no longer be offered when adding vehicles. Existing vehicles keep it.` : `"${item.name}" will be offered when adding vehicles again.`,
    confirmLabel: deactivate ? 'Deactivate' : 'Activate',
    tone: deactivate ? 'danger' : 'default',
  })
  if (confirmed && (await run(() => services.catalogue.setActive(props.kind, item.id, !deactivate), `${item.name} ${deactivate ? 'deactivated' : 'activated'}`) !== undefined)) await refresh()
}
</script>

<template>
  <div>
    <AdminListToolbar :search="search" :placeholder="`Search ${kind}…`" @search="search = $event ?? ''">
      <AdminSelectFilter v-if="kind === 'models'" label="Make" :model-value="makeFilter" :options="(data?.makes ?? []).map((m) => ({ value: String(m.id), label: m.name }))" @update:model-value="makeFilter = $event" />
      <AdminButton variant="primary" icon="plus" :data-test="`add-${LABEL}`" @click="openEditor()">Add {{ LABEL }}</AdminButton>
    </AdminListToolbar>

    <AdminDataTable :columns="columns" :rows="rows" :loading="pending" :error="error" :empty-title="`No ${kind} found`" @retry="refresh">
      <template #cell-name="{ row }"><span class="font-medium text-slate-900">{{ row.name }}</span></template>
      <template #cell-make="{ row }">{{ makeName(row.makeId) }}</template>
      <template #cell-models="{ row }"><span class="tabular-nums">{{ modelCount[row.id] ?? 0 }}</span></template>
      <template #cell-status="{ row }"><AdminStatusBadge :status="row.isActive ? 'active' : 'inactive'" /></template>
      <template #cell-actions="{ row }">
        <div class="flex justify-end gap-1">
          <AdminButton variant="ghost" icon="pencil" :aria-label="`Edit ${row.name}`" @click="openEditor(row)">Edit</AdminButton>
          <AdminButton variant="ghost" :icon="row.isActive ? 'x-circle' : 'check'" @click="toggle(row)">{{ row.isActive ? 'Deactivate' : 'Activate' }}</AdminButton>
        </div>
      </template>
    </AdminDataTable>

    <dialog ref="dialog" class="m-auto w-[calc(100%-2rem)] max-w-md rounded-xl p-0 shadow-2xl backdrop:bg-ink/50" :aria-label="`${draft.id ? 'Edit' : 'Add'} ${LABEL}`" data-test="catalogue-dialog">
      <form class="space-y-4 p-6" novalidate @submit.prevent="save">
        <h2 class="text-lg font-semibold text-slate-900">{{ draft.id ? 'Edit' : 'Add' }} {{ LABEL }}</h2>
        <AdminField v-if="kind === 'models'" v-slot="{ id, invalid }" label="Make" :error="formErrors.makeId?.[0]" required>
          <select :id="id" v-model.number="draft.makeId" class="admin-input" :aria-invalid="invalid">
            <option :value="undefined" disabled>Select make…</option>
            <option v-for="m in data?.makes ?? []" :key="m.id" :value="m.id">{{ m.name }}</option>
          </select>
        </AdminField>
        <AdminField v-slot="{ id, invalid }" label="Name" :error="formErrors.name?.[0]" required>
          <input :id="id" v-model.trim="draft.name" class="admin-input" :aria-invalid="invalid" data-test="catalogue-name">
        </AdminField>
        <AdminField v-if="kind === 'features'" v-slot="{ id, invalid }" label="Category" :error="formErrors.category?.[0]" required>
          <select :id="id" v-model="draft.category" class="admin-input" :aria-invalid="invalid">
            <option value="" disabled>Select category…</option>
            <option v-for="c in ['Comfort', 'Technology', 'Safety', 'Exterior', 'Performance']" :key="c" :value="c">{{ c }}</option>
          </select>
        </AdminField>
        <div class="flex justify-end gap-2 pt-2">
          <AdminButton @click="dialog?.close()">Cancel</AdminButton>
          <AdminButton type="submit" variant="primary" :loading="saving" data-test="catalogue-save">Save</AdminButton>
        </div>
      </form>
    </dialog>
  </div>
</template>
