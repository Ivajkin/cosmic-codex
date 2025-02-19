import { AppBar, Toolbar, Typography, Box } from '@mui/material';
import { Link } from 'react-router-dom';
import StarfieldBackground from './StarfieldBackground';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <StarfieldBackground />
      <AppBar 
        position="static" 
        sx={{ 
          background: 'rgba(0, 0, 0, 0.5)',
          backdropFilter: 'blur(10px)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
          width: '100%'
        }}
      >
        <Box 
          sx={{ 
            maxWidth: '1200px', 
            width: '100%', 
            mx: 'auto',
            px: { xs: 2, sm: 3, md: 4 }
          }}
        >
          <Toolbar disableGutters>
            <Link
              to="/"
              style={{
                textDecoration: 'none',
                color: 'inherit'
              }}
            >
              <Typography
                variant="h6"
                sx={{
                  color: 'primary.main',
                  fontWeight: 'bold',
                  textShadow: '0 0 10px rgba(255, 232, 12, 0.3)',
                  '&:hover': {
                    color: 'primary.light',
                    textShadow: '0 0 15px rgba(255, 232, 12, 0.5)'
                  }
                }}
              >
                Star Wars Characters
              </Typography>
            </Link>
          </Toolbar>
        </Box>
      </AppBar>
      <Box 
        sx={{ 
          flexGrow: 1,
          width: '100%',
          position: 'relative',
          zIndex: 1
        }}
      >
        {children}
      </Box>
    </Box>
  );
};

export default Layout; 