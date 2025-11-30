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
      <div className="flex flex-col gap-4">
        <div className="relative">
          <input
            type="text"
            value={prompt}
            onChange={(e) => handleChange(e.target.value)}
            placeholder="Enter your horror prompt... (e.g., abandoned house, witch forest, lost child)"
            disabled={isLoading}
            className="w-full px-6 py-4 bg-[#1a1a2e] text-[#e0e0e0] border-2 border-[#2a2a3e] rounded-lg 
                     placeholder:text-[#a0a0a0] focus:outline-none focus:border-[#8b0000] 
                     focus:shadow-[0_0_15px_rgba(139,0,0,0.5)] transition-all duration-300
                     disabled:opacity-50 disabled:cursor-not-allowed text-lg"
            maxLength={200}
          />
          <div className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-[#a0a0a0]">
            {prompt.length}/200
          </div>
        </div>

        {errorMessage && (
          <div className="text-[#ff4444] text-sm px-2 animate-fade-in">
            {errorMessage}
          </div>
        )}

        <button
          type="submit"
          disabled={isLoading}
          className="px-8 py-4 bg-[#8b0000] text-[#e0e0e0] rounded-lg font-semibold text-lg
                   hover:bg-[#a00000] hover:shadow-[0_0_20px_rgba(255,68,68,0.6)]
                   transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed
                   disabled:hover:bg-[#8b0000] disabled:hover:shadow-none"
        >
          {isLoading ? "Summoning Story..." : "Generate Ghost Story"}
        </button>
      </div>
    </form>
  );
}
