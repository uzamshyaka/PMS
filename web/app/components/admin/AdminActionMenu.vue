<script setup lang="ts">
import type { AdminAction } from '~/types/admin-ui'


defineProps<{ actions: AdminAction[], label?: string }>()
</script>

<template>
  <AdminPopover v-if="actions.length" :label="label ?? 'Actions'" width="w-52">
    <template #trigger>
      <span class="rounded-md p-1.5 text-slate-500 hover:bg-slate-100 hover:text-slate-900" data-test="row-actions"><UiIcon name="dots" class="h-5 w-5" /></span>
    </template>
    <template #default="{ close }">
      <template v-for="action in actions" :key="action.label">
        <NuxtLink
          v-if="action.to"
          :to="action.to"
          role="menuitem"
          class="flex items-center gap-2 px-3.5 py-2 text-sm text-slate-700 hover:bg-slate-50"
          @click="close"
        >
          <UiIcon v-if="action.icon" :name="action.icon" class="h-4 w-4 text-slate-400" />{{ action.label }}
        </NuxtLink>
        <button
          v-else
          type="button"
          role="menuitem"
          class="flex w-full items-center gap-2 px-3.5 py-2 text-left text-sm hover:bg-slate-50"
          :class="action.danger ? 'text-rose-600' : 'text-slate-700'"
          :data-test="`action-${action.label.toLowerCase().replace(/[^a-z]+/g, '-')}`"
          @click="close(); action.onSelect?.()"
        >
          <UiIcon v-if="action.icon" :name="action.icon" class="h-4 w-4" :class="action.danger ? 'text-rose-500' : 'text-slate-400'" />{{ action.label }}
        </button>
      </template>
    </template>
  </AdminPopover>
</template>
