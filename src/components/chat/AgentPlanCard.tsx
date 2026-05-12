import { CheckCircle2, X } from 'lucide-react';
import type { ChatMessage } from '@/hooks/useChat';
import type { MarketingPlan } from '@/lib/aiRouter';
import AnimatedIconify from '@/components/ui/animated-iconify';

interface AgentPlanCardProps {
  message: ChatMessage;
  onConfirm: (
    msgId: string,
    intent: string,
    prompt: string,
    settings: Record<string, unknown>,
    plan: MarketingPlan,
  ) => void;
  onCancel: (msgId: string, intent: string, plan: MarketingPlan) => void;
}

const intentIcon: Record<string, string> = {
  video: 'solar:videocamera-record-bold-duotone',
  ugc: 'solar:shop-bold-duotone',
  image: 'solar:gallery-wide-bold-duotone',
  motion: 'solar:magic-stick-3-bold-duotone',
};

const briefLabel = (value?: string) => value?.replace(/_/g, ' ') || 'Auto';

export function AgentPlanCard({ message, onConfirm, onCancel }: AgentPlanCardProps) {
  const req = message.agentPlan!;
  const plan = req.plan;
  const brief = plan.ugcBrief;

  if (req.status === 'accepted') {
    return (
      <div className="agent-plan-card agent-plan-card-done">
        <CheckCircle2 className="h-4 w-4 text-primary" />
        <div>
          <p className="text-sm font-bold text-foreground">Plan approved</p>
          <p className="text-xs text-muted-foreground">LOVIX Agent is generating from this strategy.</p>
        </div>
      </div>
    );
  }

  if (req.status === 'cancelled') {
    return (
      <div className="agent-plan-card agent-plan-card-done opacity-65">
        <X className="h-4 w-4 text-muted-foreground" />
        <p className="text-sm text-muted-foreground">Plan cancelled. Tell the agent what to change in chat.</p>
      </div>
    );
  }

  const facts = [
    ['Format', brief?.aspectRatio || plan.format],
    ['Duration', brief?.durationSeconds ? `${brief.durationSeconds}s` : plan.duration],
    ['Style', brief?.visualStyle || plan.strategy],
    ['CTA', brief?.callToAction || 'Auto'],
  ];

  const context = [
    ['Audience', plan.audience],
    ['Platform', brief?.platform || 'Multi-platform'],
    ['Creator', briefLabel(brief?.influencerMode)],
    ['Credits', plan.estimatedCredits],
  ];

  return (
    <div className="agent-plan-card">
      <div className="agent-plan-head">
        <div className="agent-plan-icon">
          <AnimatedIconify icon={intentIcon[req.intent] ?? 'solar:stars-bold-duotone'} className="h-5 w-5" pulse />
        </div>
        <div className="min-w-0 flex-1">
          <p className="agent-plan-kicker">LOVIX Agent plan</p>
          <h3>{plan.title}</h3>
          <p>{req.intro || plan.summary}</p>
        </div>
      </div>

      <div className="agent-plan-facts">
        {facts.map(([label, value]) => (
          <div key={label}>
            <span>{label}</span>
            <strong>{value}</strong>
          </div>
        ))}
      </div>

      <div className="agent-plan-section">
        <span>Hook</span>
        <p>{plan.hook}</p>
      </div>

      <div className="agent-plan-section">
        <span>Script</span>
        <ol>
          {plan.scriptOutline.slice(0, 4).map((line, index) => (
            <li key={`${line}-${index}`}>{line}</li>
          ))}
        </ol>
      </div>

      <div className="agent-plan-section">
        <span>Scenes</span>
        <div className="agent-plan-scenes">
          {plan.shotList.slice(0, 4).map(step => (
            <div key={step.title}>
              <strong>{step.title}</strong>
              <p>{step.detail}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="agent-plan-context">
        {context.map(([label, value]) => (
          <p key={label}><span>{label}</span>{value}</p>
        ))}
      </div>

      <div className="agent-plan-note">
        Changes are handled in chat: tell the agent what to adjust before accepting.
      </div>

      <div className="agent-plan-actions">
        <button type="button" onClick={() => onCancel(message.id, req.intent, plan)} className="agent-cancel-btn">
          Cancel
        </button>
        <button
          type="button"
          onClick={() => onConfirm(message.id, req.intent, message.prompt ?? '', message.settings ?? {}, plan)}
          className="agent-confirm-btn"
        >
          <span>Accept plan</span>
          <CheckCircle2 className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
