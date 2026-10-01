<script setup lang="ts">
interface HealthData {
  status: string
  version: string
  uptime_seconds: number
}

defineProps<{
  health?: HealthData | null
}>()

const formatUptime = (seconds: number) => {
  const days = Math.floor(seconds / 86_400)
  const hours = Math.floor((seconds % 86_400) / 3_600)
  const minutes = Math.floor((seconds % 3_600) / 60)
  const remainingSeconds = seconds % 60

  return [
    days > 0 ? `${days}d` : null,
    hours > 0 ? `${hours}h` : null,
    minutes > 0 ? `${minutes}m` : null,
    `${remainingSeconds}s`,
  ]
    .filter(Boolean)
    .join(' ')
}
</script>

<template>
  <section class="health-info" aria-labelledby="health-heading">
    <header class="health-header">
      <div>
        <p class="eyebrow">Service</p>
        <h1 id="health-heading">Health</h1>
      </div>
      <span class="endpoint">GET /health</span>
    </header>

    <p class="connection-state" :class="{ available: health }" role="status">
      <span class="status-indicator" aria-hidden="true"></span>
      {{ health ? 'Service erreichbar' : 'API noch nicht verbunden' }}
    </p>

    <dl class="health-details">
      <div class="health-row">
        <dt>Status</dt>
        <dd>{{ health?.status ?? '—' }}</dd>
      </div>
      <div class="health-row">
        <dt>Version</dt>
        <dd>{{ health?.version ?? '—' }}</dd>
      </div>
      <div class="health-row">
        <dt>Laufzeit</dt>
        <dd>{{ health ? formatUptime(health.uptime_seconds) : '—' }}</dd>
      </div>
    </dl>
  </section>
</template>

<style scoped>
.health-info {
  position: fixed;
  top: 1.5rem;
  right: 1.5rem;
  width: min(24rem, calc(100vw - 3rem));
  margin: 0;
  padding: 1.5rem;
  border: 1px solid var(--color-border);
  border-radius: 8px;
  background: var(--color-background-soft);
}

.health-header,
.health-row {
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

.health-details {
  border-top: 1px solid var(--color-border);
}

.health-row {
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
</style>