import { screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import CharacterList from './CharacterList'
import '@testing-library/jest-dom'
import api, { CharacterResponse } from '../services/api'
import { renderWithProviders } from '../test/utils'

vi.mock('../services/api', () => ({
  default: {
    characters: {
      getCharacters: vi.fn()
    }
  }
}))

const mockCharacters: CharacterResponse = {
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
}

describe('CharacterList', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders loading state initially', () => {
    vi.mocked(api.characters.getCharacters).mockResolvedValue(mockCharacters)
    renderWithProviders(<CharacterList />)
    expect(screen.getByRole('progressbar')).toBeInTheDocument()
  })

  it('renders characters after loading', async () => {
    vi.mocked(api.characters.getCharacters).mockResolvedValue(mockCharacters)
    renderWithProviders(<CharacterList />)

    await waitFor(() => {
      expect(screen.getByText('Luke Skywalker')).toBeInTheDocument()
      expect(screen.getByText('Darth Vader')).toBeInTheDocument()
    })
  })

  it('handles search input', async () => {
    vi.mocked(api.characters.getCharacters).mockResolvedValue(mockCharacters)
    renderWithProviders(<CharacterList />)

    // Wait for the initial data to load
    await waitFor(() => {
      expect(screen.getByText('Luke Skywalker')).toBeInTheDocument()
    })

    // Now find and interact with the search input
    const searchInput = screen.getByLabelText(/search characters/i)
    fireEvent.change(searchInput, { target: { value: 'Luke' } })

    await waitFor(() => {
      expect(api.characters.getCharacters).toHaveBeenCalledWith(expect.any(Number), 'Luke')
    })
  })

  it('handles pagination', async () => {
    vi.mocked(api.characters.getCharacters).mockResolvedValue(mockCharacters)
    renderWithProviders(<CharacterList />)

    await waitFor(() => {
      expect(screen.getByRole('navigation')).toBeInTheDocument()
    })

    const nextPageButton = screen.getByRole('button', { name: /next/i })
    fireEvent.click(nextPageButton)

    await waitFor(() => {
      expect(api.characters.getCharacters).toHaveBeenCalledWith(2, '')
    })
  })

  it('handles error state', async () => {
    vi.mocked(api.characters.getCharacters).mockRejectedValue(new Error('Failed to fetch'))
    renderWithProviders(<CharacterList />)

    await waitFor(() => {
      expect(screen.getByText('Failed to fetch')).toBeInTheDocument()
    })
  })
}) 