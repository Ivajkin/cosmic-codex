import { Character } from '../types';

export const LocalStorageService = {
  getCharacter: (id: string): Character | null => {
    const data = localStorage.getItem(`character_${id}`);
    return data ? JSON.parse(data) : null;
  },

  saveCharacter: (id: string, character: Character): void => {
    localStorage.setItem(`character_${id}`, JSON.stringify(character));
  }
}; 