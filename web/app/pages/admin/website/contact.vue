<script setup lang="ts">
import type { ContentGroup } from '~/types/content-form'

definePageMeta({ layout: 'admin', permission: PERMISSIONS.website, title: 'Contact details', section: { label: 'Website', to: '/admin/website/homepage' } })

const GROUPS: ContentGroup[] = [{
  title: 'Showroom contact details',
  description: 'Shown in the footer, on the Contact page and on every vehicle enquiry panel. Business details only; never an owner\'s.',
  fields: [
    { key: 'phone', label: 'Phone', type: 'tel', required: true },
    { key: 'whatsapp', label: 'WhatsApp number', type: 'tel', required: true, hint: 'International format without +, e.g. 254700000000.' },
    { key: 'email', label: 'Email', type: 'email', required: true },
    { key: 'hours', label: 'Opening hours', type: 'text', required: true, maxLength: 60 },
    { key: 'address', label: 'Showroom address', type: 'textarea', required: true, maxLength: 200, wide: true },
  ],
}]
</script>

<template>
  <div>
    <AdminPageHeader title="Contact details" />
    <AdminContentForm section="contact" :groups="GROUPS" />
  </div>
</template>
