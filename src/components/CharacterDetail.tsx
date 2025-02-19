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
  IconButton
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import api, { Character } from '../services/api';

const CharacterDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [character, setCharacter] = useState<Character | null>(null);
  const [editedChar, setEditedChar] = useState<Character | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);

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

  const handleEditToggle = () => {
    if (!isEditing && character) {
      setEditedChar({ ...character });
    }
    setIsEditing(!isEditing);
  };

  const handleSave = () => {
    if (editedChar && id) {
      localStorage.setItem(`character_${id}`, JSON.stringify(editedChar));
      setCharacter(editedChar);
      setIsEditing(false);
    }
  };

  const handleCancel = () => {
    setEditedChar(null);
    setIsEditing(false);
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
    <div style={{ padding: '20px' }}>
      <IconButton 
        onClick={() => navigate('/')}
        sx={{ marginBottom: 2 }}
      >
        <ArrowBackIcon />
      </IconButton>

      <Card>
        <CardContent>
          <Typography variant="h4" gutterBottom>
            {character.name}
          </Typography>

          {isEditing && editedChar ? (
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  label="Name"
                  value={editedChar.name}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEditedChar({ ...editedChar, name: e.target.value })}
                  fullWidth
                  margin="normal"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Height"
                  value={editedChar.height}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEditedChar({ ...editedChar, height: e.target.value })}
                  fullWidth
                  margin="normal"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Mass"
                  value={editedChar.mass}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEditedChar({ ...editedChar, mass: e.target.value })}
                  fullWidth
                  margin="normal"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Hair Color"
                  value={editedChar.hair_color}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEditedChar({ ...editedChar, hair_color: e.target.value })}
                  fullWidth
                  margin="normal"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Skin Color"
                  value={editedChar.skin_color}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEditedChar({ ...editedChar, skin_color: e.target.value })}
                  fullWidth
                  margin="normal"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Eye Color"
                  value={editedChar.eye_color}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEditedChar({ ...editedChar, eye_color: e.target.value })}
                  fullWidth
                  margin="normal"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Birth Year"
                  value={editedChar.birth_year}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEditedChar({ ...editedChar, birth_year: e.target.value })}
                  fullWidth
                  margin="normal"
                />
              </Grid>
              <Grid item xs={12}>
                <Button 
                  variant="contained" 
                  onClick={handleSave}
                  sx={{ mr: 1 }}
                >
                  Save
                </Button>
                <Button 
                  variant="outlined" 
                  onClick={handleCancel}
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
              <Button 
                variant="contained" 
                onClick={handleEditToggle}
                sx={{ mt: 2 }}
              >
                Edit
              </Button>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default CharacterDetail; 