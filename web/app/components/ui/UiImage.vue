<script setup lang="ts">
/**
 * Image with a graceful fallback. If the file is missing or fails to load,
 * the #fallback slot (or a neutral "photo coming soon" panel) is shown instead.
 * Handles failures that happen before hydration as well.
 * Callers set positioning: "relative aspect-[..]" or "absolute inset-0".
 */
const props = withDefaults(defineProps<{
  src?: string
  alt: string
  eager?: boolean
  imgClass?: string
  width?: number
  height?: number
}>(), { eager: false, imgClass: '' })

const failed = ref(!props.src)
const img = ref<HTMLImageElement | null>(null)

watch(() => props.src, (src) => { failed.value = !src })

onMounted(() => {
  if (img.value?.complete && img.value.naturalWidth === 0) failed.value = true
})
</script>

<template>
  <div class="overflow-hidden">
    <slot v-if="failed" name="fallback">
      <div class="@container absolute inset-0 flex flex-col items-center justify-center gap-2 bg-gradient-to-br from-carbon via-graphite to-ink text-white/40">
        <UiIcon name="camera" class="h-4 w-4 @min-[10rem]:h-8 @min-[10rem]:w-8" />
        <span class="label-caps hidden text-[10px] @min-[10rem]:inline">Photo coming soon</span>
      </div>
    </slot>
    <img
      v-else
      ref="img"
      :src="src"
      :alt="alt"
      :width="width"
      :height="height"
      :loading="eager ? 'eager' : 'lazy'"
      :fetchpriority="eager ? 'high' : 'auto'"
      decoding="async"
      class="absolute inset-0 h-full w-full object-cover text-transparent"
      :class="imgClass"
      @error="failed = true"
    >
  </div>
</template>
