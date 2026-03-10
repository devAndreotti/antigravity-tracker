// ─── PARSER ─────────────────────────────────────────────────────────────────
// Módulo puro: recebe strings, retorna objetos tipados. Sem I/O.

import matter from 'gray-matter'
import { basename, dirname } from 'path'
import { autoTag } from './autoTagger'

// ─── TYPES ──────────────────────────────────────────────────────────────────

export interface ParsedSkill {
  id: string
  name: string
  description: string
  category: string
  tags: string[]
  path: string
  origin: 'global' | 'user' | 'custom'
  updatedAt?: Date
}

export interface ParsedWorkflow {
  id: string
  slug: string
  description: string
  category: string
  tags: string[]
  origin: 'global' | 'local'
  workspace?: string
  path: string
}

export interface ParsedMcp {
  id: string
  name: string
  type: 'node' | 'docker' | 'python' | 'unknown'
  command: string
  args: string[]
  env: Record<string, string>
  description: string
  tools: string[]
  tags: string[]
  origin: 'global'
}

// ─── SKILL PARSER ───────────────────────────────────────────────────────────

export function parseSkillMd(content: string, filePath: string): ParsedSkill {
  try {
    const { data } = matter(content)
    const folderName = basename(dirname(filePath))
    const name = data.name || folderName
    const desc = data.description || ''

    // Mescla as tags manuais do MD com as tags geradas automaticamente
    const manualTags = normalizeTags(data.tags)
    const autoTags = autoTag({ name, description: desc, content, path: filePath })
    const mergedTags = Array.from(new Set([...manualTags, ...autoTags])).slice(0, 5)

    return {
      id: folderName,
      name,
      description: desc,
      category: data.category || inferCategoryFromTags(mergedTags),
      tags: mergedTags,
      path: filePath,
      origin: 'global',
    }
  } catch {
    const folderName = basename(dirname(filePath))
    return {
      id: folderName,
      name: folderName,
      description: '',
      category: 'General',
      tags: [],
      path: filePath,
      origin: 'global',
    }
  }
}

// ─── WORKFLOW PARSER ────────────────────────────────────────────────────────

export function parseWorkflowMd(content: string, filePath: string): ParsedWorkflow {
  try {
    const { data } = matter(content)
    const fileName = basename(filePath, '.md')
    const isLocal = filePath.includes('.agents') || filePath.includes('_agents') || filePath.includes('.agent') || filePath.includes('_agent')
    const workspaceMatch = filePath.match(/[/\\]([^/\\]+)[/\\]\.(?:agents?|_agents?)[/\\]/)

    const desc = data.description || ''
    const generatedTags = autoTag({ name: fileName, description: desc, content, path: filePath })

    return {
      id: `${isLocal ? 'local' : 'global'}-${fileName}`,
      slug: `/${fileName}`,
      description: desc,
      category: data.category || 'General',
      tags: generatedTags,
      origin: isLocal ? 'local' : 'global',
      workspace: isLocal ? (workspaceMatch?.[1] || undefined) : undefined,
      path: filePath,
    }
  } catch {
    const fileName = basename(filePath, '.md')
    return {
      id: `global-${fileName}`,
      slug: `/${fileName}`,
      description: '',
      category: 'General',
      tags: [],
      origin: 'global',
      path: filePath,
    }
  }
}

// ─── MCP CONFIG PARSER ──────────────────────────────────────────────────────

export function parseMcpConfig(raw: string): ParsedMcp[] {
  try {
    const json = JSON.parse(raw)
    const servers = json.mcpServers || json.mcp_servers || json.servers || {}
    return Object.entries(servers).map(([name, cfg]: [string, any]) => {
      const command = [cfg.command, ...(cfg.args || [])].filter(Boolean).join(' ')
      const desc = cfg.description || ''

      return {
        id: name,
        name,
        type: detectMcpType(cfg.command || ''),
        command,
        args: cfg.args || [],
        env: cfg.env || {},
        description: desc,
        tools: cfg.tools || [],
        tags: autoTag({ name, description: desc, command }),
        origin: 'global' as const,
      }
    })
  } catch {
    return []
  }
}

// ─── HELPERS ────────────────────────────────────────────────────────────────

function detectMcpType(command: string): ParsedMcp['type'] {
  if (command === 'docker') return 'docker'
  if (['uvx', 'uv', 'python', 'python3'].includes(command) || command.endsWith('.exe')) return 'python'
  if (['node', 'npx', 'bun', 'bunx'].includes(command)) return 'node'
  return 'unknown'
}

function normalizeTags(tags: unknown): string[] {
  if (Array.isArray(tags)) return tags.map(String)
  if (typeof tags === 'string') return tags.split(',').map(s => s.trim()).filter(Boolean)
  return []
}

function inferCategoryFromTags(tags: string[]): string {
  const t = tags.map(s => s.toLowerCase())
  if (t.some(x => ['react', 'css', 'ui', 'tailwind', 'html', 'frontend'].includes(x))) return 'Design'
  if (t.some(x => ['docx', 'pdf', 'pptx', 'xlsx', 'word', 'excel'].includes(x))) return 'Documents'
  if (t.some(x => ['n8n', 'automation', 'webhook'].includes(x))) return 'n8n'
  if (t.some(x => ['llm', 'api', 'sdk', 'ai', 'claude'].includes(x))) return 'AI'
  if (t.some(x => ['jest', 'vitest', 'test', 'pytest', 'playwright'].includes(x))) return 'Testing'
  if (t.some(x => ['p5', 'canvas', 'generative', 'creative'].includes(x))) return 'Creative'
  return 'General'
}
