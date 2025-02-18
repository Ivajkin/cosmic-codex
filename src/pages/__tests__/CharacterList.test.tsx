import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { vi } from 'vitest';
import CharacterList from '../CharacterList';
import { getCharacters } from '../../services/api';

// Mock the API module
vi.mock('../../services/api', () => ({
  getCharacters: vi.fn(),
}));

const mockCharacters = {
  count: 82,
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
      films: ['https://swapi.dev/api/films/1/'],
      species: [],
      vehicles: [],
      starships: [],
      url: 'https://swapi.dev/api/people/1/',
    },
  ],
};

const renderWithRouter = (component: React.ReactNode) => {
  return render(<BrowserRouter>{component}</BrowserRouter>);
};

describe('CharacterList', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (getCharacters as jest.Mock).mockResolvedValue(mockCharacters);
  });

  it('renders loading state initially', () => {
    renderWithRouter(<CharacterList />);
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  it('renders character cards after loading', async () => {
    renderWithRouter(<CharacterList />);
    
    await waitFor(() => {
      expect(screen.getByText('Luke Skywalker')).toBeInTheDocument();
    });
    
    expect(screen.getByText('Birth Year: 19BBY')).toBeInTheDocument();
    expect(screen.getByText('Gender: male')).toBeInTheDocument();
  });

  it('handles search input', async () => {
    renderWithRouter(<CharacterList />);
    
    const searchInput = screen.getByLabelText('Search characters');
    fireEvent.change(searchInput, { target: { value: 'Luke' } });
    
    await waitFor(() => {
      expect(getCharacters).toHaveBeenCalledWith(1, 'Luke');
    });
  });

  it('handles pagination', async () => {
    renderWithRouter(<CharacterList />);
    
    await waitFor(() => {
      expect(screen.getByText('Luke Skywalker')).toBeInTheDocument();
    });
    
    const page2Button = screen.getByRole('button', { name: 'Go to page 2' });
    fireEvent.click(page2Button);
    
    await waitFor(() => {
      expect(getCharacters).toHaveBeenCalledWith(2, '');
    });
  });
}); 