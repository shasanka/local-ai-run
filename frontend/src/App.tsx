import { useEffect, useRef, useState, } from 'react';
import ChatInput from './component/ChatInput';
import { MessageRow } from './component/MessageRow';
import Sidebar from './component/Sidebar';

// 1. Define types clearly
type Role = "user" | "assistant" | "system";

interface Message {
  role: Role;
  content: string;
}

type ChatMetadata = {
  id: string;
  title: string;
}

const App = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [contextCount, setContextCount] = useState(0);
  const [tokenCount, setTokenCount] = useState(0);

  // To this:
  const [loadingChatId, setLoadingChatId] = useState<string | null>(null);
  const TOKEN_LIMIT = 2048;
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null); // Create the ref

  // --- NEW SIDEBAR STATES ---
  const [chatList, setChatList] = useState<ChatMetadata[]>([]);
  const [activeChatId, setActiveChatId] = useState<string | null>(null);

  // 1. Session Persistence (Keep your existing tab-based logic)
  const [sessionId] = useState(() => {
    const saved = sessionStorage.getItem('chat_session_id');
    const id = saved || `session-${Math.random().toString(36).substring(7)}`;
    sessionStorage.setItem('chat_session_id', id);
    return id;
  });

  const isCurrentChatLoading = activeChatId ? loadingChatId === activeChatId : false;

  const fetchChatList = async () => {
    try {
      const res = await fetch(`http://localhost:5000/sessions/${sessionId}/chats`);
      const serverChats = await res.json();

      setChatList(prev => {
        const hasEmptyChat = prev.find(c => c.title === "Empty Chat" && c.id === activeChatId);
        if (hasEmptyChat && !serverChats.find((sc: any) => sc.id === activeChatId)) {
          return [hasEmptyChat, ...serverChats];
        }
        return serverChats;
      });

      if (!activeChatId && serverChats.length > 0) {
        setActiveChatId(serverChats[0].id);
      }
    } catch (e) {
      console.error("Sidebar sync failed", e);
    }
  };



  //  Create New Chat
  const startNewChat = () => {
    const newId = `chat-${Date.now()}`;
    const placeholderChat: ChatMetadata = { id: newId, title: "Empty Chat" };
    setChatList(prev => [placeholderChat, ...prev]);
    setActiveChatId(newId);
    setMessages([]);
    setTokenCount(0);
    setContextCount(0);

    setTimeout(() => {
      inputRef.current?.focus();
    }, 0);
  };
  // 5. Send Message (Updated for Multi-Chat)
  const sendMessage = async (text: string) => {
    if (!text.trim()) return;

    // 1. Determine the ID. If null, we are starting a "Zero-Click" chat.
    let targetChatId = activeChatId;

    if (!targetChatId) {
      targetChatId = `chat-${Date.now()}`;
      const placeholderChat: ChatMetadata = { id: targetChatId, title: "New Conversation" };

      // Update sidebar and set as active BEFORE the fetch
      setChatList(prev => [placeholderChat, ...prev]);
      setActiveChatId(targetChatId);

      // Pre-populate the message list so the user sees their prompt immediately
      setMessages([{ role: 'user', content: text }]);
    } else {
      // Normal flow for existing chats
      const userMsg: Message = { role: 'user', content: text };
      setMessages(prev => [...prev, userMsg]);
    }

    setLoadingChatId(targetChatId);

    try {
      const response = await fetch('http://localhost:5000/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: text,
          sessionId,
          chatId: targetChatId
        })
      });

      const data = await response.json();

      setActiveChatId(currentId => {
        // Only update if the user is still viewing the chat they just messaged in
        if (currentId === targetChatId) {
          setMessages(data.history);
          setContextCount(data.contextCount);
          setTokenCount(data.tokenCount);
        }
        return currentId;
      });

      fetchChatList(); // Refresh sidebar to get generated titles
    } catch (err) {
      console.error("Failed to send:", err);
    } finally {
      setLoadingChatId(current => current === targetChatId ? null : current);
    }
  };

  const deleteChat = async (cid: string) => {
    // Optional: Add a confirmation to prevent accidental deletions
    if (!window.confirm("Delete this conversation?")) return;

    try {
      const response = await fetch('http://localhost:5000/delete-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId, chatId: cid })
      });

      if (response.ok) {
        // If we deleted the active chat, reset the UI
        if (activeChatId === cid) {
          setActiveChatId(null);
          setMessages([]);
          setTokenCount(0);
          setContextCount(0);
        }

        // Refresh the sidebar list from the backend
        fetchChatList();
      }
    } catch (err) {
      console.error("Failed to delete chat:", err);
    }
  };

  // --- THEME & SCROLL LOGIC ---
  const [isDarkMode, setIsDarkMode] = useState(() => localStorage.getItem('theme') !== 'light');
  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDarkMode);
    localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
  }, [isDarkMode]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loadingChatId]);

  useEffect(() => {
    console.log("🚀 ~ App ~ sessionId:", sessionId)
    fetchChatList();
  }, [sessionId]);

  // Load Specific Chat History
  useEffect(() => {
    console.log("🚀 ~ App ~ activeChatId:", { activeChatId, sessionId })
    if (!activeChatId) {
      setMessages([]);
      return;
    }

    const fetchHistory = async () => {
      try {
        const res = await fetch(`http://localhost:5000/session/${sessionId}/${activeChatId}`);
        const data = await res.json();
        console.log("🚀 ~ fetchHistory ~ data:", data)
        setMessages(data.history);
        setTokenCount(data.tokenCount);
        setContextCount(data.contextCount);
      } catch (e) {
        console.error("Could not load history", e);
      }
    };

    fetchHistory();
  }, [activeChatId, sessionId]);



  const resetHistory = async () => {
    if (!activeChatId) return;

    // Optional: Add a confirmation dialog
    if (!window.confirm("Are you sure you want to clear the messages in this chat?")) {
      return;
    }

    try {
      const response = await fetch('http://localhost:5000/reset-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId, chatId: activeChatId })
      });

      if (response.ok) {
        // Clear the local UI state
        setMessages([]);
        setContextCount(0);
        setTokenCount(0);
        console.log(`Chat ${activeChatId} cleared.`);
      }
    } catch (err) {
      console.error("Failed to reset chat:", err);
    }
  };

  const currentChat = chatList.find(c => c.id === activeChatId);
  const displayTitle = currentChat ? currentChat.title : "New Conversation";

  return (
    /* 1. Main Wrapper: Side-by-side layout */
    <div className="flex h-screen w-full bg-white dark:bg-[#0d1117] overflow-hidden">

      {/* 2. Sidebar Component */}
      <Sidebar
        chatList={chatList}
        activeId={activeChatId}
        onSelect={setActiveChatId}
        onNew={startNewChat}
        onDelete={deleteChat}
      />

      {/* 3. Main Chat Area: This replaces your original top-level div */}
      <div className="flex flex-col flex-1 h-full min-w-0 transition-colors duration-300">

        {/* Header */}
        <header className="w-full border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0d1117] sticky top-0 z-10">
          <div className="max-w-4xl mx-auto p-4 flex justify-between items-end">
            <div className="flex flex-col gap-1 min-w-0 flex-1">
              <div className="flex items-baseline gap-2 overflow-hidden">
                <h1 className="font-bold text-xl text-slate-800 dark:text-slate-100 leading-none flex-shrink-0">
                  Qwen Local <sup className="text-xs ml-0.5 font-medium text-slate-500">Shasanka</sup>
                </h1>

                {/* Vertical Divider */}
                <div className="h-4 w-[1px] bg-slate-300 dark:bg-slate-700 flex-shrink-0 mx-1" />

                {/* Dynamic Title */}
                <span className="text-sm font-medium text-indigo-500 dark:text-indigo-400 truncate italic">
                  {displayTitle}
                </span>
              </div>

              <div className="flex items-center gap-4 mt-2">
                <div className="flex flex-col">
                  <span className="text-[10px] uppercase text-slate-400 font-bold tracking-tight">Messages</span>
                  <span className="text-xs font-mono font-bold text-slate-700 dark:text-slate-300">{contextCount}</span>
                </div>

                <div className="h-6 w-[1px] bg-slate-200 dark:bg-slate-800" />

                <div className="flex flex-col grow max-w-[300px]">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-[10px] uppercase text-slate-400 font-bold tracking-tight">Token Usage</span>
                    <span className="text-[10px] font-mono font-bold text-slate-500">
                      {tokenCount.toLocaleString()} <span className="text-slate-300 dark:text-slate-600">/</span> {TOKEN_LIMIT.toLocaleString()}
                    </span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden border border-slate-200/50 dark:border-slate-700/50">
                    <div
                      className={`h-full transition-all duration-700 ease-out ${(tokenCount / TOKEN_LIMIT) > 0.85 ? 'bg-red-500' : (tokenCount / TOKEN_LIMIT) > 0.6 ? 'bg-amber-500' : 'bg-indigo-500'}`}
                      style={{ width: `${Math.min((tokenCount / TOKEN_LIMIT) * 100, 100)}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-2 mb-1">
              <button
                onClick={resetHistory}
                disabled={!activeChatId || messages.length === 0 || isCurrentChatLoading}
                className="disabled:opacity-30 px-3 py-1.5 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
              >
                🗑️ Clear
              </button>
              {/* <button
                onClick={() => setIsDarkMode(!isDarkMode)}
                className="p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
              >
                {isDarkMode ? '🌙' : '☀️'}
              </button> */}
            </div>
          </div>
        </header>

        {/* Main Messages Area */}
        <main className="flex-1 overflow-y-auto">
          <div className="max-w-4xl mx-auto px-4 pt-8 pb-32">
            {activeChatId ? (
              <>
                {messages.map((m, i) => <MessageRow key={i} {...m} />)}
                {isCurrentChatLoading && (
                  <div className="flex gap-4 py-6 animate-pulse">
                    <div className="w-8 h-8 rounded bg-slate-200 dark:bg-slate-700" />
                    <div className="space-y-2">
                      <div className="h-3 w-48 bg-slate-100 dark:bg-slate-800 rounded" />
                      <div className="h-3 w-32 bg-slate-100 dark:bg-slate-800 rounded" />
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </>
            ) : (
              /* Empty State */
              <div className="h-full flex flex-col items-center justify-center text-slate-400 mt-20">
                <div className="text-4xl mb-4">🤖</div>
                <p className="text-lg font-medium">Select a chat to start coding</p>
                <p className="text-sm">Or click + New Chat in the sidebar</p>
              </div>
            )}
          </div>
        </main>

        {/* Footer / Input */}
        <footer className="w-full border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0d1117] p-4">
          <div className="max-w-4xl mx-auto">
            <ChatInput
              ref={inputRef}
              onSend={sendMessage}
              // REMOVE: !activeChatId from here
              // ONLY disable if the current view is waiting for a response
              disabled={isCurrentChatLoading}
            />
          </div>
        </footer>
      </div>
    </div>
  );
};
export default App;