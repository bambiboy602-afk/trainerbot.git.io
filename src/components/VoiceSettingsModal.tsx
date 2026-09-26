import React, { useEffect, useState } from 'react';
import { X, Volume2, Sliders, Play, RotateCcw } from 'lucide-react';
import { VoiceSettings } from '../types';
import { speechController } from '../utils/speech';

interface VoiceSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: VoiceSettings;
  onUpdateSettings: (newSettings: VoiceSettings) => void;
}

export const VoiceSettingsModal: React.FC<VoiceSettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onUpdateSettings,
}) => {
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [isTesting, setIsTesting] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    const loadVoices = () => {
      const v = speechController.getVoices();
      setVoices(v);
    };

    loadVoices();
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleTestSpeech = () => {
    setIsTesting(true);
    speechController.speak(
      "Hi, thanks for meeting with me. I'm testing the voice speed and pitch settings right now.",
      settings,
      () => setIsTesting(true),
      () => setIsTesting(false)
    );
  };

  const handleResetDefaults = () => {
    onUpdateSettings({
      autoSpeak: true,
      rate: 1.0,
      pitch: 1.0,
      selectedVoiceURI: undefined,
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-stone-900/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-md w-full border border-stone-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-4 border-b border-stone-200 flex items-center justify-between bg-stone-50">
          <div className="flex items-center gap-2">
            <Sliders className="w-4 h-4 text-stone-700" />
            <h3 className="text-sm font-bold text-stone-900">Voice & Speech Settings</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-200/60 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-5 text-xs text-stone-700">
          {/* Auto-Speak Toggle */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-stone-50 border border-stone-200">
            <div>
              <div className="font-semibold text-stone-900">Auto-Read Client Responses</div>
              <div className="text-[11px] text-stone-500">
                Automatically speak incoming messages from the persona
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.autoSpeak}
                onChange={(e) =>
                  onUpdateSettings({ ...settings, autoSpeak: e.target.checked })
                }
                className="sr-only peer"
              />
              <div className="w-9 h-5 bg-stone-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-stone-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-teal-600"></div>
            </label>
          </div>

          {/* Voice Picker */}
          <div>
            <label className="block font-semibold text-stone-800 mb-1.5">
              Browser Synthesis Voice
            </label>
            <select
              value={settings.selectedVoiceURI || ''}
              onChange={(e) =>
                onUpdateSettings({ ...settings, selectedVoiceURI: e.target.value || undefined })
              }
              className="w-full px-3 py-2 border border-stone-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-stone-400 bg-white"
            >
              <option value="">Default System Natural Voice</option>
              {voices.map((v) => (
                <option key={v.voiceURI} value={v.voiceURI}>
                  {v.name} ({v.lang})
                </option>
              ))}
            </select>
          </div>

          {/* Speech Rate Slider */}
          <div>
            <div className="flex justify-between font-semibold text-stone-800 mb-1">
              <span>Speech Speed</span>
              <span className="font-mono text-stone-500">{settings.rate}x</span>
            </div>
            <input
              type="range"
              min="0.7"
              max="1.4"
              step="0.05"
              value={settings.rate}
              onChange={(e) =>
                onUpdateSettings({ ...settings, rate: parseFloat(e.target.value) })
              }
              className="w-full accent-teal-700"
            />
            <div className="flex justify-between text-[10px] text-stone-400 mt-0.5">
              <span>0.7x (Slower)</span>
              <span>1.0x (Normal)</span>
              <span>1.4x (Faster)</span>
            </div>
          </div>

          {/* Speech Pitch Slider */}
          <div>
            <div className="flex justify-between font-semibold text-stone-800 mb-1">
              <span>Voice Pitch</span>
              <span className="font-mono text-stone-500">{settings.pitch}x</span>
            </div>
            <input
              type="range"
              min="0.8"
              max="1.3"
              step="0.05"
              value={settings.pitch}
              onChange={(e) =>
                onUpdateSettings({ ...settings, pitch: parseFloat(e.target.value) })
              }
              className="w-full accent-teal-700"
            />
            <div className="flex justify-between text-[10px] text-stone-400 mt-0.5">
              <span>0.8x (Deeper)</span>
              <span>1.0x (Natural)</span>
              <span>1.3x (Higher)</span>
            </div>
          </div>

          {/* Test Button & Reset */}
          <div className="pt-2 flex items-center justify-between border-t border-stone-100">
            <button
              type="button"
              onClick={handleResetDefaults}
              className="flex items-center gap-1 text-[11px] text-stone-500 hover:text-stone-800"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset Defaults</span>
            </button>

            <button
              type="button"
              onClick={handleTestSpeech}
              disabled={isTesting}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-teal-50 border border-teal-200 text-teal-800 font-semibold hover:bg-teal-100 transition-colors"
            >
              <Play className="w-3 h-3 fill-teal-800" />
              <span>{isTesting ? 'Playing sample...' : 'Test Voice'}</span>
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-stone-200 bg-stone-50 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 bg-stone-900 hover:bg-stone-800 text-white rounded-lg text-xs font-semibold"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
