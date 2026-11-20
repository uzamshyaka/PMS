<script setup lang="ts">
import { ICON_PATHS, type IconName } from '~/utils/icons'

/** Inline outline icons. No icon library needed. */
defineProps<{ name: IconName }>()
</script>

<template>
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
    <path :d="ICON_PATHS[name]" />
  </svg>
</template>
