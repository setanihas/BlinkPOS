import { RouterProvider } from 'react-router-dom'
import { QueryClientProvider } from '@tanstack/react-query'
import { ThemeProvider } from './app/ThemeProvider'
import { queryClient } from './app/queryClient'
import { router } from './app/router'
import { ErrorBoundary } from './components/common/ErrorBoundary'
import { Toaster } from './components/ui/Toaster'
import { SettingsBootstrap } from './app/SettingsBootstrap'

export function App(): JSX.Element {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <QueryClientProvider client={queryClient}>
          <SettingsBootstrap />
          <RouterProvider router={router} />
          <Toaster />
        </QueryClientProvider>
      </ThemeProvider>
    </ErrorBoundary>
  )
}
