import React, { useState, useEffect, useRef } from "react";
import { 
  Bot, 
  Send, 
  Sparkles, 
  Sprout, 
  Trash2, 
  RotateCcw, 
  HelpCircle, 
  User, 
  CheckCircle2, 
  AlertCircle,
  ExternalLink,
  Droplets,
  Flower2
} from "lucide-react";

const SUGGESTED_PROMPTS = [
  "Why are my plant leaves turning yellow?",
  "How often should I water my money plant?",
  "What fertilizer is best for a rose plant?",
  "Why is my plant not growing?",
  "My snake plant has brown tips, what should I do?",
  "How do I propagate pothos in water?"
];

export default function AiAssistant({ 
  plants = [], 
  selectedPlantContext = null, 
  setSelectedPlantContext,
  serverHealth,
  setActivePage
}) {
  const [messages, setMessages] = useState(() => {
    return [
      {
        id: "intro-1",
        role: "assistant",
        content: `👋 Hello! I am **PlantCare AI**, your intelligent botanical and horticultural assistant.\n\nI can help you diagnose leaf ailments, calculate optimal watering cadences, choose organic fertilizers, and provide personalized care advice.\n\nTry clicking one of the suggested questions below, or ask anything about your plants!`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        source: "system"
      }
    ];
  });

  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [activePlantId, setActivePlantId] = useState(selectedPlantContext?.id || "");
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (selectedPlantContext) {
      setActivePlantId(selectedPlantContext.id);
    }
  }, [selectedPlantContext]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  const activePlant = plants.find(p => p.id === activePlantId) || null;

  const handleSendMessage = async (textToSend) => {
    const text = (textToSend || inputMessage).trim();
    if (!text || isLoading) return;

    const userMsg = {
      id: "user-" + Date.now(),
      role: "user",
      content: text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      plantContextName: activePlant ? activePlant.name : null
    };

    setMessages(prev => [...prev, userMsg]);
    setInputMessage("");
    setIsLoading(true);

    try {
      // Build history for conversational coherence
      const historyPayload = messages.slice(-6).map(m => ({
        role: m.role,
        content: m.content
      }));

      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: text,
          history: historyPayload,
          plantContext: activePlant ? {
            name: activePlant.name,
            species: activePlant.species,
            location: activePlant.location,
            wateringIntervalDays: activePlant.wateringIntervalDays,
            lastWateredDate: activePlant.lastWateredDate,
            healthStatus: activePlant.healthStatus
          } : null
        })
      });

      const data = await res.json();

      const botReply = {
        id: "bot-" + Date.now(),
        role: "assistant",
        content: data.reply || "I apologize, but I could not formulate advice right now. Please try again.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        source: data.source || "gemini-3.8-flash",
        isDemo: Boolean(data.isDemo),
        tip: data.tip || null
      };

      setMessages(prev => [...prev, botReply]);
    } catch (err) {
      console.error("Chat request failed:", err);
      setMessages(prev => [
        ...prev,
        {
          id: "bot-err-" + Date.now(),
          role: "assistant",
          content: `⚠️ Could not connect to the backend care service.\n\nEnsure the backend server is running on \`http://localhost:5000\`. Check your connection and try again.`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          source: "error"
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearHistory = () => {
    setMessages([
      {
        id: "intro-reset",
        role: "assistant",
        content: "Chat history cleared. How can I assist your garden today?",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        source: "system"
      }
    ]);
  };

  // Helper to format basic markdown text into clean HTML elements safely
  const renderFormattedContent = (content) => {
    const lines = content.split("\n");
    return lines.map((line, idx) => {
      // Header 3
      if (line.startsWith("### ")) {
        return (
          <h4 key={idx} className="text-sm font-bold text-slate-900 mt-2.5 mb-1.5 flex items-center gap-1.5">
            {line.replace("### ", "")}
          </h4>
        );
      }
      // Header 2
      if (line.startsWith("## ")) {
        return (
          <h3 key={idx} className="text-base font-bold text-slate-900 mt-3 mb-2">
            {line.replace("## ", "")}
          </h3>
        );
      }
      // Bullet list
      if (line.trim().startsWith("- ") || line.trim().startsWith("* ")) {
        const bulletText = line.trim().replace(/^[-*]\s+/, "");
        return (
          <div key={idx} className="flex items-start gap-2 my-1 pl-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
            <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
              {formatInlineStyles(bulletText)}
            </p>
          </div>
        );
      }
      // Numbered list
      const numMatch = line.trim().match(/^(\d+)\.\s+(.*)/);
      if (numMatch) {
        return (
          <div key={idx} className="flex items-start gap-2 my-1 pl-1">
            <span className="text-xs font-bold text-emerald-700 mt-0.5 shrink-0">
              {numMatch[1]}.
            </span>
            <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
              {formatInlineStyles(numMatch[2])}
            </p>
          </div>
        );
      }
      // Empty line
      if (!line.trim()) {
        return <div key={idx} className="h-2" />;
      }
      // Normal paragraph
      return (
        <p key={idx} className="text-xs sm:text-sm text-slate-700 leading-relaxed my-1">
          {formatInlineStyles(line)}
        </p>
      );
    });
  };

  // Helper for inline **bold** and *italic*
  const formatInlineStyles = (text) => {
    const parts = text.split(/(\*\*.*?\*\*|\*.*?\*)/g);
    return parts.map((part, i) => {
      if (part.startsWith("**") && part.endsWith("**")) {
        return <strong key={i} className="font-semibold text-slate-900">{part.slice(2, -2)}</strong>;
      }
      if (part.startsWith("*") && part.endsWith("*")) {
        return <em key={i} className="text-slate-600 italic">{part.slice(1, -1)}</em>;
      }
      return part;
    });
  };

  return (
    <div className="h-[calc(100vh-140px)] flex flex-col bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden animate-in fade-in duration-300">
      
      {/* Chat Header Bar */}
      <div className="p-4 px-6 bg-gradient-to-r from-emerald-800 to-teal-900 text-white flex items-center justify-between border-b border-emerald-900">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center backdrop-blur-md text-emerald-300">
            <Bot className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold">PlantCare AI Assistant</h2>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                serverHealth?.hasGeminiKey 
                  ? "bg-emerald-500/20 text-emerald-200 border-emerald-400/30" 
                  : "bg-amber-500/20 text-amber-200 border-amber-400/30"
              }`}>
                {serverHealth?.hasGeminiKey ? "Gemini 3.8 Flash" : "Horticultural Demo Mode"}
              </span>
            </div>
            <p className="text-[11px] text-emerald-100/80">
              Interactive botanical care advice & symptom diagnosis
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Plant Context Dropdown */}
          {plants.length > 0 && (
            <div className="hidden sm:flex items-center gap-1.5 bg-white/10 px-3 py-1.5 rounded-xl border border-white/20 text-xs">
              <Flower2 className="w-3.5 h-3.5 text-emerald-300" />
              <select
                value={activePlantId}
                onChange={e => {
                  setActivePlantId(e.target.value);
                  const p = plants.find(plant => plant.id === e.target.value);
                  if (setSelectedPlantContext) setSelectedPlantContext(p || null);
                }}
                className="bg-transparent text-white text-xs outline-none cursor-pointer"
              >
                <option value="" className="text-slate-800">General Questions</option>
                {plants.map(p => (
                  <option key={p.id} value={p.id} className="text-slate-800">
                    Focus on: {p.name} ({p.species})
                  </option>
                ))}
              </select>
            </div>
          )}

          <button
            onClick={handleClearHistory}
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition"
            title="Clear chat history"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Active Focus Pill for mobile */}
      {activePlant && (
        <div className="sm:hidden px-4 py-2 bg-emerald-50 border-b border-emerald-100 flex items-center justify-between text-xs text-emerald-800">
          <span className="font-semibold flex items-center gap-1">
            <Sprout className="w-3.5 h-3.5" /> Focusing on: {activePlant.name}
          </span>
          <button onClick={() => setActivePlantId("")} className="text-slate-400 hover:text-slate-600">✕</button>
        </div>
      )}

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
        {messages.map(msg => {
          const isUser = msg.role === "user";

          return (
            <div 
              key={msg.id} 
              className={`flex gap-3 max-w-3xl ${isUser ? "ml-auto flex-row-reverse" : "mr-auto"}`}
            >
              {/* Avatar */}
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 text-white ${
                isUser 
                  ? "bg-gradient-to-br from-emerald-600 to-teal-600 shadow-xs" 
                  : "bg-slate-800"
              }`}>
                {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4 text-emerald-400" />}
              </div>

              {/* Message Bubble */}
              <div className="space-y-1 max-w-[85%]">
                {isUser && msg.plantContextName && (
                  <span className="text-[10px] text-emerald-700 font-semibold block text-right">
                    Asking about {msg.plantContextName}
                  </span>
                )}

                <div className={`p-4 rounded-3xl text-sm shadow-xs ${
                  isUser
                    ? "bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-tr-xs"
                    : "bg-slate-50 border border-slate-200/80 rounded-tl-xs text-slate-800"
                }`}>
                  {isUser ? (
                    <p className="leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                  ) : (
                    <div className="space-y-0.5">
                      {renderFormattedContent(msg.content)}
                    </div>
                  )}
                </div>

                <div className={`flex items-center gap-2 text-[10px] text-slate-400 px-1 ${isUser ? "justify-end" : "justify-start"}`}>
                  <span>{msg.timestamp}</span>
                  {msg.source && msg.source !== "system" && (
                    <span className="font-medium text-slate-500">
                      • {msg.isDemo ? "Demo Knowledge" : msg.source}
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {/* Loading Indicator */}
        {isLoading && (
          <div className="flex gap-3 max-w-xl mr-auto">
            <div className="w-8 h-8 rounded-xl bg-slate-800 text-emerald-400 flex items-center justify-center shrink-0">
              <Bot className="w-4 h-4" />
            </div>
            <div className="p-4 rounded-3xl rounded-tl-xs bg-slate-50 border border-slate-200/80 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-bounce" />
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-bounce [animation-delay:0.2s]" />
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-bounce [animation-delay:0.4s]" />
              <span className="text-xs text-slate-500 ml-1">PlantCare AI is analyzing horticultural advice...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Quick Prompt Chips */}
      <div className="px-4 py-2 border-t border-slate-100 bg-slate-50/60 overflow-x-auto flex gap-2 no-scrollbar">
        {SUGGESTED_PROMPTS.map((prompt, i) => (
          <button
            key={i}
            disabled={isLoading}
            onClick={() => handleSendMessage(prompt)}
            className="whitespace-nowrap px-3 py-1.5 rounded-xl bg-white hover:bg-emerald-50 text-slate-700 hover:text-emerald-800 border border-slate-200 text-xs font-medium transition shrink-0 active:scale-95"
          >
            🌿 {prompt}
          </button>
        ))}
      </div>

      {/* Input Message Form */}
      <form onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }} className="p-3 sm:p-4 bg-white border-t border-slate-200 flex items-center gap-2">
        <input
          type="text"
          value={inputMessage}
          onChange={e => setInputMessage(e.target.value)}
          placeholder={activePlant ? `Ask advice about ${activePlant.name} (${activePlant.species})...` : "Ask any plant question (e.g. Why are leaves yellow?)..."}
          disabled={isLoading}
          className="flex-1 px-4 py-3 rounded-2xl border border-slate-200 text-xs sm:text-sm bg-slate-50 focus:bg-white outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition"
        />

        <button
          type="submit"
          disabled={!inputMessage.trim() || isLoading}
          className="p-3 sm:px-5 sm:py-3 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 disabled:opacity-50 text-white font-bold flex items-center justify-center gap-2 transition shadow-md shadow-emerald-600/20 active:scale-95"
        >
          <Send className="w-4 h-4" />
          <span className="hidden sm:inline text-xs font-semibold">Send</span>
        </button>
      </form>

    </div>
  );
}
