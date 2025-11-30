import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Home from '../page';

// Create mock function at module level
const mockGenerateStory = vi.fn();

// Mock Convex hooks
vi.mock('convex/react', () => ({
  useAction: () => mockGenerateStory,
}));

// Mock Convex API
vi.mock('@/convex/_generated/api', () => ({
  api: {
    storyGeneration: {
      generateGhostStory: 'generateGhostStory',
    },
  },
}));

describe('Story Generation Flow', () => {
  beforeEach(() => {
    // Reset mocks before each test
    mockGenerateStory.mockReset();
  });

  it('should complete full story generation flow: submit → loading → display', async () => {
    const user = userEvent.setup();
    const mockStory = 'In the depths of the abandoned house, shadows whispered secrets of the past...';
    
    // Mock successful story generation with a delay to simulate API call
    mockGenerateStory.mockImplementation(() => 
      new Promise(resolve => setTimeout(() => resolve({ story: mockStory }), 100))
    );

    render(<Home />);

    // Verify initial state - form should be visible
    const input = screen.getByPlaceholderText(/enter your horror prompt/i);
    const submitButton = screen.getByRole('button', { name: /generate ghost story/i });
    
    expect(input).toBeInTheDocument();
    expect(submitButton).toBeInTheDocument();
    expect(submitButton).not.toBeDisabled();

    // Enter a valid prompt
    await user.type(input, 'abandoned house');
    expect(input).toHaveValue('abandoned house');

    // Submit the form
    await user.click(submitButton);

    // Verify loading state appears
    await waitFor(() => {
      expect(screen.getByText(/conjuring your tale/i)).toBeInTheDocument();
    });
    
    // Button should be disabled during loading
    expect(submitButton).toBeDisabled();
    expect(screen.getByText(/summoning story/i)).toBeInTheDocument();

    // Verify story generation was called with correct prompt
    expect(mockGenerateStory).toHaveBeenCalledWith({ prompt: 'abandoned house' });
    expect(mockGenerateStory).toHaveBeenCalledTimes(1);

    // Wait for story to be displayed
    await waitFor(() => {
      expect(screen.getByText(mockStory)).toBeInTheDocument();
    }, { timeout: 3000 });

    // Verify loading animation is gone
    expect(screen.queryByText(/conjuring your tale/i)).not.toBeInTheDocument();

    // Verify "Generate New Story" button appears
    const newStoryButton = screen.getByRole('button', { name: /generate new story/i });
    expect(newStoryButton).toBeInTheDocument();
  });

  it('should handle API error and display error message with retry option', async () => {
    const user = userEvent.setup();
    const errorMessage = 'Failed to generate story. Please try again.';
    
    // Mock error response
    mockGenerateStory.mockResolvedValue({ 
      error: errorMessage,
      code: 'API_ERROR',
      retryable: true 
    });

    render(<Home />);

    // Enter prompt and submit
    const input = screen.getByPlaceholderText(/enter your horror prompt/i);
    await user.type(input, 'haunted forest');
    
    const submitButton = screen.getByRole('button', { name: /generate ghost story/i });
    await user.click(submitButton);

    // Wait for error message to appear
    await waitFor(() => {
      expect(screen.getByText(/error generating story/i)).toBeInTheDocument();
      expect(screen.getByText(errorMessage)).toBeInTheDocument();
    });

    // Verify retry button is present
    const retryButton = screen.getByRole('button', { name: /retry/i });
    expect(retryButton).toBeInTheDocument();

    // Verify story is not displayed
    expect(screen.queryByText(/generate new story/i)).not.toBeInTheDocument();
  });

  it('should handle network error gracefully', async () => {
    const user = userEvent.setup();
    
    // Mock network error
    mockGenerateStory.mockRejectedValue(new Error('fetch failed'));

    render(<Home />);

    // Enter prompt and submit
    const input = screen.getByPlaceholderText(/enter your horror prompt/i);
    await user.type(input, 'dark cellar');
    
    const submitButton = screen.getByRole('button', { name: /generate ghost story/i });
    await user.click(submitButton);

    // Wait for error message
    await waitFor(() => {
      expect(screen.getByText(/network error/i)).toBeInTheDocument();
    });

    // Verify retry functionality
    const retryButton = screen.getByRole('button', { name: /retry/i });
    expect(retryButton).toBeInTheDocument();
  });

  it('should handle timeout error', async () => {
    const user = userEvent.setup();
    
    // Mock timeout error
    mockGenerateStory.mockRejectedValue(new Error('timeout'));

    render(<Home />);

    // Enter prompt and submit
    const input = screen.getByPlaceholderText(/enter your horror prompt/i);
    await user.type(input, 'ghost ship');
    
    const submitButton = screen.getByRole('button', { name: /generate ghost story/i });
    await user.click(submitButton);

    // Wait for timeout error message
    await waitFor(() => {
      expect(screen.getByText(/request timed out/i)).toBeInTheDocument();
    });
  });

  it('should allow multiple story generations in sequence', async () => {
    const user = userEvent.setup();
    const firstStory = 'The old mansion creaked with every step...';
    const secondStory = 'Deep in the forest, something stirred...';
    
    // Mock first generation
    mockGenerateStory.mockResolvedValueOnce({ story: firstStory });

    render(<Home />);

    // Generate first story
    const input = screen.getByPlaceholderText(/enter your horror prompt/i);
    await user.type(input, 'old mansion');
    
    const submitButton = screen.getByRole('button', { name: /generate ghost story/i });
    await user.click(submitButton);

    // Wait for first story
    await waitFor(() => {
      expect(screen.getByText(firstStory)).toBeInTheDocument();
    });

    // Click "Generate New Story"
    const newStoryButton = screen.getByRole('button', { name: /generate new story/i });
    await user.click(newStoryButton);

    // Verify first story is cleared
    expect(screen.queryByText(firstStory)).not.toBeInTheDocument();

    // Mock second generation
    mockGenerateStory.mockResolvedValueOnce({ story: secondStory });

    // Generate second story with different prompt
    await user.clear(input);
    await user.type(input, 'dark forest');
    await user.click(submitButton);

    // Wait for second story
    await waitFor(() => {
      expect(screen.getByText(secondStory)).toBeInTheDocument();
    });

    // Verify second generation was called
    expect(mockGenerateStory).toHaveBeenCalledTimes(2);
    expect(mockGenerateStory).toHaveBeenNthCalledWith(1, { prompt: 'old mansion' });
    expect(mockGenerateStory).toHaveBeenNthCalledWith(2, { prompt: 'dark forest' });
  });

  it('should retry with the same prompt after error', async () => {
    const user = userEvent.setup();
    const mockStory = 'The cemetery gates swung open...';
    
    // First call fails, second succeeds
    mockGenerateStory
      .mockResolvedValueOnce({ error: 'API Error', code: 'API_ERROR', retryable: true })
      .mockResolvedValueOnce({ story: mockStory });

    render(<Home />);

    // Submit initial prompt
    const input = screen.getByPlaceholderText(/enter your horror prompt/i);
    await user.type(input, 'cemetery');
    
    const submitButton = screen.getByRole('button', { name: /generate ghost story/i });
    await user.click(submitButton);

    // Wait for error
    await waitFor(() => {
      expect(screen.getByText(/error generating story/i)).toBeInTheDocument();
    });

    // Click retry
    const retryButton = screen.getByRole('button', { name: /retry/i });
    await user.click(retryButton);

    // Wait for successful story
    await waitFor(() => {
      expect(screen.getByText(mockStory)).toBeInTheDocument();
    });

    // Verify both calls used the same prompt
    expect(mockGenerateStory).toHaveBeenCalledTimes(2);
    expect(mockGenerateStory).toHaveBeenNthCalledWith(1, { prompt: 'cemetery' });
    expect(mockGenerateStory).toHaveBeenNthCalledWith(2, { prompt: 'cemetery' });
  });

  it('should clear error when starting over', async () => {
    const user = userEvent.setup();
    
    // Mock error
    mockGenerateStory.mockResolvedValue({ 
      error: 'Test error', 
      code: 'API_ERROR', 
      retryable: true 
    });

    render(<Home />);

    // Generate error
    const input = screen.getByPlaceholderText(/enter your horror prompt/i);
    await user.type(input, 'test prompt');
    
    const submitButton = screen.getByRole('button', { name: /generate ghost story/i });
    await user.click(submitButton);

    // Wait for error
    await waitFor(() => {
      expect(screen.getByText(/error generating story/i)).toBeInTheDocument();
    });

    // Click "Start Over"
    const startOverButton = screen.getByRole('button', { name: /start over/i });
    await user.click(startOverButton);

    // Verify error is cleared
    expect(screen.queryByText(/error generating story/i)).not.toBeInTheDocument();
  });
});
