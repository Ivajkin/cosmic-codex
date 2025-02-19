import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  TextField,
  Pagination,
  Box,
  CircularProgress,
} from '@mui/material';
import api, { type Character } from '../services/api';

console.log('CharacterList: Component loaded');

export default function CharacterList() {
  console.log('CharacterList: Component rendering');
  
  const navigate = useNavigate();
  const [characters, setCharacters] = useState<Character[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');

  useEffect(() => {
    console.log('CharacterList: useEffect triggered', { page, search });
    
    const fetchCharacters = async () => {
      try {
        console.log('CharacterList: Fetching characters...');
        setLoading(true);
        const data = await api.characters.getCharacters(page, search);
        console.log('CharacterList: Characters fetched', { 
          count: data.results.length,
          totalResults: data.count
        });
        setCharacters(data.results);
        setTotalPages(Math.ceil(data.count / 10));
      } catch (err) {
        console.error('CharacterList: Error fetching characters', err);
        setError('Failed to load characters');
      } finally {
        console.log('CharacterList: Setting loading to false');
        setLoading(false);
      }
    };

    fetchCharacters();
  }, [page, search]);

  console.log('CharacterList: Current render state', { 
    loading, 
    error, 
    charactersCount: characters.length,
    hasDataTestId: document.querySelector('[data-testid="character-list"]') !== null
  });

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <TextField
        fullWidth
        label="Search characters"
        variant="outlined"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        sx={{ mb: 4 }}
      />

      <Grid container spacing={3} data-testid="character-list">
        {characters.map((character) => (
          <Grid item xs={12} sm={6} md={4} key={character.url}>
            <Card
              data-testid="character-card"
              onClick={() => navigate(`/character/${character.url.split('/').filter(Boolean).pop()}`)}
              sx={{ 
                cursor: 'pointer',
                transition: 'transform 0.2s',
                '&:hover': { transform: 'scale(1.02)' }
              }}
            >
              <CardContent>
                <Typography variant="h6" data-testid="character-name">
                  {character.name}
                </Typography>
                <Typography color="text.secondary">
                  Birth Year: {character.birth_year}
                </Typography>
                <Typography color="text.secondary">
                  Gender: {character.gender}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Box display="flex" justifyContent="center" mt={4}>
        <Pagination
          count={totalPages}
          page={page}
          onChange={(_, value) => setPage(value)}
          color="primary"
        />
      </Box>
    </Container>
  );
} 