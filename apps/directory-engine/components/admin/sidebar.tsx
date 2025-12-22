'use client';

import { usePathname, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import type { User } from '@supabase/supabase-js';
import { ADMIN_SITE_NAV } from '@/lib/constants';
import {
  LayoutDashboard,
  Layers,
  FolderTree,
  Building2,
  LogOut,
  ChevronRight,
  Clock,
  Globe,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const navIcons: Record<string, React.ReactNode> = {
  '/admin': <LayoutDashboard className="h-4 w-4" />,
  '/admin/verticals': <Layers className="h-4 w-4" />,
  '/admin/categories': <FolderTree className="h-4 w-4" />,
  '/admin/add-businesses': <Building2 className="h-4 w-4" />,
  '/admin/jobs': <Clock className="h-4 w-4" />,
  '/admin/sites': <Globe className="h-4 w-4" />,
};

export function Sidebar({ user }: { user: User }) {
  const pathname = usePathname();
  const router = useRouter();

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/admin/login');
    router.refresh();
  }

  const allNavItems = [
    { title: 'Dashboard', href: '/admin' },
    ...ADMIN_SITE_NAV,
  ];

  return (
    <aside className="flex h-screen w-64 flex-col border-r border-sidebar-border bg-sidebar">
      <div className="flex h-14 items-center border-b border-sidebar-border px-4">
        <a href="/admin" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
            <span className="text-sm font-bold">WC</span>
          </div>
          <span className="font-semibold text-sidebar-foreground">
            White Crow
          </span>
        </a>
      </div>

      <nav className="flex-1 space-y-1 p-3">
        {allNavItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <a
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors',
                isActive
                  ? 'bg-sidebar-accent text-sidebar-accent-foreground font-medium'
                  : 'text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
              )}
            >
              {navIcons[item.href] || <ChevronRight className="h-4 w-4" />}
              {item.title}
            </a>
          );
        })}
      </nav>

      <div className="border-t border-sidebar-border p-3">
        <div className="flex items-center gap-3 rounded-lg px-3 py-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-sidebar-accent text-sm font-medium text-sidebar-accent-foreground">
            {user.email?.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 truncate">
            <p className="truncate text-sm font-medium text-sidebar-foreground">
              {user.email}
            </p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleSignOut}
            className="h-8 w-8 text-sidebar-foreground/70 hover:text-sidebar-foreground"
          >
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </aside>
  );
}
