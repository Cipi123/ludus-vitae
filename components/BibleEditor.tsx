
import React, { useState, useRef, useEffect } from 'react';
import { Save, Sparkles, Send, ArrowRight, BookOpen, Copy, Plus, Check, X } from 'lucide-react';
import { askPhilosopher, OracleResponse } from '../services/geminiService';
import { Virtue } from '../types';

interface Props {
  content: string;
  onSave: (newContent: string) => void;
  onAddVirtue: (virtue: Virtue) => void;
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

const BibleEditor: React.FC<Props> = ({ content, onSave, onAddVirtue }) => {
  const [text, setText] = useState(content);
  const [isDirty, setIsDirty] = useState(false);
  
  // Chat State
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: "I am the Socratic Mirror. I am here to help you define who you are, and who you never want to be. Shall we begin the interrogation of your soul?" }
  ]);
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setText(e.target.value);
    setIsDirty(true);
  };

  const handleSave = () => {
    onSave(text);
    setIsDirty(false);
  };

  const handleAppend = (textToAppend: string) => {
    const newText = text + "\n\n" + textToAppend;
    setText(newText);
    setIsDirty(true);
  };

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMsg = input;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setLoading(true);

    try {
      const response: OracleResponse = await askPhilosopher(userMsg, text);
      
      const newMessages: Message[] = [];
      
      if (response.text) {
        newMessages.push({ role: 'assistant', content: response.text });
      }

      if (response.toolCalls) {
        response.toolCalls.forEach((tc, idx) => {
          if (tc.name === 'suggest_virtue') {
            newMessages.push({
              role: 'assistant',
              content: "This seems like a core value.",
              toolCall: {
                id: `tc-philo-${Date.now()}-${idx}`,
                name: tc.name,
                args: tc.args,
                status: 'pending'
              }
            });
          }
        });
      }

      setMessages(prev => [...prev, ...newMessages]);

    } catch (e) {
      setMessages(prev => [...prev, { role: 'assistant', content: "The connection to the realm of ideas is lost." }]);
    } finally {
      setLoading(false);
    }
  };

  const handleToolAction = (messageIndex: number, action: 'accept' | 'reject') => {
    setMessages(prev => prev.map((msg, idx) => {
      if (idx !== messageIndex || !msg.toolCall) return msg;
      
      if (action === 'accept' && msg.toolCall.name === 'suggest_virtue') {
        const args = msg.toolCall.args;
        const newVirtue: Virtue = {
          id: `v-philo-${Date.now()}`,
          name: args.name,
          description: args.description,
          adherence: [false, false, false, false, false, false, false]
        };
        onAddVirtue(newVirtue);
      }

      return {
        ...msg,
        toolCall: { ...msg.toolCall!, status: action === 'accept' ? 'accepted' : 'rejected' }
      };
    }));
  };

  return (
    <div className="flex flex-col lg:flex-row h-[calc(100vh-100px)] gap-6 animate-fade-in">
      
      {/* Left Pane: Editor */}
      <div className="flex-1 bg-void-light border border-gray-700 rounded-xl p-4 flex flex-col shadow-xl order-2 lg:order-1">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-2 text-gold">
            <BookOpen size={20} />
            <h2 className="text-xl font-bold font-mono">Personal Bible</h2>
          </div>
          <button
            onClick={handleSave}
            disabled={!isDirty}
            className={`flex items-center gap-2 px-4 py-2 rounded font-mono text-sm transition-colors ${
              isDirty 
                ? 'bg-gold text-black hover:bg-yellow-400' 
                : 'bg-gray-800 text-gray-500 cursor-not-allowed'
            }`}
          >
            <Save size={16} />
            Save
          </button>
        </div>
        <textarea
          className="flex-1 bg-[#0a0f1c] text-gray-300 font-mono text-sm p-6 rounded-lg border border-gray-800 focus:border-gold focus:outline-none resize-none leading-relaxed scrollbar-thin"
          value={text}
          onChange={handleChange}
          spellCheck={false}
          placeholder="# My Manifesto..."
        />
      </div>

      {/* Right Pane: The Philosopher */}
      <div className="lg:w-[400px] bg-void-light border border-indigo-900/50 rounded-xl flex flex-col shadow-2xl overflow-hidden order-1 lg:order-2">
        <div className="bg-[#1e1b4b] p-4 border-b border-indigo-900 flex items-center gap-3">
          <div className="p-2 bg-indigo-500/20 rounded-full text-indigo-400">
            <Sparkles size={18} />
          </div>
          <div>
            <h3 className="font-bold text-indigo-100">Socratic Mirror</h3>
            <p className="text-xs text-indigo-400/70">Identity Architect</p>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#0f1016]">
          {messages.map((msg, idx) => (
            <div key={idx} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
              
              {msg.content && (
                <div className={`max-w-[90%] rounded-lg text-sm leading-relaxed shadow-sm relative group ${
                  msg.role === 'user' 
                    ? 'bg-indigo-900 text-white p-3 rounded-br-none' 
                    : 'bg-gray-800 text-gray-200 p-3 border border-gray-700 rounded-bl-none'
                }`}>
                  {msg.content}
                  {msg.role === 'assistant' && msg.content.length > 20 && (
                    <button 
                      onClick={() => handleAppend(msg.content)}
                      className="absolute -right-8 top-0 p-1 text-gray-600 hover:text-gold opacity-0 group-hover:opacity-100 transition-opacity"
                      title="Append to Bible"
                    >
                      <ArrowRight size={16} />
                    </button>
                  )}
                </div>
              )}

              {msg.toolCall && (
                <div className={`mt-2 w-full border rounded-lg overflow-hidden ${
                  msg.toolCall.status === 'pending' ? 'border-gold/30 bg-gold/5' : 'border-gray-800 opacity-50'
                }`}>
                  <div className="p-3">
                    <div className="text-xs text-gold uppercase font-bold mb-1">
                      Virtue Discovered
                    </div>
                    <div className="font-bold text-white">{msg.toolCall.args.name}</div>
                    <div className="text-xs text-gray-400 italic">{msg.toolCall.args.description}</div>
                  </div>
                  
                  {msg.toolCall.status === 'pending' && (
                     <div className="flex border-t border-gold/20">
                        <button 
                          onClick={() => handleToolAction(idx, 'accept')}
                          className="flex-1 py-2 text-xs font-bold text-gold hover:bg-gold/10 transition-colors flex items-center justify-center gap-1"
                        >
                          <Plus size={12} /> Add Virtue
                        </button>
                        <div className="w-[1px] bg-gold/20"></div>
                        <button 
                          onClick={() => handleToolAction(idx, 'reject')}
                          className="flex-1 py-2 text-xs font-bold text-gray-500 hover:bg-red-900/20 hover:text-red-400 transition-colors"
                        >
                          Discard
                        </button>
                     </div>
                  )}
                   {msg.toolCall.status === 'accepted' && (
                      <div className="bg-green-900/20 text-green-400 text-[10px] text-center py-1 font-mono uppercase">Added</div>
                   )}
                </div>
              )}

            </div>
          ))}
          
          {loading && (
            <div className="flex gap-1 px-3">
              <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
              <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
              <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        <div className="p-3 bg-[#1e1b4b] border-t border-indigo-900/50">
          <div className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="I want to be..."
              className="flex-1 bg-indigo-950/50 text-white border border-indigo-800 rounded px-3 py-2 text-sm focus:outline-none focus:border-indigo-500 placeholder-indigo-300/30 font-light"
            />
            <button 
              onClick={handleSend}
              disabled={loading || !input.trim()}
              className="bg-indigo-600 hover:bg-indigo-500 text-white p-2 rounded transition-colors disabled:opacity-50"
            >
              <Send size={16} />
            </button>
          </div>
        </div>
      </div>

    </div>
  );
};

export default BibleEditor;
