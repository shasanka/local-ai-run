import { useEffect, useState } from "react";

const SettingsModal = ({ isOpen, onClose, systemPrompt, onSave }: any) => {
    const [localPrompt, setLocalPrompt] = useState(systemPrompt);
    const [showSuccess, setShowSuccess] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setLocalPrompt(systemPrompt);
            setShowSuccess(false);
        }
    }, [isOpen, systemPrompt]);

    const handleSave = async () => {
        await onSave(localPrompt);
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 3000);
    };

    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
            <div className="bg-[#0d1117] border border-slate-800 w-full max-w-3xl h-[500px] rounded-xl overflow-hidden flex shadow-2xl">

                {/* --- MODAL SIDEBAR --- */}
                <div className="w-48 bg-[#010409] border-r border-slate-800 flex flex-col">
                    {/* Cross Button Aligned with Main Title */}
                    <div className="h-[60px] flex items-center px-4">
                        <button
                            onClick={onClose}
                            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-all cursor-pointer text-lg"
                            title="Close Settings"
                        >
                            ✕
                        </button>
                    </div>

                    <nav className="p-2 space-y-1">
                        <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg bg-slate-800 text-indigo-400 text-sm font-medium cursor-pointer">
                            👤 Personality
                        </button>
                    </nav>
                </div>

                {/* --- MAIN CONTENT AREA --- */}
                <div className="flex-1 flex flex-col bg-[#0d1117] relative">

                    {/* Header with Title and Divider */}
                    <div className="h-[60px] flex items-center px-6 border-b border-slate-800">
                        <h3 className="text-lg font-semibold text-white">Personality</h3>

                        {/* Inline Success Notification */}
                        {showSuccess && (
                            <span className="ml-auto text-emerald-500 text-xs font-bold animate-pulse">
                                ✅ Saved
                            </span>
                        )}
                    </div>

                    {/* Content Body */}
                    <div className="p-6 flex-1 overflow-y-auto custom-scrollbar">
                        <p className="text-xs text-slate-500 mb-4">
                            Set how the AI behaves and responds across all new chats.
                        </p>

                        <textarea
                            value={localPrompt}
                            onChange={(e) => setLocalPrompt(e.target.value)}
                            className="w-full h-64 bg-[#010409] border border-slate-700 rounded-lg p-3 text-sm text-slate-200 focus:outline-none focus:border-indigo-500 transition-colors resize-none"
                            placeholder="e.g. You are a helpful assistant..."
                        />
                    </div>

                    {/* Footer Actions */}
                    <div className="p-4 border-t border-slate-800 flex justify-end gap-3 bg-[#0d1117]">
                        <button
                            onClick={onClose}
                            className="px-4 py-2 text-sm font-medium text-slate-400 hover:text-white transition-colors cursor-pointer"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleSave}
                            className="px-6 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-sm font-medium transition-colors shadow-lg shadow-indigo-500/20 cursor-pointer"
                        >
                            Save Changes
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SettingsModal