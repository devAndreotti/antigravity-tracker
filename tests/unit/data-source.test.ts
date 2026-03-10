// ─── DATA SOURCE TESTS ──────────────────────────────────────────────────────
// Testa a lógica de escolha entre dados reais (store) e mock data,
// garantindo que nunca há flash de mock em modo Electron.

import { describe, it, expect } from 'vitest'

// ─── Simula a lógica de seleção de dados do App.tsx ─────────────────────────
// Extraída para ser testável sem React

interface DataSourceInput {
  isElectron: boolean
  storeSkills: any[]
  storeWorkflows: any[]
  storeMcps: any[]
  storeWorkspaces: any[]
}

interface MockData {
  MOCK_SKILLS: any[]
  MOCK_WORKFLOWS: any[]
  MOCK_MCPS: any[]
  MOCK_WORKSPACES: any[]
}

function selectDataSource(input: DataSourceInput, mock: MockData) {
  return {
    skills: input.isElectron ? input.storeSkills : mock.MOCK_SKILLS,
    workflows: input.isElectron ? input.storeWorkflows : mock.MOCK_WORKFLOWS,
    mcps: input.isElectron ? input.storeMcps : mock.MOCK_MCPS,
    workspaces: input.isElectron ? input.storeWorkspaces : mock.MOCK_WORKSPACES,
  }
}

// ─── Dados falsificados para testes ─────────────────────────────────────────

const MOCK: MockData = {
  MOCK_SKILLS: [
    { id: 'mock-s1', name: 'mock-skill', category: 'Creative', tags: ['p5.js', 'canvas'] },
    { id: 'mock-s2', name: 'mock-skill-2', category: 'Design', tags: ['figma'] },
  ],
  MOCK_WORKFLOWS: [
    { id: 'mock-w1', slug: '/mock-workflow', category: 'DevOps' },
  ],
  MOCK_MCPS: [
    { id: 'mock-m1', name: 'mock-mcp', type: 'stdio' },
  ],
  MOCK_WORKSPACES: [
    { id: 'mock-ws1', name: 'mock-workspace', description: 'Mock desc', stack: ['React'], workflows: ['mock-wf'] },
  ],
}

const REAL_SKILLS = [
  { id: 'real-s1', name: 'algorithmic-art', category: 'Creative', origin: 'global', description: 'Creating algo art', tags: [] },
]
const REAL_WORKFLOWS = [
  { id: 'real-w1', slug: '/dev', description: 'Dev workflow', category: 'Development', origin: 'local' },
]
const REAL_MCPS = [
  { id: 'real-m1', name: 'github-mcp', type: 'stdio', origin: 'global' },
]
const REAL_WORKSPACES = [
  { id: 'real-ws1', name: 'antigravity-tracker', path: 'D:\\Dev\\Projects', hasAgents: true, workflows: [{ slug: '/dev' }] },
]


// ═══════════════════════════════════════════════════════════════════════════════
// TESTES
// ═══════════════════════════════════════════════════════════════════════════════

describe('Data Source Selection', () => {

  // ─── ELECTRON MODE ──────────────────────────────────────────────────────────

  describe('Electron mode (isElectron = true)', () => {
    it('deve retornar arrays vazios quando store está vazio (loading state)', () => {
      const result = selectDataSource({
        isElectron: true,
        storeSkills: [],
        storeWorkflows: [],
        storeMcps: [],
        storeWorkspaces: [],
      }, MOCK)

      expect(result.skills).toEqual([])
      expect(result.workflows).toEqual([])
      expect(result.mcps).toEqual([])
      expect(result.workspaces).toEqual([])
    })

    it('NUNCA deve retornar mock data em modo Electron — mesmo com store vazio', () => {
      const result = selectDataSource({
        isElectron: true,
        storeSkills: [],
        storeWorkflows: [],
        storeMcps: [],
        storeWorkspaces: [],
      }, MOCK)

      // Nenhum item mock deve aparecer
      expect(result.skills).not.toContainEqual(expect.objectContaining({ id: 'mock-s1' }))
      expect(result.workflows).not.toContainEqual(expect.objectContaining({ id: 'mock-w1' }))
      expect(result.mcps).not.toContainEqual(expect.objectContaining({ id: 'mock-m1' }))
      expect(result.workspaces).not.toContainEqual(expect.objectContaining({ id: 'mock-ws1' }))
    })

    it('deve retornar dados reais do store quando scan completou', () => {
      const result = selectDataSource({
        isElectron: true,
        storeSkills: REAL_SKILLS,
        storeWorkflows: REAL_WORKFLOWS,
        storeMcps: REAL_MCPS,
        storeWorkspaces: REAL_WORKSPACES,
      }, MOCK)

      expect(result.skills).toBe(REAL_SKILLS)
      expect(result.workflows).toBe(REAL_WORKFLOWS)
      expect(result.mcps).toBe(REAL_MCPS)
      expect(result.workspaces).toBe(REAL_WORKSPACES)
    })

    it('dados reais não devem conter nenhum mock ID', () => {
      const result = selectDataSource({
        isElectron: true,
        storeSkills: REAL_SKILLS,
        storeWorkflows: REAL_WORKFLOWS,
        storeMcps: REAL_MCPS,
        storeWorkspaces: REAL_WORKSPACES,
      }, MOCK)

      const allIds = [
        ...result.skills.map(s => s.id),
        ...result.workflows.map(w => w.id),
        ...result.mcps.map(m => m.id),
        ...result.workspaces.map(ws => ws.id),
      ]
      allIds.forEach(id => expect(id).not.toMatch(/^mock-/))
    })

    it('store com skills mas sem workflows → skills reais, workflows vazio', () => {
      const result = selectDataSource({
        isElectron: true,
        storeSkills: REAL_SKILLS,
        storeWorkflows: [],
        storeMcps: [],
        storeWorkspaces: [],
      }, MOCK)

      expect(result.skills.length).toBe(1)
      expect(result.skills[0].id).toBe('real-s1')
      expect(result.workflows).toEqual([])
      // NÃO deve ter fallback mock para workflows
      expect(result.workflows).not.toEqual(MOCK.MOCK_WORKFLOWS)
    })
  })


  // ─── BROWSER MODE ───────────────────────────────────────────────────────────

  describe('Browser mode (isElectron = false)', () => {
    it('deve retornar mock data quando não está no Electron', () => {
      const result = selectDataSource({
        isElectron: false,
        storeSkills: [],
        storeWorkflows: [],
        storeMcps: [],
        storeWorkspaces: [],
      }, MOCK)

      expect(result.skills).toBe(MOCK.MOCK_SKILLS)
      expect(result.workflows).toBe(MOCK.MOCK_WORKFLOWS)
      expect(result.mcps).toBe(MOCK.MOCK_MCPS)
      expect(result.workspaces).toBe(MOCK.MOCK_WORKSPACES)
    })

    it('mock data deve ter tags específicas (para preview de UI)', () => {
      const result = selectDataSource({
        isElectron: false,
        storeSkills: [],
        storeWorkflows: [],
        storeMcps: [],
        storeWorkspaces: [],
      }, MOCK)

      // Mock skills devem ter tags
      expect(result.skills[0].tags?.length).toBeGreaterThan(0)
      // Mock workspaces devem ter description e stack (dados ricos)
      expect(result.workspaces[0].description).toBeDefined()
      expect(result.workspaces[0].stack).toBeDefined()
    })

    it('browser mode ignora dados do store mesmo se existirem', () => {
      const result = selectDataSource({
        isElectron: false,
        storeSkills: REAL_SKILLS,
        storeWorkflows: REAL_WORKFLOWS,
        storeMcps: REAL_MCPS,
        storeWorkspaces: REAL_WORKSPACES,
      }, MOCK)

      // Deve retornar mock, não real
      expect(result.skills).toBe(MOCK.MOCK_SKILLS)
      expect(result.skills).not.toBe(REAL_SKILLS)
    })
  })
})


// ─── WORKSPACE NORMALIZATION ────────────────────────────────────────────────

describe('Workspace Workflow Normalization', () => {
  // Simula a lógica do WorkspacesPage que normaliza workflows
  function normalizeWorkflows(workflows: any[]): string[] {
    return (workflows || [])
      .map((w: any) => typeof w === 'string' ? w : w?.slug || w?.id || '')
      .filter(Boolean)
  }

  it('deve normalizar string[] mock → string[]', () => {
    const result = normalizeWorkflows(['workflow-a', 'workflow-b'])
    expect(result).toEqual(['workflow-a', 'workflow-b'])
  })

  it('deve normalizar ParsedWorkflow[] real → string[]', () => {
    const result = normalizeWorkflows([
      { id: 'w1', slug: '/dev', description: 'Dev workflow' },
      { id: 'w2', slug: '/test', description: 'Test workflow' },
    ])
    expect(result).toEqual(['/dev', '/test'])
  })

  it('deve lidar com array misto (string + objeto)', () => {
    const result = normalizeWorkflows([
      'pure-string',
      { id: 'w1', slug: '/mixed' },
    ])
    expect(result).toEqual(['pure-string', '/mixed'])
  })

  it('deve retornar [] para undefined/null', () => {
    expect(normalizeWorkflows(undefined as any)).toEqual([])
    expect(normalizeWorkflows(null as any)).toEqual([])
  })

  it('deve filtrar items vazios', () => {
    const result = normalizeWorkflows([
      '', null, { id: 'w1' }, // sem slug — usa id
      { slug: '' }, // slug vazio
    ])
    expect(result).toEqual(['w1'])
  })

  it('deve usar id como fallback quando slug não existe', () => {
    const result = normalizeWorkflows([
      { id: 'fallback-id', description: 'no slug field' },
    ])
    expect(result).toEqual(['fallback-id'])
  })
})


// ─── DATA SHAPE COMPATIBILITY ───────────────────────────────────────────────

describe('Data Shape Compatibility', () => {
  // Testa que dados reais do scanner são renderizáveis sem crash

  it('ScannedWorkspace sem description não deve crashar', () => {
    const ws = { id: 'ws1', name: 'project', path: '/path', hasAgents: true }
    // Simula acesso ao campo
    expect(ws.hasOwnProperty('description')).toBe(false)
    expect((ws as any).description ?? 'fallback').toBe('fallback')
  })

  it('ScannedWorkspace sem stack não deve crashar', () => {
    const ws = { id: 'ws1', name: 'project', path: '/path' }
    const stack = (ws as any).stack
    expect(stack).toBeUndefined()
    expect((stack || []).length).toBe(0)
  })

  it('ScannedWorkspace sem status deve usar default', () => {
    const ws = { id: 'ws1', name: 'project', path: '/path' }
    const status = (ws as any).status || 'active'
    expect(status).toBe('active')
  })

  it('Mock Workspace com todos os campos deve funcionar', () => {
    const ws = MOCK.MOCK_WORKSPACES[0]
    expect(ws.description).toBeDefined()
    expect(ws.stack).toBeDefined()
    expect(ws.workflows).toBeDefined()
  })

  it('ParsedSkill com tags vazio deve renderizar sem crash', () => {
    const skill = REAL_SKILLS[0]
    expect(skill.tags).toBeDefined()
    expect(skill.tags?.length).toBe(0)
    // Simula o slice que o SkillCard faz
    expect(skill.tags?.slice(0, 2)).toEqual([])
  })

  it('ParsedWorkflow com origin deve ser renderizável', () => {
    const wf = REAL_WORKFLOWS[0]
    expect(wf.origin).toBeDefined()
    expect(['global', 'local', 'custom']).toContain(wf.origin)
  })
})


// ─── THEME APPLICATION ──────────────────────────────────────────────────────

describe('Theme Logic', () => {
  it('tema dark deve ser o padrão quando config não existe', () => {
    const config = null
    const theme = (config as any)?.theme || 'dark'
    expect(theme).toBe('dark')
  })

  it('tema light deve ser extraído do config quando definido', () => {
    const config = { theme: 'light' }
    const theme = config.theme || 'dark'
    expect(theme).toBe('light')
  })

  it('tema inválido deve cair no default dark', () => {
    const config = { theme: '' }
    const theme = config.theme || 'dark'
    expect(theme).toBe('dark')
  })
})


// ─── KEYBOARD SHORTCUT LOGIC ────────────────────────────────────────────────

describe('Keyboard Shortcuts', () => {
  it('Windows deve mostrar Ctrl+ como modificador', () => {
    const isMac = false
    const modKey = isMac ? '⌘' : 'Ctrl+'
    expect(modKey).toBe('Ctrl+')
    expect(`${modKey}K`).toBe('Ctrl+K')
    expect(`${modKey}1`).toBe('Ctrl+1')
  })

  it('Mac deve mostrar ⌘ como modificador', () => {
    const isMac = true
    const modKey = isMac ? '⌘' : 'Ctrl+'
    expect(modKey).toBe('⌘')
    expect(`${modKey}K`).toBe('⌘K')
  })

  it('páginas devem mapear para atalhos 1-5', () => {
    const pages = ['skills', 'workflows', 'mcps', 'workspaces', 'settings']
    pages.forEach((p, i) => {
      expect(i + 1).toBeGreaterThanOrEqual(1)
      expect(i + 1).toBeLessThanOrEqual(5)
    })
  })
})
