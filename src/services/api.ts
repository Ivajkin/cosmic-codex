import axios from 'axios';

const BASE_URL = 'https://swapi.dev/api';

export interface Character {
  name: string;
  height: string;
  mass: string;
  hair_color: string;
  skin_color: string;
  eye_color: string;
  birth_year: string;
  gender: string;
  homeworld: string;
  films: string[];
  species: string[];
  vehicles: string[];
  starships: string[];
  url: string;
}

export interface CharacterResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Character[];
}

export const getCharacters = async (page: number = 1, search: string = '') => {
  const response = await axios.get<CharacterResponse>(`${BASE_URL}/people/`, {
    params: {
      page,
      search,
    },
  });
  return response.data;
};

export const getCharacter = async (id: string) => {
  const response = await axios.get<Character>(`${BASE_URL}/people/${id}/`);
  return response.data;
};

// Local storage functions for character editing
export const saveCharacterLocally = (id: string, character: Character) => {
  localStorage.setItem(`character-${id}`, JSON.stringify(character));
};

export const getLocalCharacter = (id: string): Character | null => {
  const saved = localStorage.getItem(`character-${id}`);
  return saved ? JSON.parse(saved) : null;
}; 