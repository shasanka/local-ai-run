export interface Message {
    role: 'system' | 'user' | 'assistant';
    content: string;
}

export interface ChatThread {
    id: string;
    title: string;
    messages: Message[];
    createdAt: number;
}

export declare type SessionID = string
export declare type ChatID = string