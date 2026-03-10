import { describe, it, expect } from 'vitest'
import { autoTag } from '../../src/main/autoTagger'

describe('autoTagger', () => {
  it('should extract tags from explicitly defined manual keyword rules in title/description', () => {
    const tags = autoTag({
      name: 'My React Application',
      description: 'A frontend using react and tailwind.',
    })

    expect(tags).toContain('react')
    expect(tags).toContain('frontend')
    expect(tags).toContain('styling')
    expect(tags).toContain('css')
  })

  it('should handle different cases in content', () => {
    const tags = autoTag({
      content: 'We use DOCKER to containerize and k8s for devops!',
    })

    expect(tags).toContain('docker')
    expect(tags).toContain('devops')
    expect(tags).toContain('kubernetes')
  })

  it('should infer tags from the path naturally', () => {
    // Skills
    let tags = autoTag({ path: '/Users/foo/antigravity/skills/my-skill/SKILL.md' })
    expect(tags).toContain('skill')

    // Workflows
    tags = autoTag({ path: 'C:\\Projects\\.agents\\workflows\\deploy.md' })
    expect(tags).toContain('workflow')
  })

  it('should infer tags from command lines for MCPs', () => {
    const pythonTags = autoTag({ command: 'uvx mcp-obsidian' })
    expect(pythonTags).toContain('python')
    expect(pythonTags).toContain('ai') // "mcp" alone implies ai

    const nodeTags = autoTag({ command: 'npx -y @playwright/mcp' })
    expect(nodeTags).toContain('node')
    // and playwright is a testing tool
    expect(nodeTags).toContain('testing')
  })

  it('should enforce a maximum of 5 tags', () => {
    // This string contains tons of keywords that mapped would exceed 5 tags
    const tags = autoTag({
      name: 'Super AI App',
      description: 'Built with React, Node, Python, Docker, Postgres, AWS, Azure, GCP, and Stripe.'
    })

    expect(tags.length).toBeLessThanOrEqual(5)
  })

  it('should correctly tokenize dash and underscore separated names', () => {
    const tags = autoTag({ name: 'n8n-workflow-expert' })
    expect(tags).toContain('n8n')
    expect(tags).toContain('automation')
  })
})
