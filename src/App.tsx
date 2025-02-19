import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, CssBaseline } from '@mui/material';
import { theme } from './theme';
import CharacterListPage from './pages/CharacterList';
import CharacterDetails from './pages/CharacterDetails';
import Layout from './components/Layout';

console.log('App.tsx: Starting to render App component');

function App() {
  console.log('App.tsx: Inside App component render');
  
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Layout>
          <Routes>
            <Route 
              path="/" 
              element={
                <CharacterListPage />
              } 
            />
            <Route 
              path="/character/:id" 
              element={
                <CharacterDetails />
              } 
            />
          </Routes>
        </Layout>
      </Router>
    </ThemeProvider>
  );
}

export default App;
