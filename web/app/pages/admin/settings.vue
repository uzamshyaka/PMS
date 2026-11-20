<script setup lang="ts">
import type { ContentGroup } from '~/types/content-form'

definePageMeta({ layout: 'admin', permission: PERMISSIONS.settings, title: 'Settings' })

const GROUPS: ContentGroup[] = [
  {
    title: 'General',
    fields: [
      { key: 'siteName', label: 'System name', type: 'text', required: true, maxLength: 40 },
      { key: 'timezone', label: 'Time zone', type: 'select', options: [{ value: 'Africa/Nairobi', label: 'Africa/Nairobi (EAT, UTC+3)' }] },
    ],
  },
  {
    title: 'Currency',
    description: 'Prices are stored and shown in Kenyan Shillings.',
    fields: [
      { key: 'currency', label: 'Currency', type: 'select', options: [{ value: 'KES', label: 'Kenyan Shilling (KES)' }] },
      { key: 'currencySymbol', label: 'Display prefix', type: 'text', required: true, maxLength: 5 },
      { key: 'priceDecimals', label: 'Decimal places', type: 'number', min: 0, max: 2 },
    ],
  },
  {
    title: 'Contact information',
    description: 'Where system notifications are sent.',
    fields: [
      { key: 'contactEmail', label: 'Notification email', type: 'email', required: true },
      { key: 'contactPhone', label: 'Office phone', type: 'tel' },
    ],
  },
  {
    title: 'Website configuration',
    fields: [
      { key: 'listingsPerPage', label: 'Vehicles per page', type: 'number', min: 6, max: 48 },
      { key: 'showSoldVehicles', label: 'Show sold vehicles on the website', type: 'checkbox', wide: true },
    ],
  },
  {
    title: 'Images',
    fields: [
      { key: 'maxImageSizeMb', label: 'Maximum photo size (MB)', type: 'number', min: 1, max: 20 },
      { key: 'maxImagesPerVehicle', label: 'Maximum photos per vehicle', type: 'number', min: 1, max: 50 },
      { key: 'allowedImageTypes', label: 'Allowed types', type: 'select', options: [{ value: 'JPEG, PNG, WebP', label: 'JPEG, PNG, WebP' }], hint: 'Fixed for security; images are re-encoded on upload.' },
    ],
  },
]
</script>

<template>
  <div>
    <AdminPageHeader title="System settings" />
    <AdminContentForm section="settings" :groups="GROUPS" note="Settings are stored centrally. They are not applied to the website yet: listings per page, sold-vehicle visibility and image limits still use built-in values." />
  </div>
</template>
