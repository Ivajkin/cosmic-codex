import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import CharacterList from '../components/CharacterList';
import * as api from '../services/api';

// Mock the api module
vi.mock('../services/api');

const mockCharacters = {
  count: 82,
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
      url: 'https://swapi.dev/api/people/1/'
    },
    {
      name: 'Darth Vader',
      height: '202',
      mass: '136',
      hair_color: 'none',
      skin_color: 'white',
      eye_color: 'yellow',
      birth_year: '41.9BBY',
      gender: 'male',
      homeworld: 'https://swapi.dev/api/planets/1/',
      url: 'https://swapi.dev/api/people/4/'
    }
  ]
};

const renderWithRouter = (component: React.ReactNode) => {
  return render(<BrowserRouter>{component}</BrowserRouter>);
};

describe('CharacterList', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders loading state initially', () => {
    vi.mocked(api.fetchCharacters).mockResolvedValue(mockCharacters);
    renderWithRouter(<CharacterList />);
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  it('renders characters after loading', async () => {
    vi.mocked(api.fetchCharacters).mockResolvedValue(mockCharacters);
    renderWithRouter(<CharacterList />);

    await waitFor(() => {
      expect(screen.getByText('Luke Skywalker')).toBeInTheDocument();
      expect(screen.getByText('Darth Vader')).toBeInTheDocument();
    });
  });

  it('handles search input', async () => {
    vi.mocked(api.fetchCharacters).mockResolvedValue(mockCharacters);
    renderWithRouter(<CharacterList />);

    const searchInput = screen.getByLabelText('Search Characters');
    fireEvent.change(searchInput, { target: { value: 'Luke' } });

    await waitFor(() => {
      expect(api.fetchCharacters).toHaveBeenCalledWith(1, 'Luke');
    });
  });

  it('handles pagination', async () => {
    vi.mocked(api.fetchCharacters).mockResolvedValue(mockCharacters);
    renderWithRouter(<CharacterList />);

    await waitFor(() => {
      const pagination = screen.getByRole('navigation');
      expect(pagination).toBeInTheDocument();
    });

    const page2Button = screen.getByRole('button', { name: '2' });
    fireEvent.click(page2Button);

    await waitFor(() => {
      expect(api.fetchCharacters).toHaveBeenCalledWith(2, '');
    });
  });

  it('handles error state', async () => {
    vi.mocked(api.fetchCharacters).mockRejectedValue(new Error('Failed to fetch'));
    renderWithRouter(<CharacterList />);

    await waitFor(() => {
      expect(screen.getByText('Failed to load characters. Please try again later.')).toBeInTheDocument();
    });
  });
});