import { render, screen } from '@testing-library/react';
import { BrowserRouter as Router } from 'react-router-dom';
import { describe, it, expect } from 'vitest';
import Layout from '../components/Layout';
import '@testing-library/jest-dom';

const renderWithRouter = (ui: JSX.Element) => {
  return render(
    <Router>{ui}</Router>
  );
};

describe('Layout', () => {
  it('renders header with title', () => {
    renderWithRouter(
      <Layout>
        <div>Test Content</div>
      </Layout>
    );
    
    expect(screen.getByText('Star Wars Characters')).toBeInTheDocument();
  });

  it('renders children content', () => {
    renderWithRouter(
      <Layout>
        <div>Test Child Content</div>
      </Layout>
    );
    
    expect(screen.getByText('Test Child Content')).toBeInTheDocument();
  });

  it('renders navigation link in header', () => {
    renderWithRouter(
      <Layout>
        <div>Test Content</div>
      </Layout>
    );
    
    const link = screen.getByRole('link', { name: /star wars characters/i });
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute('href', '/');
  });
}); 