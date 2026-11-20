<script setup lang="ts">
const props = defineProps<{ images: string[], alt: string }>()
const active = ref(0)
const current = computed(() => props.images[active.value])
</script>

<template>
  <div>
    <UiImage :key="current" :src="current" :alt="alt" eager class="relative aspect-[16/10] bg-carbon" data-test="gallery-main" />
    <ul v-if="images.length > 1" class="mt-3 grid grid-cols-4 gap-3 sm:grid-cols-5">
      <li v-for="(src, i) in images" :key="src">
        <button
          type="button"
          class="block w-full ring-offset-2 transition"
          :class="i === active ? 'ring-2 ring-ink' : 'opacity-70 hover:opacity-100'"
          :aria-label="`Show photo ${i + 1} of ${images.length}`"
          :aria-pressed="i === active"
          @click="active = i"
        >
          <UiImage :src="src" :alt="''" class="relative aspect-[4/3] bg-carbon" />
        </button>
      </li>
    </ul>
  </div>
</template>
