import { useState, useEffect, useRef, useCallback } from "react";

// ─── DATA ────────────────────────────────────────────────────────────────────

const SKILLS = [
  { id: "algorithmic-art", name: "algorithmic-art", category: "Creative", origin: "global", description: "Creating algorithmic art using p5.js with seeded randomness and interactive parameter exploration. Use when users request creating procedural visuals, generative patterns or interactive canvas experiments.", tags: ["p5.js", "canvas", "generative", "creative"], path: "C:\\Users\\ricar\\.gemini\\antigravity\\skills\\algorithmic-art", updated: "2d ago", triggers: ["algorithmic art", "p5.js", "generative art"], pinned: false },
  { id: "brand-guidelines", name: "brand-guidelines", category: "Creative", origin: "global", description: "Applies Anthropic's official brand colors and typography to any artifact that may benefit from brand consistency.", tags: ["brand", "colors", "typography", "anthropic"], path: "C:\\Users\\ricar\\.gemini\\antigravity\\skills\\brand-guidelines", updated: "5d ago", triggers: ["brand guidelines", "anthropic style"], pinned: false },
  { id: "canvas-design", name: "canvas-design", category: "Design", origin: "global", description: "Create beautiful visual art in .png and .pdf documents using design philosophy. Use when user asks to create a poster, flyer, presentation cover, social media graphic or any visual document.", tags: ["design", "png", "pdf", "poster", "visual"], path: "C:\\Users\\ricar\\.gemini\\antigravity\\skills\\canvas-design", updated: "1d ago", triggers: ["create a poster", "design a flyer", "visual document"], pinned: true },
  { id: "claude-api", name: "claude-api", category: "AI", origin: "global", description: "Build apps with the Claude API or Anthropic SDK. TRIGGER when: code imports 'anthropic'/'@anthropic-sdk', user asks about streaming, tool use, or batch processing.", tags: ["sdk", "api", "llm", "streaming", "tools"], path: "C:\\Users\\ricar\\.gemini\\antigravity\\skills\\claude-api", updated: "3d ago", triggers: ["anthropic sdk", "claude api", "import anthropic"], pinned: false },
  { id: "doc-coauthoring", name: "doc-coauthoring", category: "Documents", origin: "global", description: "Guide users through a structured workflow for co-authoring documentation, proposals, technical specs, and knowledge bases.", tags: ["docs", "collaboration", "writing", "proposals"], path: "C:\\Users\\ricar\\.gemini\\antigravity\\skills\\doc-coauthoring", updated: "1w ago", triggers: ["co-author", "documentation workflow", "write together"], pinned: false },
  { id: "docx", name: "docx", category: "Documents", origin: "global", description: "Use whenever the user wants to create, read, edit, or manipulate Word documents (.docx files). Triggers include: any mention of 'Word doc', 'word document', '.docx'.", tags: ["word", "docx", "microsoft", "office"], path: "C:\\Users\\ricar\\.gemini\\antigravity\\skills\\docx", updated: "2d ago", triggers: ["word doc", ".docx", "word document"], pinned: false },
  { id: "frontend-design", name: "frontend-design", category: "Design", origin: "global", description: "Create distinctive, production-grade frontend interfaces with high design quality. Use when user asks to build web components, pages, artifacts or applications.", tags: ["react", "tailwind", "ui", "css", "components"], path: "C:\\Users\\ricar\\.gemini\\antigravity\\skills\\frontend-design", updated: "6h ago", triggers: ["build a component", "design a page", "react ui"], pinned: true },
  { id: "internal-comms", name: "internal-comms", category: "General", origin: "global", description: "Write all kinds of internal communications — Slack messages, emails, announcements, HR documents using company formats.", tags: ["slack", "email", "hr", "internal"], path: "C:\\Users\\ricar\\.gemini\\antigravity\\skills\\internal-comms", updated: "3d ago", triggers: ["internal communication", "slack message", "company email"], pinned: false },
  { id: "legal-document-explainer", name: "legal-document-explainer", category: "Documents", origin: "global", description: "Explains legal documents in plain language, highlights key clauses, and flags potentially concerning terms.", tags: ["legal", "contracts", "compliance", "nda"], path: "C:\\Users\\ricar\\.gemini\\antigravity\\skills\\legal-document-explainer", updated: "5d ago", triggers: ["legal document", "explain contract", "nda review"], pinned: false },
  { id: "pdf", name: "pdf", category: "Documents", origin: "global", description: "Use whenever working with PDF files — creating, extracting text/tables, combining, splitting, rotating, OCR.", tags: ["pdf", "pypdf", "ocr", "extract"], path: "C:\\Users\\ricar\\.gemini\\antigravity\\skills\\pdf", updated: "2d ago", triggers: [".pdf", "extract from pdf", "merge pdf"], pinned: false },
  { id: "pptx", name: "pptx", category: "Documents", origin: "global", description: "Any time a .pptx file is involved — as input, output, or both. Creating decks, reading, parsing, editing presentations.", tags: ["powerpoint", "slides", "deck", "presentation"], path: "C:\\Users\\ricar\\.gemini\\antigravity\\skills\\pptx", updated: "4d ago", triggers: ["powerpoint", ".pptx", "create slides", "deck"], pinned: false },
  { id: "xlsx", name: "xlsx", category: "Documents", origin: "global", description: "Any time a spreadsheet file is the primary input or output. Open, read, edit, fix Excel files, create from scratch.", tags: ["excel", "spreadsheet", "csv", "xlsx"], path: "C:\\Users\\ricar\\.gemini\\antigravity\\skills\\xlsx", updated: "4d ago", triggers: ["excel", ".xlsx", "spreadsheet", "csv"], pinned: false },
  { id: "n8n-code-javascript", name: "n8n-code-javascript", category: "n8n", origin: "global", description: "Write JavaScript code nodes for n8n automations with best practices, error handling and proper data transformation.", tags: ["n8n", "javascript", "automation", "code-node"], path: "C:\\Users\\ricar\\.gemini\\antigravity\\skills\\n8n-code-javascript", updated: "1d ago", triggers: ["n8n code node", "javascript n8n", "code node automation"], pinned: false },
  { id: "n8n-workflow-patterns", name: "n8n-workflow-patterns", category: "n8n", origin: "global", description: "Design complex n8n workflow patterns with error handling, retry logic, webhook triggers and API integrations.", tags: ["n8n", "workflow", "patterns", "webhook"], path: "C:\\Users\\ricar\\.gemini\\antigravity\\skills\\n8n-workflow-patterns", updated: "2d ago", triggers: ["n8n workflow", "build automation", "webhook flow"], pinned: false },
  { id: "testing-unit", name: "testing-unit", category: "Testing", origin: "global", description: "Write comprehensive unit tests with Jest, Vitest or pytest including mocks, fixtures, coverage strategies.", tags: ["jest", "vitest", "pytest", "tdd", "coverage"], path: "C:\\Users\\ricar\\.gemini\\antigravity\\skills\\testing-unit", updated: "3d ago", triggers: ["write tests", "unit test", "jest", "vitest"], pinned: false },
];

const WORKFLOWS = [
  { id: "ai-agent", slug: "/ai-agent", description: "Create AI agents with tools and capabilities. Scaffolds agent loop, tool definitions, and system prompt.", category: "AI", origin: "global", uses: 42, lastUsed: "1h ago" },
  { id: "ai-jail", slug: "/ai-jail", description: "Test AI agent limits and establish governance rules using the Akita Method (Day 1).", category: "AI", origin: "global", uses: 12, lastUsed: "3d ago" },
  { id: "akita-way", slug: "/akita-way", description: "Full XP + AI development workflow based on Fabio Akita's methodology. TDD-first, incremental delivery.", category: "Dev", origin: "global", uses: 89, lastUsed: "30m ago" },
  { id: "api-docs", slug: "/api-docs", description: "Generate API documentation in OpenAPI, JSDoc, TSDoc or custom formats from source code.", category: "Dev", origin: "global", uses: 55, lastUsed: "2h ago" },
  { id: "architecture", slug: "/architecture", description: "Create architecture diagrams using Mermaid or C4 notation. Includes system context, container and component views.", category: "Dev", origin: "global", uses: 34, lastUsed: "1d ago" },
  { id: "auth-implementation", slug: "/auth-implementation", description: "Implement authentication patterns for any stack — JWT, OAuth2, session-based, magic links.", category: "Dev", origin: "global", uses: 28, lastUsed: "5d ago" },
  { id: "ci-cd", slug: "/ci-cd", description: "Set up CI/CD pipelines for GitHub Actions, GitLab CI, or CircleCI with testing, staging and production stages.", category: "Dev", origin: "global", uses: 19, lastUsed: "1w ago" },
  { id: "cli-tool", slug: "/cli-tool", description: "Build command-line applications with argument parsing, help output, config files and proper exit codes.", category: "Dev", origin: "global", uses: 23, lastUsed: "4d ago" },
  { id: "code-review", slug: "/code-review", description: "Perform comprehensive code review checking quality, security vulnerabilities, performance and maintainability.", category: "Dev", origin: "global", uses: 67, lastUsed: "2h ago" },
  { id: "dashboard-ui", slug: "/dashboard-ui", description: "Create professional admin dashboard interfaces with charts, tables, filters and responsive layouts.", category: "Design", origin: "global", uses: 31, lastUsed: "3d ago" },
  { id: "db-migrate", slug: "/db-migrate", description: "Create and run database migrations safely with rollback support for Prisma, Drizzle, or raw SQL.", category: "Dev", origin: "global", uses: 14, lastUsed: "1w ago" },
  { id: "db-schema", slug: "/db-schema", description: "Design database schemas for any ORM or database with proper indexing, relations and naming conventions.", category: "Dev", origin: "global", uses: 26, lastUsed: "6d ago" },
  { id: "deploy-vercel", slug: "/deploy-vercel", description: "Deploy applications to Vercel with proper env config, preview deployments and domain setup.", category: "Dev", origin: "global", uses: 18, lastUsed: "2d ago" },
  { id: "n8n-build", slug: "/n8n-build", description: "Build complete n8n automation workflows from requirements — includes error handling and documentation.", category: "n8n", origin: "global", uses: 44, lastUsed: "4h ago" },
  { id: "antigravity-tracker", slug: "/antigravity-tracker", description: "Tracks and indexes all Antigravity assets in the local ecosystem.", category: "Dev", origin: "local", workspace: "antigravity-tracker", uses: 3, lastUsed: "now" },
];

const MCPS = [
  { id: "github-mcp-server", name: "github-mcp-server", type: "docker", origin: "global", status: "unknown", command: "docker run -i ghcr.io/github/github-mcp-server", tools: ["list_repos", "create_pr", "get_issues", "search_code", "create_branch", "merge_pr"], description: "Full GitHub API via Docker container" },
  { id: "stripe", name: "stripe", type: "node", origin: "global", status: "unknown", command: "npx -y @stripe/mcp --api-key=$STRIPE_API_KEY", tools: ["list_customers", "create_payment", "get_subscription", "create_invoice", "list_products"], description: "Stripe payment processing & billing" },
  { id: "n8n-mcp", name: "n8n-mcp", type: "node", origin: "global", status: "unknown", command: "node C:\\Users\\ricar\\AppData\\Roaming\\npm\\node_modules\\n8n-mcp\\dist\\index.js", tools: ["list_workflows", "execute_workflow", "get_executions", "create_workflow", "activate_workflow"], description: "n8n workflow automation control" },
  { id: "firecrawl-mcp", name: "firecrawl-mcp", type: "node", origin: "global", status: "unknown", command: "node C:\\Users\\ricar\\AppData\\Roaming\\npm\\node_modules\\firecrawl-mcp\\dist\\index.js", tools: ["scrape_url", "crawl_site", "search", "extract_data", "screenshot_page"], description: "Web scraping, crawling & data extraction" },
  { id: "mcp-obsidian", name: "mcp-obsidian", type: "python", origin: "global", status: "unknown", command: "C:\\Users\\ricar\\.local\\bin\\uvx.exe mcp-obsidian --vault=$OBSIDIAN_VAULT", tools: ["read_note", "create_note", "search_notes", "list_vault", "update_note", "delete_note"], description: "Obsidian vault read/write operations" },
  { id: "playwright", name: "playwright", type: "node", origin: "global", status: "unknown", command: "npx -y @playwright/mcp@latest", tools: ["navigate", "click", "screenshot", "evaluate", "fill_form", "wait_for"], description: "Browser automation & testing" },
  { id: "supabase", name: "supabase", type: "unknown", origin: "global", status: "unknown", command: "", tools: ["query", "insert", "update", "auth", "storage", "realtime"], description: "Supabase database, auth & storage" },
  { id: "remotion-documentation", name: "remotion-documentation", type: "node", origin: "global", status: "unknown", command: "npx -y @remotion/mcp@latest", tools: ["search_docs", "get_api", "get_example", "list_components"], description: "Remotion video documentation lookup" },
  { id: "gsap-master", name: "gsap-master", type: "node", origin: "global", status: "unknown", command: "npx -y gsap-mcp@latest", tools: ["animate", "timeline", "scroll_trigger", "morph_svg"], description: "GSAP animation toolkit" },
  { id: "lenis-mcp", name: "lenis-mcp", type: "node", origin: "global", status: "unknown", command: "npx -y lenis-mcp@latest", tools: ["smooth_scroll", "configure", "get_velocity"], description: "Lenis smooth scroll integration" },
];

const WORKSPACES = [
  { id: "antigravity-tracker", name: "antigravity-tracker", path: "D:\\Dev\\Projects\\Antigravity\\antigravity-tracker", hasAgents: true, workflows: ["antigravity-tracker"], skills: 0, status: "active", lastActive: "now", stack: ["Electron", "React", "Vite"], description: "Desktop app para rastrear ativos do ecossistema Antigravity. Electron + React + SQLite." },
  { id: "akita-saas", name: "akita-saas-boilerplate", path: "D:\\Dev\\Projects\\akita-saas-boilerplate", hasAgents: true, workflows: ["/deploy-vercel", "/auth-implementation", "/db-schema", "/code-review"], skills: 2, status: "active", lastActive: "3h ago", stack: ["Next.js", "Supabase", "Stripe"], description: "Boilerplate SaaS com autenticação, billing e dashboard admin. Multi-tenant ready." },
  { id: "n8n-automations", name: "n8n-automations", path: "D:\\Dev\\Projects\\n8n-automations", hasAgents: false, workflows: ["/n8n-build", "/api-docs", "/ci-cd", "/cli-tool", "/code-review", "/db-migrate", "/architecture"], skills: 1, status: "idle", lastActive: "2d ago", stack: ["n8n", "Node.js"], description: "Coleção de workflows n8n para automação de processos internos e integrações." },
];

// ─── CONSTANTS ───────────────────────────────────────────────────────────────

const CAT_COLORS = { Creative: "#ff6b6b", Design: "#a78bfa", Documents: "#60a5fa", AI: "#34d399", General: "#94a3b8", Testing: "#fbbf24", n8n: "#f97316", Dev: "#38bdf8" };
const TYPE_COLORS = { docker: "#0ea5e9", node: "#4ade80", python: "#facc15", unknown: "#6b7280" };
const STACK_COLORS = { Electron: "#60a5fa", React: "#34d399", Vite: "#a78bfa", "Next.js": "#f1f5f9", Supabase: "#34d399", Stripe: "#818cf8", n8n: "#f97316", "Node.js": "#4ade80" };

// ─── SMALL COMPONENTS ────────────────────────────────────────────────────────

const Tag = ({ label, color, xs }) => (
  <span style={{ display: "inline-flex", alignItems: "center", padding: xs ? "1px 5px" : "2px 8px", borderRadius: 4, fontSize: xs ? 9 : 10, fontWeight: 600, letterSpacing: "0.04em", background: color ? `${color}15` : "#ffffff08", color: color || "#64748b", border: `1px solid ${color ? `${color}28` : "#ffffff10"}`, textTransform: "uppercase", whiteSpace: "nowrap" }}>
    {label}
  </span>
);

const Dot = ({ status }) => {
  const c = { active: "#4ade80", idle: "#fbbf24", unknown: "#6b7280", running: "#4ade80", stopped: "#f87171" }[status] || "#6b7280";
  return <span style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: 10, color: c }}><span style={{ width: 6, height: 6, borderRadius: "50%", background: c, boxShadow: `0 0 8px ${c}` }} />{status}</span>;
};

function CopyBtn({ text, label }) {
  const [copied, setCopied] = useState(false);
  const copy = (e) => {
    e.stopPropagation();
    navigator.clipboard?.writeText(text).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };
  return (
    <button onClick={copy} title={`Copy ${label || ""}`} style={{ padding: "2px 8px", background: copied ? "#a3ff1215" : "#ffffff08", border: `1px solid ${copied ? "#a3ff1230" : "#ffffff10"}`, borderRadius: 4, color: copied ? "#a3ff12" : "#4a5568", fontSize: 9, fontFamily: "inherit", cursor: "pointer", transition: "all 0.15s", letterSpacing: "0.06em" }}>
      {copied ? "✓ COPIED" : label || "COPY"}
    </button>
  );
}

// ─── COMMAND PALETTE ─────────────────────────────────────────────────────────

function CommandPalette({ onClose, onNavigate }) {
  const [q, setQ] = useState("");
  const ref = useRef();
  useEffect(() => { ref.current?.focus(); }, []);

  const all = [
    ...SKILLS.map(s => ({ type: "skill", id: s.id, label: s.name, sub: s.description, category: s.category, page: "skills" })),
    ...WORKFLOWS.map(w => ({ type: "workflow", id: w.id, label: w.slug, sub: w.description, category: w.category, page: "workflows" })),
    ...MCPS.map(m => ({ type: "mcp", id: m.id, label: m.name, sub: m.description, category: m.type, page: "mcps" })),
    ...WORKSPACES.map(w => ({ type: "workspace", id: w.id, label: w.name, sub: w.description, category: w.status, page: "workspaces" })),
  ];

  const results = q.length > 1 ? all.filter(i => i.label.includes(q.toLowerCase()) || i.sub?.toLowerCase().includes(q.toLowerCase())).slice(0, 8) : all.slice(0, 6);

  const typeColors = { skill: "#a78bfa", workflow: "#a3ff12", mcp: "#60a5fa", workspace: "#f97316" };

  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "#000000aa", zIndex: 1000, display: "flex", alignItems: "flex-start", justifyContent: "center", paddingTop: 100, backdropFilter: "blur(4px)" }}>
      <div onClick={e => e.stopPropagation()} style={{ width: 540, background: "#0d1219", border: "1px solid #ffffff15", borderRadius: 10, overflow: "hidden", boxShadow: "0 24px 80px #000000cc" }}>
        <div style={{ display: "flex", alignItems: "center", padding: "12px 16px", borderBottom: "1px solid #ffffff08", gap: 10 }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#4a5568" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
          <input ref={ref} value={q} onChange={e => setQ(e.target.value)} placeholder="Search skills, workflows, MCPs..." style={{ flex: 1, background: "none", border: "none", outline: "none", color: "#e2e8f0", fontSize: 14, fontFamily: "inherit" }} />
          <span style={{ fontSize: 10, color: "#2d3748", background: "#ffffff08", padding: "2px 6px", borderRadius: 4 }}>ESC</span>
        </div>
        <div style={{ maxHeight: 360, overflow: "auto" }}>
          {results.map((r, i) => (
            <div key={r.id} onClick={() => { onNavigate(r.page); onClose(); }} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 16px", cursor: "pointer", borderBottom: "1px solid #ffffff05", transition: "background 0.1s" }}
              onMouseEnter={e => e.currentTarget.style.background = "#ffffff06"}
              onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
              <div style={{ width: 28, height: 28, borderRadius: 6, background: `${typeColors[r.type]}15`, border: `1px solid ${typeColors[r.type]}22`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <span style={{ fontSize: 10, color: typeColors[r.type] }}>{r.type[0].toUpperCase()}</span>
              </div>
              <div style={{ flex: 1, overflow: "hidden" }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: "#e2e8f0", fontFamily: "monospace" }}>{r.label}</div>
                <div style={{ fontSize: 10, color: "#4a5568", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{r.sub}</div>
              </div>
              <Tag label={r.type} color={typeColors[r.type]} xs />
            </div>
          ))}
        </div>
        <div style={{ padding: "8px 16px", borderTop: "1px solid #ffffff06", display: "flex", gap: 16 }}>
          {[["↑↓", "navigate"], ["↵", "open"], ["esc", "close"]].map(([k, v]) => (
            <span key={k} style={{ fontSize: 10, color: "#2d3748" }}><span style={{ background: "#ffffff08", padding: "1px 5px", borderRadius: 3, marginRight: 4, color: "#4a5568" }}>{k}</span>{v}</span>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── DETAIL PANEL ────────────────────────────────────────────────────────────

function DetailPanel({ item, type, onClose }) {
  if (!item) return null;
  return (
    <div style={{ width: 300, background: "#060910", borderLeft: "1px solid #ffffff0a", display: "flex", flexDirection: "column", flexShrink: 0, overflow: "hidden" }}>
      <div style={{ padding: "14px 16px", borderBottom: "1px solid #ffffff06", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span style={{ fontSize: 11, fontWeight: 600, color: "#4a5568", letterSpacing: "0.08em", textTransform: "uppercase" }}>{type} detail</span>
        <button onClick={onClose} style={{ background: "none", border: "none", color: "#4a5568", cursor: "pointer", fontSize: 16, lineHeight: 1 }}>×</button>
      </div>
      <div style={{ flex: 1, overflow: "auto", padding: 16 }}>
        {type === "skill" && <SkillDetail item={item} />}
        {type === "workflow" && <WorkflowDetail item={item} />}
        {type === "mcp" && <McpDetail item={item} />}
        {type === "workspace" && <WorkspaceDetail item={item} />}
      </div>
    </div>
  );
}

function DetailSection({ title, children }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <div style={{ fontSize: 9, fontWeight: 700, color: "#2d3748", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 8 }}>{title}</div>
      {children}
    </div>
  );
}

function SkillDetail({ item }) {
  return (
    <>
      <div style={{ marginBottom: 16 }}>
        <div style={{ fontSize: 15, fontWeight: 700, color: "#f1f5f9", marginBottom: 6, fontFamily: "'Syne', sans-serif" }}>{item.name}</div>
        <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
          <Tag label={item.category} color={CAT_COLORS[item.category]} />
          <Tag label={item.origin} color="#a3ff12" />
        </div>
      </div>
      <DetailSection title="Description">
        <p style={{ fontSize: 11, color: "#64748b", lineHeight: 1.6 }}>{item.description}</p>
      </DetailSection>
      {item.triggers && <DetailSection title="Triggers when">
        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          {item.triggers.map(t => (
            <div key={t} style={{ fontSize: 11, color: "#64748b", background: "#ffffff06", padding: "4px 8px", borderRadius: 4, border: "1px solid #ffffff08" }}>"{t}"</div>
          ))}
        </div>
      </DetailSection>}
      <DetailSection title="Tags">
        <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>{item.tags?.map(t => <Tag key={t} label={t} xs />)}</div>
      </DetailSection>
      <DetailSection title="Path">
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <div style={{ flex: 1, fontSize: 9, color: "#2d3748", fontFamily: "monospace", wordBreak: "break-all", lineHeight: 1.5 }}>{item.path}</div>
          <CopyBtn text={item.path} label="PATH" />
        </div>
      </DetailSection>
    </>
  );
}

function WorkflowDetail({ item }) {
  return (
    <>
      <div style={{ marginBottom: 16 }}>
        <div style={{ fontSize: 18, fontWeight: 700, color: "#a3ff12", marginBottom: 6, fontFamily: "monospace" }}>{item.slug}</div>
        <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
          <Tag label={item.category} color={CAT_COLORS[item.category] || "#94a3b8"} />
          <Tag label={item.origin} color={item.origin === "global" ? "#a3ff12" : "#f97316"} />
        </div>
      </div>
      <DetailSection title="Description">
        <p style={{ fontSize: 11, color: "#64748b", lineHeight: 1.6 }}>{item.description}</p>
      </DetailSection>
      <DetailSection title="Usage">
        <div style={{ display: "flex", gap: 12 }}>
          <div style={{ flex: 1, background: "#ffffff06", borderRadius: 6, padding: "10px", textAlign: "center" }}>
            <div style={{ fontSize: 20, fontWeight: 700, color: "#a3ff12", fontFamily: "'Syne', sans-serif" }}>{item.uses}</div>
            <div style={{ fontSize: 9, color: "#2d3748", marginTop: 2 }}>TOTAL USES</div>
          </div>
          <div style={{ flex: 1, background: "#ffffff06", borderRadius: 6, padding: "10px", textAlign: "center" }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: "#60a5fa", fontFamily: "'Syne', sans-serif" }}>{item.lastUsed}</div>
            <div style={{ fontSize: 9, color: "#2d3748", marginTop: 2 }}>LAST USED</div>
          </div>
        </div>
      </DetailSection>
      <DetailSection title="Invoke">
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <div style={{ flex: 1, background: "#060910", border: "1px solid #ffffff08", borderRadius: 5, padding: "6px 10px", fontSize: 13, color: "#a3ff12", fontFamily: "monospace" }}>{item.slug}</div>
          <CopyBtn text={item.slug} label="SLUG" />
        </div>
      </DetailSection>
    </>
  );
}

function McpDetail({ item }) {
  return (
    <>
      <div style={{ marginBottom: 16 }}>
        <div style={{ fontSize: 15, fontWeight: 700, color: "#f1f5f9", marginBottom: 6, fontFamily: "'Syne', sans-serif" }}>{item.name}</div>
        <div style={{ display: "flex", gap: 4 }}>
          <Tag label={item.type} color={TYPE_COLORS[item.type]} />
          <Dot status={item.status} />
        </div>
      </div>
      <DetailSection title="Description">
        <p style={{ fontSize: 11, color: "#64748b", lineHeight: 1.6 }}>{item.description}</p>
      </DetailSection>
      <DetailSection title={`Tools (${item.tools?.length || 0})`}>
        <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
          {item.tools?.map(t => (
            <div key={t} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "4px 8px", background: "#ffffff05", borderRadius: 4, border: "1px solid #ffffff08" }}>
              <span style={{ fontSize: 10, color: "#64748b", fontFamily: "monospace" }}>{t}</span>
              <CopyBtn text={t} label="COPY" />
            </div>
          ))}
        </div>
      </DetailSection>
      {item.command && <DetailSection title="Command">
        <div style={{ background: "#060910", borderRadius: 5, padding: "8px 10px", border: "1px solid #ffffff06", marginBottom: 6 }}>
          <span style={{ fontSize: 9, color: "#2d3748" }}>$ </span>
          <span style={{ fontSize: 10, color: "#64748b", fontFamily: "monospace", wordBreak: "break-all" }}>{item.command}</span>
        </div>
        <CopyBtn text={item.command} label="COPY COMMAND" />
      </DetailSection>}
    </>
  );
}

function WorkspaceDetail({ item }) {
  return (
    <>
      <div style={{ marginBottom: 16 }}>
        <div style={{ fontSize: 15, fontWeight: 700, color: "#f1f5f9", marginBottom: 4, fontFamily: "'Syne', sans-serif" }}>{item.name}</div>
        <Dot status={item.status} />
      </div>
      <DetailSection title="Description">
        <p style={{ fontSize: 11, color: "#64748b", lineHeight: 1.6 }}>{item.description}</p>
      </DetailSection>
      <DetailSection title="Stack">
        <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
          {item.stack?.map(s => <span key={s} style={{ fontSize: 10, color: STACK_COLORS[s] || "#64748b", background: `${STACK_COLORS[s] || "#64748b"}12`, border: `1px solid ${STACK_COLORS[s] || "#64748b"}22`, borderRadius: 4, padding: "2px 8px", fontWeight: 500 }}>{s}</span>)}
        </div>
      </DetailSection>
      <DetailSection title={`Linked Workflows (${item.workflows?.length || 0})`}>
        <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
          {item.workflows?.map(w => (
            <div key={w} style={{ padding: "5px 8px", background: "#ffffff05", borderRadius: 4, border: "1px solid #ffffff08", fontSize: 11, color: "#a3ff12", fontFamily: "monospace" }}>{w}</div>
          ))}
        </div>
      </DetailSection>
      <DetailSection title="Path">
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <div style={{ flex: 1, fontSize: 9, color: "#2d3748", fontFamily: "monospace", wordBreak: "break-all" }}>{item.path}</div>
          <CopyBtn text={item.path} label="COPY" />
        </div>
      </DetailSection>
    </>
  );
}

// ─── SKILLS PAGE ─────────────────────────────────────────────────────────────

function SkillsPage({ skills, allSkills, onSelect }) {
  const [filter, setFilter] = useState("All");
  const categories = ["All", ...Array.from(new Set(allSkills.map(s => s.category)))];
  const [pinned, setPinned] = useState(allSkills.filter(s => s.pinned).map(s => s.id));
  const displayed = skills.filter(s => filter === "All" || s.category === filter);
  const pinnedSkills = displayed.filter(s => pinned.includes(s.id));
  const rest = displayed.filter(s => !pinned.includes(s.id));

  const togglePin = (id, e) => { e.stopPropagation(); setPinned(p => p.includes(id) ? p.filter(x => x !== id) : [...p, id]); };

  const SkillCard = ({ skill }) => (
    <div onClick={() => onSelect(skill, "skill")} className="card" style={{ background: "#0a0f18", border: "1px solid #ffffff0d", borderRadius: 8, padding: "14px 16px", position: "relative", overflow: "hidden", cursor: "pointer" }}>
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: CAT_COLORS[skill.category] || "#4a5568", opacity: 0.7 }} />
      <div style={{ position: "absolute", top: 10, right: 12, opacity: 0 }} className="pin-btn">
        <button onClick={e => togglePin(skill.id, e)} style={{ background: "none", border: "none", color: pinned.includes(skill.id) ? "#a3ff12" : "#2d3748", cursor: "pointer", fontSize: 12, padding: 2 }}>★</button>
      </div>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 6, marginTop: 4, paddingRight: 20 }}>
        <div style={{ fontFamily: "monospace", fontSize: 13, fontWeight: 600, color: "#f1f5f9" }}>{skill.name}</div>
        <span style={{ fontSize: 9, color: "#2d3748", flexShrink: 0, marginLeft: 8 }}>{skill.updated}</span>
      </div>
      <div style={{ fontSize: 11, color: "#64748b", lineHeight: 1.5, marginBottom: 10, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{skill.description}</div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
        <Tag label={skill.category} color={CAT_COLORS[skill.category]} />
        <Tag label={skill.origin} color="#a3ff12" />
        {skill.tags?.slice(0, 2).map(t => <Tag key={t} label={t} xs />)}
      </div>
    </div>
  );

  return (
    <div>
      <style>{`.card:hover .pin-btn { opacity: 1 !important; }`}</style>
      <div style={{ display: "flex", gap: 6, marginBottom: 16, flexWrap: "wrap" }}>
        {categories.map(c => (
          <button key={c} onClick={() => setFilter(c)} style={{ padding: "4px 12px", borderRadius: 20, fontSize: 11, fontFamily: "inherit", cursor: "pointer", letterSpacing: "0.03em", background: filter === c ? "#a3ff1218" : "transparent", color: filter === c ? "#a3ff12" : "#4a5568", border: filter === c ? "1px solid #a3ff1244" : "1px solid #ffffff0d" }}>
            {c}{c !== "All" && <span style={{ marginLeft: 4, fontSize: 10, opacity: 0.6 }}>{allSkills.filter(s => s.category === c).length}</span>}
          </button>
        ))}
      </div>
      {pinnedSkills.length > 0 && (
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 9, fontWeight: 700, color: "#2d3748", letterSpacing: "0.12em", marginBottom: 8, textTransform: "uppercase", display: "flex", alignItems: "center", gap: 6 }}>
            ★ PINNED <div style={{ flex: 1, height: 1, background: "#ffffff06" }} />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 10 }}>
            {pinnedSkills.map(s => <SkillCard key={s.id} skill={s} />)}
          </div>
        </div>
      )}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 10 }}>
        {rest.map(s => <SkillCard key={s.id} skill={s} />)}
      </div>
    </div>
  );
}

// ─── WORKFLOWS PAGE ──────────────────────────────────────────────────────────

function WorkflowsPage({ workflows, allWorkflows, onSelect }) {
  const [filter, setFilter] = useState("All");
  const [expanded, setExpanded] = useState(null);
  const displayed = workflows.filter(w => filter === "All" || (filter === "Global" ? w.origin === "global" : w.origin === "local"));
  const global = displayed.filter(w => w.origin === "global");
  const local = displayed.filter(w => w.origin === "local");
  const catColors = { AI: "#34d399", Dev: "#38bdf8", Design: "#a78bfa", n8n: "#f97316" };

  const categories = Array.from(new Set(global.map(w => w.category)));

  const WFRow = ({ w }) => {
    const isExp = expanded === w.id;
    return (
      <div>
        <div onClick={() => { setExpanded(isExp ? null : w.id); onSelect(w, "workflow"); }} style={{ display: "grid", gridTemplateColumns: "190px 1fr 80px 100px", alignItems: "center", gap: 12, padding: "9px 12px", borderRadius: 6, cursor: "pointer", background: isExp ? "#0d1219" : "transparent", transition: "background 0.1s" }}
          onMouseEnter={e => !isExp && (e.currentTarget.style.background = "#0a0f14")}
          onMouseLeave={e => !isExp && (e.currentTarget.style.background = "transparent")}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ width: 3, height: 18, borderRadius: 2, background: catColors[w.category] || "#94a3b8", flexShrink: 0 }} />
            <span style={{ fontFamily: "monospace", fontSize: 12, fontWeight: 600, color: "#a3ff12", letterSpacing: "-0.01em" }}>{w.slug}</span>
          </div>
          <span style={{ fontSize: 11, color: "#4a5568", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{w.description}</span>
          <div><Tag label={w.category} color={catColors[w.category] || "#94a3b8"} xs /></div>
          <div style={{ display: "flex", alignItems: "center", gap: 6, justifyContent: "flex-end" }}>
            <span style={{ fontSize: 9, color: "#1e293b" }}>{w.uses}×</span>
            <CopyBtn text={w.slug} label="SLUG" />
          </div>
        </div>
        {isExp && (
          <div style={{ padding: "10px 12px 12px 24px", background: "#0d1219", borderTop: "1px solid #ffffff06", marginTop: -2 }}>
            <p style={{ fontSize: 11, color: "#64748b", lineHeight: 1.6, marginBottom: 8 }}>{w.description}</p>
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <span style={{ fontSize: 10, color: "#2d3748" }}>Last used: <span style={{ color: "#4a5568" }}>{w.lastUsed}</span></span>
              <span style={{ fontSize: 10, color: "#2d3748" }}>Total: <span style={{ color: "#a3ff12" }}>{w.uses} uses</span></span>
            </div>
          </div>
        )}
      </div>
    );
  };

  const Section = ({ label, items, count }) => (
    <div style={{ marginBottom: 20 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
        <span style={{ fontSize: 9, fontWeight: 700, color: "#2d3748", letterSpacing: "0.12em", textTransform: "uppercase" }}>{label}</span>
        <div style={{ flex: 1, height: 1, background: "#ffffff06" }} />
        <span style={{ fontSize: 10, color: "#2d3748" }}>{count}</span>
      </div>
      <div style={{ background: "#0a0f18", border: "1px solid #ffffff0d", borderRadius: 8, overflow: "hidden", padding: "4px" }}>
        {items.map(w => <WFRow key={w.id} w={w} />)}
      </div>
    </div>
  );

  return (
    <div>
      <div style={{ display: "flex", gap: 6, marginBottom: 16 }}>
        {["All", "Global", "Local"].map(f => (
          <button key={f} onClick={() => setFilter(f)} style={{ padding: "4px 12px", borderRadius: 20, fontSize: 11, fontFamily: "inherit", cursor: "pointer", background: filter === f ? "#a3ff1218" : "transparent", color: filter === f ? "#a3ff12" : "#4a5568", border: filter === f ? "1px solid #a3ff1244" : "1px solid #ffffff0d" }}>{f}</button>
        ))}
      </div>
      {(filter === "All" || filter === "Global") && <Section label="GLOBAL" items={global} count={`${global.length} workflows`} />}
      {(filter === "All" || filter === "Local") && local.length > 0 && <Section label="LOCAL" items={local} count={`${local.length} workflows`} />}
    </div>
  );
}

// ─── MCPS PAGE ───────────────────────────────────────────────────────────────

function McpsPage({ mcps, onSelect }) {
  const [statuses, setStatuses] = useState({});
  const toggle = (id, e) => {
    e.stopPropagation();
    setStatuses(p => ({ ...p, [id]: p[id] === "running" ? "stopped" : "running" }));
  };
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 10 }}>
      {mcps.map(mcp => {
        const st = statuses[mcp.id] || mcp.status;
        return (
          <div key={mcp.id} onClick={() => onSelect(mcp, "mcp")} className="card" style={{ background: "#0a0f18", border: "1px solid #ffffff0d", borderRadius: 8, padding: "14px 16px", position: "relative", overflow: "hidden", cursor: "pointer" }}>
            <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: TYPE_COLORS[mcp.type] || "#4a5568", opacity: 0.6 }} />
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 6, marginTop: 4 }}>
              <span style={{ fontSize: 13, fontWeight: 600, color: "#f1f5f9" }}>{mcp.name}</span>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <Dot status={st} />
                <button onClick={e => toggle(mcp.id, e)} style={{ padding: "2px 7px", fontSize: 9, fontFamily: "inherit", cursor: "pointer", borderRadius: 4, border: "1px solid #ffffff12", background: st === "running" ? "#f8717115" : "#4ade8015", color: st === "running" ? "#f87171" : "#4ade80", letterSpacing: "0.06em", transition: "all 0.15s" }}>
                  {st === "running" ? "STOP" : "START"}
                </button>
              </div>
            </div>
            <div style={{ fontSize: 11, color: "#4a5568", marginBottom: 10 }}>{mcp.description}</div>
            <div style={{ display: "flex", gap: 4, flexWrap: "wrap", marginBottom: 8 }}>
              <Tag label={mcp.type} color={TYPE_COLORS[mcp.type]} />
              <Tag label={mcp.origin} color="#a3ff12" />
            </div>
            {mcp.command && (
              <div style={{ background: "#060910", borderRadius: 5, padding: "5px 8px", marginBottom: 8, border: "1px solid #ffffff06", display: "flex", alignItems: "center", gap: 6 }}>
                <span style={{ fontSize: 9, color: "#2d3748", flexShrink: 0 }}>$</span>
                <span style={{ fontSize: 9, color: "#334155", fontFamily: "monospace", flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{mcp.command}</span>
                <CopyBtn text={mcp.command} />
              </div>
            )}
            <div style={{ display: "flex", flexWrap: "wrap", gap: 3 }}>
              {mcp.tools?.slice(0, 4).map(t => <span key={t} style={{ fontSize: 9, color: "#334155", background: "#ffffff05", border: "1px solid #ffffff08", borderRadius: 3, padding: "1px 5px", fontFamily: "monospace" }}>{t}</span>)}
              {mcp.tools?.length > 4 && <span style={{ fontSize: 9, color: "#2d3748" }}>+{mcp.tools.length - 4} more</span>}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── WORKSPACES PAGE ─────────────────────────────────────────────────────────

function WorkspacesPage({ workspaces, onSelect }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      {workspaces.map(ws => (
        <div key={ws.id} onClick={() => onSelect(ws, "workspace")} className="card" style={{ background: "#0a0f18", border: "1px solid #ffffff0d", borderRadius: 8, padding: "16px 18px", position: "relative", cursor: "pointer" }}>
          <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 3, borderRadius: "8px 0 0 8px", background: ws.status === "active" ? "#4ade80" : "#fbbf24", opacity: 0.7 }} />
          <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 16, alignItems: "start" }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 5 }}>
                <span style={{ fontFamily: "'Syne', sans-serif", fontSize: 15, fontWeight: 700, color: "#f1f5f9" }}>{ws.name}</span>
                <Dot status={ws.status} />
                <span style={{ fontSize: 9, color: "#2d3748" }}>{ws.lastActive}</span>
              </div>
              <div style={{ fontSize: 11, color: "#4a5568", marginBottom: 8 }}>{ws.description}</div>
              <div style={{ display: "flex", gap: 4, marginBottom: 8, flexWrap: "wrap" }}>
                {ws.stack?.map(s => <span key={s} style={{ fontSize: 10, color: STACK_COLORS[s] || "#64748b", background: `${STACK_COLORS[s] || "#64748b"}12`, border: `1px solid ${STACK_COLORS[s] || "#64748b"}22`, borderRadius: 4, padding: "1px 7px", fontWeight: 500 }}>{s}</span>)}
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                {ws.workflows?.map(w => <span key={w} style={{ fontSize: 10, color: "#a3ff12", background: "#a3ff1208", border: "1px solid #a3ff1218", borderRadius: 4, padding: "1px 7px", fontFamily: "monospace" }}>{w}</span>)}
              </div>
            </div>
            <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
              {ws.hasAgents && (
                <div style={{ textAlign: "center", padding: "8px 12px", background: "#4ade8010", border: "1px solid #4ade8022", borderRadius: 6 }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: "#4ade80", fontFamily: "'Syne', sans-serif" }}>●</div>
                  <div style={{ fontSize: 9, color: "#4ade8070", marginTop: 3, letterSpacing: "0.06em" }}>AGENTS</div>
                </div>
              )}
              <div style={{ textAlign: "center", padding: "8px 12px", background: "#a3ff1210", border: "1px solid #a3ff1222", borderRadius: 6 }}>
                <div style={{ fontSize: 18, fontWeight: 700, color: "#a3ff12", fontFamily: "'Syne', sans-serif" }}>{ws.workflows?.length || 0}</div>
                <div style={{ fontSize: 9, color: "#a3ff1270", marginTop: 1, letterSpacing: "0.06em" }}>WORKFLOWS</div>
              </div>
              <div style={{ textAlign: "center", padding: "8px 12px", background: "#60a5fa10", border: "1px solid #60a5fa22", borderRadius: 6 }}>
                <div style={{ fontSize: 18, fontWeight: 700, color: "#60a5fa", fontFamily: "'Syne', sans-serif" }}>{ws.skills}</div>
                <div style={{ fontSize: 9, color: "#60a5fa70", marginTop: 1, letterSpacing: "0.06em" }}>SKILLS</div>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── ROOT APP ────────────────────────────────────────────────────────────────

export default function App() {
  const [page, setPage] = useState("skills");
  const [search, setSearch] = useState("");
  const [detail, setDetail] = useState({ item: null, type: null });
  const [showPalette, setShowPalette] = useState(false);
  const [lastScan] = useState("just now");

  useEffect(() => {
    const handler = (e) => { if ((e.metaKey || e.ctrlKey) && e.key === "k") { e.preventDefault(); setShowPalette(p => !p); } if (e.key === "Escape") { setShowPalette(false); setDetail({ item: null, type: null }); } };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  const q = search.toLowerCase();
  const filteredSkills = SKILLS.filter(s => !q || s.name.includes(q) || s.description.toLowerCase().includes(q) || s.tags?.some(t => t.includes(q)));
  const filteredWorkflows = WORKFLOWS.filter(w => !q || w.slug.includes(q) || w.description.toLowerCase().includes(q));
  const filteredMcps = MCPS.filter(m => !q || m.name.includes(q) || m.description.toLowerCase().includes(q));
  const filteredWorkspaces = WORKSPACES.filter(w => !q || w.name.includes(q) || w.description.toLowerCase().includes(q));

  const pages = [
    { id: "skills", label: "Skills", count: SKILLS.length, icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg> },
    { id: "workflows", label: "Workflows", count: WORKFLOWS.length, icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="16 3 21 3 21 8"/><line x1="4" y1="20" x2="21" y2="3"/><polyline points="21 16 21 21 16 21"/><line x1="15" y1="15" x2="21" y2="21"/><line x1="4" y1="4" x2="9" y2="9"/></svg> },
    { id: "mcps", label: "MCPs", count: MCPS.length, icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg> },
    { id: "workspaces", label: "Workspaces", count: WORKSPACES.length, icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z"/></svg> },
  ];

  const pageTitles = { skills: ["Skills", "Reusable capabilities & specialized knowledge"], workflows: ["Workflows", "Step-by-step automation scripts"], mcps: ["MCPs", "Model Context Protocol servers"], workspaces: ["Workspaces", "Active project directories"] };

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh", width: "100%", background: "#080B10", color: "#e2e8f0", fontFamily: "'JetBrains Mono', 'Fira Code', monospace", overflow: "hidden" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@300;400;500;600;700&family=Syne:wght@400;600;700;800&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        ::-webkit-scrollbar { width: 4px; } ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #ffffff10; border-radius: 4px; }
        .card { transition: all 0.2s; }
        .card:hover { transform: translateY(-1px); background: #0f1520 !important; border-color: #ffffff18 !important; }
        input { outline: none; } input::placeholder { color: #2d3748; }
        button { transition: all 0.15s; }
      `}</style>

      {showPalette && <CommandPalette onClose={() => setShowPalette(false)} onNavigate={setPage} />}

      {/* HEADER */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "0 16px", height: 44, background: "#060910", borderBottom: "1px solid #ffffff08", flexShrink: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ width: 7, height: 7, borderRadius: "50%", background: "#a3ff12", boxShadow: "0 0 8px #a3ff12" }} />
          <span style={{ fontSize: 11, fontWeight: 800, color: "#a3ff12", letterSpacing: "0.15em", fontFamily: "'Syne', sans-serif" }}>ANTIGRAVITY</span>
          <span style={{ color: "#ffffff10", fontSize: 16, margin: "0 2px" }}>/</span>
          <span style={{ fontSize: 10, color: "#334155" }}>{pageTitles[page][0].toLowerCase()}</span>
        </div>

        <div style={{ flex: 1, maxWidth: 320, position: "relative" }}>
          <svg style={{ position: "absolute", left: 9, top: "50%", transform: "translateY(-50%)" }} width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#2d3748" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Filter assets..." style={{ width: "100%", height: 30, background: "#0a0f18", border: "1px solid #ffffff08", borderRadius: 6, paddingLeft: 28, paddingRight: 10, color: "#e2e8f0", fontSize: 11, fontFamily: "inherit" }} />
        </div>

        <button onClick={() => setShowPalette(true)} style={{ display: "flex", alignItems: "center", gap: 6, padding: "4px 10px", background: "#0a0f18", border: "1px solid #ffffff0d", borderRadius: 6, color: "#334155", cursor: "pointer", fontSize: 10, fontFamily: "inherit" }}>
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
          Quick search
          <span style={{ background: "#ffffff08", padding: "1px 4px", borderRadius: 3, fontSize: 9 }}>⌘K</span>
        </button>

        <div style={{ flex: 1 }} />
        <span style={{ fontSize: 9, color: "#1e293b", letterSpacing: "0.08em" }}>v9.1.0</span>
        <div style={{ display: "flex", gap: 5 }}>
          {["#fbbf24", "#4ade80", "#f87171"].map((c, i) => <div key={i} style={{ width: 9, height: 9, borderRadius: "50%", background: c, opacity: 0.5, cursor: "pointer" }} />)}
        </div>
      </div>

      {/* BODY */}
      <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
        {/* SIDEBAR */}
        <div style={{ width: 188, background: "#060910", borderRight: "1px solid #ffffff08", display: "flex", flexDirection: "column", padding: "12px 0", flexShrink: 0 }}>
          {pages.map(p => (
            <div key={p.id} onClick={() => { setPage(p.id); setDetail({ item: null, type: null }); }} style={{ display: "flex", alignItems: "center", gap: 9, padding: "8px 14px", margin: "1px 8px", borderRadius: 6, cursor: "pointer", background: page === p.id ? "#a3ff1210" : "transparent", color: page === p.id ? "#a3ff12" : "#4a5568", borderLeft: page === p.id ? "2px solid #a3ff12" : "2px solid transparent", fontSize: 12, fontWeight: page === p.id ? 600 : 400, transition: "all 0.15s" }}
              onMouseEnter={e => page !== p.id && (e.currentTarget.style.background = "#ffffff06")}
              onMouseLeave={e => page !== p.id && (e.currentTarget.style.background = "transparent")}>
              <span style={{ flexShrink: 0 }}>{p.icon}</span>
              <span style={{ flex: 1 }}>{p.label}</span>
              <span style={{ fontSize: 10, color: page === p.id ? "#a3ff1270" : "#1e293b", background: "#ffffff06", padding: "0 4px", borderRadius: 3 }}>{p.count}</span>
            </div>
          ))}
          <div style={{ flex: 1 }} />
          <div style={{ margin: "0 12px 8px", padding: "10px", background: "#0a0f18", borderRadius: 6, border: "1px solid #ffffff07" }}>
            <div style={{ fontSize: 9, color: "#1e293b", letterSpacing: "0.1em", marginBottom: 7, textTransform: "uppercase" }}>Ecosystem</div>
            {[["Skills", SKILLS.length, "#a78bfa"], ["Workflows", WORKFLOWS.length, "#a3ff12"], ["MCPs", MCPS.length, "#60a5fa"], ["Workspaces", WORKSPACES.length, "#f97316"]].map(([l, n, c]) => (
              <div key={l} style={{ display: "flex", justifyContent: "space-between", fontSize: 10, color: "#2d3748", marginBottom: 3 }}>
                <span>{l}</span><span style={{ color: c, fontWeight: 600 }}>{n}</span>
              </div>
            ))}
          </div>
        </div>

        {/* MAIN */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
          <div style={{ padding: "12px 18px 10px", borderBottom: "1px solid #ffffff06", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div>
              <div style={{ fontFamily: "'Syne', sans-serif", fontSize: 18, fontWeight: 700, color: "#f1f5f9", letterSpacing: "-0.02em" }}>{pageTitles[page][0]}</div>
              <div style={{ fontSize: 10, color: "#2d3748", marginTop: 1 }}>{pageTitles[page][1]}</div>
            </div>
            {search && <div style={{ fontSize: 10, color: "#334155" }}>Filtering by "<span style={{ color: "#a3ff12" }}>{search}</span>"</div>}
          </div>
          <div style={{ flex: 1, overflow: "auto", padding: "14px 18px" }}>
            {page === "skills" && <SkillsPage skills={filteredSkills} allSkills={SKILLS} onSelect={(item, type) => setDetail({ item, type })} />}
            {page === "workflows" && <WorkflowsPage workflows={filteredWorkflows} allWorkflows={WORKFLOWS} onSelect={(item, type) => setDetail({ item, type })} />}
            {page === "mcps" && <McpsPage mcps={filteredMcps} onSelect={(item, type) => setDetail({ item, type })} />}
            {page === "workspaces" && <WorkspacesPage workspaces={filteredWorkspaces} onSelect={(item, type) => setDetail({ item, type })} />}
          </div>
        </div>

        {/* DETAIL PANEL */}
        {detail.item && <DetailPanel item={detail.item} type={detail.type} onClose={() => setDetail({ item: null, type: null })} />}
      </div>

      {/* STATUS BAR */}
      <div style={{ height: 24, background: "#060910", borderTop: "1px solid #ffffff06", display: "flex", alignItems: "center", padding: "0 16px", gap: 16, flexShrink: 0 }}>
        <div style={{ display: "flex", align: "center", gap: 5 }}>
          <span style={{ width: 5, height: 5, borderRadius: "50%", background: "#4ade80", boxShadow: "0 0 6px #4ade80", display: "inline-block", marginTop: 1 }} />
          <span style={{ fontSize: 9, color: "#2d3748" }}>watching</span>
        </div>
        <span style={{ fontSize: 9, color: "#1e293b" }}>Last scan: {lastScan}</span>
        <span style={{ fontSize: 9, color: "#1e293b" }}>•</span>
        <span style={{ fontSize: 9, color: "#1e293b" }}>{SKILLS.length + WORKFLOWS.length + MCPS.length + WORKSPACES.length} total assets</span>
        <div style={{ flex: 1 }} />
        <span style={{ fontSize: 9, color: "#1e293b" }}>⌘K quick search</span>
        <span style={{ fontSize: 9, color: "#1e2d3d" }}>•</span>
        <span style={{ fontSize: 9, color: "#1e293b" }}>click any item for details</span>
      </div>
    </div>
  );
}