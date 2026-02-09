/**
 * MSAL Configuration for Azure Entra ID
 *
 * Configure Azure AD authentication for the application.
 * Update the clientId and authority with your Azure AD App Registration values.
 */

import { Configuration, LogLevel } from '@azure/msal-browser'

// Azure AD App Registration configuration
// TODO: Update these values with your Azure AD App Registration
const AZURE_AD_CLIENT_ID = import.meta.env.VITE_AZURE_AD_CLIENT_ID || 'YOUR_CLIENT_ID'
const AZURE_AD_TENANT_ID = import.meta.env.VITE_AZURE_AD_TENANT_ID || 'YOUR_TENANT_ID'
const AZURE_AD_REDIRECT_URI = import.meta.env.VITE_AZURE_AD_REDIRECT_URI || 'http://localhost:3000'

/**
 * MSAL Configuration
 */
export const msalConfig: Configuration = {
  auth: {
    clientId: AZURE_AD_CLIENT_ID,
    authority: `https://login.microsoftonline.com/${AZURE_AD_TENANT_ID}`,
    redirectUri: AZURE_AD_REDIRECT_URI,
    postLogoutRedirectUri: AZURE_AD_REDIRECT_URI,
    navigateToLoginRequestUrl: true,
  },
  cache: {
    cacheLocation: 'localStorage',
    storeAuthStateInCookie: false,
  },
  system: {
    loggerOptions: {
      loggerCallback: (level, message, containsPii) => {
        if (containsPii) return
        switch (level) {
          case LogLevel.Error:
            console.error(message)
            break
          case LogLevel.Warning:
            console.warn(message)
            break
          case LogLevel.Info:
            console.info(message)
            break
          case LogLevel.Verbose:
            console.debug(message)
            break
        }
      },
      logLevel: LogLevel.Warning,
    },
  },
}

/**
 * Scopes for authentication
 */
export const loginRequest = {
  scopes: ['User.Read', 'openid', 'profile', 'email'],
}

/**
 * Scopes for API calls
 */
export const apiRequest = {
  scopes: [`api://${AZURE_AD_CLIENT_ID}/access_as_user`],
}

/**
 * Graph API endpoint
 */
export const graphConfig = {
  graphMeEndpoint: 'https://graph.microsoft.com/v1.0/me',
}
