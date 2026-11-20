<script setup lang="ts">
const contact = useShowroomContact()
const { appName } = useRuntimeConfig().public
const year = new Date().getFullYear()
</script>

<template>
  <footer class="bg-ink text-white">
    <div class="container-site grid gap-12 py-16 md:grid-cols-[1.4fr_1fr_1fr]">
      <div>
        <SiteLogo tone="light" />
        <p class="mt-6 max-w-sm text-sm leading-relaxed text-white/60">
          Quality vehicles, clearly presented. Browse the selection, then speak to our showroom team.
        </p>
      </div>

      <div>
        <p class="label-caps text-bronze">Explore</p>
        <ul class="mt-5 space-y-3 text-sm text-white/70">
          <li><NuxtLink to="/inventory" class="hover:text-white">Inventory</NuxtLink></li>
          <li><NuxtLink to="/about" class="hover:text-white">About Us</NuxtLink></li>
          <li><NuxtLink to="/contact" class="hover:text-white">Contact</NuxtLink></li>
        </ul>
      </div>

      <div>
        <p class="label-caps text-bronze">Showroom</p>
        <ul class="mt-5 space-y-3 text-sm text-white/70">
          <li class="flex gap-3"><UiIcon name="pin" class="mt-0.5 h-4 w-4 shrink-0 text-bronze" />{{ contact.address }}</li>
          <li class="flex gap-3"><UiIcon name="phone" class="mt-0.5 h-4 w-4 shrink-0 text-bronze" /><a :href="contact.telHref" class="hover:text-white">{{ contact.phone }}</a></li>
          <li class="flex gap-3"><UiIcon name="mail" class="mt-0.5 h-4 w-4 shrink-0 text-bronze" /><a :href="contact.mailHref" class="break-all hover:text-white">{{ contact.email }}</a></li>
          <li class="flex gap-3"><UiIcon name="clock" class="mt-0.5 h-4 w-4 shrink-0 text-bronze" />{{ contact.hours }}</li>
        </ul>
      </div>
    </div>
    <div class="border-t border-white/10">
      <div class="container-site flex flex-col gap-2 py-6 text-xs text-white/45 sm:flex-row sm:justify-between">
        <p>© {{ year }} {{ appName }}. All rights reserved.</p>
        <p>Vehicle details are provided for information and should be confirmed with our team.</p>
      </div>
    </div>
  </footer>
</template>
