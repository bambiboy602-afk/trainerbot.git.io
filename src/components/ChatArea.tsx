import React, { useEffect, useRef } from 'react';
import { 
  Volume2, 
  Square, 
  Copy, 
  Check, 
  Lightbulb, 
  Tag, 
  Sparkles,
  User,
  HeartHandshake
} from 'lucide-react';
import { Message, Persona, VoiceSettings } from '../types';

interface ChatAreaProps {
  messages: Message[];
  persona: Persona;
  isAiTyping: boolean;
  activeSpeakingMessageId: string | null;
  onPlaySpeech: (messageId: string, text: string) => void;
  onStopSpeech: () => void;
}

export const ChatArea: React.FC<ChatAreaProps> = ({
  messages,
  persona,
  isAiTyping,
  activeSpeakingMessageId,
  onPlaySpeech,
  onStopSpeech,
}) => {
  const bottomRef = useRef<HTMLDivElement>(null);
  const [copiedId, setCopiedId] = React.useState<string | null>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isAiTyping]);

  const copyToClipboard = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const getTagColor = (tag: string) => {
    const lower = tag.toLowerCase();
    if (lower.includes('advice') || lower.includes('silver') || lower.includes('trap') || lower.includes('closed') || lower.includes('invalidat')) {
      return 'bg-amber-100 text-amber-900 border-amber-300';
    }
    if (lower.includes('empath') || lower.includes('reflect') || lower.includes('validat') || lower.includes('open') || lower.includes('strength')) {
      return 'bg-emerald-100 text-emerald-900 border-emerald-300';
    }
    return 'bg-stone-100 text-stone-700 border-stone-200';
  };

  return (
    <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-6 space-y-6 max-w-4xl mx-auto w-full">
      {/* Starting context banner */}
      <div className="text-center my-2">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-stone-100 border border-stone-200 text-xs text-stone-600">
          <HeartHandshake className="w-3.5 h-3.5 text-teal-700" />
          <span>Session Started with <strong>{persona.name}</strong> • Remember: Reflect emotions, avoid unsolicited advice.</span>
        </div>
      </div>

      {/* Message List */}
      {messages.map((message) => {
        const isUser = message.role === 'user';
        const isSpeakingThis = activeSpeakingMessageId === message.id;

        return (
          <div
            key={message.id}
            className={`flex items-start gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
          >
            {/* Avatar */}
            <div
              className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 font-bold text-xs shadow-xs ${
                isUser
                  ? 'bg-stone-900 text-white'
                  : `${persona.avatarBg}`
              }`}
            >
              {isUser ? <User className="w-4 h-4" /> : persona.name.charAt(0)}
            </div>

            {/* Bubble & Metadata */}
            <div className={`flex flex-col max-w-[85%] sm:max-w-[75%] ${isUser ? 'items-end' : 'items-start'}`}>
              <div className="flex items-center gap-2 mb-1 px-1 text-xs text-stone-500">
                <span className="font-semibold text-stone-800">
                  {isUser ? 'You (Peer Supporter)' : persona.name}
                </span>
                <span>•</span>
                <span className="font-mono text-[11px]">{message.timestamp}</span>
              </div>

              {/* Speech Bubble */}
              <div
                className={`relative group p-4 rounded-2xl text-sm leading-relaxed transition-all shadow-xs ${
                  isUser
                    ? 'bg-stone-900 text-stone-50 rounded-tr-xs'
                    : 'bg-white text-stone-900 border border-stone-200 rounded-tl-xs'
                }`}
              >
                <div className="whitespace-pre-wrap">{message.content}</div>

                {/* Bubble action toolbar (Hover or always accessible) */}
                <div
                  className={`mt-2.5 pt-2 border-t flex items-center gap-2 text-xs ${
                    isUser
                      ? 'border-stone-800 text-stone-300'
                      : 'border-stone-100 text-stone-500'
                  }`}
                >
                  {/* TTS Voice button on client messages */}
                  {!isUser && (
                    <button
                      type="button"
                      onClick={() =>
                        isSpeakingThis
                          ? onStopSpeech()
                          : onPlaySpeech(message.id, message.content)
                      }
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md font-medium text-xs transition-colors ${
                        isSpeakingThis
                          ? 'bg-teal-100 text-teal-800 animate-pulse'
                          : 'hover:bg-stone-100 text-stone-700'
                      }`}
                      title={isSpeakingThis ? 'Stop speaking' : 'Read aloud with Text-to-Speech'}
                    >
                      {isSpeakingThis ? (
                        <>
                          <Square className="w-3 h-3 text-teal-700 fill-teal-700" />
                          <span>Speaking...</span>
                        </>
                      ) : (
                        <>
                          <Volume2 className="w-3.5 h-3.5" />
                          <span>Listen</span>
                        </>
                      )}
                    </button>
                  )}

                  {/* Copy Button */}
                  <button
                    type="button"
                    onClick={() => copyToClipboard(message.id, message.content)}
                    className="hover:text-stone-800 p-1 rounded-md transition-colors"
                    title="Copy message"
                  >
                    {copiedId === message.id ? (
                      <Check className="w-3 h-3 text-emerald-500" />
                    ) : (
                      <Copy className="w-3 h-3" />
                    )}
                  </button>

                  {/* Emotional state tag if present */}
                  {message.emotionalState && !isUser && (
                    <span className="ml-auto text-[11px] font-medium text-stone-500">
                      Feeling: <span className="text-stone-700 font-semibold">{message.emotionalState}</span>
                    </span>
                  )}
                </div>
              </div>

              {/* Active Listening Analysis Tags on User's response */}
              {isUser && message.tags && message.tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-2 justify-end">
                  {message.tags.map((tag, tIdx) => (
                    <span
                      key={tIdx}
                      className={`inline-flex items-center gap-1 px-2 py-0.5 text-[11px] font-medium rounded-full border ${getTagColor(
                        tag
                      )}`}
                    >
                      <Tag className="w-2.5 h-2.5" />
                      {tag}
                    </span>
                  ))}
                </div>
              )}

              {/* Coaching Whisper Micro-Tip */}
              {message.coachTip && (
                <div className="mt-2 w-full bg-teal-50 border border-teal-200 rounded-lg p-2.5 text-xs text-teal-900 flex items-start gap-2 shadow-2xs">
                  <Lightbulb className="w-4 h-4 text-teal-700 shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <span className="font-semibold text-teal-950">Supervisor Insight: </span>
                    <span>{message.coachTip}</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        );
      })}

      {/* Typing Indicator */}
      {isAiTyping && (
        <div className="flex items-start gap-3">
          <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 font-bold text-xs ${persona.avatarBg}`}>
            {persona.name.charAt(0)}
          </div>
          <div className="bg-white border border-stone-200 rounded-2xl rounded-tl-xs p-4 shadow-xs text-xs text-stone-500 flex items-center gap-2">
            <span className="font-medium text-stone-700">{persona.name} is formulating a response</span>
            <span className="flex gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-stone-400 animate-bounce [animation-delay:-0.3s]" />
              <span className="w-1.5 h-1.5 rounded-full bg-stone-400 animate-bounce [animation-delay:-0.15s]" />
              <span className="w-1.5 h-1.5 rounded-full bg-stone-400 animate-bounce" />
            </span>
          </div>
        </div>
      )}

      <div ref={bottomRef} />
    </div>
  );
};
