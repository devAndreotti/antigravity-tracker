import React, { useState } from 'react'
import {
  type Skill, type Workflow, type Mcp, type Workspace,
  CATEGORY_COLORS, TYPE_COLORS, STACK_COLORS, WF_CAT_COLORS, BADGE_TOOLTIPS,
  Tag, DotStatus, CopyBtn, generateSparkData,
} from '../data'
import Sparkline from './Sparkline'
import type { PageId } from '../data'

interface Props {
  item: any
  type: string
  onClose: () => void
  onNavigate?: (page: PageId, itemId?: string) => void
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <div style={{ fontSize: 9, fontWeight: 700, color: '#2d3748', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 8 }}>{title}</div>
      {children}
    </div>
  )
}

// ─── SKILL DETAIL ───────────────────────────────────────────────────────────
function SkillDetail({ item }: { item: Skill }) {
  const usePrompt = `Use the skill: ${item.name}. ${item.description.slice(0, 80)}`
  return (
    <>
      <div style={{ marginBottom: 16 }}>
        <div style={{ fontSize: 15, fontWeight: 700, color: '#f1f5f9', marginBottom: 6, fontFamily: "'Syne', sans-serif" }}>{item.name}</div>
        <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
          <Tag label={item.category} color={CATEGORY_COLORS[item.category]} />
          <Tag label={item.origin} color="#a3ff12" tooltip={BADGE_TOOLTIPS[item.origin]} />
        </div>
      </div>
      <Section title="Description">
        <p style={{ fontSize: 11, color: '#64748b', lineHeight: 1.6 }}>{item.description}</p>
      </Section>
      {item.triggers && item.triggers.length > 0 && (
        <Section title="Triggers when">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {item.triggers.map(t => (
              <div key={t} style={{ fontSize: 11, color: '#64748b', background: '#ffffff06', padding: '4px 8px', borderRadius: 4, border: '1px solid #ffffff08' }}>"{t}"</div>
            ))}
          </div>
        </Section>
      )}
      <Section title="Tags">
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>{item.tags?.map(t => <Tag key={t} label={t} small />)}</div>
      </Section>
      <Section title="Actions">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <CopyBtn text={usePrompt} label="COPY AS /USE PROMPT" />
          <button
            onClick={(e) => { e.stopPropagation() }}
            style={{ padding: '4px 8px', fontSize: 9, fontFamily: 'inherit', cursor: 'pointer', borderRadius: 4, border: '1px solid #ffffff12', background: '#ffffff08', color: '#64748b', letterSpacing: '0.06em' }}
          >OPEN IN EXPLORER</button>
        </div>
      </Section>
      <Section title="Path">
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <div style={{ flex: 1, fontSize: 9, color: '#2d3748', fontFamily: 'monospace', wordBreak: 'break-all', lineHeight: 1.5 }}>{item.path}</div>
          <CopyBtn text={item.path} label="PATH" />
        </div>
      </Section>
    </>
  )
}

// ─── WORKFLOW DETAIL ────────────────────────────────────────────────────────
function WorkflowDetail({ item }: { item: Workflow }) {
  return (
    <>
      <div style={{ marginBottom: 16 }}>
        <div style={{ fontSize: 18, fontWeight: 700, color: '#a3ff12', marginBottom: 6, fontFamily: 'monospace' }}>{item.slug}</div>
        <div style={{ display: 'flex', gap: 4 }}>
          <Tag label={item.category} color={WF_CAT_COLORS[item.category] || '#94a3b8'} />
          <Tag label={item.origin} color={item.origin === 'global' ? '#a3ff12' : '#f97316'} tooltip={BADGE_TOOLTIPS[item.origin]} />
        </div>
      </div>
      <Section title="Description">
        <p style={{ fontSize: 11, color: '#64748b', lineHeight: 1.6 }}>{item.description}</p>
      </Section>
      <Section title="Activity (7 days)">
        <Sparkline id={item.id} width={120} height={24} />
      </Section>
      <Section title="Usage">
        <div style={{ display: 'flex', gap: 12 }}>
          <div style={{ flex: 1, background: '#ffffff06', borderRadius: 6, padding: 10, textAlign: 'center' }}>
            <div style={{ fontSize: 20, fontWeight: 700, color: '#a3ff12', fontFamily: "'Syne', sans-serif" }}>{item.uses}</div>
            <div style={{ fontSize: 9, color: '#2d3748', marginTop: 2 }}>TOTAL USES</div>
          </div>
          <div style={{ flex: 1, background: '#ffffff06', borderRadius: 6, padding: 10, textAlign: 'center' }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: '#60a5fa' }}>{item.lastUsed || '—'}</div>
            <div style={{ fontSize: 9, color: '#2d3748', marginTop: 2 }}>LAST USED</div>
          </div>
        </div>
      </Section>
      <Section title="Invoke">
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <div style={{ flex: 1, background: '#060910', border: '1px solid #ffffff08', borderRadius: 5, padding: '6px 10px', fontSize: 13, color: '#a3ff12', fontFamily: 'monospace' }}>{item.slug}</div>
          <CopyBtn text={item.slug} label="COPY TRIGGER" />
        </div>
      </Section>
    </>
  )
}

// ─── MCP DETAIL ─────────────────────────────────────────────────────────────
function McpDetail({ item }: { item: Mcp }) {
  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState(item.status)

  // Extrai env vars do comando
  const envVars = item.command ? (item.command.match(/\$[A-Z_]+/g) || []) : []

  const toggleStatus = (e: React.MouseEvent) => {
    e.stopPropagation()
    setLoading(true)
    setTimeout(() => {
      setStatus(s => s === 'running' ? 'stopped' : 'running')
      setLoading(false)
    }, 1200)
  }

  return (
    <>
      <div style={{ marginBottom: 16 }}>
        <div style={{ fontSize: 15, fontWeight: 700, color: '#f1f5f9', marginBottom: 6, fontFamily: "'Syne', sans-serif" }}>{item.name}</div>
        <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
          <Tag label={item.type} color={TYPE_COLORS[item.type]} tooltip={BADGE_TOOLTIPS[item.type]} />
          <DotStatus status={status} />
          <button onClick={toggleStatus} style={{
            padding: '2px 7px', fontSize: 9, fontFamily: 'inherit', cursor: 'pointer', borderRadius: 4,
            border: '1px solid #ffffff12', letterSpacing: '0.06em', transition: 'all 0.15s', marginLeft: 4,
            background: loading ? '#ffffff08' : status === 'running' ? '#f8717115' : '#4ade8015',
            color: loading ? '#64748b' : status === 'running' ? '#f87171' : '#4ade80',
          }}>
            {loading ? '...' : status === 'running' ? 'STOP' : 'START'}
          </button>
        </div>
      </div>
      <Section title="Description">
        <p style={{ fontSize: 11, color: '#64748b', lineHeight: 1.6 }}>{item.description}</p>
      </Section>
      <Section title={`Tools (${item.tools?.length || 0})`}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          {item.tools?.map(t => (
            <div key={t} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '4px 8px', background: '#ffffff05', borderRadius: 4, border: '1px solid #ffffff08' }}>
              <span style={{ fontSize: 10, color: '#64748b', fontFamily: 'monospace' }}>{t}</span>
              <CopyBtn text={t} label="COPY" />
            </div>
          ))}
        </div>
      </Section>
      {envVars.length > 0 && (
        <Section title="Environment Variables">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            {envVars.map(v => (
              <div key={v} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '4px 8px', background: '#facc1508', borderRadius: 4, border: '1px solid #facc1518' }}>
                <span style={{ fontSize: 10, color: '#facc15', fontFamily: 'monospace' }}>{v}</span>
                <CopyBtn text={v} label="COPY" />
              </div>
            ))}
          </div>
        </Section>
      )}
      {item.command && (
        <Section title="Command">
          <div style={{ background: '#060910', borderRadius: 5, padding: '8px 10px', border: '1px solid #ffffff06', marginBottom: 6 }}>
            <span style={{ fontSize: 9, color: '#2d3748' }}>$ </span>
            <span style={{ fontSize: 10, color: '#64748b', fontFamily: 'monospace', wordBreak: 'break-all' }}>{item.command}</span>
          </div>
          <CopyBtn text={item.command} label="COPY COMMAND" />
        </Section>
      )}
    </>
  )
}

// ─── WORKSPACE DETAIL ───────────────────────────────────────────────────────
function WorkspaceDetail({ item, onNavigate }: { item: Workspace; onNavigate?: (page: PageId, itemId?: string) => void }) {
  return (
    <>
      <div style={{ marginBottom: 16 }}>
        <div style={{ fontSize: 15, fontWeight: 700, color: '#f1f5f9', marginBottom: 4, fontFamily: "'Syne', sans-serif" }}>{item.name}</div>
        <DotStatus status={item.status} />
      </div>
      <Section title="Description">
        <p style={{ fontSize: 11, color: '#64748b', lineHeight: 1.6 }}>{item.description}</p>
      </Section>
      <Section title="Stack">
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
          {item.stack?.map(s => (
            <span key={s} style={{ fontSize: 10, color: STACK_COLORS[s] || '#64748b', background: `${STACK_COLORS[s] || '#64748b'}12`, border: `1px solid ${STACK_COLORS[s] || '#64748b'}22`, borderRadius: 4, padding: '2px 8px', fontWeight: 500 }}>{s}</span>
          ))}
        </div>
      </Section>
      <Section title={`Linked Workflows (${item.workflows?.length || 0})`}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          {item.workflows?.map(w => (
            <div key={w} onClick={(e) => { e.stopPropagation(); onNavigate?.('workflows', w) }}
              style={{ padding: '5px 8px', background: '#ffffff05', borderRadius: 4, border: '1px solid #ffffff08', fontSize: 11, color: '#a3ff12', fontFamily: 'monospace', cursor: 'pointer', transition: 'background 0.15s' }}
              onMouseEnter={e => (e.currentTarget.style.background = '#a3ff1210')}
              onMouseLeave={e => (e.currentTarget.style.background = '#ffffff05')}
            >{w}</div>
          ))}
        </div>
      </Section>
      <Section title="Path">
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <div style={{ flex: 1, fontSize: 9, color: '#2d3748', fontFamily: 'monospace', wordBreak: 'break-all' }}>{item.path}</div>
          <CopyBtn text={item.path} label="COPY" />
        </div>
      </Section>
    </>
  )
}

// ─── PAINEL PRINCIPAL ───────────────────────────────────────────────────────
export default function DetailPanel({ item, type, onClose, onNavigate }: Props) {
  if (!item) return null
  return (
    <div style={{
      width: 300, background: '#060910', borderLeft: '1px solid #ffffff0a',
      display: 'flex', flexDirection: 'column', flexShrink: 0, overflow: 'hidden',
    }}>
      <div style={{
        padding: '14px 16px', borderBottom: '1px solid #ffffff06',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <span style={{ fontSize: 11, fontWeight: 600, color: '#4a5568', letterSpacing: '0.08em', textTransform: 'uppercase' }}>{type} detail</span>
        <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#4a5568', cursor: 'pointer', fontSize: 16, lineHeight: 1 }}>×</button>
      </div>
      <div style={{ flex: 1, overflow: 'auto', padding: 16 }}>
        {type === 'skill' && <SkillDetail item={item} />}
        {type === 'workflow' && <WorkflowDetail item={item} />}
        {type === 'mcp' && <McpDetail item={item} />}
        {type === 'workspace' && <WorkspaceDetail item={item} onNavigate={onNavigate} />}
      </div>
    </div>
  )
}
