import { describe, it, expect, vi } from 'vitest';
import { screen, waitFor, fireEvent, act } from '@testing-library/react';
import CharacterDetail from '../components/CharacterDetail';
import { renderWithProviders } from '../test/utils';
import api from '../services/api';

// Mock react-router-dom hooks
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useParams: () => ({ id: '1' }),
    useNavigate: () => vi.fn()
  };
});

// Mock the API
vi.mock('../services/api', () => ({
  default: {
    characters: {
      getCharacter: vi.fn(),
      updateCharacter: vi.fn()
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

describe('CharacterDetail', () => {
  it('renders loading state initially', () => {
    renderWithProviders(<CharacterDetail />);
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  it('renders character details after loading', async () => {
    vi.mocked(api.characters.getCharacter).mockResolvedValue(mockCharacter);
    
    await act(async () => {
      renderWithProviders(<CharacterDetail />);
    });

    await waitFor(() => {
      expect(screen.getByText('Luke Skywalker')).toBeInTheDocument();
    });

    // Check for character details
    expect(screen.getByText('172')).toBeInTheDocument();
    expect(screen.getByText('77')).toBeInTheDocument();
    expect(screen.getByText('blond')).toBeInTheDocument();
  });

  it('handles error state', async () => {
    vi.mocked(api.characters.getCharacter).mockRejectedValue(new Error('Failed to fetch'));
    
    await act(async () => {
      renderWithProviders(<CharacterDetail />);
    });

    await waitFor(() => {
      expect(screen.getByText('Failed to load character details.')).toBeInTheDocument();
    });
  });

  it('enables editing mode', async () => {
    vi.mocked(api.characters.getCharacter).mockResolvedValue(mockCharacter);
    
    await act(async () => {
      renderWithProviders(<CharacterDetail />);
    });

    await waitFor(() => {
      expect(screen.getByText('Luke Skywalker')).toBeInTheDocument();
    });

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /edit/i }));
    });

    expect(screen.getByRole('textbox', { name: /height/i })).toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: /mass/i })).toBeInTheDocument();
  });

  it('saves edited character details', async () => {
    const updatedCharacter = { ...mockCharacter, height: '175' };
    vi.mocked(api.characters.getCharacter).mockResolvedValue(mockCharacter);
    vi.mocked(api.characters.updateCharacter).mockResolvedValue(updatedCharacter);
    
    await act(async () => {
      renderWithProviders(<CharacterDetail />);
    });

    await waitFor(() => {
      expect(screen.getByText('Luke Skywalker')).toBeInTheDocument();
    });

    // Enter edit mode
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /edit/i }));
    });

    // Edit height
    await act(async () => {
      const heightInput = screen.getByRole('textbox', { name: /height/i });
      fireEvent.change(heightInput, { target: { value: '175' } });
    });

    // Save changes
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /save/i }));
    });

    // Wait for the save operation to complete and verify changes
    await waitFor(() => {
      expect(screen.getByText('175')).toBeInTheDocument();
    }, { timeout: 5000 });

    // Verify that updateCharacter was called with the correct data
    expect(api.characters.updateCharacter).toHaveBeenCalledWith('1', expect.objectContaining({
      height: '175'
    }));
  });

  it('cancels editing without saving changes', async () => {
    vi.mocked(api.characters.getCharacter).mockResolvedValue(mockCharacter);
    
    await act(async () => {
      renderWithProviders(<CharacterDetail />);
    });

    await waitFor(() => {
      expect(screen.getByText('Luke Skywalker')).toBeInTheDocument();
    });

    // Enter edit mode
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /edit/i }));
    });

    // Edit height
    await act(async () => {
      const heightInput = screen.getByRole('textbox', { name: /height/i });
      fireEvent.change(heightInput, { target: { value: '175' } });
    });

    // Cancel changes
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /cancel/i }));
    });

    // Verify original value is restored
    await waitFor(() => {
      expect(screen.getByText('172')).toBeInTheDocument();
    });
  });
});