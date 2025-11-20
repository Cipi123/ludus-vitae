
import React, { useState, useRef, useEffect } from 'react';
import { askCoach, OracleResponse } from '../services/geminiService';
import { GameState, Quest, StatType } from '../types';
import { Send, Dumbbell, Activity, Flame, Check, X, Ruler, Weight, Edit2, Save, Scale } from 'lucide-react';

interface Props {
  gameState: GameState;
  onAddQuest: (quest: Quest) => void;
  onUpdateBiometrics: (height: number, weight: number) => void;
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

const BioArchitect: React.FC<Props> = ({ gameState, onAddQuest, onUpdateBiometrics }) => {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: "The Iron Forge is online. State your physical status. Injuries? Goals? Energy levels?" }
  ]);
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Biometrics State
  const [isEditingBio, setIsEditingBio] = useState(false);
  const [bioForm, setBioForm] = useState({ 
    height: gameState.user.height, 
    weight: gameState.user.weight 
  });

  // Calculate BMI
  const heightM = gameState.user.height / 100;
  const bmi = heightM > 0 ? (gameState.user.weight / (heightM * heightM)).toFixed(1) : '0.0';
  const bmiValue = parseFloat(bmi);
  
  const getBmiLabel = (val: number) => {
    if (val < 18.5) return { label: 'UNDERWEIGHT', color: 'text-blue-400' };
    if (val < 25) return { label: 'OPTIMAL', color: 'text-green-400' };
    if (val < 30) return { label: 'OVERWEIGHT', color: 'text-yellow-400' };
    return { label: 'OBESE', color: 'text-red-400' };
  };

  const bmiInfo = getBmiLabel(bmiValue);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const handleSaveBio = () => {
    onUpdateBiometrics(bioForm.height, bioForm.weight);
    setIsEditingBio(false);
  };

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMsg = input;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setLoading(true);

    // Construct Physical Stats Summary including Biometrics
    const statsSummary = `
Level: ${gameState.user.level}
HP: ${gameState.user.hp}/${gameState.user.maxHp}
Height: ${gameState.user.height} cm
Weight: ${gameState.user.weight} kg
BMI: ${bmi} (${bmiInfo.label})
STR (Strength): ${gameState.user.attributes[StatType.STR]}
DEX (Dexterity): ${gameState.user.attributes[StatType.DEX]}
CON (Constitution): ${gameState.user.attributes[StatType.CON]}
Physical Skills: ${gameState.user.subSkills
  .filter(s => [StatType.STR, StatType.DEX, StatType.CON].includes(s.parentStat as StatType))
  .map(s => `${s.name} (Lvl ${s.level})`).join(', ') || "None"}
`;

    try {
      const response: OracleResponse = await askCoach(userMsg, statsSummary);
      
      const newMessages: Message[] = [];

      if (response.text) {
        newMessages.push({ role: 'assistant', content: response.text });
      }

      if (response.toolCalls) {
        response.toolCalls.forEach((tc, idx) => {
          if (tc.name === 'suggest_quest') {
            newMessages.push({
              role: 'assistant',
              content: "TRAINING PROTOCOL GENERATED:",
              toolCall: {
                id: `tc-coach-${Date.now()}-${idx}`,
                name: tc.name,
                args: tc.args,
                status: 'pending'
              }
            });
          }
        });
      }

      if (newMessages.length === 0) {
         newMessages.push({ role: 'assistant', content: "Acknowledged." });
      }
      
      setMessages(prev => [...prev, ...newMessages]);
    } catch (e) {
      setMessages(prev => [...prev, { role: 'assistant', content: "Forge Offline. Signal lost." }]);
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
          id: `q-coach-${Date.now()}`,
          title: args.title,
          description: args.description,
          type: args.type as StatType,
          difficulty: args.difficulty,
          xpReward: args.xpReward,
          creditReward: Math.max(5, Math.floor(args.xpReward * 0.2)), // Default calculation for credits
          skillName: args.skillName,
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
    <div className="flex flex-col h-[600px] bg-void-light border border-orange-900 rounded-xl overflow-hidden shadow-2xl animate-fade-in">
      {/* Header */}
      <div className="bg-black p-4 border-b border-orange-900 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-orange-900/30 rounded-full text-orange-500 shadow-[0_0_15px_rgba(249,115,22,0.3)]">
            <Flame size={20} />
          </div>
          <div>
            <h3 className="font-bold text-white uppercase tracking-widest font-mono">The Iron Forge</h3>
            <p className="text-xs text-orange-500/70">Bio-Architecture Engine</p>
          </div>
        </div>
      </div>

      {/* Biometrics Bar */}
      <div className="bg-zinc-900/80 border-b border-zinc-800 px-4 py-2 flex justify-between items-center">
        {isEditingBio ? (
           <div className="flex gap-4 items-center w-full animate-fade-in">
              <div className="flex items-center gap-2 bg-black border border-zinc-700 rounded px-2 py-1">
                 <Ruler size={14} className="text-zinc-500" />
                 <input 
                    type="number" 
                    value={bioForm.height}
                    onChange={(e) => setBioForm({...bioForm, height: Number(e.target.value)})}
                    className="bg-transparent w-16 text-sm text-white focus:outline-none font-mono"
                    placeholder="cm"
                 />
                 <span className="text-xs text-zinc-500">cm</span>
              </div>
              <div className="flex items-center gap-2 bg-black border border-zinc-700 rounded px-2 py-1">
                 <Weight size={14} className="text-zinc-500" />
                 <input 
                    type="number" 
                    value={bioForm.weight}
                    onChange={(e) => setBioForm({...bioForm, weight: Number(e.target.value)})}
                    className="bg-transparent w-16 text-sm text-white focus:outline-none font-mono"
                    placeholder="kg"
                 />
                 <span className="text-xs text-zinc-500">kg</span>
              </div>
              <button onClick={handleSaveBio} className="text-green-500 hover:text-green-400 ml-auto"><Save size={16} /></button>
              <button onClick={() => setIsEditingBio(false)} className="text-red-500 hover:text-red-400"><X size={16} /></button>
           </div>
        ) : (
           <div className="flex justify-between w-full items-center">
              <div className="flex gap-4 md:gap-8 font-mono text-xs text-zinc-400 overflow-x-auto">
                 <div className="flex items-center gap-2 whitespace-nowrap">
                    <Ruler size={14} className="text-orange-700" />
                    <span>HEIGHT: <span className="text-white font-bold">{gameState.user.height}</span> cm</span>
                 </div>
                 <div className="flex items-center gap-2 whitespace-nowrap">
                    <Weight size={14} className="text-orange-700" />
                    <span>WEIGHT: <span className="text-white font-bold">{gameState.user.weight}</span> kg</span>
                 </div>
                 <div className="flex items-center gap-2 whitespace-nowrap pl-4 border-l border-zinc-700">
                    <Scale size={14} className={bmiInfo.color} />
                    <span>BMI: <span className={`font-bold ${bmiInfo.color}`}>{bmi}</span> <span className="text-[9px] opacity-70">[{bmiInfo.label}]</span></span>
                 </div>
              </div>
              <button onClick={() => setIsEditingBio(true)} className="text-zinc-500 hover:text-orange-500 transition-colors ml-4">
                 <Edit2 size={14} />
              </button>
           </div>
        )}
      </div>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6 bg-[#0c0a09]"> {/* Dark Zinc/Amber bg */}
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'} animate-fade-in`}>
            
            {/* Text Bubble */}
            {msg.content && (
              <div className={`max-w-[85%] p-4 rounded-none text-sm leading-relaxed shadow-md mb-2 font-mono ${
                msg.role === 'user' 
                  ? 'bg-orange-900 text-white border-l-4 border-orange-500' 
                  : 'bg-zinc-900 text-gray-300 border border-zinc-800 border-r-4 border-r-gray-600'
              }`}>
                {msg.content}
              </div>
            )}

            {/* Workout Quest Card */}
            {msg.toolCall && msg.toolCall.name === 'suggest_quest' && (
               <div className={`max-w-[85%] w-full md:w-96 p-0 rounded-sm border overflow-hidden mt-1 shadow-lg transition-all font-mono ${
                 msg.toolCall.status === 'pending' ? 'border-orange-500/50 bg-zinc-900' : 
                 msg.toolCall.status === 'accepted' ? 'border-green-500/50 bg-green-900/10' : 
                 'border-red-900/50 bg-red-900/10 opacity-60'
              }`}>
                <div className={`px-4 py-2 text-xs font-bold uppercase tracking-widest flex items-center gap-2 ${
                  msg.toolCall.status === 'pending' ? 'bg-orange-500/10 text-orange-500' :
                  msg.toolCall.status === 'accepted' ? 'bg-green-500/10 text-green-500' :
                  'bg-red-500/10 text-red-500'
                }`}>
                  <Dumbbell size={14} />
                  Physical Protocol
                </div>
                
                <div className="p-5">
                  <h4 className="font-bold text-white text-lg mb-2 uppercase">{msg.toolCall.args.title}</h4>
                  <div className="flex gap-2 mb-3">
                    <span className="text-[10px] px-2 py-1 bg-zinc-800 text-zinc-400 border border-zinc-700 uppercase">{msg.toolCall.args.type}</span>
                    <span className="text-[10px] px-2 py-1 bg-zinc-800 text-zinc-400 border border-zinc-700 uppercase">{msg.toolCall.args.difficulty}</span>
                    <span className="text-[10px] px-2 py-1 bg-orange-500/10 text-orange-500 border border-orange-500/20 font-bold">+{msg.toolCall.args.xpReward} XP</span>
                  </div>
                  <p className="text-sm text-gray-400 leading-relaxed">{msg.toolCall.args.description}</p>
                </div>

                {msg.toolCall.status === 'pending' && (
                  <div className="flex border-t border-zinc-800">
                    <button 
                      onClick={() => handleToolAction(idx, 'accept')}
                      className="flex-1 p-3 text-xs font-bold text-green-500 hover:bg-green-900/10 transition-colors flex items-center justify-center gap-2 uppercase"
                    >
                      <Check size={14} /> Accept Protocol
                    </button>
                    <div className="w-[1px] bg-zinc-800"></div>
                    <button 
                      onClick={() => handleToolAction(idx, 'reject')}
                      className="flex-1 p-3 text-xs font-bold text-red-500 hover:bg-red-900/10 transition-colors flex items-center justify-center gap-2 uppercase"
                    >
                      <X size={14} /> Decline
                    </button>
                  </div>
                )}

                {msg.toolCall.status === 'accepted' && (
                   <div className="px-4 py-2 bg-green-900/20 text-green-500 text-xs text-center border-t border-green-900/30 uppercase font-bold">
                     Protocol Loaded
                   </div>
                )}
              </div>
            )}

          </div>
        ))}
        
        {loading && (
          <div className="flex justify-start">
            <div className="bg-zinc-900 p-4 border border-zinc-800 border-r-4 border-r-orange-900/50">
              <div className="flex gap-1 items-center">
                <Activity size={16} className="text-orange-600 animate-pulse" />
                <span className="text-xs text-orange-800 font-mono ml-2 animate-pulse">ANALYZING BIOMETRICS...</span>
              </div>
            </div>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 bg-zinc-900 border-t border-orange-900/30">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Report stats or request drill..."
            className="flex-1 bg-black text-white border border-zinc-700 rounded-none px-4 py-3 focus:outline-none focus:border-orange-600 font-mono text-sm placeholder-zinc-600"
          />
          <button 
            onClick={handleSend}
            disabled={loading || !input.trim()}
            className="bg-orange-700 hover:bg-orange-600 text-white px-6 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-mono font-bold tracking-wider"
          >
            SEND
          </button>
        </div>
      </div>
    </div>
  );
};

export default BioArchitect;
