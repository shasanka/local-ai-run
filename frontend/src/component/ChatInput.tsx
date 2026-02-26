import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react';

interface ChatInputProps {
    onSend: (text: string) => void;
    disabled: boolean;
}

const ChatInput = forwardRef<HTMLTextAreaElement, ChatInputProps>(({ onSend, disabled }, ref) => {
    const [input, setInput] = useState('');
    const internalRef = useRef<HTMLTextAreaElement>(null);

    // This exposes the internal textarea to the parent component's ref
    useImperativeHandle(ref, () => internalRef.current!);

    // Your existing Auto-resize logic
    useEffect(() => {
        const textarea = internalRef.current;
        if (textarea) {
            textarea.style.height = 'auto';
            const nextHeight = Math.min(textarea.scrollHeight, 300);
            textarea.style.height = `${nextHeight}px`;
        }
    }, [input]);

    const handleSend = () => {
        if (input.trim() && !disabled) {
            onSend(input);
            setInput('');
        }
    };

    return (
        <div className="relative flex items-end gap-2 w-full">
            <textarea
                ref={internalRef} // Use the internal ref here
                className="w-full p-4 pr-16 bg-slate-50 border-slate-200 text-slate-900 
                           dark:bg-slate-800 dark:border-slate-700 dark:text-slate-100 dark:placeholder-slate-500
                           border rounded-2xl outline-none transition-all shadow-sm
                           resize-none min-h-[80px] max-h-[300px] overflow-y-auto"
                placeholder="Type your prompt here..."
                value={input}
                disabled={disabled}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSend();
                    }
                }}
            />

            <div className="absolute left-4 -top-6 px-2 text-[11px] font-mono 
                            text-slate-400 dark:text-slate-500 
                            bg-white dark:bg-[#0d1117] rounded-full z-20">
                {input.length} characters
            </div>

            <button
                onClick={handleSend}
                disabled={disabled || !input.trim()}
                className="absolute right-3 bottom-3 p-3 bg-indigo-600 text-white rounded-xl
                           hover:bg-indigo-700 disabled:bg-slate-300 dark:disabled:bg-slate-700 
                           transition-colors shadow-md z-10"
            >
                <svg fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" className="w-5 h-5">
                    <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
            </button>
        </div>
    );
});

export default ChatInput