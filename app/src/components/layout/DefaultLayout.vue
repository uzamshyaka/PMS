<template>
  <div class="flex h-screen w-full overflow-hidden bg-gradient-to-br from-[#F7FBFA] to-[#EEF7F5]">

    <!-- ================= SIDEBAR ================= -->
    <aside
      :class="[
        'flex flex-col h-screen flex-shrink-0 bg-gradient-to-b from-[#F1F9F8] to-[#E9F5F2] border-r border-slate-200/60 transition-all duration-300',
        isSidebarOpen ? 'w-64' : 'w-20'
      ]"
    >

      <!-- Sidebar Header -->
      <div
        :class="[
          'h-20 flex items-center',
          isSidebarOpen ? 'px-5' : 'justify-center'
        ]"
      >
        <div class="flex items-center gap-3">

          <!-- Logo -->
          <div
            class="h-10 w-10 rounded-full bg-gradient-to-br from-emerald-500 via-teal-600 to-cyan-700 flex items-center justify-center flex-shrink-0 shadow-lg shadow-emerald-500/25"
          >
            <svg
              class="w-5 h-5 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              stroke-width="2"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M12 5v14M5 12h14"
              />
            </svg>
          </div>

          <!-- Application name -->
          <div v-if="isSidebarOpen">
            <h2 class="text-lg font-semibold whitespace-nowrap bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-700 bg-clip-text text-transparent">
              Pharmacy
            </h2>
          </div>

        </div>
      </div>


      <!-- ================= NAVIGATION ================= -->
      <nav class="flex-1 overflow-y-auto px-3 py-4">

        <!-- MAIN MENU -->
        <div class="mb-8">

          <p
            v-if="isSidebarOpen"
            class="px-3 mb-3 text-[10px] font-semibold uppercase tracking-widest text-slate-400"
          >
            Main Menu
          </p>

          <div class="flex flex-col gap-1.5">

            <!-- Dashboard -->
            <a
              href="#"
              :class="[
                'group flex items-center gap-3 px-3.5 py-2.5 rounded-full text-sm font-medium transition-all duration-200',
                activeItem === 'Dashboard'
                  ? 'bg-[#073B3A] text-white shadow-md shadow-[#073B3A]/25'
                  : 'text-slate-600 hover:bg-white/80 hover:text-[#073B3A] hover:shadow-sm'
              ]"
              @click="activeItem = 'Dashboard'"
            >
              <span class="flex items-center justify-center w-6 h-6 flex-shrink-0">
                <svg
                  class="w-4.5 h-4.5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  stroke-width="2"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="M3 12l9-9 9 9"
                  />
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="M5 10v10h14V10"
                  />
                </svg>
              </span>

              <span v-if="isSidebarOpen">
                Dashboard
              </span>
            </a>


            <!-- Products -->
            <a
              href="#"
              :class="[
                'group flex items-center gap-3 px-3.5 py-2.5 rounded-full text-sm font-medium transition-all duration-200',
                activeItem === 'Products'
                  ? 'bg-[#073B3A] text-white shadow-md shadow-[#073B3A]/25'
                  : 'text-slate-600 hover:bg-white/80 hover:text-[#073B3A] hover:shadow-sm'
              ]"
              @click="activeItem = 'Products'"
            >
              <span class="flex items-center justify-center w-6 h-6">
                <svg
                  class="w-4.5 h-4.5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  stroke-width="2"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                  />
                </svg>
              </span>

              <span v-if="isSidebarOpen">
                Products
              </span>
            </a>


            <!-- Categories -->
            <a
              href="#"
              :class="[
                'group flex items-center gap-3 px-3.5 py-2.5 rounded-full text-sm font-medium transition-all duration-200',
                activeItem === 'Categories'
                  ? 'bg-[#073B3A] text-white shadow-md shadow-[#073B3A]/25'
                  : 'text-slate-600 hover:bg-white/80 hover:text-[#073B3A] hover:shadow-sm'
              ]"
              @click="activeItem = 'Categories'"
            >
              <span class="flex items-center justify-center w-6 h-6">
                <svg
                  class="w-4.5 h-4.5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  stroke-width="2"
                >
                  <circle cx="6" cy="6" r="2" />
                  <circle cx="18" cy="6" r="2" />
                  <circle cx="6" cy="18" r="2" />
                  <circle cx="18" cy="18" r="2" />
                </svg>
              </span>

              <span v-if="isSidebarOpen">
                Categories
              </span>
            </a>

          </div>
        </div>


        <!-- ================= LEADS ================= -->
        <div class="mb-8">

          <div
            v-if="isSidebarOpen"
            class="flex items-center justify-between px-3 mb-3"
          >
            <p class="text-[10px] font-semibold uppercase tracking-widest text-slate-400">
              Leads
            </p>

            <svg
              class="w-3.5 h-3.5 text-slate-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              stroke-width="2"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M5 15l7-7 7 7"
              />
            </svg>
          </div>

          <div class="flex flex-col gap-1.5">

            <!-- Orders -->
            <a
              href="#"
              :class="[
                'group flex items-center gap-3 px-3.5 py-2.5 rounded-full text-sm font-medium transition-all duration-200',
                activeItem === 'Orders'
                  ? 'bg-[#073B3A] text-white shadow-md shadow-[#073B3A]/25'
                  : 'text-slate-600 hover:bg-white/80 hover:text-[#073B3A] hover:shadow-sm'
              ]"
              @click="activeItem = 'Orders'"
            >
              <span class="flex items-center justify-center w-6 h-6">
                <svg
                  class="w-4.5 h-4.5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  stroke-width="2"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="M3 3h2l2.4 12.4a2 2 0 002 1.6h7.8a2 2 0 002-1.6L21 7H6"
                  />
                  <circle cx="10" cy="20" r="1" />
                  <circle cx="18" cy="20" r="1" />
                </svg>
              </span>

              <span v-if="isSidebarOpen">
                Orders
              </span>
            </a>


            <!-- Sales -->
            <a
              href="#"
              :class="[
                'group flex items-center gap-3 px-3.5 py-2.5 rounded-full text-sm font-medium transition-all duration-200',
                activeItem === 'Sales'
                  ? 'bg-[#073B3A] text-white shadow-md shadow-[#073B3A]/25'
                  : 'text-slate-600 hover:bg-white/80 hover:text-[#073B3A] hover:shadow-sm'
              ]"
              @click="activeItem = 'Sales'"
            >
              <span class="flex items-center justify-center w-6 h-6">
                <svg
                  class="w-4.5 h-4.5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  stroke-width="2"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="M4 19V5M4 19h16"
                  />
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="M8 16v-4M12 16V8M16 16v-7"
                  />
                </svg>
              </span>

              <span v-if="isSidebarOpen">
                Sales
              </span>
            </a>


            <!-- Customers -->
            <a
              href="#"
              :class="[
                'group flex items-center gap-3 px-3.5 py-2.5 rounded-full text-sm font-medium transition-all duration-200',
                activeItem === 'Customers'
                  ? 'bg-[#073B3A] text-white shadow-md shadow-[#073B3A]/25'
                  : 'text-slate-600 hover:bg-white/80 hover:text-[#073B3A] hover:shadow-sm'
              ]"
              @click="activeItem = 'Customers'"
            >
              <span class="flex items-center justify-center w-6 h-6">
                <svg
                  class="w-4.5 h-4.5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  stroke-width="2"
                >
                  <circle cx="9" cy="7" r="3" />
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="M3 21a6 6 0 0112 0"
                  />
                  <circle cx="17" cy="9" r="2.5" />
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="M17 14a4 4 0 014 4"
                  />
                </svg>
              </span>

              <span v-if="isSidebarOpen">
                Customers
              </span>
            </a>

          </div>
        </div>


        <!-- ================= COMMS ================= -->
        <div>

          <div
            v-if="isSidebarOpen"
            class="flex items-center justify-between px-3 mb-3"
          >
            <p class="text-[10px] font-semibold uppercase tracking-widest text-slate-400">
              Comms
            </p>

            <svg
              class="w-3.5 h-3.5 text-slate-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              stroke-width="2"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M5 15l7-7 7 7"
              />
            </svg>
          </div>

          <div class="flex flex-col gap-1.5">

            <!-- Payments -->
            <a
              href="#"
              :class="[
                'group flex items-center gap-3 px-3.5 py-2.5 rounded-full text-sm font-medium transition-all duration-200',
                activeItem === 'Payments'
                  ? 'bg-[#073B3A] text-white shadow-md shadow-[#073B3A]/25'
                  : 'text-slate-600 hover:bg-white/80 hover:text-[#073B3A] hover:shadow-sm'
              ]"
              @click="activeItem = 'Payments'"
            >
              <span class="flex items-center justify-center w-6 h-6">
                <svg
                  class="w-4.5 h-4.5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  stroke-width="2"
                >
                  <rect
                    x="3"
                    y="5"
                    width="18"
                    height="14"
                    rx="2"
                  />
                  <path d="M3 10h18" />
                </svg>
              </span>

              <span v-if="isSidebarOpen">
                Payments
              </span>
            </a>


            <!-- Reports -->
            <a
              href="#"
              :class="[
                'group flex items-center gap-3 px-3.5 py-2.5 rounded-full text-sm font-medium transition-all duration-200',
                activeItem === 'Reports'
                  ? 'bg-[#073B3A] text-white shadow-md shadow-[#073B3A]/25'
                  : 'text-slate-600 hover:bg-white/80 hover:text-[#073B3A] hover:shadow-sm'
              ]"
              @click="activeItem = 'Reports'"
            >
              <span class="flex items-center justify-center w-6 h-6">
                <svg
                  class="w-4.5 h-4.5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  stroke-width="2"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="M4 19V5M4 19h16"
                  />
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="M8 16l3-4 3 2 4-6"
                  />
                </svg>
              </span>

              <span v-if="isSidebarOpen">
                Reports
              </span>
            </a>


            <!-- Settings -->
            <a
              href="#"
              :class="[
                'group flex items-center gap-3 px-3.5 py-2.5 rounded-full text-sm font-medium transition-all duration-200',
                activeItem === 'Settings'
                  ? 'bg-[#073B3A] text-white shadow-md shadow-[#073B3A]/25'
                  : 'text-slate-600 hover:bg-white/80 hover:text-[#073B3A] hover:shadow-sm'
              ]"
              @click="activeItem = 'Settings'"
            >
              <span class="flex items-center justify-center w-6 h-6">
                <svg
                  class="w-4.5 h-4.5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  stroke-width="2"
                >
                  <circle cx="12" cy="12" r="3" />
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="M19.4 15a1.7 1.7 0 00.3 1.9l.1.1-1.8 1.8-.1-.1a1.7 1.7 0 00-1.9-.3 1.7 1.7 0 00-1 1.5v.1h-2.5v-.1a1.7 1.7 0 00-1-1.5 1.7 1.7 0 00-1.9.3l-.1.1-1.8-1.8.1-.1a1.7 1.7 0 00.3-1.9 1.7 1.7 0 00-1.5-1H6v-2.5h.1a1.7 1.7 0 001.5-1 1.7 1.7 0 00-.3-1.9l-.1-.1L9 6.7l.1.1a1.7 1.7 0 001.9.3 1.7 1.7 0 001-1.5v-.1h2.5v.1a1.7 1.7 0 001 1.5 1.7 1.7 0 001.9-.3l.1-.1 1.8 1.8-.1.1a1.7 1.7 0 00-.3 1.9 1.7 1.7 0 001.5 1h.1V14h-.1a1.7 1.7 0 00-1.5 1z"
                  />
                </svg>
              </span>

              <span v-if="isSidebarOpen">
                Settings
              </span>
            </a>

          </div>
        </div>

      </nav>


      <!-- ================= SIDEBAR FOOTER ================= -->
      <div class="p-3">

        <div
          :class="[
            'rounded-2xl bg-white border border-slate-200/60 shadow-sm transition-all hover:shadow-md',
            isSidebarOpen ? 'p-3.5' : 'p-2'
          ]"
        >

          <div
            class="flex items-center gap-3"
            :class="!isSidebarOpen && 'justify-center'"
          >

            <!-- Avatar -->
            <div class="relative flex-shrink-0">

              <div
                class="h-10 w-10 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center shadow-sm"
              >
                <span class="text-xs font-bold text-white">
                  BS
                </span>
              </div>

              <!-- Online -->
              <span
                class="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full bg-emerald-400 ring-2 ring-white"
              ></span>

            </div>

            <!-- User -->
            <div
              v-if="isSidebarOpen"
              class="flex-1 min-w-0"
            >
              <p class="text-sm font-semibold text-slate-700 truncate">
                Butodino Siregar
              </p>

              <p class="text-xs text-slate-400 truncate">
                budionosiregar@gmail.com
              </p>
            </div>

            <!-- Dropdown -->
            <button
              v-if="isSidebarOpen"
              class="text-slate-400 hover:text-slate-600"
            >
              <svg
                class="w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                stroke-width="2"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="M6 9l6 6 6-6"
                />
              </svg>
            </button>

          </div>

        </div>

      </div>

    </aside>


    <!-- ================= MAIN CONTENT ================= -->
    <div class="flex-1 flex flex-col min-w-0 overflow-hidden">

      <!-- ================= HEADER ================= -->
      <header
        class="h-20 flex-shrink-0 bg-white/80 backdrop-blur-xl border-b border-slate-200/50 shadow-[0_1px_0_0_rgba(15,23,42,0.03)] flex items-center justify-between px-8"
      >

        <!-- Left -->
        <div class="flex items-center gap-4">

          <!-- Mobile sidebar button -->
          <button
            @click="toggleSidebar"
            class="lg:hidden p-2 rounded-xl hover:bg-slate-100 transition"
          >
            <svg
              class="h-5 w-5 text-slate-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              stroke-width="2"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>

          <div>
            <h1 class="text-xl font-bold text-slate-800">
              {{ title }}
            </h1>

            <p
              v-if="subtitle"
              class="text-sm text-slate-400 mt-0.5"
            >
              {{ subtitle }}
            </p>
          </div>

        </div>


        <!-- Right -->
        <div class="flex items-center gap-3">

          <!-- Search -->
          <div
            class="hidden md:flex items-center gap-2 w-64 px-4 py-2.5 rounded-full bg-slate-50 border border-slate-200/70 transition-all focus-within:bg-white focus-within:border-[#073B3A]/30 focus-within:shadow-sm"
          >
            <svg
              class="w-4 h-4 text-slate-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              stroke-width="2"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>

            <input
              type="text"
              placeholder="Search"
              class="w-full bg-transparent outline-none text-sm text-slate-600 placeholder:text-slate-400"
            />

            <span class="text-[10px] text-slate-400">
              ⌘K
            </span>
          </div>


          <!-- Notifications -->
          <button
            class="relative p-2.5 rounded-full hover:bg-slate-100 transition"
          >
            <svg
              class="w-5 h-5 text-slate-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              stroke-width="2"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M15 17h5l-1.4-1.4A2 2 0 0118 14.2V11a6 6 0 00-4-5.7V5a2 2 0 10-4 0v.3A6 6 0 006 11v3.2a2 2 0 01-.6 1.4L4 17h5"
              />
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M9 17v1a3 3 0 006 0v-1"
              />
            </svg>

            <span
              class="absolute top-2 right-2 h-2 w-2 rounded-full bg-rose-500 ring-2 ring-white"
            ></span>
          </button>


          <!-- Divider -->
          <div class="w-px h-7 bg-slate-200"></div>


          <!-- User -->
          <div class="flex items-center gap-3">

            <div
              class="h-9 w-9 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center"
            >
              <span class="text-xs font-bold text-white">
                BS
              </span>
            </div>

            <div class="hidden sm:block">
              <p class="text-sm font-semibold text-slate-700">
                Butodino Siregar
              </p>

              <p class="text-xs text-slate-400">
                Admin
              </p>
            </div>

            <svg
              class="hidden sm:block w-4 h-4 text-slate-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              stroke-width="2"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M6 9l6 6 6-6"
              />
            </svg>

          </div>

        </div>

      </header>


      <!-- ================= PAGE CONTENT ================= -->
      <main class="flex-1 overflow-y-auto p-6 lg:p-8">
        <slot />
      </main>

    </div>

  </div>
</template>


<script setup>
import { ref } from 'vue'

defineProps({
  title: {
    type: String,
    default: 'Pharmacy',
  },
  subtitle: {
    type: String,
    default: '',
  },
})

const activeItem = ref('Dashboard')
const isSidebarOpen = ref(true)

function toggleSidebar() {
  isSidebarOpen.value = !isSidebarOpen.value
}
</script>
