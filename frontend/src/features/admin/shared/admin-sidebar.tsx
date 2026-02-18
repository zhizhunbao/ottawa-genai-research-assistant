/**
 * AdminSidebar - Collapsible sidebar navigation for Admin Console
 *
 * Groups navigation items by category (Infrastructure, Content, Quality, System)
 * with lucide-react SVG icons. Supports collapsed state for more screen space.
 *
 * @module features/admin/shared
 * @reference shadcn-admin/src/components/layout/nav-group.tsx
 */

import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import { adminNavGroups } from './sidebar-data'
import { Button } from '@/shared/components/ui/button'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/shared/components/ui/tooltip'

export function AdminSidebar() {
  const [collapsed, setCollapsed] = useState(false)
  const location = useLocation()

  const isActive = (url: string) => {
    if (url === '/admin') return location.pathname === '/admin'
    return location.pathname.startsWith(url)
  }

  return (
    <aside
      className={cn(
        'flex flex-col border-r border-border bg-background transition-all duration-200',
        collapsed ? 'w-16' : 'w-60'
      )}
    >
      {/* Sidebar content */}
      <div className="flex-1 overflow-y-auto py-4">
        {adminNavGroups.map((group) => (
          <div key={group.title} className="mb-4">
            {/* Group label */}
            {!collapsed && (
              <h4 className="px-4 mb-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                {group.title}
              </h4>
            )}
            {collapsed && (
              <div className="mx-auto my-2 h-px w-8 bg-border" />
            )}

            {/* Navigation items */}
            <nav className="flex flex-col gap-0.5 px-2">
              {group.items.map((item) => {
                const Icon = item.icon
                const active = isActive(item.url)

                if (collapsed) {
                  return (
                    <Tooltip key={item.url} delayDuration={0}>
                      <TooltipTrigger asChild>
                        <Link
                          to={item.url}
                          className={cn(
                            'flex items-center justify-center h-9 w-full rounded-md transition-colors',
                            active
                              ? 'bg-accent text-accent-foreground'
                              : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                          )}
                        >
                          <Icon size={18} />
                        </Link>
                      </TooltipTrigger>
                      <TooltipContent side="right" sideOffset={8}>
                        {item.title}
                      </TooltipContent>
                    </Tooltip>
                  )
                }

                return (
                  <Link
                    key={item.url}
                    to={item.url}
                    className={cn(
                      'flex items-center gap-3 px-3 h-9 rounded-md text-sm font-medium transition-colors',
                      active
                        ? 'bg-accent text-accent-foreground'
                        : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                    )}
                  >
                    <Icon size={18} />
                    <span>{item.title}</span>
                    {item.badge && (
                      <span className="ml-auto rounded-full bg-primary px-2 py-0.5 text-[10px] font-semibold text-primary-foreground">
                        {item.badge}
                      </span>
                    )}
                  </Link>
                )
              })}
            </nav>
          </div>
        ))}
      </div>

      {/* Collapse toggle */}
      <div className="border-t border-border p-2">
        <Button
          variant="ghost"
          size="sm"
          className="w-full h-8"
          onClick={() => setCollapsed((prev) => !prev)}
        >
          {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          {!collapsed && <span className="ml-2 text-xs">Collapse</span>}
        </Button>
      </div>
    </aside>
  )
}
