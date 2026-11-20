<script setup lang="ts">
const config = useRuntimeConfig()
</script>

<template>
  <div class="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-12 text-slate-800">
    <div class="w-full max-w-sm">
      <p class="mb-8 text-center text-lg font-semibold text-slate-900">
        {{ config.public.appName }} <span class="font-normal text-slate-500">Admin</span>
      </p>
      <div class="rounded-xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <slot />
      </div>
    </div>
  </div>
</template>
