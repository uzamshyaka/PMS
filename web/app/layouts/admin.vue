<script setup lang="ts">
const config = useRuntimeConfig()
const menuOpen = ref(false)
</script>

<template>
  <div class="min-h-screen lg:flex">
    <aside
      class="fixed inset-y-0 left-0 z-40 w-64 bg-slate-900 transition-transform lg:static lg:translate-x-0"
      :class="menuOpen ? 'translate-x-0' : '-translate-x-full'"
    >
      <div class="flex h-16 items-center border-b border-slate-800 px-6">
        <NuxtLink :to="ADMIN_HOME_PATH" class="text-base font-semibold text-white">
          {{ config.public.appName }} <span class="font-normal text-slate-400">Admin</span>
        </NuxtLink>
      </div>
      <AdminSidebar @navigate="menuOpen = false" />
    </aside>

    <div v-if="menuOpen" class="fixed inset-0 z-30 bg-slate-900/40 lg:hidden" @click="menuOpen = false" />

    <div class="flex min-w-0 flex-1 flex-col">
      <AdminHeader @toggle-menu="menuOpen = !menuOpen" />
      <main class="flex-1 p-4 sm:p-6 lg:p-8">
        <slot />
      </main>
    </div>
  </div>
</template>
