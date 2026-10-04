import { Component, type ReactNode } from 'react'
import { TriangleAlert } from 'lucide-react'

interface Props {
  children: ReactNode
}

interface State {
  error: Error | null
}

/**
 * Before this existed, ANY uncaught error thrown during render (a bad
 * Supabase response, a null-reference bug, a missing env var trip further
 * down the tree, etc.) unmounted the whole React tree with nothing shown —
 * the "broken API/network error screen" the app was producing. This catches
 * render-time errors and shows the real message plus a reload button instead
 * of a blank page.
 *
 * NOTE: React error boundaries do NOT catch errors thrown inside async
 * functions (e.g. an unhandled promise rejection from a `.then()` or an
 * `await` inside `useEffect` that isn't wrapped in try/catch). Those still
 * only show up in the browser console. See the try/catch added around data
 * loading in DashboardPage.tsx and PrintShopPage.tsx for that half of the fix.
 */
export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null }

  static getDerivedStateFromError(error: Error): State {
    return { error }
  }

  componentDidCatch(error: Error, info: { componentStack: string }) {
    console.error('CampusPrint crashed:', error, info.componentStack)
  }

  render() {
    const { error } = this.state
    if (!error) return this.props.children

    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-cream px-4 text-center">
        <TriangleAlert className="h-10 w-10 text-red-500" />
        <h1 className="text-lg font-bold text-slate-800">Something went wrong</h1>
        <pre className="max-w-lg overflow-auto rounded-2xl bg-red-50 p-4 text-left text-xs text-red-700">
          {error.message}
        </pre>
        <button
          onClick={() => window.location.reload()}
          className="rounded-2xl bg-orange-500 px-4 py-2 text-sm font-semibold text-white hover:bg-orange-600"
        >
          Reload
        </button>
      </div>
    )
  }
}
