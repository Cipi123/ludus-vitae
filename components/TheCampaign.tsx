
import React, { useState } from 'react';
import { Boss, Quest, StatType } from '../types';
import { Sword, Shield, Skull, Target, Plus, CheckCircle2, Circle, X } from 'lucide-react';

interface Props {
  boss: Boss | null;
  quests: Quest[];
  onCompleteQuest: (id: string) => void;
  onAddObjective: (quest: Quest) => void;
}

const TheCampaign: React.FC<Props> = ({ boss, quests, onCompleteQuest, onAddObjective }) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [newObjTitle, setNewObjTitle] = useState('');
  const [newObjType, setNewObjType] = useState<string>(StatType.STR);

  if (!boss) return (
    <div className="h-full flex flex-col items-center justify-center p-10 text-center border border-gray-800 rounded-xl bg-black/50">
       <Skull size={64} className="text-gray-700 mb-4" />
       <h2 className="text-2xl font-bold text-gray-400 mb-2">No Active Campaign</h2>
       <p className="text-gray-500 max-w-md">Consult the Oracle to "Plan a Campaign" for a major life goal (e.g., "Get a Degree", "Start a Business").</p>
    </div>
  );

  const hpPercent = (boss.hp / boss.maxHp) * 100;
  
  // Filter quests that are specifically linked to this boss
  const campaignQuests = quests.filter(q => q.linkedBossId === boss.id);
  const completedCount = campaignQuests.filter(q => q.completed).length;
  const totalCount = campaignQuests.length;

  const handleAdd = () => {
      if (!newObjTitle.trim()) return;
      
      const newQuest: Quest = {
          id: `q-boss-obj-${Date.now()}`,
          title: newObjTitle,
          description: `Strategic objective for: ${boss.name}`,
          type: newObjType,
          difficulty: 'Medium',
          xpReward: 50,
          creditReward: 25,
          completed: false,
          status: 'TODO',
          repeatable: false,
          linkedBossId: boss.id,
          isBossDamage: true
      };
      
      onAddObjective(newQuest);
      setNewObjTitle('');
      setShowAddForm(false);
  };

  return (
    <div className="animate-fade-in space-y-8 pb-20">
       {/* Boss Arena */}
       <div className="relative bg-black rounded-2xl overflow-hidden border border-red-900/50 shadow-[0_0_50px_rgba(153,27,27,0.2)] min-h-[400px] flex flex-col md:flex-row">
          {/* Boss Visual */}
          <div className="w-full md:w-1/2 h-64 md:h-auto relative overflow-hidden group">
             <div className="absolute inset-0 bg-gradient-to-r from-red-900/20 to-transparent z-10"></div>
             <img 
               src={boss.imageUrl} 
               className="w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all duration-700 filter grayscale hover:grayscale-0" 
               alt="Boss" 
             />
             <div className="absolute bottom-0 left-0 w-full h-24 bg-gradient-to-t from-black to-transparent z-20"></div>
          </div>

          {/* Boss Stats */}
          <div className="w-full md:w-1/2 p-8 flex flex-col relative z-20 bg-gradient-to-l from-black via-black/90 to-transparent">
             <div className="flex items-center gap-3 mb-2 text-red-500">
                <Skull size={24} />
                <span className="text-xs font-bold font-mono uppercase tracking-[0.3em]">Major Life Obstacle</span>
             </div>
             <h2 className="text-4xl md:text-5xl font-black text-white font-serif mb-2 tracking-tighter leading-none">{boss.name.toUpperCase()}</h2>
             <p className="text-red-400 font-mono text-sm mb-6 uppercase tracking-widest font-bold">{boss.title}</p>
             <p className="text-gray-400 italic text-sm border-l-2 border-red-900 pl-4 mb-8 leading-relaxed">{boss.description}</p>
             
             <div className="mt-auto">
                <div className="flex justify-between text-xs font-bold font-mono text-gray-500 mb-2">
                   <span>OBSTACLE HEALTH</span>
                   <span className="text-white">{boss.hp} / {boss.maxHp}</span>
                </div>
                <div className="h-6 bg-gray-900 rounded-md overflow-hidden border border-gray-800 shadow-inner relative">
                   <div 
                     className="h-full bg-gradient-to-r from-red-900 via-red-600 to-red-500 transition-all duration-1000 ease-out relative" 
                     style={{ width: `${hpPercent}%` }}
                   >
                      <div className="absolute right-0 top-0 bottom-0 w-[1px] bg-white/50 animate-pulse"></div>
                      {/* Stripes */}
                      <div className="absolute inset-0 opacity-20 bg-[repeating-linear-gradient(45deg,transparent,transparent_10px,#000_10px,#000_20px)]"></div>
                   </div>
                </div>
             </div>
          </div>
       </div>

       {/* Campaign Objectives (Linked Quests) */}
       <div>
          <div className="flex items-center justify-between mb-6">
             <h3 className="text-xl font-bold text-white font-mono flex items-center gap-2">
                <Sword size={20} className="text-red-500" /> 
                Campaign Objectives
             </h3>
             <div className="flex items-center gap-4">
                <div className="text-xs text-gray-500 font-mono">
                    {completedCount} / {totalCount} CLEARED
                </div>
                {!showAddForm && (
                    <button 
                        onClick={() => setShowAddForm(true)}
                        className="flex items-center gap-2 px-3 py-1.5 bg-red-900/20 border border-red-900/50 text-red-400 rounded text-xs font-bold hover:bg-red-900/40 transition-all"
                    >
                        <Plus size={14} /> ADD OBJECTIVE
                    </button>
                )}
             </div>
          </div>
          
          {showAddForm && (
             <div className="mb-6 p-4 bg-gray-900 border border-red-900/50 rounded-lg animate-slide-in">
                <div className="flex justify-between items-center mb-4">
                   <h4 className="text-sm font-bold text-white uppercase tracking-wider">New Tactical Objective</h4>
                   <button onClick={() => setShowAddForm(false)} className="text-gray-500 hover:text-white"><X size={16}/></button>
                </div>
                <div className="flex gap-2">
                   <input 
                     type="text"
                     value={newObjTitle}
                     onChange={(e) => setNewObjTitle(e.target.value)}
                     placeholder="Objective Name (e.g., Read Chapter 1, Do 50 Pushups)"
                     className="flex-1 bg-black border border-gray-700 rounded px-3 py-2 text-sm text-white focus:border-red-500 focus:outline-none"
                     autoFocus
                   />
                   <select 
                     value={newObjType}
                     onChange={(e) => setNewObjType(e.target.value)}
                     className="bg-black border border-gray-700 rounded px-3 py-2 text-sm text-gray-300 focus:border-red-500 focus:outline-none"
                   >
                      {Object.values(StatType).map(s => <option key={s} value={s}>{s}</option>)}
                   </select>
                   <button 
                     onClick={handleAdd}
                     className="bg-red-700 hover:bg-red-600 text-white px-4 rounded font-bold text-xs uppercase"
                   >
                     Deploy
                   </button>
                </div>
             </div>
          )}
          
          <div className="grid grid-cols-1 gap-3">
             {campaignQuests.length > 0 ? campaignQuests.map(quest => (
                <div 
                  key={quest.id} 
                  className={`border rounded-lg p-4 flex items-center justify-between group transition-all ${
                     quest.completed 
                       ? 'bg-black border-gray-800 opacity-50' 
                       : 'bg-gray-900 border-gray-700 hover:border-red-500/50 hover:bg-gray-800'
                  }`}
                >
                   <div className="flex items-center gap-4">
                      <button 
                        onClick={() => !quest.completed && onCompleteQuest(quest.id)}
                        disabled={quest.completed}
                        className={`p-1 rounded-full transition-colors ${
                           quest.completed ? 'text-red-900 cursor-default' : 'text-gray-600 hover:text-red-500'
                        }`}
                      >
                         {quest.completed ? <CheckCircle2 size={24} /> : <Circle size={24} />}
                      </button>
                      
                      <div>
                         <h4 className={`font-bold ${quest.completed ? 'text-gray-500 line-through' : 'text-white'}`}>{quest.title}</h4>
                         <div className="flex gap-2 mt-1">
                            <span className="text-[10px] bg-gray-800 px-1.5 py-0.5 rounded text-gray-400 uppercase font-mono border border-gray-700">
                               {quest.type.substring(0,3)}
                            </span>
                            <span className="text-[10px] bg-red-900/10 text-red-400 px-1.5 py-0.5 rounded border border-red-900/20 uppercase font-mono font-bold">
                               Damage: {quest.difficulty === 'Legendary' ? '100' : '50'}
                            </span>
                         </div>
                      </div>
                   </div>

                   <div className="text-right hidden md:block">
                      <div className="text-xs text-gray-500 font-mono">{quest.xpReward} XP</div>
                      <div className="text-[10px] text-gray-600 font-mono">{quest.difficulty}</div>
                   </div>
                </div>
             )) : (
               <div className="p-10 border-2 border-dashed border-gray-800 rounded-xl text-center">
                  <p className="text-gray-500 mb-2">No objectives linked to this campaign.</p>
                  <p className="text-xs text-gray-600">Add an objective above or ask the Oracle to "Plan a Campaign".</p>
               </div>
             )}
          </div>
       </div>
    </div>
  );
};

export default TheCampaign;
