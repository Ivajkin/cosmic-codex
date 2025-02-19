import { Box, Typography, CircularProgress } from '@mui/material';
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api, { Character } from '../services/api';

const CharacterDetails = () => {
  const { id } = useParams<{ id: string }>();
  const [character, setCharacter] = useState<Character | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCharacter = async () => {
      if (!id) return;
      try {
        setLoading(true);
        const data = await api.characters.getCharacter(id);
        setCharacter(data);
      } catch (error) {
        setError('Failed to load character details.');
      } finally {
        setLoading(false);
      }
    };

    fetchCharacter();
  }, [id]);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }

  if (!character) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <Typography>No character found.</Typography>
      </Box>
    );
  }

  return (
    <Box p={3}>
      <Typography variant="h4" gutterBottom>
        {character.name}
      </Typography>
      <Box display="grid" gridTemplateColumns="auto 1fr" gap={2}>
        <Typography>Height:</Typography>
        <Typography>{character.height}</Typography>
        <Typography>Mass:</Typography>
        <Typography>{character.mass}</Typography>
        <Typography>Hair Color:</Typography>
        <Typography>{character.hair_color}</Typography>
        <Typography>Skin Color:</Typography>
        <Typography>{character.skin_color}</Typography>
        <Typography>Eye Color:</Typography>
        <Typography>{character.eye_color}</Typography>
        <Typography>Birth Year:</Typography>
        <Typography>{character.birth_year}</Typography>
        <Typography>Gender:</Typography>
        <Typography>{character.gender}</Typography>
      </Box>
    </Box>
  );
};

export default CharacterDetails; 