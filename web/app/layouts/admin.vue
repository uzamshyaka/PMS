<script setup lang="ts">
const drawerOpen = ref(false)
const isMock = useRuntimeConfig().public.adminDataSource === 'mock'
const route = useRoute()
watch(() => route.fullPath, () => { drawerOpen.value = false })
</script>

<template>
  <div class="min-h-screen bg-mist text-slate-800">
    <!-- Desktop: full sidebar. Tablet: icon-only sidebar. -->
    <aside class="fixed inset-y-0 left-0 z-40 hidden w-[76px] md:block lg:w-64">
      <div class="h-full lg:hidden"><AdminSidebar collapsed /></div>
      <div class="hidden h-full lg:block"><AdminSidebar /></div>
    </aside>

    <!-- Mobile drawer -->
    <div v-if="drawerOpen" class="fixed inset-0 z-50 md:hidden" role="dialog" aria-modal="true" aria-label="Navigation" data-test="admin-drawer">
      <div class="absolute inset-0 bg-ink/50" @click="drawerOpen = false" />
      <div class="relative h-full w-72 max-w-[85%] shadow-2xl">
        <AdminSidebar @navigate="drawerOpen = false" />
        <button type="button" class="absolute right-3 top-4 rounded-md p-1.5 text-white/70 hover:bg-white/10" aria-label="Close navigation" @click="drawerOpen = false">
          <UiIcon name="close" class="h-5 w-5" />
        </button>
      </div>
    </div>

    <div class="flex min-h-screen min-w-0 flex-col md:pl-[76px] lg:pl-64">
      <AdminHeader @toggle-menu="drawerOpen = true" />
      <div v-if="isMock" class="border-b border-amber-200 bg-amber-50 px-4 py-1.5 text-center text-xs text-amber-900 sm:px-6" role="note" data-test="prototype-notice">
        <strong>Prototype:</strong> sample data only. Changes are not saved and reset when you reload.
      </div>
      <main class="mx-auto w-full max-w-[1400px] flex-1 p-4 sm:p-6 lg:p-8">
        <slot />
      </main>
    </div>

    <AdminFeedbackLayer />
  </div>
</template>
