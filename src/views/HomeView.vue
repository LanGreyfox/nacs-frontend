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
    <div class="cards">
      <StatusInfo :status="status" />
      <PeersInfo :peers="peers" />
      <HealthInfo :health="health" />
    </div>
    <FilesInfo :files="files" @load-more="loadMore" />
  </main>
</template>

<style scoped>
main {
  box-sizing: border-box;
  padding: 1.5rem;
}

.cards {
  display: grid;
  grid-template-columns: repeat(3, 24rem);
  justify-content: space-between;
  align-items: start;
  gap: 1.5rem;
  margin-bottom: 1.5rem;
}
</style>
