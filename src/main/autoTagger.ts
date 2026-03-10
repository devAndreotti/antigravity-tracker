/**
 * Módulo puro de auto-tagging.
 *
 * Gera um array de tags relevantes a partir de atributos textuais (nome, descrição, path)
 * usando um motor de regras baseado em palavras-chave.
 * A extração ocorre estaticamente e não depende de LLMs ou chaves de API.
 */

const KEYWORD_RULES: Record<string, string[]> = {
  // Frontends e Frameworks
  'react|nextjs|next.js': ['react', 'frontend'],
  'vue|vuejs': ['vue', 'frontend'],
  'svelte|sveltekit': ['svelte', 'frontend'],
  'angular': ['angular', 'frontend'],
  'tailwind|tailwindcss|css|styling|sass|less|styled-components': ['styling', 'css', 'frontend'],

  // Backends e Runtimes
  'node|nodejs|express|nestjs|fastify': ['node', 'backend'],
  'python|django|flask|fastapi|uv|uvx': ['python', 'backend'],
  'go|golang': ['go', 'backend'],
  'rust': ['rust', 'backend'],
  'java|spring': ['java', 'backend'],
  'php|laravel': ['php', 'backend'],

  // Devops, Infra e Deploy
  'docker|container': ['docker', 'devops'],
  'kubernetes|k8s': ['kubernetes', 'devops'],
  'aws|amazon web services': ['aws', 'cloud'],
  'gcp|google cloud': ['gcp', 'cloud'],
  'azure': ['azure', 'cloud'],
  'vercel|netlify|railway|render': ['deploy', 'devops'],
  'ci|cd|pipeline|github actions|gitlab ci': ['ci-cd', 'devops'],
  'terraform|ansible': ['iac', 'devops'],

  // Bancos de Dados
  'sql|postgres|postgresql': ['sql', 'database'],
  'mysql|mariadb': ['mysql', 'database'],
  'mongo|mongodb|nosql': ['mongodb', 'database'],
  'sqlite': ['sqlite', 'database'],
  'redis': ['redis', 'database'],
  'prisma|drizzle|orm': ['orm', 'database'],

  // AI & Machine Learning
  'llm|large language model|chatgpt|gpt|openai|claude|anthropic|gemini': ['llm'],
  'mcp|model context protocol': ['mcp', 'ai'],
  'rag|retrieval augmented generation|vector db|pinecone|qdrant': ['rag'],
  'pytorch|tensorflow|keras|pandas|numpy': ['data-science', 'python'],

  // Automação e Ferramentas
  'n8n': ['n8n', 'automation'],
  'webhook|zapier|make': ['automation'],
  'scraper|scraping|puppeteer|playwright|selenium|cypress': ['scraping', 'testing'],
  'test|jest|vitest|pytest|testing|tdd': ['testing'],
  'git|github|gitlab|bitbucket': ['git', 'version-control'],
  'api|rest|graphql|trpc|grpc|endpoint': ['api'],
  'auth|jwt|oauth|authentication|login|security': ['security', 'auth'],

  // Criatividade e Documentos
  'canvas|p5|p5.js|processing|algorithmic art|generative art': ['creative', 'canvas'],
  'pdf|docx|spreadsheet|excel|csv|word|document|pptx|powerpoint|slides|presentation': ['office', 'documents'],
}

interface AutoTagInput {
  name?: string
  description?: string
  content?: string
  path?: string // Caminho do arquivo para inferências estruturais
  command?: string // Especificamente para detecção de MCPs command line
}

export function autoTag(input: AutoTagInput): string[] {
  const tags = new Set<string>()

  // 1. Coleta e normaliza todo o texto disponível em minúsculo para a extração
  const textPool = [
    input.name,
    input.description,
    input.content ? input.content.slice(0, 1000) : '', // Analisa apenas o início para performance
    input.path,
    input.command
  ].filter(Boolean).join(' ').toLowerCase()

  // 2. Extração baseada em regras de fallback léxico (Regex)
  Object.entries(KEYWORD_RULES).forEach(([regexPattern, derivedTags]) => {
    // Usamos \b para garantir que casamos palavras inteiras na maior parte do tempo,
    // mas substituímos | para construir um grupo.
    // Ex: 'react|nextjs' -> /\b(react|nextjs)\b/i
    const parts = regexPattern.split('|')
    const regex = new RegExp(`\\b(${parts.join('|')})\\b`, 'i')

    if (regex.test(textPool)) {
      derivedTags.forEach(t => tags.add(t))
    }
  })

  // 3. Heurísticas em cima do Nome, Caminho e Command
  if (input.name) {
    // Nomes com traços ou underscores ex: "n8n-workflow-expert"
    const nameParts = input.name.toLowerCase().split(/[-_]/)
    nameParts.forEach(part => {
      if (part.length > 2 && !['and', 'the', 'for', 'with'].includes(part)) {
        // Nós poderíamos adicionar partes curtas se elas casarem exatamente
        Object.entries(KEYWORD_RULES).forEach(([regexPattern, derivedTags]) => {
          const parts = regexPattern.split('|')
          if (parts.includes(part)) {
            derivedTags.forEach(t => tags.add(t))
          }
        })
      }
    })
  }

  // 4. Detecção via Path (por exemplo, se estiver em uma pasta workflows)
  if (input.path) {
    const p = input.path.toLowerCase()
    if (p.includes('/workflows/') || p.includes('\\workflows\\')) tags.add('workflow')
    if (p.includes('/skills/') || p.includes('\\skills\\')) tags.add('skill')
  }

  // 5. O comando provê contexto profundo para MCPs
  if (input.command) {
    const c = input.command.toLowerCase()
    if (c.includes('npx') || c.includes('node') || c.includes('bun')) tags.add('node')
    if (c.includes('uvx') || c.includes('uv') || c.includes('python')) tags.add('python')
    if (c.includes('docker')) tags.add('docker')
    if (c.includes('github')) tags.add('github')
  }

  return Array.from(tags).slice(0, 5) // Retorna no máximo 5 tags super relevantes
}
