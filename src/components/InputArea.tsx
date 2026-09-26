import React, { useState, useRef, useEffect } from 'react';
import { 
  Mic, 
  MicOff, 
  Send, 
  Sparkles, 
  CornerDownLeft, 
  AlertCircle,
  HelpCircle,
  MessageSquarePlus
} from 'lucide-react';
import { speechController } from '../utils/speech';

interface InputAreaProps {
  onSendMessage: (text: string) => void;
  disabled: boolean;
  clientName: string;
}

const PEER_SUPPORT_STEMS = [
  "It sounds like you're carrying so much right now...",
  "I can hear how exhausting that pressure is...",
  "That makes complete sense that you'd feel that way.",
  "What feels like the heaviest part of this today?",
  "I'm here with you. There's no rush.",
  "It takes real courage to put that into words."
];

export const InputArea: React.FC<InputAreaProps> = ({
  onSendMessage,
  disabled,
  clientName,
}) => {
  const [inputText, setInputText] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [voiceError, setVoiceError] = useState<string | null>(null);
  const [showStems, setShowStems] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Focus textarea when component mounts or enabled
  useEffect(() => {
    if (!disabled) {
      textareaRef.current?.focus();
    }
  }, [disabled]);

  const handleSend = () => {
    const trimmed = inputText.trim();
    if (!trimmed || disabled) return;

    if (isListening) {
      speechController.stopListening();
      setIsListening(false);
    }

    onSendMessage(trimmed);
    setInputText('');
    setVoiceError(null);

    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputText(e.target.value);
    // Auto grow height up to 160px
    e.target.style.height = 'auto';
    e.target.style.height = `${Math.min(e.target.scrollHeight, 160)}px`;
  };

  const toggleVoiceInput = () => {
    if (isListening) {
      speechController.stopListening();
      setIsListening(false);
      return;
    }

    setVoiceError(null);
    const started = speechController.startListening(
      (transcript, isFinal) => {
        setInputText((prev) => {
          // If previous text exists, append with space
          if (!prev) return transcript;
          return `${prev.trim()} ${transcript}`;
        });
      },
      (errorMsg) => {
        setVoiceError(errorMsg);
        setIsListening(false);
      },
      () => {
        setIsListening(false);
      }
    );

    if (started) {
      setIsListening(true);
    }
  };

  const insertStem = (stem: string) => {
    setInputText((prev) => {
      if (!prev) return stem + ' ';
      return `${prev.trim()} ${stem} `;
    });
    textareaRef.current?.focus();
  };

  return (
    <footer aria-label="Peer Support Input" className="bg-white border-t border-stone-200 p-4 sticky bottom-0 z-20">
      <div className="max-w-4xl mx-auto space-y-3">
        {/* Practice Stems & Coaching Prompts Bar */}
        <div className="flex items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            <button
              type="button"
              onClick={() => setShowStems(!showStems)}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-stone-100 hover:bg-stone-200 text-stone-700 font-medium transition-colors shrink-0"
            >
              <MessageSquarePlus className="w-3.5 h-3.5 text-teal-700" />
              <span>{showStems ? 'Hide Stems' : 'Validation Stems'}</span>
            </button>

            {/* Quick visible stems */}
            {PEER_SUPPORT_STEMS.slice(0, 3).map((stem, sIdx) => (
              <button
                key={sIdx}
                type="button"
                onClick={() => insertStem(stem)}
                className="hidden sm:inline-block px-2.5 py-1 rounded-md bg-stone-50 hover:bg-teal-50 hover:border-teal-200 border border-stone-200 text-stone-600 hover:text-teal-900 transition-colors shrink-0 truncate max-w-[220px]"
                title={`Click to insert: "${stem}"`}
              >
                "{stem}"
              </button>
            ))}
          </div>

          <div className="text-[11px] text-stone-400 hidden sm:block shrink-0">
            Enter ↵ to send • Shift+Enter for new line
          </div>
        </div>

        {/* Expanded Stems Drawer */}
        {showStems && (
          <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
            {PEER_SUPPORT_STEMS.map((stem, sIdx) => (
              <button
                key={sIdx}
                type="button"
                onClick={() => insertStem(stem)}
                className="text-left p-2 rounded-lg bg-white border border-stone-200 hover:border-teal-400 hover:bg-teal-50/50 text-stone-700 transition-all font-medium"
              >
                "{stem}"
              </button>
            ))}
          </div>
        )}

        {/* Voice error notice if microphone blocked */}
        {voiceError && (
          <div className="px-3 py-2 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-800 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{voiceError}</span>
          </div>
        )}

        {/* Live Listening Indicator */}
        {isListening && (
          <div className="px-3 py-1.5 bg-teal-50 border border-teal-200 rounded-lg text-xs text-teal-900 flex items-center justify-between animate-pulse">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-teal-600 animate-ping" />
              <span className="font-semibold">Microphone active — Listening to your peer response...</span>
            </div>
            <button
              type="button"
              onClick={toggleVoiceInput}
              className="font-semibold text-teal-800 underline hover:text-teal-950"
            >
              Stop mic
            </button>
          </div>
        )}

        {/* Main Input Box */}
        <div className="relative flex items-end gap-2 bg-stone-50 border border-stone-300 focus-within:border-stone-500 focus-within:ring-2 focus-within:ring-stone-200 rounded-2xl p-2 transition-all">
          {/* Voice-to-Text Button */}
          <button
            type="button"
            onClick={toggleVoiceInput}
            disabled={disabled}
            className={`p-2.5 rounded-xl transition-all shrink-0 ${
              isListening
                ? 'bg-rose-600 text-white shadow-md shadow-rose-200 animate-pulse'
                : 'bg-white hover:bg-stone-100 text-stone-600 border border-stone-200 hover:text-stone-900'
            }`}
            title={isListening ? 'Click to stop recording' : 'Click to speak response using voice'}
          >
            {isListening ? (
              <MicOff className="w-5 h-5" />
            ) : (
              <Mic className="w-5 h-5" />
            )}
          </button>

          {/* Text Area */}
          <textarea
            ref={textareaRef}
            rows={1}
            value={inputText}
            onChange={handleTextareaChange}
            onKeyDown={handleKeyDown}
            disabled={disabled}
            placeholder={
              disabled
                ? `${clientName} is responding...`
                : isListening
                ? 'Speak clearly into your microphone...'
                : `Type your peer response to ${clientName} (reflect feelings, avoid giving advice)...`
            }
            className="flex-1 bg-transparent border-0 resize-none focus:outline-none focus:ring-0 text-sm leading-relaxed text-stone-900 placeholder:text-stone-400 py-1.5 min-h-[40px] max-h-[160px]"
          />

          {/* Send Button */}
          <button
            type="button"
            onClick={handleSend}
            disabled={disabled || !inputText.trim()}
            className="p-2.5 rounded-xl bg-stone-900 hover:bg-stone-800 disabled:opacity-30 disabled:cursor-not-allowed text-white transition-all shrink-0 shadow-xs"
            title="Send response (Enter)"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </footer>
  );
};
