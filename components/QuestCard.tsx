
import React from 'react';
import { Quest, StatType } from '../types';
import { Check, RefreshCcw, Tag, Circle } from 'lucide-react';
import { audio } from '../services/audioService';

interface Props {
  quest: Quest;
  onComplete: (id: string) => void;
}

// Wrapped in React.memo for performance in long lists
const QuestCard: React.FC<Props> = React.memo(({ quest, onComplete }) => {
  
  // Helper to get colors based on Stat Type
  const getStatColor = (type: string) => {
    switch (type) {
      case StatType.STR: return { bg: 'bg-red-950/40', text: 'text-red-400', border: 'border-red-900/50' };
      case StatType.DEX: return { bg: 'bg-green-950/40', text: 'text-green-400', border: 'border-green-900/50' };
      case StatType.INT: return { bg: 'bg-blue-950/40', text: 'text-blue-400', border: 'border-blue-900/50' };
      case StatType.CHA: return { bg: 'bg-purple-950/40', text: 'text-purple-400', border: 'border-purple-900/50' };
      case StatType.CON: return { bg: 'bg-orange-950/40', text: 'text-orange-400', border: 'border-orange-900/50' };
      default: return { bg: 'bg-gray-800', text: 'text-gray-400', border: 'border-gray-700' };
    }
  };

  const getDifficultyColor = (diff: string) => {
    switch(diff) {
      case 'Easy': return 'text-green-500';
      case 'Medium': return 'text-amber-500';
      case 'Hard': return 'text-red-500';
      case 'Legendary': return 'text-purple-500';
      default: return 'text-gray-500';
    }
  };

  const colors = getStatColor(quest.type);

  const handleComplete = () => {
    if (!quest.completed) {
      audio.play('complete');
      onComplete(quest.id);
    }
  };

  return (
    <div className={`relative group bg-[#0e0e11] rounded-2xl border border-gray-800 p-5 transition-all duration-300 active:scale-[0.98] ${quest.completed ? 'opacity-50 grayscale' : 'hover:border-gray-700 shadow-lg'}`}>
      
      {/* Left Border Indicator */}
      <div className={`absolute left-0 top-4 bottom-4 w-1.5 rounded-r-full ${colors.bg.replace('/40','')} opacity-80`}></div>

      <div className="pl-4 flex flex-col gap-3">
        
        {/* Top Row: Badges - Optimized for readability */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Stat Badge */}
          <span className={`text-[11px] font-black uppercase px-2.5 py-1 rounded-md border ${colors.bg} ${colors.text} ${colors.border} tracking-wider font-mono shadow-sm`}>
            {quest.type.substring(0, 3)}
          </span>

          {/* Difficulty */}
          <span className={`text-[11px] font-bold font-mono ${getDifficultyColor(quest.difficulty)} bg-gray-900/50 px-2 py-1 rounded`}>
            {quest.difficulty}
          </span>

          {/* Repeatable */}
          {quest.repeatable && (
            <RefreshCcw size={12} className="text-gray-500 ml-1" />
          )}

          {/* Tags */}
          {quest.tags?.slice(0, 2).map((tag, idx) => (
            <span key={idx} className="flex items-center gap-1 text-[10px] px-2 py-1 rounded bg-gray-900 border border-gray-800 text-gray-500 font-mono uppercase tracking-tight">
              <Tag size={10} /> {tag}
            </span>
          ))}

          {/* XP Reward - Pushed Right */}
          <div className="ml-auto flex items-center gap-1 text-sm font-black text-gold drop-shadow-sm">
             +{quest.xpReward} <span className="text-[9px] font-mono text-gray-500 font-normal">XP</span>
          </div>
        </div>

        {/* Middle Row: Content & Action */}
        <div className="flex justify-between items-start gap-4">
          <div className="flex-1 min-w-0"> {/* min-w-0 ensures truncation works */}
            <h3 className={`text-lg md:text-xl font-bold text-gray-100 leading-tight mb-2 tracking-tight ${quest.completed ? 'line-through decoration-gray-600' : ''}`}>
              {quest.title}
            </h3>
            <p className="text-xs md:text-sm text-gray-400 font-medium leading-relaxed line-clamp-2">
              {quest.description}
            </p>
          </div>

          {/* Completion Trigger - Large Touch Target (48px minimum) */}
          <button 
            onClick={handleComplete}
            disabled={quest.completed}
            className="shrink-0 relative group/btn -mr-1"
            aria-label="Complete Quest"
            style={{ minWidth: '48px', minHeight: '48px' }}
          >
             {quest.completed ? (
                <div className="w-12 h-12 rounded-full bg-green-500 flex items-center justify-center text-black shadow-[0_0_15px_rgba(34,197,94,0.4)] animate-pulse">
                   <Check size={24} strokeWidth={4} />
                </div>
             ) : (
                <div className="w-12 h-12 rounded-full border-2 border-gray-700 bg-[#131316] flex items-center justify-center transition-all duration-300 group-hover/btn:border-gray-500 group-active/btn:scale-90 shadow-inner">
                   <div className="w-9 h-9 rounded-full bg-gray-800 opacity-0 group-hover/btn:opacity-100 transition-opacity duration-300"></div>
                   <Circle size={48} className="absolute text-transparent" /> {/* Invisible Hitbox extender */}
                </div>
             )}
          </button>
        </div>
      </div>
    </div>
  );
});

export default QuestCard;
