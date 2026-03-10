import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { scanSkills, scanWorkflows, scanMcps, scanWorkspaces, scanCustomDir, fullScan } from '../../src/main/scanner'
import { mkdirSync, writeFileSync, rmSync } from 'fs'
import { join } from 'path'
import { tmpdir } from 'os'

let tmpDir: string

beforeEach(() => {
  tmpDir = join(tmpdir(), `ag-scanner-test-${Date.now()}`)
  mkdirSync(tmpDir, { recursive: true })
})

afterEach(() => {
  rmSync(tmpDir, { recursive: true, force: true })
})

// ─── scanSkills ─────────────────────────────────────────────────────────────

describe('scanSkills', () => {
  it('detecta skills com SKILL.md na pasta', async () => {
    mkdirSync(join(tmpDir, 'skills/my-skill'), { recursive: true })
    writeFileSync(join(tmpDir, 'skills/my-skill/SKILL.md'), `---\nname: my-skill\ndescription: Test skill\ncategory: Testing\ntags: [test]\n---\nContent`)

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

// ─── scanWorkflows ──────────────────────────────────────────────────────────

describe('scanWorkflows', () => {
  it('detecta workflows .md no diretório', async () => {
    mkdirSync(join(tmpDir, 'workflows'), { recursive: true })
    writeFileSync(join(tmpDir, 'workflows/deploy.md'), `---\ndescription: Deploy workflow\ncategory: DevOps\n---`)

    const workflows = await scanWorkflows(join(tmpDir, 'workflows'))
    expect(workflows).toHaveLength(1)
    expect(workflows[0].slug).toBe('/deploy')
    expect(workflows[0].description).toContain('Deploy')
  })

  it('retorna array vazio para pasta inexistente', async () => {
    const workflows = await scanWorkflows(join(tmpDir, 'nonexistent'))
    expect(workflows).toEqual([])
  })

  it('ignora arquivos não-md', async () => {
    mkdirSync(join(tmpDir, 'workflows'), { recursive: true })
    writeFileSync(join(tmpDir, 'workflows/readme.txt'), 'not a workflow')
    writeFileSync(join(tmpDir, 'workflows/valid.md'), `---\ndescription: Valid\n---`)

    const workflows = await scanWorkflows(join(tmpDir, 'workflows'))
    expect(workflows).toHaveLength(1)
    expect(workflows[0].slug).toBe('/valid')
  })
})

// ─── scanWorkspaces ─────────────────────────────────────────────────────────

describe('scanWorkspaces', () => {
  it('detecta workspace COM .agents/', async () => {
    mkdirSync(join(tmpDir, 'my-project/.agents'), { recursive: true })
    const workspaces = await scanWorkspaces([join(tmpDir, 'my-project')])
    expect(workspaces).toHaveLength(1)
    expect(workspaces[0].hasAgents).toBe(true)
    expect(workspaces[0].name).toBe('my-project')
  })

  it('detecta workspace COM AGENTS.md', async () => {
    mkdirSync(join(tmpDir, 'proj2'), { recursive: true })
    writeFileSync(join(tmpDir, 'proj2/AGENTS.md'), '# Agents config')
    const workspaces = await scanWorkspaces([join(tmpDir, 'proj2')])
    expect(workspaces).toHaveLength(1)
    expect(workspaces[0].hasAgentsMd).toBe(true)
  })

  it('detecta workspace SEM markers (hasAgents=false)', async () => {
    mkdirSync(join(tmpDir, 'normal-project/src'), { recursive: true })
    writeFileSync(join(tmpDir, 'normal-project/package.json'), '{}')
    const workspaces = await scanWorkspaces([join(tmpDir, 'normal-project')])
    expect(workspaces).toHaveLength(1)
    expect(workspaces[0].hasAgents).toBe(false)
    expect(workspaces[0].hasAgentsMd).toBe(false)
    expect(workspaces[0].name).toBe('normal-project')
  })

  it('ignora paths que não existem', async () => {
    const workspaces = await scanWorkspaces([join(tmpDir, 'does-not-exist')])
    expect(workspaces).toEqual([])
  })
})

// ─── scanMcps ───────────────────────────────────────────────────────────────

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

// ─── scanCustomDir ──────────────────────────────────────────────────────────

describe('scanCustomDir', () => {
  it('encontra skills (sub-pastas com SKILL.md)', async () => {
    mkdirSync(join(tmpDir, 'custom/my-skill'), { recursive: true })
    writeFileSync(join(tmpDir, 'custom/my-skill/SKILL.md'), `---\nname: my-skill\ndescription: Custom skill\ncategory: AI\n---`)

    const result = await scanCustomDir(join(tmpDir, 'custom'))
    expect(result.skills).toHaveLength(1)
    expect(result.skills[0].name).toBe('my-skill')
  })

  it('encontra workflows (.md com frontmatter description)', async () => {
    mkdirSync(join(tmpDir, 'custom'), { recursive: true })
    writeFileSync(join(tmpDir, 'custom/deploy.md'), `---\ndescription: Deploy to prod\n---\nSteps here`)

    const result = await scanCustomDir(join(tmpDir, 'custom'))
    expect(result.workflows).toHaveLength(1)
    expect(result.workflows[0].slug).toBe('/deploy')
  })

  it('encontra MCPs (mcp_config.json)', async () => {
    mkdirSync(join(tmpDir, 'custom'), { recursive: true })
    writeFileSync(join(tmpDir, 'custom/mcp_config.json'), JSON.stringify({
      mcpServers: { test: { command: 'npx', args: ['-y', '@test/mcp'] } }
    }))

    const result = await scanCustomDir(join(tmpDir, 'custom'))
    expect(result.mcps).toHaveLength(1)
    expect(result.mcps[0].name).toBe('test')
  })

  it('encontra skills + workflows + MCPs juntos', async () => {
    mkdirSync(join(tmpDir, 'custom/a-skill'), { recursive: true })
    writeFileSync(join(tmpDir, 'custom/a-skill/SKILL.md'), `---\nname: a-skill\ndescription: Test\n---`)
    writeFileSync(join(tmpDir, 'custom/deploy.md'), `---\ndescription: Deploy\n---`)
    writeFileSync(join(tmpDir, 'custom/mcp_config.json'), JSON.stringify({
      mcpServers: { x: { command: 'node', args: ['server.js'] } }
    }))

    const result = await scanCustomDir(join(tmpDir, 'custom'))
    expect(result.skills).toHaveLength(1)
    expect(result.workflows).toHaveLength(1)
    expect(result.mcps).toHaveLength(1)
  })

  it('retorna vazio para pasta inexistente', async () => {
    const result = await scanCustomDir(join(tmpDir, 'nonexistent'))
    expect(result.skills).toEqual([])
    expect(result.workflows).toEqual([])
    expect(result.mcps).toEqual([])
  })

  it('retorna vazio para pasta sem assets', async () => {
    mkdirSync(join(tmpDir, 'empty'), { recursive: true })
    writeFileSync(join(tmpDir, 'empty/readme.txt'), 'just a text file')

    const result = await scanCustomDir(join(tmpDir, 'empty'))
    expect(result.skills).toEqual([])
    expect(result.workflows).toEqual([])
    expect(result.mcps).toEqual([])
  })

  it('detecta skills em sub-sub-pastas (ex: skills/my-skill/SKILL.md)', async () => {
    mkdirSync(join(tmpDir, 'custom/skills/deep-skill'), { recursive: true })
    writeFileSync(join(tmpDir, 'custom/skills/deep-skill/SKILL.md'), `---\nname: deep-skill\ndescription: Deep\n---`)

    const result = await scanCustomDir(join(tmpDir, 'custom'))
    expect(result.skills.length).toBeGreaterThanOrEqual(1)
  })

  it('detecta workflows em sub-pasta workflows/', async () => {
    mkdirSync(join(tmpDir, 'custom/workflows'), { recursive: true })
    writeFileSync(join(tmpDir, 'custom/workflows/test.md'), `---\ndescription: Test workflow\n---`)

    const result = await scanCustomDir(join(tmpDir, 'custom'))
    expect(result.workflows.length).toBeGreaterThanOrEqual(1)
  })
})

// ─── fullScan com customDirs ────────────────────────────────────────────────

describe('fullScan com customDirs', () => {
  it('inclui skills de customDirs no resultado', async () => {
    // Dir base de skills (vazio)
    mkdirSync(join(tmpDir, 'base-skills'), { recursive: true })
    // Dir base de workflows (vazio)
    mkdirSync(join(tmpDir, 'base-workflows'), { recursive: true })
    // Custom dir com skill
    mkdirSync(join(tmpDir, 'custom/extra-skill'), { recursive: true })
    writeFileSync(join(tmpDir, 'custom/extra-skill/SKILL.md'), `---\nname: extra-skill\ndescription: From custom dir\n---`)

    const result = await fullScan({
      skillsDirs: [join(tmpDir, 'base-skills')],
      workflowsDirs: [join(tmpDir, 'base-workflows')],
      mcpConfigPath: join(tmpDir, 'nonexistent-mcp.json'),
      customDirs: [join(tmpDir, 'custom')],
      projectsJsonPath: join(tmpDir, 'nonexistent-projects.json'),
    })

    expect(result.skills).toHaveLength(1)
    expect(result.skills[0].name).toBe('extra-skill')
    expect(result.skills[0].origin).toBe('custom')
  })
})
