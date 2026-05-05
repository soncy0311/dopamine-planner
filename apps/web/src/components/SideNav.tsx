'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Briefcase, Settings, CircleCheck } from 'lucide-react';
import type { ComponentType, SVGProps } from 'react';

type LucideIcon = ComponentType<SVGProps<SVGSVGElement>>;

type NavItem = {
  label: string;
  href: string;
  icon: LucideIcon;
  match: (pathname: string) => boolean;
};

const WORKSPACE_ITEMS: NavItem[] = [
  { label: 'Life', href: '/life', icon: Home, match: (p) => p.startsWith('/life') },
  { label: 'Work', href: '/work', icon: Briefcase, match: (p) => p.startsWith('/work') },
];

const SETTINGS_ITEMS: NavItem[] = [
  { label: '설정', href: '/settings', icon: Settings, match: (p) => p.startsWith('/settings') },
];

function NavLinkItem({ item, active }: { item: NavItem; active: boolean }) {
  const Icon = item.icon;
  return (
    <li>
      <Link
        href={item.href}
        aria-current={active ? 'page' : undefined}
        className={
          active
            ? 'flex h-11 items-center gap-3 rounded-md bg-purple-100 px-3 text-sm font-semibold text-purple-700'
            : 'flex h-11 items-center gap-3 rounded-md px-3 text-sm text-periwinkle-500 hover:bg-periwinkle-100'
        }
      >
        <Icon aria-hidden className="h-4 w-4" />
        <span>{item.label}</span>
      </Link>
    </li>
  );
}

export function SideNav() {
  const pathname = usePathname() ?? '';
  return (
    <nav
      aria-label="주요 네비게이션"
      className="fixed left-0 top-0 hidden h-screen w-60 flex-col border-r border-periwinkle-200 bg-white p-4 md:flex"
    >
      <div className="flex items-center gap-2 px-2 py-3 text-base font-bold text-purple-500">
        <CircleCheck aria-hidden className="h-5 w-5" />
        <span>Dopamine Planner</span>
      </div>

      <div className="mt-2 px-3 text-xs font-semibold uppercase tracking-wide text-lavender-gray-300">
        워크스페이스
      </div>
      <ul className="mt-1 flex flex-col gap-1">
        {WORKSPACE_ITEMS.map((item) => (
          <NavLinkItem key={item.href} item={item} active={item.match(pathname)} />
        ))}
      </ul>

      <div className="flex-1" />

      <div className="border-t border-periwinkle-200 pt-3">
        <ul className="flex flex-col gap-1">
          {SETTINGS_ITEMS.map((item) => (
            <NavLinkItem key={item.href} item={item} active={item.match(pathname)} />
          ))}
        </ul>
      </div>
    </nav>
  );
}
