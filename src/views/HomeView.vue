<script setup lang="ts">
import HealthInfo from '@/components/HealthInfo.vue'
import FilesInfo from '@/components/FilesInfo.vue'
import PeersInfo from '@/components/PeersInfo.vue'
import StatusInfo from '@/components/StatusInfo.vue'
import { useFiles } from '@/composables/useFiles'
import { useHealth } from '@/composables/useHealth'
import { usePeers } from '@/composables/usePeers'
import { useStatus } from '@/composables/useStatus'

const { files, loadMore } = useFiles()
const { health } = useHealth()
const { peers } = usePeers()
const { status } = useStatus()
</script>

<template>
  <main>
    <StatusInfo :status="status" />
    <PeersInfo :peers="peers" />
    <HealthInfo :health="health" />
    <FilesInfo :files="files" @load-more="loadMore" />
  </main>
</template>

<style scoped>
/* The three cards above are position: fixed, so reserve their height. */
main {
  /* Positioned against the viewport so the left inset matches the fixed cards. */
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  box-sizing: border-box;
  padding: 24rem 1.5rem 1.5rem;
}
</style>
