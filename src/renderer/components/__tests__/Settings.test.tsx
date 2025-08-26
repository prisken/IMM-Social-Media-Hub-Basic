import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import Settings from '../Settings';

describe('Settings Component', () => {
  it('renders loading state initially', () => {
    render(<Settings />);
    expect(screen.getByText('Loading Settings...')).toBeInTheDocument();
  });

  it('renders settings form after loading', async () => {
    render(<Settings />);
    
    await waitFor(() => {
      expect(screen.getByText('Settings')).toBeInTheDocument();
    });
    
    expect(screen.getByText('Brand Voice')).toBeInTheDocument();
    expect(screen.getByText('Social Media Connections')).toBeInTheDocument();
    expect(screen.getByText('Save Settings')).toBeInTheDocument();
  });

  it('displays brand voice form fields', async () => {
    render(<Settings />);
    
    await waitFor(() => {
      expect(screen.getByText('Tone:')).toBeInTheDocument();
      expect(screen.getByText('Style:')).toBeInTheDocument();
      expect(screen.getByText('Vocabulary (comma-separated):')).toBeInTheDocument();
      expect(screen.getByText('Emoji Usage:')).toBeInTheDocument();
      expect(screen.getByText('Call to Action:')).toBeInTheDocument();
    });
  });

  it('displays social media connections', async () => {
    render(<Settings />);
    
    await waitFor(() => {
      expect(screen.getByText('Facebook')).toBeInTheDocument();
      expect(screen.getByText('Instagram')).toBeInTheDocument();
      expect(screen.getByText('LinkedIn')).toBeInTheDocument();
    });
  });
}); 