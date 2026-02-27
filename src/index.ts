import express from 'express';
import { Worker } from 'node:worker_threads';
import cors from 'cors';

import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { SYSTEM_PROMPT } from './Utils/constants.ts';
import { ChatID, ChatThread, Message, SessionID } from './Utils/types.ts';
import { countTokens } from './Utils/helpers.ts';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app = express();
const PORT = 5000;

// Enable CORS for all routes
app.use(cors());

// Middleware to parse JSON bodies
app.use(express.json());



// Initialize one worker (you can create a loop to spawn more for more parallel power)
const worker = new Worker(path.join(__dirname, 'worker.ts'), {
    execArgv: ['--experimental-strip-types']
});


// Map<SessionID, Map<ChatID, ChatThread>>
const sessions = new Map<SessionID, Map<ChatID, ChatThread>>();
//settings for the llm for now i will just add functionality to set system prompt
const sessionSettings = new Map<SessionID, { systemPrompt: string }>();
const pendingRequests = new Map();


app.post('/ask', (req, res) => {
    const { prompt, sessionId, chatId } = req.body;

    if (!sessionId || !chatId || !prompt) {
        return res.status(400).json({ error: "Missing sessionId, chatId, or prompt." });
    }

    // Access the User's Map of chats
    let userChats = sessions.get(sessionId);
    if (!userChats) {
        userChats = new Map<string, ChatThread>();
        sessions.set(sessionId, userChats);
    }

    // Get or Create the specific Chat Thread
    let thread = userChats.get(chatId);
    if (!thread) {
        // Fetch the custom settings for this session, or use default
        const currentSettings = sessionSettings.get(sessionId) || { systemPrompt: SYSTEM_PROMPT };

        thread = {
            id: chatId,
            title: prompt.substring(0, 40) + "...",
            messages: [
                { role: "system", content: currentSettings.systemPrompt }
            ],
            createdAt: Date.now()
        };
        userChats.set(chatId, thread);
    }

    // Add the user's message
    thread.messages.push({ role: "user", content: prompt });

    // Create a taskId that contains both IDs so the worker knows where to return the data
    const taskId = `${sessionId}|${chatId}|${Date.now()}`;

    // Store the response object so we can find it later
    pendingRequests.set(taskId, { res, sessionId, chatId });

    // Send to worker
    worker.postMessage({
        history: thread.messages,
        taskId
    });
});

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
        // Always reset to the current session-wide setting
        const currentSettings = sessionSettings.get(sessionId) || { systemPrompt: SYSTEM_PROMPT };

        thread.messages = [
            { role: "system", content: currentSettings.systemPrompt }
        ];
        return res.json({ success: true });
    }
    res.status(404).json({ error: "Chat not found." });
});

// Update or set session-wide settings
app.post('/settings', (req, res) => {
    const { sessionId, systemPrompt } = req.body;
    console.log("🚀 ~ sessionId, systemPrompt:", { sessionId, systemPrompt })

    if (!sessionId) return res.status(400).json({ error: "Missing sessionId" });

    sessionSettings.set(sessionId, {
        systemPrompt: systemPrompt || SYSTEM_PROMPT
    });

    console.log(`Settings updated for session: ${sessionId}`);

    console.log(sessionSettings.get(sessionId))
    res.json({ success: true, settings: sessionSettings.get(sessionId) });
});

// Get current session settings
app.get('/settings/:sessionId', (req, res) => {
    const settings = sessionSettings.get(req.params.sessionId) || { systemPrompt: SYSTEM_PROMPT };
    console.log("🚀 ~ settings:", settings)
    res.json(settings);
});

app.listen(PORT, () => {
    console.log(`\n🚀 Classic Express Server running at http://localhost:${PORT}`);
    console.log(`📡 Send POST requests to http://localhost:${PORT}/chat`);
});
