import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import CharacterList from './CharacterList'
import '@testing-library/jest-dom'
import { fetchCharacters } from '../services/api'

vi.mock('../services/api')
const mockFetchCharacters = fetchCharacters as ReturnType<typeof vi.fn>

const mockCharacters = {
  count: 2,
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
      url: 'http://swapi.dev/api/people/1/',
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
      url: 'http://swapi.dev/api/people/4/',
    },
  ],
}

describe('CharacterList', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockFetchCharacters.mockResolvedValue(mockCharacters)
  })

  it('renders character list and handles search', async () => {
    render(
      <BrowserRouter>
        <CharacterList />
      </BrowserRouter>
    )

    // Check if loading state is shown
    expect(screen.getByRole('progressbar')).toBeInTheDocument()

    // Wait for characters to load
    await waitFor(() => {
      expect(screen.getByText('Luke Skywalker')).toBeInTheDocument()
    })

    // Check if both characters are rendered
    expect(screen.getByText('Luke Skywalker')).toBeInTheDocument()
    expect(screen.getByText('Darth Vader')).toBeInTheDocument()

    // Test search functionality
    const searchInput = screen.getByLabelText('Search Characters')
    fireEvent.change(searchInput, { target: { value: 'Luke' } })

    // Verify that the API was called with search parameter
    await waitFor(() => {
      expect(mockFetchCharacters).toHaveBeenCalledWith(1, 'Luke')
    })
  })

  it('handles API error gracefully', async () => {
    mockFetchCharacters.mockRejectedValue(new Error('API Error'))

    render(
      <BrowserRouter>
        <CharacterList />
      </BrowserRouter>
    )

    await waitFor(() => {
      expect(screen.getByText('Failed to load characters.')).toBeInTheDocument()
    })
  })

  it('handles pagination', async () => {
    render(
      <BrowserRouter>
        <CharacterList />
      </BrowserRouter>
    )

    await waitFor(() => {
      expect(screen.getByText('Luke Skywalker')).toBeInTheDocument()
    })

    // Find and click the next page button
    const nextPageButton = screen.getByRole('button', { name: /go to page 2/i })
    fireEvent.click(nextPageButton)

    // Verify that the API was called with page 2
    await waitFor(() => {
      expect(mockFetchCharacters).toHaveBeenCalledWith(2, '')
    })
  })
}) 