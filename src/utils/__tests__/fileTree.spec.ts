import { describe, expect, it } from 'vitest'

import type { FileResource } from '@/api/backend'
import { buildFileTree, formatBytes } from '@/utils/fileTree'

function resource(path: string, kind: 'file' | 'folder' = 'file'): FileResource {
  return { path, kind, size: 10, checksum: null, updated_at: '2026-09-13T07:50:23Z' }
}

describe('buildFileTree', () => {
  it('returns an empty tree for no resources', () => {
    expect(buildFileTree([])).toEqual([])
  })

  it('ignores the root folder entry', () => {
    expect(buildFileTree([resource('/', 'folder')])).toEqual([])
  })

  it('nests files below their folders', () => {
    const tree = buildFileTree([resource('/dump', 'folder'), resource('/dump/a.log')])

    expect(tree).toHaveLength(1)
    expect(tree[0]!.name).toBe('dump')
    expect(tree[0]!.isFolder).toBe(true)
    expect(tree[0]!.children.map((c) => c.path)).toEqual(['/dump/a.log'])
  })

  it('creates missing parent folders implicitly', () => {
    const tree = buildFileTree([resource('/a/b/c.txt')])

    expect(tree[0]!.name).toBe('a')
    expect(tree[0]!.children[0]!.name).toBe('b')
    expect(tree[0]!.children[0]!.children[0]!.name).toBe('c.txt')
  })

  it('sorts folders before files, then alphabetically', () => {
    const tree = buildFileTree([
      resource('/z.txt'),
      resource('/b.txt'),
      resource('/m', 'folder'),
      resource('/a', 'folder'),
    ])

    expect(tree.map((n) => n.name)).toEqual(['a', 'm', 'b.txt', 'z.txt'])
  })
})

describe('formatBytes', () => {
  it('formats values with a suitable unit', () => {
    expect(formatBytes(0)).toBe('0 B')
    expect(formatBytes(1023)).toBe('1023 B')
    expect(formatBytes(1536)).toBe('1.5 KB')
    expect(formatBytes(5 * 1024 * 1024)).toBe('5.0 MB')
  })
})
