'use client';

import * as React from 'react';
import Link from 'next/link';
import { Menu, ChevronDown, ExternalLink } from 'lucide-react';

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
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from '@/components/ui/navigation-menu';

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
 * ListItem component for navigation menu dropdowns
 */
const ListItem = React.forwardRef<
  React.ComponentRef<'a'>,
  React.ComponentPropsWithoutRef<'a'> & {
    icon?: React.ComponentType<{ className?: string }>;
    external?: boolean;
  }
>(({ className, title, children, icon: Icon, external, ...props }, ref) => {
  return (
    <li>
      <NavigationMenuLink asChild>
        <a
          ref={ref}
          className={cn(
            'block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground',
            className
          )}
          {...props}
          {...(external
            ? { target: '_blank', rel: 'noopener noreferrer' }
            : {})}
        >
          <div className="flex items-center gap-2 text-sm font-medium leading-none">
            {Icon && <Icon className="size-4" />}
            {title}
            {external && (
              <ExternalLink className="size-3 text-muted-foreground" />
            )}
          </div>
          {children && (
            <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
              {children}
            </p>
          )}
        </a>
      </NavigationMenuLink>
    </li>
  );
});
ListItem.displayName = 'ListItem';

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
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        {/* Logo */}
        <Link
          href={logo.href || '/'}
          className="flex items-center gap-2 transition-opacity hover:opacity-80"
        >
          {logo.src && (
            <img
              src={logo.src}
              alt={logo.alt || 'Logo'}
              className="h-8 w-auto"
            />
          )}
          {logo.text && (
            <span className="text-lg font-semibold tracking-tight">
              {logo.text}
            </span>
          )}
        </Link>

        {/* Desktop Navigation */}
        <NavigationMenu className="hidden md:flex">
          <NavigationMenuList>
            {navItems.map((item) => {
              const Icon = item.icon;

              if (item.hasSubNav && item.subItems) {
                return (
                  <NavigationMenuItem key={item.label}>
                    <NavigationMenuTrigger className="bg-transparent">
                      {Icon && <Icon className="mr-1 size-4" />}
                      {item.label}
                    </NavigationMenuTrigger>
                    <NavigationMenuContent>
                      <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2 lg:w-[600px]">
                        {item.subItems.map((subItem) => (
                          <ListItem
                            key={subItem.href}
                            title={subItem.label}
                            href={subItem.href}
                            icon={subItem.icon}
                            external={subItem.external}
                          >
                            {subItem.description}
                          </ListItem>
                        ))}
                      </ul>
                    </NavigationMenuContent>
                  </NavigationMenuItem>
                );
              }

              if (item.featured) {
                return (
                  <NavigationMenuItem key={item.label}>
                    <Button asChild size="sm">
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
                  </NavigationMenuItem>
                );
              }

              return (
                <NavigationMenuItem key={item.label}>
                  <NavigationMenuLink
                    asChild
                    className={cn(
                      navigationMenuTriggerStyle(),
                      'bg-transparent'
                    )}
                    {...(item.external
                      ? { target: '_blank', rel: 'noopener noreferrer' }
                      : {})}
                  >
                    <Link href={item.href || '#'}>
                      {Icon && <Icon className="mr-1 size-4" />}
                      {item.label}
                      {item.external && (
                        <ExternalLink className="ml-1 size-3 text-muted-foreground" />
                      )}
                    </Link>
                  </NavigationMenuLink>
                </NavigationMenuItem>
              );
            })}
          </NavigationMenuList>
        </NavigationMenu>

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
            </nav>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}

export default SiteHeader;
