import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage } from '../types.js';
import { Send, MessageSquare, Compass, RefreshCw, Languages, HelpCircle } from 'lucide-react';

interface FanConciergeProps {
  chatHistory: ChatMessage[];
  onSendMessage: (text: string, language: string) => void;
  loading: boolean;
  onClearHistory: () => void;
}

export default function FanConcierge({
  chatHistory,
  onSendMessage,
  loading,
  onClearHistory,
}: FanConciergeProps) {
  const [inputText, setInputText] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState('English');
  const chatEndRef = useRef<HTMLDivElement>(null);

  const languages = [
    { code: 'English', label: 'English (US)' },
    { code: 'Spanish', label: 'Español' },
    { code: 'Hindi', label: 'हिन्दी (Hindi)' },
    { code: 'French', label: 'Français' },
  ];

  // Presets of smart, congestion-aware questions fans might ask
  const quickPrompts = [
    {
      label: '🍔 Find Beer/Food with short queue',
      text: 'Find beer or snacks near Gate C with the shortest wait time.',
    },
    {
      label: '🚻 Nearest clean restroom',
      text: 'Where is the nearest restroom with a short line near Gate G?',
    },
    {
      label: '🏁 Shortest entry gates',
      text: 'Which entry gates have the shortest lines right now?',
    },
    {
      label: '👕 Find Merchandise Shop',
      text: 'Where is the nearest official World Cup souvenir shop?',
    },
  ];

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory, loading]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || loading) return;
    onSendMessage(inputText, selectedLanguage);
    setInputText('');
  };

  const handleQuickPrompt = (text: string) => {
    if (loading) return;
    onSendMessage(text, selectedLanguage);
  };

  // Safe and super fast lightweight parser to render standard markdown lists, bold text, and code elements
  const formatMessageText = (text: string) => {
    const lines = text.split('\n');
    return lines.map((line, idx) => {
      let content: React.ReactNode = line;
      
      // Render lists
      if (line.trim().startsWith('* ') || line.trim().startsWith('- ')) {
        const cleanText = line.trim().substring(2);
        content = (
          <li className="list-disc ml-4 my-1 text-slate-200">
            {parseInlineMarkdown(cleanText)}
          </li>
        );
      } else {
        content = <p className="my-1 text-slate-200 leading-relaxed">{parseInlineMarkdown(line)}</p>;
      }

      return <React.Fragment key={idx}>{content}</React.Fragment>;
    });
  };

  // Helper to parse bold (**text**) and code (`code`) tags in text
  const parseInlineMarkdown = (line: string): React.ReactNode[] => {
    const parts: React.ReactNode[] = [];
    let currentStr = line;
    let index = 0;

    while (currentStr.length > 0) {
      const boldMatch = currentStr.match(/\*\*(.*?)\*\*/);
      const codeMatch = currentStr.match(/`(.*?)`/);

      // Find which match comes first
      const boldIdx = boldMatch && boldMatch.index !== undefined ? boldMatch.index : Infinity;
      const codeIdx = codeMatch && codeMatch.index !== undefined ? codeMatch.index : Infinity;

      if (boldIdx === Infinity && codeIdx === Infinity) {
        parts.push(<span key={index++}>{currentStr}</span>);
        break;
      }

      if (boldIdx < codeIdx) {
        // Handle bold first
        if (boldIdx > 0) {
          parts.push(<span key={index++}>{currentStr.substring(0, boldIdx)}</span>);
        }
        parts.push(
          <strong key={index++} className="font-bold text-amber-300">
            {boldMatch![1]}
          </strong>
        );
        currentStr = currentStr.substring(boldIdx + boldMatch![0].length);
      } else {
        // Handle code first
        if (codeIdx > 0) {
          parts.push(<span key={index++}>{currentStr.substring(0, codeIdx)}</span>);
        }
        parts.push(
          <code key={index++} className="bg-slate-950 px-1.5 py-0.5 rounded text-[10px] font-mono text-emerald-400">
            {codeMatch![1]}
          </code>
        );
        currentStr = currentStr.substring(codeIdx + codeMatch![0].length);
      }
    }

    return parts;
  };

  return (
    <div className="glass-panel p-6 rounded-2xl flex flex-col h-[520px] justify-between">
      {/* Header with Language Selector */}
      <div>
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2 mb-4">
          <div>
            <h3 className="font-display text-lg font-bold text-white tracking-wide flex items-center gap-1.5">
              <Compass className="w-5 h-5 text-amber-500" /> Concierge & Wayfinder Agent
            </h3>
            <p className="text-xs text-slate-400">Congestion-aware pathfinding and dynamic directions</p>
          </div>

          <div className="flex items-center gap-2">
            <Languages className="w-3.5 h-3.5 text-amber-400" />
            <select
              id="lang-selector"
              value={selectedLanguage}
              onChange={(e) => setSelectedLanguage(e.target.value)}
              aria-label="Select Chat Language"
              className="bg-slate-900 border border-slate-800 text-slate-300 text-xs rounded-lg p-1 px-2 focus:outline-none focus:ring-1 focus:ring-amber-500 cursor-pointer"
            >
              {languages.map((lang) => (
                <option key={lang.code} value={lang.code}>
                  {lang.label}
                </option>
              ))}
            </select>

            <button
              id="clear-chat-btn"
              onClick={onClearHistory}
              aria-label="Clear chat history"
              className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-900 transition-all cursor-pointer"
              title="Clear chat history"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Message Feed */}
      <div className="flex-1 overflow-y-auto bg-slate-950/30 border border-slate-900/60 rounded-xl p-4 mb-4 space-y-4 min-h-0">
        {chatHistory.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-400">
            <MessageSquare className="w-8 h-8 text-amber-500/60 mb-2 animate-bounce" />
            <p className="text-sm font-semibold text-white">Ask ArenaFlow AI Assistant</p>
            <p className="text-xs text-slate-400 max-w-[280px] mt-1">
              "How long is the hot dog queue?" or "Where is the nearest open entrance?"
            </p>

            <div className="w-full max-w-md mt-6 space-y-2">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center justify-center gap-1">
                <HelpCircle className="w-3 h-3 text-amber-400" /> Click a Quick-Action Preset:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {quickPrompts.map((p, idx) => (
                  <button
                    key={idx}
                    id={`quick-prompt-${idx}`}
                    onClick={() => handleQuickPrompt(p.text)}
                    className="text-left text-[11px] p-2 bg-slate-900/50 hover:bg-slate-900 border border-slate-800/80 rounded-lg text-slate-300 transition-all hover:border-amber-500/40 cursor-pointer"
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {chatHistory.map((msg) => (
              <div
                key={msg.id}
                id={`chat-msg-${msg.id}`}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl p-3.5 shadow-md ${
                    msg.role === 'user'
                      ? 'bg-amber-500/20 border border-amber-500/30 text-white rounded-br-none'
                      : 'bg-slate-900/90 border border-slate-800/80 text-slate-200 rounded-bl-none'
                  }`}
                >
                  <div className="flex justify-between items-center mb-1 text-[10px] text-slate-400 font-mono">
                    <span className="font-bold text-slate-300 uppercase">
                      {msg.role === 'user' ? 'You' : 'ArenaFlow Agent'}
                    </span>
                    <span>{msg.timestamp}</span>
                  </div>
                  <div className="text-xs break-words">
                    {msg.role === 'user' ? msg.text : formatMessageText(msg.text)}
                  </div>
                  {msg.role === 'model' && msg.language && (
                    <div className="mt-2 text-[9px] text-slate-500 font-mono text-right">
                      Translated: {msg.language}
                    </div>
                  )}
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex justify-start">
                <div className="bg-slate-900/50 border border-slate-800/60 rounded-2xl rounded-bl-none p-4 max-w-[80%] flex items-center gap-3">
                  <div className="flex gap-1">
                    <div className="w-1.5 h-1.5 bg-amber-400 rounded-full animate-bounce"></div>
                    <div className="w-1.5 h-1.5 bg-amber-400 rounded-full animate-bounce [animation-delay:0.2s]"></div>
                    <div className="w-1.5 h-1.5 bg-amber-400 rounded-full animate-bounce [animation-delay:0.4s]"></div>
                  </div>
                  <span className="text-[11px] font-mono text-slate-400">Gemini analyzing stadium map...</span>
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>
        )}
      </div>

      {/* Input Form */}
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="text"
          id="chat-input-field"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder={`Type a navigation query in ${selectedLanguage}...`}
          disabled={loading}
          aria-label="Type your navigation query here"
          className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
        />
        <button
          type="submit"
          id="send-chat-btn"
          disabled={loading || !inputText.trim()}
          aria-label="Send message"
          className="p-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 disabled:opacity-40 disabled:hover:bg-amber-500 text-slate-950 font-bold transition-all flex items-center justify-center cursor-pointer"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
}
