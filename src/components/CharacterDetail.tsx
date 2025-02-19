import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Button, 
  TextField, 
  Typography, 
  CircularProgress, 
  Card,
  CardContent,
  Grid,
  IconButton,
  Alert,
  Box
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import api, { Character } from '../services/api';

interface ValidationErrors {
  height?: string;
  mass?: string;
  [key: string]: string | undefined;
}

const CharacterDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [character, setCharacter] = useState<Character | null>(null);
  const [editedChar, setEditedChar] = useState<Character | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({});
  const [saveError, setSaveError] = useState<string | null>(null);

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

  const validateField = (name: string, value: string): string | undefined => {
    switch (name) {
      case 'height':
        if (isNaN(Number(value)) || Number(value) <= 0) {
          return 'Invalid height';
        }
        break;
      case 'mass':
        if (isNaN(Number(value)) || Number(value) <= 0) {
          return 'Invalid mass';
        }
        break;
      default:
        if (!value.trim()) {
          return 'This field is required';
        }
    }
    return undefined;
  };

  const handleFieldChange = (field: keyof Character, value: string) => {
    if (editedChar) {
      const error = validateField(field, value);
      setValidationErrors(prev => ({
        ...prev,
        [field]: error
      }));
      setEditedChar({ ...editedChar, [field]: value });
    }
  };

  const handleEditToggle = () => {
    setSaveError(null);
    setValidationErrors({});
    if (!isEditing && character) {
      setEditedChar({ ...character });
    }
    setIsEditing(!isEditing);
  };

  const handleSave = async () => {
    if (editedChar && id) {
      // Validate all fields
      const errors: ValidationErrors = {};
      let hasErrors = false;
      
      Object.entries(editedChar).forEach(([key, value]) => {
        if (typeof value === 'string') {
          const error = validateField(key, value);
          if (error) {
            errors[key] = error;
            hasErrors = true;
          }
        }
      });

      if (hasErrors) {
        setValidationErrors(errors);
        return;
      }

      try {
        await api.characters.updateCharacter(id, editedChar);
        setCharacter(editedChar);
        setIsEditing(false);
        setSaveError(null);
      } catch (error) {
        setSaveError('Failed to save changes');
      }
    }
  };

  const handleCancel = () => {
    setEditedChar(null);
    setIsEditing(false);
    setSaveError(null);
    setValidationErrors({});
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '2rem' }}>
        <CircularProgress />
      </div>
    );
  }

  if (error) {
    return <Typography color="error">{error}</Typography>;
  }

  if (!character) {
    return <Typography>Character not found</Typography>;
  }

  return (
    <div style={{ padding: 20 }} data-testid="character-details">
      <IconButton 
        onClick={() => navigate('/')}
        sx={{ marginBottom: 2 }}
        aria-label="Back"
      >
        <ArrowBackIcon />
      </IconButton>

      <Card>
        <CardContent>
          {saveError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {saveError}
            </Alert>
          )}

          <Typography variant="h4" gutterBottom>
            {character.name}
          </Typography>

          {isEditing && editedChar ? (
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  label="Name"
                  value={editedChar.name}
                  onChange={(e) => handleFieldChange('name', e.target.value)}
                  error={!!validationErrors.name}
                  helperText={validationErrors.name}
                  fullWidth
                  margin="normal"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Height"
                  value={editedChar.height}
                  onChange={(e) => handleFieldChange('height', e.target.value)}
                  error={!!validationErrors.height}
                  helperText={validationErrors.height}
                  fullWidth
                  margin="normal"
                  inputProps={{ 'aria-label': 'Height' }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Mass"
                  value={editedChar.mass}
                  onChange={(e) => handleFieldChange('mass', e.target.value)}
                  error={!!validationErrors.mass}
                  helperText={validationErrors.mass}
                  fullWidth
                  margin="normal"
                  inputProps={{ 'aria-label': 'Mass' }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Hair Color"
                  value={editedChar.hair_color}
                  onChange={(e) => handleFieldChange('hair_color', e.target.value)}
                  error={!!validationErrors.hair_color}
                  helperText={validationErrors.hair_color}
                  fullWidth
                  margin="normal"
                  inputProps={{ 'aria-label': 'Hair Color' }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Skin Color"
                  value={editedChar.skin_color}
                  onChange={(e) => handleFieldChange('skin_color', e.target.value)}
                  error={!!validationErrors.skin_color}
                  helperText={validationErrors.skin_color}
                  fullWidth
                  margin="normal"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Eye Color"
                  value={editedChar.eye_color}
                  onChange={(e) => handleFieldChange('eye_color', e.target.value)}
                  error={!!validationErrors.eye_color}
                  helperText={validationErrors.eye_color}
                  fullWidth
                  margin="normal"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Birth Year"
                  value={editedChar.birth_year}
                  onChange={(e) => handleFieldChange('birth_year', e.target.value)}
                  error={!!validationErrors.birth_year}
                  helperText={validationErrors.birth_year}
                  fullWidth
                  margin="normal"
                />
              </Grid>
              <Grid item xs={12}>
                <Button 
                  variant="contained" 
                  onClick={handleSave}
                  sx={{ mr: 1 }}
                  aria-label="Save"
                >
                  Save
                </Button>
                <Button 
                  variant="outlined" 
                  onClick={handleCancel}
                  aria-label="Cancel"
                >
                  Cancel
                </Button>
              </Grid>
            </Grid>
          ) : (
            <>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Typography><strong>Height:</strong> {character.height}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography><strong>Mass:</strong> {character.mass}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography><strong>Hair Color:</strong> {character.hair_color}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography><strong>Skin Color:</strong> {character.skin_color}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography><strong>Eye Color:</strong> {character.eye_color}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography><strong>Birth Year:</strong> {character.birth_year}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography><strong>Gender:</strong> {character.gender}</Typography>
                </Grid>
              </Grid>
              <Box mt={2}>
                <Button 
                  variant="contained" 
                  onClick={handleEditToggle}
                  aria-label="Edit"
                >
                  Edit
                </Button>
              </Box>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default CharacterDetail; 