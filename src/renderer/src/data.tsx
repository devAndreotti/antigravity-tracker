import React from 'react'

// ─── TYPES ──────────────────────────────────────────────────────────────────
export type PageId = 'skills' | 'workflows' | 'mcps' | 'workspaces'

export interface Skill {
  id: string; name: string; category: string; origin: string
  description: string; tags: string[]; path: string; updated: string
}

export interface Workflow {
  id: string; slug: string; description: string; category: string
  origin: string; uses: number; workspace?: string
}

export interface Mcp {
  id: string; name: string; type: string; origin: string
  status: string; command: string; tools: string[]; description: string
}

export interface Workspace {
  id: string; name: string; path: string; hasAgents: boolean
  workflows: number; skills: number; status: string; lastActive: string
  stack: string[]; description: string
}

// ─── DADOS MOCKADOS ─────────────────────────────────────────────────────────
export const SKILLS: Skill[] = [
  { id: "algorithmic-art", name: "algorithmic-art", category: "Creative", origin: "global", description: "Creating algorithmic art using p5.js with seeded randomness and interactive parameter exploration.", tags: ["p5.js", "canvas", "generative"], path: "C:\\Users\\ricar\\.gemini\\antigravity\\skills\\algorithmic-art", updated: "2d ago" },
  { id: "brand-guidelines", name: "brand-guidelines", category: "Creative", origin: "global", description: "Applies Anthropic's official brand colors and typography to artifacts that benefit from brand consistency.", tags: ["brand", "colors", "typography"], path: "C:\\Users\\ricar\\.gemini\\antigravity\\skills\\brand-guidelines", updated: "5d ago" },
  { id: "canvas-design", name: "canvas-design", category: "Design", origin: "global", description: "Create beautiful visual art in .png and .pdf documents using design philosophy.", tags: ["design", "png", "pdf", "poster"], path: "C:\\Users\\ricar\\.gemini\\antigravity\\skills\\canvas-design", updated: "1d ago" },
  { id: "claude-api", name: "claude-api", category: "AI", origin: "global", description: "Build apps with the Claude API or Anthropic SDK. TRIGGER when: code imports 'anthropic'/'@anthropic-...", tags: ["sdk", "api", "llm"], path: "C:\\Users\\ricar\\.gemini\\antigravity\\skills\\claude-api", updated: "3d ago" },
  { id: "doc-coauthoring", name: "doc-coauthoring", category: "Documents", origin: "global", description: "Guide users through a structured workflow for co-authoring documentation, proposals, technical specs.", tags: ["docs", "collaboration", "writing"], path: "C:\\Users\\ricar\\.gemini\\antigravity\\skills\\doc-coauthoring", updated: "1w ago" },
  { id: "docx", name: "docx", category: "Documents", origin: "global", description: "Use whenever the user wants to create, read, edit, or manipulate Word documents (.docx files).", tags: ["word", "docx", "microsoft"], path: "C:\\Users\\ricar\\.gemini\\antigravity\\skills\\docx", updated: "2d ago" },
  { id: "frontend-design", name: "frontend-design", category: "Design", origin: "global", description: "Create distinctive, production-grade frontend interfaces with high design quality.", tags: ["react", "tailwind", "ui", "css"], path: "C:\\Users\\ricar\\.gemini\\antigravity\\skills\\frontend-design", updated: "6h ago" },
  { id: "internal-comms", name: "internal-comms", category: "General", origin: "global", description: "A set of resources to help write all kinds of internal communications, using the formats that my company likes.", tags: ["slack", "email", "hr"], path: "C:\\Users\\ricar\\.gemini\\antigravity\\skills\\internal-comms", updated: "3d ago" },
  { id: "legal-document-explainer", name: "legal-document-explainer", category: "Documents", origin: "global", description: "Explains legal documents in plain language.", tags: ["legal", "contracts", "compliance"], path: "C:\\Users\\ricar\\.gemini\\antigravity\\skills\\legal-document-explainer", updated: "5d ago" },
  { id: "pdf", name: "pdf", category: "Documents", origin: "global", description: "Use whenever working with PDF files — creating, extracting, merging, splitting, OCR.", tags: ["pdf", "pypdf", "ocr"], path: "C:\\Users\\ricar\\.gemini\\antigravity\\skills\\pdf", updated: "2d ago" },
  { id: "pptx", name: "pptx", category: "Documents", origin: "global", description: "Any time a .pptx file is involved — as input, output, or both.", tags: ["powerpoint", "slides", "deck"], path: "C:\\Users\\ricar\\.gemini\\antigravity\\skills\\pptx", updated: "4d ago" },
  { id: "xlsx", name: "xlsx", category: "Documents", origin: "global", description: "Any time a spreadsheet file is the primary input or output.", tags: ["excel", "spreadsheet", "csv"], path: "C:\\Users\\ricar\\.gemini\\antigravity\\skills\\xlsx", updated: "4d ago" },
  { id: "n8n-code-javascript", name: "n8n-code-javascript", category: "n8n", origin: "global", description: "Write JavaScript code nodes for n8n automations.", tags: ["n8n", "javascript", "automation"], path: "C:\\Users\\ricar\\.gemini\\antigravity\\skills\\n8n-code-javascript", updated: "1d ago" },
  { id: "n8n-workflow-patterns", name: "n8n-workflow-patterns", category: "n8n", origin: "global", description: "Design complex n8n workflow patterns with error handling and retry logic.", tags: ["n8n", "workflow", "patterns"], path: "C:\\Users\\ricar\\.gemini\\antigravity\\skills\\n8n-workflow-patterns", updated: "2d ago" },
  { id: "testing-unit", name: "testing-unit", category: "Testing", origin: "global", description: "Write comprehensive unit tests with Jest, Vitest or pytest.", tags: ["jest", "vitest", "pytest"], path: "C:\\Users\\ricar\\.gemini\\antigravity\\skills\\testing-unit", updated: "3d ago" },
]

export const WORKFLOWS: Workflow[] = [
  { id: "ai-agent", slug: "/ai-agent", description: "Create AI agents with tools and capabilities", category: "AI", origin: "global", uses: 42 },
  { id: "ai-jail", slug: "/ai-jail", description: "Test AI agent limits and establish governance rules (Akita Method — Day 1)", category: "AI", origin: "global", uses: 12 },
  { id: "akita-way", slug: "/akita-way", description: "Full XP + AI development workflow based on Fabio Akita's methodology", category: "Dev", origin: "global", uses: 89 },
  { id: "api-docs", slug: "/api-docs", description: "Generate API documentation (OpenAPI, JSDoc, etc.)", category: "Dev", origin: "global", uses: 55 },
  { id: "architecture", slug: "/architecture", description: "Create architecture diagrams with Mermaid or C4", category: "Dev", origin: "global", uses: 34 },
  { id: "auth-implementation", slug: "/auth-implementation", description: "Implement authentication patterns for any stack", category: "Dev", origin: "global", uses: 28 },
  { id: "ci-cd", slug: "/ci-cd", description: "Set up CI/CD pipelines for any platform", category: "Dev", origin: "global", uses: 19 },
  { id: "cli-tool", slug: "/cli-tool", description: "Build command-line applications with argument parsing", category: "Dev", origin: "global", uses: 23 },
  { id: "code-review", slug: "/code-review", description: "Perform comprehensive code review for quality, security, and maintainability", category: "Dev", origin: "global", uses: 67 },
  { id: "dashboard-ui", slug: "/dashboard-ui", description: "Create professional admin dashboard interfaces for any tech stack", category: "Design", origin: "global", uses: 31 },
  { id: "db-migrate", slug: "/db-migrate", description: "Create and run database migrations safely", category: "Dev", origin: "global", uses: 14 },
  { id: "db-schema", slug: "/db-schema", description: "Design database schemas for any ORM or database", category: "Dev", origin: "global", uses: 26 },
  { id: "deploy-vercel", slug: "/deploy-vercel", description: "Deploy applications to Vercel with proper configuration", category: "Dev", origin: "global", uses: 18 },
  { id: "n8n-build", slug: "/n8n-build", description: "Build complete n8n automation workflows from requirements", category: "n8n", origin: "global", uses: 44 },
  { id: "local-workflow-1", slug: "/antigravity-tracker", description: "Tracks and indexes all Antigravity assets", category: "Dev", origin: "local", workspace: "antigravity-tracker", uses: 3 },
]

export const MCPS: Mcp[] = [
  { id: "github-mcp-server", name: "github-mcp-server", type: "docker", origin: "global", status: "unknown", command: "docker run -i...", tools: ["list_repos", "create_pr", "get_issues", "search_code"], description: "GitHub operations via Docker" },
  { id: "stripe", name: "stripe", type: "node", origin: "global", status: "unknown", command: "npx -y @stripe/mcp...", tools: ["list_customers", "create_payment", "get_subscription"], description: "Stripe payment processing" },
  { id: "n8n-mcp", name: "n8n-mcp", type: "node", origin: "global", status: "unknown", command: "node C:\\Users\\ricar\\AppData\\Roaming\\npm\\node_modules\\n8n-m...", tools: ["list_workflows", "execute_workflow", "get_executions"], description: "n8n workflow automation" },
  { id: "firecrawl-mcp", name: "firecrawl-mcp", type: "node", origin: "global", status: "unknown", command: "node C:\\Users\\ricar\\AppData\\Roaming\\npm\\node_modules\\firecrawl...", tools: ["scrape_url", "crawl_site", "search"], description: "Web scraping and crawling" },
  { id: "mcp-obsidian", name: "mcp-obsidian", type: "python", origin: "global", status: "unknown", command: "C:\\Users\\ricar\\.local\\bin\\uvx.exe mcp-obsidian", tools: ["read_note", "create_note", "search_notes", "list_vault"], description: "Obsidian vault operations" },
  { id: "playwright", name: "playwright", type: "node", origin: "global", status: "unknown", command: "npx -y @playwright/mcp@latest", tools: ["navigate", "click", "screenshot", "evaluate"], description: "Browser automation" },
  { id: "supabase", name: "supabase", type: "unknown", origin: "global", status: "unknown", command: "", tools: ["query", "insert", "update", "auth"], description: "Supabase database & auth" },
  { id: "remotion-documentation", name: "remotion-documentation", type: "node", origin: "global", status: "unknown", command: "npx -y @remotion/mcp@latest", tools: ["search_docs", "get_api", "get_example"], description: "Remotion video docs" },
  { id: "gsap-master", name: "gsap-master", type: "node", origin: "global", status: "unknown", command: "npx -y gsap-mcp@latest", tools: ["animate", "timeline", "scroll_trigger"], description: "GSAP animation toolkit" },
  { id: "lenis-mcp", name: "lenis-mcp", type: "node", origin: "global", status: "unknown", command: "npx -y lenis-mcp@latest", tools: ["smooth_scroll", "configure"], description: "Lenis smooth scroll" },
]

export const WORKSPACES: Workspace[] = [
  { id: "antigravity-tracker", name: "antigravity-tracker", path: "D:\\Dev\\Projects\\Antigravity\\antigravity-tracker", hasAgents: true, workflows: 1, skills: 0, status: "active", lastActive: "now", stack: ["Electron", "React", "Vite"], description: "Desktop app para rastrear ativos do ecossistema Antigravity" },
  { id: "akita-saas", name: "akita-saas-boilerplate", path: "D:\\Dev\\Projects\\akita-saas-boilerplate", hasAgents: true, workflows: 4, skills: 2, status: "active", lastActive: "3h ago", stack: ["Next.js", "Supabase", "Stripe"], description: "Boilerplate SaaS com autenticação, billing e dashboard" },
  { id: "n8n-automations", name: "n8n-automations", path: "D:\\Dev\\Projects\\n8n-automations", hasAgents: false, workflows: 7, skills: 1, status: "idle", lastActive: "2d ago", stack: ["n8n", "Node.js"], description: "Coleção de workflows n8n para automação de processos" },
]

// ─── CORES POR CATEGORIA ────────────────────────────────────────────────────
export const CATEGORY_COLORS: Record<string, string> = {
  Creative: '#ff6b6b',
  Design: '#a78bfa',
  Documents: '#60a5fa',
  AI: '#34d399',
  General: '#94a3b8',
  Testing: '#fbbf24',
  n8n: '#f97316',
  Dev: '#38bdf8',
}

export const TYPE_COLORS: Record<string, string> = {
  docker: '#0ea5e9',
  node: '#4ade80',
  python: '#facc15',
  unknown: '#94a3b8',
}

export const STACK_COLORS: Record<string, string> = {
  Electron: '#60a5fa',
  React: '#34d399',
  Vite: '#a78bfa',
  'Next.js': '#f1f5f9',
  Supabase: '#34d399',
  Stripe: '#818cf8',
  n8n: '#f97316',
  'Node.js': '#4ade80',
}

export const WF_CAT_COLORS: Record<string, string> = {
  AI: '#34d399',
  Dev: '#38bdf8',
  Design: '#a78bfa',
  n8n: '#f97316',
  Default: '#94a3b8',
}

// ─── ÍCONES SVG ─────────────────────────────────────────────────────────────
export const icons = {
  skills: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
    </svg>
  ),
  workflows: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polyline points="16 3 21 3 21 8" /><line x1="4" y1="20" x2="21" y2="3" />
      <polyline points="21 16 21 21 16 21" /><line x1="15" y1="15" x2="21" y2="21" />
      <line x1="4" y1="4" x2="9" y2="9" />
    </svg>
  ),
  mcps: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="2" y="3" width="20" height="14" rx="2" /><line x1="8" y1="21" x2="16" y2="21" /><line x1="12" y1="17" x2="12" y2="21" />
    </svg>
  ),
  workspaces: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z" />
    </svg>
  ),
  search: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
    </svg>
  ),
}

// ─── COMPONENTES COMPARTILHADOS ─────────────────────────────────────────────
export function DotStatus({ status }: { status: string }) {
  const colors: Record<string, string> = {
    active: '#4ade80', idle: '#fbbf24', unknown: '#6b7280',
    running: '#4ade80', stopped: '#f87171',
  }
  const c = colors[status] || '#6b7280'
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 11, color: c }}>
      <span style={{ width: 6, height: 6, borderRadius: '50%', background: c, boxShadow: `0 0 6px ${c}` }} />
      {status}
    </span>
  )
}

export function Tag({ label, color, small }: { label: string; color?: string; small?: boolean }) {
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center',
      padding: small ? '1px 6px' : '2px 8px',
      borderRadius: 4, fontSize: small ? 9 : 10, fontWeight: 600, letterSpacing: '0.04em',
      background: color ? `${color}18` : '#ffffff0d',
      color: color || '#94a3b8',
      border: `1px solid ${color ? `${color}30` : '#ffffff12'}`,
      textTransform: 'uppercase',
    }}>
      {label}
    </span>
  )
}
