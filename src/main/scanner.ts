// ─── SCANNER ────────────────────────────────────────────────────────────────
// Escaneia o filesystem para encontrar assets do ecossistema Antigravity.
// Usa funções async e delega parsing para parser.ts.

import { readFile, readdir, access, stat } from 'fs/promises'
import { join, basename } from 'path'
import { parseSkillMd, parseWorkflowMd, parseMcpConfig } from './parser'
import type { ParsedSkill, ParsedWorkflow, ParsedMcp } from './parser'

// ─── HELPERS ────────────────────────────────────────────────────────────────

async function exists(p: string): Promise<boolean> {
  try { await access(p); return true } catch { return false }
}

// ─── SCAN SKILLS ────────────────────────────────────────────────────────────

export async function scanSkills(skillsDir: string, origin: ParsedSkill['origin'] = 'global'): Promise<ParsedSkill[]> {
  if (!(await exists(skillsDir))) return []

  try {
    const entries = await readdir(skillsDir, { withFileTypes: true })
    const skills: ParsedSkill[] = []

    for (const entry of entries) {
      if (!entry.isDirectory()) continue
      const skillMdPath = join(skillsDir, entry.name, 'SKILL.md')
      if (!(await exists(skillMdPath))) continue

      try {
        const content = await readFile(skillMdPath, 'utf-8')
        const fileStat = await stat(skillMdPath)
        const skill = parseSkillMd(content, skillMdPath)
        skills.push({ ...skill, origin, updatedAt: fileStat.mtime })
      } catch {
        // Ignora skills com erro de leitura
      }
    }

    return skills
  } catch {
    return []
  }
}

// ─── SCAN WORKFLOWS ─────────────────────────────────────────────────────────

export async function scanWorkflows(workflowsDir: string, origin: 'global' | 'local' = 'global'): Promise<ParsedWorkflow[]> {
  if (!(await exists(workflowsDir))) return []

  try {
    const entries = await readdir(workflowsDir, { withFileTypes: true })
    const workflows: ParsedWorkflow[] = []

    for (const entry of entries) {
      if (!entry.isFile() || !entry.name.endsWith('.md')) continue
      try {
        const filePath = join(workflowsDir, entry.name)
        const content = await readFile(filePath, 'utf-8')
        workflows.push(parseWorkflowMd(content, filePath))
      } catch {
        // Ignora workflow com erro
      }
    }

    return workflows
  } catch {
    return []
  }
}

// ─── SCAN MCPs ──────────────────────────────────────────────────────────────

export async function scanMcps(mcpConfigPath: string): Promise<ParsedMcp[]> {
  if (!(await exists(mcpConfigPath))) return []

  try {
    const raw = await readFile(mcpConfigPath, 'utf-8')
    return parseMcpConfig(raw)
  } catch {
    return []
  }
}

// ─── SCAN WORKSPACES ────────────────────────────────────────────────────────

export interface ScannedWorkspace {
  id: string
  name: string
  path: string
  hasAgents: boolean
  hasAgentsMd: boolean
  workflows: ParsedWorkflow[]
  status: 'active' | 'inactive'
  lastActive: string
}

export async function scanWorkspaces(projectPaths: string[]): Promise<ScannedWorkspace[]> {
  const workspaces: ScannedWorkspace[] = []

  for (const projectPath of projectPaths) {
    if (!(await exists(projectPath))) continue

    const hasAgentsDir = await exists(join(projectPath, '.agents'))
    const hasAgentDir = await exists(join(projectPath, '.agent'))
    const hasUnderscoreAgents = await exists(join(projectPath, '_agents'))
    const hasAgentsMd = await exists(join(projectPath, 'AGENTS.md'))

    // Scan local workflows (tenta todas as variações)
    const localWorkflowDirs = [
      join(projectPath, '.agents', 'workflows'),
      join(projectPath, '.agent', 'workflows'),
      join(projectPath, '_agents', 'workflows'),
    ]

    const localWorkflows: ParsedWorkflow[] = []
    for (const dir of localWorkflowDirs) {
      const wfs = await scanWorkflows(dir, 'local')
      localWorkflows.push(...wfs)
    }

    // INCLUI TODOS os paths existentes — hasAgents é flag, não filtro
    workspaces.push({
      id: basename(projectPath),
      name: basename(projectPath),
      path: projectPath,
      hasAgents: hasAgentsDir || hasAgentDir || hasUnderscoreAgents,
      hasAgentsMd,
      workflows: localWorkflows,
      status: 'active',
      lastActive: new Date().toISOString(),
    })
  }

  return workspaces
}

// ─── SCAN CUSTOM DIR ────────────────────────────────────────────────────────
// Escaneia um diretório customizado procurando skills, workflows e MCPs.
// Detecta automaticamente o que tem dentro.

export interface CustomDirResult {
  skills: ParsedSkill[]
  workflows: ParsedWorkflow[]
  mcps: ParsedMcp[]
}

export async function scanCustomDir(dirPath: string): Promise<CustomDirResult> {
  const result: CustomDirResult = { skills: [], workflows: [], mcps: [] }

  if (!(await exists(dirPath))) return result

  try {
    const entries = await readdir(dirPath, { withFileTypes: true })

    for (const entry of entries) {
      const fullPath = join(dirPath, entry.name)

      if (entry.isDirectory()) {
        // Sub-pasta com SKILL.md → é uma skill
        const skillPath = join(fullPath, 'SKILL.md')
        if (await exists(skillPath)) {
          try {
            const content = await readFile(skillPath, 'utf-8')
            const fileStat = await stat(skillPath)
            const skill = parseSkillMd(content, skillPath)
            result.skills.push({ ...skill, origin: 'custom', updatedAt: fileStat.mtime })
          } catch { /* ignora */ }
        } else {
          // Pode ser uma pasta contendo skills (ex: skills/my-skill/SKILL.md)
          const nested = await scanSkills(fullPath, 'custom')
          result.skills.push(...nested)

          // Ou uma pasta de workflows (ex: workflows/deploy.md)
          const nestedWfs = await scanWorkflows(fullPath, 'global')
          result.workflows.push(...nestedWfs)
        }
      } else if (entry.isFile()) {
        // mcp_config.json → parseia MCPs
        if (entry.name === 'mcp_config.json') {
          try {
            const raw = await readFile(fullPath, 'utf-8')
            result.mcps.push(...parseMcpConfig(raw))
          } catch { /* ignora */ }
        }
        // .md → pode ser workflow
        else if (entry.name.endsWith('.md') && entry.name !== 'README.md') {
          try {
            const content = await readFile(fullPath, 'utf-8')
            result.workflows.push(parseWorkflowMd(content, fullPath))
          } catch { /* ignora */ }
        }
      }
    }
  } catch { /* ignora erros de acesso */ }

  return result
}

// ─── LOAD PROJECTS.JSON ─────────────────────────────────────────────────────

export async function loadProjectsJson(projectsJsonPath: string): Promise<string[]> {
  if (!(await exists(projectsJsonPath))) return []

  try {
    const raw = await readFile(projectsJsonPath, 'utf-8')
    const projects = JSON.parse(raw)
    if (Array.isArray(projects)) {
      return projects.map((p: any) => p.root || p.path || p.uri || p).filter(Boolean)
    }
    if (typeof projects === 'object') {
      return Object.values(projects).map((p: any) => p.root || p.path || p.uri || '').filter(Boolean)
    }
    return []
  } catch {
    return []
  }
}

// ─── FULL SCAN ──────────────────────────────────────────────────────────────

export async function fullScan(config: {
  skillsDirs: string[]
  workflowsDirs: string[]
  mcpConfigPath: string
  customDirs: string[]
  projectsJsonPath: string
}) {
  // Scan base dirs + MCPs + projects.json em paralelo
  const [baseSkills, globalWorkflows, baseMcps, projectPaths] = await Promise.all([
    Promise.all(config.skillsDirs.map(d => scanSkills(d, 'global'))).then(r => r.flat()),
    Promise.all(config.workflowsDirs.map(d => scanWorkflows(d, 'global'))).then(r => r.flat()),
    scanMcps(config.mcpConfigPath),
    loadProjectsJson(config.projectsJsonPath),
  ])

  // Scan custom dirs — detecta skills, workflows E mcps
  const customResults = await Promise.all(config.customDirs.map(scanCustomDir))
  const customSkills = customResults.flatMap(r => r.skills)
  const customWorkflows = customResults.flatMap(r => r.workflows)
  const customMcps = customResults.flatMap(r => r.mcps)

  // Scan workspaces (projects.json + custom dirs como potenciais workspaces)
  const workspaces = await scanWorkspaces([...projectPaths, ...config.customDirs])

  // Junta workflows locais dos workspaces
  const localWorkflows = workspaces.flatMap(ws => ws.workflows || [])

  return {
    skills: [...baseSkills, ...customSkills],
    workflows: [...globalWorkflows, ...customWorkflows, ...localWorkflows],
    mcps: [...baseMcps, ...customMcps],
    workspaces,
  }
}
