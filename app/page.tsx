"use client";

import { useState } from "react";
import { useAction } from "convex/react";
import { api } from "@/convex/_generated/api";
import StoryPromptForm from "@/components/StoryPromptForm";
import StoryDisplay from "@/components/StoryDisplay";
import LoadingAnimation from "@/components/LoadingAnimation";

export default function Home() {
  // Application state
  const [currentStory, setCurrentStory] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Set up Convex action hook for story generation
  const generateStory = useAction(api.storyGeneration.generateGhostStory);

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
    <main className="min-h-screen bg-bg-primary py-12 px-4 transition-smooth">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <header className="text-center mb-12 animate-fade-in">
          <h1 className="text-5xl md:text-6xl font-bold text-text-primary mb-4 tracking-wide font-[family-name:var(--font-creepster)] text-glow-red">
            👻 AI Ghost Story Generator
          </h1>
          <p className="text-text-secondary text-lg md:text-xl">
            Enter a prompt and let the spirits weave a chilling tale...
          </p>
        </header>

        {/* Story Prompt Form */}
        <div className="mb-8">
          <StoryPromptForm onSubmit={handleSubmit} isLoading={isGenerating} />
        </div>

        {/* Error Display */}
        {error && !isGenerating && (
          <div className="w-full max-w-2xl mx-auto mb-8 animate-fade-in">
            <div className="bg-bg-secondary border-2 border-accent-primary rounded-lg p-6 glow-red transition-smooth">
              <div className="flex items-start gap-3">
                <span className="text-2xl">⚠️</span>
                <div className="flex-1">
                  <h3 className="text-accent-glow font-semibold mb-2 text-lg">
                    Error Generating Story
                  </h3>
                  <p className="text-text-primary mb-4">{error}</p>
                  <button
                    onClick={handleGenerateNew}
                    className="px-6 py-2 bg-accent-primary text-text-primary rounded-lg font-semibold
                             hover:bg-accent-hover glow-red-hover transition-glow"
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
