import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import CharacterDetail from '../components/CharacterDetail';
import * as api from '../services/api';

// Mock the api module
vi.mock('../services/api');

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

const renderWithRouter = (id: string) => {
  return render(
    <BrowserRouter>
      <Routes>
        <Route path="/character/:id" element={<CharacterDetail />} />
      </Routes>
    </BrowserRouter>,
    { initialEntries: [`/character/${id}`] }
  );
};

describe('CharacterDetail', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it('renders loading state initially', () => {
    vi.mocked(api.fetchCharacterById).mockResolvedValue(mockCharacter);
    renderWithRouter('1');
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  it('renders character details after loading', async () => {
    vi.mocked(api.fetchCharacterById).mockResolvedValue(mockCharacter);
    renderWithRouter('1');

    await waitFor(() => {
      expect(screen.getByText('Luke Skywalker')).toBeInTheDocument();
      expect(screen.getByText('Birth Year: 19BBY')).toBeInTheDocument();
    });
  });

  it('enables editing mode', async () => {
    vi.mocked(api.fetchCharacterById).mockResolvedValue(mockCharacter);
    renderWithRouter('1');

    await waitFor(() => {
      expect(screen.getByText('Luke Skywalker')).toBeInTheDocument();
    });

    const editButton = screen.getByText('Edit');
    fireEvent.click(editButton);

    expect(screen.getByDisplayValue('Luke Skywalker')).toBeInTheDocument();
    expect(screen.getByText('Save')).toBeInTheDocument();
    expect(screen.getByText('Cancel')).toBeInTheDocument();
  });

  it('saves edited character data locally', async () => {
    vi.mocked(api.fetchCharacterById).mockResolvedValue(mockCharacter);
    renderWithRouter('1');

    await waitFor(() => {
      expect(screen.getByText('Luke Skywalker')).toBeInTheDocument();
    });

    // Enter edit mode
    fireEvent.click(screen.getByText('Edit'));

    // Edit the name
    const nameInput = screen.getByDisplayValue('Luke Skywalker');
    fireEvent.change(nameInput, { target: { value: 'Luke Skywalker Jr.' } });

    // Save changes
    fireEvent.click(screen.getByText('Save'));

    // Verify changes are saved
    expect(screen.getByText('Luke Skywalker Jr.')).toBeInTheDocument();

    // Verify data is saved to localStorage
    const savedData = JSON.parse(localStorage.getItem('character_1') || '');
    expect(savedData.name).toBe('Luke Skywalker Jr.');
  });

  it('handles error state', async () => {
    vi.mocked(api.fetchCharacterById).mockRejectedValue(new Error('Failed to fetch'));
    renderWithRouter('1');

    await waitFor(() => {
      expect(screen.getByText('Failed to load character details.')).toBeInTheDocument();
    });
  });
});