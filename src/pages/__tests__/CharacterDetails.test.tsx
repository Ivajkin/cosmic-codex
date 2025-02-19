import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter as Router, Routes, Route } from 'react-router-dom';
import { vi } from 'vitest';
import CharacterDetails from '../CharacterDetails';
import api from '../../services/api';

vi.mock('../../services/api', () => ({
  default: {
    characters: {
      getCharacter: vi.fn()
    },
    localStorage: {
      saveCharacter: vi.fn(),
      getCharacter: vi.fn()
    }
  }
}));

const mockCharacter = {
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
};

describe('CharacterDetails', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders loading state initially', () => {
    vi.mocked(api.characters.getCharacter).mockResolvedValue(mockCharacter);
    render(
      <Router initialEntries={['/character/1']}>
        <Routes>
          <Route path="/character/:id" element={<CharacterDetails />} />
        </Routes>
      </Router>
    );
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  it('renders character details after loading', async () => {
    vi.mocked(api.characters.getCharacter).mockResolvedValue(mockCharacter);
    render(
      <Router initialEntries={['/character/1']}>
        <Routes>
          <Route path="/character/:id" element={<CharacterDetails />} />
        </Routes>
      </Router>
    );

    await waitFor(() => {
      expect(screen.getByText('Luke Skywalker')).toBeInTheDocument();
    });
  });

  it('handles error state', async () => {
    vi.mocked(api.characters.getCharacter).mockRejectedValue(new Error('Failed to fetch'));
    render(
      <Router initialEntries={['/character/1']}>
        <Routes>
          <Route path="/character/:id" element={<CharacterDetails />} />
        </Routes>
      </Router>
    );

    await waitFor(() => {
      expect(screen.getByText(/failed to load character/i)).toBeInTheDocument();
    });
  });
}); 