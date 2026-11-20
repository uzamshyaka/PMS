<script setup lang="ts">
import type { ContentGroup } from '~/types/content-form'

definePageMeta({ layout: 'admin', permission: PERMISSIONS.website, title: 'SEO', section: { label: 'Website', to: '/admin/website/homepage' } })

const GROUPS: ContentGroup[] = [{
  title: 'Search engine metadata',
  description: 'Default title and description used by search engines and when links are shared.',
  fields: [
    { key: 'metaTitle', label: 'Default title', type: 'text', required: true, maxLength: 60, wide: true, hint: 'Up to about 60 characters display in search results.' },
    { key: 'metaDescription', label: 'Default description', type: 'textarea', required: true, maxLength: 160, wide: true, hint: 'Up to about 160 characters display in search results.' },
    { key: 'ogImageUrl', label: 'Sharing image', type: 'image', wide: true, hint: 'Shown when links are shared on WhatsApp or social media. 1200×630 recommended.' },
  ],
}]
</script>

<template>
  <div>
    <AdminPageHeader title="SEO" />
    <AdminContentForm section="seo" :groups="GROUPS" />
  </div>
</template>
