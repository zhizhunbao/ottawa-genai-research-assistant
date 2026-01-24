/**
 * 注册页面组件
 *
 * 提供用户注册表单 UI。
 * 遵循 dev-frontend_patterns skill 规范。
 */

import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { FormEvent } from 'react'
import { Building2, AlertTriangle, ArrowLeft, Loader2 } from 'lucide-react'

interface RegisterPageProps {
  isLoading: boolean
  error: string | null
  formErrors: {
    displayName?: string
    email?: string
    password?: string
    confirmPassword?: string
  }
  onSubmit: (displayName: string, email: string, password: string, confirmPassword?: string) => void
  onAzureAdRegister: () => void
  onInputChange: (field: 'displayName' | 'email' | 'password' | 'confirmPassword', value: string) => void
}

export function RegisterPage({
  isLoading,
  error,
  formErrors,
  onSubmit,
  onAzureAdRegister,
  onInputChange,
}: RegisterPageProps) {
  const { t } = useTranslation('auth')
  const { t: tCommon } = useTranslation('common')

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const displayName = formData.get('displayName') as string
    const email = formData.get('email') as string
    const password = formData.get('password') as string
    const confirmPassword = formData.get('confirmPassword') as string
    onSubmit(displayName, email, password, confirmPassword)
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
              Join us to access AI-powered economic insights.
            </p>
          </div>
        </div>
        {/* Decorative circles */}
        <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-white/10" />
        <div className="absolute -bottom-12 -left-12 w-72 h-72 rounded-full bg-white/10" />
      </div>

      {/* Right - Register Form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-gray-50">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-2xl shadow-soft p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              {t('register.title', 'Create an Account')}
            </h2>
            <p className="text-gray-600 mb-8">
              {t('register.subtitle', 'Sign up to get started with Ottawa GenAI Research Assistant.')}
            </p>

            {/* Error Alert */}
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                <span className="text-red-700 text-sm">{error}</span>
              </div>
            )}

            {/* Register Form */}
            <form className="space-y-4" onSubmit={handleSubmit}>
              <div>
                <label htmlFor="displayName" className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name
                </label>
                <input
                  id="displayName"
                  name="displayName"
                  type="text"
                  placeholder="John Doe"
                  onChange={(e) => onInputChange('displayName', e.target.value)}
                  disabled={isLoading}
                  className={`w-full px-4 py-3 rounded-lg border ${
                    formErrors.displayName ? 'border-red-300' : 'border-gray-200'
                  } focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent`}
                />
                {formErrors.displayName && (
                  <p className="mt-2 text-sm text-red-600">{formErrors.displayName}</p>
                )}
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="john@example.com"
                  onChange={(e) => onInputChange('email', e.target.value)}
                  disabled={isLoading}
                  autoComplete="email"
                  className={`w-full px-4 py-3 rounded-lg border ${
                    formErrors.email ? 'border-red-300' : 'border-gray-200'
                  } focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent`}
                />
                {formErrors.email && (
                  <p className="mt-2 text-sm text-red-600">{formErrors.email}</p>
                )}
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                  Password
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="******"
                  onChange={(e) => onInputChange('password', e.target.value)}
                  disabled={isLoading}
                  autoComplete="new-password"
                  className={`w-full px-4 py-3 rounded-lg border ${
                    formErrors.password ? 'border-red-300' : 'border-gray-200'
                  } focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent`}
                />
                {formErrors.password && (
                  <p className="mt-2 text-sm text-red-600">{formErrors.password}</p>
                )}
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                  Confirm Password
                </label>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  placeholder="******"
                  onChange={(e) => onInputChange('confirmPassword', e.target.value)}
                  disabled={isLoading}
                  autoComplete="new-password"
                  className={`w-full px-4 py-3 rounded-lg border ${
                    formErrors.confirmPassword ? 'border-red-300' : 'border-gray-200'
                  } focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent`}
                />
                {formErrors.confirmPassword && (
                  <p className="mt-2 text-sm text-red-600">{formErrors.confirmPassword}</p>
                )}
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full px-6 py-3 bg-gradient-to-r from-primary-500 to-secondary-500 text-white font-medium rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center mt-6"
              >
                {isLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  'Create Account'
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

            {/* Azure AD Register */}
            <button
              type="button"
              onClick={onAzureAdRegister}
              disabled={isLoading}
              className="w-full px-6 py-3 bg-white border border-gray-200 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 flex items-center justify-center gap-2 mb-8"
            >
              <svg className="w-5 h-5" viewBox="0 0 21 21" fill="none">
                <path d="M10 0H0V10H10V0Z" fill="#F25022"/>
                <path d="M21 0H11V10H21V0Z" fill="#7FBA00"/>
                <path d="M10 11H0V21H10V11Z" fill="#00A4EF"/>
                <path d="M21 11H11V21H21V11Z" fill="#FFB900"/>
              </svg>
              {t('login.azureAd', 'Sign up with Microsoft')}
            </button>

            {/* Back to Login */}
            <div className="text-center">
              <p className="text-sm text-gray-600">
                Already have an account?{' '}
                <Link to="/login" className="text-primary-500 hover:text-primary-600 font-medium select-none">
                  Sign in
                </Link>
              </p>
              <div className="mt-4">
                 <Link to="/" className="text-sm text-gray-500 hover:text-gray-700 inline-flex items-center gap-1">
                   <ArrowLeft className="w-4 h-4" />
                   {t('login.backToHome', 'Back to Home')}
                 </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
