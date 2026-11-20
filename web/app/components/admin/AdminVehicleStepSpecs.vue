<script setup lang="ts">
import type { VehicleInput } from '~/types/admin'

defineProps<{ form: VehicleInput, errors: Record<string, string | undefined> }>()

const DRIVETRAINS = ['FWD', 'RWD', 'AWD', '4WD']
const GRADES = ['New', 'Excellent', 'Very good', 'Good', 'Fair']
</script>

<template>
  <div class="space-y-6">
    <AdminCard title="Listing" description="How the vehicle is sold.">
      <div class="grid gap-5 sm:grid-cols-3">
        <AdminField v-slot="{ id, invalid }" label="New or used" :error="errors.listingType" required>
          <select :id="id" v-model="form.listingType" class="admin-input" :aria-invalid="invalid" name="listingType">
            <option value="used">Used</option>
            <option value="new">New</option>
          </select>
        </AdminField>
        <AdminField v-slot="{ id, invalid }" label="Payment" :error="errors.payment" required>
          <select :id="id" v-model="form.payment" class="admin-input" :aria-invalid="invalid" name="payment">
            <option value="" disabled>Select…</option>
            <option v-for="t in PAYMENT_TERMS" :key="t.value" :value="t.value">{{ t.label }}</option>
          </select>
        </AdminField>
        <AdminField v-slot="{ id, invalid }" label="Sold from" :error="errors.location" required>
          <select :id="id" v-model="form.location" class="admin-input" :aria-invalid="invalid" name="location">
            <option value="" disabled>Select town…</option>
            <option v-for="l in LOCATIONS" :key="l" :value="l">{{ l }}</option>
          </select>
        </AdminField>
        <AdminField v-slot="{ id, invalid }" label="Price" :error="errors.priceKes" required hint="Kenyan Shillings, no decimals.">
          <div class="flex">
            <select v-model="form.currency" class="admin-input w-24 rounded-r-none border-r-0" aria-label="Currency" disabled>
              <option value="KES">KES</option>
            </select>
            <input :id="id" v-model.number="form.priceKes" type="number" inputmode="numeric" min="0" step="1000" class="admin-input rounded-l-none" :aria-invalid="invalid" name="priceKes">
          </div>
        </AdminField>
        <AdminField v-slot="{ id, invalid }" label="Mileage (km)" :error="errors.mileageKm" required>
          <input :id="id" v-model.number="form.mileageKm" type="number" inputmode="numeric" min="0" class="admin-input" :aria-invalid="invalid" :disabled="form.listingType === 'new'" name="mileageKm">
        </AdminField>
        <AdminField v-slot="{ id, invalid }" label="Condition" :error="errors.conditionGrade" required>
          <select :id="id" v-model="form.conditionGrade" class="admin-input" :aria-invalid="invalid" name="conditionGrade">
            <option value="" disabled>Select…</option>
            <option v-for="g in GRADES" :key="g" :value="g">{{ g }}</option>
          </select>
        </AdminField>
      </div>
    </AdminCard>

    <AdminCard title="Specifications">
      <div class="grid gap-5 sm:grid-cols-3">
        <AdminField v-slot="{ id, invalid }" label="Fuel type" :error="errors.fuel" required>
          <select :id="id" v-model="form.fuel" class="admin-input" :aria-invalid="invalid" name="fuel">
            <option value="" disabled>Select…</option>
            <option v-for="f in FUEL_TYPES" :key="f" :value="f">{{ f }}</option>
          </select>
        </AdminField>
        <AdminField v-slot="{ id, invalid }" label="Transmission" :error="errors.transmission" required>
          <select :id="id" v-model="form.transmission" class="admin-input" :aria-invalid="invalid" name="transmission">
            <option value="" disabled>Select…</option>
            <option v-for="t in TRANSMISSIONS" :key="t" :value="t">{{ t }}</option>
          </select>
        </AdminField>
        <AdminField v-slot="{ id, invalid }" label="Body style" :error="errors.bodyStyle" required>
          <select :id="id" v-model="form.bodyStyle" class="admin-input" :aria-invalid="invalid" name="bodyStyle">
            <option value="" disabled>Select…</option>
            <option v-for="b in BODY_STYLES" :key="b" :value="b">{{ b }}</option>
          </select>
        </AdminField>
        <AdminField v-slot="{ id, invalid }" label="Engine capacity (cc)" :error="errors.engineCc" required>
          <input :id="id" v-model.number="form.engineCc" type="number" inputmode="numeric" class="admin-input" :aria-invalid="invalid" name="engineCc">
        </AdminField>
        <AdminField v-slot="{ id, invalid }" label="Drivetrain" :error="errors.drivetrain" required>
          <select :id="id" v-model="form.drivetrain" class="admin-input" :aria-invalid="invalid" name="drivetrain">
            <option value="" disabled>Select…</option>
            <option v-for="d in DRIVETRAINS" :key="d" :value="d">{{ d }}</option>
          </select>
        </AdminField>
        <AdminField v-slot="{ id, invalid }" label="Exterior colour" :error="errors.exteriorColour" required>
          <input :id="id" v-model.trim="form.exteriorColour" class="admin-input" :aria-invalid="invalid" list="colour-options" name="exteriorColour">
        </AdminField>
        <AdminField v-slot="{ id }" label="Interior colour">
          <input :id="id" v-model.trim="form.interiorColour" class="admin-input" list="colour-options" name="interiorColour">
        </AdminField>
        <AdminField v-slot="{ id, invalid }" label="Doors" :error="errors.doors" required>
          <input :id="id" v-model.number="form.doors" type="number" min="2" max="5" class="admin-input" :aria-invalid="invalid" name="doors">
        </AdminField>
        <AdminField v-slot="{ id, invalid }" label="Seating capacity" :error="errors.seats" required>
          <input :id="id" v-model.number="form.seats" type="number" min="2" max="9" class="admin-input" :aria-invalid="invalid" name="seats">
        </AdminField>
      </div>
      <datalist id="colour-options"><option v-for="c in COLOURS" :key="c" :value="c" /></datalist>
    </AdminCard>
  </div>
</template>
