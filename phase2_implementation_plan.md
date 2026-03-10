# ANTIGRAVITY TRACKER — FASE 2: Implementation Plan Completo

## Contexto

O projeto atual (`antigravity-tracker`) tem a UI da Fase 1 funcionando com **dados mockados hardcodados**. O app Electron existe mas **não lê nada do filesystem real**. Settings existe visualmente mas **não persiste nem funciona**. File watcher está scaffoldado mas **não está conectado à UI**.

O objetivo da Fase 2 é **tornar tudo real**: o app deve detectar, indexar e exibir os ativos reais do ecossistema Antigravity presentes no filesystem do usuário.

---

## PRINCÍPIO CENTRAL: TEST BEFORE COMMIT

> **Regra absoluta**: Nenhuma feature de leitura de arquivo, parsing, watch ou IPC vai a commit sem um teste passando primeiro.
>
> O ciclo é sempre: **Escreve o teste → Cria o arquivo de fixture → Roda o teste → Implementa → Verde → Commit.**

---

## PARTE 1 — INFRAESTRUTURA DE TESTES

### 1.1 Setup do ambiente de testes

Instale e configure:

```bash
npm install --save-dev vitest @vitest/ui
npm install --save-dev mock-fs   # para mockar o filesystem sem tocar em arquivos reais
npm install --save-dev tmp        # para criar diretórios temporários reais nos testes de integração
```

Configure `vitest.config.ts` na raiz:

```typescript
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    environment: 'node',
    globals: true,
    include: ['src/**/*.test.ts', 'tests/**/*.test.ts'],
    coverage: {
      reporter: ['text', 'html'],
      include: ['src/main/**/*.ts'],
      exclude: ['src/main/index.ts'], // entry point, testar via e2e
    },
  },
})
```

Adicione ao `package.json`:
```json
{
  "scripts": {
    "test": "vitest run",
    "test:watch": "vitest",
    "test:ui": "vitest --ui",
    "test:coverage": "vitest run --coverage",
    "test:integration": "vitest run --config vitest.integration.config.ts"
  }
}
```

---

### 1.2 Estrutura de fixtures para testes

Crie `tests/fixtures/` com a estrutura que **simula o filesystem real** do Antigravity:

```
tests/
├── fixtures/
│   ├── fake-antigravity/
│   │   ├── skills/
│   │   │   ├── frontend-design/
│   │   │   │   └── SKILL.md          ← fixture com frontmatter real
│   │   │   ├── docx/
│   │   │   │   └── SKILL.md
│   │   │   └── canvas-design/
│   │   │       └── SKILL.md
│   │   ├── global_workflows/
│   │   │   ├── akita-way.md
│   │   │   ├── code-review.md
│   │   │   └── n8n-build.md
│   │   └── mcp_config.json
│   ├── fake-workspace/
│   │   ├── .agents/
│   │   │   └── workflows/
│   │   │       └── my-local-workflow.md
│   │   └── AGENTS.md
│   └── fake-projects.json           ← simula ~/.gemini/projects.json
├── unit/
│   ├── scanner.test.ts
│   ├── parser.test.ts
│   ├── database.test.ts
│   └── config.test.ts
└── integration/
    ├── watcher.test.ts
    └── ipc.test.ts
```

**Conteúdo obrigatório dos fixtures** — use isso exatamente para os testes não falharem por conteúdo errado:

`tests/fixtures/fake-antigravity/skills/frontend-design/SKILL.md`:
```markdown
---
name: frontend-design
description: Create distinctive, production-grade frontend interfaces with high design quality.
license: proprietary
tags: [react, tailwind, ui, css]
category: Design
---

Use this skill when the user asks to build web components, pages, or applications.
```

`tests/fixtures/fake-antigravity/global_workflows/akita-way.md`:
```markdown
---
description: Full XP + AI development workflow based on Fabio Akita's methodology.
category: Dev
---

# /akita-way workflow content here
```

`tests/fixtures/fake-antigravity/mcp_config.json`:
```json
{
  "mcpServers": {
    "stripe": {
      "command": "npx",
      "args": ["-y", "@stripe/mcp", "--api-key=$STRIPE_API_KEY"],
      "env": { "STRIPE_API_KEY": "" }
    },
    "playwright": {
      "command": "npx",
      "args": ["-y", "@playwright/mcp@latest"]
    }
  }
}
```

`tests/fixtures/fake-projects.json`:
```json
[
  { "root": "/fake/projects/my-saas", "name": "my-saas" },
  { "root": "/fake/projects/n8n-automations", "name": "n8n-automations" }
]
```

---

### 1.3 Testes unitários obrigatórios — escreva ANTES de implementar

#### `tests/unit/parser.test.ts`

```typescript
import { describe, it, expect } from 'vitest'
import { parseSkillMd, parseWorkflowMd, parseMcpConfig } from '../../src/main/parser'
import { readFileSync } from 'fs'
import { join } from 'path'

const FIXTURES = join(__dirname, '../fixtures/fake-antigravity')

describe('parseSkillMd', () => {
  it('extrai name, description, category e tags do frontmatter', () => {
    const content = readFileSync(join(FIXTURES, 'skills/frontend-design/SKILL.md'), 'utf-8')
    const result = parseSkillMd(content, '/fake/path/frontend-design/SKILL.md')
    
    expect(result.name).toBe('frontend-design')
    expect(result.description).toContain('frontend interfaces')
    expect(result.category).toBe('Design')
    expect(result.tags).toContain('react')
    expect(result.path).toBe('/fake/path/frontend-design/SKILL.md')
  })

  it('usa o nome da pasta se frontmatter não tiver name', () => {
    const content = `---\ndescription: Sem nome\n---\nConteúdo`
    const result = parseSkillMd(content, '/skills/my-skill/SKILL.md')
    expect(result.name).toBe('my-skill')
  })

  it('não quebra com frontmatter vazio', () => {
    const content = `# Skill sem frontmatter\nConteúdo aqui`
    expect(() => parseSkillMd(content, '/skills/broken/SKILL.md')).not.toThrow()
  })

  it('não quebra com arquivo vazio', () => {
    expect(() => parseSkillMd('', '/skills/empty/SKILL.md')).not.toThrow()
  })
})

describe('parseWorkflowMd', () => {
  it('extrai slug do nome do arquivo e description do frontmatter', () => {
    const content = readFileSync(join(FIXTURES, 'global_workflows/akita-way.md'), 'utf-8')
    const result = parseWorkflowMd(content, '/global_workflows/akita-way.md')
    
    expect(result.slug).toBe('/akita-way')
    expect(result.description).toContain('Akita')
    expect(result.origin).toBe('global')
  })

  it('detecta workflow local via path com .agents', () => {
    const content = `---\ndescription: My local workflow\n---`
    const result = parseWorkflowMd(content, '/projects/my-app/.agents/workflows/deploy.md')
    expect(result.origin).toBe('local')
    expect(result.slug).toBe('/deploy')
  })
})

describe('parseMcpConfig', () => {
  it('extrai todos os MCPs do mcp_config.json', () => {
    const raw = readFileSync(join(FIXTURES, 'mcp_config.json'), 'utf-8')
    const mcps = parseMcpConfig(raw)
    
    expect(mcps).toHaveLength(2)
    expect(mcps[0].name).toBe('stripe')
    expect(mcps[0].type).toBe('node')
    expect(mcps[0].command).toContain('npx')
  })

  it('detecta tipo docker quando command é "docker"', () => {
    const raw = JSON.stringify({ mcpServers: { 'my-mcp': { command: 'docker', args: ['run', '-i', 'image'] } } })
    const mcps = parseMcpConfig(raw)
    expect(mcps[0].type).toBe('docker')
  })

  it('detecta tipo python quando command termina em .exe ou é uvx/python', () => {
    const raw = JSON.stringify({ mcpServers: { 'obsidian': { command: 'uvx', args: ['mcp-obsidian'] } } })
    const mcps = parseMcpConfig(raw)
    expect(mcps[0].type).toBe('python')
  })

  it('não quebra com JSON malformado', () => {
    expect(() => parseMcpConfig('{ broken json')).not.toThrow()
    expect(parseMcpConfig('{ broken json')).toEqual([])
  })
})
```

#### `tests/unit/scanner.test.ts`

```typescript
import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { scanSkills, scanWorkflows, scanMcps, scanWorkspaces } from '../../src/main/scanner'
import { mkdirSync, writeFileSync, rmSync } from 'fs'
import { join } from 'path'
import os from 'os'

// Usa diretório temporário REAL para testes de scanner (não mock-fs)
let tmpDir: string

beforeEach(() => {
  tmpDir = join(os.tmpdir(), `antigravity-test-${Date.now()}`)
  mkdirSync(tmpDir, { recursive: true })
})

afterEach(() => {
  rmSync(tmpDir, { recursive: true, force: true })
})

describe('scanSkills', () => {
  it('detecta skills com SKILL.md na pasta', async () => {
    // Cria estrutura
    mkdirSync(join(tmpDir, 'skills/my-skill'), { recursive: true })
    writeFileSync(join(tmpDir, 'skills/my-skill/SKILL.md'), `---\nname: my-skill\ndescription: Test skill\ncategory: Testing\n---\nContent`)

    const skills = await scanSkills(join(tmpDir, 'skills'))
    
    expect(skills).toHaveLength(1)
    expect(skills[0].name).toBe('my-skill')
    expect(skills[0].category).toBe('Testing')
  })

  it('ignora pastas sem SKILL.md', async () => {
    mkdirSync(join(tmpDir, 'skills/no-skill-md'), { recursive: true })
    writeFileSync(join(tmpDir, 'skills/no-skill-md/README.md'), '# Not a skill')

    const skills = await scanSkills(join(tmpDir, 'skills'))
    expect(skills).toHaveLength(0)
  })

  it('retorna array vazio se a pasta não existe', async () => {
    const skills = await scanSkills(join(tmpDir, 'nonexistent'))
    expect(skills).toEqual([])
  })

  it('lida com múltiplas skills', async () => {
    for (const name of ['skill-a', 'skill-b', 'skill-c']) {
      mkdirSync(join(tmpDir, `skills/${name}`), { recursive: true })
      writeFileSync(join(tmpDir, `skills/${name}/SKILL.md`), `---\nname: ${name}\ndescription: Desc\n---`)
    }
    const skills = await scanSkills(join(tmpDir, 'skills'))
    expect(skills).toHaveLength(3)
  })
})

describe('scanWorkspaces', () => {
  it('detecta workspace com .agents/', async () => {
    mkdirSync(join(tmpDir, 'my-project/.agents'), { recursive: true })
    
    const workspaces = await scanWorkspaces([join(tmpDir, 'my-project')])
    expect(workspaces[0].hasAgents).toBe(true)
    expect(workspaces[0].name).toBe('my-project')
  })

  it('detecta workspace com AGENTS.md', async () => {
    mkdirSync(join(tmpDir, 'proj2'), { recursive: true })
    writeFileSync(join(tmpDir, 'proj2/AGENTS.md'), '# Agents config')
    
    const workspaces = await scanWorkspaces([join(tmpDir, 'proj2')])
    expect(workspaces).toHaveLength(1)
  })
})

describe('scanMcps', () => {
  it('lê mcp_config.json e retorna lista de MCPs', async () => {
    const config = { mcpServers: { stripe: { command: 'npx', args: ['-y', '@stripe/mcp'] } } }
    writeFileSync(join(tmpDir, 'mcp_config.json'), JSON.stringify(config))
    
    const mcps = await scanMcps(join(tmpDir, 'mcp_config.json'))
    expect(mcps).toHaveLength(1)
    expect(mcps[0].name).toBe('stripe')
  })

  it('retorna [] se o arquivo não existe', async () => {
    const mcps = await scanMcps(join(tmpDir, 'nonexistent.json'))
    expect(mcps).toEqual([])
  })
})
```

#### `tests/unit/config.test.ts`

```typescript
import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { loadConfig, saveConfig, defaultConfig } from '../../src/main/config'
import { mkdirSync, rmSync } from 'fs'
import { join } from 'path'
import os from 'os'

let tmpDir: string
beforeEach(() => { tmpDir = join(os.tmpdir(), `ag-config-${Date.now()}`); mkdirSync(tmpDir, { recursive: true }) })
afterEach(() => { rmSync(tmpDir, { recursive: true, force: true }) })

describe('loadConfig', () => {
  it('retorna defaultConfig se arquivo não existe', () => {
    const config = loadConfig(join(tmpDir, 'config.json'))
    expect(config).toMatchObject(defaultConfig)
  })

  it('carrega config salva corretamente', () => {
    const config = { ...defaultConfig, apiPort: 12345, watchMode: false }
    saveConfig(join(tmpDir, 'config.json'), config)
    const loaded = loadConfig(join(tmpDir, 'config.json'))
    expect(loaded.apiPort).toBe(12345)
    expect(loaded.watchMode).toBe(false)
  })

  it('mescla com defaultConfig se tiver campos faltando', () => {
    saveConfig(join(tmpDir, 'config.json'), { apiPort: 9999 })
    const loaded = loadConfig(join(tmpDir, 'config.json'))
    expect(loaded.apiPort).toBe(9999)
    expect(loaded.watchMode).toBe(defaultConfig.watchMode) // preenchido pelo default
  })
})
```

#### `tests/integration/watcher.test.ts`

```typescript
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { createWatcher } from '../../src/main/watcher'
import { mkdirSync, writeFileSync, rmSync } from 'fs'
import { join } from 'path'
import os from 'os'

let tmpDir: string
beforeEach(() => { tmpDir = join(os.tmpdir(), `ag-watch-${Date.now()}`); mkdirSync(join(tmpDir, 'skills/test-skill'), { recursive: true }) })
afterEach(() => { rmSync(tmpDir, { recursive: true, force: true }) })

describe('createWatcher', () => {
  it('dispara callback quando novo SKILL.md é criado', async () => {
    const callback = vi.fn()
    const watcher = createWatcher([join(tmpDir, 'skills')], callback)
    
    await new Promise(r => setTimeout(r, 200)) // aguarda watcher inicializar
    writeFileSync(join(tmpDir, 'skills/test-skill/SKILL.md'), '---\nname: test\n---')
    await new Promise(r => setTimeout(r, 500)) // aguarda debounce
    
    expect(callback).toHaveBeenCalledWith(expect.objectContaining({ type: 'skill', event: 'add' }))
    await watcher.close()
  }, 3000)

  it('dispara callback quando SKILL.md é modificado', async () => {
    writeFileSync(join(tmpDir, 'skills/test-skill/SKILL.md'), '---\nname: test\n---')
    const callback = vi.fn()
    const watcher = createWatcher([join(tmpDir, 'skills')], callback)
    
    await new Promise(r => setTimeout(r, 200))
    writeFileSync(join(tmpDir, 'skills/test-skill/SKILL.md'), '---\nname: test-modified\n---')
    await new Promise(r => setTimeout(r, 500))
    
    expect(callback).toHaveBeenCalled()
    await watcher.close()
  }, 3000)
})
```

---

## PARTE 2 — IMPLEMENTAÇÃO DO BACKEND (MAIN PROCESS)

### 2.1 `src/main/parser.ts` — Novo arquivo a criar

Este módulo é **puro** (sem side effects, sem I/O). Recebe strings, retorna objetos. Fácil de testar.

```typescript
import matter from 'gray-matter'
import { basename, dirname } from 'path'

export interface ParsedSkill {
  name: string
  description: string
  category: string
  tags: string[]
  path: string
  origin: 'global' | 'user' | 'custom'
  updatedAt?: Date
}

export interface ParsedWorkflow {
  slug: string
  description: string
  category: string
  origin: 'global' | 'local'
  workspace?: string
  path: string
}

export interface ParsedMcp {
  name: string
  type: 'node' | 'docker' | 'python' | 'unknown'
  command: string
  args: string[]
  env: Record<string, string>
  description: string
  tools: string[]
  origin: 'global'
}

export function parseSkillMd(content: string, filePath: string): ParsedSkill {
  try {
    const { data } = matter(content)
    const folderName = basename(dirname(filePath))
    return {
      name: data.name || folderName,
      description: data.description || '',
      category: data.category || inferCategory(data.tags || []),
      tags: Array.isArray(data.tags) ? data.tags : (data.tags ? [data.tags] : []),
      path: filePath,
      origin: 'global',
    }
  } catch {
    return { name: basename(dirname(filePath)), description: '', category: 'General', tags: [], path: filePath, origin: 'global' }
  }
}

export function parseWorkflowMd(content: string, filePath: string): ParsedWorkflow {
  try {
    const { data } = matter(content)
    const fileName = basename(filePath, '.md')
    const isLocal = filePath.includes('.agents') || filePath.includes('_agents')
    const workspaceMatch = filePath.match(/projects[/\\]([^/\\]+)[/\\]/)
    return {
      slug: `/${fileName}`,
      description: data.description || '',
      category: data.category || 'General',
      origin: isLocal ? 'local' : 'global',
      workspace: isLocal ? (workspaceMatch?.[1] || undefined) : undefined,
      path: filePath,
    }
  } catch {
    return { slug: `/${basename(filePath, '.md')}`, description: '', category: 'General', origin: 'global', path: filePath }
  }
}

export function parseMcpConfig(raw: string): ParsedMcp[] {
  try {
    const json = JSON.parse(raw)
    const servers = json.mcpServers || json.mcp_servers || {}
    return Object.entries(servers).map(([name, cfg]: [string, any]) => ({
      name,
      type: detectMcpType(cfg.command || ''),
      command: cfg.command || '',
      args: cfg.args || [],
      env: cfg.env || {},
      description: cfg.description || '',
      tools: cfg.tools || [],
      origin: 'global',
    }))
  } catch {
    return []
  }
}

function detectMcpType(command: string): ParsedMcp['type'] {
  if (command === 'docker') return 'docker'
  if (command === 'uvx' || command === 'python' || command === 'python3' || command.endsWith('.exe')) return 'python'
  if (command === 'node' || command === 'npx' || command === 'bun' || command === 'bunx') return 'node'
  return 'unknown'
}

function inferCategory(tags: string[]): string {
  if (tags.some(t => ['react', 'css', 'ui', 'tailwind', 'html'].includes(t))) return 'Design'
  if (tags.some(t => ['docx', 'pdf', 'pptx', 'xlsx', 'word', 'excel'].includes(t))) return 'Documents'
  if (tags.some(t => ['n8n', 'automation', 'webhook'].includes(t))) return 'n8n'
  if (tags.some(t => ['llm', 'api', 'sdk', 'ai', 'claude'].includes(t))) return 'AI'
  if (tags.some(t => ['jest', 'vitest', 'test', 'pytest'].includes(t))) return 'Testing'
  if (tags.some(t => ['p5', 'canvas', 'generative', 'creative'].includes(t))) return 'Creative'
  return 'General'
}
```

---

### 2.2 `src/main/scanner.ts` — Reescrever para usar o parser

```typescript
import { readFile, readdir, access } from 'fs/promises'
import { join, basename } from 'path'
import os from 'os'
import { parseSkillMd, parseWorkflowMd, parseMcpConfig } from './parser'
import type { ParsedSkill, ParsedWorkflow, ParsedMcp } from './parser'

// Paths padrão — podem ser sobrescritos pela config
export const DEFAULT_PATHS = {
  skills: join(os.homedir(), '.gemini', 'antigravity', 'skills'),
  globalWorkflows: join(os.homedir(), '.gemini', 'antigravity', 'global_workflows'),
  mcpConfig: join(os.homedir(), '.gemini', 'antigravity', 'mcp_config.json'),
  projects: join(os.homedir(), '.gemini', 'projects.json'),
}

async function exists(p: string): Promise<boolean> {
  try { await access(p); return true } catch { return false }
}

export async function scanSkills(skillsDir: string): Promise<ParsedSkill[]> {
  if (!(await exists(skillsDir))) return []
  
  try {
    const entries = await readdir(skillsDir, { withFileTypes: true })
    const skills: ParsedSkill[] = []
    
    for (const entry of entries) {
      if (!entry.isDirectory()) continue
      const skillMdPath = join(skillsDir, entry.name, 'SKILL.md')
      if (!(await exists(skillMdPath))) continue
      
      const content = await readFile(skillMdPath, 'utf-8')
      const stat = await import('fs/promises').then(fs => fs.stat(skillMdPath))
      const skill = parseSkillMd(content, skillMdPath)
      skills.push({ ...skill, updatedAt: stat.mtime })
    }
    
    return skills
  } catch {
    return []
  }
}

export async function scanWorkflows(workflowsDir: string, origin: 'global' | 'local' = 'global'): Promise<ParsedWorkflow[]> {
  if (!(await exists(workflowsDir))) return []
  
  try {
    const entries = await readdir(workflowsDir, { withFileTypes: true })
    const workflows: ParsedWorkflow[] = []
    
    for (const entry of entries) {
      if (!entry.isFile() || !entry.name.endsWith('.md')) continue
      const filePath = join(workflowsDir, entry.name)
      const content = await readFile(filePath, 'utf-8')
      workflows.push(parseWorkflowMd(content, filePath))
    }
    
    return workflows
  } catch {
    return []
  }
}

export async function scanMcps(mcpConfigPath: string): Promise<ParsedMcp[]> {
  if (!(await exists(mcpConfigPath))) return []
  
  try {
    const raw = await readFile(mcpConfigPath, 'utf-8')
    return parseMcpConfig(raw)
  } catch {
    return []
  }
}

export async function scanWorkspaces(projectPaths: string[]): Promise<any[]> {
  const workspaces = []
  
  for (const projectPath of projectPaths) {
    if (!(await exists(projectPath))) continue
    
    const hasAgentsDir = await exists(join(projectPath, '.agents'))
    const hasAgentsMd = await exists(join(projectPath, 'AGENTS.md'))
    const hasUnderscoreAgents = await exists(join(projectPath, '_agents'))
    
    if (!hasAgentsDir && !hasAgentsMd && !hasUnderscoreAgents) continue
    
    // Scan local workflows
    const localWorkflowDirs = [
      join(projectPath, '.agents', 'workflows'),
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
      hasAgents: hasAgentsDir || hasUnderscoreAgents,
      hasAgentsMd,
      workflows: localWorkflows,
      status: 'active',
      lastActive: new Date().toISOString(),
    })
  }
  
  return workspaces
}

// Lê projects.json do Gemini para descobrir workspaces
export async function loadProjectsJson(projectsJsonPath: string): Promise<string[]> {
  if (!(await exists(projectsJsonPath))) return []
  
  try {
    const raw = await readFile(projectsJsonPath, 'utf-8')
    const projects = JSON.parse(raw)
    if (Array.isArray(projects)) {
      return projects.map((p: any) => p.root || p.path || p).filter(Boolean)
    }
    return []
  } catch {
    return []
  }
}

// Full scan — retorna tudo de uma vez
export async function fullScan(config: {
  skillsDirs: string[]
  workflowsDirs: string[]
  mcpConfigPath: string
  customDirs: string[]
  projectsJsonPath: string
}) {
  const [
    skills,
    workflows,
    mcps,
    projectPaths,
  ] = await Promise.all([
    Promise.all(config.skillsDirs.map(scanSkills)).then(r => r.flat()),
    Promise.all(config.workflowsDirs.map(d => scanWorkflows(d, 'global'))).then(r => r.flat()),
    scanMcps(config.mcpConfigPath),
    loadProjectsJson(config.projectsJsonPath),
  ])
  
  const workspaces = await scanWorkspaces([...projectPaths, ...config.customDirs])
  
  // Adiciona workflows locais dos workspaces
  const localWorkflows = workspaces.flatMap(ws => ws.workflows || [])
  
  return { skills, workflows: [...workflows, ...localWorkflows], mcps, workspaces }
}
```

---

### 2.3 `src/main/config.ts` — Novo arquivo

```typescript
import { readFileSync, writeFileSync, mkdirSync } from 'fs'
import { join, dirname } from 'path'
import os from 'os'

export interface AppConfig {
  skillsDirs: string[]
  workflowsDirs: string[]
  mcpConfigPath: string
  customDirs: string[]
  projectsJsonPath: string
  watchMode: boolean
  apiPort: number
  scanInterval: 'realtime' | '30s' | '1min' | '5min'
  theme: 'dark' | 'light'
}

export const defaultConfig: AppConfig = {
  skillsDirs: [join(os.homedir(), '.gemini', 'antigravity', 'skills')],
  workflowsDirs: [join(os.homedir(), '.gemini', 'antigravity', 'global_workflows')],
  mcpConfigPath: join(os.homedir(), '.gemini', 'antigravity', 'mcp_config.json'),
  customDirs: [],
  projectsJsonPath: join(os.homedir(), '.gemini', 'projects.json'),
  watchMode: true,
  apiPort: 19847,
  scanInterval: 'realtime',
  theme: 'dark',
}

export function getConfigPath(): string {
  return join(os.homedir(), '.antigravity-tracker', 'config.json')
}

export function loadConfig(configPath = getConfigPath()): AppConfig {
  try {
    const raw = readFileSync(configPath, 'utf-8')
    const loaded = JSON.parse(raw)
    return { ...defaultConfig, ...loaded }
  } catch {
    return { ...defaultConfig }
  }
}

export function saveConfig(configPath = getConfigPath(), config: Partial<AppConfig>): void {
  const dir = dirname(configPath)
  mkdirSync(dir, { recursive: true })
  const current = loadConfig(configPath)
  writeFileSync(configPath, JSON.stringify({ ...current, ...config }, null, 2), 'utf-8')
}
```

---

### 2.4 `src/main/watcher.ts` — Reescrever

```typescript
import chokidar, { FSWatcher } from 'chokidar'
import { join } from 'path'
import os from 'os'

export interface WatchEvent {
  type: 'skill' | 'workflow' | 'mcp' | 'unknown'
  event: 'add' | 'change' | 'unlink'
  path: string
}

export function createWatcher(
  paths: string[],
  onChange: (event: WatchEvent) => void,
  options = { debounce: 300 }
): FSWatcher {
  const watcher = chokidar.watch(paths.filter(Boolean), {
    persistent: true,
    ignoreInitial: true,
    awaitWriteFinish: { stabilityThreshold: options.debounce, pollInterval: 100 },
    ignored: /(^|[/\\])\../, // ignora dotfiles
  })

  const classify = (filePath: string): WatchEvent['type'] => {
    if (filePath.endsWith('SKILL.md')) return 'skill'
    if (filePath.includes('workflows') && filePath.endsWith('.md')) return 'workflow'
    if (filePath.endsWith('mcp_config.json')) return 'mcp'
    return 'unknown'
  }

  const handle = (event: WatchEvent['event']) => (path: string) => {
    const type = classify(path)
    if (type !== 'unknown') onChange({ type, event, path })
  }

  watcher.on('add', handle('add'))
  watcher.on('change', handle('change'))
  watcher.on('unlink', handle('unlink'))

  return watcher
}
```

---

### 2.5 `src/main/ipc.ts` — Handlers IPC completos

```typescript
import { ipcMain } from 'electron'
import { fullScan } from './scanner'
import { loadConfig, saveConfig } from './config'
import { createWatcher } from './watcher'
import type { FSWatcher } from 'chokidar'

let currentWatcher: FSWatcher | null = null
let cachedData: any = null

export function setupIPC(mainWindow: Electron.BrowserWindow) {
  
  // Scan completo — chamado na inicialização e pelo botão "Scan Now"
  ipcMain.handle('scanner:fullScan', async () => {
    const config = loadConfig()
    const data = await fullScan(config)
    cachedData = data
    return data
  })

  // Config
  ipcMain.handle('config:load', () => loadConfig())
  ipcMain.handle('config:save', (_e, partial) => {
    saveConfig(undefined, partial)
    // Re-inicia watcher se paths mudaram
    restartWatcher(mainWindow)
    return loadConfig()
  })

  // Watcher manual
  ipcMain.handle('watcher:start', () => restartWatcher(mainWindow))
  ipcMain.handle('watcher:stop', () => { currentWatcher?.close(); currentWatcher = null; return true })
}

function restartWatcher(mainWindow: Electron.BrowserWindow) {
  currentWatcher?.close()
  const config = loadConfig()
  if (!config.watchMode) return
  
  const paths = [...config.skillsDirs, ...config.workflowsDirs, config.mcpConfigPath]
  currentWatcher = createWatcher(paths, async (event) => {
    // Re-scan e notifica renderer
    const config2 = loadConfig()
    const data = await fullScan(config2)
    cachedData = data
    mainWindow.webContents.send('scanner:updated', { event, data })
  })
}
```

---

### 2.6 `src/preload/index.ts` — Expor APIs seguras

```typescript
import { contextBridge, ipcRenderer } from 'electron'

contextBridge.exposeInMainWorld('antigravity', {
  scan: () => ipcRenderer.invoke('scanner:fullScan'),
  loadConfig: () => ipcRenderer.invoke('config:load'),
  saveConfig: (partial: any) => ipcRenderer.invoke('config:save', partial),
  startWatcher: () => ipcRenderer.invoke('watcher:start'),
  stopWatcher: () => ipcRenderer.invoke('watcher:stop'),
  onUpdate: (callback: (data: any) => void) => {
    ipcRenderer.on('scanner:updated', (_e, payload) => callback(payload))
    return () => ipcRenderer.removeAllListeners('scanner:updated')
  }
})
```

---

## PARTE 3 — RENDERER: CONECTAR UI AOS DADOS REAIS

### 3.1 `src/renderer/stores/useTrackerStore.ts`

```typescript
import { create } from 'zustand'

interface TrackerState {
  skills: any[]
  workflows: any[]
  mcps: any[]
  workspaces: any[]
  config: any
  isLoading: boolean
  lastScan: Date | null
  error: string | null
  
  fetchAll: () => Promise<void>
  saveConfig: (partial: any) => Promise<void>
}

declare global {
  interface Window {
    antigravity: {
      scan: () => Promise<any>
      loadConfig: () => Promise<any>
      saveConfig: (partial: any) => Promise<any>
      onUpdate: (cb: (data: any) => void) => () => void
    }
  }
}

export const useTrackerStore = create<TrackerState>((set, get) => ({
  skills: [],
  workflows: [],
  mcps: [],
  workspaces: [],
  config: null,
  isLoading: false,
  lastScan: null,
  error: null,
  
  fetchAll: async () => {
    set({ isLoading: true, error: null })
    try {
      const [data, config] = await Promise.all([
        window.antigravity.scan(),
        window.antigravity.loadConfig(),
      ])
      set({ ...data, config, isLoading: false, lastScan: new Date() })
    } catch (err: any) {
      set({ isLoading: false, error: err?.message || 'Scan failed' })
    }
  },
  
  saveConfig: async (partial) => {
    const config = await window.antigravity.saveConfig(partial)
    set({ config })
  }
}))
```

### 3.2 Inicialização em `src/renderer/App.tsx`

```typescript
useEffect(() => {
  // Carrega dados reais ao iniciar
  fetchAll()
  
  // Escuta atualizações do watcher
  const unsub = window.antigravity.onUpdate(({ data }) => {
    set({ ...data, lastScan: new Date() })
  })
  
  return unsub
}, [])
```

---

### 3.3 Settings Page — Funcional e conectada ao store

A Settings page deve:

1. **Carregar config real** via `useTrackerStore().config` ao montar
2. **Salvar imediatamente** via `saveConfig()` ao mudar qualquer campo (com debounce de 800ms)
3. **"Add Directory"**: input de texto + botão. Ao adicionar, chama `saveConfig({ customDirs: [...existing, newPath] })` + re-scan
4. **Toggle Watch Mode**: ao desligar, chama `window.antigravity.stopWatcher()`; ao ligar, `window.antigravity.startWatcher()`
5. **"Scan Now"**: botão que chama `fetchAll()`, mostra spinner durante loading, "✓ Done" por 2s após
6. **Diretórios listados**: cada item tem toggle on/off (persiste em config) e botão remove com confirmação inline ("Tem certeza? [Sim] [Não]")
7. **Scan interval dropdown**: salva no config, o main process usa esse valor para configurar o watcher

---

## PARTE 4 — CRIAÇÃO DE ASSETS DE TESTE NO FILESYSTEM

> **IMPORTANTE**: Para testar que o app realmente detecta arquivos, você deve criar assets reais nos paths esperados.

### 4.1 Script `scripts/create-test-fixtures.ts`

Crie este script que gera uma estrutura de teste real:

```typescript
#!/usr/bin/env tsx
// Uso: npx tsx scripts/create-test-fixtures.ts
// Cria fixtures reais nos paths que o tracker monitora

import { mkdirSync, writeFileSync, existsSync } from 'fs'
import { join } from 'path'
import os from 'os'

const BASE = join(os.homedir(), '.gemini', 'antigravity')

const testSkills = [
  { name: 'test-skill-alpha', category: 'Testing', description: 'Skill criada para testar o scanner', tags: ['test', 'vitest'] },
  { name: 'test-skill-beta', category: 'AI', description: 'Segunda skill de teste', tags: ['llm', 'test'] },
]

const testWorkflows = [
  { slug: 'test-workflow', description: 'Workflow de teste para validar o scanner', category: 'Dev' },
]

console.log('🔧 Criando fixtures de teste em:', BASE)

// Skills
for (const skill of testSkills) {
  const dir = join(BASE, 'skills', skill.name)
  mkdirSync(dir, { recursive: true })
  const content = `---\nname: ${skill.name}\ndescription: ${skill.description}\ncategory: ${skill.category}\ntags: [${skill.tags.join(', ')}]\n---\n\n# ${skill.name}\n\nConteúdo de teste.\n`
  writeFileSync(join(dir, 'SKILL.md'), content)
  console.log(`  ✓ Skill: ${skill.name}`)
}

// Workflows
for (const wf of testWorkflows) {
  const dir = join(BASE, 'global_workflows')
  mkdirSync(dir, { recursive: true })
  const content = `---\ndescription: ${wf.description}\ncategory: ${wf.category}\n---\n\n# /${wf.slug}\n`
  writeFileSync(join(dir, `${wf.slug}.md`), content)
  console.log(`  ✓ Workflow: /${wf.slug}`)
}

console.log('\n✅ Fixtures criadas. Reinicie o tracker para ver os itens.')
console.log('🧹 Para remover: npx tsx scripts/remove-test-fixtures.ts')
```

Crie também `scripts/remove-test-fixtures.ts` que remove apenas os assets de teste (prefixo `test-`).

---

## PARTE 5 — CHECKLIST DE VALIDAÇÃO ANTES DE COMMIT

Para cada feature implementada, execute esta checklist:

```
[ ] npm test — todos os testes passando
[ ] npm run test:coverage — cobertura > 70% em src/main/
[ ] Abre o app → não tem erro no console
[ ] Skills reais aparecem listadas (não mock)
[ ] Workflows reais aparecem listados
[ ] MCPs do mcp_config.json real aparecem
[ ] Workspaces detectados do projects.json
[ ] Settings → Add Directory → aparece na lista → persiste após reiniciar app
[ ] Settings → Remove Directory → some da lista
[ ] Settings → Toggle Watch Mode → log mostra watcher parando/iniciando
[ ] Cria um novo SKILL.md → aparece no app em < 2 segundos (se watch mode ativo)
[ ] Modifica um SKILL.md → card atualiza sem recarregar
[ ] Settings → Scan Now → spinner → "✓ Done" → contagens atualizadas
```

---

## ORDEM DE IMPLEMENTAÇÃO

1. **Escreva os testes** (`tests/unit/parser.test.ts`, `scanner.test.ts`, `config.test.ts`) — nada deve estar verde ainda
2. **Implemente `parser.ts`** → rode os testes → verde
3. **Implemente `config.ts`** → rode os testes → verde
4. **Implemente `scanner.ts`** (usa o parser) → rode os testes → verde
5. **Execute `npx tsx scripts/create-test-fixtures.ts`** para criar arquivos reais
6. **Conecte o scanner ao IPC** (`ipc.ts`) → teste manualmente no app
7. **Atualize o preload** para expor as APIs
8. **Crie o Zustand store** no renderer
9. **Conecte a UI ao store** — remova todos os dados mockados hardcodados
10. **Implemente Settings funcional** com persistência real
11. **Implemente o watcher** → teste de integração → verde
12. **Escreva os testes de integração** do watcher
13. **Checklist de validação completa**
14. **Commit**

---

## CRITÉRIOS DE DONE

- Todos os testes passando: `npm test`
- Zero dados mockados hardcodados no renderer (exceto fallback de loading)
- Skills, workflows e MCPs carregados do filesystem real
- Settings salvos em `~/.antigravity-tracker/config.json` e persistindo entre sessões
- File watcher ativo e notificando mudanças em < 2s
- "Add Directory" funcional de ponta a ponta
- Cobertura de testes > 70% no main process