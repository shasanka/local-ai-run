import { Router } from 'express';
import { sessions, pendingRequests, getSettings, sessionSettings } from '../lib/SessionManager.ts';
import { countTokens } from '../Utils/helpers.ts';
import { Message } from '../Utils/types.ts';
import { SYSTEM_PROMPT } from '../Utils/constants.ts';
import { worker } from '../lib/workerInstance.ts';

const router = Router();

router.post('/ask', (req, res) => {
    const { prompt, sessionId, chatId } = req.body;
    if (!sessionId || !chatId || !prompt) return res.status(400).json({ error: "Missing data" });

    let userChats = sessions.get(sessionId);
    if (!userChats) {
        userChats = new Map();
        sessions.set(sessionId, userChats);
    }

    let thread = userChats.get(chatId);
    if (!thread) {
        const settings = getSettings(sessionId);
        thread = {
            id: chatId,
            title: prompt.substring(0, 40) + "...",
            messages: [{ role: "system", content: settings.systemPrompt }],
            createdAt: Date.now()
        };
        userChats.set(chatId, thread);
    }

    thread.messages.push({ role: "user", content: prompt });
    const taskId = `${sessionId}|${chatId}|${Date.now()}`;
    pendingRequests.set(taskId, { res, sessionId, chatId });

    worker.postMessage({ history: thread.messages, taskId });
});

// router.post('/reset-chat', (req, res) => {
//     const { sessionId, chatId } = req.body;
//     const thread = sessions.get(sessionId)?.get(chatId);
//     if (thread) {
//         thread.messages = [{ role: "system", content: getSettings(sessionId).systemPrompt }];
//         return res.json({ success: true });
//     }
//     res.status(404).json({ error: "Chat not found" });
// });

router.post('/delete-chat', (req, res) => {
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

router.post('/reset-chat', (req, res) => {
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


router.get('/session/:sessionId/:chatId', (req, res) => {
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

router.get('/sessions/:sessionId/chats', (req, res) => {
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



export const chatRouter = router;