
<template>
  <div class="fixed inset-0 z-50 flex overflow-hidden bg-white">
    <!-- Left panel - Pharmacy Branding with Image -->
    <div class="hidden lg:flex lg:w-2/5 relative flex-col items-center justify-center p-8 overflow-hidden">
      <!-- Background gradient -->
      <div class="absolute inset-0 bg-gradient-to-br from-emerald-600 via-teal-700 to-cyan-800"></div>
      
      <!-- Decorative pattern overlay -->
      <div class="absolute inset-0 opacity-10">
        <svg class="w-full h-full" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
          <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
            <circle cx="10" cy="10" r="1.5" fill="white"/>
          </pattern>
          <rect width="100" height="100" fill="url(#grid)"/>
        </svg>
      </div>
      
      <!-- Floating medical icons -->
      <div class="absolute top-8 right-8 text-white/20 animate-float">
        <svg class="w-16 h-16" fill="currentColor" viewBox="0 0 24 24">
          <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 3c1.93 0 3.5 1.57 3.5 3.5S13.93 13 12 13s-3.5-1.57-3.5-3.5S10.07 6 12 6zm7 13H5v-.23c0-.62.28-1.2.76-1.58C7.47 15.82 9.64 15 12 15s4.53.82 6.24 2.19c.48.38.76.97.76 1.58V19z"/>
        </svg>
      </div>
      <div class="absolute bottom-12 left-8 text-white/20 animate-float-delay">
        <svg class="w-12 h-12" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14H9V8h2v8zm4 0h-2V8h2v8z"/>
        </svg>
      </div>
      <div class="absolute top-1/3 left-6 text-white/10 animate-float-delay-2">
        <svg class="w-10 h-10" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm.31 8.86c-1.77-.45-2.34-.94-2.34-1.67 0-.84.79-1.43 2.03-1.43 1.24 0 1.92.59 2.04 1.45h2.36c-.12-1.54-1.32-2.61-2.88-2.79V6h-3v1.23c-1.72.31-2.94 1.44-2.94 2.87 0 1.69 1.29 2.77 3.18 3.22 1.77.45 2.34.94 2.34 1.67 0 .84-.79 1.43-2.03 1.43-1.24 0-1.92-.59-2.04-1.45h-2.36c.12 1.54 1.32 2.61 2.88 2.79V18h3v-1.23c1.72-.31 2.94-1.44 2.94-2.87 0-1.69-1.29-2.77-3.18-3.22z"/>
        </svg>
      </div>

      <!-- Main content - centered -->
      <div class="relative z-10 flex flex-col items-center text-center px-6">
        <!-- Medical Image / Illustration -->
        <div class="relative w-64 h-64 mb-8">
          <!-- Glow effect -->
          <div class="absolute inset-0 bg-white/10 rounded-full blur-2xl"></div>
          
          <!-- Main medical illustration -->
          <svg class="w-full h-full relative" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
            <!-- Background circle -->
            <circle cx="100" cy="100" r="85" fill="white" fill-opacity="0.08" stroke="white" stroke-opacity="0.15" stroke-width="1.5"/>
            <circle cx="100" cy="100" r="65" fill="white" fill-opacity="0.05" stroke="white" stroke-opacity="0.1" stroke-width="1"/>
            
            <!-- Medical cross (large) -->
            <rect x="85" y="40" width="30" height="60" rx="4" fill="white" fill-opacity="0.25"/>
            <rect x="65" y="60" width="70" height="30" rx="4" fill="white" fill-opacity="0.25"/>
            
            <!-- Heartbeat pulse -->
            <path d="M35 110 L55 110 L65 95 L80 120 L92 100 L105 110 L125 110" 
                  stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" opacity="0.6"/>
            
            <!-- Pills -->
            <ellipse cx="145" cy="85" rx="12" ry="6" fill="white" fill-opacity="0.2" stroke="white" stroke-opacity="0.3" stroke-width="1.5"/>
            <ellipse cx="155" cy="85" rx="6" ry="12" fill="white" fill-opacity="0.15" stroke="white" stroke-opacity="0.2" stroke-width="1.5"/>
            
            <!-- Small cross decorations -->
            <rect x="45" y="60" width="8" height="20" rx="1.5" fill="white" fill-opacity="0.12"/>
            <rect x="38" y="67" width="22" height="8" rx="1.5" fill="white" fill-opacity="0.12"/>
            
            <!-- Capsule -->
            <rect x="40" y="135" width="24" height="10" rx="5" fill="white" fill-opacity="0.15" stroke="white" stroke-opacity="0.2" stroke-width="1.5"/>
            <rect x="52" y="135" width="12" height="10" rx="5" fill="white" fill-opacity="0.25" stroke="white" stroke-opacity="0.2" stroke-width="1.5"/>
            
            <!-- Floating dots -->
            <circle cx="60" cy="45" r="3" fill="white" fill-opacity="0.15"/>
            <circle cx="150" cy="60" r="2.5" fill="white" fill-opacity="0.12"/>
            <circle cx="50" cy="170" r="2" fill="white" fill-opacity="0.1"/>
            <circle cx="160" cy="150" r="3" fill="white" fill-opacity="0.12"/>
            <circle cx="75" cy="30" r="2" fill="white" fill-opacity="0.08"/>
            <circle cx="130" cy="175" r="2.5" fill="white" fill-opacity="0.1"/>
          </svg>
        </div>

        <!-- Brand Text -->
        <div class="space-y-3">
          <div class="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-1.5 rounded-full border border-white/20">
            <svg class="w-4 h-4 text-white/80" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14H9V8h2v8zm4 0h-2V8h2v8z"/>
            </svg>
            <span class="text-xs font-medium text-white/80">Pharmacy Management System</span>
          </div>
          
          <h2 class="text-4xl font-bold text-white tracking-tight">
            MediTrack<span class="text-emerald-300">Pharma</span>
          </h2>
          
          <p class="text-white/70 text-sm max-w-xs leading-relaxed">
            Secure access to your pharmacy dashboard. Manage prescriptions, inventory, and patient care efficiently.
          </p>
          
          <!-- Trust badges -->
          <div class="flex items-center justify-center gap-6 pt-2">
            <span class="flex items-center gap-1.5 text-xs text-white/60">
              <svg class="w-4 h-4 text-emerald-300" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
              </svg>
              HIPAA Compliant
            </span>
            <span class="flex items-center gap-1.5 text-xs text-white/60">
              <svg class="w-4 h-4 text-emerald-300" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
              </svg>
              Secure Rx
            </span>
            <span class="flex items-center gap-1.5 text-xs text-white/60">
              <svg class="w-4 h-4 text-emerald-300" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
              </svg>
              24/7 Support
            </span>
          </div>
        </div>
      </div>
      
      <!-- Bottom decoration -->
      <div class="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-emerald-300/30 to-transparent"></div>
    </div>

    <!-- Right panel - Login form (centered with spacing) -->
     
    <div class="w-full lg:w-3/5 flex items-center justify-center px-6 py-12 bg-white">
      <div class="w-full max-w-sm mx-auto flex flex-col items-center">
        <StatesComponent />
        <!-- Mobile brand -->
        <div class="lg:hidden flex items-center gap-3 mb-10">
          <div class="h-10 w-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/25">
            <svg class="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <span class="text-xl font-bold text-slate-800">MediTrack</span>
        </div>

        <form novalidate @submit.prevent="handleSubmit" class="w-full space-y-6">
          <!-- Header - centered -->
          <div class="text-center mb-2">
            <h1 class="text-2xl font-bold text-slate-900">Welcome back</h1>
            <p class="mt-1.5 text-sm text-slate-500">Sign in to your pharmacy dashboard</p>
          </div>

          <!-- Email -->
          <div class="space-y-2">
            <label for="email" class="text-sm font-medium text-slate-700 block">Email address</label>
            <div class="relative">
              <div class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                <svg class="h-5 w-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <input
                id="email"
                v-model="form.email"
                type="email"
                autocomplete="email"
                placeholder="pharmacist@example.com"
                :aria-invalid="v$.email.$error"
                @blur="v$.email.$touch()"
                class="w-full rounded-xl border border-slate-200 bg-slate-50/50 pl-11 pr-4 py-3.5 text-sm text-slate-800 placeholder:text-slate-400 focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-400/30 focus:bg-white transition duration-200 aria-[invalid=true]:border-rose-400 aria-[invalid=true]:ring-rose-400/30"
              />
            </div>
            <p v-if="v$.email.$error" class="text-xs text-rose-500">{{ v$.email.$errors[0]?.$message }}</p>
          </div>

          <!-- Password -->
          <div class="space-y-2">
            <div class="flex items-center justify-between">
              <label for="password" class="text-sm font-medium text-slate-700">Password</label>
              <a href="#" class="text-xs font-medium text-emerald-600 hover:text-emerald-700 transition">Forgot password?</a>
            </div>
            <div class="relative">
              <div class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                <svg class="h-5 w-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <input
                id="password"
                v-model="form.password"
                type="password"
                autocomplete="current-password"
                placeholder="••••••••"
                :aria-invalid="v$.password.$error"
                @blur="v$.password.$touch()"
                class="w-full rounded-xl border border-slate-200 bg-slate-50/50 pl-11 pr-4 py-3.5 text-sm text-slate-800 placeholder:text-slate-400 focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-400/30 focus:bg-white transition duration-200 aria-[invalid=true]:border-rose-400 aria-[invalid=true]:ring-rose-400/30"
              />
            </div>
            <p v-if="v$.password.$error" class="text-xs text-rose-500">{{ v$.password.$errors[0]?.$message }}</p>
          </div>

          <!-- Remember me - centered -->
          <div class="flex items-center justify-center pt-1">
            <label class="flex items-center gap-2.5 text-sm text-slate-600 cursor-pointer hover:text-slate-800 transition">
              <input v-model="form.remember" type="checkbox" class="h-4.5 w-4.5 rounded border-slate-300 text-emerald-500 focus:ring-emerald-400 focus:ring-offset-0 accent-emerald-500" />
              Keep me signed in
            </label>
          </div>

          <!-- Submit -->
          <button
            type="submit"
            class="w-full rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 py-3.5 text-sm font-semibold text-white shadow-md shadow-emerald-500/25 transition-all duration-200 hover:from-emerald-600 hover:to-teal-700 hover:shadow-emerald-500/40 hover:scale-[1.02] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100"
            :disabled="apiState.loading"
          >
            <span v-if="!apiState.loading">Sign in</span>
            <span v-else class="flex items-center justify-center gap-2">
              <svg class="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Signing in...
            </span>
          </button>

          <!-- Divider -->
          <div class="relative pt-1">
            <div class="absolute inset-0 flex items-center">
              <div class="w-full border-t border-slate-200"></div>
            </div>
            <div class="relative flex justify-center text-sm">
              <span class="bg-white px-4 text-slate-400">or continue with</span>
            </div>
          </div>

          <!-- Social buttons -->
          <div class="grid grid-cols-2 gap-3">
            <button type="button" class="flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-600 hover:bg-slate-50 hover:border-slate-300 transition shadow-sm">
              <svg class="h-5 w-5" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              Google
            </button>
            <button type="button" class="flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-600 hover:bg-slate-50 hover:border-slate-300 transition shadow-sm">
              <svg class="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.15 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.62.24 2.85.12 3.15.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
              </svg>
              GitHub
            </button>
          </div>

          <!-- Sign up - centered -->
          <p class="text-center text-sm text-slate-500 pt-1">
            New to MediTrack?
            <a href="#" class="font-semibold text-emerald-600 hover:text-emerald-700 transition">Create account</a>
          </p>
        </form>

        <!-- Demo hint - centered -->
        <div class="mt-8 text-center text-xs text-slate-400">
          <span class="inline-block bg-emerald-50/80 px-4 py-1.5 rounded-full border border-emerald-200/50 text-emerald-700 text-xs font-medium">
            🏥 demo: pharmacist@example.com / password123
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref } from 'vue'
import useVuelidate from '@vuelidate/core'
import { required, email as emailFormat } from '@vuelidate/validators'
import StatesComponent from '@/components/states/StateComponent.vue'
import { useApiState } from '@/stores/apiState'
import api from '@/api/auth/auth.js'
import { useRouter } from 'vue-router'
const form = reactive({
  email: '',
  password: '',
  remember: false,
})

const rules = {
  email: { required, email: emailFormat },
  password: { required },
}

const v$ = useVuelidate(rules, form)
const router = useRouter()

const apiState = useApiState()

async function handleSubmit() {
  const isValid = await v$.value.$validate()
  if (!isValid) return
  apiState.setLoading(true)
  apiState.setMessage('Signing in...')
  apiState.setSuccess(false)
  apiState.setError(false)
  try {
    await api.login(form.email, form.password) // Simulate API call
    apiState.setSuccess(true)
    apiState.setMessage('Successfully signed in!')
    apiState.setError(false)
    router.push({ name: 'dashboard' })
  }
  catch (error) {
    apiState.setError(true)

    const response = error.response?.data
    apiState.setMessage(response?.message ?? 'Failed to sign in. Please try again.')

    if (response?.errors && typeof response.errors === 'object') {
      apiState.setErrors(Object.values(response.errors).flat())
    }
  } finally {
    apiState.setLoading(false)
  }
}
</script>