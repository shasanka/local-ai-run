
/** * The base URL for the backend Express server.
 * Change this value here to update the endpoint across the entire application.
 */
const API_BASE_URL = 'http://localhost:5000';

/**
 * A centralized registry of all API endpoints used by the application.
 * Categorized by feature area to maintain scalability and readability.
 */
export const API_ENDPOINTS = {
    /** Chat-related endpoints for messaging and thread management */
    CHAT: {
        /** POST: Send a new prompt to the LLM */
        ASK: `${API_BASE_URL}/chat/ask`,

        /** POST: Clear message history but preserve the current system prompt */
        RESET: `${API_BASE_URL}/chat/reset-chat`,

        /** POST: Completely remove a chat thread from the session */
        DELETE: `${API_BASE_URL}/chat/delete-chat`,

        /** * GET: Fetch all messages for a specific chat thread 
         * @param sessionId - The unique ID of the user session
         * @param chatId - The unique ID of the chat thread
         */
        SESSION: (sessionId: string, chatId: string) =>
            `${API_BASE_URL}/chat/session/${sessionId}/${chatId}`,

        /** * GET: Fetch a list of all chat threads for a given user 
         * @param sessionId - The unique ID of the user session
         */
        HISTORY: (sessionId: string) =>
            `${API_BASE_URL}/chat/sessions/${sessionId}/chats`,
    },

    /** Settings-related endpoints for LLM configuration */
    SETTINGS: {
        /** POST: Update session-wide settings like the Personality (System Prompt) */
        BASE: `${API_BASE_URL}/settings`,

        /** * GET: Retrieve the current settings for a specific session 
         * @param sessionId - The unique ID of the user session
         */
        GET: (sessionId: string) =>
            `${API_BASE_URL}/settings/${sessionId}`,
    }
};