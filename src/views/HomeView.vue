<script setup lang="ts">
import HealthInfo from '@/components/HealthInfo.vue'
import StatusInfo from '@/components/StatusInfo.vue'
import { useHealth } from '@/composables/useHealth'
import { useStatus } from '@/composables/useStatus'

const { health } = useHealth()
const { status } = useStatus()
</script>

<template>
  <main>
    <StatusInfo :status="status" />
    <HealthInfo :health="health" />
  </main>
</template>
