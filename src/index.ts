import express from 'express';
import { Worker } from 'node:worker_threads';
import cors from 'cors';
import { getEncoding } from "js-tiktoken";

import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { Message } from './chat.ts';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app = express();
const PORT = 5000;

// 2. Enable CORS for all routes
app.use(cors());

// Middleware to parse JSON bodies
app.use(express.json());

// Initialize the encoder
const enc = getEncoding("cl100k_base");

// Initialize one worker (you can create a loop to spawn more for more parallel power)
const worker = new Worker(path.join(__dirname, 'worker.ts'), {
    execArgv: ['--experimental-strip-types']
});

// const sessions = new Map<string, any[]>();
interface ChatThread {
    id: string;
    title: string;
    messages: Message[];
    createdAt: number;
}

type SessionID = string
type ChatID = string

// Map<SessionID, Map<ChatID, ChatThread>>
const sessions = new Map<SessionID, Map<ChatID, ChatThread>>();
const pendingRequests = new Map();

// 1. Define the persona at the top level
const SYSTEM_PROMPT = `You are an expert Senior Software Engineer and technical mentor. 
Your goal is to provide clean, efficient, and well-documented code.
- Always specify the language in markdown code blocks.
- Prefer modern ES6+ syntax for JavaScript/TypeScript.
- If a request is ambiguous, ask for clarification before writing code.
- Be concise: explain "why" only if it's not obvious from the code.`;

app.post('/ask', (req, res) => {
    const { prompt, sessionId, chatId } = req.body;

    if (!sessionId || !chatId || !prompt) {
        return res.status(400).json({ error: "Missing sessionId, chatId, or prompt." });
    }

    // 2. Access the User's Map of chats
    let userChats = sessions.get(sessionId);
    if (!userChats) {
        userChats = new Map<string, ChatThread>();
        sessions.set(sessionId, userChats);
    }

    // 3. Get or Create the specific Chat Thread
    let thread = userChats.get(chatId);
    if (!thread) {
        console.log(`🧵 Creating new thread: ${chatId} for session: ${sessionId}`);
        thread = {
            id: chatId,
            title: prompt.substring(0, 40) + "...", // Auto-generate title from first prompt
            messages: [
                { role: "system", content: SYSTEM_PROMPT }
            ],
            createdAt: Date.now()
        };
        userChats.set(chatId, thread);
    }

    // 4. Add the user's message
    thread.messages.push({ role: "user", content: prompt });

    // 5. Create a taskId that contains both IDs so the worker knows where to return the data
    const taskId = `${sessionId}|${chatId}|${Date.now()}`;

    // Store the response object so we can find it later
    pendingRequests.set(taskId, { res, sessionId, chatId });

    // 6. Send to worker
    worker.postMessage({
        history: thread.messages,
        taskId
    });
});

// Helper to count tokens in the history array
const countTokens = (history: any[]) => {
    return history.reduce((acc, msg) => {
        // Encode content and add 4 tokens for message metadata/delimiters
        return acc + enc.encode(msg.content).length + 4;
    }, 0);
};

// When the worker finishes...
worker.on('message', ({ updatedHistory, taskId }) => {
    const requestData = pendingRequests.get(taskId);

    if (requestData) {
        const { res, sessionId, chatId } = requestData;

        // Find the user's chat map
        const userChats = sessions.get(sessionId);
        if (userChats) {
            const thread = userChats.get(chatId);
            if (thread) {
                // Update the messages in the specific thread
                thread.messages = updatedHistory;

                const tokenCount = countTokens(updatedHistory);
                const visibleHistory = updatedHistory.filter((m: any) => m.role !== 'system');

                res.json({
                    history: visibleHistory,
                    tokenCount: tokenCount,
                    contextCount: visibleHistory.length
                });
            }
        }
        pendingRequests.delete(taskId);
    }
});

app.post('/reset', (req, res) => {
    const { sessionId } = req.body;

    if (!sessionId) {
        return res.status(400).json({ error: "sessionId is required." });
    }

    const deleted = sessions.delete(sessionId);

    console.log(deleted ? `All chats for session ${sessionId} cleared.` : `No session found for ${sessionId}`);

    res.json({ success: true, existed: deleted });
});

app.get('/session/:sessionId/:chatId', (req, res) => {
    const { sessionId, chatId } = req.params;

    const userChats = sessions.get(sessionId);
    const thread = userChats?.get(chatId);

    if (!thread) {
        return res.json({ history: [], tokenCount: 0, contextCount: 0 });
    }

    const tokenCount = countTokens(thread.messages);
    const visibleHistory = thread.messages.filter((m: Message) => m.role !== 'system');

    res.json({
        history: visibleHistory,
        tokenCount: tokenCount,
        contextCount: visibleHistory.length
    });
});

app.get('/sessions/:sessionId/chats', (req, res) => {
    const { sessionId } = req.params;
    const userChats = sessions.get(sessionId);

    if (!userChats) {
        return res.json([]); // Return empty list if session doesn't exist
    }

    // Convert the Map of threads into an array of metadata for the sidebar
    const chatSummary = Array.from(userChats.values()).map(thread => ({
        id: thread.id,
        title: thread.title,
        createdAt: thread.createdAt
    })).sort((a, b) => b.createdAt - a.createdAt); // Newest chats on top

    res.json(chatSummary);
});

app.post('/delete-chat', (req, res) => {
    const { sessionId, chatId } = req.body;

    if (!sessionId || !chatId) {
        return res.status(400).json({ error: "Missing sessionId or chatId." });
    }

    const userChats = sessions.get(sessionId);
    if (userChats) {
        const deleted = userChats.delete(chatId);
        if (deleted) {
            console.log(`Deleted chat ${chatId} from session ${sessionId}`);
            return res.json({ success: true });
        }
    }

    res.status(404).json({ error: "Chat not found." });
});


app.post('/reset-chat', (req, res) => {
    const { sessionId, chatId } = req.body;

    const userChats = sessions.get(sessionId);
    const thread = userChats?.get(chatId);

    if (thread) {
        // Reset to just the system prompt
        thread.messages = [{ role: "system", content: SYSTEM_PROMPT }];
        return res.json({ success: true });
    }

    res.status(404).json({ error: "Chat not found." });
});


app.listen(PORT, () => {
    console.log(`\n🚀 Classic Express Server running at http://localhost:${PORT}`);
    console.log(`📡 Send POST requests to http://localhost:${PORT}/chat`);
});




