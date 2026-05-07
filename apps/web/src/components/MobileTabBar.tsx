'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

type TabItem = {
  label: string;
  href: string;
  match: (pathname: string) => boolean;
};

const TAB_ITEMS: TabItem[] = [
  { label: 'Life', href: '/life', match: (p) => p.startsWith('/life') },
  { label: 'Work', href: '/work', match: (p) => p.startsWith('/work') },
  { label: '설정', href: '/settings', match: (p) => p.startsWith('/settings') },
];

export function MobileTabBar() {
  const pathname = usePathname() ?? '';
  return (
    <nav
      aria-label="모바일 탭"
      className="fixed bottom-0 left-0 right-0 z-10 flex justify-around border-t border-periwinkle-200 bg-white pb-[env(safe-area-inset-bottom)] md:hidden"
    >
      {TAB_ITEMS.map((item) => {
        const active = item.match(pathname);
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? 'page' : undefined}
            className={
              active
                ? 'flex h-14 flex-1 items-center justify-center text-sm font-semibold text-purple-700'
                : 'flex h-14 flex-1 items-center justify-center text-sm text-periwinkle-400'
            }
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
