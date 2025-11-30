import { v } from "convex/values";
import { action } from "./_generated/server";
import OpenAI from "openai";

// Error codes for story generation
type ErrorCode = "VALIDATION_ERROR" | "API_ERROR" | "TIMEOUT" | "UNKNOWN";

interface ErrorResponse {
  error: string;
  code: ErrorCode;
  retryable: boolean;
}

// Generate a ghost story based on user prompt
export const generateGhostStory = action({
  args: { 
    prompt: v.string() 
  },
  handler: async (ctx, args): Promise<{ story: string } | ErrorResponse> => {
    // Validate prompt length (3-200 characters as per requirements)
    if (args.prompt.length < 3) {
      return {
        error: "Prompt must be at least 3 characters",
        code: "VALIDATION_ERROR",
        retryable: false,
      };
    }
    
    if (args.prompt.length > 200) {
      return {
        error: "Prompt must be less than 200 characters",
        code: "VALIDATION_ERROR",
        retryable: false,
      };
    }

    // Get OpenAI API key from environment
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      console.error("OPENAI_API_KEY not found in environment variables");
      return {
        error: "Story generation is temporarily unavailable. Please try again later.",
        code: "API_ERROR",
        retryable: true,
      };
    }

    // Initialize OpenAI client
    const openai = new OpenAI({
      apiKey: apiKey,
    });

    // System prompt for horror storytelling
    const systemPrompt = `You are a master horror storyteller specializing in ghost stories. 
Create a chilling, atmospheric ghost story based on the user's prompt.
The story should be 200-800 words, vivid, suspenseful, and genuinely scary.
Use descriptive language, build tension, and create an eerie atmosphere.
Include sensory details and psychological horror elements.
Do not include a title - just the story text.`;

    try {
      // Set timeout for API call (25 seconds)
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error("Request timeout")), 25000);
      });

      // Make API call to OpenAI
      const completionPromise = openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: args.prompt }
        ],
        temperature: 0.8,
        max_tokens: 1000,
        top_p: 0.9,
      });

      // Race between API call and timeout
      const completion = await Promise.race([completionPromise, timeoutPromise]);

      // Extract story from response
      const story = completion.choices[0]?.message?.content;
      
      if (!story) {
        return {
          error: "Failed to generate story. Please try again.",
          code: "API_ERROR",
          retryable: true,
        };
      }

      return { story: story.trim() };

    } catch (error: any) {
      console.error("Error generating story:", error);

      // Handle timeout
      if (error.message === "Request timeout") {
        return {
          error: "Story generation is taking too long. Please try again with a simpler prompt.",
          code: "TIMEOUT",
          retryable: true,
        };
      }

      // Handle rate limit errors
      if (error.status === 429) {
        return {
          error: "Too many requests. Please wait a moment and try again.",
          code: "API_ERROR",
          retryable: true,
        };
      }

      // Handle authentication errors
      if (error.status === 401 || error.status === 403) {
        console.error("OpenAI API authentication error");
        return {
          error: "Story generation is temporarily unavailable. Please try again later.",
          code: "API_ERROR",
          retryable: true,
        };
      }

      // Handle bad request errors
      if (error.status === 400) {
        return {
          error: "Invalid prompt. Please try a different prompt.",
          code: "VALIDATION_ERROR",
          retryable: false,
        };
      }

      // Handle server errors
      if (error.status >= 500) {
        return {
          error: "OpenAI service is temporarily unavailable. Please try again in a few moments.",
          code: "API_ERROR",
          retryable: true,
        };
      }

      // Handle network errors
      if (error.code === "ENOTFOUND" || error.code === "ECONNREFUSED" || error.message?.includes("fetch")) {
        return {
          error: "Network error. Please check your connection and try again.",
          code: "API_ERROR",
          retryable: true,
        };
      }

      // Handle other API errors
      if (error.status) {
        return {
          error: "Failed to generate story. Please try again.",
          code: "API_ERROR",
          retryable: true,
        };
      }

      // Unknown error
      return {
        error: "An unexpected error occurred. Please try again.",
        code: "UNKNOWN",
        retryable: true,
      };
    }
  },
});
