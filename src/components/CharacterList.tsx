import { useState, useCallback, useMemo, useRef, useEffect } from 'react';
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
import { useQuery, useQueryClient } from '@tanstack/react-query';
import api, { type Character } from '../services/api';
import { debounce } from 'lodash';

interface QueryResult {
  characters: Character[];
  totalPages: number;
}

type DebouncedFunction = ReturnType<typeof debounce> & {
  cancel: () => void;
};

const CharacterListComponent = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const debouncedSearchRef = useRef<DebouncedFunction | null>(null);
  
  // Initialize debounced search
  useEffect(() => {
    debouncedSearchRef.current = debounce((value: string) => {
      setSearch(value);
      setPage(1);
    }, 500);

    return () => {
      if (debouncedSearchRef.current) {
        debouncedSearchRef.current.cancel();
        debouncedSearchRef.current = null;
      }
    };
  }, []);

  // React Query hook for fetching characters
  const { data = { characters: [], totalPages: 0 }, isLoading, isError, error } = useQuery<QueryResult, Error>({
    queryKey: ['characters', search, page],
    queryFn: async (): Promise<QueryResult> => {
      const response = await api.characters.getCharacters(page, search);
      return {
        characters: response.results,
        totalPages: Math.ceil(response.count / 10)
      };
    }
  });

  // Prefetch next page
  useEffect(() => {
    if (data?.totalPages && page < data.totalPages) {
      const nextPage = page + 1;
      queryClient.prefetchQuery<QueryResult, Error>({
        queryKey: ['characters', search, nextPage],
        queryFn: async (): Promise<QueryResult> => {
          const response = await api.characters.getCharacters(nextPage, search);
          return {
            characters: response.results,
            totalPages: Math.ceil(response.count / 10)
          };
        }
      });
    }
  }, [page, search, data?.totalPages, queryClient]);

  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (debouncedSearchRef.current) {
      debouncedSearchRef.current(e.target.value);
    }
  }, []);

  const handlePageChange = useCallback((_: unknown, value: number) => {
    setPage(value);
  }, []);

  const handleCharacterClick = useCallback((character: Character) => {
    const id = character.url.split('/').filter(Boolean).pop();
    navigate(`/character/${id}`);
  }, [navigate]);

  const searchField = useMemo(() => (
    <TextField
      inputRef={searchInputRef}
      label="Search characters"
      placeholder="Search characters..."
      variant="outlined"
      onChange={handleSearchChange}
      inputProps={{
        'data-testid': 'search-input'
      }}
      sx={{ 
        mb: 4,
        '& .MuiOutlinedInput-root': {
          color: 'rgba(255, 255, 255, 0.9)',
          background: 'rgba(0, 0, 0, 0.3)',
          backdropFilter: 'blur(10px)',
          borderRadius: 2,
          '& fieldset': {
            borderColor: 'rgba(255, 255, 255, 0.1)',
          },
          '&:hover fieldset': {
            borderColor: 'rgba(255, 232, 12, 0.3)',
          },
          '&.Mui-focused fieldset': {
            borderColor: 'rgba(255, 232, 12, 0.5)',
          },
        },
        '& .MuiInputLabel-root': {
          color: 'rgba(255, 255, 255, 0.7)',
          '&.Mui-focused': {
            color: 'primary.light',
          },
        },
        '& .MuiOutlinedInput-input': {
          '&::placeholder': {
            color: 'rgba(255, 255, 255, 0.5)',
          },
        },
      }}
      fullWidth
    />
  ), [handleSearchChange]);

  const loadingSpinner = useMemo(() => (
    <Box 
      sx={{ 
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.3)',
        zIndex: 1
      }}
    >
      <CircularProgress />
    </Box>
  ), []);

  if (isLoading && !data?.characters?.length) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress />
      </Box>
    );
  }

  if (isError && error instanceof Error) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <Typography color="error">
          Failed to fetch
        </Typography>
      </Box>
    );
  }

  return (
    <Container 
      sx={{ 
        py: 4,
        px: { xs: 2, sm: 3, md: 4 },
        maxWidth: '100%',
        boxSizing: 'border-box'
      }}
    >
      <Box 
        sx={{ 
          mb: 4, 
          width: '100%',
          maxWidth: '1200px',
          mx: 'auto'
        }}
      >
        <Typography 
          variant="h4" 
          gutterBottom 
          sx={{ 
            fontWeight: 'bold', 
            color: 'primary.main',
            textAlign: { xs: 'center', sm: 'left' }
          }}
        >
          Cosmic Codex: Star Wars Characters
        </Typography>
      </Box>
      
      <Paper 
        sx={{ 
          p: { xs: 2, sm: 3 }, 
          mb: 3, 
          background: 'rgba(0, 0, 0, 0.3)',
          backdropFilter: 'blur(10px)',
          borderRadius: 2,
          border: '1px solid rgba(255, 255, 255, 0.1)',
          maxWidth: '1200px',
          mx: 'auto',
          position: 'relative'
        }}
      >
        {searchField}

        <Box sx={{ position: 'relative' }} data-testid="character-list">
          {isLoading && loadingSpinner}

          <Box 
            sx={{ 
              display: 'grid',
              gridTemplateColumns: {
                xs: '1fr',
                sm: 'repeat(2, 1fr)',
                md: 'repeat(3, 1fr)',
                lg: 'repeat(4, 1fr)'
              },
              gap: { xs: 2, sm: 3 },
              width: '100%'
            }}
          >
            {data?.characters?.length === 0 ? (
              <Box sx={{ gridColumn: '1/-1', textAlign: 'center', py: 4 }}>
                <Typography variant="h6" color="text.secondary">
                  No characters found
                </Typography>
              </Box>
            ) : (
              data?.characters?.map((char) => (
                <Card 
                  key={char.url}
                  onClick={() => handleCharacterClick(char)}
                  data-testid="character-card"
                  sx={{ 
                    cursor: 'pointer',
                    height: '100%',
                    minHeight: '160px',
                    display: 'flex',
                    flexDirection: 'column',
                    background: 'rgba(0, 0, 0, 0.5)',
                    backdropFilter: 'blur(10px)',
                    borderRadius: 2,
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    transition: 'all 0.3s ease-in-out',
                    '&:hover': {
                      transform: 'translateY(-4px) scale(1.02)',
                      boxShadow: '0 8px 20px rgba(0, 0, 0, 0.4)',
                      background: 'rgba(0, 0, 0, 0.6)',
                      borderColor: 'rgba(255, 232, 12, 0.3)'
                    }
                  }}
                >
                  <CardContent 
                    sx={{ 
                      flexGrow: 1, 
                      p: { xs: 1.5, sm: 2 },
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      gap: 2
                    }}
                  >
                    <Typography 
                      variant="h6" 
                      data-testid="character-name"
                      sx={{ 
                        color: 'primary.main',
                        fontWeight: 'bold',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        textShadow: '0 0 10px rgba(255, 232, 12, 0.3)'
                      }}
                    >
                      {char.name}
                    </Typography>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                      <Typography 
                        sx={{ 
                          display: 'flex',
                          alignItems: 'center',
                          color: 'rgba(255, 255, 255, 0.8)',
                          '& > span': {
                            fontWeight: 'bold',
                            marginRight: 1,
                            color: 'primary.light',
                            textShadow: '0 0 8px rgba(255, 232, 12, 0.2)'
                          }
                        }}
                      >
                        <span>Birth Year:</span> {char.birth_year}
                      </Typography>
                      <Typography 
                        sx={{ 
                          display: 'flex',
                          alignItems: 'center',
                          color: 'rgba(255, 255, 255, 0.8)',
                          '& > span': {
                            fontWeight: 'bold',
                            marginRight: 1,
                            color: 'primary.light',
                            textShadow: '0 0 8px rgba(255, 232, 12, 0.2)'
                          }
                        }}
                      >
                        <span>Gender:</span> {char.gender}
                      </Typography>
                    </Box>
                  </CardContent>
                </Card>
              ))
            )}
          </Box>
          
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4, mb: 2 }}>
            <Pagination
              count={data?.totalPages ?? 1}
              page={page}
              onChange={handlePageChange}
              color="primary"
              size="large"
              disabled={isLoading}
              sx={{
                '& .MuiPaginationItem-root': {
                  color: 'rgba(255, 255, 255, 0.8)',
                  backdropFilter: 'blur(5px)',
                  background: 'rgba(0, 0, 0, 0.3)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  '&:hover': {
                    background: 'rgba(0, 0, 0, 0.5)',
                    borderColor: 'rgba(255, 232, 12, 0.3)'
                  },
                  '&.Mui-selected': {
                    background: 'rgba(255, 232, 12, 0.15)',
                    borderColor: 'rgba(255, 232, 12, 0.5)',
                    color: 'primary.light'
                  }
                }
              }}
            />
          </Box>
        </Box>
      </Paper>
    </Container>
  );
};

export default CharacterListComponent; 