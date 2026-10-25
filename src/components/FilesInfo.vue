<script setup lang="ts">
import { computed, onBeforeUnmount, ref, watch } from 'vue'

import type { FilesData } from '@/api/backend'
import FileTreeNode from '@/components/FileTreeNode.vue'
import { buildFileTree } from '@/utils/fileTree'

const props = defineProps<{
  files?: FilesData | null
}>()

const emit = defineEmits<{
  'load-more': []
}>()

const tree = computed(() => (props.files ? buildFileTree(props.files.resources) : []))

const sentinel = ref<HTMLElement | null>(null)
const observer =
  typeof IntersectionObserver === 'undefined'
    ? null
    : new IntersectionObserver((entries) => {
        if (entries.some((entry) => entry.isIntersecting)) emit('load-more')
      })

// Re-observing after each page makes the observer report a still-visible sentinel again.
watch(
  [sentinel, () => props.files?.resources.length],
  ([element]) => {
    observer?.disconnect()
    if (element) observer?.observe(element)
  },
  { flush: 'post' },
)

onBeforeUnmount(() => observer?.disconnect())
</script>

<template>
  <section class="files-info" aria-labelledby="files-heading">
    <header class="files-header">
      <div>
        <p class="eyebrow">Storage</p>
        <h1 id="files-heading">Files</h1>
      </div>
      <span class="endpoint">GET /api/v1/files</span>
    </header>

    <p class="connection-state" :class="{ available: files }" role="status">
      <span class="status-indicator" aria-hidden="true"></span>
      {{ files ? 'Files available' : 'Files unavailable' }}
    </p>

    <dl class="files-details">
      <div class="files-row">
        <dt>Loaded</dt>
        <dd>{{ files ? `${files.resources.length} of ${files.pagination.total}` : '—' }}</dd>
      </div>
      <div class="files-row">
        <dt>Tombstones</dt>
        <dd>{{ files ? files.tombstones.length : '—' }}</dd>
      </div>
    </dl>

    <FileTreeNode v-if="tree.length > 0" :nodes="tree" class="file-tree" />
    <p v-else-if="files" class="files-empty">No files</p>
    <div v-if="files?.pagination.has_more" ref="sentinel" class="files-sentinel" role="status">
      Loading more files…
    </div>
  </section>
</template>

<style scoped>
.files-info {
  width: 100%;
  margin: 0;
  padding: 1.5rem;
  border: 1px solid var(--color-border);
  border-radius: 8px;
  background: var(--color-background-soft);
}

.files-header,
.files-row {
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

.files-details {
  border-top: 1px solid var(--color-border);
}

.files-row {
  padding: 0.75rem 0;
  border-bottom: 1px solid var(--color-border);
}

.file-tree,
.files-empty {
  margin-top: 1rem;
}

.files-sentinel {
  padding: 1rem 0;
  text-align: center;
}
</style>
