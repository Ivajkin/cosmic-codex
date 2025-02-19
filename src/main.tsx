import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

console.log('main.tsx: Starting application initialization');

const rootElement = document.getElementById('root');
if (!rootElement) {
  console.error('main.tsx: Failed to find root element');
} else {
  console.log('main.tsx: Found root element, creating React root');
  try {
    const root = createRoot(rootElement);
    console.log('main.tsx: Created React root, attempting to render App');
    root.render(
      <StrictMode>
        <App />
      </StrictMode>,
    );
    console.log('main.tsx: Initial render complete');
  } catch (error) {
    console.error('main.tsx: Error during application initialization:', error);
  }
}
