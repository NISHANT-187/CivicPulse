import React, { useState, useRef, useEffect } from 'react';
import { Send, X, Shield, Sparkles } from 'lucide-react';
import { Issue } from '../mockData';
import { CivicCopilotAgent } from '../agents/CivicCopilotAgent';
import { ChatMessage as GeminiChatMessage } from '../types/gemini';

interface AIAssistantProps {
  isOpen: boolean;
  onClose: () => void;
  issues: Issue[];
}

interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: Date;
}

export const AIAssistant: React.FC<AIAssistantProps> = ({ isOpen, onClose, issues }) => {
  // Load conversation history from localStorage if available
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    const saved = localStorage.getItem('civicpulse_chat_history');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return parsed.map((m: any) => ({
          ...m,
          timestamp: new Date(m.timestamp)
        }));
      } catch {
        // Fallback below
      }
    }
    return [
      {
        id: 'init-1',
        sender: 'ai',
        text: "Welcome to CivicPulse! I am your AI assistant powered by Google Gemini. Ask me about municipal guidelines, local issues, or how reporting works.",
        timestamp: new Date()
      }
    ];
  });

  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [quickReplies, setQuickReplies] = useState<string[]>([
    "How do I report a pothole?",
    "Check safety issues nearby",
    "What are civic points?",
    "What is the city portal?"
  ]);

  const scrollRef = useRef<HTMLDivElement>(null);

  // Sync history to localStorage
  useEffect(() => {
    localStorage.setItem('civicpulse_chat_history', JSON.stringify(messages));
  }, [messages]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  if (!isOpen) return null;

  const handleSendMessage = async (textToSend: string) => {
    if (!textToSend.trim()) return;

    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}-user`,
      sender: 'user',
      text: textToSend,
      timestamp: new Date()
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText('');
    setIsTyping(true);

    try {
      // 1. Prepare chat history in the format expected by Gemini
      // Map ChatMessage format to GeminiChatMessage format
      const geminiHistory: GeminiChatMessage[] = messages.map(msg => ({
        role: msg.sender === 'user' ? 'user' : 'model',
        parts: [{ text: msg.text }]
      }));

      // 2. Call CivicCopilotAgent
      const response = await CivicCopilotAgent.respond(textToSend, geminiHistory, issues);

      const aiMsg: ChatMessage = {
        id: `msg-${Date.now()}-ai`,
        sender: 'ai',
        text: response.text,
        timestamp: new Date()
      };

      setMessages((prev) => [...prev, aiMsg]);
      
      // Update quick replies dynamically if returned
      if (response.suggestedFollowUps && response.suggestedFollowUps.length > 0) {
        setQuickReplies(response.suggestedFollowUps);
      }
    } catch (error) {
      console.error("Chat assistant response generation failed:", error);
      const errMsg: ChatMessage = {
        id: `msg-${Date.now()}-ai`,
        sender: 'ai',
        text: "I encountered an error querying the civic intelligence database. Please make sure VITE_GEMINI_API_KEY is configured in your environment.",
        timestamp: new Date()
      };
      setMessages((prev) => [...prev, errMsg]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSendMessage(inputText);
  };

  const handleClearHistory = () => {
    const initialMsg: ChatMessage = {
      id: 'init-1',
      sender: 'ai',
      text: "Chat history cleared. How can I assist you with municipal issues today?",
      timestamp: new Date()
    };
    setMessages([initialMsg]);
    setQuickReplies([
      "How do I report a pothole?",
      "Check safety issues nearby",
      "What are civic points?",
      "What is the city portal?"
    ]);
  };

  return (
    <div className="fixed inset-y-0 right-0 w-full sm:w-96 z-50 glass-card-brutal border-l-2 border-brutalBorder shadow-[-10px_0_30px_rgba(0,0,0,0.5)] flex flex-col animate-slide-in">
      {/* Header */}
      <div className="p-4 border-b-2 border-brutalBorder bg-surface flex justify-between items-center">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-primary text-darkBg border border-black shadow-[1px_1px_0px_rgba(0,0,0,1)] animate-float">
            <Shield className="h-4 w-4 stroke-[2.5]" />
          </div>
          <div>
            <h4 className="font-space font-bold uppercase text-sm tracking-wide text-textPrimary flex items-center gap-1.5">
              CivicPulse Copilot <Sparkles className="h-3 w-3 text-primary animate-pulse" />
            </h4>
            <span className="text-[10px] font-mono text-primary font-bold">ONLINE &bull; GEMINI AGENT</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleClearHistory}
            className="text-[9px] font-mono border border-brutalBorder px-1.5 py-0.5 hover:bg-danger/10 hover:text-danger hover:border-danger transition-colors"
            title="Clear Chat History"
          >
            Clear
          </button>
          <button
            onClick={onClose}
            className="p-1 border border-brutalBorder text-textMuted hover:text-danger hover:border-danger hover:bg-danger/10 transition-all cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 space-y-4 bg-darkBg/90"
      >
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex flex-col max-w-[85%] ${
              msg.sender === 'user' ? 'ml-auto items-end' : 'mr-auto items-start'
            }`}
          >
            <div className={`p-3 border-2 border-black font-inter text-xs leading-relaxed ${
              msg.sender === 'user'
                ? 'bg-secondary text-white shadow-[2px_2px_0px_rgba(255,255,255,0.15)] rounded-none'
                : 'bg-surface text-textPrimary shadow-brutalGray rounded-none'
            }`}>
              <div className="whitespace-pre-line prose-invert text-left">{msg.text}</div>
            </div>
            <span className="text-[9px] font-mono text-textMuted mt-1 px-1">
              {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
        ))}

        {isTyping && (
          <div className="mr-auto items-start max-w-[85%] flex flex-col">
            <div className="p-3 border-2 border-black bg-surface text-textMuted text-xs flex items-center gap-2">
              <span className="flex gap-1">
                <span className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </span>
              <span className="font-mono text-[10px] uppercase font-bold tracking-wider">AI parsing report database...</span>
            </div>
          </div>
        )}
      </div>

      {/* Quick Replies */}
      <div className="p-3 border-t border-brutalBorder bg-darkBg/95 flex flex-wrap gap-1.5">
        {quickReplies.map((reply, idx) => (
          <button
            key={idx}
            onClick={() => handleSendMessage(reply)}
            disabled={isTyping}
            className="text-[10px] font-space font-bold uppercase px-2.5 py-1 border border-brutalBorder text-textMuted hover:text-primary hover:border-primary hover:bg-primary/5 transition-all cursor-pointer disabled:opacity-50 text-left"
          >
            {reply}
          </button>
        ))}
      </div>

      {/* Form Input */}
      <form
        onSubmit={handleSubmit}
        className="p-4 border-t-2 border-brutalBorder bg-surface flex gap-2 items-center"
      >
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Ask about community issues..."
          className="flex-1 glass-input py-2 text-xs focus:ring-0 focus:border-primary"
          disabled={isTyping}
        />
        <button
          type="submit"
          disabled={isTyping || !inputText.trim()}
          className="p-2 border-2 border-black bg-primary text-darkBg hover:bg-white transition-all duration-150 shadow-[2px_2px_0px_rgba(0,0,0,1)] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none cursor-pointer flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Send className="h-4 w-4" />
        </button>
      </form>
    </div>
  );
};
