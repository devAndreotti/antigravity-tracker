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

export async function scanSkills(skillsDir: string): Promise<ParsedSkill[]> {
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
        skills.push({ ...skill, updatedAt: fileStat.mtime })
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

    // Só considera workspace se tiver markers de agentes
    if (!hasAgentsDir && !hasAgentDir && !hasUnderscoreAgents && !hasAgentsMd) continue

    // Scan local workflows
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

// ─── LOAD PROJECTS.JSON ─────────────────────────────────────────────────────

export async function loadProjectsJson(projectsJsonPath: string): Promise<string[]> {
  if (!(await exists(projectsJsonPath))) return []

  try {
    const raw = await readFile(projectsJsonPath, 'utf-8')
    const projects = JSON.parse(raw)
    if (Array.isArray(projects)) {
      return projects.map((p: any) => p.root || p.path || p.uri || p).filter(Boolean)
    }
    // Se é um objeto, tenta pegar values
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
  const [skills, globalWorkflows, mcps, projectPaths] = await Promise.all([
    Promise.all(config.skillsDirs.map(scanSkills)).then(r => r.flat()),
    Promise.all(config.workflowsDirs.map(d => scanWorkflows(d, 'global'))).then(r => r.flat()),
    scanMcps(config.mcpConfigPath),
    loadProjectsJson(config.projectsJsonPath),
  ])

  const workspaces = await scanWorkspaces([...projectPaths, ...config.customDirs])

  // Junta workflows locais dos workspaces
  const localWorkflows = workspaces.flatMap(ws => ws.workflows || [])

  return {
    skills,
    workflows: [...globalWorkflows, ...localWorkflows],
    mcps,
    workspaces,
  }
}
