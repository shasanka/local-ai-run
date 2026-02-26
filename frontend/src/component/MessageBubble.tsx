import React from 'react'
import Markdown from 'react-markdown';
import rehypeHighlight from 'rehype-highlight';
import 'highlight.js/styles/github-dark.css';

type MessageProps = {
    role: 'user' | 'assistant' | 'system';
    content: string;
}

const MessageBubble: React.FC<MessageProps> = ({ role, content }) => {
    const isUser = role === 'user';

    return (
        <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}>
            <div className={`max-w-[85%] rounded-2xl px-4 py-2 ${isUser
                    ? 'bg-blue-600 text-white rounded-tr-none'
                    : 'bg-white border border-gray-200 text-gray-800 rounded-tl-none shadow-sm'
                }`}>
                <p className="text-[10px] font-bold uppercase mb-1 opacity-50">
                    {isUser ? 'You' : 'Qwen AI'}
                </p>

                {/* This is where the magic happens */}
                <div className="prose prose-sm max-w-none">
                    <Markdown rehypePlugins={[rehypeHighlight]}>
                        {content}
                    </Markdown>
                </div>
            </div>
        </div>
    );
};
export default MessageBubble