<script setup lang="ts">
import type { ContentGroup } from '~/types/content-form'

definePageMeta({ layout: 'admin', permission: PERMISSIONS.website, title: 'About page', section: { label: 'Website', to: '/admin/website/homepage' } })

const GROUPS: ContentGroup[] = [{
  title: 'About page',
  fields: [
    { key: 'title', label: 'Page heading', type: 'text', required: true, maxLength: 80, wide: true },
    { key: 'intro', label: 'Introduction', type: 'textarea', required: true, maxLength: 300, wide: true },
    { key: 'body', label: 'Our story', type: 'textarea', required: true, maxLength: 2000, wide: true },
  ],
}]
</script>

<template>
  <div>
    <AdminPageHeader title="About page" />
    <AdminContentForm section="about" :groups="GROUPS" />
  </div>
</template>
