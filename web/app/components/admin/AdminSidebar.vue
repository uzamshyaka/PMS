<script setup lang="ts">
import type { AdminNavItem } from '~/utils/admin-nav'

/**
 * Admin navigation. Items follow the user's permissions (UX only; the API
 * enforces access). `collapsed` shows icons only (tablet widths).
 */
const props = withDefaults(defineProps<{ collapsed?: boolean }>(), { collapsed: false })
const emit = defineEmits<{ navigate: [] }>()

const auth = useAuthStore()
const route = useRoute()
const { appName } = useRuntimeConfig().public

const groups = computed(() => visibleAdminNav(auth.can))
const open = ref<Record<string, boolean>>({})

const isActive = (to: string) => route.path === to || route.path.startsWith(`${to}/`)
const isGroupActive = (item: AdminNavItem) => isActive(item.to) || (item.children ?? []).some((c) => isActive(c.to))
const isOpen = (item: AdminNavItem) => open.value[item.to] ?? isGroupActive(item)
const toggle = (item: AdminNavItem) => { open.value[item.to] = !isOpen(item) }

const initials = computed(() => (auth.user?.name ?? '?').split(/\s+/).map((w) => w[0]).slice(0, 2).join('').toUpperCase())
const roleLabel = computed(() => auth.user?.roles.map(formatRole).join(', ') || 'No role')

async function logout() {
  await auth.logout()
  await navigateTo(ADMIN_LOGIN_PATH)
}

const linkBase = 'group relative flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors'
const linkIdle = 'text-white/65 hover:bg-white/5 hover:text-white'
const linkActive = 'bg-white/10 text-white before:absolute before:inset-y-1.5 before:-left-3 before:w-[3px] before:rounded-r before:bg-bronze'
</script>

<template>
  <div class="flex h-full flex-col bg-ink text-white" data-test="admin-sidebar">
    <!-- Branding -->
    <div class="flex h-16 shrink-0 items-center gap-3 border-b border-white/10" :class="props.collapsed ? 'justify-center px-2' : 'px-5'">
      <svg viewBox="0 0 40 40" class="h-8 w-8 shrink-0" fill="none" aria-hidden="true">
        <path d="M31 9.5A15 15 0 1 0 31 30.5" stroke="currentColor" stroke-width="3.2" stroke-linecap="square" />
        <path d="M14 20h18" stroke="#b08d57" stroke-width="2.4" />
      </svg>
      <div v-if="!props.collapsed" class="leading-tight">
        <p class="font-display text-sm font-bold uppercase tracking-[0.16em]">{{ appName }}</p>
        <p class="text-[10px] font-semibold uppercase tracking-[0.3em] text-bronze">Admin portal</p>
      </div>
    </div>

    <!-- Navigation -->
    <nav aria-label="Admin" class="flex-1 overflow-y-auto py-4" :class="props.collapsed ? 'px-2' : 'px-3'">
      <div v-for="group in groups" :key="group.heading" class="mb-5">
        <p v-if="!props.collapsed" class="mb-2 px-3 text-[10px] font-semibold uppercase tracking-[0.2em] text-white/35">{{ group.heading }}</p>
        <hr v-else class="mx-2 mb-3 border-white/10">
        <ul class="space-y-0.5">
          <li v-for="item in group.items" :key="item.to" data-test="nav-item" :data-nav="item.label">
            <!-- Group with children (expanded sidebar) -->
            <template v-if="item.children?.length && !props.collapsed">
              <button
                type="button"
                :class="[linkBase, 'w-full', isGroupActive(item) ? 'text-white' : linkIdle]"
                :aria-expanded="isOpen(item)"
                @click="toggle(item)"
              >
                <UiIcon :name="item.icon" class="h-5 w-5 shrink-0" />
                <span class="flex-1 text-left">{{ item.label }}</span>
                <UiIcon name="chevron-down" class="h-4 w-4 transition-transform" :class="isOpen(item) && 'rotate-180'" />
              </button>
              <ul v-show="isOpen(item)" class="mt-0.5 space-y-0.5 pl-11">
                <li v-for="child in item.children" :key="child.to">
                  <NuxtLink
                    :to="child.to"
                    class="block rounded-md px-3 py-1.5 text-[13px] transition-colors"
                    :class="isActive(child.to) ? 'bg-white/10 text-white' : 'text-white/55 hover:text-white'"
                    :aria-current="isActive(child.to) ? 'page' : 'false'"
                    @click="emit('navigate')"
                  >
                    {{ child.label }}
                  </NuxtLink>
                </li>
              </ul>
            </template>

            <!-- Single link, or a group shown as an icon when collapsed -->
            <NuxtLink
              v-else
              :to="item.children?.[0]?.to ?? item.to"
              :class="[linkBase, props.collapsed && 'justify-center px-0', isGroupActive(item) ? linkActive : linkIdle]"
              :aria-current="isGroupActive(item) ? 'page' : 'false'"
              :title="props.collapsed ? item.label : undefined"
              @click="emit('navigate')"
            >
              <UiIcon :name="item.icon" class="h-5 w-5 shrink-0" />
              <span :class="props.collapsed ? 'sr-only' : ''">{{ item.label }}</span>
            </NuxtLink>
          </li>
        </ul>
      </div>
    </nav>

    <!-- Profile & logout -->
    <div class="shrink-0 border-t border-white/10 p-3">
      <div class="flex items-center gap-3" :class="props.collapsed && 'flex-col'">
        <span class="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-bronze text-xs font-bold text-ink" aria-hidden="true">{{ initials }}</span>
        <div v-if="!props.collapsed" class="min-w-0 flex-1 leading-tight">
          <p class="truncate text-sm font-medium">{{ auth.user?.name }}</p>
          <p class="truncate text-xs text-white/50">{{ roleLabel }}</p>
        </div>
        <button
          type="button"
          class="rounded-md p-2 text-white/60 hover:bg-white/10 hover:text-white"
          aria-label="Log out"
          title="Log out"
          data-test="sidebar-logout"
          @click="logout"
        >
          <UiIcon name="logout" class="h-5 w-5" />
        </button>
      </div>
    </div>
  </div>
</template>
