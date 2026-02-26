// src/components/MessageRow.tsx
import React from 'react';
import Markdown from 'react-markdown';
import rehypeHighlight from 'rehype-highlight';
import 'highlight.js/styles/github-dark.css';

export const MessageRow: React.FC<{ role: string, content: string }> = ({ role, content }) => {
    const isUser = role === 'user';

    return (
        <div className={`flex w-full mb-8 ${isUser ? 'justify-end' : 'justify-start'}`}>
            <div className={`flex gap-4 min-w-0 ${isUser ? 'flex-row-reverse max-w-[75%]' : 'w-full'}`}>

                <div className={`w-8 h-8 rounded shrink-0 flex items-center justify-center font-bold text-[10px] text-white ${isUser ? 'bg-indigo-600' : 'bg-emerald-600'}`}>
                    {isUser ? 'U' : 'AI'}
                </div>

                {/* Use min-w-0 to allow internal text to wrap correctly */}
                <div className={`min-w-0 px-4 py-2 rounded-2xl ${isUser
                    ? 'bg-indigo-600 text-white rounded-tr-none'
                    : 'bg-transparent w-full'
                    }`}>
                    <div className={`
        prose max-w-none break-words overflow-hidden leading-relaxed
        ${isUser
                            ? 'prose-invert text-white'
                            : `text-slate-700 dark:text-slate-300/90 dark:prose-invert 
               /* Force code block background and borders */
               [&_pre]:bg-slate-800/80 
               [&_pre]:border 
               [&_pre]:border-slate-700 
               [&_pre]:rounded-xl
               [&_code]:bg-transparent
               /* Optional: Style inline code pills */
               [&_p_code]:bg-slate-800 
               [&_p_code]:px-1.5 
               [&_p_code]:py-0.5 
               [&_p_code]:rounded-md 
               [&_p_code]:text-indigo-300`
                        }
    `}>
                        <Markdown rehypePlugins={[rehypeHighlight]}>
                            {content}
                        </Markdown>
                    </div>
                </div>
            </div>
        </div>
    );
};