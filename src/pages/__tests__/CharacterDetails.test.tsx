import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { vi } from 'vitest';
import CharacterDetails from '../CharacterDetails';
import { getCharacter, saveCharacterLocally, getLocalCharacter } from '../../services/api';

// Mock the API module
vi.mock('../../services/api', () => ({
  getCharacter: vi.fn(),
  saveCharacterLocally: vi.fn(),
  getLocalCharacter: vi.fn(),
}));

// Mock useParams
vi.mock('react-router-dom', () => ({
  ...vi.importActual('react-router-dom'),
  useParams: () => ({ id: '1' }),
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
  films: ['https://swapi.dev/api/films/1/'],
  species: [],
  vehicles: [],
  starships: [],
  url: 'https://swapi.dev/api/people/1/',
};

const renderWithRouter = (component: React.ReactNode) => {
  return render(<BrowserRouter>{component}</BrowserRouter>);
};

describe('CharacterDetails', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (getCharacter as jest.Mock).mockResolvedValue(mockCharacter);
    (getLocalCharacter as jest.Mock).mockReturnValue(null);
  });

  it('renders loading state initially', () => {
    renderWithRouter(<CharacterDetails />);
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  it('renders character details after loading', async () => {
    renderWithRouter(<CharacterDetails />);
    
    await waitFor(() => {
      expect(screen.getByText('Luke Skywalker')).toBeInTheDocument();
    });
    
    expect(screen.getByLabelText('Name')).toHaveValue('Luke Skywalker');
    expect(screen.getByLabelText('Birth Year')).toHaveValue('19BBY');
    expect(screen.getByLabelText('Height')).toHaveValue('172');
  });

  it('handles input changes', async () => {
    renderWithRouter(<CharacterDetails />);
    
    await waitFor(() => {
      expect(screen.getByText('Luke Skywalker')).toBeInTheDocument();
    });
    
    const nameInput = screen.getByLabelText('Name');
    fireEvent.change(nameInput, { target: { value: 'Luke Skywalker Jr.' } });
    
    expect(nameInput).toHaveValue('Luke Skywalker Jr.');
  });

  it('saves changes locally', async () => {
    renderWithRouter(<CharacterDetails />);
    
    await waitFor(() => {
      expect(screen.getByText('Luke Skywalker')).toBeInTheDocument();
    });
    
    const nameInput = screen.getByLabelText('Name');
    fireEvent.change(nameInput, { target: { value: 'Luke Skywalker Jr.' } });
    
    const saveButton = screen.getByText('Save Changes');
    fireEvent.click(saveButton);
    
    await waitFor(() => {
      expect(saveCharacterLocally).toHaveBeenCalledWith('1', {
        ...mockCharacter,
        name: 'Luke Skywalker Jr.',
      });
    });
    
    expect(screen.getByText('Changes saved successfully!')).toBeInTheDocument();
  });

  it('loads locally saved data if available', async () => {
    const localCharacter = { ...mockCharacter, name: 'Local Luke' };
    (getLocalCharacter as jest.Mock).mockReturnValue(localCharacter);
    
    renderWithRouter(<CharacterDetails />);
    
    await waitFor(() => {
      expect(screen.getByText('Local Luke')).toBeInTheDocument();
    });
    
    expect(screen.getByLabelText('Name')).toHaveValue('Local Luke');
  });
}); 