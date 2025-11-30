"use client";

export default function LoadingAnimation() {
  return (
    <div className="w-full max-w-2xl mx-auto flex flex-col items-center justify-center py-12 sm:py-16 animate-fade-in">
      <div className="relative">
        {/* Outer glow ring */}
        <div className="absolute inset-0 rounded-full bg-accent-primary opacity-20 blur-xl animate-pulse-slow"></div>
        
        {/* Inner glow ring */}
        <div className="absolute inset-2 sm:inset-4 rounded-full bg-accent-ghost opacity-10 blur-lg animate-pulse-slow" style={{ animationDelay: '0.5s' }}></div>
        
        {/* Ghost/Skull icon with floating animation */}
        <div className="relative animate-float">
          <svg
            className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 text-accent-ghost drop-shadow-[0_0_15px_rgba(147,112,219,0.8)] transition-smooth"
            fill="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Ghost shape */}
            <path d="M12 2C8.13 2 5 5.13 5 9v11c0 .55.45 1 1 1 .28 0 .53-.11.71-.29L9 18.41l2.29 2.29c.18.19.43.3.71.3s.53-.11.71-.29L15 18.41l2.29 2.29c.18.19.43.3.71.3.55 0 1-.45 1-1V9c0-3.87-3.13-7-7-7zm-2.5 9c-.83 0-1.5-.67-1.5-1.5S8.67 8 9.5 8s1.5.67 1.5 1.5S10.33 11 9.5 11zm5 0c-.83 0-1.5-.67-1.5-1.5S13.67 8 14.5 8s1.5.67 1.5 1.5S15.33 11 14.5 11z" />
          </svg>
        </div>
      </div>

      {/* Loading text with animated ellipsis */}
      <div className="mt-6 sm:mt-8 text-text-primary text-lg sm:text-xl font-semibold text-glow-purple text-center px-4">
        <span>Conjuring your tale</span>
        <span className="inline-block w-6 sm:w-8 text-left animate-ellipsis">
          <span className="animate-ellipsis-dot-1">.</span>
          <span className="animate-ellipsis-dot-2">.</span>
          <span className="animate-ellipsis-dot-3">.</span>
        </span>
      </div>

      <p className="mt-3 sm:mt-4 text-text-secondary text-xs sm:text-sm animate-pulse-slow text-center px-4">
        The spirits are gathering...
      </p>
    </div>
  );
}
