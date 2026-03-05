import { SessionID, ChatID, ChatThread } from '../Utils/types.ts';
import { SYSTEM_PROMPT } from '../Utils/constants.ts';

// Centralized State
export const sessions = new Map<SessionID, Map<ChatID, ChatThread>>();
export const sessionSettings = new Map<SessionID, { systemPrompt: string; temperature: number }>();
export const pendingRequests = new Map<string, any>();

// Helper to get settings or default
export const getSettings = (sessionId: string) => {
    return sessionSettings.get(sessionId) || {
        systemPrompt: SYSTEM_PROMPT,
        temperature: 0.7 // Default LLM temperature
    };
}