import { describe, it, expect } from 'vitest'
import { parseSkillMd, parseWorkflowMd, parseMcpConfig } from '../../src/main/parser'
import { readFileSync } from 'fs'
import { join } from 'path'

const FIXTURES = join(__dirname, '../fixtures/fake-antigravity')

// ─── parseSkillMd ───────────────────────────────────────────────────────────

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
    const result = parseSkillMd('', '/skills/empty/SKILL.md')
    expect(result.name).toBe('empty')
  })

  it('gera id baseado no nome da pasta', () => {
    const content = `---\nname: my-skill\n---`
    const result = parseSkillMd(content, '/skills/my-skill/SKILL.md')
    expect(result.id).toBe('my-skill')
  })

  it('infere categoria a partir das tags quando category não existe', () => {
    const content = `---\ndescription: teste\ntags: [llm, api]\n---`
    const result = parseSkillMd(content, '/skills/test/SKILL.md')
    expect(result.category).toBe('AI')
  })
})

// ─── parseWorkflowMd ────────────────────────────────────────────────────────

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

  it('detecta workspace name de path com .agents', () => {
    const content = `---\ndescription: test\n---`
    const result = parseWorkflowMd(content, '/projects/my-saas/.agents/workflows/test.md')
    expect(result.workspace).toBe('my-saas')
  })

  it('não quebra com arquivo vazio', () => {
    expect(() => parseWorkflowMd('', '/workflows/empty.md')).not.toThrow()
  })
})

// ─── parseMcpConfig ─────────────────────────────────────────────────────────

describe('parseMcpConfig', () => {
  it('extrai todos os MCPs do mcp_config.json', () => {
    const raw = readFileSync(join(FIXTURES, 'mcp_config.json'), 'utf-8')
    const mcps = parseMcpConfig(raw)

    expect(mcps).toHaveLength(3)
    expect(mcps[0].name).toBe('stripe')
    expect(mcps[0].type).toBe('node')
    expect(mcps[0].command).toContain('npx')
  })

  it('detecta tipo docker quando command é "docker"', () => {
    const raw = JSON.stringify({ mcpServers: { 'my-mcp': { command: 'docker', args: ['run', '-i', 'image'] } } })
    const mcps = parseMcpConfig(raw)
    expect(mcps[0].type).toBe('docker')
  })

  it('detecta tipo python quando command é uvx', () => {
    const raw = JSON.stringify({ mcpServers: { 'obsidian': { command: 'uvx', args: ['mcp-obsidian'] } } })
    const mcps = parseMcpConfig(raw)
    expect(mcps[0].type).toBe('python')
  })

  it('não quebra com JSON malformado', () => {
    expect(() => parseMcpConfig('{ broken json')).not.toThrow()
    expect(parseMcpConfig('{ broken json')).toEqual([])
  })

  it('não quebra com string vazia', () => {
    expect(parseMcpConfig('')).toEqual([])
  })

  it('concatena command + args no campo command', () => {
    const raw = JSON.stringify({ mcpServers: { test: { command: 'npx', args: ['-y', '@mcp/test'] } } })
    const mcps = parseMcpConfig(raw)
    expect(mcps[0].command).toBe('npx -y @mcp/test')
  })
})
