import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { scanSkills, scanWorkflows, scanMcps, scanWorkspaces } from '../../src/main/scanner'
import { mkdirSync, writeFileSync, rmSync } from 'fs'
import { join } from 'path'
import { tmpdir } from 'os'

// Usa diretório temporário REAL
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
  it('detecta workspace com .agents/', async () => {
    mkdirSync(join(tmpDir, 'my-project/.agents'), { recursive: true })
    const workspaces = await scanWorkspaces([join(tmpDir, 'my-project')])
    expect(workspaces).toHaveLength(1)
    expect(workspaces[0].hasAgents).toBe(true)
    expect(workspaces[0].name).toBe('my-project')
  })

  it('detecta workspace com AGENTS.md', async () => {
    mkdirSync(join(tmpDir, 'proj2'), { recursive: true })
    writeFileSync(join(tmpDir, 'proj2/AGENTS.md'), '# Agents config')
    const workspaces = await scanWorkspaces([join(tmpDir, 'proj2')])
    expect(workspaces).toHaveLength(1)
  })

  it('ignora paths que não existem', async () => {
    const workspaces = await scanWorkspaces([join(tmpDir, 'does-not-exist')])
    expect(workspaces).toEqual([])
  })

  it('ignora paths sem .agents ou AGENTS.md', async () => {
    mkdirSync(join(tmpDir, 'normal-project'), { recursive: true })
    const workspaces = await scanWorkspaces([join(tmpDir, 'normal-project')])
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
