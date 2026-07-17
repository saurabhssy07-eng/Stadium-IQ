// @vitest-environment jsdom
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import { AiConversation } from '../components/AiConversation';

// Mock matchMedia to fix framer-motion issues in jsdom
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {}, // Deprecated
    removeListener: () => {}, // Deprecated
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  }),
});

describe('AiConversation', () => {
  it('renders correctly and accepts user input', () => {
    render(
      <BrowserRouter>
        <AiConversation />
      </BrowserRouter>
    );
    
    // Should render initial AI message
    expect(screen.getByText(/Hello! I am your Smart Stadium Assistant/i)).toBeTruthy();

    // Find input and submit button
    const input = screen.getByPlaceholderText('Describe your issue...');
    expect(input).toBeTruthy();
    
    // Type in input
    fireEvent.change(input, { target: { value: 'Test issue' } });
    expect(input).toHaveValue('Test issue');
  });
});
