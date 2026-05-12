import { useEffect, useRef } from 'react';
import type { ChatMessage } from '@/hooks/useChat';
import type { MarketingPlan } from '@/lib/aiRouter';
import type { AgentField } from '@/lib/aiRouter';
import { ChatMessageItem, TypingIndicator } from './ChatMessage';
import { ChatInput } from './ChatInput';
import { WelcomeScreen } from './WelcomeScreen';

interface ChatInterfaceProps {
  messages: ChatMessage[];
  isThinking: boolean;
  onSend: (text: string, file?: File | null) => void;
  onRetry: (msgId: string, prompt: string, intent: string, settings: Record<string, unknown>) => void;
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
  userName?: string | null;
}

export function ChatInterface({
  messages,
  isThinking,
  onSend,
  onRetry,
  onUseForVideo,
  onConfirmAgentRequest,
  onCancelAgentRequest,
  onConfirmAgentPlan,
  onCancelAgentPlan,
  userName,
}: ChatInterfaceProps) {
  const bottomRef = useRef<HTMLDivElement>(null);
  const isEmpty = messages.length === 0;

  useEffect(() => {
    if (!isEmpty) {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages.length, isThinking, isEmpty]);

  return (
    <div className="flex flex-col h-full min-h-0">

      {/* Messages */}
      <div className="flex-1 min-h-0 overflow-y-auto">
        {isEmpty ? (
          <WelcomeScreen userName={userName} />
        ) : (
          <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6">
            {/* Background blobs */}
            <div className="pointer-events-none fixed inset-0 overflow-hidden -z-10">
              <div className="aurora-blob-xl w-[600px] h-[600px] bg-primary/80 -top-48 -left-48" />
              <div className="aurora-blob-xl w-[500px] h-[500px] bg-violet-500 -bottom-32 -right-32" style={{ animationDelay: '7s' }} />
            </div>

            {messages.map(msg => (
              <ChatMessageItem
                key={msg.id}
                message={msg}
                onRetry={onRetry}
                onUseForVideo={onUseForVideo}
                onConfirmAgentRequest={onConfirmAgentRequest}
                onCancelAgentRequest={onCancelAgentRequest}
                onConfirmAgentPlan={onConfirmAgentPlan}
                onCancelAgentPlan={onCancelAgentPlan}
              />
            ))}

            {isThinking && <TypingIndicator />}
            <div ref={bottomRef} />
          </div>
        )}
      </div>

      {/* Input — extra mobile clearance keeps the composer away from the bottom nav */}
      <div className="flex-shrink-0 px-3 sm:px-6 pb-[112px] lg:pb-6 pt-2 max-w-5xl mx-auto w-full">
        <ChatInput onSend={onSend} disabled={isThinking} />
      </div>
    </div>
  );
}
