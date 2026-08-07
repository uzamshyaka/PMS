<script setup>
import { computed, ref } from 'vue'
import DefaultLayout from '../../components/layout/DefaultLayout.vue'

const recentSales = ref([
  { name: 'Astro Code', medicine: 'Paracetamol', email: 'astro@example.com', qty: 2, total: '24.00', date: 'Apr 22, 2025' },
  { name: 'Jane Smith', medicine: 'Amoxicillin', email: 'jane@example.com', qty: 1, total: '18.50', date: 'Apr 21, 2025' },
  { name: 'Mike Brown', medicine: 'Ibuprofen', email: '', qty: 3, total: '32.25', date: 'Apr 20, 2025' },
])

const salesData = [20, 35, 65, 48, 38, 25]
const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const peakIndex = salesData.indexOf(Math.max(...salesData))

// Same emerald/teal/cyan family used on the login screen
const purchaseSplit = [
  { label: 'Purchases', value: 38, color: '#34d399' },
  { label: 'Suppliers', value: 27, color: '#0d9488' },
  { label: 'Sales', value: 24, color: '#06b6d4' },
  { label: 'No Sales', value: 11, color: '#cbd5e1' },
]

const donutGradient = computed(() => {
  let start = 0
  const stops = purchaseSplit.map((seg) => {
    const end = start + seg.value * 3.6
    const stop = `${seg.color} ${start}deg ${end}deg`
    start = end
    return stop
  })
  return `conic-gradient(${stops.join(', ')})`
})

const stats = [
  {
    title: "Today's Sales",
    value: '$95.00',
    change: '+2.5%',
    changeLabel: 'This Month',
    bg: 'bg-emerald-100',
    iconBg: 'bg-white/60',
    iconColor: 'text-[#073B3A]',
    bars: [5, 9, 14, 20],
  },
  {
    title: 'Available Categories',
    value: '1,457',
    change: '+2.5%',
    changeLabel: 'This Month',
    bg: 'bg-teal-100',
    iconBg: 'bg-white/60',
    iconColor: 'text-[#073B3A]',
    bars: [8, 12, 16, 10],
  },
  {
    title: 'Expired Medicines',
    value: '0.00%',
    change: '+2.5%',
    changeLabel: 'This Month',
    bg: 'bg-rose-100',
    iconBg: 'bg-white/60',
    iconColor: 'text-[#073B3A]',
    bars: [12, 7, 16, 10],
  },
  {
    title: 'System Users',
    value: '255K',
    change: '+2.5%',
    changeLabel: 'This Month',
    bg: 'bg-cyan-100',
    iconBg: 'bg-white/60',
    iconColor: 'text-[#073B3A]',
    bars: [6, 14, 10, 20],
  },
]
</script>

<template>
  <DefaultLayout class="fixed inset-0" title="Pharmacy" subtitle="Welcome Code Astro!">
    <div class="min-h-full">
      <!-- Dashboard Header -->
      <div class="mb-8 flex items-center justify-between">
        <div>
          <h1 class="text-2xl font-semibold text-[#073B3A]">
            Welcome Back!
          </h1>
          <p class="mt-1 text-sm text-slate-400">
            Here's what's happening with your pharmacy today.
          </p>
        </div>

        <div class="flex items-center gap-2">
          <button
            class="hidden sm:flex items-center gap-2 rounded-xl border border-slate-200/70 bg-white px-4 py-2.5 text-sm text-slate-600 shadow-sm transition hover:bg-slate-50"
          >
            <svg class="h-4 w-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <rect x="3" y="4" width="18" height="18" rx="2" />
              <path d="M16 2v4M8 2v4M3 10h18" />
            </svg>
            This Month
            <svg class="h-4 w-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path d="M6 9l6 6 6-6" />
            </svg>
          </button>

          <button
            class="rounded-xl border border-slate-200/70 bg-white p-2.5 text-slate-500 shadow-sm transition hover:bg-slate-50"
          >
            <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M4 4v5h5M20 20v-5h-5" />
              <path stroke-linecap="round" stroke-linejoin="round" d="M20 9a8 8 0 00-14.5-4.5L4 9M4 15a8 8 0 0014.5 4.5L20 15" />
            </svg>
          </button>
        </div>
      </div>

      <!-- Dashboard Content -->
      <div class="flex flex-col gap-10 pb-6">
        <!-- Stat Cards -->
        <div class="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4 xl:gap-6">
          <section
            v-for="(stat, i) in stats"
            :key="i"
            :class="['relative overflow-hidden rounded-2xl p-6 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg', stat.bg]"
          >
            <div class="flex items-start justify-between">
              <div :class="['flex h-9 w-9 items-center justify-center rounded-full', stat.iconBg]">
                <!-- Dynamic icons per card -->
                <svg v-if="i === 0" class="h-4 w-4" :class="stat.iconColor" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <circle cx="12" cy="12" r="9" />
                  <path d="M12 7v10M9 10c0-1.2 1.3-2 3-2s3 .8 3 2-1.3 2-3 2-3 .8-3 2 1.3 2 3 2 3-.8 3-2" />
                </svg>
                <svg v-else-if="i === 1" class="h-4 w-4" :class="stat.iconColor" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <circle cx="6" cy="6" r="2" />
                  <circle cx="18" cy="6" r="2" />
                  <circle cx="6" cy="18" r="2" />
                  <circle cx="18" cy="18" r="2" />
                </svg>
                <svg v-else-if="i === 2" class="h-4 w-4" :class="stat.iconColor" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v4m0 4h.01M10.3 4h3.4L21 19H3L10.3 4z" />
                </svg>
                <svg v-else class="h-4 w-4" :class="stat.iconColor" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <circle cx="9" cy="7" r="3" />
                  <path d="M3 21a6 6 0 0112 0" />
                  <circle cx="17" cy="9" r="2" />
                </svg>
              </div>
              <button class="h-8 w-8 rounded-full bg-white/30 text-slate-600 transition hover:bg-white/50">
                •••
              </button>
            </div>

            <p class="mt-4 text-xs font-medium text-slate-500">
              {{ stat.title }}
            </p>
            <h2 class="mt-1 text-2xl font-semibold text-[#073B3A]">
              {{ stat.value }}
            </h2>
            <p class="mt-1 text-xs text-slate-500">
              <span class="font-semibold text-[#073B3A]">{{ stat.change }}</span>
              {{ stat.changeLabel }}
            </p>

            <!-- Decorative bars -->
            <div class="absolute bottom-0 right-4 flex items-end gap-1 opacity-30">
              <span
                v-for="(h, j) in stat.bars"
                :key="j"
                class="w-2 rounded-t bg-[#073B3A]"
                :style="{ height: h + 'px' }"
              />
            </div>
          </section>
        </div>

        <!-- Charts Section -->
        <div class="grid grid-cols-1 gap-6 xl:grid-cols-2">
          <!-- Graph Report -->
          <section class="rounded-2xl border border-slate-200/60 bg-white p-6 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg">
            <div class="mb-6 flex items-center justify-between">
              <div>
                <h2 class="text-lg font-semibold text-[#073B3A]">Graph Report</h2>
                <p class="mt-1 text-xs text-slate-400">Sales performance</p>
              </div>
              <button class="h-8 w-8 rounded-full bg-slate-50 text-slate-400 transition hover:bg-slate-100">
                •••
              </button>
            </div>

            <div class="flex h-56 flex-col items-center justify-center gap-8 sm:flex-row sm:gap-10">
              <!-- Donut -->
              <div
                class="relative h-44 w-44 flex-shrink-0 rounded-full"
                :style="{ background: donutGradient }"
              >
                <div class="absolute inset-[16%] flex flex-col items-center justify-center rounded-full bg-white shadow-inner">
                  <span class="text-2xl font-semibold text-[#073B3A]">1,240</span>
                  <span class="text-[11px] text-slate-400">Total Orders</span>
                </div>
              </div>

              <!-- Legend -->
              <div class="grid grid-cols-2 gap-x-8 gap-y-5 sm:grid-cols-1">
                <div
                  v-for="seg in purchaseSplit"
                  :key="seg.label"
                  class="flex items-center gap-2.5"
                >
                  <span
                    class="h-2.5 w-2.5 flex-shrink-0 rounded-full"
                    :style="{ backgroundColor: seg.color }"
                  />
                  <div>
                    <p class="text-xs text-slate-500">{{ seg.label }}</p>
                    <p class="text-sm font-semibold text-[#073B3A]">{{ seg.value }}%</p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <!-- Total Sales Overview -->
          <section class="rounded-2xl border border-slate-200/60 bg-white p-6 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg">
            <div class="mb-6 flex items-center justify-between">
              <div>
                <h2 class="text-lg font-semibold text-[#073B3A]">Total Sales Overview</h2>
                <p class="mt-1 text-xs text-slate-400">Weekly sales performance</p>
              </div>
              <button class="h-8 w-8 rounded-full bg-slate-50 text-slate-400 transition hover:bg-slate-100">
                •••
              </button>
            </div>

            <div class="flex h-56 items-end justify-between gap-3">
              <div
                v-for="(value, index) in salesData"
                :key="index"
                class="flex flex-1 flex-col items-center gap-3"
              >
                <div class="relative flex h-48 w-full items-end justify-center">
                  <div class="absolute bottom-0 w-10 rounded-t-full bg-slate-100" style="height: 100%" />
                  <div
                    class="relative w-10 rounded-t-full transition-all duration-500"
                    :class="index === peakIndex ? 'bg-teal-600' : 'bg-emerald-200'"
                    :style="{ height: value + '%' }"
                  />
                  <span
                    v-if="index === peakIndex"
                    class="absolute -top-8 rounded-lg bg-[#073B3A] px-3 py-1.5 text-xs font-semibold text-white"
                  >
                    $298K
                  </span>
                </div>
                <span class="text-xs font-medium text-slate-400">{{ weekDays[index] }}</span>
              </div>
            </div>
          </section>
        </div>

        <!-- Recent Sales -->
        <section class="overflow-hidden rounded-2xl border border-slate-200/60 bg-white shadow-sm transition-shadow duration-200 hover:shadow-md">
          <div class="flex flex-col gap-4 p-6 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 class="text-lg font-semibold text-[#073B3A]">Recent Sales List</h2>
              <p class="mt-1 text-xs text-slate-400">Latest transactions</p>
            </div>

            <div class="flex items-center gap-2">
              <div class="flex items-center gap-2 rounded-xl border border-slate-200/70 bg-slate-50 px-3 py-2">
                <svg class="h-4 w-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text"
                  placeholder="Search..."
                  class="w-24 bg-transparent text-xs text-slate-600 outline-none placeholder:text-slate-400 sm:w-32"
                />
              </div>
              <button class="hidden items-center gap-2 rounded-xl border border-slate-200/70 bg-slate-50 px-3 py-2 text-xs text-slate-500 transition hover:bg-slate-100 sm:flex">
                Filter
              </button>
            </div>
          </div>

          <!-- Table -->
          <div class="overflow-x-auto">
            <table class="w-full text-sm">
              <thead>
                <tr class="border-y border-slate-100 bg-slate-50/50">
                  <th class="px-6 py-3 text-left text-xs font-medium text-slate-400">Name</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-slate-400">Medicine</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-slate-400">User Email</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-slate-400">Quantity</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-slate-400">Total Price</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-slate-400">Date</th>
                  <th class="px-6 py-3 text-right text-xs font-medium text-slate-400">Action</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-100">
                <tr
                  v-for="sale in recentSales"
                  :key="sale.name"
                  class="transition hover:bg-[#F7FBFA]"
                >
                  <td class="px-6 py-4">
                    <div class="flex items-center gap-3">
                      <div class="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-emerald-300 to-teal-400">
                        <span class="text-xs font-bold text-white">{{ sale.name.charAt(0) }}</span>
                      </div>
                      <span class="font-medium text-slate-700">{{ sale.name }}</span>
                    </div>
                  </td>
                  <td class="px-6 py-4 text-slate-600">{{ sale.medicine }}</td>
                  <td class="px-6 py-4 text-slate-400">{{ sale.email || 'guest@example.com' }}</td>
                  <td class="px-6 py-4">
                    <div class="flex items-center gap-2">
                      <button class="h-6 w-6 rounded-full bg-slate-100 text-slate-500 transition hover:bg-slate-200">
                        −
                      </button>
                      <span class="text-xs font-medium text-slate-600">{{ sale.qty }}</span>
                      <button class="h-6 w-6 rounded-full bg-[#073B3A] text-white transition hover:opacity-90">
                        +
                      </button>
                    </div>
                  </td>
                  <td class="px-6 py-4 font-semibold text-slate-700">${{ sale.total }}</td>
                  <td class="px-6 py-4 text-xs text-slate-400">{{ sale.date || 'Apr 22, 2025 12:00 AM' }}</td>
                  <td class="px-6 py-4">
                    <div class="flex justify-end gap-1">
                      <button class="rounded-lg p-2 text-xs text-slate-500 transition hover:bg-slate-100 hover:text-slate-700">
                        Edit
                      </button>
                      <button class="rounded-lg p-2 text-xs text-slate-500 transition hover:bg-red-50 hover:text-red-500">
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Pagination -->
          <div class="flex flex-col gap-3 border-t border-slate-100 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
            <p class="text-xs text-slate-400">Showing 1–3 of 120 entries</p>
            <div class="flex items-center gap-1">
              <button class="rounded-lg border border-slate-200 px-3 py-1.5 text-xs text-slate-500 transition hover:bg-slate-50">
                Prev
              </button>
              <button class="h-8 w-8 rounded-lg bg-[#073B3A] text-xs font-medium text-white transition">
                1
              </button>
              <button class="h-8 w-8 rounded-lg text-xs text-slate-500 transition hover:bg-slate-100">
                2
              </button>
              <button class="rounded-lg border border-slate-200 px-3 py-1.5 text-xs text-slate-500 transition hover:bg-slate-50">
                Next
              </button>
            </div>
          </div>
        </section>
      </div>
    </div>
  </DefaultLayout>
</template>
