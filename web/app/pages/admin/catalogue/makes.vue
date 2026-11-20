<script setup lang="ts">
definePageMeta({ layout: 'admin', permission: PERMISSIONS.vehicles, title: 'Makes', section: { label: 'Vehicle catalogue', to: '/admin/catalogue/makes' } })
</script>

<template>
  <div>
    <AdminPageHeader title="Vehicle Makes" description="Vehicle makes offered when adding vehicles. Deactivate instead of deleting, so existing vehicles keep their details." />
    <AdminCatalogueManager kind="makes" />
  </div>
</template>
