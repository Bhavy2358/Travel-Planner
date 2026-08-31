import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Send, Sparkles, Bot, User, CornerDownLeft, Loader2, Compass } from 'lucide-react';
import { chatAPI } from '../services/api';

export default function Chatbot({ tripId, onItineraryModified }) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: "Hi! I'm your **Travel Copilot**. I have full context of your trip schedule, hotel bookings, and budget. How can I help you today?"
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [suggestedActions, setSuggestedActions] = useState([
    "What am I doing tomorrow?",
    "How much have I spent?",
    "Why did you choose this hotel?",
    "Remove museum and add shopping"
  ]);

  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const handleSend = async (textToSend = null) => {
    const query = textToSend || input;
    if (!query.trim() || loading) return;

    const userMsg = { role: 'user', content: query };
    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    setInput('');
    setLoading(true);

    try {
      const res = await chatAPI.sendMessage(updatedMessages, tripId);
      setMessages([...updatedMessages, { role: 'assistant', content: res.data.message }]);
      if (res.data.suggested_actions && res.data.suggested_actions.length > 0) {
        setSuggestedActions(res.data.suggested_actions);
      }
      if (res.data.executed_action && onItineraryModified) {
        onItineraryModified();
      }
    } catch (err) {
      console.warn('Chat error:', err);
      setMessages([
        ...updatedMessages,
        {
          role: 'assistant',
          content: "I'm ready to assist with your trip itinerary, budget analytics, and scheduling questions!"
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      
      {/* Floating Toggle Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="group flex items-center space-x-2.5 px-4 py-3 bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-700 hover:to-indigo-700 text-white rounded-full shadow-floating hover:scale-105 transition-smooth border border-white/20"
        >
          <Sparkles className="w-5 h-5 animate-spin-slow text-amber-300" />
          <span className="text-xs font-bold tracking-wide">AI Travel Copilot</span>
        </button>
      )}

      {/* Expandable Chat Drawer */}
      {isOpen && (
        <div className="w-[360px] sm:w-[400px] h-[540px] bg-white rounded-2xl shadow-floating border border-slate-200 flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-5">
          
          {/* Chat Header */}
          <div className="p-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-lg bg-brand-500 text-white flex items-center justify-center font-bold">
                <Compass className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold">AI Travel Copilot</h4>
                <p className="text-[10px] text-slate-400">Live Trip Context Aware</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-smooth"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Messages Area */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3 text-xs">
            {messages.map((m, idx) => {
              const isAssistant = m.role === 'assistant';
              return (
                <div
                  key={idx}
                  className={`flex items-start space-x-2 ${isAssistant ? '' : 'flex-row-reverse space-x-reverse'}`}
                >
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 text-[10px] font-bold ${isAssistant ? 'bg-brand-100 text-brand-700' : 'bg-slate-800 text-white'}`}>
                    {isAssistant ? <Bot className="w-3.5 h-3.5" /> : <User className="w-3.5 h-3.5" />}
                  </div>
                  <div
                    className={`max-w-[82%] p-3 rounded-2xl whitespace-pre-line leading-relaxed ${
                      isAssistant
                        ? 'bg-slate-100/90 text-slate-800 rounded-tl-sm'
                        : 'bg-brand-600 text-white rounded-tr-sm'
                    }`}
                  >
                    {m.content}
                  </div>
                </div>
              );
            })}

            {loading && (
              <div className="flex items-center space-x-2 text-slate-400 text-xs pl-8">
                <Loader2 className="w-3.5 h-3.5 animate-spin text-brand-600" />
                <span>Travel Copilot is thinking...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Action Suggestion Chips */}
          <div className="px-3 py-2 bg-slate-50 border-t border-slate-100 flex items-center space-x-1.5 overflow-x-auto no-scrollbar">
            {suggestedActions.map((action, i) => (
              <button
                key={i}
                onClick={() => handleSend(action)}
                className="whitespace-nowrap px-2.5 py-1 text-[11px] font-medium text-slate-700 bg-white hover:bg-slate-100 border border-slate-200 rounded-full transition-smooth shrink-0"
              >
                {action}
              </button>
            ))}
          </div>

          {/* Input Box */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="p-3 bg-white border-t border-slate-200 flex items-center space-x-2"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask anything or request itinerary changes..."
              className="flex-1 px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-brand-500 focus:outline-none"
            />
            <button
              type="submit"
              disabled={!input.trim() || loading}
              className="p-2 bg-brand-600 hover:bg-brand-700 text-white rounded-xl shadow-sm transition-smooth disabled:opacity-40"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>

        </div>
      )}

    </div>
  );
}
