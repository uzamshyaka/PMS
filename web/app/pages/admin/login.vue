<script setup lang="ts">
definePageMeta({ layout: 'auth' })
useHead({ title: 'Sign in' })
</script>

<template>
  <div>
    <h1 class="text-xl font-semibold text-slate-900">Sign in</h1>
    <p class="mb-6 mt-1 text-sm text-slate-500">Administrator access only.</p>
    <AuthLoginForm />
  </div>
</template>
