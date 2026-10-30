<script setup lang="ts">
import type { StatusData } from '@/api/backend'

defineProps<{
  status?: StatusData | null
}>()

const formatBytes = (bytes: number) => {
  if (bytes < 1024) return `${bytes} B`
  const units = ['KiB', 'MiB', 'GiB', 'TiB']
  let value = bytes / 1024
  let unit = 0
  while (value >= 1024 && unit < units.length - 1) {
    value /= 1024
    unit++
  }
  return `${value.toFixed(1)} ${units[unit]}`
}

const progressPercent = (progress: number, total: number) =>
  total > 0 ? Math.min(100, Math.round((progress / total) * 100)) : 0
</script>

<template>
  <section class="status-info" aria-labelledby="status-heading">
    <header class="status-header">
      <div>
        <p class="eyebrow">Sync</p>
        <h1 id="status-heading">Status</h1>
      </div>
      <span class="endpoint">GET /api/v1/status</span>
    </header>

    <p class="connection-state" :class="{ available: status }" role="status">
      <span class="status-indicator" aria-hidden="true"></span>
      {{ status ? 'Status available' : 'Status unavailable' }}
    </p>

    <dl class="status-details">
      <div class="status-row">
        <dt>Sync</dt>
        <dd>{{ status ? (status.sync.is_active ? 'Active' : 'Idle') : '—' }}</dd>
      </div>
      <div class="status-row">
        <dt>Queue length</dt>
        <dd>{{ status?.sync.queue_length ?? '—' }}</dd>
      </div>
      <div class="status-row">
        <dt>Peers connected</dt>
        <dd>{{ status?.peers_connected ?? '—' }}</dd>
      </div>
    </dl>

    <div v-if="status?.sync.current_transfer" class="transfer" aria-label="Current transfer">
      <h2>Current transfer</h2>
      <p class="transfer-path">{{ status.sync.current_transfer.path }}</p>
      <p class="transfer-meta">
        {{ status.sync.current_transfer.event_kind }} · peer
        {{ status.sync.current_transfer.peer_id }} · {{ status.sync.current_transfer.username }}
      </p>
      <progress
        :value="status.sync.current_transfer.progress_bytes"
        :max="status.sync.current_transfer.total_bytes"
      ></progress>
      <p class="transfer-meta">
        {{ formatBytes(status.sync.current_transfer.progress_bytes) }} /
        {{ formatBytes(status.sync.current_transfer.total_bytes) }} ({{
          progressPercent(
            status.sync.current_transfer.progress_bytes,
            status.sync.current_transfer.total_bytes,
          )
        }}%)
      </p>
    </div>
  </section>
</template>

<style scoped>
.status-info {
  margin: 0;
  padding: 1.5rem;
  border: 1px solid var(--color-border);
  border-radius: 8px;
  background: var(--color-background-soft);
}

.status-header,
.status-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
}

.eyebrow {
  color: var(--color-text);
  font-size: 0.75rem;
  text-transform: uppercase;
}

h1 {
  color: var(--color-heading);
  font-size: 1.75rem;
  font-weight: 600;
}

h2 {
  color: var(--color-heading);
  font-size: 1rem;
  font-weight: 600;
}

.endpoint {
  padding: 0.25rem 0.5rem;
  border: 1px solid var(--color-border);
  border-radius: 4px;
  color: var(--color-text);
  font-family: monospace;
  font-size: 0.875rem;
}

.connection-state {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin: 1.5rem 0 1rem;
  color: #8a5a00;
}

.connection-state.available {
  color: #187448;
}

.status-indicator {
  width: 0.625rem;
  height: 0.625rem;
  flex: 0 0 auto;
  border-radius: 50%;
  background: currentColor;
}

.status-details {
  border-top: 1px solid var(--color-border);
}

.status-row {
  padding: 0.75rem 0;
  border-bottom: 1px solid var(--color-border);
}

dt {
  color: var(--color-text);
}

dd {
  color: var(--color-heading);
  font-family: monospace;
  text-align: right;
}

.transfer {
  margin-top: 1rem;
}

.transfer-path {
  color: var(--color-heading);
  font-family: monospace;
  overflow-wrap: anywhere;
}

.transfer-meta {
  color: var(--color-text);
  font-size: 0.875rem;
  overflow-wrap: anywhere;
}

progress {
  width: 100%;
  margin: 0.5rem 0;
}
</style>
