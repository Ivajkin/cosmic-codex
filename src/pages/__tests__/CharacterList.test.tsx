import { render, screen, fireEvent, waitFor, RenderResult } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { vi, expect, beforeEach, describe, it } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { JSX } from 'react';
import CharacterList from '../CharacterList';
import type { Character, CharacterResponse } from '../../services/api';

const mockGetCharacters = vi.fn();

// Mock the API module
vi.mock('../../services/api', () => ({
  characters: {
    getCharacters: mockGetCharacters,
  },
}));

const mockCharacter: Character = {
  name: 'Luke Skywalker',
  height: '172',
  mass: '77',
  hair_color: 'blond',
  skin_color: 'fair',
  eye_color: 'blue',
  birth_year: '19BBY',
  gender: 'male',
  homeworld: 'https://swapi.dev/api/planets/1/',
  url: 'https://swapi.dev/api/people/1/',
};

const mockCharacters: CharacterResponse = {
  count: 82,
  next: 'https://swapi.dev/api/people/?page=2',
  previous: null,
  results: [mockCharacter],
};

const createTestQueryClient = () => new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
  },
});

const renderWithProviders = (ui: JSX.Element): RenderResult => {
  const queryClient = createTestQueryClient();
  return render(
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        {ui}
      </BrowserRouter>
    </QueryClientProvider>
  );
};

describe('CharacterList', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetCharacters.mockResolvedValue(mockCharacters);
  });

  it('renders loading state initially', async () => {
    renderWithProviders(<CharacterList />);
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  it('renders character cards after loading', async () => {
    renderWithProviders(<CharacterList />);
    await waitFor(() => {
      expect(screen.getByText('Luke Skywalker')).toBeInTheDocument();
    });
  });

  it('handles search input', async () => {
    renderWithProviders(<CharacterList />);
    const searchInput = screen.getByLabelText('Search characters');
    fireEvent.change(searchInput, { target: { value: 'Luke' } });
    await waitFor(() => {
      expect(mockGetCharacters).toHaveBeenCalledWith(1, 'Luke');
    });
  });

  it('handles error state', async () => {
    mockGetCharacters.mockRejectedValue(new Error('Failed to fetch'));
    renderWithProviders(<CharacterList />);
    await waitFor(() => {
      expect(screen.getByText('Error: Failed to fetch')).toBeInTheDocument();
    });
  });

  it('displays empty state when no characters found', async () => {
    mockGetCharacters.mockResolvedValue({ ...mockCharacters, results: [] });
    renderWithProviders(<CharacterList />);
    await waitFor(() => {
      expect(screen.getByText('No characters found')).toBeInTheDocument();
    });
  });

  it('handles pagination', async () => {
    renderWithProviders(<CharacterList />);
    
    await waitFor(() => {
      expect(screen.getByText('Luke Skywalker')).toBeInTheDocument();
    });
    
    const page2Button = screen.getByRole('button', { name: 'Go to page 2' });
    fireEvent.click(page2Button);
    
    await waitFor(() => {
      expect(mockGetCharacters).toHaveBeenCalledWith(2, '');
    });
  });
}); 