import React from 'react'

// ─── ERROR BOUNDARY ─────────────────────────────────────────────────────────
// Previne tela preta quando um componente filho crasha.

interface Props { children: React.ReactNode }
interface State { hasError: boolean; error: Error | null }

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('[ErrorBoundary] Crash capturado:', error, info.componentStack)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          padding: 40, textAlign: 'center', color: '#f87171',
          fontFamily: "'Outfit', sans-serif",
        }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>⚠</div>
          <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 8 }}>Algo deu errado</div>
          <div style={{ fontSize: 12, color: '#4a5568', marginBottom: 20, maxWidth: 400, margin: '0 auto 20px' }}>
            {this.state.error?.message || 'Erro desconhecido'}
          </div>
          <button
            onClick={() => this.setState({ hasError: false, error: null })}
            style={{
              padding: '8px 20px', borderRadius: 6, cursor: 'pointer',
              background: '#a3ff1218', color: '#a3ff12', border: '1px solid #a3ff1244',
              fontSize: 12, fontFamily: 'inherit', fontWeight: 600,
            }}
          >
            TENTAR NOVAMENTE
          </button>
        </div>
      )
    }

    return this.props.children
  }
}
