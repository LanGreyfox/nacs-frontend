<script setup lang="ts">
import type { Peer, PeersData } from '@/api/backend'

defineProps<{
  peers?: PeersData | null
}>()

// Peer fields are not known yet (see `Peer` in `@/api/backend`), so each peer
// is rendered generically as key-value rows.
const peerEntries = (peer: Peer): [string, unknown][] => Object.entries(peer)

const formatValue = (value: unknown): string => (value === null ? '—' : String(value))
</script>

<template>
  <section class="peers-info" aria-labelledby="peers-heading">
    <header class="peers-header">
      <div>
        <p class="eyebrow">Network</p>
        <h1 id="peers-heading">Peers</h1>
      </div>
      <span class="endpoint">GET /api/v1/peers</span>
    </header>

    <p class="connection-state" :class="{ available: peers }" role="status">
      <span class="status-indicator" aria-hidden="true"></span>
      {{ peers ? 'Peers available' : 'Peers unavailable' }}
    </p>

    <dl class="peers-details">
      <div class="peers-row">
        <dt>Connected</dt>
        <dd>{{ peers ? `${peers.peers.length} of ${peers.pagination.total}` : '—' }}</dd>
      </div>
    </dl>

    <ul v-if="peers && peers.peers.length > 0" class="peer-list" aria-label="Connected peers">
      <li v-for="(peer, index) in peers.peers" :key="index" class="peer-item">
        <dl>
          <div v-for="[key, value] in peerEntries(peer)" :key="key" class="peer-row">
            <dt>{{ key }}</dt>
            <dd>{{ formatValue(value) }}</dd>
          </div>
        </dl>
      </li>
    </ul>
    <p v-else-if="peers" class="peer-empty">No peers connected</p>
  </section>
</template>

<style scoped>
.peers-info {
  position: fixed;
  top: 1.5rem;
  left: 50%;
  transform: translateX(-50%);
  width: min(24rem, calc(100vw - 3rem));
  margin: 0;
  padding: 1.5rem;
  border: 1px solid var(--color-border);
  border-radius: 8px;
  background: var(--color-background-soft);
}

.peers-header,
.peers-row {
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

.peers-details {
  border-top: 1px solid var(--color-border);
}

.peers-row {
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

.peer-list {
  margin: 1rem 0 0;
  padding: 0;
  list-style: none;
}

.peer-item + .peer-item {
  margin-top: 0.75rem;
  padding-top: 0.75rem;
  border-top: 1px solid var(--color-border);
}

.peer-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: 0.25rem 0;
}

.peer-row dd {
  overflow-wrap: anywhere;
}

.peer-empty {
  margin: 1rem 0 0;
  color: var(--color-text);
}
</style>
