import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Grid,
  Card,
  CardContent,
  Typography,
  TextField,
  Pagination,
  Box,
  CircularProgress,
  CardActionArea,
} from '@mui/material';
import { getCharacters, type Character } from '../services/api';
import { debounce } from 'lodash';

const CharacterList = () => {
  const navigate = useNavigate();
  const [characters, setCharacters] = useState<Character[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');

  const fetchCharacters = async (currentPage: number, searchQuery: string) => {
    try {
      setLoading(true);
      const data = await getCharacters(currentPage, searchQuery);
      setCharacters(data.results);
      setTotalPages(Math.ceil(data.count / 10));
    } catch (error) {
      console.error('Error fetching characters:', error);
    } finally {
      setLoading(false);
    }
  };

  const debouncedFetch = debounce((searchQuery: string) => {
    setPage(1);
    fetchCharacters(1, searchQuery);
  }, 300);

  useEffect(() => {
    fetchCharacters(page, search);
  }, [page]);

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newSearch = event.target.value;
    setSearch(newSearch);
    debouncedFetch(newSearch);
  };

  const handlePageChange = (_: React.ChangeEvent<unknown>, value: number) => {
    setPage(value);
  };

  const handleCharacterClick = (character: Character) => {
    const id = character.url.split('/').slice(-2, -1)[0];
    navigate(`/character/${id}`);
  };

  const getCharacterId = (url: string) => url.split('/').slice(-2, -1)[0];

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        Star Wars Characters
      </Typography>

      <TextField
        fullWidth
        label="Search characters"
        variant="outlined"
        value={search}
        onChange={handleSearchChange}
        sx={{ mb: 4 }}
      />

      {loading ? (
        <Box display="flex" justifyContent="center" my={4}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          <Grid container spacing={3}>
            {characters.map((character) => (
              <Grid item xs={12} sm={6} md={4} key={getCharacterId(character.url)}>
                <Card 
                  sx={{ 
                    height: '100%',
                    transition: 'transform 0.2s',
                    '&:hover': {
                      transform: 'scale(1.02)',
                    },
                  }}
                >
                  <CardActionArea onClick={() => handleCharacterClick(character)}>
                    <CardContent>
                      <Typography variant="h6" component="h2" gutterBottom>
                        {character.name}
                      </Typography>
                      <Typography color="text.secondary">
                        Birth Year: {character.birth_year}
                      </Typography>
                      <Typography color="text.secondary">
                        Gender: {character.gender}
                      </Typography>
                    </CardContent>
                  </CardActionArea>
                </Card>
              </Grid>
            ))}
          </Grid>

          <Box display="flex" justifyContent="center" mt={4}>
            <Pagination
              count={totalPages}
              page={page}
              onChange={handlePageChange}
              color="primary"
              size="large"
            />
          </Box>
        </>
      )}
    </Box>
  );
};

export default CharacterList; 