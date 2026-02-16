/**
 * ContentToolbar - Breadcrumb + view controls for the folder content area
 *
 * @module features/documents/components
 */
import { ChevronRight, List, LayoutGrid, ArrowUpDown } from 'lucide-react'
import { Button } from '@/shared/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/shared/components/ui/dropdown-menu'
import { useDocumentStore, selectViewMode, selectSorting, selectSelectedNode } from '@/stores'

export function ContentToolbar() {
  const viewMode = useDocumentStore(selectViewMode)
  const sorting = useDocumentStore(selectSorting)
  const selectedNode = useDocumentStore(selectSelectedNode)
  const { setViewMode, setSorting } = useDocumentStore()

  return (
    <div className="flex items-center gap-2 px-4 py-2 border-b bg-muted/30">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1 text-sm flex-1 min-w-0">
        <span className="text-muted-foreground">Documents</span>
        {selectedNode.name && (
          <>
            <ChevronRight className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
            <span className="font-medium truncate">{selectedNode.name}</span>
          </>
        )}
      </nav>

      {/* Sort dropdown */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm" className="h-8 gap-1.5">
            <ArrowUpDown className="h-3.5 w-3.5" />
            <span className="text-xs capitalize">{sorting.by}</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => setSorting('name')}>
            Name {sorting.by === 'name' && (sorting.order === 'asc' ? '↑' : '↓')}
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setSorting('date')}>
            Date {sorting.by === 'date' && (sorting.order === 'asc' ? '↑' : '↓')}
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setSorting('status')}>
            Status {sorting.by === 'status' && (sorting.order === 'asc' ? '↑' : '↓')}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* View mode toggle */}
      <div className="flex items-center border rounded-md">
        <Button
          variant={viewMode === 'list' ? 'secondary' : 'ghost'}
          size="icon"
          className="h-8 w-8 rounded-r-none"
          onClick={() => setViewMode('list')}
          title="List view"
        >
          <List className="h-3.5 w-3.5" />
        </Button>
        <Button
          variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
          size="icon"
          className="h-8 w-8 rounded-l-none"
          onClick={() => setViewMode('grid')}
          title="Grid view"
        >
          <LayoutGrid className="h-3.5 w-3.5" />
        </Button>
      </div>
    </div>
  )
}

export default ContentToolbar
