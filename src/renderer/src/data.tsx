import React from 'react'

// ─── TYPES ──────────────────────────────────────────────────────────────────
export type PageId = 'skills' | 'workflows' | 'mcps' | 'workspaces' | 'settings'

export interface Skill {
  id: string; name: string; category: string; origin: string
  description: string; tags: string[]; path: string; updated: string
  triggers?: string[]; pinned?: boolean
}

export interface Workflow {
  id: string; slug: string; description: string; category: string
  origin: string; uses: number; workspace?: string; lastUsed?: string; tags?: string[]
}

export interface Mcp {
  id: string; name: string; type: string; origin: string
  status: string; command: string; tools: string[]; description: string; tags?: string[]
}

export interface Workspace {
  id: string; name: string; path: string; hasAgents: boolean
  workflows: string[]; skills: number; status: string; lastActive: string
  stack: string[]; description: string
}

// ─── DADOS MOCKADOS ─────────────────────────────────────────────────────────
export const SKILLS: Skill[] = [
  { id: "algorithmic-art", name: "algorithmic-art", category: "Creative", origin: "global", description: "Creating algorithmic art using p5.js with seeded randomness and interactive parameter exploration.", tags: ["p5.js", "canvas", "generative", "creative"], path: "C:\\Users\\ricar\\.gemini\\antigravity\\skills\\algorithmic-art", updated: "2d ago", triggers: ["algorithmic art", "p5.js", "generative art"], pinned: false },
  { id: "brand-guidelines", name: "brand-guidelines", category: "Creative", origin: "global", description: "Applies Anthropic's official brand colors and typography to artifacts that benefit from brand consistency.", tags: ["brand", "colors", "typography", "anthropic"], path: "C:\\Users\\ricar\\.gemini\\antigravity\\skills\\brand-guidelines", updated: "5d ago", triggers: ["brand guidelines", "anthropic style"], pinned: false },
  { id: "canvas-design", name: "canvas-design", category: "Design", origin: "global", description: "Create beautiful visual art in .png and .pdf documents using design philosophy.", tags: ["design", "png", "pdf", "poster", "visual"], path: "C:\\Users\\ricar\\.gemini\\antigravity\\skills\\canvas-design", updated: "1d ago", triggers: ["create a poster", "design a flyer", "visual document"], pinned: true },
  { id: "claude-api", name: "claude-api", category: "AI", origin: "global", description: "Build apps with the Claude API or Anthropic SDK. TRIGGER when: code imports 'anthropic'/'@anthropic-sdk'.", tags: ["sdk", "api", "llm", "streaming", "tools"], path: "C:\\Users\\ricar\\.gemini\\antigravity\\skills\\claude-api", updated: "3d ago", triggers: ["anthropic sdk", "claude api", "import anthropic"], pinned: false },
  { id: "doc-coauthoring", name: "doc-coauthoring", category: "Documents", origin: "global", description: "Guide users through a structured workflow for co-authoring documentation, proposals, technical specs.", tags: ["docs", "collaboration", "writing", "proposals"], path: "C:\\Users\\ricar\\.gemini\\antigravity\\skills\\doc-coauthoring", updated: "1w ago", triggers: ["co-author", "documentation workflow"], pinned: false },
  { id: "docx", name: "docx", category: "Documents", origin: "global", description: "Use whenever the user wants to create, read, edit, or manipulate Word documents (.docx files).", tags: ["word", "docx", "microsoft", "office"], path: "C:\\Users\\ricar\\.gemini\\antigravity\\skills\\docx", updated: "2d ago", triggers: ["word doc", ".docx", "word document"], pinned: false },
  { id: "frontend-design", name: "frontend-design", category: "Design", origin: "global", description: "Create distinctive, production-grade frontend interfaces with high design quality.", tags: ["react", "tailwind", "ui", "css", "components"], path: "C:\\Users\\ricar\\.gemini\\antigravity\\skills\\frontend-design", updated: "6h ago", triggers: ["build a component", "design a page", "react ui"], pinned: true },
  { id: "internal-comms", name: "internal-comms", category: "General", origin: "global", description: "Write all kinds of internal communications — Slack messages, emails, announcements using company formats.", tags: ["slack", "email", "hr", "internal"], path: "C:\\Users\\ricar\\.gemini\\antigravity\\skills\\internal-comms", updated: "3d ago", triggers: ["internal communication", "slack message"], pinned: false },
  { id: "legal-document-explainer", name: "legal-document-explainer", category: "Documents", origin: "global", description: "Explains legal documents in plain language, highlights key clauses, and flags concerning terms.", tags: ["legal", "contracts", "compliance", "nda"], path: "C:\\Users\\ricar\\.gemini\\antigravity\\skills\\legal-document-explainer", updated: "5d ago", triggers: ["legal document", "explain contract"], pinned: false },
  { id: "pdf", name: "pdf", category: "Documents", origin: "global", description: "Use whenever working with PDF files — creating, extracting text/tables, combining, splitting, OCR.", tags: ["pdf", "pypdf", "ocr", "extract"], path: "C:\\Users\\ricar\\.gemini\\antigravity\\skills\\pdf", updated: "2d ago", triggers: [".pdf", "extract from pdf"], pinned: false },
  { id: "pptx", name: "pptx", category: "Documents", origin: "global", description: "Any time a .pptx file is involved — as input, output, or both. Creating decks, parsing, editing.", tags: ["powerpoint", "slides", "deck", "presentation"], path: "C:\\Users\\ricar\\.gemini\\antigravity\\skills\\pptx", updated: "4d ago", triggers: ["powerpoint", ".pptx", "create slides"], pinned: false },
  { id: "xlsx", name: "xlsx", category: "Documents", origin: "global", description: "Any time a spreadsheet file is the primary input or output. Open, read, edit, fix Excel files.", tags: ["excel", "spreadsheet", "csv", "xlsx"], path: "C:\\Users\\ricar\\.gemini\\antigravity\\skills\\xlsx", updated: "4d ago", triggers: ["excel", ".xlsx", "spreadsheet"], pinned: false },
  { id: "n8n-code-javascript", name: "n8n-code-javascript", category: "n8n", origin: "global", description: "Write JavaScript code nodes for n8n automations with best practices and error handling.", tags: ["n8n", "javascript", "automation", "code-node"], path: "C:\\Users\\ricar\\.gemini\\antigravity\\skills\\n8n-code-javascript", updated: "1d ago", triggers: ["n8n code node", "javascript n8n"], pinned: false },
  { id: "n8n-workflow-patterns", name: "n8n-workflow-patterns", category: "n8n", origin: "global", description: "Design complex n8n workflow patterns with error handling, retry logic and webhook triggers.", tags: ["n8n", "workflow", "patterns", "webhook"], path: "C:\\Users\\ricar\\.gemini\\antigravity\\skills\\n8n-workflow-patterns", updated: "2d ago", triggers: ["n8n workflow", "build automation"], pinned: false },
  { id: "testing-unit", name: "testing-unit", category: "Testing", origin: "global", description: "Write comprehensive unit tests with Jest, Vitest or pytest including mocks and fixtures.", tags: ["jest", "vitest", "pytest", "tdd", "coverage"], path: "C:\\Users\\ricar\\.gemini\\antigravity\\skills\\testing-unit", updated: "3d ago", triggers: ["write tests", "unit test", "jest"], pinned: false },
]

export const WORKFLOWS: Workflow[] = [
  { id: "ai-agent", slug: "/ai-agent", description: "Create AI agents with tools and capabilities. Scaffolds agent loop, tool definitions, and system prompt.", category: "AI", origin: "global", uses: 42, lastUsed: "1h ago", tags: ["ai", "agent", "llm"] },
  { id: "ai-jail", slug: "/ai-jail", description: "Test AI agent limits and establish governance rules using the Akita Method (Day 1).", category: "AI", origin: "global", uses: 12, lastUsed: "3d ago", tags: ["ai", "testing", "security"] },
  { id: "akita-way", slug: "/akita-way", description: "Full XP + AI development workflow based on Fabio Akita's methodology. TDD-first.", category: "Dev", origin: "global", uses: 89, lastUsed: "30m ago", tags: ["dev", "tdd", "agile"] },
  { id: "api-docs", slug: "/api-docs", description: "Generate API documentation in OpenAPI, JSDoc, TSDoc formats from source code.", category: "Dev", origin: "global", uses: 55, lastUsed: "2h ago", tags: ["api", "docs", "documentation"] },
  { id: "architecture", slug: "/architecture", description: "Create architecture diagrams using Mermaid or C4 notation.", category: "Dev", origin: "global", uses: 34, lastUsed: "1d ago", tags: ["architecture", "diagrams", "mermaid"] },
  { id: "auth-implementation", slug: "/auth-implementation", description: "Implement authentication patterns — JWT, OAuth2, session-based, magic links.", category: "Dev", origin: "global", uses: 28, lastUsed: "5d ago", tags: ["auth", "security", "jwt"] },
  { id: "ci-cd", slug: "/ci-cd", description: "Set up CI/CD pipelines for GitHub Actions, GitLab CI, or CircleCI.", category: "Dev", origin: "global", uses: 19, lastUsed: "1w ago", tags: ["ci-cd", "devops", "github-actions"] },
  { id: "cli-tool", slug: "/cli-tool", description: "Build command-line applications with argument parsing and proper exit codes.", category: "Dev", origin: "global", uses: 23, lastUsed: "4d ago", tags: ["cli", "terminal", "node"] },
  { id: "code-review", slug: "/code-review", description: "Perform comprehensive code review checking quality, security and performance.", category: "Dev", origin: "global", uses: 67, lastUsed: "2h ago", tags: ["review", "quality", "security"] },
  { id: "dashboard-ui", slug: "/dashboard-ui", description: "Create professional admin dashboard interfaces with charts and tables.", category: "Design", origin: "global", uses: 31, lastUsed: "3d ago", tags: ["ui", "dashboard", "react"] },
  { id: "db-migrate", slug: "/db-migrate", description: "Create and run database migrations safely with rollback support.", category: "Dev", origin: "global", uses: 14, lastUsed: "1w ago", tags: ["database", "migration", "sql"] },
  { id: "db-schema", slug: "/db-schema", description: "Design database schemas with proper indexing, relations and naming.", category: "Dev", origin: "global", uses: 26, lastUsed: "6d ago", tags: ["database", "schema", "architecture"] },
  { id: "deploy-vercel", slug: "/deploy-vercel", description: "Deploy applications to Vercel with env config and preview deployments.", category: "Dev", origin: "global", uses: 18, lastUsed: "2d ago", tags: ["deploy", "vercel", "devops"] },
  { id: "n8n-build", slug: "/n8n-build", description: "Build complete n8n automation workflows from requirements.", category: "n8n", origin: "global", uses: 44, lastUsed: "4h ago", tags: ["n8n", "automation", "workflow"] },
  { id: "antigravity-tracker", slug: "/antigravity-tracker", description: "Tracks and indexes all Antigravity assets in the local ecosystem.", category: "Dev", origin: "local", workspace: "antigravity-tracker", uses: 3, lastUsed: "now", tags: ["tracker", "electron", "react"] },
]

export const MCPS: Mcp[] = [
  { id: "github-mcp-server", name: "github-mcp-server", type: "docker", origin: "global", status: "unknown", command: "docker run -i ghcr.io/github/github-mcp-server", tools: ["list_repos", "create_pr", "get_issues", "search_code", "create_branch", "merge_pr"], description: "Full GitHub API via Docker container", tags: ["github", "docker", "git"] },
  { id: "stripe", name: "stripe", type: "node", origin: "global", status: "unknown", command: "npx -y @stripe/mcp --api-key=$STRIPE_API_KEY", tools: ["list_customers", "create_payment", "get_subscription", "create_invoice"], description: "Stripe payment processing & billing", tags: ["stripe", "billing", "api"] },
  { id: "n8n-mcp", name: "n8n-mcp", type: "node", origin: "global", status: "unknown", command: "node C:\\Users\\ricar\\AppData\\Roaming\\npm\\node_modules\\n8n-mcp\\dist\\index.js", tools: ["list_workflows", "execute_workflow", "get_executions", "create_workflow"], description: "n8n workflow automation control", tags: ["n8n", "automation"] },
  { id: "firecrawl-mcp", name: "firecrawl-mcp", type: "node", origin: "global", status: "unknown", command: "node C:\\Users\\ricar\\AppData\\Roaming\\npm\\node_modules\\firecrawl-mcp\\dist\\index.js", tools: ["scrape_url", "crawl_site", "search", "extract_data"], description: "Web scraping & data extraction", tags: ["scraping", "crawler", "data"] },
  { id: "mcp-obsidian", name: "mcp-obsidian", type: "python", origin: "global", status: "unknown", command: "C:\\Users\\ricar\\.local\\bin\\uvx.exe mcp-obsidian --vault=$OBSIDIAN_VAULT", tools: ["read_note", "create_note", "search_notes", "list_vault"], description: "Obsidian vault read/write operations", tags: ["obsidian", "notes", "markdown"] },
  { id: "playwright", name: "playwright", type: "node", origin: "global", status: "unknown", command: "npx -y @playwright/mcp@latest", tools: ["navigate", "click", "screenshot", "evaluate", "fill_form"], description: "Browser automation & testing", tags: ["testing", "playwright", "automation"] },
  { id: "supabase", name: "supabase", type: "unknown", origin: "global", status: "unknown", command: "", tools: ["query", "insert", "update", "auth", "storage"], description: "Supabase database, auth & storage", tags: ["database", "supabase", "auth"] },
  { id: "remotion-documentation", name: "remotion-documentation", type: "node", origin: "global", status: "unknown", command: "npx -y @remotion/mcp@latest", tools: ["search_docs", "get_api", "get_example"], description: "Remotion video documentation lookup", tags: ["remotion", "video", "docs"] },
  { id: "gsap-master", name: "gsap-master", type: "node", origin: "global", status: "unknown", command: "npx -y gsap-mcp@latest", tools: ["animate", "timeline", "scroll_trigger", "morph_svg"], description: "GSAP animation toolkit", tags: ["animation", "gsap", "frontend"] },
  { id: "lenis-mcp", name: "lenis-mcp", type: "node", origin: "global", status: "unknown", command: "npx -y lenis-mcp@latest", tools: ["smooth_scroll", "configure", "get_velocity"], description: "Lenis smooth scroll integration", tags: ["scroll", "lenis", "frontend"] },
]

export const WORKSPACES: Workspace[] = [
  { id: "antigravity-tracker", name: "antigravity-tracker", path: "D:\\Dev\\Projects\\Antigravity\\antigravity-tracker", hasAgents: true, workflows: ["/antigravity-tracker"], skills: 0, status: "active", lastActive: "now", stack: ["Electron", "React", "Vite"], description: "Desktop app para rastrear ativos do ecossistema Antigravity." },
  { id: "akita-saas", name: "akita-saas-boilerplate", path: "D:\\Dev\\Projects\\akita-saas-boilerplate", hasAgents: true, workflows: ["/deploy-vercel", "/auth-implementation", "/db-schema", "/code-review"], skills: 2, status: "active", lastActive: "3h ago", stack: ["Next.js", "Supabase", "Stripe"], description: "Boilerplate SaaS com autenticação, billing e dashboard admin." },
  { id: "n8n-automations", name: "n8n-automations", path: "D:\\Dev\\Projects\\n8n-automations", hasAgents: false, workflows: ["/n8n-build", "/api-docs", "/ci-cd", "/code-review", "/db-migrate", "/architecture"], skills: 1, status: "idle", lastActive: "2d ago", stack: ["n8n", "Node.js"], description: "Coleção de workflows n8n para automação de processos." },
]

// ─── CORES ───────────────────────────────────────────────────────────────────
export const CATEGORY_COLORS: Record<string, string> = {
  Creative: '#ff6b6b', Design: '#a78bfa', Documents: '#60a5fa', AI: '#34d399',
  General: '#94a3b8', Testing: '#fbbf24', n8n: '#f97316', Dev: '#38bdf8',
}

export const TYPE_COLORS: Record<string, string> = {
  docker: '#0ea5e9', node: '#4ade80', python: '#facc15', unknown: '#6b7280',
}

export const STACK_COLORS: Record<string, string> = {
  Electron: '#60a5fa', React: '#34d399', Vite: '#a78bfa', 'Next.js': '#f1f5f9',
  Supabase: '#34d399', Stripe: '#818cf8', n8n: '#f97316', 'Node.js': '#4ade80',
}

export const WF_CAT_COLORS: Record<string, string> = {
  AI: '#34d399', Dev: '#38bdf8', Design: '#a78bfa', n8n: '#f97316', Default: '#94a3b8',
}

// Tooltips para badges
export const BADGE_TOOLTIPS: Record<string, string> = {
  docker: 'Runs in a Docker container. Requires Docker installed.',
  node: 'Runs via Node.js / npx',
  python: 'Runs via Python / uvx',
  global: 'Available in all workspaces',
  local: 'Only available in this workspace',
  unknown: 'Transport type not detected',
}

// ─── ÍCONES SVG ─────────────────────────────────────────────────────────────
export const icons = {
  skills: (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
    </svg>
  ),
  workflows: (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polyline points="16 3 21 3 21 8" /><line x1="4" y1="20" x2="21" y2="3" />
      <polyline points="21 16 21 21 16 21" /><line x1="15" y1="15" x2="21" y2="21" />
      <line x1="4" y1="4" x2="9" y2="9" />
    </svg>
  ),
  mcps: (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="2" y="3" width="20" height="14" rx="2" /><line x1="8" y1="21" x2="16" y2="21" /><line x1="12" y1="17" x2="12" y2="21" />
    </svg>
  ),
  workspaces: (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z" />
    </svg>
  ),
  settings: (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" />
    </svg>
  ),
  search: (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
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
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 10, color: c }}>
      <span style={{ width: 6, height: 6, borderRadius: '50%', background: c, boxShadow: `0 0 8px ${c}` }} />
      {status}
    </span>
  )
}

export function Tag({ label, color, small, tooltip }: { label: string; color?: string; small?: boolean; tooltip?: string }) {
  return (
    <span className={tooltip ? 'has-tooltip' : undefined} style={{
      display: 'inline-flex', alignItems: 'center', position: 'relative',
      padding: small ? '1px 5px' : '2px 8px',
      borderRadius: 4, fontSize: small ? 9 : 10, fontWeight: 600, letterSpacing: '0.04em',
      background: color ? `${color}15` : '#ffffff08',
      color: color || '#64748b',
      border: `1px solid ${color ? `${color}28` : '#ffffff10'}`,
      textTransform: 'uppercase', whiteSpace: 'nowrap', cursor: tooltip ? 'help' : 'default',
    }}>
      {label}
      {tooltip && (
        <span className="tooltip-text" style={{
          position: 'absolute', bottom: 'calc(100% + 6px)', left: '50%', transform: 'translateX(-50%)',
          background: '#1a1f2e', color: '#94a3b8', fontSize: 10, fontWeight: 400,
          padding: '4px 8px', borderRadius: 4, border: '1px solid #ffffff15',
          whiteSpace: 'nowrap', pointerEvents: 'none', opacity: 0, transition: 'opacity 0.15s',
          zIndex: 100, textTransform: 'none', letterSpacing: 'normal',
        }}>{tooltip}</span>
      )}
    </span>
  )
}

export function CopyBtn({ text, label }: { text: string; label?: string }) {
  const [copied, setCopied] = React.useState(false)
  const copy = (e: React.MouseEvent) => {
    e.stopPropagation()
    navigator.clipboard?.writeText(text).catch(() => { })
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }
  return (
    <button onClick={copy} title={`Copy ${label || ''}`} style={{
      padding: '2px 8px', background: copied ? '#a3ff1215' : '#ffffff08',
      border: `1px solid ${copied ? '#a3ff1230' : '#ffffff10'}`, borderRadius: 4,
      color: copied ? '#a3ff12' : '#4a5568', fontSize: 9, fontFamily: 'inherit',
      cursor: 'pointer', transition: 'all 0.15s', letterSpacing: '0.06em',
    }}>
      {copied ? '✓ COPIED' : label || 'COPY'}
    </button>
  )
}

// Gera dados de sparkline seeded pelo id
export function generateSparkData(id: string, days = 7): number[] {
  let hash = 0
  for (let i = 0; i < id.length; i++) hash = ((hash << 5) - hash + id.charCodeAt(i)) | 0
  const result: number[] = []
  for (let i = 0; i < days; i++) {
    hash = ((hash * 1103515245 + 12345) & 0x7fffffff)
    result.push((hash % 10) + 1)
  }
  return result
}
