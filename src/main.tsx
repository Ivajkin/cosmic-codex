import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import './index.css'
import App from './App.tsx'

console.log('main.tsx: Starting application initialization');

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // Consider data fresh for 5 minutes
      gcTime: 1000 * 60 * 60, // Keep unused data in cache for 1 hour
      refetchOnWindowFocus: false, // Disable automatic refetch on window focus
      retry: 1, // Only retry failed requests once
    },
  },
});

const rootElement = document.getElementById('root');
if (!rootElement) {
  console.error('main.tsx: Failed to find root element');
} else {
  console.log('main.tsx: Found root element, creating React root');
  try {
    const root = createRoot(rootElement);
    console.log('main.tsx: Created React root, attempting to render App');
    root.render(
      <StrictMode>
        <QueryClientProvider client={queryClient}>
          <App />
          <ReactQueryDevtools initialIsOpen={false} />
        </QueryClientProvider>
      </StrictMode>,
    );
    console.log('main.tsx: Initial render complete');
  } catch (error) {
    console.error('main.tsx: Error during application initialization:', error);
  }
}
