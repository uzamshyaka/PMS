<script setup lang="ts">
import type { ContentGroup } from '~/types/content-form'

definePageMeta({ layout: 'admin', permission: PERMISSIONS.website, title: 'Homepage', section: { label: 'Website', to: '/admin/website/homepage' } })

const GROUPS: ContentGroup[] = [
  {
    title: 'Hero',
    description: 'The large heading at the top of the homepage.',
    fields: [
      { key: 'heroEyebrow', label: 'Small heading', type: 'text', required: true, maxLength: 60 },
      { key: 'heroTitle', label: 'Main word', type: 'text', required: true, maxLength: 20, hint: 'Shown in large capitals, e.g. "Drive".' },
      { key: 'heroScript', label: 'Script word', type: 'text', required: true, maxLength: 20, hint: 'Shown in the gold script font, e.g. "Excellence".' },
      { key: 'heroSubtitle', label: 'Supporting line', type: 'text', required: true, maxLength: 120 },
    ],
  },
  {
    title: 'Featured vehicles',
    fields: [{ key: 'featuredVehicleIds', label: 'Vehicles on the homepage', type: 'vehicles', hint: 'Only published vehicles can be featured. The homepage shows up to 4 new and 4 used; if none are chosen it shows the newest.' }],
  },
]
</script>

<template>
  <div>
    <AdminPageHeader title="Homepage content" />
    <AdminContentForm section="homepage" :groups="GROUPS" />
  </div>
</template>
