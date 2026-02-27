
import express from 'express';
import cors from 'cors';

// Import Routers
import { settingsRouter } from './routes/settings.ts';
import { pendingRequests, sessions } from './lib/SessionManager.ts';
import { countTokens } from './Utils/helpers.ts';
import { chatRouter } from './routes/chats.ts';
import { worker } from './lib/workerInstance.ts';
import { PORT } from './Utils/constants.ts';


const app = express();

app.use(cors());
app.use(express.json());



// Worker Message Handler (Kept here as it coordinates between routes)
worker.on('message', ({ updatedHistory, taskId }) => {
    const requestData = pendingRequests.get(taskId);
    if (requestData) {
        const { res, sessionId, chatId } = requestData;
        const thread = sessions.get(sessionId)?.get(chatId);
        if (thread) {
            thread.messages = updatedHistory;
            const visibleHistory = updatedHistory.filter((m: any) => m.role !== 'system');
            res.json({
                history: visibleHistory,
                tokenCount: countTokens(updatedHistory),
                contextCount: visibleHistory.length
            });
        }
        pendingRequests.delete(taskId);
    }
});

// Mount Routes
app.use('/chat', chatRouter); // /ask becomes /chat/ask
app.use('/settings', settingsRouter);

app.listen(PORT || 5000, () => console.log(`🚀 Server running on http://localhost:5000`));