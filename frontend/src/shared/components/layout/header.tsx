/**
 * Header - Global navigation with logo, nav links, language toggle, and auth controls
 *
 * @module shared/components/layout
 * @source shadcn-landing-page (mobile Sheet menu)
 * @reference https://github.com/leoMirandaa/shadcn-landing-page
 */
import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Globe, LogIn, LogOut, Menu, Settings } from 'lucide-react'
import { useAuth } from '@/features/auth/hooks/use-auth'
import { useAuthDialog } from '@/features/auth/hooks/use-auth-dialog'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/shared/components/ui/sheet'
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
  const location = useLocation()
  const [isOpen, setIsOpen] = useState(false)

  const navLinks: { href: string; label: string; icon?: React.ElementType }[] = [
    { href: '/research', label: t('nav.research', 'Research') },
    { href: '/admin', label: 'Admin', icon: Settings },
  ]

  const toggleLanguage = () => {
    const nextLang = i18n.resolvedLanguage === 'en' ? 'fr' : 'en'
    i18n.changeLanguage(nextLang)
    localStorage.setItem('language', nextLang)
  }

  const getUserInitial = () => {
    return user?.displayName?.charAt(0).toUpperCase() || user?.email?.charAt(0).toUpperCase() || 'U'
  }

  return (
    <header className="sticky top-0 z-50 h-14 border-b border-border bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
      <div className="h-full px-6 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2.5 transition-opacity hover:opacity-80">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-sm shadow-sm">
            🍁
          </div>
          <span className="font-bold text-sm text-foreground tracking-tight hidden sm:inline">
            {t('app.name')}
          </span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-1">
          {navLinks.map(({ href, label, icon: Icon }) =>
            href.startsWith('#') ? (
              <a
                key={href}
                href={href}
                className="px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                {label}
              </a>
            ) : (
              <Link
                key={href}
                to={href}
                className={`flex items-center gap-1.5 px-3 py-2 text-sm font-medium transition-colors ${
                  location.pathname.startsWith(href) && href !== '/'
                    ? 'text-foreground'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {Icon && <Icon size={14} />}
                {label}
              </Link>
            )
          )}
        </nav>

        {/* Desktop Actions */}
        <div className="hidden md:flex items-center gap-2">
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
                  <span className="text-sm font-medium hidden lg:inline">
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
                <DropdownMenuItem onClick={logout} className="text-muted-foreground hover:text-destructive cursor-pointer">
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

        {/* Mobile Actions */}
        <div className="flex md:hidden items-center gap-1">
          <Button variant="ghost" size="sm" onClick={toggleLanguage} className="h-8 px-2">
            <Globe size={14} />
          </Button>

          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 px-2">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-72">
              <SheetHeader>
                <SheetTitle className="flex items-center gap-2">
                  <span>🍁</span>
                  <span>{t('app.name')}</span>
                </SheetTitle>
              </SheetHeader>
              <nav className="flex flex-col gap-2 mt-6">
                {navLinks.map(({ href, label }) =>
                  href.startsWith('#') ? (
                    <a
                      key={href}
                      href={href}
                      onClick={() => setIsOpen(false)}
                      className="px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground"
                    >
                      {label}
                    </a>
                  ) : (
                    <Link
                      key={href}
                      to={href}
                      onClick={() => setIsOpen(false)}
                      className="px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground"
                    >
                      {label}
                    </Link>
                  )
                )}
                <div className="border-t my-2" />
                {isAuthenticated ? (
                  <Button variant="ghost" className="justify-start" onClick={() => { logout(); setIsOpen(false) }}>
                    <LogOut className="mr-2 h-4 w-4" />
                    {t('nav.logout')}
                  </Button>
                ) : (
                  <Button onClick={() => { openAuthDialog('login'); setIsOpen(false) }}>
                    <LogIn className="mr-2 h-4 w-4" />
                    {t('nav.login')}
                  </Button>
                )}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  )
}
