import { useRef, useEffect } from 'react';
import type { ChatMessage as Msg } from '@/hooks/useChat';
import type { AgentField, MarketingPlan } from '@/lib/aiRouter';
import { GeneratingCard, VideoOutputCard, ImageOutputCard, ErrorCard } from './OutputCard';
import { AgentRequestCard } from './AgentRequestCard';
import { AgentPlanCard } from './AgentPlanCard';

const MagicStar = ({ className = 'w-3.5 h-3.5' }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
    <path d="M12 2C12.4 6.5 13.8 10.2 17.5 12C13.8 13.8 12.4 17.5 12 22C11.6 17.5 10.2 13.8 6.5 12C10.2 10.2 11.6 6.5 12 2Z" />
  </svg>
);

function parseMarkdown(text: string): string {
  return text
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/\n\n/g, '</p><p>')
    .replace(/\n/g, '<br />');
}

interface ChatMessageProps {
  message: Msg;
  onRetry?: (msgId: string, prompt: string, intent: string, settings: Record<string, unknown>) => void;
  onUseForVideo?: (url: string) => void;
  onConfirmAgentRequest?: (
    msgId: string,
    intent: string,
    prompt: string,
    settings: Record<string, unknown>,
    fields: AgentField[],
    data: Record<string, string | File>,
  ) => void;
  onCancelAgentRequest?: (msgId: string, fields: AgentField[], intent: string) => void;
  onConfirmAgentPlan?: (
    msgId: string,
    intent: string,
    prompt: string,
    settings: Record<string, unknown>,
    plan: MarketingPlan,
  ) => void;
  onCancelAgentPlan?: (msgId: string, intent: string, plan: MarketingPlan) => void;
}

export function ChatMessageItem({ message, onRetry, onUseForVideo, onConfirmAgentRequest, onCancelAgentRequest, onConfirmAgentPlan, onCancelAgentPlan }: ChatMessageProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    ref.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }, []);

  if (message.role === 'user') {
    return (
      <div ref={ref} className="chat-msg-enter flex justify-end mb-3">
        <div className="chat-bubble-user">
          <p className="text-sm leading-relaxed">{message.content}</p>
        </div>
      </div>
    );
  }

  // Assistant — output cards
  if (message.type === 'generating') {
    return (
      <div ref={ref} className="chat-msg-enter mb-4">
        <div className="flex items-start gap-3">
          <AssistantAvatar />
          <div className="flex-1 min-w-0 max-w-lg">
            <GeneratingCard message={message} />
          </div>
        </div>
      </div>
    );
  }

  if (message.type === 'output_video') {
    return (
      <div ref={ref} className="chat-msg-enter mb-4">
        <div className="flex items-start gap-3">
          <AssistantAvatar />
          <div className="flex-1 min-w-0 max-w-lg">
            <VideoOutputCard
              message={message}
              onRetry={onRetry && message.prompt
                ? () => onRetry(message.id, message.prompt!, message.intent ?? 'video', message.settings ?? {})
                : undefined}
            />
          </div>
        </div>
      </div>
    );
  }

  if (message.type === 'output_image') {
    return (
      <div ref={ref} className="chat-msg-enter mb-4">
        <div className="flex items-start gap-3">
          <AssistantAvatar />
          <div className="flex-1 min-w-0 max-w-md">
            <ImageOutputCard
              message={message}
              onRetry={onRetry && message.prompt
                ? () => onRetry(message.id, message.prompt!, message.intent ?? 'image', message.settings ?? {})
                : undefined}
              onUseForVideo={onUseForVideo}
            />
          </div>
        </div>
      </div>
    );
  }

  if (message.type === 'output_error') {
    return (
      <div ref={ref} className="chat-msg-enter mb-4">
        <div className="flex items-start gap-3">
          <AssistantAvatar />
          <div className="flex-1 min-w-0 max-w-md">
            <ErrorCard
              message={message}
              onRetry={onRetry && message.prompt
                ? () => onRetry(message.id, message.prompt!, message.intent ?? 'chat', message.settings ?? {})
                : undefined}
            />
          </div>
        </div>
      </div>
    );
  }

  if (message.type === 'agent_request' && message.agentRequest) {
    return (
      <div ref={ref} className="chat-msg-enter mb-4">
        <div className="flex items-start gap-3">
          <AssistantAvatar />
          <div className="flex-1 min-w-0 max-w-lg">
            <AgentRequestCard
              message={message}
              onConfirm={onConfirmAgentRequest ?? (() => {})}
              onCancel={onCancelAgentRequest ?? (() => {})}
            />
          </div>
        </div>
      </div>
    );
  }

  if (message.type === 'agent_plan' && message.agentPlan) {
    return (
      <div ref={ref} className="chat-msg-enter mb-4">
        <div className="flex items-start gap-3">
          <AssistantAvatar />
          <div className="flex-1 min-w-0 max-w-2xl">
            <AgentPlanCard
              message={message}
              onConfirm={onConfirmAgentPlan ?? (() => {})}
              onCancel={onCancelAgentPlan ?? (() => {})}
            />
          </div>
        </div>
      </div>
    );
  }

  // Plain text assistant message
  return (
    <div ref={ref} className="chat-msg-enter mb-5">
      <div className="flex items-start gap-3">
        <AssistantAvatar />
        <div className="flex-1 min-w-0 max-w-2xl pt-0.5">
          <p
            className="chat-assistant-text"
            dangerouslySetInnerHTML={{ __html: `<p>${parseMarkdown(message.content ?? '')}</p>` }}
          />
        </div>
      </div>
    </div>
  );
}

function AssistantAvatar() {
  return (
    <div className="flex-shrink-0 w-7 h-7 rounded-xl bg-primary/15 border border-primary/25 flex items-center justify-center mt-0.5">
      <div className="star-icon" style={{ width: 14, height: 14 }}>
        <MagicStar className="w-3.5 h-3.5" />
      </div>
    </div>
  );
}

/* ─── Typing indicator ──────────────────────────────────────────── */
export function TypingIndicator() {
  return (
    <div className="chat-msg-enter flex items-start gap-3 mb-4">
      <div className="flex-shrink-0 w-7 h-7 rounded-xl bg-primary/15 border border-primary/25 flex items-center justify-center">
        <div className="star-icon" style={{ width: 14, height: 14, animation: 'star-pulse 1s ease-in-out infinite' }}>
          <MagicStar className="w-3.5 h-3.5" />
        </div>
      </div>
      <div className="flex items-center gap-1.5 px-4 py-3 rounded-2xl bg-card border border-border/40 mt-0.5">
        <span className="chat-dot" style={{ animationDelay: '0ms' }} />
        <span className="chat-dot" style={{ animationDelay: '160ms' }} />
        <span className="chat-dot" style={{ animationDelay: '320ms' }} />
      </div>
    </div>
  );
}
