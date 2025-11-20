import React, { useState } from 'react';
import { UserStats, StatType, SubSkill, Quest, Goal } from '../types';
import { calculateSkillXpForNextLevel } from '../services/gameMechanics';
import { ArrowLeft, Shield, Zap, Brain, MessageCircle, Heart, GitCommit, Trash2, Plus, X, Target, Check, Flag, Trophy, Sparkles } from 'lucide-react';

interface Props {
  stat: string; // Changed to string to support custom stats
  user: UserStats;
  quests: Quest[];
  goals: Goal[];
  onBack: () => void;
  onAddSkill: (stat: string, name: string) => void;
  onDeleteSkill: (id: string) => void;
  onRequestQuest: (stat: string) => void;
  onAddGoal: (goal: Goal) => void;
}

const StatDetail: React.FC<Props> = ({ stat, user, quests, goals, onBack, onAddSkill, onDeleteSkill, onRequestQuest, onAddGoal }) => {
  const [newSkillName, setNewSkillName] = useState('');
  const [isAddingSkill, setIsAddingSkill] = useState(false);
  
  // Goal State
  const [isAddingGoal, setIsAddingGoal] = useState(false);
  const [goalTargetId, setGoalTargetId] = useState<string>(stat);
  
  // Determine if it's a core stat or custom stat
  const isCoreStat = Object.values(StatType).includes(stat as StatType);
  const customStat = !isCoreStat ? user.customAttributes.find(c => c.name === stat) : null;
  
  const value = isCoreStat ? user.attributes[stat as StatType] : (customStat?.value || 0);
  const [goalTargetLevel, setGoalTargetLevel] = useState<number>(value + 5);
  
  const skills = user.subSkills.filter(s => s.parentStat === stat);
  
  // Filter goals relevant to this page
  const relevantGoals = goals.filter(g => {
    if (g.targetType === 'STAT' && g.targetId === stat) return true;
    if (g.targetType === 'SKILL' && skills.some(s => s.id === g.targetId)) return true;
    return false;
  });

  const getIcon = () => {
    if (!isCoreStat) return <Sparkles size={48} />;
    switch (stat) {
      case StatType.STR: return <Shield size={48} />;
      case StatType.DEX: return <Zap size={48} />;
      case StatType.INT: return <Brain size={48} />;
      case StatType.CHA: return <MessageCircle size={48} />;
      case StatType.CON: return <Heart size={48} />;
      default: return <Sparkles size={48} />;
    }
  };

  const getColor = () => {
    if (customStat) return `${customStat.color} border-current bg-white/5`;
    switch (stat) {
      case StatType.STR: return 'text-str border-str bg-str/10';
      case StatType.DEX: return 'text-dex border-dex bg-dex/10';
      case StatType.INT: return 'text-int border-int bg-int/10';
      case StatType.CHA: return 'text-cha border-cha bg-cha/10';
      case StatType.CON: return 'text-white border-white bg-gray-700/30';
      default: return 'text-gray-400 border-gray-400 bg-gray-800';
    }
  };

  const getBgColor = () => {
    if (customStat) return customStat.bgColor;
    switch (stat) {
      case StatType.STR: return 'bg-str';
      case StatType.DEX: return 'bg-dex';
      case StatType.INT: return 'bg-int';
      case StatType.CHA: return 'bg-cha';
      case StatType.CON: return 'bg-gray-300';
      default: return 'bg-gray-500';
    }
  };
  
  const getTextColorOnly = () => {
    if (customStat) return customStat.color;
    switch (stat) {
        case StatType.STR: return 'text-str';
        case StatType.DEX: return 'text-dex';
        case StatType.INT: return 'text-int';
        case StatType.CHA: return 'text-cha';
        case StatType.CON: return 'text-white';
        default: return 'text-gray-400';
      }
  };

  const handleAddSkillName = () => {
    if (newSkillName.trim()) {
      onAddSkill(stat, newSkillName.trim());
      setNewSkillName('');
      setIsAddingSkill(false);
    }
  };

  const handleCreateGoal = () => {
    if (goalTargetLevel <= 0) return;

    const isStat = goalTargetId === stat;
    let targetName = stat as string;

    if (!isStat) {
      const s = skills.find(sk => sk.id === goalTargetId);
      if (s) targetName = s.name;
    }

    const newGoal: Goal = {
      id: `goal-${Date.now()}`,
      targetType: isStat ? 'STAT' : 'SKILL',
      targetId: goalTargetId,
      targetName: targetName,
      targetLevel: goalTargetLevel,
      completed: false
    };

    onAddGoal(newGoal);
    setIsAddingGoal(false);
  };

  // Helper to get current level for goal progress
  const getCurrentLevel = (goal: Goal) => {
    if (goal.targetType === 'STAT') return value;
    const skill = skills.find(s => s.id === goal.targetId);
    return skill ? skill.level : 0;
  };

  return (
    <div className="bg-void-light rounded-xl border border-gray-700 shadow-2xl min-h-[600px] flex flex-col animate-fade-in">
      {/* Header */}
      <div className={`p-8 border-b border-gray-700 ${getColor()} bg-opacity-5 flex items-center gap-6 relative overflow-hidden`}>
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-gradient-to-l from-black/20 to-transparent pointer-events-none" />
        
        <button onClick={onBack} className="absolute top-4 left-4 p-2 rounded-full hover:bg-black/20 transition-colors">
          <ArrowLeft size={20} />
        </button>

        <div className="p-4 rounded-2xl bg-void border border-gray-600 shadow-xl z-10">
          {getIcon()}
        </div>
        
        <div className="z-10">
          <h1 className="text-4xl font-bold font-mono uppercase tracking-widest text-white shadow-sm">{stat}</h1>
          <div className="flex items-center gap-2 mt-1 text-lg font-mono opacity-90 text-gray-200">
            <span>Level {value}</span>
            <span className="mx-2">•</span>
            <span>{skills.length} Specializations</span>
          </div>
        </div>

        <button 
          onClick={() => onRequestQuest(stat)}
          className="ml-auto z-10 flex items-center gap-2 bg-void border border-current px-4 py-2 rounded-lg hover:bg-black/20 transition-all font-mono text-sm font-bold shadow-lg"
        >
          <Target size={16} />
          Train this Stat
        </button>
      </div>

      <div className="flex-1 flex flex-col md:flex-row">
        {/* Skill Tree Section */}
        <div className="flex-1 p-8 border-b md:border-b-0 md:border-r border-gray-700 bg-[#0a0f1c]">
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-xl font-bold text-gray-200 font-mono flex items-center gap-2">
              <GitCommit className="text-gray-400" />
              Skill Tree
            </h3>
            {!isAddingSkill && (
              <button onClick={() => setIsAddingSkill(true)} className="text-xs flex items-center gap-1 text-gray-400 hover:text-white transition-colors border border-gray-700 px-2 py-1 rounded hover:border-gray-500">
                <Plus size={14} /> Add Node
              </button>
            )}
          </div>

          <div className="space-y-8 pl-4 border-l-2 border-gray-700 relative">
            {skills.map(skill => (
               <SkillNode 
                  key={skill.id} 
                  skill={skill} 
                  color={getBgColor()} 
                  textColor={getTextColorOnly()}
                  onDelete={onDeleteSkill} 
                />
            ))}

            {/* Add New Skill Node */}
            <div className="relative flex items-center group">
              <div className="absolute -left-[21px] top-1/2 w-4 h-0.5 bg-gray-600"></div>
              <div className="absolute -left-[25px] top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-gray-500"></div>
              
              {isAddingSkill ? (
                <div className="flex items-center gap-2 bg-gray-900 border border-gold rounded p-3 w-full max-w-md animate-fade-in shadow-lg">
                    <input 
                    autoFocus
                    type="text" 
                    value={newSkillName}
                    onChange={(e) => setNewSkillName(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleAddSkillName()}
                    placeholder="New Skill Name..."
                    className="flex-1 bg-transparent border-none text-sm text-white focus:outline-none font-mono placeholder-gray-500"
                  />
                  <button onClick={handleAddSkillName} className="text-gold hover:text-white"><Plus size={16}/></button>
                  <button onClick={() => setIsAddingSkill(false)} className="text-gray-500 hover:text-red-400"><X size={16}/></button>
                </div>
              ) : (
                 skills.length === 0 && <div className="text-gray-500 italic text-sm">No skills learned yet. Start your journey.</div>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar: Goals & Quests */}
        <div className="w-full md:w-1/3 p-6 bg-void-light flex flex-col gap-8 border-l border-gray-800">
          
          {/* GOALS SECTION */}
          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-sm font-bold text-gray-400 font-mono uppercase tracking-widest">Active Goals</h3>
              {!isAddingGoal && (
                <button onClick={() => setIsAddingGoal(true)} className="text-xs text-gold hover:underline flex items-center gap-1">
                  <Plus size={12} /> Set Goal
                </button>
              )}
            </div>

            {isAddingGoal && (
              <div className="bg-gray-800 p-3 rounded-lg border border-gray-600 mb-4 animate-fade-in shadow-lg">
                <div className="text-xs font-bold text-gray-300 mb-2 uppercase">Set Target</div>
                <select 
                  value={goalTargetId}
                  onChange={(e) => setGoalTargetId(e.target.value)}
                  className="w-full bg-gray-900 border border-gray-600 rounded px-2 py-1 text-sm text-white mb-2 focus:outline-none focus:border-gold"
                >
                  <option value={stat}>{stat} (Base Stat)</option>
                  {skills.map(s => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
                
                <div className="text-xs font-bold text-gray-300 mb-2 uppercase">Target Level</div>
                <input 
                  type="number" 
                  min="1"
                  value={goalTargetLevel}
                  onChange={(e) => setGoalTargetLevel(parseInt(e.target.value))}
                  className="w-full bg-gray-900 border border-gray-600 rounded px-2 py-1 text-sm text-white mb-3 focus:outline-none focus:border-gold"
                />

                <div className="flex gap-2">
                   <button onClick={handleCreateGoal} className="flex-1 bg-gold text-black text-xs font-bold py-1.5 rounded hover:bg-yellow-400">Save</button>
                   <button onClick={() => setIsAddingGoal(false)} className="flex-1 bg-gray-700 text-white text-xs font-bold py-1.5 rounded hover:bg-gray-600">Cancel</button>
                </div>
              </div>
            )}

            <div className="space-y-3">
              {relevantGoals.length > 0 ? relevantGoals.map(goal => {
                const current = getCurrentLevel(goal);
                const percent = Math.min(100, (current / goal.targetLevel) * 100);
                const isDone = goal.completed;

                return (
                  <div key={goal.id} className={`p-3 rounded border ${isDone ? 'bg-green-900/10 border-green-500/30' : 'bg-gray-800 border-gray-600'}`}>
                    <div className="flex justify-between items-center mb-1">
                       <div className="flex items-center gap-2">
                          {isDone ? <Trophy size={12} className="text-gold" /> : <Flag size={12} className="text-gray-400" />}
                          <span className={`text-sm font-bold ${isDone ? 'text-green-400' : 'text-gray-200'}`}>
                             Reach Level {goal.targetLevel} {goal.targetName}
                          </span>
                       </div>
                       {isDone && <Check size={14} className="text-green-400" />}
                    </div>
                    
                    <div className="flex items-center gap-2">
                       <div className="flex-1 h-1.5 bg-gray-900 rounded-full overflow-hidden border border-gray-700">
                          <div className={`h-full ${isDone ? 'bg-green-500' : 'bg-gold'} transition-all duration-500`} style={{ width: `${percent}%` }}></div>
                       </div>
                       <span className="text-[10px] font-mono text-gray-400">{current}/{goal.targetLevel}</span>
                    </div>
                  </div>
                )
              }) : (
                <div className="text-xs text-gray-500 italic text-center py-2">No goals set. Aim higher.</div>
              )}
            </div>
          </div>
          
          {/* QUESTS SECTION */}
          <div>
            <h3 className="text-sm font-bold text-gray-400 font-mono uppercase tracking-widest mb-4">Active Quests</h3>
            <div className="space-y-4">
              {quests.filter(q => q.type === stat && !q.completed).length > 0 ? (
                quests.filter(q => q.type === stat && !q.completed).map(quest => (
                  <div key={quest.id} className="bg-void border border-gray-700 p-4 rounded-lg relative overflow-hidden group shadow-md">
                     <div className={`absolute left-0 top-0 bottom-0 w-1 ${getBgColor()}`}></div>
                     <h4 className="font-bold text-gray-200">{quest.title}</h4>
                     <p className="text-xs text-gray-400 mt-1 line-clamp-2">{quest.description}</p>
                     <div className="mt-2 flex justify-between items-center">
                        <span className={`text-xs font-mono ${getTextColorOnly()} font-bold`}>{quest.difficulty}</span>
                        <span className="text-xs text-gold font-bold">+{quest.xpReward} XP</span>
                     </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-10 border border-dashed border-gray-700 rounded-lg">
                  <p className="text-gray-500 text-sm">No active quests.</p>
                  <button onClick={() => onRequestQuest(stat)} className="mt-2 text-gold text-xs hover:underline font-bold">Request Training</button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

interface SkillNodeProps {
  skill: SubSkill;
  color: string;
  textColor: string;
  onDelete: (id: string) => void;
}

const SkillNode: React.FC<SkillNodeProps> = ({ skill, color, textColor, onDelete }) => {
  const xpNeeded = calculateSkillXpForNextLevel(skill.level);
  const progress = (skill.xp / xpNeeded) * 100;

  return (
    <div className="relative flex items-center group">
      {/* Connector */}
      <div className="absolute -left-[20px] top-1/2 w-5 h-0.5 bg-gray-600 group-hover:bg-gray-400 transition-colors"></div>
      <div className={`absolute -left-[25px] top-1/2 -translate-y-1/2 w-3 h-3 rounded-full border-2 border-void ${color} shadow-[0_0_10px_currentColor] z-10`}></div>

      <div className="flex-1 bg-gray-900 border border-gray-700 hover:border-gray-500 rounded-lg p-4 transition-all duration-200 min-w-[240px] hover:translate-x-1 relative overflow-hidden shadow-lg">
         {/* Glow effect */}
        <div className={`absolute top-0 right-0 w-32 h-32 ${color} opacity-0 group-hover:opacity-10 blur-3xl transition-opacity duration-500 rounded-full -mr-16 -mt-16 pointer-events-none`}></div>
        
        <div className="flex justify-between items-start relative z-10">
          <div>
            <h4 className="font-bold text-lg text-gray-100 font-mono leading-none mb-2">{skill.name}</h4>
            <span className={`text-xs font-bold font-mono uppercase tracking-wider ${textColor} bg-white/5 px-2 py-0.5 rounded`}>Rank {skill.level}</span>
          </div>
          <button 
            onClick={() => onDelete(skill.id)} 
            className="text-gray-600 hover:text-red-500 transition-colors"
          >
            <Trash2 size={16} />
          </button>
        </div>

        <div className="mt-4">
          <div className="flex justify-between text-[10px] font-mono text-gray-400 mb-1">
            <span>PROGRESS</span>
            <span>{skill.xp} / {xpNeeded} XP</span>
          </div>
          <div className="h-1.5 bg-black rounded-full overflow-hidden border border-gray-700">
             <div className={`h-full ${color} shadow-[0_0_5px_currentColor] transition-all duration-500`} style={{ width: `${progress}%` }}></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatDetail;