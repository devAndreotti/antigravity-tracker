import { readFileSync, readdirSync, existsSync } from 'fs'
import { join, basename } from 'path'
import { homedir } from 'os'

// Tipos de ativos do ecossistema Antigravity
export interface Skill {
  id: string
  name: string
  description: string
  path: string
  category: string
  origin: 'global' | 'user' | 'custom'
}

export interface Workflow {
  id: string
  slug: string
  description: string
  path: string
  scope: 'global' | 'local'
  workspace?: string
  origin: 'global' | 'user' | 'custom'
}

export interface McpServer {
  id: string
  name: string
  command: string
  args: string[]
  env: Record<string, string>
  type: 'node' | 'python' | 'docker' | 'url' | 'unknown'
  origin: 'global' | 'user' | 'custom'
}

export interface Workspace {
  id: string
  name: string
  uri: string
  corpusName: string
  hasAgents: boolean
  localWorkflows: string[]
}

// Parseia frontmatter YAML simples sem depender de gray-matter no main
function parseFrontmatter(content: string): Record<string, string> {
  const match = content.match(/^---\r?\n([\s\S]*?)\r?\n---/)
  if (!match) return {}
  const result: Record<string, string> = {}
  for (const line of match[1].split('\n')) {
    const colonIdx = line.indexOf(':')
    if (colonIdx > 0) {
      const key = line.slice(0, colonIdx).trim()
      const val = line.slice(colonIdx + 1).trim()
      result[key] = val
    }
  }
  return result
}

// Infere categoria a partir do nome da skill
function inferCategory(name: string): string {
  const n = name.toLowerCase()
  if (n.includes('n8n')) return 'n8n'
  if (n.includes('design') || n.includes('canvas') || n.includes('frontend') || n.includes('theme') || n.includes('dashboard')) return 'Design'
  if (n.includes('doc') || n.includes('pdf') || n.includes('pptx') || n.includes('xlsx') || n.includes('legal')) return 'Documents'
  if (n.includes('ai') || n.includes('claude') || n.includes('prompt') || n.includes('rag') || n.includes('mcp')) return 'AI'
  if (n.includes('test') || n.includes('debug') || n.includes('playwright')) return 'Testing'
  if (n.includes('git') || n.includes('deploy') || n.includes('ci') || n.includes('docker') || n.includes('vercel') || n.includes('railway')) return 'DevOps'
  if (n.includes('slack') || n.includes('gif') || n.includes('art') || n.includes('brand')) return 'Creative'
  return 'General'
}

// Escaneia todas as skills
export function scanSkills(): Skill[] {
  const skillsDir = join(homedir(), '.gemini', 'antigravity', 'skills')
  if (!existsSync(skillsDir)) return []

  const skills: Skill[] = []
  try {
    const dirs = readdirSync(skillsDir, { withFileTypes: true })
      .filter(d => d.isDirectory())

    for (const dir of dirs) {
      const skillPath = join(skillsDir, dir.name, 'SKILL.md')
      if (!existsSync(skillPath)) continue

      try {
        const content = readFileSync(skillPath, 'utf-8')
        const fm = parseFrontmatter(content)
        skills.push({
          id: dir.name,
          name: fm.name || dir.name,
          description: fm.description || '',
          path: skillPath,
          category: inferCategory(fm.name || dir.name),
          origin: 'global'
        })
      } catch {
        // Ignora skills com erro de leitura
      }
    }
  } catch {
    // Diretório de skills não acessível
  }

  return skills
}

// Escaneia workflows globais
export function scanGlobalWorkflows(): Workflow[] {
  const workflowsDir = join(homedir(), '.gemini', 'antigravity', 'global_workflows')
  if (!existsSync(workflowsDir)) return []

  const workflows: Workflow[] = []
  try {
    const files = readdirSync(workflowsDir)
      .filter(f => f.endsWith('.md'))

    for (const file of files) {
      const filePath = join(workflowsDir, file)
      try {
        const content = readFileSync(filePath, 'utf-8')
        const fm = parseFrontmatter(content)
        const slug = basename(file, '.md')
        workflows.push({
          id: `global-${slug}`,
          slug: `/${slug}`,
          description: fm.description || slug,
          path: filePath,
          scope: 'global',
          origin: 'global'
        })
      } catch {
        // Ignora workflow com erro
      }
    }
  } catch {
    // Diretório não acessível
  }

  return workflows
}

// Escaneia workflows locais de um diretório de workspace
function scanLocalWorkflows(workspacePath: string, workspaceName: string): Workflow[] {
  const workflows: Workflow[] = []
  const possiblePaths = [
    join(workspacePath, '.agents', 'workflows'),
    join(workspacePath, '.agent', 'workflows'),
    join(workspacePath, '_agents', 'workflows'),
    join(workspacePath, '_agent', 'workflows')
  ]

  for (const wfDir of possiblePaths) {
    if (!existsSync(wfDir)) continue
    try {
      const files = readdirSync(wfDir).filter(f => f.endsWith('.md'))
      for (const file of files) {
        const filePath = join(wfDir, file)
        try {
          const content = readFileSync(filePath, 'utf-8')
          const fm = parseFrontmatter(content)
          const slug = basename(file, '.md')
          workflows.push({
            id: `${workspaceName}-${slug}`,
            slug: `/${slug}`,
            description: fm.description || slug,
            path: filePath,
            scope: 'local',
            workspace: workspaceName,
            origin: 'user'
          })
        } catch {
          // Ignora
        }
      }
    } catch {
      // Diretório não acessível
    }
  }

  return workflows
}

// Detecta o tipo do MCP server pelo comando
function detectMcpType(command: string, args: string[]): McpServer['type'] {
  if (command.includes('docker')) return 'docker'
  if (command.includes('python') || command.includes('uvx') || command.includes('uv')) return 'python'
  if (command.includes('node') || command.includes('npx')) return 'node'
  if (args.some(a => a.includes('http://') || a.includes('https://'))) return 'url'
  return 'unknown'
}

// Escaneia MCPs registrados
export function scanMcps(): McpServer[] {
  const configPath = join(homedir(), '.gemini', 'antigravity', 'mcp_config.json')
  if (!existsSync(configPath)) return []

  try {
    const raw = readFileSync(configPath, 'utf-8')
    const config = JSON.parse(raw)
    const servers = config.mcpServers || config.servers || {}
    const mcps: McpServer[] = []

    for (const [name, serverConfig] of Object.entries(servers)) {
      const s = serverConfig as any
      mcps.push({
        id: name,
        name,
        command: s.command || '',
        args: s.args || [],
        env: s.env || {},
        type: detectMcpType(s.command || '', s.args || []),
        origin: 'global'
      })
    }

    return mcps
  } catch {
    return []
  }
}

// Escaneia workspaces registrados
export function scanWorkspaces(): { workspaces: Workspace[]; localWorkflows: Workflow[] } {
  const projectsPath = join(homedir(), '.gemini', 'projects.json')
  const workspaces: Workspace[] = []
  const localWorkflows: Workflow[] = []

  if (existsSync(projectsPath)) {
    try {
      const raw = readFileSync(projectsPath, 'utf-8')
      const projects = JSON.parse(raw)

      // Formato pode variar — tenta diferentes estruturas
      const entries = Array.isArray(projects) ? projects : Object.values(projects)

      for (const entry of entries) {
        const e = entry as any
        const uri = e.uri || e.path || ''
        const name = e.name || basename(uri) || uri

        // Verifica se tem .agents/ ou AGENTS.md
        const hasAgents = existsSync(join(uri, '.agents')) ||
          existsSync(join(uri, 'AGENTS.md')) ||
          existsSync(join(uri, '.agent'))

        const wfList = scanLocalWorkflows(uri, name)

        workspaces.push({
          id: name,
          name,
          uri,
          corpusName: e.corpusName || name,
          hasAgents,
          localWorkflows: wfList.map(w => w.slug)
        })

        localWorkflows.push(...wfList)
      }
    } catch {
      // Arquivo não parseável
    }
  }

  return { workspaces, localWorkflows }
}

// Escaneia tudo de uma vez
export function scanAll() {
  const skills = scanSkills()
  const globalWorkflows = scanGlobalWorkflows()
  const mcps = scanMcps()
  const { workspaces, localWorkflows } = scanWorkspaces()

  return {
    skills,
    workflows: [...globalWorkflows, ...localWorkflows],
    mcps,
    workspaces
  }
}
