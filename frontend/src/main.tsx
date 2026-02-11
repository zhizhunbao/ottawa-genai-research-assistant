/**
 * Application Entry Point
 *
 * Wraps the app with MSAL authentication provider.
 * 遵循 dev-frontend_patterns skill 规范。
 */

import * as React from 'react'
import * as ReactDOM from 'react-dom/client'
import { MsalAuthProvider } from '@/features/auth/components/MsalAuthProvider'
import { AuthDialogProvider } from '@/features/auth/components/AuthDialogProvider'
import { Toaster, TooltipProvider } from '@/shared/components/ui'
import { BrowserRouter } from 'react-router-dom'
import App from './app/App'
import './index.css'
import './i18n' // Initialize i18n

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <MsalAuthProvider>
        <TooltipProvider>
          <App />
          <AuthDialogProvider />
          <Toaster richColors position="top-right" />
        </TooltipProvider>
      </MsalAuthProvider>
    </BrowserRouter>
  </React.StrictMode>,
)
