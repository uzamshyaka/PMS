<script setup lang="ts">
import type { VehicleImage } from '~/types/admin'

/**
 * Photo picker: validates type/size/count in the browser, uploads through the
 * admin services (API: re-encoded and stored in the S3 bucket; mock: local
 * preview only), then handles primary selection, reordering and removal.
 * Photos are attached to the vehicle when the form is saved.
 */
const images = defineModel<VehicleImage[]>({ required: true })

const services = useAdminServices()
const errors = ref<string[]>([])
const uploading = ref(false)
const dragIndex = ref<number | null>(null)

async function addFiles(list: FileList | null) {
  if (!list?.length) return
  const { accepted, errors: rejected } = validateImageFiles([...list], images.value.length)
  errors.value = rejected
  if (!accepted.length) return

  uploading.value = true
  try {
    const added = await services.vehicles.uploadImages(accepted)
    const next = [...images.value, ...added]
    if (next.length && !next.some((i) => i.isPrimary)) next[0]!.isPrimary = true
    images.value = next
  }
  catch (e) {
    const err = toApiError(e)
    errors.value = [...errors.value, ...(Object.values(err.errors).flat().length ? Object.values(err.errors).flat() : [err.message])]
  }
  finally {
    uploading.value = false
  }
}

function remove(index: number) {
  const next = images.value.filter((_, i) => i !== index)
  if (images.value[index]?.isPrimary && next[0]) next[0] = { ...next[0], isPrimary: true }
  images.value = next
}

function makePrimary(index: number) {
  images.value = images.value.map((img, i) => ({ ...img, isPrimary: i === index }))
}

const move = (from: number, to: number) => { images.value = moveItem(images.value, from, to) }

function onDrop(index: number) {
  if (dragIndex.value !== null) move(dragIndex.value, index)
  dragIndex.value = null
}

</script>

<template>
  <AdminCard title="Photographs" :description="`${images.length} of ${IMAGE_RULES.maxCount} · JPEG, PNG or WebP up to 8 MB · drag to reorder`">
    <label class="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-300 px-6 py-8 text-center hover:border-slate-400 hover:bg-slate-50" data-test="image-dropzone" @dragover.prevent @drop.prevent="addFiles($event.dataTransfer?.files ?? null)">
      <UiIcon name="upload" class="h-7 w-7 text-slate-400" />
      <span class="mt-2 text-sm font-medium text-slate-700">{{ uploading ? 'Uploading…' : 'Choose photos or drop them here' }}</span>
      <span class="mt-1 text-xs text-slate-500">Photos are resized and stored securely. Removed photos are deleted when you save.</span>
      <input type="file" multiple accept="image/jpeg,image/png,image/webp" class="sr-only" data-test="image-input" @change="addFiles(($event.target as HTMLInputElement).files); ($event.target as HTMLInputElement).value = ''">
    </label>

    <ul v-if="errors.length" class="mt-3 space-y-1 rounded-lg bg-rose-50 px-4 py-3 text-xs text-rose-700" role="alert" data-test="image-errors">
      <li v-for="e in errors" :key="e">{{ e }}</li>
    </ul>

    <ul v-if="images.length" class="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-4" data-test="image-previews">
      <li
        v-for="(img, i) in images"
        :key="img.id"
        draggable="true"
        class="group overflow-hidden rounded-lg border bg-white"
        :class="[img.isPrimary ? 'border-bronze ring-2 ring-bronze/40' : 'border-line', dragIndex === i && 'opacity-50']"
        data-test="image-preview"
        @dragstart="dragIndex = i"
        @dragend="dragIndex = null"
        @dragover.prevent
        @drop.prevent="onDrop(i)"
      >
        <div class="relative">
          <UiImage :src="img.url" :alt="img.name" class="relative aspect-[4/3] bg-slate-200" />
          <span v-if="img.isPrimary" class="absolute left-2 top-2 rounded bg-bronze px-1.5 py-0.5 text-[10px] font-bold uppercase text-white" data-test="primary-badge">Primary</span>
          <span class="absolute right-2 top-2 rounded bg-ink/70 px-1.5 py-0.5 text-[10px] font-semibold text-white">{{ i + 1 }}</span>
        </div>
        <div class="flex items-center justify-between gap-1 px-2 py-1.5">
          <button type="button" class="rounded p-1 text-slate-500 hover:bg-slate-100 disabled:opacity-30" :disabled="i === 0" :aria-label="`Move photo ${i + 1} earlier`" @click="move(i, i - 1)"><UiIcon name="chevron-left" class="h-4 w-4" /></button>
          <button type="button" class="rounded p-1 text-slate-500 hover:bg-slate-100 disabled:opacity-30" :disabled="i === images.length - 1" :aria-label="`Move photo ${i + 1} later`" @click="move(i, i + 1)"><UiIcon name="chevron-right" class="h-4 w-4" /></button>
          <button type="button" class="rounded p-1 hover:bg-slate-100" :class="img.isPrimary ? 'text-bronze' : 'text-slate-500'" :aria-label="`Make photo ${i + 1} the primary photo`" :aria-pressed="img.isPrimary" data-test="make-primary" @click="makePrimary(i)"><UiIcon name="star" class="h-4 w-4" /></button>
          <button type="button" class="rounded p-1 text-rose-500 hover:bg-rose-50" :aria-label="`Remove photo ${i + 1}`" data-test="remove-image" @click="remove(i)"><UiIcon name="trash" class="h-4 w-4" /></button>
        </div>
      </li>
    </ul>
  </AdminCard>
</template>
