'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, History, HelpCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { href: '/', label: 'হোম', icon: Home },
  { href: '/history', label: 'ইতিহাস', icon: History },
  { href: '/help', label: 'সাহায্য', icon: HelpCircle },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t-2 border-slate-100 safe-area-pb"
      role="navigation"
      aria-label="মূল নেভিগেশন"
    >
      <div className="max-w-lg mx-auto flex items-stretch">
        {navItems.map(({ href, label, icon: Icon }) => {
          const isActive = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex-1 flex flex-col items-center justify-center py-3 gap-1 min-h-[64px] transition-colors',
                isActive
                  ? 'text-blue-600'
                  : 'text-slate-500 hover:text-slate-700 active:bg-slate-50'
              )}
              aria-current={isActive ? 'page' : undefined}
            >
              <Icon
                size={26}
                strokeWidth={isActive ? 2.5 : 2}
                aria-hidden="true"
              />
              <span className={cn(
                'text-sm font-medium',
                isActive ? 'font-bold' : ''
              )}>
                {label}
              </span>
              {isActive && (
                <span className="sr-only">(বর্তমান পৃষ্ঠা)</span>
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
