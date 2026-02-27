import { SessionID, ChatID, ChatThread } from '../Utils/types.ts';
import { SYSTEM_PROMPT } from '../Utils/constants.ts';

// Centralized State
export const sessions = new Map<SessionID, Map<ChatID, ChatThread>>();
export const sessionSettings = new Map<SessionID, { systemPrompt: string }>();
export const pendingRequests = new Map<string, any>();

// Helper to get settings or default
export const getSettings = (sessionId: string) => {
    return sessionSettings.get(sessionId) || { systemPrompt: SYSTEM_PROMPT };
};