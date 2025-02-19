import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import StarfieldBackground from '../components/StarfieldBackground';
import '@testing-library/jest-dom';

// Mock canvas context
const mockContext = {
  fillStyle: '',
  fillRect: vi.fn(),
  beginPath: vi.fn(),
  arc: vi.fn(),
  fill: vi.fn()
} as unknown as CanvasRenderingContext2D;

// Mock canvas element
const mockCanvas = {
  getContext: () => mockContext,
  width: 1920,
  height: 1080
};

// Mock requestAnimationFrame
const mockRequestAnimationFrame = vi.fn();
const mockCancelAnimationFrame = vi.fn();

describe('StarfieldBackground', () => {
  beforeEach(() => {
    // Setup mocks
    vi.spyOn(window, 'requestAnimationFrame').mockImplementation(mockRequestAnimationFrame);
    vi.spyOn(window, 'cancelAnimationFrame').mockImplementation(mockCancelAnimationFrame);
    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockImplementation(() => mockContext);
    
    // Mock window dimensions
    Object.defineProperty(window, 'innerWidth', { value: 1920 });
    Object.defineProperty(window, 'innerHeight', { value: 1080 });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders canvas element', () => {
    render(<StarfieldBackground />);
    const canvas = screen.getByRole('img');
    expect(canvas).toBeInTheDocument();
    expect(canvas.tagName.toLowerCase()).toBe('canvas');
  });

  it('sets up canvas with correct styles', () => {
    render(<StarfieldBackground />);
    const canvas = screen.getByRole('img');
    
    expect(canvas).toHaveStyle({
      position: 'fixed',
      top: '0',
      left: '0',
      width: '100%',
      height: '100%',
      zIndex: '0',
      background: 'black'
    });
  });

  it('initializes animation frame', () => {
    render(<StarfieldBackground />);
    expect(mockRequestAnimationFrame).toHaveBeenCalled();
  });

  it('cleans up animation frame on unmount', () => {
    const { unmount } = render(<StarfieldBackground />);
    unmount();
    expect(mockCancelAnimationFrame).toHaveBeenCalled();
  });
}); 