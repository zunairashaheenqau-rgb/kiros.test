# Design Document: AI Ghost Story Generator

## Overview

The AI Ghost Story Generator is a single-page web application built on Next.js 15 with React 19, utilizing Convex for backend operations and AI story generation. The application features a dark, atmospheric UI that accepts user prompts and generates unique horror stories through AI. The design emphasizes immersive user experience with spooky visual effects, smooth animations, and responsive layouts.

### Technology Stack
- **Frontend**: Next.js 15, React 19, Tailwind CSS
- **Backend**: Convex (serverless functions and database)
- **AI Integration**: OpenAI API (via Convex actions)
- **Authentication**: Clerk (optional for future features)
- **Styling**: Tailwind CSS with custom horror theme

## Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Client (Browser)                      │
│  ┌───────────────────────────────────────────────────┐  │
│  │         React Components (Next.js)                │  │
│  │  - StoryPromptForm                                │  │
│  │  - StoryDisplay                                   │  │
│  │  - LoadingAnimation                               │  │
│  └───────────────────────────────────────────────────┘  │
│                         │                                │
│                         │ Convex React Hooks             │
│                         ▼                                │
└─────────────────────────────────────────────────────────┘
                          │
                          │ HTTP/WebSocket
                          ▼
┌─────────────────────────────────────────────────────────┐
│                  Convex Backend                          │
│  ┌───────────────────────────────────────────────────┐  │
│  │              Convex Actions                       │  │
│  │  - generateStory (calls OpenAI API)               │  │
│  └───────────────────────────────────────────────────┘  │
│  ┌───────────────────────────────────────────────────┐  │
│  │              Convex Mutations                     │  │
│  │  - saveStory (optional persistence)               │  │
│  └───────────────────────────────────────────────────┘  │
│  ┌───────────────────────────────────────────────────┐  │
│  │              Convex Database                      │  │
│  │  - stories table (optional)                       │  │
│  └───────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
                          │
                          │ API Call
                          ▼
┌─────────────────────────────────────────────────────────┐
│                    OpenAI API                            │
│              (GPT-4 or GPT-3.5-turbo)                    │
└─────────────────────────────────────────────────────────┘
```

### Data Flow

1. User enters a prompt in the input field
2. Form submission triggers Convex action via `useMutation` hook
3. Convex action calls OpenAI API with structured prompt
4. OpenAI returns generated story text
5. Story is returned to client and displayed with animations
6. (Optional) Story is saved to Convex database for history

## Components and Interfaces

### Frontend Components

#### 1. Main Page Component (`app/page.tsx`)
- **Purpose**: Root component that orchestrates the ghost story generator
- **State Management**:
  - Current story text
  - Loading state
  - Error state
  - User prompt
- **Responsibilities**:
  - Render prompt form and story display
  - Handle story generation flow
  - Manage application state

#### 2. StoryPromptForm Component
- **Purpose**: Input form for user prompts
- **Props**:
  - `onSubmit: (prompt: string) => void`
  - `isLoading: boolean`
- **Features**:
  - Text input with validation (3-200 characters)
  - Submit button with disabled state during loading
  - Spooky placeholder text
  - Error message display for validation
- **Styling**: Dark theme with glowing effects on focus

#### 3. StoryDisplay Component
- **Purpose**: Display generated ghost story with atmospheric styling
- **Props**:
  - `story: string | null`
  - `isLoading: boolean`
- **Features**:
  - Fade-in animation when story appears
  - Typewriter effect (optional enhancement)
  - Scroll container for long stories
  - "Generate New Story" button
- **Styling**: Horror-themed typography, shadowed text, eerie spacing

#### 4. LoadingAnimation Component
- **Purpose**: Spooky loading indicator during story generation
- **Features**:
  - Animated ghost or skull icon
  - Pulsing or floating animation
  - Loading text with ellipsis animation
- **Styling**: Ethereal glow effects, smooth transitions

### Backend Components (Convex)

#### 1. Story Generation Action (`convex/storyGeneration.ts`)

```typescript
export const generateGhostStory = action({
  args: { prompt: v.string() },
  handler: async (ctx, args): Promise<{ story: string }> => {
    // Call OpenAI API with horror-themed system prompt
    // Return generated story
  }
});
```

**Responsibilities**:
- Validate prompt input
- Construct system prompt for horror theme
- Call OpenAI API with appropriate parameters
- Handle API errors and timeouts
- Return formatted story text

#### 2. Schema Definition (`convex/schema.ts`)

```typescript
stories: defineTable({
  prompt: v.string(),
  storyText: v.string(),
  createdAt: v.number(),
  userId: v.optional(v.string()), // For future auth integration
})
```

**Purpose**: Optional persistence for story history

### API Interfaces

#### OpenAI Integration

**System Prompt Template**:
```
You are a master horror storyteller specializing in ghost stories. 
Create a chilling, atmospheric ghost story based on the user's prompt.
The story should be 200-800 words, vivid, suspenseful, and genuinely scary.
Use descriptive language, build tension, and create an eerie atmosphere.
Include sensory details and psychological horror elements.
```

**Request Parameters**:
- Model: `gpt-4` or `gpt-3.5-turbo`
- Temperature: `0.8` (for creative variation)
- Max tokens: `1000`
- Top P: `0.9`

## Data Models

### Story Model (TypeScript Interface)

```typescript
interface GhostStory {
  id?: string;
  prompt: string;
  storyText: string;
  createdAt: number;
  userId?: string;
}
```

### Form State Model

```typescript
interface StoryFormState {
  prompt: string;
  isValid: boolean;
  errorMessage: string | null;
}
```

### Application State Model

```typescript
interface AppState {
  currentStory: string | null;
  isGenerating: boolean;
  error: string | null;
  prompt: string;
}
```

## Error Handling

### Client-Side Error Handling

1. **Validation Errors**:
   - Empty prompt: "Please enter a prompt to generate your ghost story"
   - Too short: "Prompt must be at least 3 characters"
   - Too long: "Prompt must be less than 200 characters"

2. **Network Errors**:
   - Display user-friendly message: "Failed to generate story. Please try again."
   - Provide retry button
   - Log error details to console

3. **Loading Timeout**:
   - If generation takes > 30 seconds, show warning
   - Allow user to cancel and retry

### Backend Error Handling

1. **OpenAI API Errors**:
   - Rate limit: Return error with retry suggestion
   - Invalid API key: Log error, return generic message
   - Timeout: Implement 25-second timeout, return error

2. **Validation Errors**:
   - Reject prompts outside character limits
   - Sanitize input to prevent injection

3. **Error Response Format**:
```typescript
interface ErrorResponse {
  error: string;
  code: "VALIDATION_ERROR" | "API_ERROR" | "TIMEOUT" | "UNKNOWN";
  retryable: boolean;
}
```

## Styling and Theme

### Color Palette

```css
--bg-primary: #0a0a0f;        /* Deep dark blue-black */
--bg-secondary: #1a1a2e;      /* Dark purple-blue */
--text-primary: #e0e0e0;      /* Light gray */
--text-secondary: #a0a0a0;    /* Medium gray */
--accent-primary: #8b0000;    /* Dark red */
--accent-glow: #ff4444;       /* Glowing red */
--accent-ghost: #9370db;      /* Medium purple */
--border-color: #2a2a3e;      /* Dark border */
```

### Typography

- **Headings**: Creepster or Nosifer (Google Fonts) for horror aesthetic
- **Body**: Geist Sans (existing) for readability
- **Story Text**: Crimson Text or Merriweather for literary feel

### Animations

1. **Fade In**: Story appears with 0.5s fade
2. **Pulse**: Loading indicator pulses at 1.5s intervals
3. **Glow**: Buttons and inputs glow on hover
4. **Float**: Loading ghost floats up and down
5. **Typewriter** (optional): Text appears character by character

### Responsive Breakpoints

- **Mobile**: < 640px (single column, larger touch targets)
- **Tablet**: 640px - 1024px (comfortable reading width)
- **Desktop**: > 1024px (centered content, max-width 800px)

## Testing Strategy

### Unit Tests

1. **Component Tests**:
   - StoryPromptForm validation logic
   - StoryDisplay rendering with different states
   - LoadingAnimation visibility conditions

2. **Utility Tests**:
   - Prompt validation functions
   - Text formatting utilities

### Integration Tests

1. **Story Generation Flow**:
   - Submit prompt → Loading state → Story display
   - Error handling → Error message display
   - Multiple generations in sequence

2. **Convex Action Tests**:
   - Mock OpenAI API responses
   - Test error scenarios
   - Validate response format

### End-to-End Tests (Optional)

1. **User Journey**:
   - Load page → Enter prompt → View story → Generate new story
   - Test on different devices/browsers
   - Verify responsive behavior

### Manual Testing Checklist

- [ ] Prompt validation works correctly
- [ ] Story generates successfully with various prompts
- [ ] Loading animation displays during generation
- [ ] Error messages appear for failures
- [ ] Responsive design works on mobile/tablet/desktop
- [ ] Animations are smooth and performant
- [ ] Dark theme is consistent throughout
- [ ] Multiple stories can be generated in one session

## Performance Considerations

1. **API Response Time**: OpenAI typically responds in 5-15 seconds
2. **Lazy Loading**: Load heavy fonts and animations only when needed
3. **Debouncing**: Prevent rapid-fire submissions
4. **Caching**: Consider caching common prompts (future enhancement)
5. **Bundle Size**: Keep JavaScript bundle under 200KB

## Security Considerations

1. **API Key Protection**: Store OpenAI API key in Convex environment variables
2. **Input Sanitization**: Validate and sanitize all user inputs
3. **Rate Limiting**: Implement per-user rate limits (future with auth)
4. **Content Filtering**: Consider filtering inappropriate prompts
5. **HTTPS**: Ensure all API calls use HTTPS

## Future Enhancements

1. **Story History**: Save and display previous stories (requires auth)
2. **Story Sharing**: Generate shareable links
3. **Image Generation**: Add AI-generated spooky images
4. **Audio Effects**: Background sounds and music
5. **Story Variations**: Multiple story styles (classic ghost, modern horror, etc.)
6. **Export Options**: Download stories as PDF or text file
