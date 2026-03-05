import { Router } from 'express';
import { sessionSettings, getSettings } from '../lib/SessionManager.ts';
import { SYSTEM_PROMPT } from '../Utils/constants.ts';

const router = Router();

router.post('/', (req, res) => {
    const { sessionId, systemPrompt, temperature } = req.body;
    if (!sessionId) return res.status(400).json({ error: "Missing sessionId" });

    sessionSettings.set(sessionId, {
        systemPrompt: systemPrompt || SYSTEM_PROMPT,
        temperature: temperature ?? 0.7 // Use nullish coalescing to allow 0
    });
    res.json({ success: true, settings: getSettings(sessionId) });
});

router.get('/:sessionId', (req, res) => {
    res.json(getSettings(req.params.sessionId));
});

export const settingsRouter = router;