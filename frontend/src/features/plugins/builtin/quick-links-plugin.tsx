/**
 * QuickLinksPlugin - Example plugin providing a quick links dashboard widget
 *
 * @module features/plugins/builtin
 */

import { useState } from 'react';
import type { PluginInstance, PluginWidgetProps } from '../types';
import { ExternalLink, Plus, X } from 'lucide-react';

interface QuickLink {
  id: string;
  title: string;
  url: string;
}

const DEFAULT_LINKS: QuickLink[] = [
  { id: '1', title: 'Ottawa Open Data', url: 'https://open.ottawa.ca' },
  { id: '2', title: 'Canada.ca', url: 'https://canada.ca' },
  { id: '3', title: 'arXiv Papers', url: 'https://arxiv.org' },
  { id: '4', title: 'GitHub', url: 'https://github.com' },
];

function QuickLinksWidgetComponent({ compact }: PluginWidgetProps) {
  const [links, setLinks] = useState<QuickLink[]>(DEFAULT_LINKS);
  const [isAdding, setIsAdding] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newUrl, setNewUrl] = useState('');

  const handleAdd = () => {
    if (!newTitle || !newUrl) return;
    setLinks((prev) => [...prev, { id: Date.now().toString(), title: newTitle, url: newUrl }]);
    setNewTitle('');
    setNewUrl('');
    setIsAdding(false);
  };

  const handleRemove = (id: string) => {
    setLinks((prev) => prev.filter((l) => l.id !== id));
  };

  if (compact) {
    return (
      <div className="flex items-center gap-2 text-sm">
        <ExternalLink className="h-4 w-4" />
        <span>{links.length} links</span>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col gap-2 p-1">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
          Quick Links
        </span>
        <button
          onClick={() => setIsAdding(!isAdding)}
          className="p-0.5 rounded hover:bg-muted transition-colors"
        >
          <Plus className="h-3.5 w-3.5 text-muted-foreground" />
        </button>
      </div>

      {isAdding && (
        <div className="flex flex-col gap-1 p-2 rounded border border-border bg-muted/50">
          <input
            type="text"
            placeholder="Title"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            className="text-xs px-2 py-1 rounded bg-background border border-border outline-none focus:ring-1 focus:ring-primary/30"
          />
          <input
            type="url"
            placeholder="https://..."
            value={newUrl}
            onChange={(e) => setNewUrl(e.target.value)}
            className="text-xs px-2 py-1 rounded bg-background border border-border outline-none focus:ring-1 focus:ring-primary/30"
          />
          <button
            onClick={handleAdd}
            className="text-xs px-2 py-1 rounded bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            Add
          </button>
        </div>
      )}

      <div className="flex-1 flex flex-col gap-1 overflow-y-auto">
        {links.map((link) => (
          <div key={link.id} className="group flex items-center gap-2">
            <a
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 flex items-center gap-1.5 px-2 py-1 rounded text-xs hover:bg-muted transition-colors truncate"
            >
              <ExternalLink className="h-3 w-3 shrink-0 text-muted-foreground" />
              <span className="truncate">{link.title}</span>
            </a>
            <button
              onClick={() => handleRemove(link.id)}
              className="p-0.5 rounded opacity-0 group-hover:opacity-100 hover:bg-destructive/10 transition-opacity"
            >
              <X className="h-3 w-3 text-muted-foreground" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export const quickLinksPlugin: PluginInstance = {
  manifest: {
    id: 'quick-links',
    name: 'Quick Links',
    description: 'Pin your favorite research links and resources for quick access.',
    version: '1.0.0',
    author: 'Built-in',
    icon: 'ExternalLink',
    category: 'productivity',
    tags: ['links', 'bookmarks', 'productivity'],
  },
  widgets: [
    {
      slot: 'dashboard-widget',
      component: QuickLinksWidgetComponent,
      defaultWidth: 1,
      defaultHeight: 2,
      priority: 8,
    },
  ],
};
