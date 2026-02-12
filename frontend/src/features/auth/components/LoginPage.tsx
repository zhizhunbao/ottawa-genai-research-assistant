/**
 * LoginPage Component
 *
 * Full-page UI for user sign-in, supporting standard auth and Microsoft SSO.
 *
 * @template — Custom Implementation
 */

import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { FormEvent } from 'react'
import { Building2, AlertTriangle, ArrowLeft, Loader2 } from 'lucide-react'

interface LoginPageProps {
  isLoading: boolean
  error: string | null
  formErrors: {
    email?: string
    password?: string
  }
  onSubmit: (email: string, password: string) => void
  onAzureAdLogin: () => void
  onInputChange: (field: 'email' | 'password', value: string) => void
}

export function LoginPage({
  isLoading,
  error,
  formErrors,
  onSubmit,
  onAzureAdLogin,
  onInputChange,
}: LoginPageProps) {
  const { t } = useTranslation('auth')
  const { t: tCommon } = useTranslation('common')

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const email = formData.get('email') as string
    const password = formData.get('password') as string
    onSubmit(email, password)
  }

  return (
    <div className="min-h-screen flex">
      {/* Left - Brand Section */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary-500 to-secondary-500 relative overflow-hidden">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center text-white p-12">
            <div className="w-24 h-24 mx-auto mb-6 rounded-2xl bg-white/20 flex items-center justify-center">
              <Building2 className="w-12 h-12 text-white" />
            </div>
            <h1 className="text-4xl font-extrabold mb-4">
              Ottawa <span className="opacity-90">GenAI</span>
            </h1>
            <p className="text-xl opacity-90 mb-2">{tCommon('app.shortName')}</p>
            <p className="text-lg opacity-75 max-w-md">
              AI-powered research assistant for Economic Development insights.
            </p>
          </div>
        </div>
        {/* Decorative circles */}
        <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-white/10" />
        <div className="absolute -bottom-12 -left-12 w-72 h-72 rounded-full bg-white/10" />
      </div>

      {/* Right - Login Form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-gray-50">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-2xl shadow-soft p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              {t('login.title')}
            </h2>
            <p className="text-gray-600 mb-8">
              {t('login.subtitle')}
            </p>

            {/* Error Alert */}
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                <span className="text-red-700 text-sm">{error}</span>
              </div>
            )}

            {/* Login Form */}
            <form className="space-y-6" onSubmit={handleSubmit}>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  {t('login.email')}
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  placeholder={t('login.emailPlaceholder')}
                  onChange={(e) => onInputChange('email', e.target.value)}
                  disabled={isLoading}
                  autoComplete="email"
                  className={`w-full px-4 py-3 rounded-lg border ${formErrors.email ? 'border-red-300' : 'border-gray-200'
                    } focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent`}
                />
                {formErrors.email && (
                  <p className="mt-2 text-sm text-red-600">{formErrors.email}</p>
                )}
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                  {t('login.password')}
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  placeholder={t('login.passwordPlaceholder')}
                  onChange={(e) => onInputChange('password', e.target.value)}
                  disabled={isLoading}
                  autoComplete="current-password"
                  className={`w-full px-4 py-3 rounded-lg border ${formErrors.password ? 'border-red-300' : 'border-gray-200'
                    } focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent`}
                />
                {formErrors.password && (
                  <p className="mt-2 text-sm text-red-600">{formErrors.password}</p>
                )}
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full px-6 py-3 bg-gradient-to-r from-primary-500 to-secondary-500 text-white font-medium rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center"
              >
                {isLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  t('login.submit')
                )}
              </button>
            </form>

            {/* Divider */}
            <div className="relative my-8">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white text-gray-500">or</span>
              </div>
            </div>

            {/* Azure AD Login */}
            <button
              type="button"
              onClick={onAzureAdLogin}
              disabled={isLoading}
              className="w-full px-6 py-3 bg-white border border-gray-200 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" viewBox="0 0 21 21" fill="none">
                <path d="M10 0H0V10H10V0Z" fill="#F25022" />
                <path d="M21 0H11V10H21V0Z" fill="#7FBA00" />
                <path d="M10 11H0V21H10V11Z" fill="#00A4EF" />
                <path d="M21 11H11V21H21V11Z" fill="#FFB900" />
              </svg>
              {t('login.azureAd')}
            </button>

            {/* Register Link */}
            <div className="mt-8 text-center text-sm">
              <span className="text-gray-600">Don't have an account? </span>
              <Link to="/register" className="text-primary-500 hover:text-primary-600 font-medium">
                Sign up
              </Link>
            </div>

            {/* Back to Home */}
            <div className="mt-4 text-center">
              <Link to="/" className="text-sm text-gray-500 hover:text-gray-700 inline-flex items-center gap-1">
                <ArrowLeft className="w-4 h-4" />
                {t('login.backToHome')}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
