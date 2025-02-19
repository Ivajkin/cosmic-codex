import React from 'react';
import { render, type RenderResult } from '@testing-library/react';
import type { RenderOptions } from '@testing-library/react';
import { QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import { queryClient } from './setup';

function TestProviders({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        {children}
      </BrowserRouter>
    </QueryClientProvider>
  );
}

function renderWithProviders(
  ui: React.ReactElement,
  options: Omit<RenderOptions, 'wrapper'> = {}
): RenderResult {
  return render(ui, {
    wrapper: TestProviders,
    ...options,
  }) as RenderResult;
}

export { renderWithProviders }; 