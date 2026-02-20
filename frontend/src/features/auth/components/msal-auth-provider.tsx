/**
 * MsalAuthProvider - Azure AD authentication provider with state sync and token management
 *
 * @module features/auth
 * @template none
 * @reference none
 */

/* eslint-disable react-refresh/only-export-components */
import { ReactNode, useEffect } from 'react'
import {
  MsalProvider,
  AuthenticatedTemplate,
  UnauthenticatedTemplate,
  useMsal,
  useIsAuthenticated,
} from '@azure/msal-react'
import {
  PublicClientApplication,
  EventType,
  EventMessage,
  AuthenticationResult,
  InteractionStatus,
} from '@azure/msal-browser'
import { msalConfig, loginRequest } from '../config/msal-config'
import { useAuthStore } from '@/stores/auth-store'

// Create MSAL instance
export const msalInstance = new PublicClientApplication(msalConfig)

// Initialize MSAL
msalInstance.initialize().then(() => {
  // Handle redirect promise
  msalInstance.handleRedirectPromise().then((response) => {
    if (response) {
      msalInstance.setActiveAccount(response.account)
    }
  })

  // Set active account on login success
  msalInstance.addEventCallback((event: EventMessage) => {
    if (event.eventType === EventType.LOGIN_SUCCESS && event.payload) {
      const payload = event.payload as AuthenticationResult
      msalInstance.setActiveAccount(payload.account)
    }
  })
})

interface MsalAuthProviderProps {
  children: ReactNode
}

/**
 * Authentication state sync component
 *
 * Syncs MSAL (Azure AD) auth state → Zustand auth store.
 * Only updates the store when MSAL accounts are present.
 * Does NOT clear local JWT auth when MSAL has no accounts.
 */
function AuthStateSync({ children }: { children: ReactNode }) {
  const { accounts, inProgress } = useMsal()
  const isAuthenticated = useIsAuthenticated()
  const { login, setLoading } = useAuthStore()

  useEffect(() => {
    if (inProgress === InteractionStatus.None) {
      setLoading(false)

      // Only sync MSAL → store when Azure AD accounts exist.
      // Do NOT logout — the user may be authenticated via local JWT.
      if (isAuthenticated && accounts.length > 0) {
        const account = accounts[0]
        const now = new Date().toISOString()
        login(
          {
            id: account.localAccountId,
            email: account.username,
            displayName: account.name || account.username,
            role: 'researcher', // Default role for Azure AD users
            createdAt: now,
            lastLoginAt: now,
          },
          '' // Token will be acquired when needed
        )
      }
    } else {
      setLoading(true)
    }
  }, [accounts, inProgress, isAuthenticated, login, setLoading])

  return <>{children}</>
}

/**
 * MSAL Auth Provider Component
 */
export function MsalAuthProvider({ children }: MsalAuthProviderProps) {
  return (
    <MsalProvider instance={msalInstance}>
      <AuthStateSync>{children}</AuthStateSync>
    </MsalProvider>
  )
}

/**
 * Hook to handle Azure AD login
 */
export function useAzureLogin() {
  const { instance } = useMsal()

  const login = async () => {
    try {
      await instance.loginPopup(loginRequest)
    } catch (error) {
      console.error('Login failed:', error)
      throw error
    }
  }

  const loginRedirect = async () => {
    try {
      await instance.loginRedirect(loginRequest)
    } catch (error) {
      console.error('Login redirect failed:', error)
      throw error
    }
  }

  return { login, loginRedirect }
}

/**
 * Hook to handle Azure AD logout
 */
export function useAzureLogout() {
  const { instance } = useMsal()

  const logout = async () => {
    try {
      await instance.logoutPopup()
    } catch (error) {
      console.error('Logout failed:', error)
      throw error
    }
  }

  const logoutRedirect = async () => {
    try {
      await instance.logoutRedirect()
    } catch (error) {
      console.error('Logout redirect failed:', error)
      throw error
    }
  }

  return { logout, logoutRedirect }
}

/**
 * Hook to acquire access token for API calls
 */
export function useAccessToken() {
  const { instance, accounts } = useMsal()

  const getAccessToken = async (scopes: string[] = loginRequest.scopes): Promise<string | null> => {
    if (accounts.length === 0) {
      return null
    }

    try {
      const response = await instance.acquireTokenSilent({
        scopes,
        account: accounts[0],
      })
      return response.accessToken
    } catch (error) {
      // If silent token acquisition fails, try popup
      try {
        const response = await instance.acquireTokenPopup({ scopes })
        return response.accessToken
      } catch (popupError) {
        console.error('Token acquisition failed:', popupError)
        return null
      }
    }
  }

  return { getAccessToken }
}

// Re-export MSAL templates for convenience
export { AuthenticatedTemplate, UnauthenticatedTemplate }
