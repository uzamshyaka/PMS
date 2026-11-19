<script setup lang="ts">
const LINKS = [
  { label: 'Home', to: '/' },
  { label: 'Inventory', to: '/inventory' },
  { label: 'About Us', to: '/about' },
  { label: 'Contact', to: '/contact' },
] as const

const route = useRoute()
const menuOpen = ref(false)

const isActive = (to: string) => (to === '/' ? route.path === '/' : route.path.startsWith(to))

watch(() => route.fullPath, () => { menuOpen.value = false })
watch(menuOpen, (open) => {
  if (import.meta.client) document.documentElement.classList.toggle('overflow-hidden', open)
})
onBeforeUnmount(() => {
  if (import.meta.client) document.documentElement.classList.remove('overflow-hidden')
})
</script>

<template>
  <header class="relative z-40 border-b border-line bg-white">
    <div class="container-site flex h-20 items-center justify-between gap-6">
      <SiteLogo />

      <nav aria-label="Main" class="hidden lg:block">
        <ul class="flex items-center gap-10">
          <li v-for="link in LINKS" :key="link.to">
            <NuxtLink
              :to="link.to"
              class="relative py-2 text-[12px] font-semibold uppercase tracking-[0.1em] text-ink/80 transition-colors hover:text-ink"
              :class="isActive(link.to) && 'text-ink after:absolute after:inset-x-0 after:-bottom-0.5 after:h-0.5 after:bg-ink'"
              :aria-current="isActive(link.to) ? 'page' : 'false'"
            >
              {{ link.label }}
            </NuxtLink>
          </li>
        </ul>
      </nav>

      <div class="flex items-center gap-2">
        <div class="hidden sm:block">
          <UiButton to="/inventory" size="sm" arrow>View Inventory</UiButton>
        </div>
        <button
          type="button"
          class="-mr-2 p-2 text-ink lg:hidden"
          :aria-expanded="menuOpen"
          aria-controls="mobile-nav"
          :aria-label="menuOpen ? 'Close menu' : 'Open menu'"
          data-test="menu-toggle"
          @click="menuOpen = !menuOpen"
        >
          <UiIcon :name="menuOpen ? 'close' : 'menu'" class="h-6 w-6" />
        </button>
      </div>
    </div>

    <div
      v-show="menuOpen"
      id="mobile-nav"
      class="absolute inset-x-0 top-full h-[calc(100dvh-5rem)] overflow-y-auto border-t border-line bg-white lg:hidden"
      data-test="mobile-nav"
    >
      <nav aria-label="Mobile" class="container-site py-6">
        <ul class="divide-y divide-line">
          <li v-for="link in LINKS" :key="link.to">
            <NuxtLink
              :to="link.to"
              class="flex items-center justify-between py-4 text-sm font-semibold uppercase tracking-[0.12em]"
              :class="isActive(link.to) ? 'text-ink' : 'text-ink/70'"
              :aria-current="isActive(link.to) ? 'page' : 'false'"
            >
              {{ link.label }}
              <UiIcon name="arrow-right" class="h-4 w-4" />
            </NuxtLink>
          </li>
        </ul>
        <UiButton to="/inventory" arrow class="mt-6 w-full">View Inventory</UiButton>
      </nav>
    </div>
  </header>
</template>
