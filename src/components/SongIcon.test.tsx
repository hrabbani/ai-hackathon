import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import SongIcon from './SongIcon';

describe('SongIcon', () => {
  const defaultProps = {
    albumArtUrl: 'https://example.com/album1.jpg',
    title: 'Test Song',
    artist: 'Test Artist',
  };

  it('renders with default props', () => {
    render(<SongIcon {...defaultProps} />);
    
    expect(screen.getByAltText('Album cover for Test Song by Test Artist')).toBeInTheDocument();
    expect(screen.getByText('Test Song')).toBeInTheDocument();
    expect(screen.getByText('Test Artist')).toBeInTheDocument();
  });

  it('handles click events', () => {
    const handleClick = jest.fn();
    render(<SongIcon {...defaultProps} onClick={handleClick} />);
    
    fireEvent.click(screen.getByRole('button'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('applies selected state correctly', () => {
    render(<SongIcon {...defaultProps} selected={true} />);
    
    const button = screen.getByRole('button');
    expect(button).toHaveClass('border-blue-500');
  });

  it('applies custom className', () => {
    render(<SongIcon {...defaultProps} className="custom-class" />);
    
    const button = screen.getByRole('button');
    expect(button).toHaveClass('custom-class');
  });
}); 