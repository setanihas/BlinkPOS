import { Component, type ErrorInfo, type ReactNode } from 'react'

interface State { hasError: boolean; error?: Error }

export class ErrorBoundary extends Component<{ children: ReactNode; fallback?: ReactNode }, State> {
  state: State = { hasError: false }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    console.error('[ErrorBoundary]', error, info)
  }

  render(): ReactNode {
    if (this.state.hasError) {
      return this.props.fallback ?? (
        <div className="flex flex-col items-center justify-center gap-3 p-12 text-center">
          <p className="text-sm font-semibold text-t0">Beklenmeyen bir hata oluştu</p>
          <p className="text-xs text-t2 max-w-xs">{this.state.error?.message}</p>
          <button onClick={() => this.setState({ hasError: false })}
            className="px-3 h-8 rounded-md border text-sm text-t1 hover:text-t0 hover:bg-s2 transition-colors"
            style={{ borderColor: 'var(--b1)' }}>
            Tekrar dene
          </button>
        </div>
      )
    }
    return this.props.children
  }
}
