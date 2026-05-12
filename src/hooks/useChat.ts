import { useState, useCallback, useEffect, useRef } from 'react';
import { detectIntent, RouterResult } from '@/lib/aiRouter';
import type { AgentField, MarketingPlan } from '@/lib/aiRouter';
import { callAPI } from '@/lib/api';
import { supabase } from '@/integrations/supabase/client';

export type MessageStatus = 'pending' | 'processing' | 'completed' | 'failed';

export type AgentRequestData = {
  intent: string;
  fields: AgentField[];
  status: 'pending' | 'confirmed' | 'cancelled';
  intro?: string;
};

export type AgentPlanData = {
  intent: string;
  status: 'pending' | 'accepted' | 'cancelled';
  intro?: string;
  plan: MarketingPlan;
};

export type ChatMessage = {
  id: string;
  role: 'user' | 'assistant';
  type: 'text' | 'generating' | 'output_video' | 'output_image' | 'output_error' | 'nav' | 'agent_request' | 'agent_plan';
  content?: string;
  outputUrl?: string;
  outputType?: 'video' | 'image';
  error?: string;
  status?: MessageStatus;
  progress?: number;
  intent?: AIIntent;
  settings?: Record<string, unknown>;
  prompt?: string;
  agentRequest?: AgentRequestData;
  agentPlan?: AgentPlanData;
  timestamp: Date;
};

type AIIntent = 'video' | 'image' | 'ugc' | 'influencer' | 'motion' | 'creations' | 'assets' | 'credits' | 'chat';

function uid(): string {
  return `m_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
}

interface UseChatOptions {
  userId: string | undefined;
  chatId: string | null;
  initialMessages?: ChatMessage[];
  onCreditsUpdate: () => void;
  onNavigate?: (tab: string) => void;
  onMessagesChange?: (messages: ChatMessage[]) => void;
}

export function useChat({
  userId,
  chatId,
  initialMessages = [],
  onCreditsUpdate,
  onNavigate,
  onMessagesChange,
}: UseChatOptions) {
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [isThinking, setIsThinking] = useState(false);
  const prevChatId = useRef<string | null>(null);

  useEffect(() => {
    if (chatId !== prevChatId.current) {
      prevChatId.current = chatId;
      setMessages(initialMessages);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chatId]);

  const add = useCallback((msg: Omit<ChatMessage, 'id' | 'timestamp'>): string => {
    const id = uid();
    setMessages(prev => {
      const next = [...prev, { ...msg, id, timestamp: new Date() }];
      onMessagesChange?.(next);
      return next;
    });
    return id;
  }, [onMessagesChange]);

  const update = useCallback((id: string, patch: Partial<ChatMessage>) => {
    setMessages(prev => {
      const next = prev.map(m => m.id === id ? { ...m, ...patch } : m);
      onMessagesChange?.(next);
      return next;
    });
  }, [onMessagesChange]);

  const sendMessage = useCallback(async (text: string, attachedFile?: File | null) => {
    if (!userId || !text.trim()) return;

    add({ role: 'user', type: 'text', content: text });
    setIsThinking(true);

    const result = detectIntent(text);
    const openRouterResult = await enhanceWithOpenRouter(text, result, messages).catch((error: unknown) => ({
      error: error instanceof Error ? error.message : 'AI agent unavailable',
    }));
    setIsThinking(false);

    if (result.needsPlan) {
      if ('error' in (openRouterResult ?? {})) {
        add({
          role: 'assistant',
          type: 'text',
          content: 'Non riesco a elaborare il piano con l’agente AI in questo momento. Riprova tra poco.',
        });
        return;
      }

      if (!openRouterResult?.plan) {
        add({
          role: 'assistant',
          type: 'text',
          content: 'L’agente AI non ha restituito un piano valido. Riprova con qualche dettaglio in più sul prodotto, formato o obiettivo.',
        });
        return;
      }

      add({
        role: 'assistant',
        type: 'agent_plan',
        intent: result.intent as AIIntent,
        agentPlan: {
          intent: result.intent,
          status: 'pending',
          intro: openRouterResult.responseText || result.responseText,
          plan: openRouterResult.plan,
        },
        settings: result.settings,
        prompt: text,
      });
      return;
    }

    if (result.intent === 'chat') {
      const aiText = openRouterResult && !('error' in openRouterResult) ? openRouterResult.responseText : undefined;
      add({ role: 'assistant', type: 'text', content: aiText || result.responseText });
      return;
    }

    if (['creations', 'assets', 'credits', 'influencer'].includes(result.intent)) {
      add({ role: 'assistant', type: 'text', content: getNavResponse(result.intent, text) });
      onNavigate?.(result.intent);
      return;
    }

    if (result.needsPlan && result.plan) {
      add({
        role: 'assistant',
        type: 'agent_plan',
        intent: result.intent as AIIntent,
        agentPlan: {
          intent: result.intent,
          status: 'pending',
          intro: result.responseText,
          plan: result.plan,
        },
        settings: result.settings,
        prompt: text,
      });
      return;
    }

    // Intent needs info gathering before generating
    if (result.needsInfo && result.agentFields) {
      add({
        role: 'assistant',
        type: 'agent_request',
        intent: result.intent as AIIntent,
        agentRequest: {
          intent: result.intent,
          fields: result.agentFields,
          status: 'pending',
          intro: result.responseText,
        },
        settings: result.settings,
        prompt: text,
      });
      return;
    }

    const cardId = add({
      role: 'assistant',
      type: 'generating',
      content: getGeneratingMessage(result.intent),
      intent: result.intent as AIIntent,
      status: 'pending',
      progress: 0,
      settings: result.settings,
      prompt: text,
    });

    try {
      await runGeneration(result, text, attachedFile, cardId, userId, update, onCreditsUpdate);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Generation failed. Please try again.';
      update(cardId, { type: 'output_error', error: msg, status: 'failed', progress: 0 });
    }
  }, [userId, add, update, onCreditsUpdate, onNavigate, messages]);

  const confirmAgentPlan = useCallback(async (
    msgId: string,
    intent: string,
    originalPrompt: string,
    originalSettings: Record<string, unknown>,
    plan: MarketingPlan,
  ) => {
    if (!userId) return;

    update(msgId, {
      agentPlan: {
        intent,
        status: 'accepted',
        plan,
      },
    });

    const finalPrompt = plan.finalPrompt || originalPrompt;
    const mergedSettings = {
      ...originalSettings,
      planTitle: plan.title,
      marketingStrategy: plan.strategy,
      scriptOutline: plan.scriptOutline,
      shotList: plan.shotList,
      finalPrompt,
      ...(plan.ugcBrief ? {
        productName: plan.ugcBrief.productName,
        productUrl: plan.ugcBrief.productUrl,
        offerType: plan.ugcBrief.offerType,
        influencerMode: plan.ugcBrief.influencerMode,
        platform: plan.ugcBrief.platform,
        aspectRatio: plan.ugcBrief.aspectRatio,
        duration: Number(plan.ugcBrief.durationSeconds),
        ad_style: plan.ugcBrief.visualStyle,
        language: plan.ugcBrief.language,
        callToAction: plan.ugcBrief.callToAction,
      } : {}),
    };

    if (intent === 'ugc') {
      add({
        role: 'assistant',
        type: 'agent_request',
        intent: 'ugc',
        agentRequest: {
          intent: 'ugc',
          fields: [
            {
              id: 'productName',
              type: 'text',
              label: 'Product / Service / App Name',
              subtitle: 'Which offer should this plan sell?',
              placeholder: 'Product or brand name',
              required: true,
            },
            {
              id: 'productUrl',
              type: 'text',
              label: 'Product / Service / App URL',
              subtitle: 'Optional, but useful to extract positioning and proof.',
              placeholder: 'https://...',
              required: false,
            },
            {
              id: 'script',
              type: 'textarea',
              label: 'Script Direction',
              subtitle: 'You can keep this outline or refine the exact words.',
              placeholder: plan.scriptOutline.join('\n'),
              required: true,
            },
            {
              id: 'influencerMode',
              type: 'select',
              label: 'Influencer Source',
              subtitle: 'Choose how LOVIX should handle the presenter.',
              required: false,
              options: [
                { value: 'my_influencer', label: 'Use my influencer' },
                { value: 'generate_new', label: 'Generate new influencer' },
                { value: 'upload_creator', label: 'Upload creator photo' },
                { value: 'no_preference', label: 'No preference' },
              ],
            },
            {
              id: 'aspectRatio',
              type: 'select',
              label: 'Format',
              required: false,
              options: [
                { value: '9:16', label: '9:16 Vertical' },
                { value: '1:1', label: '1:1 Square' },
                { value: '16:9', label: '16:9 Horizontal' },
              ],
            },
            {
              id: 'influencer_image',
              type: 'file_upload',
              label: 'Creator Image',
              subtitle: 'Optional. Upload a creator/influencer image if you want a specific presenter.',
              required: false,
              accept: 'image/jpeg,image/png,image/webp',
            },
          ],
          status: 'pending',
          intro: 'Piano approvato. Prima di generare il video UGC, confermiamo prodotto, script e creator.',
        },
        settings: mergedSettings,
        prompt: finalPrompt,
      });
      return;
    }

    const cardId = add({
      role: 'assistant',
      type: 'generating',
      content: getGeneratingMessage(intent),
      intent: intent as AIIntent,
      status: 'pending',
      progress: 0,
      settings: mergedSettings,
      prompt: finalPrompt,
    });

    const fakeResult: RouterResult = {
      intent: intent as AIIntent,
      confidence: 1,
      prompt: finalPrompt,
      settings: mergedSettings,
    };

    try {
      await runGeneration(fakeResult, finalPrompt, null, cardId, userId, update, onCreditsUpdate);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Generation failed.';
      update(cardId, { type: 'output_error', error: msg, status: 'failed', progress: 0 });
    }
  }, [userId, add, update, onCreditsUpdate]);

  const cancelAgentPlan = useCallback((msgId: string, intent: string, plan: MarketingPlan) => {
    update(msgId, {
      agentPlan: {
        intent,
        plan,
        status: 'cancelled',
      },
    });
  }, [update]);

  const confirmAgentRequest = useCallback(async (
    msgId: string,
    intent: string,
    prompt: string,
    originalSettings: Record<string, unknown>,
    agentFields: AgentField[],
    collectedData: Record<string, string | File>,
  ) => {
    if (!userId) return;

    // Mark agent_request as confirmed
    update(msgId, {
      agentRequest: {
        intent,
        fields: agentFields,
        status: 'confirmed',
      },
    });

    const mergedSettings = { ...originalSettings, ...collectedData };

    const cardId = add({
      role: 'assistant',
      type: 'generating',
      content: getGeneratingMessage(intent),
      intent: intent as AIIntent,
      status: 'pending',
      progress: 0,
      settings: mergedSettings,
      prompt,
    });

    // Extract file if any (e.g. motion source_asset)
    const sourceFile = collectedData.source_asset instanceof File
      ? collectedData.source_asset
      : null;

    const fakeResult: RouterResult = {
      intent: intent as AIIntent,
      confidence: 1,
      prompt,
      settings: mergedSettings,
    };

    try {
      await runGeneration(fakeResult, prompt, sourceFile, cardId, userId, update, onCreditsUpdate);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Generation failed.';
      update(cardId, { type: 'output_error', error: msg, status: 'failed', progress: 0 });
    }
  }, [userId, add, update, onCreditsUpdate]);

  const cancelAgentRequest = useCallback((msgId: string, agentFields: AgentField[], intent: string) => {
    update(msgId, {
      agentRequest: {
        intent,
        fields: agentFields,
        status: 'cancelled',
      },
    });
  }, [update]);

  const retryGeneration = useCallback(async (msgId: string, prompt: string, intent: AIIntent, settings: Record<string, unknown>) => {
    if (!userId) return;
    update(msgId, { type: 'generating', status: 'pending', progress: 0, error: undefined, content: getGeneratingMessage(intent) });
    const fakeResult: RouterResult = { intent, confidence: 1, prompt, settings };
    try {
      await runGeneration(fakeResult, prompt, null, msgId, userId, update, onCreditsUpdate);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Retry failed.';
      update(msgId, { type: 'output_error', error: msg, status: 'failed', progress: 0 });
    }
  }, [userId, update, onCreditsUpdate]);

  return { messages, isThinking, sendMessage, retryGeneration, confirmAgentRequest, cancelAgentRequest, confirmAgentPlan, cancelAgentPlan };
}

type ChatAgentApiResponse = {
  success: boolean;
  error?: string;
  result?: {
    responseText?: string;
    needsPlan?: boolean;
    plan?: MarketingPlan | null;
    model?: string;
  };
};

async function enhanceWithOpenRouter(
  text: string,
  localResult: RouterResult,
  messages: ChatMessage[],
): Promise<ChatAgentApiResponse['result'] | null> {
  if (localResult.intent !== 'chat' && !localResult.needsPlan) return null;

  const history = messages
    .filter(m => (m.role === 'user' || m.role === 'assistant') && m.content)
    .slice(-8)
    .map(m => ({ role: m.role, content: m.content! }));

  const res = await callAPI<ChatAgentApiResponse>('chat-agent', {
    message: text,
    history,
    localResult: {
      intent: localResult.intent,
      responseText: localResult.responseText,
      needsPlan: localResult.needsPlan,
      settings: localResult.settings,
      plan: localResult.plan,
    },
  });

  if (!res.success || !res.result) return null;
  return res.result;
}

function getNavResponse(intent: string, _text: string): string {
  const map: Record<string, string> = {
    creations: 'Opening your creations library...',
    assets: 'Opening your files & assets...',
    credits: 'Opening credits & plans...',
    influencer: 'Opening the AI Influencer tool — create and manage your AI personas there. ✦',
  };
  return map[intent] ?? 'Opening...';
}

function getGeneratingMessage(intent: string): string {
  const msgs: Record<string, string> = {
    video: 'Creating your video...',
    image: 'Generating your image...',
    ugc: 'Building your UGC ad...',
    influencer: 'Crafting your AI influencer...',
    motion: 'Applying motion...',
  };
  return msgs[intent] || 'Working on it...';
}

async function runGeneration(
  result: RouterResult,
  text: string,
  attachedFile: File | null | undefined,
  cardId: string,
  userId: string,
  update: (id: string, patch: Partial<ChatMessage>) => void,
  onCreditsUpdate: () => void,
) {
  let referenceImageUrl: string | null = null;

  if (attachedFile) {
    const ext = attachedFile.name.split('.').pop() ?? 'jpg';
    const path = `${userId}/chat-ref-${Date.now()}.${ext}`;
    const { data, error } = await supabase.storage.from('generations').upload(path, attachedFile, { contentType: attachedFile.type });
    if (!error && data) {
      const { data: urlData } = supabase.storage.from('generations').getPublicUrl(data.path);
      referenceImageUrl = urlData.publicUrl;
    }
  }

  update(cardId, { status: 'processing', progress: 15 });

  switch (result.intent) {
    case 'video': {
      const s = result.settings;
      const res = await callAPI<{ success: boolean; generationId?: string; creditsUsed?: number; error?: string }>(
        'generate-video',
        { prompt: text, seconds: s.seconds ?? 5, aspectRatio: s.aspectRatio ?? '16:9', quality: s.quality ?? 'hd', referenceImageUrl },
      );
      if (!res.success) throw new Error(res.error ?? 'Video generation failed');
      update(cardId, { progress: 25 });
      await pollStatus(res.generationId!, 'check-video-status', cardId, 'video', update, onCreditsUpdate);
      break;
    }

    case 'image': {
      const s = result.settings;
      const res = await callAPI<{ success: boolean; imageUrl?: string; generationId?: string; creditsUsed?: number; error?: string }>(
        'generate-image',
        { prompt: text, style: s.style ?? 'photorealistic', quality: 'hd', imageUrl: referenceImageUrl },
      );
      if (!res.success) throw new Error(res.error ?? 'Image generation failed');
      if (res.imageUrl) {
        update(cardId, { type: 'output_image', outputUrl: res.imageUrl, outputType: 'image', status: 'completed', progress: 100 });
        onCreditsUpdate();
      } else if (res.generationId) {
        update(cardId, { progress: 40 });
        await pollStatus(res.generationId, 'check-video-status', cardId, 'image', update, onCreditsUpdate);
      }
      break;
    }

    case 'motion': {
      if (!referenceImageUrl) throw new Error('Please upload a video or image to animate.');
      const s = result.settings;
      // Detect if uploaded file was video or image based on isSourceVideo flag set in confirmAgentRequest
      const isSourceVideo = s.isSourceVideo === true;
      const res = await callAPI<{ success: boolean; generationId?: string; creditsUsed?: number; error?: string }>(
        'generate-motion',
        {
          prompt: text || 'natural smooth motion, cinematic movement',
          imageUrl: !isSourceVideo ? referenceImageUrl : undefined,
          videoUrl: isSourceVideo ? referenceImageUrl : undefined,
          quality: s.motion_style === 'cinematic' ? 'pro' : 'std',
          duration: '5',
        },
      );
      if (!res.success) throw new Error(res.error ?? 'Motion generation failed');
      update(cardId, { progress: 25 });
      await pollStatus(res.generationId!, 'check-motion-status', cardId, 'video', update, onCreditsUpdate);
      break;
    }

    case 'ugc': {
      const s = result.settings;
      // influencer_image may have been uploaded separately — its URL is in s.influencerImageUrl
      const res = await callAPI<{ success: boolean; generationId?: string; creditsUsed?: number; error?: string }>(
        'generate-ugc-video',
        {
          productName: String(s.productName ?? text),
          productUrl: s.productUrl ? String(s.productUrl) : undefined,
          script: String(s.script ?? s.finalPrompt ?? text),
          style: String(s.ad_style ?? 'authentic'),
          platform: s.platform ? String(s.platform) : undefined,
          influencerMode: s.influencerMode ? String(s.influencerMode) : undefined,
          offerType: s.offerType ? String(s.offerType) : undefined,
          callToAction: s.callToAction ? String(s.callToAction) : undefined,
          influencerImageUrl: s.influencerImageUrl ?? referenceImageUrl ?? undefined,
          aspectRatio: String(s.aspectRatio ?? '9:16'),
          duration: Number(s.duration ?? 5),
        },
      );
      if (!res.success) throw new Error(res.error ?? 'UGC generation failed');
      update(cardId, { progress: 25 });
      await pollStatus(res.generationId!, 'check-video-status', cardId, 'video', update, onCreditsUpdate);
      break;
    }

    default:
      throw new Error(`"${result.intent}" — use the sidebar tools for full controls.`);
  }
}

async function pollStatus(
  generationId: string,
  endpoint: string,
  cardId: string,
  outputType: 'video' | 'image',
  update: (id: string, patch: Partial<ChatMessage>) => void,
  onCreditsUpdate: () => void,
) {
  const MAX = 72;
  for (let i = 0; i < MAX; i++) {
    await new Promise(r => setTimeout(r, 5000));
    const res = await callAPI<{ status: string; resultUrl?: string; error?: string }>(endpoint, { generationId });
    const progress = Math.min(25 + Math.round(((i + 1) / MAX) * 72), 95);
    update(cardId, { progress });
    if (res.status === 'completed' && res.resultUrl) {
      update(cardId, {
        type: outputType === 'video' ? 'output_video' : 'output_image',
        outputUrl: res.resultUrl,
        outputType,
        status: 'completed',
        progress: 100,
      });
      onCreditsUpdate();
      return;
    }
    if (res.status === 'failed') throw new Error(res.error ?? 'Generation failed on server');
  }
  throw new Error('Generation timed out — please try again');
}
