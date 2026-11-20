<script setup lang="ts">
import type { EnquiryStatus } from '~/types/admin'
import type { TimelineItem } from '~/types/admin-ui'

definePageMeta({ layout: 'admin', permission: PERMISSIONS.enquiries, title: 'Enquiry', section: { label: 'Enquiries', to: '/admin/enquiries' } })

const id = Number(useRoute().params.id)
const services = useAdminServices()
const { run } = useAdminFeedback()

const { data: enquiry, error, refresh } = useAsyncData(`admin-enquiry-${id}`, () => services.enquiries.get(id), { server: false })
const { data: staff } = useAsyncData('admin-enquiry-staff', () => services.enquiries.assignees(), { server: false, default: () => [] })
useAdminTitle(() => (enquiry.value ? `Enquiry from ${enquiry.value.customerName}` : undefined))

const newStatus = ref<EnquiryStatus | ''>('')
const statusNote = ref('')
const note = ref('')
const busy = ref(false)

async function changeStatus() {
  if (!newStatus.value) return
  busy.value = true
  const ok = await run(() => services.enquiries.updateStatus(id, newStatus.value as EnquiryStatus, statusNote.value), `Status changed to ${enquiryStatusLabel(newStatus.value as EnquiryStatus)}`)
  busy.value = false
  if (ok) { newStatus.value = ''; statusNote.value = ''; await refresh() }
}

async function assign(value: string) {
  if (await run(() => services.enquiries.assign(id, value ? Number(value) : null), value ? 'Enquiry assigned' : 'Enquiry unassigned')) await refresh()
}

async function addNote() {
  if (!note.value.trim()) return
  if (await run(() => services.enquiries.addNote(id, note.value), 'Note added')) { note.value = ''; await refresh() }
}

const history = computed<TimelineItem[]>(() => [...(enquiry.value?.history ?? [])].reverse().map((h, i) => ({
  id: i, title: enquiryStatusLabel(h.status), at: h.at, actor: h.by, body: h.note, tone: h.status === 'closed' ? 'success' : h.status === 'follow_up' ? 'warning' : 'default',
})))
const notes = computed<TimelineItem[]>(() => [...(enquiry.value?.notes ?? [])].reverse().map((n) => ({ id: n.id, title: 'Note', at: n.at, actor: n.author, body: n.body })))
</script>

<template>
  <div>
    <AdminErrorState v-if="error" :error="error" @retry="refresh" />
    <AdminLoadingState v-else-if="!enquiry" />
    <template v-else>
      <AdminPageHeader :title="enquiry.customerName">
        <template #meta><div class="mt-2 flex items-center gap-2 text-sm text-slate-500">Received {{ formatDate(enquiry.createdAt) }} <AdminStatusBadge :status="enquiry.status" /></div></template>
      </AdminPageHeader>

      <div class="grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
        <div class="min-w-0 space-y-6">
          <AdminCard title="Message">
            <p class="whitespace-pre-line text-sm leading-relaxed text-slate-800" data-test="enquiry-message">{{ enquiry.message }}</p>
            <div class="mt-4 rounded-lg bg-slate-50 px-4 py-3 text-sm">
              <span class="text-slate-500">Vehicle:</span>
              <NuxtLink v-if="enquiry.vehicleId" :to="`/admin/vehicles/${enquiry.vehicleId}`" class="ml-1 font-medium hover:underline">{{ enquiry.vehicleTitle }}</NuxtLink>
              <span v-else class="ml-1">General enquiry</span>
            </div>
          </AdminCard>

          <AdminCard title="Internal notes">
            <form class="mb-5 flex flex-col gap-2 sm:flex-row" @submit.prevent="addNote">
              <label class="flex-1"><span class="sr-only">New note</span><input v-model="note" class="admin-input" placeholder="Add a note for the team…" data-test="note-input"></label>
              <AdminButton type="submit" :disabled="!note.trim()" data-test="add-note">Add note</AdminButton>
            </form>
            <AdminTimeline :items="notes" empty="No notes yet." />
          </AdminCard>

          <AdminCard title="Status history"><AdminTimeline :items="history" /></AdminCard>
        </div>

        <div class="space-y-6">
          <AdminCard title="Customer">
            <AdminDetails :items="[{ label: 'Name', value: enquiry.customerName }, { label: 'Phone', value: enquiry.phone }, { label: 'Email', value: enquiry.email }]" />
            <div class="mt-4 flex flex-wrap gap-2">
              <a :href="`tel:${enquiry.phone.replace(/\s/g, '')}`" class="inline-flex items-center gap-2 rounded-lg border border-slate-300 px-3.5 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"><UiIcon name="phone" class="h-4 w-4" /> Call</a>
              <a :href="`https://wa.me/${enquiry.phone.replace(/\D/g, '')}`" target="_blank" rel="noopener" class="inline-flex items-center gap-2 rounded-lg border border-slate-300 px-3.5 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"><UiIcon name="whatsapp" class="h-4 w-4" /> WhatsApp</a>
            </div>
          </AdminCard>

          <AdminCard title="Update status" data-test="status-control">
            <form class="space-y-3" @submit.prevent="changeStatus">
              <AdminField v-slot="{ id: fid }" label="New status">
                <select :id="fid" v-model="newStatus" class="admin-input" data-test="status-select">
                  <option value="" disabled>Choose…</option>
                  <option v-for="s in ENQUIRY_STATUSES" :key="s.value" :value="s.value" :disabled="s.value === enquiry.status">{{ s.label }}</option>
                </select>
              </AdminField>
              <AdminField v-slot="{ id: fid }" label="Note (optional)">
                <input :id="fid" v-model="statusNote" class="admin-input" placeholder="e.g. Called, will visit Saturday">
              </AdminField>
              <AdminButton type="submit" variant="primary" class="w-full" :disabled="!newStatus" :loading="busy" data-test="save-status">Update status</AdminButton>
            </form>
          </AdminCard>

          <AdminCard title="Assignment">
            <AdminField v-slot="{ id: fid }" label="Assigned to">
              <select :id="fid" class="admin-input" :value="enquiry.assignedToId ?? ''" data-test="assign-select" @change="assign(($event.target as HTMLSelectElement).value)">
                <option value="">Unassigned</option>
                <option v-for="u in staff" :key="u.id" :value="u.id">{{ u.name }}</option>
              </select>
            </AdminField>
          </AdminCard>
        </div>
      </div>
    </template>
  </div>
</template>
