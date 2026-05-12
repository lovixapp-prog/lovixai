const MagicStar = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="h-full w-full" aria-hidden="true">
    <path d="M12 2C12.4 6.5 13.8 10.2 17.5 12C13.8 13.8 12.4 17.5 12 22C11.6 17.5 10.2 13.8 6.5 12C10.2 10.2 11.6 6.5 12 2Z" />
  </svg>
);

interface WelcomeScreenProps {
  userName?: string | null;
}

export function WelcomeScreen({ userName }: WelcomeScreenProps) {
  const firstName = userName?.split(' ')[0];

  return (
    <div className="flex min-h-[60vh] select-none flex-col items-center justify-center px-4 py-12 pb-[72px] text-center animate-slide-up lg:pb-12">
      <div className="relative mb-6">
        <div className="welcome-logo-glow" />
        <div className="relative flex h-14 w-14 items-center justify-center rounded-2xl border border-primary/25 bg-primary/15 shadow-[0_0_40px_hsl(var(--primary)/0.2)]">
          <div className="star-icon h-8 w-8">
            <MagicStar />
          </div>
        </div>
      </div>

      <h1 className="mb-3 font-display text-3xl font-bold text-foreground sm:text-4xl">
        {firstName ? `Crea un progetto video, ${firstName}.` : 'Crea un progetto video.'}
      </h1>
      <p className="max-w-sm text-base text-muted-foreground">
        Scrivi il brief: l'agente prepara piano, scene, CTA e prompt finale prima della generazione.
      </p>
    </div>
  );
}
