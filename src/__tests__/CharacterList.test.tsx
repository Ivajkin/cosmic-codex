import { describe, it, expect, vi } from 'vitest';
import { screen, waitFor, fireEvent } from '@testing-library/react';
import CharacterList from '../components/CharacterList';
import { renderWithProviders } from '../test/utils';
import { queryClient } from '../test/setup';

describe('CharacterList', () => {
  it('renders loading state initially', () => {
    renderWithProviders(<CharacterList />);
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  it('renders characters after loading', async () => {
    const mockData = {
      count: 1,
      next: null,
      previous: null,
      results: [
        {
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
        },
      ],
    };

    // Mock the successful query
    vi.spyOn(queryClient, 'fetchQuery').mockResolvedValueOnce(mockData);

    renderWithProviders(<CharacterList />);

    await waitFor(() => {
      expect(screen.getByText('Luke Skywalker')).toBeInTheDocument();
    });
  });

  it('handles search input', async () => {
    renderWithProviders(<CharacterList />);

    const searchInput = screen.getByPlaceholderText('Search characters...');
    fireEvent.change(searchInput, { target: { value: 'Luke' } });

    await waitFor(() => {
      expect(searchInput).toHaveValue('Luke');
    });
  });

  it('handles pagination', async () => {
    const mockData = {
      count: 2,
      next: 'https://swapi.dev/api/people/?page=2',
      previous: null,
      results: [
        {
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
        },
      ],
    };

    // Mock the successful query
    vi.spyOn(queryClient, 'fetchQuery').mockResolvedValueOnce(mockData);

    renderWithProviders(<CharacterList />);

    await waitFor(() => {
      expect(screen.getByText('Luke Skywalker')).toBeInTheDocument();
    });
  });

  it('handles error state', async () => {
    // Mock the failed query
    vi.spyOn(queryClient, 'fetchQuery').mockRejectedValueOnce(new Error('Failed to fetch'));

    renderWithProviders(<CharacterList />);

    await waitFor(() => {
      expect(screen.getByText('Failed to fetch')).toBeInTheDocument();
    });
  });

  it('displays empty state when no characters found', async () => {
    const mockData = {
      count: 0,
      next: null,
      previous: null,
      results: [],
    };

    // Mock the successful query with empty results
    vi.spyOn(queryClient, 'fetchQuery').mockResolvedValueOnce(mockData);

    renderWithProviders(<CharacterList />);

    await waitFor(() => {
      expect(screen.getByText('No characters found')).toBeInTheDocument();
    });
  });
});