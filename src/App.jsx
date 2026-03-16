import React, { useState, useEffect, useRef } from 'react';
import { 
  Send, 
  Paperclip, 
  Plus, 
  MessageSquare, 
  Settings, 
  ChevronLeft, 
  ChevronRight,
  User,
  Bot,
  Sparkles,
  Search,
  MoreHorizontal,
  Trash2
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export default function ChatApp() {
  // États pour la gestion multi-conversations
  const [chats, setChats] = useState(() => {
    const saved = localStorage.getItem('nexgen_chats');
    return saved ? JSON.parse(saved) : [];
  });
  const [currentChatId, setCurrentChatId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const scrollRef = useRef(null);

  // Sauvegarde automatique des chats dans le localStorage
  useEffect(() => {
    localStorage.setItem('nexgen_chats', JSON.stringify(chats));
  }, [chats]);

  // Charger les messages du chat sélectionné
  useEffect(() => {
    if (currentChatId) {
      const activeChat = chats.find(c => c.id === currentChatId);
      setMessages(activeChat ? activeChat.messages : []);
    } else {
      setMessages([]);
    }
  }, [currentChatId, chats]);

  // Auto-scroll to bottom
  useEffect(() => {
    try {
      if (scrollRef.current && messages.length > 0) {
        scrollRef.current.scrollIntoView({ behavior: 'smooth', block: 'end' });
      }
    } catch (e) {
      console.warn("Scroll error", e);
    }
  }, [messages, isLoading]);

  const handleNewChat = () => {
    setCurrentChatId(null);
    setMessages([]);
    setInput('');
  };

  const deleteChat = (e, id) => {
    e.stopPropagation();
    setChats(prev => prev.filter(c => c.id !== id));
    if (currentChatId === id) setCurrentChatId(null);
  };

  const handleSendMessage = async (e) => {
    if (e) e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = { 
      id: Date.now(), 
      role: 'user', 
      content: input,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInput('');
    setIsLoading(true);

    // Gérer la création d'un nouveau chat au premier message
    let activeId = currentChatId;
    if (!activeId) {
      activeId = 'chat-' + Math.random().toString(36).substr(2, 9);
      setCurrentChatId(activeId);
      const newChat = {
        id: activeId,
        title: input.substring(0, 30) + (input.length > 30 ? '...' : ''),
        messages: updatedMessages,
        sessionId: 'session-' + Math.random().toString(36).substr(2, 9)
      };
      setChats(prev => [newChat, ...prev]);
    } else {
      setChats(prev => prev.map(c => 
        c.id === activeId ? { ...c, messages: updatedMessages } : c
      ));
    }

    const currentChat = chats.find(c => c.id === activeId) || { sessionId: 'session-' + Math.random().toString(36).substr(2, 9) };

    try {
      const WEBHOOK_URL = 'https://phylis-nondynamic-alma.ngrok-free.dev/webhook-test/jemman33427';
      
      const response = await fetch(WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          chatInput: userMessage.content,
          sessionId: currentChat.sessionId,
          history: messages.map(m => ({ role: m.role, content: m.content }))
        })
      });

      let responseText = "";
      const rawText = await response.text().catch(() => null);
      
      if (rawText) {
        try {
          const rawData = JSON.parse(rawText);
          const data = Array.isArray(rawData) ? rawData[0] : rawData;
          
          if (data && typeof data === 'object') {
            // Chercher les clés communes ou prendre la première clé qui contient du texte
            responseText = data.output || data.text || data.message || data.response || (typeof Object.values(data)[0] === 'string' ? Object.values(data)[0] : JSON.stringify(data));
          } else {
            responseText = String(data);
          }
        } catch (e) {
          // Si ce n'est pas du JSON, c'est du texte brut de n8n
          responseText = rawText;
        }
      } else {
        responseText = "Désolé, je n'ai pas pu lire la réponse du serveur.";
      }

      if (!responseText || responseText === "[object Object]") {
        responseText = "Le serveur a répondu mais le format est inconnu. Vérifiez le dernier nœud de votre workflow n8n.";
      }

      const aiResponse = { 
        id: Date.now() + Math.random(), 
        role: 'assistant', 
        content: String(responseText || "Réponse vide"),
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      const finalMessages = [...updatedMessages, aiResponse];
      setMessages(finalMessages);
      setChats(prev => prev.map(c => 
        c.id === activeId ? { ...c, messages: finalMessages } : c
      ));
      setIsLoading(false);

    } catch (error) {
      console.error('Erreur:', error);
      const errorMsg = { 
        id: Date.now() + Math.random(), 
        role: 'assistant', 
        content: "⚠️ **Erreur de connexion** : Vérifiez votre n8n.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, errorMsg]);
      setIsLoading(false);
    }
  };

  return (
    <div className="flex h-screen bg-[#0a0a0a] text-zinc-100 font-sans selection:bg-indigo-500/30">
      
      {/* SIDEBAR */}
      <aside className={cn(
        "bg-[#111] border-r border-zinc-800/50 transition-all duration-300 flex flex-col relative z-20",
        isSidebarOpen ? "w-72" : "w-0 overflow-hidden"
      )}>
        <div className="p-4 flex items-center gap-3 border-b border-zinc-800/50">
          <div className="bg-indigo-600 p-2 rounded-xl">
            <Sparkles size={18} className="text-white" />
          </div>
          <span className="font-bold text-lg tracking-tight">NexGen AI</span>
        </div>

        <div className="p-4 flex flex-col gap-2 flex-grow overflow-y-auto custom-scrollbar">
          <button 
            onClick={handleNewChat}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white p-3 rounded-xl transition-all duration-200 shadow-lg shadow-indigo-600/10 mb-4 font-medium"
          >
            <Plus size={18} />
            Nouvelle conversation
          </button>

          <div className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2 ml-1">Récent</div>
          
          {chats.length === 0 && (
            <div className="text-xs text-zinc-600 text-center py-4 italic">Aucun historique</div>
          )}

          {chats.map((chat) => (
            <div 
              key={chat.id} 
              onClick={() => setCurrentChatId(chat.id)}
              className={cn(
                "group flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-colors border",
                currentChatId === chat.id 
                  ? "bg-zinc-800/80 border-zinc-700 text-white" 
                  : "hover:bg-zinc-800/50 border-transparent text-zinc-400 hover:text-zinc-200"
              )}
            >
              <MessageSquare size={16} className={cn(currentChatId === chat.id ? "text-indigo-400" : "text-zinc-500")} />
              <span className="text-sm truncate flex-grow">{chat.title}</span>
              <Trash2 
                size={14} 
                onClick={(e) => deleteChat(e, chat.id)}
                className="opacity-0 group-hover:opacity-100 text-zinc-600 hover:text-red-400 transition-all" 
              />
            </div>
          ))}
        </div>

        <div className="p-4 border-t border-zinc-800/50 bg-[#0d0d0d]">
          <div className="flex items-center gap-3 p-2 hover:bg-zinc-800/50 rounded-lg cursor-pointer transition-colors">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-xs font-bold">JD</div>
            <div className="flex-grow">
              <div className="text-xs font-medium">John Doe</div>
              <div className="text-[10px] text-zinc-500">Plan Premium</div>
            </div>
            <Settings size={16} className="text-zinc-500" />
          </div>
        </div>
      </aside>

      {/* CHAT AREA */}
      <main className="flex-grow flex flex-col relative bg-[#0a0a0a] overflow-hidden">
        <button 
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="absolute left-4 top-4 z-30 p-2 bg-zinc-900 border border-zinc-800 rounded-lg hover:bg-zinc-800 transition-colors shadow-xl"
        >
          {isSidebarOpen ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
        </button>

        <div className="flex-grow overflow-y-auto p-4 md:p-8 space-y-8 custom-scrollbar relative">
          {messages.length === 0 && (
            <div className="h-full flex flex-col items-center justify-center text-center max-w-2xl mx-auto space-y-6 animate-in fade-in zoom-in duration-700">
              <div className="w-20 h-20 bg-indigo-600/10 rounded-3xl flex items-center justify-center mb-4 ring-1 ring-indigo-500/20 shadow-2xl shadow-indigo-500/10">
                <Sparkles size={40} className="text-indigo-500" />
              </div>
              <h1 className="text-4xl font-extrabold tracking-tight bg-gradient-to-b from-white to-zinc-500 bg-clip-text text-transparent">
                Comment puis-je vous aider ?
              </h1>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 w-full max-w-xl">
                {["Explique-moi le cloud computing", "Comment créer une API ?", "Idées de business AI", "Recette de cuisine saine"].map((hint, i) => (
                  <button 
                    key={i} 
                    onClick={() => setInput(hint)}
                    className="p-4 bg-zinc-900/50 border border-zinc-800 rounded-2xl text-left text-sm text-zinc-300 hover:bg-indigo-600/5 hover:border-indigo-500/30 transition-all group"
                  >
                    <div className="font-semibold mb-1 group-hover:text-indigo-400 transition-colors">{hint}</div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map((msg) => (
            <div key={msg.id} className={cn(
              "flex gap-4 max-w-4xl mx-auto group",
              msg.role === 'user' ? "flex-row-reverse" : "flex-row"
            )}>
              <div className={cn(
                "w-9 h-9 rounded-xl flex items-center justify-center shrink-0 shadow-lg ring-1",
                msg.role === 'user' ? "bg-indigo-600 ring-indigo-400/20" : "bg-zinc-800 ring-zinc-700/50"
              )}>
                {msg.role === 'user' ? <User size={18} /> : <Bot size={18} className="text-indigo-400" />}
              </div>
              
              <div className={cn(
                "flex flex-col space-y-2 max-w-[85%]",
                msg.role === 'user' ? "items-end" : "items-start"
              )}>
                <div className={cn(
                  "p-4 rounded-2xl text-sm leading-relaxed shadow-xl backdrop-blur-sm transition-all whitespace-pre-wrap",
                  msg.role === 'user' ? "bg-indigo-600 text-white rounded-tr-none" : "bg-zinc-900 border border-zinc-800 text-zinc-200 rounded-tl-none"
                )}>
                  {msg.content}
                </div>
                <span className="text-[10px] text-zinc-600 font-medium px-1 tracking-wider uppercase">{msg.timestamp}</span>
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex gap-4 max-w-4xl mx-auto animate-pulse-subtle">
              <div className="w-9 h-9 rounded-xl bg-zinc-800 flex items-center justify-center ring-1 ring-zinc-700/50">
                <Bot size={18} className="text-indigo-500" />
              </div>
              <div className="bg-zinc-900 border border-zinc-800/50 p-4 rounded-2xl rounded-tl-none flex gap-1 items-center shadow-lg">
                <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce"></div>
              </div>
            </div>
          )}
          <div ref={scrollRef} />
        </div>

        {/* INPUT AREA */}
        <div className="p-6 md:p-10 relative">
          <div className="max-w-4xl mx-auto">
            <form onSubmit={handleSendMessage} className="relative group flex items-center">
              <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-[28px] blur opacity-10 group-focus-within:opacity-25 transition duration-500"></div>
              <div className="relative w-full flex items-center bg-zinc-900/80 backdrop-blur-xl border border-zinc-800 rounded-[24px] p-2 pr-4 shadow-2xl">
                <button type="button" className="p-3 text-zinc-500 hover:text-white transition-colors">
                  <Paperclip size={20} />
                </button>
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Tapez votre message..."
                  className="flex-grow bg-transparent border-none focus:ring-0 text-zinc-200 placeholder:text-zinc-600 px-2 py-3 text-base outline-none"
                />
                <button 
                  type="submit"
                  disabled={!input.trim() || isLoading}
                  className={cn(
                    "p-3 rounded-2xl transition-all duration-300 flex items-center justify-center shadow-lg",
                    input.trim() && !isLoading ? "bg-indigo-600 text-white hover:bg-indigo-500" : "bg-zinc-800 text-zinc-600"
                  )}
                >
                  <Send size={18} />
                </button>
              </div>
            </form>
          </div>
        </div>
      </main>

      <style dangerouslySetInnerHTML={{ __html: `
        .custom-scrollbar::-webkit-scrollbar { width: 5px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #1f1f1f; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #2f2f2f; }
      ` }} />
    </div>
  );
}
