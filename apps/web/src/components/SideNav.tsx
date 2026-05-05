'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

type NavItem = {
  label: string;
  href: string;
  match: (pathname: string) => boolean;
};

const NAV_ITEMS: NavItem[] = [
  { label: 'Life', href: '/life', match: (p) => p.startsWith('/life') },
  { label: 'Work', href: '/work', match: (p) => p.startsWith('/work') },
  { label: '설정', href: '/settings', match: (p) => p.startsWith('/settings') },
];

export function SideNav() {
  const pathname = usePathname() ?? '';
  return (
    <nav
      aria-label="주요 네비게이션"
      className="fixed left-0 top-0 hidden h-screen w-60 flex-col gap-2 border-r border-periwinkle-200 bg-white p-4 md:flex"
    >
      <div className="px-2 py-3 text-base font-bold text-purple-500">투두</div>
      <ul className="flex flex-1 flex-col gap-1">
        {NAV_ITEMS.map((item) => {
          const active = item.match(pathname);
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                aria-current={active ? 'page' : undefined}
                className={
                  active
                    ? 'flex h-11 items-center rounded-md bg-purple-100 px-3 text-sm font-semibold text-purple-700'
                    : 'flex h-11 items-center rounded-md px-3 text-sm text-periwinkle-500 hover:bg-periwinkle-100'
                }
              >
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
