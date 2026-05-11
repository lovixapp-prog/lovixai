import { useState, useCallback, useEffect } from 'react';
import type { ChatMessage } from './useChat';

export interface StoredChat {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  messages: ChatMessage[];
}

function storageKey(userId: string) {
  return `lovix_chats_v1_${userId}`;
}

function generateId() {
  return `chat_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
}

function titleFromMessages(messages: ChatMessage[]): string {
  const first = messages.find(m => m.role === 'user' && m.content);
  if (!first?.content) return 'New Chat';
  return first.content.slice(0, 48) + (first.content.length > 48 ? '…' : '');
}

function load(userId: string): StoredChat[] {
  try {
    const raw = localStorage.getItem(storageKey(userId));
    if (!raw) return [];
    const parsed = JSON.parse(raw) as StoredChat[];
    // Rehydrate Date objects
    return parsed.map(c => ({
      ...c,
      messages: c.messages.map(m => ({ ...m, timestamp: new Date(m.timestamp) })),
    }));
  } catch {
    return [];
  }
}

function save(userId: string, chats: StoredChat[]) {
  try {
    localStorage.setItem(storageKey(userId), JSON.stringify(chats));
  } catch {
    // Storage full — drop oldest chats
    const trimmed = chats.slice(-20);
    try {
      localStorage.setItem(storageKey(userId), JSON.stringify(trimmed));
    } catch {
      // Ignore storage failures; chat history is a convenience feature.
    }
  }
}

export function useChatHistory(userId: string | undefined) {
  const [chats, setChats] = useState<StoredChat[]>([]);
  const [activeChatId, setActiveChatId] = useState<string | null>(null);

  // Load from localStorage on mount
  useEffect(() => {
    if (!userId) return;
    const stored = load(userId);
    setChats(stored);
    if (stored.length > 0) {
      setActiveChatId(stored[0].id);
    }
  }, [userId]);

  const activeChat = chats.find(c => c.id === activeChatId) ?? null;

  const createNewChat = useCallback((): string => {
    const id = generateId();
    const newChat: StoredChat = {
      id,
      title: 'New Chat',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      messages: [],
    };
    setChats(prev => {
      const next = [newChat, ...prev];
      if (userId) save(userId, next);
      return next;
    });
    setActiveChatId(id);
    return id;
  }, [userId]);

  const loadChat = useCallback((chatId: string) => {
    setActiveChatId(chatId);
  }, []);

  const updateMessages = useCallback((chatId: string, messages: ChatMessage[]) => {
    setChats(prev => {
      const next = prev.map(c => {
        if (c.id !== chatId) return c;
        return {
          ...c,
          messages,
          title: titleFromMessages(messages),
          updatedAt: new Date().toISOString(),
        };
      });
      if (userId) save(userId, next);
      return next;
    });
  }, [userId]);

  const deleteChat = useCallback((chatId: string) => {
    setChats(prev => {
      const next = prev.filter(c => c.id !== chatId);
      if (userId) save(userId, next);
      return next;
    });
    setActiveChatId(prev => {
      if (prev !== chatId) return prev;
      const remaining = chats.filter(c => c.id !== chatId);
      return remaining[0]?.id ?? null;
    });
  }, [userId, chats]);

  // Ensure there's always at least one chat
  const ensureChat = useCallback((): string => {
    if (activeChatId) return activeChatId;
    return createNewChat();
  }, [activeChatId, createNewChat]);

  return {
    chats,
    activeChatId,
    activeChat,
    createNewChat,
    loadChat,
    updateMessages,
    deleteChat,
    ensureChat,
  };
}
