import type { FileResource } from '@/api/backend'

export interface FileTreeNode {
  name: string
  path: string
  isFolder: boolean
  /** Only set for files. */
  resource?: FileResource
  children: FileTreeNode[]
}

function compareNodes(a: FileTreeNode, b: FileTreeNode): number {
  if (a.isFolder !== b.isFolder) return a.isFolder ? -1 : 1
  return a.name.localeCompare(b.name)
}

function sortTree(nodes: FileTreeNode[]): void {
  nodes.sort(compareNodes)
  for (const node of nodes) sortTree(node.children)
}

/** Builds a nested tree from flat resources; missing parent folders are created implicitly. */
export function buildFileTree(resources: FileResource[]): FileTreeNode[] {
  const roots: FileTreeNode[] = []
  const folders = new Map<string, FileTreeNode>()

  function ensureFolder(segments: string[]): FileTreeNode {
    const path = '/' + segments.join('/')
    const existing = folders.get(path)
    if (existing) return existing

    const node: FileTreeNode = {
      name: segments[segments.length - 1]!,
      path,
      isFolder: true,
      children: [],
    }
    folders.set(path, node)
    if (segments.length === 1) {
      roots.push(node)
    } else {
      ensureFolder(segments.slice(0, -1)).children.push(node)
    }
    return node
  }

  for (const resource of resources) {
    const segments = resource.path.split('/').filter(Boolean)
    // The root folder "/" has no segments and is represented by the tree itself.
    if (segments.length === 0) continue

    if (resource.kind === 'folder') {
      ensureFolder(segments)
      continue
    }

    const node: FileTreeNode = {
      name: segments[segments.length - 1]!,
      path: '/' + segments.join('/'),
      isFolder: false,
      resource,
      children: [],
    }
    if (segments.length === 1) {
      roots.push(node)
    } else {
      ensureFolder(segments.slice(0, -1)).children.push(node)
    }
  }

  sortTree(roots)
  return roots
}

export function formatBytes(bytes: number): string {
  const units = ['B', 'KB', 'MB', 'GB', 'TB']
  let value = bytes
  let unit = 0
  while (value >= 1024 && unit < units.length - 1) {
    value /= 1024
    unit++
  }
  return `${unit === 0 ? value : value.toFixed(1)} ${units[unit]}`
}
