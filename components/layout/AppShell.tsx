'use client';

// =============================================================================
// App Shell — Conditionally renders sidebar for authenticated routes
// =============================================================================

import { usePathname } from 'next/navigation';
import { SessionProvider } from 'next-auth/react';
import Sidebar from './Sidebar';

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isLoginPage = pathname === '/login';

  return (
    <SessionProvider>
      {isLoginPage ? (
        <>{children}</>
      ) : (
        <div className="flex min-h-screen">
          <Sidebar />
          {/* Main content area — offset for sidebar */}
          <main className="flex-1 md:ml-[260px] pb-20 md:pb-0">
            <div className="max-w-[1600px] mx-auto p-4 md:p-6 lg:p-8">
              {children}
            </div>
          </main>
        </div>
      )}
    </SessionProvider>
  );
}
