import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  TextField, 
  Grid, 
  Pagination, 
  CircularProgress, 
  Typography, 
  Card, 
  CardContent,
  Box,
  Container,
  Paper
} from '@mui/material';
import { getCharacters } from '../services/api';
import { Character } from '../types/character';
import { debounce } from 'lodash';

const CharacterList = () => {
  const [characters, setCharacters] = useState<Character[]>([]);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const loadCharacters = useCallback(async (searchTerm: string, pageNum: number) => {
    setLoading(true);
    setError(null);
    try {
      const data = await getCharacters(pageNum, searchTerm);
      setCharacters(data.results);
      setTotalPages(Math.ceil(data.count / 10));
    } catch (err) {
      setError('Failed to load characters. Please try again later.');
    } finally {
      setLoading(false);
    }
  }, []);

  // Debounced search function
  const debouncedSearch = useCallback(
    debounce((searchTerm: string) => {
      setPage(1); // Reset to first page on search
      loadCharacters(searchTerm, 1);
    }, 300),
    [loadCharacters]
  );

  // Effect for search changes
  useEffect(() => {
    debouncedSearch(search);
    // Cleanup
    return () => {
      debouncedSearch.cancel();
    };
  }, [search, debouncedSearch]);

  // Effect for page changes
  useEffect(() => {
    if (page > 1) { // Don't trigger on initial render or search changes
      loadCharacters(search, page);
    }
  }, [page, search, loadCharacters]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearch(value);
  };

  const handleCharacterClick = (character: Character) => {
    const id = character.url.split('/')[5];
    navigate(`/character/${id}`);
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold', color: 'primary.main' }}>
          Cosmic Codex: Star Wars Characters
        </Typography>
      </Box>
      
      <Paper sx={{ p: 2, mb: 3 }}>
        <TextField
          label="Search Characters"
          value={search}
          onChange={handleSearchChange}
          fullWidth
          margin="normal"
          variant="outlined"
          autoComplete="off"
        />

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', padding: '2rem' }}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Typography color="error">{error}</Typography>
        ) : (
          <>
            <Grid container spacing={2} style={{ marginTop: '1rem' }}>
              {characters.map((char) => (
                <Grid item xs={12} sm={6} md={4} key={char.url}>
                  <Card 
                    onClick={() => handleCharacterClick(char)}
                    sx={{ 
                      cursor: 'pointer',
                      '&:hover': {
                        boxShadow: 6,
                        transform: 'translateY(-2px)',
                        transition: 'all 0.2s ease-in-out'
                      }
                    }}
                  >
                    <CardContent>
                      <Typography variant="h6">{char.name}</Typography>
                      <Typography color="textSecondary">Birth Year: {char.birth_year}</Typography>
                      <Typography color="textSecondary">Gender: {char.gender}</Typography>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
            
            <Box sx={{ display: 'flex', justifyContent: 'center', padding: '2rem' }}>
              <Pagination
                count={totalPages}
                page={page}
                onChange={(_: React.ChangeEvent<unknown>, value: number) => setPage(value)}
                color="primary"
                size="large"
              />
            </Box>
          </>
        )}
      </Paper>
    </Container>
  );
};

export default CharacterList; 