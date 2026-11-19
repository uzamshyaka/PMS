<template>
  <!--
    CSS-only dark showroom used when no photograph is available: converging
    ceiling light strips, a dark stone wall on the left, a glass wall with
    mullions on the right and a polished floor with reflections.
  -->
  <div class="overflow-hidden bg-[#0a0a0c]" aria-hidden="true">
    <!-- ambient light -->
    <div class="absolute inset-0 bg-[radial-gradient(ellipse_70%_55%_at_50%_100%,rgba(205,180,138,0.22),transparent_70%),radial-gradient(ellipse_45%_70%_at_92%_45%,rgba(170,190,210,0.20),transparent_70%),radial-gradient(ellipse_40%_60%_at_6%_40%,rgba(120,100,80,0.28),transparent_70%)]" />

    <!-- stone wall (left) -->
    <div class="absolute inset-y-0 left-0 w-[30%] bg-[linear-gradient(115deg,#1c1b1d_0%,#121214_45%,transparent_100%)]" />
    <div class="absolute left-[4%] top-[20%] h-[45%] w-px bg-gradient-to-b from-transparent via-white/15 to-transparent" />

    <!-- glass wall (right) -->
    <div class="absolute inset-y-[8%] right-0 w-[36%] bg-[linear-gradient(90deg,transparent,rgba(190,205,220,0.10))] [mask-image:linear-gradient(to_left,black_40%,transparent)]" />
    <div class="absolute inset-y-[8%] right-0 w-[36%] bg-[repeating-linear-gradient(90deg,rgba(255,255,255,0.14)_0,rgba(255,255,255,0.14)_2px,transparent_2px,transparent_88px)] [mask-image:linear-gradient(to_left,black_30%,transparent)]" />

    <!-- converging ceiling light strips -->
    <div class="absolute left-1/2 top-0 h-[2px] w-[85%] -translate-x-1/2 bg-gradient-to-r from-transparent via-white/35 to-transparent" />
    <div class="absolute -top-[5%] left-[2%] h-[62%] w-[3px] origin-top -rotate-[52deg] bg-gradient-to-b from-white/90 via-white/50 to-transparent shadow-[0_0_18px_4px_rgba(255,255,255,0.25)]" />
    <div class="absolute -top-[5%] right-[2%] h-[62%] w-[3px] origin-top rotate-[52deg] bg-gradient-to-b from-white/90 via-white/50 to-transparent shadow-[0_0_18px_4px_rgba(255,255,255,0.25)]" />
    <div class="absolute -top-[5%] left-[22%] h-[40%] w-[2px] origin-top -rotate-[30deg] bg-gradient-to-b from-white/60 to-transparent" />
    <div class="absolute -top-[5%] right-[22%] h-[40%] w-[2px] origin-top rotate-[30deg] bg-gradient-to-b from-white/60 to-transparent" />

    <!-- polished floor -->
    <div class="absolute inset-x-0 bottom-0 h-[34%] bg-gradient-to-t from-white/[0.10] via-white/[0.04] to-transparent" />
    <div class="absolute inset-x-[10%] bottom-[33%] h-px bg-gradient-to-r from-transparent via-white/40 to-transparent" />
    <div class="absolute bottom-[8%] left-1/2 h-[18%] w-[46%] -translate-x-1/2 rounded-[50%] bg-[radial-gradient(closest-side,rgba(205,180,138,0.22),transparent)] blur-md" />
  </div>
</template>
