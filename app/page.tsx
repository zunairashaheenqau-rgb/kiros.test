"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import StoryPromptForm from "@/components/StoryPromptForm";
import StoryDisplay from "@/components/StoryDisplay";
import LoadingAnimation from "@/components/LoadingAnimation";

export default function Home() {
  // Application state
  const [currentStory, setCurrentStory] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Set up Convex mutation hook for story generation
  const generateStory = useMutation(api.storyGeneration.generateGhostStory);

  // Handle form submission
  const handleSubmit = async (prompt: string) => {
    // Clear previous state
    setError(null);
    setCurrentStory(null);
    setIsGenerating(true);

    try {
      // Call Convex action to generate story
      const result = await generateStory({ prompt });

      // Handle success response
      if ("story" in result) {
        setCurrentStory(result.story);
      } 
      // Handle error response
      else if ("error" in result) {
        setError(result.error);
      }
    } catch (err: any) {
      // Handle unexpected errors
      console.error("Error generating story:", err);
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  // Handle generating a new story
  const handleGenerateNew = () => {
    setCurrentStory(null);
    setError(null);
  };

  return (
    <main className="min-h-screen bg-[#0a0a0f] py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <header className="text-center mb-12">
          <h1 className="text-5xl font-bold text-[#e0e0e0] mb-4 tracking-wide">
            👻 AI Ghost Story Generator
          </h1>
          <p className="text-[#a0a0a0] text-lg">
            Enter a prompt and let the spirits weave a chilling tale...
          </p>
        </header>

        {/* Story Prompt Form */}
        <div className="mb-8">
          <StoryPromptForm onSubmit={handleSubmit} isLoading={isGenerating} />
        </div>

        {/* Error Display */}
        {error && !isGenerating && (
          <div className="w-full max-w-2xl mx-auto mb-8">
            <div className="bg-[#1a1a2e] border-2 border-[#8b0000] rounded-lg p-6 shadow-[0_0_20px_rgba(139,0,0,0.4)]">
              <div className="flex items-start gap-3">
                <span className="text-2xl">⚠️</span>
                <div className="flex-1">
                  <h3 className="text-[#ff4444] font-semibold mb-2">
                    Error Generating Story
                  </h3>
                  <p className="text-[#e0e0e0] mb-4">{error}</p>
                  <button
                    onClick={handleGenerateNew}
                    className="px-6 py-2 bg-[#8b0000] text-[#e0e0e0] rounded-lg font-semibold
                             hover:bg-[#a00000] hover:shadow-[0_0_15px_rgba(255,68,68,0.5)]
                             transition-all duration-300"
                  >
                    Try Again
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Loading Animation */}
        {isGenerating && <LoadingAnimation />}

        {/* Story Display */}
        <StoryDisplay
          story={currentStory}
          isLoading={isGenerating}
          onGenerateNew={handleGenerateNew}
        />
      </div>
    </main>
  );
}
