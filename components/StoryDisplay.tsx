"use client";

interface StoryDisplayProps {
  story: string | null;
  isLoading: boolean;
  onGenerateNew: () => void;
}

export default function StoryDisplay({
  story,
  isLoading,
  onGenerateNew,
}: StoryDisplayProps) {
  if (isLoading || !story) {
    return null;
  }

  return (
    <div className="w-full max-w-2xl mx-auto animate-fade-in">
      <div className="bg-bg-secondary border-2 border-border rounded-lg p-8 glow-red transition-smooth hover:border-border-glow">
        <div className="max-h-[600px] overflow-y-auto custom-scrollbar pr-2">
          <p className="text-text-primary text-lg leading-relaxed whitespace-pre-wrap font-[family-name:var(--font-geist-sans)]">
            {story}
          </p>
        </div>
      </div>

      <div className="mt-6 flex justify-center">
        <button
          onClick={onGenerateNew}
          className="px-8 py-3 bg-accent-ghost text-text-primary rounded-lg font-semibold
                   hover:bg-accent-ghost-hover glow-purple-hover
                   transition-glow relative overflow-hidden group"
        >
          <span className="relative z-10">Generate New Story</span>
          <span className="absolute inset-0 animate-shimmer opacity-0 group-hover:opacity-100 transition-opacity bg-gradient-to-r from-transparent via-accent-ghost-hover to-transparent"></span>
        </button>
      </div>
    </div>
  );
}
