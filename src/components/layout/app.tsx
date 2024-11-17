'use client';

import { QueryClient, QueryClientProvider } from 'react-query';
import Sidebar from '@/layout/sidebar';

export function App({ children }: { children: React.ReactNode }) {
  const queryClient = new QueryClient();

  return (
    <QueryClientProvider client={queryClient}>
      <main className='relative flex h-screen items-center'>
        <article className='space-x-4 pr-4 flex w-full items-center'>
          <Sidebar />
          <div className='w-full'>{children}</div>
        </article>
      </main>
    </QueryClientProvider>
  );
}
