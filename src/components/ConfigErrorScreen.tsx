import { Settings } from 'lucide-react'

export function ConfigErrorScreen({ message }: { message: string }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-cream px-4 text-center">
      <Settings className="h-10 w-10 text-orange-500" />
      <h1 className="text-lg font-bold text-slate-800">CampusPrint isn't configured yet</h1>
      <p className="max-w-md text-sm text-slate-500">{message}</p>
      <div className="max-w-md rounded-2xl bg-orange-50 p-4 text-left text-xs text-slate-500">
        <p className="mb-1 font-semibold text-slate-700">Checklist:</p>
        <ul className="list-disc space-y-1 pl-4">
          <li>
            A file literally named <code className="rounded bg-white px-1">.env</code> exists at the project root
            (same folder as <code className="rounded bg-white px-1">package.json</code>).
          </li>
          <li>
            It defines <code className="rounded bg-white px-1">VITE_SUPABASE_URL</code> and{' '}
            <code className="rounded bg-white px-1">VITE_SUPABASE_ANON_KEY</code> with no quotes around the values.
          </li>
          <li>
            You restarted <code className="rounded bg-white px-1">npm run dev</code> after creating/editing{' '}
            <code className="rounded bg-white px-1">.env</code> — Vite only reads it at startup.
          </li>
        </ul>
      </div>
    </div>
  )
}
