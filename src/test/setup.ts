import '@testing-library/jest-dom';
import { expect, afterEach, vi } from 'vitest';
import { cleanup } from '@testing-library/react';
import * as matchers from '@testing-library/jest-dom/matchers';
import { QueryClient } from '@tanstack/react-query';

// Extend Vitest's expect method with methods from react-testing-library
expect.extend(matchers);

// Create a new QueryClient instance for tests
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
  },
});

// Runs a cleanup after each test case
afterEach(() => {
  cleanup();
  queryClient.clear();
});

// Mock canvas
const mockContext = {
  beginPath: vi.fn(),
  arc: vi.fn(),
  fillStyle: '',
  fill: vi.fn(),
  canvas: document.createElement('canvas'),
  getContextAttributes: vi.fn(),
  globalAlpha: 1,
  globalCompositeOperation: 'source-over',
  // Add other required properties with default values
  save: vi.fn(),
  restore: vi.fn(),
  scale: vi.fn(),
  rotate: vi.fn(),
  translate: vi.fn(),
  transform: vi.fn(),
  setTransform: vi.fn(),
  resetTransform: vi.fn(),
  createLinearGradient: vi.fn(),
  createRadialGradient: vi.fn(),
  createPattern: vi.fn(),
  clearRect: vi.fn(),
  fillRect: vi.fn(),
  strokeRect: vi.fn(),
  fillText: vi.fn(),
  strokeText: vi.fn(),
  measureText: vi.fn(),
  drawImage: vi.fn(),
  createImageData: vi.fn(),
  getImageData: vi.fn(),
  putImageData: vi.fn(),
  setLineDash: vi.fn(),
  getLineDash: vi.fn(),
  closePath: vi.fn(),
  moveTo: vi.fn(),
  lineTo: vi.fn(),
  quadraticCurveTo: vi.fn(),
  bezierCurveTo: vi.fn(),
  rect: vi.fn(),
  stroke: vi.fn(),
  clip: vi.fn(),
  isPointInPath: vi.fn(),
  isPointInStroke: vi.fn(),
} as unknown as CanvasRenderingContext2D;

// Mock getContext to return our mock context
HTMLCanvasElement.prototype.getContext = function(
  contextId: '2d' | 'bitmaprenderer' | 'webgl' | 'webgl2',
  options?: CanvasRenderingContext2DSettings | ImageBitmapRenderingContextSettings | WebGLContextAttributes
) {
  if (contextId === '2d') return mockContext;
  return null;
} as typeof HTMLCanvasElement.prototype.getContext;

// Mock ResizeObserver
global.ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
} as unknown as typeof ResizeObserver;

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Mock IntersectionObserver
global.IntersectionObserver = class IntersectionObserver {
  readonly root: Element | null = null;
  readonly rootMargin: string = '0px';
  readonly thresholds: ReadonlyArray<number> = [0];
  
  constructor(callback: IntersectionObserverCallback, options?: IntersectionObserverInit) {}
  
  observe() {}
  unobserve() {}
  disconnect() {}
  takeRecords(): IntersectionObserverEntry[] { return []; }
} as unknown as typeof IntersectionObserver;
