/**
 * ComingSoon - Placeholder page for admin modules not yet implemented
 *
 * @module features/admin/shared
 * @reference shadcn-admin/src/components/coming-soon.tsx
 */

import { Construction } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Button } from '@/shared/components/ui/button'

interface ComingSoonProps {
  title: string
  description?: string
}

export function ComingSoon({ title, description }: ComingSoonProps) {
  return (
    <div className="flex flex-col items-center justify-center h-full min-h-[60vh] gap-4">
      <div className="rounded-full bg-muted p-4">
        <Construction size={32} className="text-muted-foreground" />
      </div>
      <div className="text-center space-y-2">
        <h2 className="text-xl font-semibold">{title}</h2>
        <p className="text-sm text-muted-foreground max-w-md">
          {description || 'This module is under development and will be available soon.'}
        </p>
      </div>
      <Button variant="outline" size="sm" asChild>
        <Link to="/admin">Back to Dashboard</Link>
      </Button>
    </div>
  )
}
