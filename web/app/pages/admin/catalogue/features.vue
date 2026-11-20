<script setup lang="ts">
definePageMeta({ layout: 'admin', permission: PERMISSIONS.vehicles, title: 'Features', section: { label: 'Vehicle catalogue', to: '/admin/catalogue/makes' } })
</script>

<template>
  <div>
    <AdminPageHeader title="Vehicle Features" description="Features that can be ticked on a vehicle, grouped by category. Deactivate instead of deleting, so existing vehicles keep their details." />
    <AdminCatalogueManager kind="features" />
  </div>
</template>
