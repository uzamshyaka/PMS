<script setup lang="ts">
// /admin is not a page of its own: the admin middleware sends it to the dashboard.
definePageMeta({ layout: 'admin', redirect: '/admin/dashboard' })
</script>

<template>
  <div />
</template>
