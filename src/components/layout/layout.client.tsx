'use client'

import { useState } from 'react';
import Sidebar from '@/components/layout/sidebar';
import { QueryClient, QueryClientProvider } from 'react-query';

export default function RootLayoutClient({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(true);
  const [queryClient] = useState(() => new QueryClient());

  const toggleSidebar = () => {
    setIsSidebarExpanded(!isSidebarExpanded);
  };

  return (
    <QueryClientProvider client={queryClient}>
      <>
        { /*<Header onToggleSidebar={toggleSidebar} />*/}
        <div className="flex-1 flex mr-2 py-2">
          <Sidebar isExpanded={isSidebarExpanded} onToggle={toggleSidebar} />
          <main className="flex-1 px-0 overflow-auto transition-all duration-300 ease-in-out">
            {children}
          </main>
        </div>
      </>
    </QueryClientProvider>
  );
}
