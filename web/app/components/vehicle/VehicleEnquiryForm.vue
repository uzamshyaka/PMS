<script setup lang="ts">
import { useVuelidate } from '@vuelidate/core'
import { helpers, maxLength, minLength, required } from '@vuelidate/validators'
import type { PublicVehicle } from '~/types/vehicle'

/**
 * "Send us a message" form on a vehicle page. Creates an enquiry that staff
 * see under Admin → Enquiries. The hidden "website" field is a spam trap.
 */
const props = defineProps<{ vehicle: PublicVehicle }>()

const form = reactive({
  name: '',
  phone: '',
  message: `Hello, I'm interested in the ${props.vehicle.year} ${vehicleTitle(props.vehicle)}. Is it still available?`,
  website: '',
})
const sent = ref(false)
// Until the page is interactive, a click would do a plain form submit; keep the button disabled.
const ready = ref(false)
onMounted(() => { ready.value = true })
const sending = ref(false)
const serverError = ref('')
const serverErrors = ref<Record<string, string[]>>({})

const msg = helpers.withMessage
const kenyanPhone = (v: string) => /^(?:\+?254|0)[17]\d{8}$/.test(v.replace(/[\s-]/g, ''))
const v$ = useVuelidate({
  name: { required: msg('Please enter your name.', required), maxLength: maxLength(120) },
  phone: { required: msg('Please enter your phone number.', required), kenyanPhone: msg('Enter a Kenyan mobile number, e.g. 0712 345 678.', kenyanPhone) },
  message: { required: msg('Please write a message.', required), minLength: msg('Please write a little more.', minLength(5)) },
}, form)

const err = (k: 'name' | 'phone' | 'message') => (v$.value[k].$errors[0]?.$message as string | undefined) ?? serverErrors.value[k]?.[0]

async function submit() {
  serverError.value = ''
  serverErrors.value = {}
  if (!(await v$.value.$validate())) return
  sending.value = true
  try {
    await useApi()('/api/v1/public/enquiries', { method: 'POST', body: { ...form, vehicleSlug: props.vehicle.slug } })
    sent.value = true
  }
  catch (e) {
    const apiError = toApiError(e)
    serverErrors.value = apiError.errors
    serverError.value = apiError.status === 429 ? 'You have sent several messages already. Please call or WhatsApp us instead.' : apiError.message
  }
  finally {
    sending.value = false
  }
}

const field = 'w-full border border-white/20 bg-white/5 px-3 py-2.5 text-sm text-white placeholder:text-white/40 focus:border-bronze focus:outline-none aria-[invalid=true]:border-rose-400'
</script>

<template>
  <div data-test="enquiry-form">
    <p v-if="sent" class="border border-emerald-400/40 bg-emerald-400/10 px-4 py-3 text-sm text-emerald-100" role="status" data-test="enquiry-sent">
      Thank you. Our showroom team will contact you shortly.
    </p>
    <form v-else novalidate class="space-y-3" @submit.prevent="submit">
      <p class="label-caps text-[10px] text-white/60">Or send us a message</p>
      <div>
        <label for="enq-name" class="sr-only">Your name</label>
        <input id="enq-name" v-model.trim="form.name" class="admin-input" :class="field" placeholder="Your name" autocomplete="name" :aria-invalid="!!err('name')">
        <p v-if="err('name')" class="mt-1 text-xs text-rose-300">{{ err('name') }}</p>
      </div>
      <div>
        <label for="enq-phone" class="sr-only">Phone number</label>
        <input id="enq-phone" v-model.trim="form.phone" type="tel" class="admin-input" :class="field" placeholder="Phone, e.g. 0712 345 678" autocomplete="tel" :aria-invalid="!!err('phone')">
        <p v-if="err('phone')" class="mt-1 text-xs text-rose-300">{{ err('phone') }}</p>
      </div>
      <div>
        <label for="enq-message" class="sr-only">Message</label>
        <textarea id="enq-message" v-model.trim="form.message" rows="3" class="admin-input" :class="field" :aria-invalid="!!err('message')" />
        <p v-if="err('message')" class="mt-1 text-xs text-rose-300">{{ err('message') }}</p>
      </div>
      <!-- Spam trap: hidden from people, filled in by bots. -->
      <input v-model="form.website" type="text" name="website" tabindex="-1" autocomplete="off" class="hidden" aria-hidden="true">
      <p v-if="serverError" class="text-xs text-rose-300" role="alert">{{ serverError }}</p>
      <UiButton type="submit" variant="light" class="w-full" :disabled="sending || !ready" data-test="enquiry-submit">{{ sending ? 'Sending…' : 'Send Message' }}</UiButton>
    </form>
  </div>
</template>
