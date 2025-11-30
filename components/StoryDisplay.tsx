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
      <div className="bg-[#1a1a2e] border-2 border-[#2a2a3e] rounded-lg p-8 shadow-[0_0_30px_rgba(139,0,0,0.3)]">
        <div className="max-h-[600px] overflow-y-auto custom-scrollbar">
          <p className="text-[#e0e0e0] text-lg leading-relaxed whitespace-pre-wrap">
            {story}
          </p>
        </div>
      </div>

      <div className="mt-6 flex justify-center">
        <button
          onClick={onGenerateNew}
          className="px-8 py-3 bg-[#9370db] text-[#e0e0e0] rounded-lg font-semibold
                   hover:bg-[#a080eb] hover:shadow-[0_0_20px_rgba(147,112,219,0.6)]
                   transition-all duration-300"
        >
          Generate New Story
        </button>
      </div>
    </div>
  );
}
