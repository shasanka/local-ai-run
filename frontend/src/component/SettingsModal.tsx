import { useEffect, useState } from "react";
import type { ModelSettings } from "../utils/datatypes";

type SettingsModalProps = {
    isOpen: boolean,
    settings: ModelSettings,
    onClose: () => void,
    onSave: (value: ModelSettings) => void
}

const SettingsModal = ({ isOpen, onClose, settings, onSave }: SettingsModalProps) => {
    // Current tab state: 'personality' or 'others'
    const [activeTab, setActiveTab] = useState<'personality' | 'others'>('personality');

    // Local state for all settings
    const [localSettings, setLocalSettings] = useState(settings);
    const [showSuccess, setShowSuccess] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setLocalSettings(settings);
            setShowSuccess(false);
        }
    }, [isOpen, settings]);

    const handleSave = async () => {
        await onSave(localSettings);
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 3000);
    };

    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
            <div className="bg-[#0d1117] border border-slate-800 w-full max-w-3xl h-[550px] rounded-xl overflow-hidden flex shadow-2xl">

                {/* --- MODAL SIDEBAR --- */}
                <div className="w-56 bg-[#010409] border-r border-slate-800 flex flex-col">
                    <div className="h-[60px] flex items-center px-4">
                        <button
                            onClick={onClose}
                            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-all cursor-pointer text-lg"
                        >
                            ✕
                        </button>
                    </div>

                    <nav className="p-2 space-y-1">
                        <button
                            onClick={() => setActiveTab('personality')}
                            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer ${activeTab === 'personality' ? 'bg-slate-800 text-indigo-400' : 'text-slate-400 hover:bg-slate-900 hover:text-slate-200'
                                }`}
                        >
                            👤 Personality
                        </button>
                        <button
                            onClick={() => setActiveTab('others')}
                            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer ${activeTab === 'others' ? 'bg-slate-800 text-indigo-400' : 'text-slate-400 hover:bg-slate-900 hover:text-slate-200'
                                }`}
                        >
                            ⚙️ Other Settings
                        </button>
                    </nav>
                </div>

                {/* --- MAIN CONTENT AREA --- */}
                <div className="flex-1 flex flex-col bg-[#0d1117] relative">
                    <div className="h-[60px] flex items-center px-6 border-b border-slate-800">
                        <h3 className="text-lg font-semibold text-white capitalize">
                            {activeTab === 'personality' ? 'Personality' : 'Model Parameters'}
                        </h3>
                        {showSuccess && (
                            <span className="ml-auto text-emerald-500 text-xs font-bold animate-pulse">
                                ✅ Saved
                            </span>
                        )}
                    </div>

                    <div className="p-6 flex-1 overflow-y-auto custom-scrollbar">
                        {activeTab === 'personality' ? (
                            <>
                                <p className="text-xs text-slate-500 mb-4">
                                    Set how the AI behaves and responds across all new chats.
                                </p>
                                <textarea
                                    value={localSettings.systemPrompt}
                                    onChange={(e) => setLocalSettings({ ...localSettings, systemPrompt: e.target.value })}
                                    className="w-full h-72 bg-[#010409] border border-slate-700 rounded-lg p-3 text-sm text-slate-200 focus:outline-none focus:border-indigo-500 transition-colors resize-none"
                                    placeholder="e.g. You are a helpful assistant..."
                                />
                            </>
                        ) : (
                            <div className="space-y-6">
                                <div>
                                    <div className="flex justify-between mb-2">
                                        <label className="text-sm font-medium text-slate-200">Temperature</label>
                                        <span className="text-xs font-mono text-indigo-400 bg-indigo-400/10 px-2 py-0.5 rounded">
                                            {localSettings.temperature}
                                        </span>
                                    </div>
                                    <input
                                        type="range"
                                        min="0"
                                        max="1.5"
                                        step="0.1"
                                        value={localSettings.temperature}
                                        onChange={(e) => setLocalSettings({ ...localSettings, temperature: parseFloat(e.target.value) })}
                                        className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                                    />
                                    <p className="text-[11px] text-slate-500 mt-2 italic">
                                        Lower values are focused and deterministic, higher values are creative and random.
                                    </p>
                                </div>

                                {/* Placeholder for future settings */}
                                <div className="opacity-50 pointer-events-none">
                                    <label className="text-sm font-medium text-slate-400 block mb-2">Max Tokens (Soon)</label>
                                    <div className="w-full h-2 bg-slate-800 rounded-lg" />
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="p-4 border-t border-slate-800 flex justify-end gap-3 bg-[#0d1117]">
                        <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-slate-400 hover:text-white transition-colors cursor-pointer">
                            Cancel
                        </button>
                        <button onClick={handleSave} className="px-6 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-sm font-medium transition-colors shadow-lg shadow-indigo-500/20 cursor-pointer">
                            Save Changes
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SettingsModal