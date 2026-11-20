<script setup lang="ts">
/** Small dropdown with click-outside and Escape handling, used by menus. */
withDefaults(defineProps<{ align?: 'left' | 'right', width?: string, label: string }>(), { align: 'right', width: 'w-56' })

const open = ref(false)
const root = ref<HTMLElement | null>(null)

function onDocumentClick(e: MouseEvent) {
  if (open.value && root.value && !root.value.contains(e.target as Node)) open.value = false
}
function onKey(e: KeyboardEvent) {
  if (e.key === 'Escape') open.value = false
}

onMounted(() => {
  document.addEventListener('click', onDocumentClick)
  document.addEventListener('keydown', onKey)
})
onBeforeUnmount(() => {
  document.removeEventListener('click', onDocumentClick)
  document.removeEventListener('keydown', onKey)
})

const close = () => { open.value = false }
</script>

<template>
  <div ref="root" class="relative">
    <button type="button" :aria-expanded="open" aria-haspopup="menu" :aria-label="label" class="flex" @click="open = !open">
      <slot name="trigger" :open="open" />
    </button>
    <div
      v-if="open"
      role="menu"
      class="absolute top-full z-40 mt-2 overflow-hidden rounded-xl border border-line bg-white py-1 shadow-lg"
      :class="[width, align === 'right' ? 'right-0' : 'left-0']"
    >
      <slot :close="close" />
    </div>
  </div>
</template>
