'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Menu, ChevronDown, ExternalLink, User, LogOut } from 'lucide-react';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAuth } from '@/contexts/auth-context';
import { createClient } from '@/lib/supabase/client';

/**
 * Navigation item for sub-navigation dropdowns
 */
export interface NavSubItem {
  /** Display label for the navigation item */
  label: string;
  /** URL to navigate to */
  href: string;
  /** Optional description shown in dropdown menus */
  description?: string;
  /** Optional icon component */
  icon?: React.ComponentType<{ className?: string }>;
  /** Whether this link opens in a new tab */
  external?: boolean;
}

/**
 * Top-level navigation item
 */
export interface NavItem {
  /** Display label for the navigation item */
  label: string;
  /** URL to navigate to (optional if hasSubNav is true) */
  href?: string;
  /** Whether this item has sub-navigation */
  hasSubNav?: boolean;
  /** Sub-navigation items (required if hasSubNav is true) */
  subItems?: NavSubItem[];
  /** Optional icon component */
  icon?: React.ComponentType<{ className?: string }>;
  /** Whether this link opens in a new tab */
  external?: boolean;
  /** Whether this item is highlighted/featured (e.g., CTA button) */
  featured?: boolean;
}

/**
 * Logo configuration
 */
export interface LogoConfig {
  /** Logo image source URL */
  src?: string;
  /** Alt text for the logo image */
  alt?: string;
  /** Text to display if no image (or alongside image) */
  text?: string;
  /** URL to navigate to when clicking the logo */
  href?: string;
}

export interface SiteHeaderProps {
  /** Logo configuration */
  logo: LogoConfig;
  /** Navigation items */
  navItems: NavItem[];
  /** Additional class names */
  className?: string;
  /** Whether to use a sticky header */
  sticky?: boolean;
  /** Whether to show a border on the bottom */
  bordered?: boolean;
}

/**
 * Mobile navigation item component
 */
function MobileNavItem({
  item,
  onClose,
}: {
  item: NavItem;
  onClose: () => void;
}) {
  const [isOpen, setIsOpen] = React.useState(false);
  const Icon = item.icon;

  if (item.hasSubNav && item.subItems) {
    return (
      <div className="space-y-2">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex w-full items-center justify-between rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground"
        >
          <span className="flex items-center gap-2">
            {Icon && <Icon className="size-4" />}
            {item.label}
          </span>
          <ChevronDown
            className={cn(
              'size-4 transition-transform duration-200',
              isOpen && 'rotate-180'
            )}
          />
        </button>
        {isOpen && (
          <div className="ml-4 space-y-1 border-l border-border pl-4">
            {item.subItems.map((subItem) => {
              const SubIcon = subItem.icon;
              return (
                <Link
                  key={subItem.href}
                  href={subItem.href}
                  onClick={onClose}
                  className="flex items-center gap-2 rounded-md px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
                  {...(subItem.external
                    ? { target: '_blank', rel: 'noopener noreferrer' }
                    : {})}
                >
                  {SubIcon && <SubIcon className="size-4" />}
                  {subItem.label}
                  {subItem.external && (
                    <ExternalLink className="size-3 text-muted-foreground" />
                  )}
                </Link>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  if (item.featured) {
    return (
      <Button asChild className="w-full">
        <Link
          href={item.href || '#'}
          onClick={onClose}
          {...(item.external
            ? { target: '_blank', rel: 'noopener noreferrer' }
            : {})}
        >
          {Icon && <Icon className="size-4" />}
          {item.label}
          {item.external && <ExternalLink className="size-3" />}
        </Link>
      </Button>
    );
  }

  return (
    <Link
      href={item.href || '#'}
      onClick={onClose}
      className="flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground"
      {...(item.external
        ? { target: '_blank', rel: 'noopener noreferrer' }
        : {})}
    >
      {Icon && <Icon className="size-4" />}
      {item.label}
      {item.external && (
        <ExternalLink className="size-3 text-muted-foreground" />
      )}
    </Link>
  );
}

/**
 * User account navigation component
 */
function UserAccountNav() {
  const router = useRouter();
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return null;
  }

  if (!user) {
    return (
      <Link
        href="/login"
        className="inline-flex items-center justify-center whitespace-nowrap rounded-md px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground"
      >
        Log in
      </Link>
    );
  }

  // Get display name from user metadata or email
  const displayName =
    (user.user_metadata?.display_name as string) ||
    user.email?.split('@')[0] ||
    'User';
  const initial = displayName.charAt(0).toUpperCase();

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.refresh();
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-medium hover:opacity-80 transition-opacity">
          {initial}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem asChild>
          <Link href="/profile" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            My Account
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={handleSignOut}
          className="flex items-center gap-2"
        >
          <LogOut className="h-4 w-4" />
          Sign Out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

/**
 * Mobile user account component
 */
function MobileUserAccount({ onClose }: { onClose: () => void }) {
  const router = useRouter();
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return null;
  }

  if (!user) {
    return (
      <div className="border-t border-border pt-4 mt-4">
        <Link
          href="/login"
          onClick={onClose}
          className="flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground"
        >
          Log in
        </Link>
      </div>
    );
  }

  const displayName =
    (user.user_metadata?.display_name as string) ||
    user.email?.split('@')[0] ||
    'User';
  const initial = displayName.charAt(0).toUpperCase();

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    onClose();
    router.refresh();
  }

  return (
    <div className="border-t border-border pt-4 mt-4">
      <div className="flex items-center gap-3 px-3 mb-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground font-medium">
          {initial}
        </span>
        <span className="text-sm font-medium">{displayName}</span>
      </div>
      <Link
        href="/profile"
        onClick={onClose}
        className="flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground"
      >
        <User className="h-4 w-4" />
        My Account
      </Link>
      <button
        onClick={handleSignOut}
        className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground"
      >
        <LogOut className="h-4 w-4" />
        Sign Out
      </button>
    </div>
  );
}

/**
 * Site header component for public directory sites
 */
export function SiteHeader({
  logo,
  navItems,
  className,
  sticky = true,
  bordered = true,
}: SiteHeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  return (
    <header
      className={cn(
        'z-50 w-full bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60',
        sticky && 'sticky top-0',
        bordered && 'border-b border-border',
        className
      )}
    >
      <div className="mx-auto flex h-18 max-w-6xl items-center justify-between px-4">
        {/* Logo */}
        <Link className="h-full inline-block py-4" href={logo.href || '/'}>
          {logo.src && (
            <img
              src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${logo.src}`}
              alt={logo.alt || 'Logo'}
              className="h-full w-auto"
            />
          )}
          {logo.text && (
            <span className="text-lg font-semibold tracking-tight">
              {logo.text}
            </span>
          )}
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-1">
          {navItems.map((item) => {
            const Icon = item.icon;

            if (item.hasSubNav && item.subItems) {
              return (
                <DropdownMenu key={item.label}>
                  <DropdownMenuTrigger asChild>
                    <button className="inline-flex items-center justify-center gap-1 whitespace-nowrap rounded-md px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring">
                      {Icon && <Icon className="size-4" />}
                      {item.label}
                      <ChevronDown className="size-3" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start">
                    {item.subItems.map((subItem) => {
                      const SubIcon = subItem.icon;
                      return (
                        <DropdownMenuItem key={subItem.href} asChild>
                          <Link
                            href={subItem.href}
                            className="flex items-center gap-2"
                            {...(subItem.external
                              ? { target: '_blank', rel: 'noopener noreferrer' }
                              : {})}
                          >
                            {SubIcon && <SubIcon className="size-4" />}
                            {subItem.label}
                            {subItem.external && (
                              <ExternalLink className="size-3 text-muted-foreground" />
                            )}
                          </Link>
                        </DropdownMenuItem>
                      );
                    })}
                  </DropdownMenuContent>
                </DropdownMenu>
              );
            }

            if (item.featured) {
              return (
                <Button key={item.label} asChild size="sm">
                  <Link
                    href={item.href || '#'}
                    {...(item.external
                      ? { target: '_blank', rel: 'noopener noreferrer' }
                      : {})}
                  >
                    {Icon && <Icon className="size-4" />}
                    {item.label}
                    {item.external && <ExternalLink className="size-3" />}
                  </Link>
                </Button>
              );
            }

            return (
              <Link
                key={item.label}
                href={item.href || '#'}
                className="inline-flex items-center justify-center gap-1 whitespace-nowrap rounded-md px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                {...(item.external
                  ? { target: '_blank', rel: 'noopener noreferrer' }
                  : {})}
              >
                {Icon && <Icon className="size-4" />}
                {item.label}
                {item.external && (
                  <ExternalLink className="size-3 text-muted-foreground" />
                )}
              </Link>
            );
          })}
          <UserAccountNav />
        </nav>

        {/* Mobile Menu */}
        <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
          <SheetTrigger asChild className="md:hidden">
            <Button variant="ghost" size="icon">
              <Menu className="size-5" />
              <span className="sr-only">Toggle menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-[300px] sm:w-[350px]">
            <SheetHeader>
              <SheetTitle>
                <Link
                  href={logo.href || '/'}
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2"
                >
                  {logo.src && (
                    <img
                      src={logo.src}
                      alt={logo.alt || 'Logo'}
                      className="h-6 w-auto"
                    />
                  )}
                  {logo.text && <span>{logo.text}</span>}
                </Link>
              </SheetTitle>
            </SheetHeader>
            <nav className="mt-6 flex flex-col gap-2">
              {navItems.map((item) => (
                <MobileNavItem
                  key={item.label}
                  item={item}
                  onClose={() => setMobileMenuOpen(false)}
                />
              ))}
              <MobileUserAccount onClose={() => setMobileMenuOpen(false)} />
            </nav>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}

export default SiteHeader;
