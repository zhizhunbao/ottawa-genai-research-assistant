/**
 * AuthDialog - Modal-based login and registration dialog with tab switching
 *
 * @module features/auth
 * @template none
 * @reference none
 */

import { useState, FormEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { Loader2 } from 'lucide-react'
import { useLogin } from '@/features/auth/hooks/use-login'
import { useRegister } from '@/features/auth/hooks/use-register'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/shared/components/ui'
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/shared/components/ui'
import {
  Button,
  Input,
  Label,
  Alert,
  AlertDescription,
} from '@/shared/components/ui'

interface AuthDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  defaultTab?: 'login' | 'register'
}

export function AuthDialog({
  open,
  onOpenChange,
  defaultTab = 'login',
}: AuthDialogProps) {
  const { t } = useTranslation('auth')
  const [activeTab, setActiveTab] = useState<'login' | 'register'>(defaultTab)

  const {
    isLoading: loginLoading,
    error: loginError,
    formErrors: loginFormErrors,
    handleSubmit: handleLoginSubmit,
    handleInputChange: handleLoginInputChange,
    handleAzureAdLogin,
  } = useLogin()

  const {
    isLoading: registerLoading,
    error: registerError,
    formErrors: registerFormErrors,
    handleSubmit: handleRegisterSubmit,
    handleInputChange: handleRegisterInputChange,
    handleAzureAdRegister,
  } = useRegister()

  const handleLogin = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const email = (formData.get('email') as string).trim()
    const password = (formData.get('password') as string).trim()
    handleLoginSubmit(email, password)
  }

  const handleRegister = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const displayName = (formData.get('displayName') as string).trim()
    const email = (formData.get('email') as string).trim()
    const password = (formData.get('password') as string).trim()
    const confirmPassword = (formData.get('confirmPassword') as string).trim()
    handleRegisterSubmit(displayName, email, password, confirmPassword)
  }

  const MicrosoftIcon = () => (
    <svg className="w-4 h-4" viewBox="0 0 21 21" fill="none">
      <path d="M10 0H0V10H10V0Z" fill="#F25022" />
      <path d="M21 0H11V10H21V0Z" fill="#7FBA00" />
      <path d="M10 11H0V21H10V11Z" fill="#00A4EF" />
      <path d="M21 11H11V21H21V11Z" fill="#FFB900" />
    </svg>
  )

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-center text-xl">
            {activeTab === 'login'
              ? t('login.title', 'Welcome Back')
              : t('register.title', 'Create Account')}
          </DialogTitle>
          <DialogDescription className="text-center">
            {activeTab === 'login'
              ? t('login.subtitle', 'Sign in to access Ottawa GenAI Research Assistant')
              : t('register.subtitle', 'Sign up to get started')}
          </DialogDescription>
        </DialogHeader>

        <Tabs
          value={activeTab}
          onValueChange={(value) => setActiveTab(value as 'login' | 'register')}
          className="w-full"
        >
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="login">{t('login.tab', 'Sign In')}</TabsTrigger>
            <TabsTrigger value="register">{t('register.tab', 'Sign Up')}</TabsTrigger>
          </TabsList>

          {/* Login Tab */}
          <TabsContent value="login" className="mt-4 space-y-4">
            {loginError && (
              <Alert variant="destructive">
                <AlertDescription>{loginError}</AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="login-email">{t('login.email', 'Email')}</Label>
                <Input
                  id="login-email"
                  name="email"
                  type="email"
                  placeholder={t('login.emailPlaceholder', 'john@example.com')}
                  onChange={() => handleLoginInputChange('email')}
                  disabled={loginLoading}
                  autoComplete="email"
                  className={loginFormErrors.email ? 'border-destructive' : ''}
                />
                {loginFormErrors.email && (
                  <p className="text-sm text-destructive">{loginFormErrors.email}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="login-password">{t('login.password', 'Password')}</Label>
                <Input
                  id="login-password"
                  name="password"
                  type="password"
                  placeholder={t('login.passwordPlaceholder', '******')}
                  onChange={() => handleLoginInputChange('password')}
                  disabled={loginLoading}
                  autoComplete="current-password"
                  className={loginFormErrors.password ? 'border-destructive' : ''}
                />
                {loginFormErrors.password && (
                  <p className="text-sm text-destructive">{loginFormErrors.password}</p>
                )}
              </div>

              <Button type="submit" className="w-full" disabled={loginLoading}>
                {loginLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  t('login.submit', 'Sign In')
                )}
              </Button>
            </form>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">or</span>
              </div>
            </div>

            <Button
              type="button"
              variant="outline"
              className="w-full gap-2"
              onClick={handleAzureAdLogin}
              disabled={loginLoading}
            >
              <MicrosoftIcon />
              {t('login.azureAd', 'Sign in with Microsoft')}
            </Button>
          </TabsContent>

          {/* Register Tab */}
          <TabsContent value="register" className="mt-4 space-y-4">
            {registerError && (
              <Alert variant="destructive">
                <AlertDescription>{registerError}</AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleRegister} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="register-name">
                  {t('register.displayName', 'Full Name')}
                </Label>
                <Input
                  id="register-name"
                  name="displayName"
                  type="text"
                  placeholder="John Doe"
                  onChange={() => handleRegisterInputChange('displayName')}
                  disabled={registerLoading}
                  className={registerFormErrors.displayName ? 'border-destructive' : ''}
                />
                {registerFormErrors.displayName && (
                  <p className="text-sm text-destructive">{registerFormErrors.displayName}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="register-email">{t('login.email', 'Email')}</Label>
                <Input
                  id="register-email"
                  name="email"
                  type="email"
                  placeholder="john@example.com"
                  onChange={() => handleRegisterInputChange('email')}
                  disabled={registerLoading}
                  autoComplete="email"
                  className={registerFormErrors.email ? 'border-destructive' : ''}
                />
                {registerFormErrors.email && (
                  <p className="text-sm text-destructive">{registerFormErrors.email}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="register-password">{t('login.password', 'Password')}</Label>
                <Input
                  id="register-password"
                  name="password"
                  type="password"
                  placeholder="******"
                  onChange={() => handleRegisterInputChange('password')}
                  disabled={registerLoading}
                  autoComplete="new-password"
                  className={registerFormErrors.password ? 'border-destructive' : ''}
                />
                {registerFormErrors.password && (
                  <p className="text-sm text-destructive">{registerFormErrors.password}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="register-confirm">
                  {t('register.confirmPassword', 'Confirm Password')}
                </Label>
                <Input
                  id="register-confirm"
                  name="confirmPassword"
                  type="password"
                  placeholder="******"
                  onChange={() => handleRegisterInputChange('confirmPassword')}
                  disabled={registerLoading}
                  autoComplete="new-password"
                  className={registerFormErrors.confirmPassword ? 'border-destructive' : ''}
                />
                {registerFormErrors.confirmPassword && (
                  <p className="text-sm text-destructive">{registerFormErrors.confirmPassword}</p>
                )}
              </div>

              <Button type="submit" className="w-full" disabled={registerLoading}>
                {registerLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  t('register.submit', 'Create Account')
                )}
              </Button>
            </form>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">or</span>
              </div>
            </div>

            <Button
              type="button"
              variant="outline"
              className="w-full gap-2"
              onClick={handleAzureAdRegister}
              disabled={registerLoading}
            >
              <MicrosoftIcon />
              {t('register.azureAd', 'Sign up with Microsoft')}
            </Button>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
