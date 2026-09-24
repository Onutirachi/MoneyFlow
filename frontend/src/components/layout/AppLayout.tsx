import { Menu } from 'lucide-react';
import { useState } from 'react';
import { Outlet } from 'react-router';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Brand, NavLinks, Sidebar } from './Sidebar';
import { ThemeToggle } from './ThemeToggle';
import { UserMenu } from './UserMenu';

export function AppLayout() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="flex min-h-svh bg-background">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-20 flex h-14 items-center gap-2 border-b bg-background/80 px-4 backdrop-blur">
          <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden" aria-label="Abrir menu">
                <Menu />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-64 p-4">
              <SheetHeader className="p-0">
                <SheetTitle asChild>
                  <div>
                    <Brand />
                  </div>
                </SheetTitle>
              </SheetHeader>
              <NavLinks onNavigate={() => setMenuOpen(false)} />
            </SheetContent>
          </Sheet>
          <div className="flex-1" />
          <ThemeToggle />
          <UserMenu />
        </header>
        <main className="mx-auto w-full max-w-7xl flex-1 p-4 md:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
