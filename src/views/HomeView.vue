<script setup lang="ts">
import HealthInfo from '@/components/HealthInfo.vue'
import PeersInfo from '@/components/PeersInfo.vue'
import StatusInfo from '@/components/StatusInfo.vue'
import { useHealth } from '@/composables/useHealth'
import { usePeers } from '@/composables/usePeers'
import { useStatus } from '@/composables/useStatus'

const { health } = useHealth()
const { peers } = usePeers()
const { status } = useStatus()
</script>

<template>
  <main>
    <StatusInfo :status="status" />
    <PeersInfo :peers="peers" />
    <HealthInfo :health="health" />
  </main>
</template>
