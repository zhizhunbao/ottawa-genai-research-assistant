/**
 * Header - Global navigation with logo, nav links, language toggle, and auth controls
 *
 * @module shared/components/layout
 * @template none
 * @reference none
 */
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Globe, LogIn, LogOut } from 'lucide-react'
import { useAuth } from '@/features/auth/hooks/use-auth'
import { useAuthDialog } from '@/features/auth/hooks/use-auth-dialog'
import {
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  Avatar,
  AvatarFallback,
} from '@/shared/components/ui'

export function Header() {
  const { t, i18n } = useTranslation('common')
  const { isAuthenticated, user, logout } = useAuth()
  const { openAuthDialog } = useAuthDialog()

  const toggleLanguage = () => {
    const nextLang = i18n.resolvedLanguage === 'en' ? 'fr' : 'en'
    i18n.changeLanguage(nextLang)
    localStorage.setItem('language', nextLang) // 手动保存，或者调用 i18n.ts 中的 changeLanguage
  }

  const getUserInitial = () => {
    return user?.displayName?.charAt(0).toUpperCase() || user?.email?.charAt(0).toUpperCase() || 'U'
  }

  return (
    <header className="sticky top-0 z-50 h-14 border-b border-border bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
      <div className="px-4 h-full flex items-center justify-between">
        {/* Left: Logo */}
        <Link to="/" className="flex items-center gap-2.5 transition-opacity hover:opacity-80">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-sm shadow-sm">
            🍁
          </div>
          <span className="font-bold text-sm text-foreground tracking-tight hidden sm:inline">
            {t('app.name')}
          </span>
        </Link>

        {/* Right: Actions */}
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleLanguage}
            className="h-8 px-2.5 text-xs font-semibold text-muted-foreground"
          >
            <Globe size={14} className="mr-1" />
            {i18n.resolvedLanguage === 'fr' ? 'FR' : 'EN'}
          </Button>

          {isAuthenticated ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 gap-2 pl-1.5">
                  <Avatar className="h-6 w-6">
                    <AvatarFallback className="bg-primary text-primary-foreground text-[10px] font-bold">
                      {getUserInitial()}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-sm font-medium hidden sm:inline">
                    {user?.displayName || user?.email?.split('@')[0]}
                  </span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel className="font-normal">
                  <p className="text-xs text-muted-foreground">{t('auth.signedInAs')}</p>
                  <p className="text-sm font-medium truncate">{user?.displayName || user?.email}</p>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={logout}
                  className="text-muted-foreground hover:text-destructive cursor-pointer"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  {t('nav.logout')}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button size="sm" className="h-8 gap-1.5" onClick={() => openAuthDialog('login')}>
              <LogIn size={14} />
              {t('nav.login')}
            </Button>
          )}
        </div>
      </div>
    </header>
  )
}
