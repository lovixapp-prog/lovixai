const MagicStar = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full" aria-hidden="true">
    <path d="M12 2C12.4 6.5 13.8 10.2 17.5 12C13.8 13.8 12.4 17.5 12 22C11.6 17.5 10.2 13.8 6.5 12C10.2 10.2 11.6 6.5 12 2Z" />
  </svg>
);

interface WelcomeScreenProps {
  userName?: string | null;
}

export function WelcomeScreen({ userName }: WelcomeScreenProps) {
  const firstName = userName?.split(' ')[0];

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] pb-[72px] lg:pb-12 px-4 py-12 text-center animate-slide-up select-none">
      <div className="relative mb-6">
        <div className="welcome-logo-glow" />
        <div className="relative w-14 h-14 rounded-2xl bg-primary/15 border border-primary/25 flex items-center justify-center shadow-[0_0_40px_hsl(var(--primary)/0.2)]">
          <div className="star-icon w-8 h-8">
            <MagicStar />
          </div>
        </div>
      </div>

      <h1 className="font-display text-3xl sm:text-4xl font-bold text-foreground mb-3" style={{ letterSpacing: '-0.03em' }}>
        {firstName ? `Hello, ${firstName}.` : 'Hello.'}
      </h1>
      <p className="text-base text-muted-foreground max-w-xs">
        Describe what you want to create — I'll handle the rest.
      </p>
    </div>
  );
}
