import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.tsx'
import { ErrorBoundary } from './components/ErrorBoundary.tsx'
import { ConfigErrorScreen } from './components/ConfigErrorScreen.tsx'
import { supabaseConfigError } from './lib/supabase.ts'
import './index.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      {supabaseConfigError ? (
        <ConfigErrorScreen message={supabaseConfigError} />
      ) : (
        <BrowserRouter>
          <App />
        </BrowserRouter>
      )}
    </ErrorBoundary>
  </StrictMode>,
)
