import AnimatedIconify from '@/components/ui/animated-iconify';
import styleCinematic from '@/assets/style-cinematic.jpg';
import influencerSelfie from '@/assets/ai-influencer-selfie.jpg';

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
    <div className="agent-chat-welcome animate-slide-up">
      <section className="agent-chat-hero">
        <div className="agent-chat-hero-copy">
          <div className="agent-chat-hero-badge">
            <span className="agent-chat-badge-icon">
              <MagicStar />
            </span>
            <span>Lovix AI Agent</span>
          </div>

          <h1>
            {firstName ? `Build a video project, ${firstName}.` : 'Build a video project.'}
          </h1>
          <p>
            Describe the goal once. The agent turns it into a compact production plan with hook, format, scenes, script beats, CTA, and a generation-ready prompt.
          </p>

          <div className="agent-chat-capabilities">
            {[
              ['Plan', 'Strategy and format'],
              ['Script', 'Hook and CTA'],
              ['Scenes', 'Shot-by-shot direction'],
            ].map(([label, text]) => (
              <div key={label}>
                <strong>{label}</strong>
                <span>{text}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="agent-chat-hero-media" aria-hidden="true">
          <img src={styleCinematic} alt="" className="agent-chat-video" />
          <img src={styleCinematic} alt="" className="agent-chat-media-card agent-chat-media-card-left" />
          <img src={influencerSelfie} alt="" className="agent-chat-media-card agent-chat-media-card-right" />
          <div className="agent-chat-plan-preview">
            <div>
              <AnimatedIconify icon="solar:checklist-minimalistic-bold-duotone" className="h-4 w-4 text-primary" />
              <span>Ready plan</span>
            </div>
            <p>9:16 UGC ad | 30s | Shop now</p>
          </div>
        </div>
      </section>
    </div>
  );
}
