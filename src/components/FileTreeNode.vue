<script setup lang="ts">
import { formatBytes, type FileTreeNode } from '@/utils/fileTree'

defineProps<{
  nodes: FileTreeNode[]
}>()

const formatDate = (iso: string): string => new Date(iso).toLocaleString()
</script>

<template>
  <ul class="tree">
    <li v-for="node in nodes" :key="node.path" class="tree-node">
      <details v-if="node.isFolder" class="folder">
        <summary>
          <span class="name">{{ node.name }}/</span>
        </summary>
        <FileTreeNode :nodes="node.children" />
      </details>
      <div v-else class="file">
        <span class="name">{{ node.name }}</span>
        <span class="meta">
          {{ formatBytes(node.resource!.size) }} · {{ formatDate(node.resource!.updated_at) }}
        </span>
      </div>
    </li>
  </ul>
</template>

<style scoped>
.tree {
  list-style: none;
  margin: 0;
  padding: 0;
}

.tree .tree {
  padding-left: 1.25rem;
}

summary,
.file {
  padding: 0.25rem 0;
}

summary {
  cursor: pointer;
}

.file {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  padding-left: 1rem;
}

.name {
  overflow-wrap: anywhere;
}

.meta {
  flex: 0 0 auto;
  color: var(--color-text);
  font-size: 0.875rem;
}
</style>
