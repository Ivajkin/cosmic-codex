import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter as Router, Routes, Route } from 'react-router-dom';
import { vi } from 'vitest';
import CharacterDetail from '../components/CharacterDetail';
import api, { Character } from '../services/api';

vi.mock('../services/api', () => ({
  default: {
    characters: {
      getCharacter: vi.fn()
    }
  }
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
  url: 'https://swapi.dev/api/people/1/'
};

describe('CharacterDetail', () => {
  const id = '1';

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders loading state initially', () => {
    render(
      <Router initialEntries={[`/character/${id}`]}>
        <Routes>
          <Route path="/character/:id" element={<CharacterDetail />} />
        </Routes>
      </Router>
    );

    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  it('renders character details after loading', async () => {
    vi.mocked(api.characters.getCharacter).mockResolvedValue(mockCharacter);

    render(
      <Router initialEntries={[`/character/${id}`]}>
        <Routes>
          <Route path="/character/:id" element={<CharacterDetail />} />
        </Routes>
      </Router>
    );

    await waitFor(() => {
      expect(screen.getByText('Luke Skywalker')).toBeInTheDocument();
    });

    expect(screen.getByText('Height: 172')).toBeInTheDocument();
    expect(screen.getByText('Mass: 77')).toBeInTheDocument();
  });

  it('handles error state', async () => {
    vi.mocked(api.characters.getCharacter).mockRejectedValue(new Error('Failed to fetch'));

    render(
      <Router initialEntries={[`/character/${id}`]}>
        <Routes>
          <Route path="/character/:id" element={<CharacterDetail />} />
        </Routes>
      </Router>
    );

    await waitFor(() => {
      expect(screen.getByText(/failed to load character/i)).toBeInTheDocument();
    });
  });
});