<script setup lang="ts">
import type { InspectionSource, VehicleInspection } from '~/types/vehicle'

defineProps<{ inspections: VehicleInspection[] }>()

// Each claim says who stands behind it.
const SOURCE_LABEL: Record<InspectionSource, string> = {
  owner_declared: 'Declared by owner',
  admin_recorded: 'Recorded by our team',
  independently_verified: 'Independent inspection',
}
</script>

<template>
  <div>
    <ul v-if="inspections.length" class="divide-y divide-line border-y border-line" data-test="inspections">
      <li v-for="item in inspections" :key="item.title + item.date" class="py-5">
        <div class="flex flex-wrap items-center gap-2">
          <UiBadge v-if="isVerifiedInspection(item)" tone="success" data-test="verified-badge">
            <UiIcon name="check" class="h-3.5 w-3.5" /> Verified
          </UiBadge>
          <UiBadge :tone="item.source === 'owner_declared' ? 'neutral' : 'bronze'">{{ SOURCE_LABEL[item.source] }}</UiBadge>
          <span class="text-xs text-muted">{{ formatDate(item.date) }}</span>
        </div>
        <p class="mt-3 font-semibold">{{ item.title }}</p>
        <p class="mt-1 text-sm leading-relaxed text-muted">{{ item.summary }}</p>
        <p v-if="item.inspector" class="mt-1 text-xs text-muted">Inspected by: {{ item.inspector }}</p>
      </li>
    </ul>
    <p v-else class="text-sm text-muted">No inspection information has been recorded for this vehicle yet. Ask our team for details.</p>
    <p class="mt-4 text-xs leading-relaxed text-muted">
      Owner declarations have not been checked by us. Please confirm all details before purchase.
    </p>
  </div>
</template>
