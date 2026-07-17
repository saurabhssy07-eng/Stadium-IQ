// @vitest-environment jsdom
import { render, screen, fireEvent, waitFor, cleanup } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import { AiConversation } from '../components/AiConversation';

// Mock matchMedia to fix framer-motion issues in jsdom
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(), // Deprecated
    removeListener: vi.fn(), // Deprecated
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

describe('AiConversation', () => {
  beforeEach(() => {
    globalThis.fetch = vi.fn();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    cleanup();
  });

  it('renders correctly and handles successful API response', async () => {
    (globalThis.fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
      ok: true,
      json: async () => ({ text: 'Real API Response' })
    });

    render(
      <BrowserRouter>
        <AiConversation />
      </BrowserRouter>
    );
    
    expect(screen.getByText(/Hello! I am your Smart Stadium Assistant/i)).toBeTruthy();

    const input = screen.getByPlaceholderText('Describe your issue...');
    const submitBtn = screen.getByRole('button', { name: /Send message/i });
    expect(input).toBeTruthy();
    
    fireEvent.change(input, { target: { value: 'Test issue' } });
    fireEvent.click(submitBtn);

    expect(screen.getByText('Test issue')).toBeTruthy();
    
    await waitFor(() => {
      expect(screen.getByText('Real API Response')).toBeTruthy();
    });
  });

  it('handles API failure and switches to Demo Mode fallback', async () => {
    (globalThis.fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
      ok: false,
      status: 503
    });

    render(
      <BrowserRouter>
        <AiConversation />
      </BrowserRouter>
    );

    const input = screen.getByPlaceholderText('Describe your issue...');
    const submitBtn = screen.getByRole('button', { name: /Send message/i });
    
    fireEvent.change(input, { target: { value: 'Broken issue' } });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(screen.getByText(/Demo Mode Activated/i)).toBeTruthy();
      expect(screen.getByText(/\[Simulated Response\]/i)).toBeTruthy();
    }, { timeout: 2500 });
  });
});
