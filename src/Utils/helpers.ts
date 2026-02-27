// Helper to count tokens in the history array

import { getEncoding } from "js-tiktoken";

// Initialize the encoder
export const enc = getEncoding("cl100k_base");

export const countTokens = (history: any[]) => {
    return history.reduce((acc, msg) => {
        // Encode content and add 4 tokens for message metadata/delimiters
        return acc + enc.encode(msg.content).length + 4;
    }, 0);
};
