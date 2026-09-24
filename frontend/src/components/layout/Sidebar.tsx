import { PiggyBank } from 'lucide-react';
import { NavLink, useSearchParams } from 'react-router';
import { cn } from '@/lib/utils';
import { NAV_ITEMS } from './navItems';

export function Brand() {
  return (
    <div className="flex items-center gap-2 px-2 text-base font-semibold">
      <span className="grid size-8 place-items-center rounded-lg bg-primary text-primary-foreground">
        <PiggyBank className="size-4" />
      </span>
      Finanças
    </div>
  );
}

export function NavLinks({ onNavigate }: { onNavigate?: () => void }) {
  const [params] = useSearchParams();
  const month = params.get('month');

  return (
    <nav className="flex flex-col gap-1">
      {NAV_ITEMS.map(({ to, label, icon: Icon, monthAware }) => (
        <NavLink
          key={to}
          to={{ pathname: to, search: monthAware && month ? `?month=${month}` : '' }}
          end={to === '/'}
          onClick={onNavigate}
          className={({ isActive }) =>
            cn(
              'flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground',
              isActive && 'bg-muted font-medium text-foreground',
            )
          }
        >
          <Icon className="size-4" />
          {label}
        </NavLink>
      ))}
    </nav>
  );
}

export function Sidebar() {
  return (
    <aside className="sticky top-0 hidden h-svh w-60 shrink-0 flex-col gap-6 border-r bg-sidebar p-4 md:flex">
      <Brand />
      <NavLinks />
    </aside>
  );
}
