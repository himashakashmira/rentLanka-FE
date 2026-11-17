import React, { useState, useRef, useEffect } from "react";
import { MessageSquare, X, Send, Sparkles, Bot, ShieldCheck, ArrowRight } from "lucide-react";
import { aiApi } from "../../services/api";

interface Message {
  id: string;
  sender: "ai" | "user";
  text: string;
  timestamp: Date;
}

const STARTER_PROMPTS = [
  "🚗 What cars are available in Colombo?",
  "💰 How does the security deposit work?",
  "📷 Any cine cameras in stock?",
  "📍 Do you deliver to Kandy or Galle?",
];

export const ChatBot: React.FC = () => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [input, setInput] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome-msg",
      sender: "ai",
      text: "Hello! I'm RentLanka AI. Ask me about available cars, cameras, rates, or rental policies across Sri Lanka! 🇱🇰",
      timestamp: new Date(),
    },
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [isOpen, messages, isLoading]);

  const handleSendMessage = async (textToSend?: string) => {
    const query = (textToSend || input).trim();
    if (!query || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      sender: "user",
      text: query,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const reply = await aiApi.chat(query);
      const aiReply: Message = {
        id: (Date.now() + 1).toString(),
        sender: "ai",
        text: reply,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, aiReply]);
    } catch (err: any) {
      const errorReply: Message = {
        id: (Date.now() + 1).toString(),
        sender: "ai",
        text: "I'm having a brief connection hitch. Please verify your connection or ask about our rental equipment and booking policies!",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorReply]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <>
      {/* Floating Trigger Button */}
      <div className="fixed bottom-6 right-6 z-50">
        <button
          onClick={() => setIsOpen((prev) => !prev)}
          aria-label="RentLanka AI Concierge"
          className="relative group flex items-center justify-center w-14 h-14 rounded-full bg-[#006948] hover:bg-[#00855d] text-white shadow-2xl hover:shadow-[0_8px_30px_rgba(0,105,72,0.45)] transition-all duration-300 transform active:scale-95 focus:outline-none"
        >
          {isOpen ? (
            <X className="w-6 h-6 transition-transform duration-200 group-hover:rotate-90" />
          ) : (
            <>
              <MessageSquare className="w-6 h-6 transition-transform duration-200 group-hover:scale-110" />
              {/* Online Green Pulsing Indicator */}
              <span className="absolute top-0.5 right-0.5 flex h-3.5 w-3.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-500 border-2 border-white"></span>
              </span>
            </>
          )}
        </button>
      </div>

      {/* Floating Chat Modal */}
      {isOpen && (
        <div className="fixed bottom-24 right-4 sm:right-6 z-50 w-[360px] sm:w-[400px] max-w-[92vw] h-[520px] max-h-[82vh] bg-white rounded-3xl shadow-2xl border border-slate-200/90 flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-5 duration-300">
          {/* Header */}
          <div className="bg-gradient-to-r from-[#022c22] via-[#006948] to-[#00855d] text-white px-5 py-4 flex items-center justify-between shrink-0 shadow-sm">
            <div className="flex items-center space-x-3">
              <div className="relative">
                <div className="w-9 h-9 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20">
                  <Bot className="w-5 h-5 text-emerald-300" />
                </div>
                <span className="absolute -bottom-0.5 -right-0.5 flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-400 border border-white"></span>
                </span>
              </div>
              <div>
                <div className="flex items-center space-x-1.5">
                  <h3 className="font-headline font-bold text-sm tracking-tight text-white">
                    RentLanka Concierge
                  </h3>
                  <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
                </div>
                <p className="text-[11px] text-emerald-100 flex items-center gap-1 font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block"></span>
                  Online • Live Fleet Grounded
                </p>
              </div>
            </div>

            <button
              onClick={() => setIsOpen(false)}
              className="w-8 h-8 rounded-full hover:bg-white/15 flex items-center justify-center text-white/80 hover:text-white transition-colors"
              aria-label="Close Chat"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Messages Container */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-slate-50/70">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
              >
                {msg.sender === "ai" && (
                  <div className="w-7 h-7 rounded-full bg-emerald-100 text-[#006948] flex items-center justify-center mr-2 mt-0.5 shrink-0 text-xs font-bold shadow-xs">
                    RL
                  </div>
                )}
                <div
                  className={`relative px-4 py-2.5 text-xs sm:text-[13px] leading-relaxed max-w-[82%] shadow-xs ${
                    msg.sender === "user"
                      ? "bg-[#006948] text-white rounded-2xl rounded-tr-xs"
                      : "bg-white text-slate-800 rounded-2xl rounded-tl-xs border border-slate-200/80"
                  }`}
                >
                  <p className="whitespace-pre-line">{msg.text}</p>
                  <span
                    className={`block text-[9px] mt-1 text-right ${
                      msg.sender === "user" ? "text-emerald-100" : "text-slate-400"
                    }`}
                  >
                    {msg.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </span>
                </div>
              </div>
            ))}

            {/* Typing Indicator */}
            {isLoading && (
              <div className="flex justify-start items-center space-x-2">
                <div className="w-7 h-7 rounded-full bg-emerald-100 text-[#006948] flex items-center justify-center mr-2 shrink-0 text-xs font-bold shadow-xs">
                  RL
                </div>
                <div className="bg-white border border-slate-200/80 rounded-2xl rounded-tl-xs px-4 py-3 shadow-xs flex items-center space-x-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#006948] animate-bounce [animation-delay:-0.3s]"></span>
                  <span className="w-2 h-2 rounded-full bg-[#006948] animate-bounce [animation-delay:-0.15s]"></span>
                  <span className="w-2 h-2 rounded-full bg-[#006948] animate-bounce"></span>
                </div>
              </div>
            )}

            {/* Quick Prompts Chips when chat is fresh */}
            {messages.length <= 2 && !isLoading && (
              <div className="pt-2">
                <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2 px-1">
                  Suggested Inquiries:
                </p>
                <div className="flex flex-col gap-1.5">
                  {STARTER_PROMPTS.map((prompt, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSendMessage(prompt)}
                      className="text-left text-xs bg-white hover:bg-emerald-50 text-slate-700 hover:text-[#006948] border border-slate-200 hover:border-emerald-300 rounded-xl px-3 py-2 transition-all duration-150 flex items-center justify-between group shadow-xs"
                    >
                      <span className="line-clamp-1">{prompt}</span>
                      <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-[#006948] group-hover:translate-x-0.5 transition-transform shrink-0 ml-2" />
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Escrow & Shield Notice */}
          <div className="px-4 py-1.5 bg-slate-100/80 border-t border-slate-200/60 flex items-center justify-center space-x-1.5 text-[10px] text-slate-500 font-medium">
            <ShieldCheck className="w-3 h-3 text-[#006948]" />
            <span>Domain-locked to RentLanka verified gear & LankaPay policies</span>
          </div>

          {/* Input Box */}
          <div className="p-3 bg-white border-t border-slate-100 flex items-center space-x-2">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={isLoading}
              placeholder="Ask about gear, prices, or hubs..."
              className="flex-1 bg-slate-50 border border-slate-200 focus:border-[#006948] focus:bg-white rounded-xl px-3.5 py-2.5 text-xs text-slate-800 placeholder-slate-400 outline-none transition-all disabled:opacity-50"
            />
            <button
              onClick={() => handleSendMessage()}
              disabled={!input.trim() || isLoading}
              className="w-9 h-9 rounded-xl bg-[#006948] hover:bg-[#00855d] text-white flex items-center justify-center disabled:opacity-40 disabled:hover:bg-[#006948] transition-colors shrink-0 shadow-sm"
              aria-label="Send message"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default ChatBot;
