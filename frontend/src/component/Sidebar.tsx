const Sidebar = ({ chatList, activeId, onSelect, onNew, onDelete }: any) => (
    <aside className="w-64 h-full bg-[#010409] border-r border-slate-800 flex flex-col">
        <div className="p-4">
            <button
                onClick={onNew}
                className="w-full flex items-center justify-center gap-2 p-2 border border-slate-700 rounded-lg hover:bg-slate-800 transition-colors text-white font-medium text-sm"
            >
                + New Chat
            </button>
        </div>

        <div className="flex-1 overflow-y-auto px-2 space-y-1">
            {chatList && chatList.length > 0 ? (
                chatList.map((chat: any) => (
                    <div
                        key={chat.id}
                        onClick={() => onSelect(chat.id)}
                        className={`group flex items-center justify-between p-2.5 rounded-lg cursor-pointer text-sm transition-all ${activeId === chat.id
                                ? 'bg-slate-800 text-indigo-400'
                                : 'text-slate-400 hover:bg-slate-900 hover:text-slate-200'
                            }`}
                    >
                        <span className="truncate flex-1">💬 {chat.title || "New Chat"}</span>

                        {/* Delete Button - only visible on hover (group-hover) */}
                        <button
                            onClick={(e) => {
                                e.stopPropagation(); // Prevents selecting the chat while deleting
                                onDelete(chat.id);
                            }}
                            className="opacity-0 group-hover:opacity-100 hover:text-red-500 p-1 transition-opacity"
                            title="Delete Chat"
                        >
                            🗑️
                        </button>
                    </div>
                ))
            ) : (
                <div className="p-4 text-xs text-slate-600 italic">No recent chats</div>
            )}
        </div>
    </aside>
);

export default Sidebar