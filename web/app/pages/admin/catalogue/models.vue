<script setup lang="ts">
definePageMeta({ layout: 'admin', permission: PERMISSIONS.vehicles, title: 'Models', section: { label: 'Vehicle catalogue', to: '/admin/catalogue/makes' } })
</script>

<template>
  <div>
    <AdminPageHeader title="Vehicle Models" description="Models belong to a make. Deactivate instead of deleting, so existing vehicles keep their details." />
    <AdminCatalogueManager kind="models" />
  </div>
</template>
