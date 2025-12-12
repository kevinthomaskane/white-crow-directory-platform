'use client';

import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import type { User } from '@supabase/supabase-js';
import { ADMIN_SITE_NAV } from '@/lib/constants';

export function AdminNav({ user }: { user: User }) {
  const router = useRouter();

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/admin/login');
    router.refresh();
  }

  return (
    <nav className="border-b border-border px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-6">
          <a href="/admin" className="text-lg font-semibold tracking-tight">
            White Crow Admin
          </a>
          <div className="flex items-center gap-4 text-sm">
            {ADMIN_SITE_NAV.map((site) => (
              <a
                key={site.href}
                href={site.href}
                className="text-muted-foreground transition-colors hover:text-foreground"
              >
                {site.title}
              </a>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm text-muted-foreground">{user.email}</span>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleSignOut}
            className="text-muted-foreground hover:text-foreground"
          >
            Sign out
          </Button>
        </div>
      </div>
    </nav>
  );
}
