import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Grid,
  CircularProgress,
  Alert,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { getCharacter, saveCharacterLocally, getLocalCharacter, type Character } from '../services/api';

const CharacterDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [character, setCharacter] = useState<Character | null>(null);
  const [editedCharacter, setEditedCharacter] = useState<Character | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    const fetchCharacter = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        setError(null);
        
        // Check for locally saved data first
        const localData = getLocalCharacter(id);
        if (localData) {
          setCharacter(localData);
          setEditedCharacter(localData);
        } else {
          const data = await getCharacter(id);
          setCharacter(data);
          setEditedCharacter(data);
        }
      } catch (err) {
        setError('Failed to load character data');
        console.error('Error fetching character:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchCharacter();
  }, [id]);

  const handleInputChange = (field: keyof Character) => (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    if (editedCharacter) {
      setEditedCharacter({
        ...editedCharacter,
        [field]: event.target.value,
      });
    }
  };

  const handleSave = () => {
    if (!id || !editedCharacter) return;
    
    try {
      saveCharacterLocally(id, editedCharacter);
      setCharacter(editedCharacter);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      setError('Failed to save changes locally');
      console.error('Error saving character:', err);
    }
  };

  const handleBack = () => {
    navigate('/');
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error || !editedCharacter) {
    return (
      <Box mt={4}>
        <Alert severity="error">{error || 'Character not found'}</Alert>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={handleBack}
          sx={{ mt: 2 }}
        >
          Back to List
        </Button>
      </Box>
    );
  }

  return (
    <Box>
      <Button
        startIcon={<ArrowBackIcon />}
        onClick={handleBack}
        sx={{ mb: 4 }}
      >
        Back to List
      </Button>

      {saveSuccess && (
        <Alert severity="success" sx={{ mb: 2 }}>
          Changes saved successfully!
        </Alert>
      )}

      <Card>
        <CardContent>
          <Typography variant="h4" component="h1" gutterBottom>
            {editedCharacter.name}
          </Typography>

          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Name"
                value={editedCharacter.name}
                onChange={handleInputChange('name')}
                margin="normal"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Birth Year"
                value={editedCharacter.birth_year}
                onChange={handleInputChange('birth_year')}
                margin="normal"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Height"
                value={editedCharacter.height}
                onChange={handleInputChange('height')}
                margin="normal"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Mass"
                value={editedCharacter.mass}
                onChange={handleInputChange('mass')}
                margin="normal"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Hair Color"
                value={editedCharacter.hair_color}
                onChange={handleInputChange('hair_color')}
                margin="normal"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Skin Color"
                value={editedCharacter.skin_color}
                onChange={handleInputChange('skin_color')}
                margin="normal"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Eye Color"
                value={editedCharacter.eye_color}
                onChange={handleInputChange('eye_color')}
                margin="normal"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Gender"
                value={editedCharacter.gender}
                onChange={handleInputChange('gender')}
                margin="normal"
              />
            </Grid>
          </Grid>

          <Box display="flex" justifyContent="flex-end" mt={4}>
            <Button
              variant="contained"
              color="primary"
              onClick={handleSave}
              disabled={JSON.stringify(character) === JSON.stringify(editedCharacter)}
            >
              Save Changes
            </Button>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default CharacterDetails; 