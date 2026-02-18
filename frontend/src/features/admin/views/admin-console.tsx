/**
 * AdminConsole - Admin Console layout with sidebar navigation and content area
 *
 * Wraps the sidebar and an Outlet for nested admin routes.
 * This is the parent route element for /admin/*.
 *
 * @module features/admin/views
 * @reference shadcn-admin/src/components/layout/authenticated-layout.tsx
 */

import { Outlet } from 'react-router-dom'
import { AdminSidebar } from '../shared/admin-sidebar'

export default function AdminConsole() {
  return (
    <div className="flex h-full overflow-hidden">
      <AdminSidebar />
      <div className="flex-1 overflow-y-auto">
        <Outlet />
      </div>
    </div>
  )
}
