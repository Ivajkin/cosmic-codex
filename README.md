# Star Wars Character Explorer

A React application that allows users to explore Star Wars characters using the SWAPI (Star Wars API). Built with React, TypeScript, and Material-UI.

## Features

- Browse Star Wars characters with pagination
- Search functionality to find specific characters
- Detailed character information pages
- Local storage for character edits
- Responsive design with Material-UI
- Comprehensive test coverage

## Tech Stack

- React 19
- TypeScript
- Material-UI
- React Router
- Axios
- Vitest for testing
- Vite for building

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- pnpm (v8 or higher)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/star-wars-explorer.git
   cd star-wars-explorer
   ```

2. Install dependencies:
   ```bash
   pnpm install
   ```

3. Start the development server:
   ```bash
   pnpm dev
   ```

4. Open [http://localhost:5173](http://localhost:5173) to view it in the browser.

## Available Scripts

- `pnpm dev` - Start development server
- `pnpm build` - Build for production
- `pnpm preview` - Preview production build
- `pnpm test` - Run tests
- `pnpm test:coverage` - Run tests with coverage report
- `pnpm lint` - Run ESLint

## Deployment

The application is configured for deployment on Vercel. To deploy:

1. Install Vercel CLI:
   ```bash
   pnpm install -g vercel
   ```

2. Login to Vercel:
   ```bash
   vercel login
   ```

3. Deploy:
   ```bash
   vercel
   ```

For production deployment:
```bash
vercel --prod
```

## Project Structure

```
src/
  ├── components/     # Reusable components
  ├── pages/         # Page components
  ├── services/      # API and other services
  ├── test/          # Test setup and utilities
  └── theme.ts       # Material-UI theme configuration
```

## Testing

The project uses Vitest and React Testing Library for testing. Run tests with:

```bash
pnpm test
```

For coverage report:

```bash
pnpm test:coverage
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- [SWAPI](https://swapi.dev/) for providing the Star Wars API
- [Material-UI](https://mui.com/) for the UI components
- [React](https://reactjs.org/) and the React community