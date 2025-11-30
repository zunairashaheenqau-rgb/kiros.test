"use client";

import { useState, FormEvent } from "react";

interface StoryPromptFormProps {
  onSubmit: (prompt: string) => void;
  isLoading: boolean;
}

export default function StoryPromptForm({
  onSubmit,
  isLoading,
}: StoryPromptFormProps) {
  const [prompt, setPrompt] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const validatePrompt = (value: string): string | null => {
    if (value.trim().length === 0) {
      return "Please enter a prompt to generate your ghost story";
    }
    if (value.length < 3) {
      return "Prompt must be at least 3 characters";
    }
    if (value.length > 200) {
      return "Prompt must be less than 200 characters";
    }
    return null;
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    
    const error = validatePrompt(prompt);
    if (error) {
      setErrorMessage(error);
      return;
    }

    setErrorMessage(null);
    onSubmit(prompt);
  };

  const handleChange = (value: string) => {
    setPrompt(value);
    // Clear error message when user starts typing
    if (errorMessage) {
      setErrorMessage(null);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-2xl mx-auto">
      <div className="flex flex-col gap-3 sm:gap-4">
        <div className="relative group">
          <input
            type="text"
            value={prompt}
            onChange={(e) => handleChange(e.target.value)}
            placeholder="Enter your horror prompt... (e.g., abandoned house, witch forest, lost child)"
            disabled={isLoading}
            className="w-full px-4 sm:px-6 py-3 sm:py-4 bg-bg-secondary text-text-primary border-2 border-border rounded-lg 
                     placeholder:text-text-secondary placeholder:text-sm sm:placeholder:text-base
                     focus:outline-none focus:border-accent-primary 
                     glow-red-hover transition-glow
                     disabled:opacity-50 disabled:cursor-not-allowed 
                     text-base sm:text-lg
                     hover:border-border-glow
                     pr-16 sm:pr-20 touch-manipulation"
            maxLength={200}
          />
          <div className="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 text-xs sm:text-sm text-text-muted transition-smooth pointer-events-none">
            {prompt.length}/200
          </div>
        </div>

        {errorMessage && (
          <div className="text-accent-glow text-xs sm:text-sm px-2 animate-fade-in font-medium">
            ⚠️ {errorMessage}
          </div>
        )}

        <button
          type="submit"
          disabled={isLoading}
          className="w-full px-6 sm:px-8 py-3 sm:py-4 bg-accent-primary text-text-primary rounded-lg font-semibold text-base sm:text-lg
                   hover:bg-accent-hover glow-red-hover
                   transition-glow disabled:opacity-50 disabled:cursor-not-allowed
                   disabled:hover:bg-accent-primary disabled:hover:shadow-none
                   relative overflow-hidden group touch-manipulation
                   min-h-[48px] sm:min-h-[56px]"
        >
          <span className="relative z-10">
            {isLoading ? "Summoning Story..." : "Generate Ghost Story"}
          </span>
          {!isLoading && (
            <span className="absolute inset-0 animate-shimmer opacity-0 group-hover:opacity-100 transition-opacity"></span>
          )}
        </button>
      </div>
    </form>
  );
}
