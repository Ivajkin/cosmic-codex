import { describe, it, expect, vi } from 'vitest';
import { screen, waitFor, fireEvent, act } from '@testing-library/react';
import CharacterDetail from '../components/CharacterDetail';
import { renderWithProviders } from '../test/utils';
import api from '../services/api';
import { LocalStorageService } from '../services/localStorage';

// Mock react-router-dom hooks
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useParams: () => ({ id: '1' }),
    useNavigate: () => vi.fn()
  };
});

// Mock the API and LocalStorageService
vi.mock('../services/api', () => ({
  default: {
    characters: {
      getCharacter: vi.fn(),
      updateCharacter: vi.fn()
    }
  }
}));

vi.mock('../services/localStorage', () => ({
  LocalStorageService: {
    getCharacter: vi.fn(),
    saveCharacter: vi.fn()
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

describe('CharacterDetail', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(LocalStorageService.getCharacter).mockReturnValue(null);
  });

  it('renders loading state initially', () => {
    vi.mocked(api.characters.getCharacter).mockResolvedValue(mockCharacter);
    renderWithProviders(<CharacterDetail />);
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  it('renders character details after loading', async () => {
    vi.mocked(api.characters.getCharacter).mockResolvedValue(mockCharacter);
    
    renderWithProviders(<CharacterDetail />);

    await waitFor(() => {
      expect(screen.getByText('Luke Skywalker')).toBeInTheDocument();
    });

    // Check for character details
    expect(screen.getByText('Height: 172')).toBeInTheDocument();
    expect(screen.getByText('Mass: 77')).toBeInTheDocument();
    expect(screen.getByText('Hair Color: blond')).toBeInTheDocument();
  });

  it('handles error state', async () => {
    vi.mocked(api.characters.getCharacter).mockRejectedValue(new Error('Failed to fetch'));
    
    renderWithProviders(<CharacterDetail />);

    await waitFor(() => {
      expect(screen.getByText('Failed to load character details.')).toBeInTheDocument();
    });
  });

  it('enables editing mode', async () => {
    vi.mocked(api.characters.getCharacter).mockResolvedValue(mockCharacter);
    
    renderWithProviders(<CharacterDetail />);

    await waitFor(() => {
      expect(screen.getByText('Luke Skywalker')).toBeInTheDocument();
    });

    const editButton = screen.getByRole('button', { name: /edit/i });
    await act(async () => {
      fireEvent.click(editButton);
    });

    expect(screen.getByRole('textbox', { name: /height/i })).toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: /mass/i })).toBeInTheDocument();
  });

  it('saves edited character details', async () => {
    vi.mocked(api.characters.getCharacter).mockResolvedValue(mockCharacter);
    
    renderWithProviders(<CharacterDetail />);

    await waitFor(() => {
      expect(screen.getByText('Luke Skywalker')).toBeInTheDocument();
    });

    // Enter edit mode
    const editButton = screen.getByRole('button', { name: /edit/i });
    await act(async () => {
      fireEvent.click(editButton);
    });

    // Edit height
    const heightInput = screen.getByRole('textbox', { name: /height/i });
    await act(async () => {
      fireEvent.change(heightInput, { target: { value: '175' } });
    });

    // Save changes
    const saveButton = screen.getByRole('button', { name: /save/i });
    await act(async () => {
      fireEvent.click(saveButton);
    });

    // Verify that LocalStorageService.saveCharacter was called
    expect(LocalStorageService.saveCharacter).toHaveBeenCalledWith('1', expect.objectContaining({
      height: '175'
    }));

    // Verify changes are displayed
    await waitFor(() => {
      expect(screen.getByText('Height: 175')).toBeInTheDocument();
    });
  });

  it('cancels editing without saving changes', async () => {
    vi.mocked(api.characters.getCharacter).mockResolvedValue(mockCharacter);
    
    renderWithProviders(<CharacterDetail />);

    await waitFor(() => {
      expect(screen.getByText('Luke Skywalker')).toBeInTheDocument();
    });

    // Enter edit mode
    const editButton = screen.getByRole('button', { name: /edit/i });
    await act(async () => {
      fireEvent.click(editButton);
    });

    // Edit height
    const heightInput = screen.getByRole('textbox', { name: /height/i });
    await act(async () => {
      fireEvent.change(heightInput, { target: { value: '175' } });
    });

    // Cancel changes
    const cancelButton = screen.getByRole('button', { name: /cancel/i });
    await act(async () => {
      fireEvent.click(cancelButton);
    });

    // Verify original value is restored
    await waitFor(() => {
      expect(screen.getByText('Height: 172')).toBeInTheDocument();
    });
  });
});