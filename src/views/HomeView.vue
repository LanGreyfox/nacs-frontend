<script setup lang="ts">
import HealthInfo from '@/components/HealthInfo.vue'
import { useHealth } from '@/composables/useHealth'

const { health } = useHealth()
</script>

<template>
  <main>
    <HealthInfo :health="health" />
  </main>
</template>
