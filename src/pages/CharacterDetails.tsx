import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Paper,
  Typography,
  Button,
  TextField,
  Box,
  CircularProgress,
  Grid,
} from '@mui/material';
import api, { type Character } from '../services/api';

const STORAGE_KEY = 'characterEdits';

export default function CharacterDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [character, setCharacter] = useState<Character | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [editedCharacter, setEditedCharacter] = useState<Partial<Character>>({});

  useEffect(() => {
    const fetchCharacter = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        const data = await api.characters.getCharacter(id);
        
        // Check for local edits
        const storedCharacter = api.localStorage.getCharacter(id);
        
        setCharacter({
          ...data,
          ...storedCharacter,
        });
      } catch (err) {
        setError('Failed to load character details');
      } finally {
        setLoading(false);
      }
    };

    fetchCharacter();
  }, [id]);

  const handleEdit = () => {
    setIsEditing(true);
    setEditedCharacter(character || {});
  };

  const handleSave = () => {
    if (!character || !id) return;

    const updatedCharacter = {
      ...character,
      ...editedCharacter,
    };

    // Save to local storage
    api.localStorage.saveCharacter(id, updatedCharacter);

    setCharacter(updatedCharacter);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditedCharacter({});
  };

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
        <Typography color="error" data-testid="error-message">{error}</Typography>
      </Box>
    );
  }

  if (!character) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <Typography>Character not found</Typography>
      </Box>
    );
  }

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Paper sx={{ p: 4 }} data-testid="character-details">
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
          <Typography variant="h4" data-testid="character-name">
            {character.name}
          </Typography>
          <Box>
            {!isEditing ? (
              <Button variant="contained" onClick={handleEdit}>
                Edit
              </Button>
            ) : (
              <Box>
                <Button variant="contained" onClick={handleSave} sx={{ mr: 1 }}>
                  Save
                </Button>
                <Button variant="outlined" onClick={handleCancel}>
                  Cancel
                </Button>
              </Box>
            )}
          </Box>
        </Box>

        <Grid container spacing={3}>
          {[
            { label: 'Height', key: 'height' },
            { label: 'Mass', key: 'mass' },
            { label: 'Hair Color', key: 'hair_color' },
            { label: 'Skin Color', key: 'skin_color' },
            { label: 'Eye Color', key: 'eye_color' },
            { label: 'Birth Year', key: 'birth_year' },
            { label: 'Gender', key: 'gender' },
          ].map(({ label, key }) => (
            <Grid item xs={12} sm={6} key={key}>
              {isEditing ? (
                <TextField
                  fullWidth
                  label={label}
                  value={editedCharacter[key as keyof Character] || character[key as keyof Character]}
                  onChange={(e) => setEditedCharacter({
                    ...editedCharacter,
                    [key]: e.target.value,
                  })}
                />
              ) : (
                <Typography>
                  <strong>{label}:</strong> {character[key as keyof Character]}
                </Typography>
              )}
            </Grid>
          ))}
        </Grid>
      </Paper>
    </Container>
  );
} 