
import React, { useState, useRef, useEffect } from 'react';
import { askTherapist, OracleResponse } from '../services/geminiService';
import { GameState, Quest, StatType } from '../types';
import { Send, Waves, HeartHandshake, Leaf, Scroll, Check, X, Sprout } from 'lucide-react';

interface Props {
  gameState: GameState;
  onAddQuest: (quest: Quest) => void;
}

interface Message {
  role: 'user' | 'assistant';
  content: string;
  toolCall?: {
    id: string;
    name: string;
    args: any;
    status: 'pending' | 'accepted' | 'rejected';
  };
}

const Sanctuary: React.FC<Props> = ({ gameState, onAddQuest }) => {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: "The noise of the game fades here. This is a safe space. What weighs on your mind, traveler?" }
  ]);
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMsg = input;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setLoading(true);

    const journalSummary = gameState.journal.slice(0, 3).map(j => `[${j.date}] ${j.content}`).join('\n');

    try {
      const response: OracleResponse = await askTherapist(userMsg, gameState.bible, journalSummary);
      
      const newMessages: Message[] = [];

      if (response.text) {
        newMessages.push({ role: 'assistant', content: response.text });
      }

      if (response.toolCalls) {
        response.toolCalls.forEach((tc, idx) => {
          if (tc.name === 'suggest_quest') {
            newMessages.push({
              role: 'assistant',
              content: "I offer a path to restoration:",
              toolCall: {
                id: `tc-therapist-${Date.now()}-${idx}`,
                name: tc.name,
                args: tc.args,
                status: 'pending'
              }
            });
          }
        });
      }

      if (newMessages.length === 0) {
         newMessages.push({ role: 'assistant', content: "I am listening." });
      }
      
      setMessages(prev => [...prev, ...newMessages]);
    } catch (e) {
      setMessages(prev => [...prev, { role: 'assistant', content: "The silence is heavy... I cannot respond right now." }]);
    } finally {
      setLoading(false);
    }
  };

  const handleToolAction = (messageIndex: number, action: 'accept' | 'reject') => {
    setMessages(prev => prev.map((msg, idx) => {
      if (idx !== messageIndex || !msg.toolCall) return msg;
      
      if (action === 'accept' && msg.toolCall.name === 'suggest_quest') {
        const args = msg.toolCall.args;
        const newQuest: Quest = {
          id: `q-therapy-${Date.now()}`,
          title: args.title,
          description: args.description,
          type: args.type as StatType,
          difficulty: args.difficulty,
          xpReward: args.xpReward,
          creditReward: Math.max(5, Math.floor(args.xpReward * 0.2)), // Default calculation for credits
          completed: false,
          status: 'TODO',
          repeatable: true
        };
        onAddQuest(newQuest);
      }

      return {
        ...msg,
        toolCall: { ...msg.toolCall!, status: action === 'accept' ? 'accepted' : 'rejected' }
      };
    }));
  };

  return (
    <div className="flex flex-col h-[600px] bg-void-light border border-sanctuary-dark rounded-xl overflow-hidden shadow-2xl">
      {/* Header */}
      <div className="bg-slate-900 p-4 border-b border-sanctuary-dark flex items-center gap-3">
        <div className="p-2 bg-sanctuary-dark/30 rounded-full text-sanctuary">
          <Waves size={20} />
        </div>
        <div>
          <h3 className="font-bold text-sanctuary-light text-white">The Sanctuary</h3>
          <p className="text-xs text-sanctuary/70">Reflect. Heal. Align.</p>
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6 bg-[#0f1c20]"> {/* Dark Teal/Slate bg */}
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
            
            {/* Text Bubble */}
            {msg.content && (
              <div className={`max-w-[85%] p-4 rounded-lg text-sm leading-relaxed shadow-sm mb-2 ${
                msg.role === 'user' 
                  ? 'bg-sanctuary-dark text-white rounded-br-none' 
                  : 'bg-slate-800 text-gray-200 border border-slate-600 rounded-bl-none'
              }`}>
                {msg.role === 'assistant' && (
                  <div className="mb-2 text-sanctuary opacity-50">
                    <Leaf size={12} />
                  </div>
                )}
                {msg.content}
              </div>
            )}

            {/* Therapeutic Quest Card */}
            {msg.toolCall && msg.toolCall.name === 'suggest_quest' && (
               <div className={`max-w-[85%] w-full md:w-96 p-0 rounded-lg border overflow-hidden mt-1 shadow-lg transition-all ${
                 msg.toolCall.status === 'pending' ? 'border-sanctuary/50 bg-[#0f1c20]' : 
                 msg.toolCall.status === 'accepted' ? 'border-sanctuary/50 bg-sanctuary/10' : 
                 'border-slate-700 bg-slate-800 opacity-60'
              }`}>
                <div className={`px-4 py-2 text-xs font-bold uppercase tracking-widest flex items-center gap-2 ${
                  msg.toolCall.status === 'pending' ? 'bg-sanctuary/10 text-sanctuary' :
                  msg.toolCall.status === 'accepted' ? 'bg-sanctuary/20 text-sanctuary' :
                  'bg-slate-700 text-slate-400'
                }`}>
                  <Sprout size={14} />
                  Therapeutic Intervention
                </div>
                
                <div className="p-4">
                  <h4 className="font-bold text-white text-lg">{msg.toolCall.args.title}</h4>
                  <div className="flex gap-2 my-2">
                    <span className="text-[10px] px-2 py-1 rounded bg-slate-700 text-slate-300">{msg.toolCall.args.type}</span>
                    <span className="text-[10px] px-2 py-1 rounded bg-slate-700 text-slate-300">{msg.toolCall.args.difficulty}</span>
                    <span className="text-[10px] px-2 py-1 rounded bg-sanctuary/20 text-sanctuary">+{msg.toolCall.args.xpReward} XP</span>
                  </div>
                  <p className="text-sm text-gray-300">{msg.toolCall.args.description}</p>
                </div>

                {msg.toolCall.status === 'pending' && (
                  <div className="flex border-t border-slate-700">
                    <button 
                      onClick={() => handleToolAction(idx, 'accept')}
                      className="flex-1 p-3 text-sm font-mono font-bold text-sanctuary hover:bg-sanctuary/10 transition-colors flex items-center justify-center gap-2"
                    >
                      <Check size={16} /> Commit
                    </button>
                    <div className="w-[1px] bg-slate-700"></div>
                    <button 
                      onClick={() => handleToolAction(idx, 'reject')}
                      className="flex-1 p-3 text-sm font-mono font-bold text-slate-400 hover:bg-slate-700/50 transition-colors flex items-center justify-center gap-2"
                    >
                      <X size={16} /> Dismiss
                    </button>
                  </div>
                )}

                {msg.toolCall.status === 'accepted' && (
                   <div className="px-4 py-2 bg-sanctuary/10 text-sanctuary text-xs font-mono text-center border-t border-sanctuary/20">
                     Task Added to Quest Log
                   </div>
                )}
              </div>
            )}

          </div>
        ))}
        
        {loading && (
          <div className="flex justify-start">
            <div className="bg-slate-800 p-4 rounded-lg rounded-bl-none border border-slate-600">
              <div className="flex gap-1">
                <div className="w-2 h-2 bg-sanctuary rounded-full animate-pulse" style={{ animationDelay: '0ms' }} />
                <div className="w-2 h-2 bg-sanctuary rounded-full animate-pulse" style={{ animationDelay: '300ms' }} />
                <div className="w-2 h-2 bg-sanctuary rounded-full animate-pulse" style={{ animationDelay: '600ms' }} />
              </div>
            </div>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 bg-slate-900 border-t border-sanctuary-dark/50">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Speak your mind..."
            className="flex-1 bg-slate-800 text-white border border-slate-600 rounded-md px-4 py-3 focus:outline-none focus:border-sanctuary focus:ring-1 focus:ring-sanctuary transition-all placeholder-gray-400 font-light"
          />
          <button 
            onClick={handleSend}
            disabled={loading || !input.trim()}
            className="bg-sanctuary-dark hover:bg-sanctuary text-white p-3 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <HeartHandshake size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Sanctuary;
