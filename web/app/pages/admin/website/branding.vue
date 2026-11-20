<script setup lang="ts">
import type { ContentGroup } from '~/types/content-form'

definePageMeta({ layout: 'admin', permission: PERMISSIONS.website, title: 'Branding', section: { label: 'Website', to: '/admin/website/homepage' } })

const GROUPS: ContentGroup[] = [{
  title: 'Logo and branding',
  fields: [
    { key: 'siteName', label: 'Site name', type: 'text', required: true, maxLength: 40 },
    { key: 'tagline', label: 'Tagline', type: 'text', maxLength: 40 },
    { key: 'accentColour', label: 'Accent colour', type: 'color', hint: 'Used for gold/bronze highlights.' },
    { key: 'logoUrl', label: 'Logo', type: 'image', hint: 'PNG, JPEG or WebP up to 8 MB.', wide: true },
  ],
}]
</script>

<template>
  <div>
    <AdminPageHeader title="Branding" />
    <AdminContentForm section="branding" :groups="GROUPS" />
  </div>
</template>
