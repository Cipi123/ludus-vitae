import React from 'react';
import { UserStats, StatType, CustomAttribute } from '../types';
import { calculateSkillXpForNextLevel } from '../services/gameMechanics';
import { Shield, Zap, Brain, MessageCircle, Heart, Star, Sparkles } from 'lucide-react';

interface Props {
  userStats: UserStats;
}

const SkillsMastery: React.FC<Props> = ({ userStats }) => {
  // Gather all stat keys (Core Enums + Custom Attribute Names)
  const coreStats = Object.values(StatType) as string[];
  const customStats = userStats.customAttributes.map(ca => ca.name);
  const allStats = [...coreStats, ...customStats];

  const getIcon = (stat: string) => {
    switch (stat) {
      case StatType.STR: return <Shield size={20} />;
      case StatType.DEX: return <Zap size={20} />;
      case StatType.INT: return <Brain size={20} />;
      case StatType.CHA: return <MessageCircle size={20} />;
      case StatType.CON: return <Heart size={20} />;
      default: return <Sparkles size={20} />;
    }
  };

  const getColor = (stat: string) => {
    const custom = userStats.customAttributes.find(c => c.name === stat);
    if (custom) return `${custom.color} border-current`;

    switch (stat) {
      case StatType.STR: return 'text-str border-str';
      case StatType.DEX: return 'text-dex border-dex';
      case StatType.INT: return 'text-int border-int';
      case StatType.CHA: return 'text-cha border-cha';
      case StatType.CON: return 'text-gray-300 border-gray-300';
      default: return 'text-gray-400 border-gray-400';
    }
  };
  
  const getBgColor = (stat: string) => {
    const custom = userStats.customAttributes.find(c => c.name === stat);
    if (custom) return custom.bgColor;

    switch (stat) {
      case StatType.STR: return 'bg-str';
      case StatType.DEX: return 'bg-dex';
      case StatType.INT: return 'bg-int';
      case StatType.CHA: return 'bg-cha';
      case StatType.CON: return 'bg-gray-300';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gold font-mono uppercase tracking-widest">Skill Mastery</h2>
          <p className="text-sm text-gray-300 mt-1">Deepen your specializations. Mastery yields greater power.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {allStats.map((stat) => {
          const skills = userStats.subSkills.filter(s => s.parentStat === stat);
          if (skills.length === 0) return null;

          return (
            <div key={stat} className="bg-void-light border border-gray-700 rounded-xl overflow-hidden flex flex-col shadow-lg hover:border-gray-500 transition-colors">
              <div className={`p-4 flex items-center gap-3 border-b border-gray-700 bg-[#0f172a]`}>
                <div className={`p-2 rounded bg-white/10 ${getColor(stat).split(' ')[0]}`}>
                  {getIcon(stat)}
                </div>
                <h3 className={`font-bold font-mono text-lg ${getColor(stat).split(' ')[0]}`}>{stat} Skills</h3>
              </div>
              
              <div className="p-4 space-y-4 flex-1 bg-[#0a0f1c]">
                {skills.map(skill => {
                  const xpNeeded = calculateSkillXpForNextLevel(skill.level);
                  const progress = (skill.xp / xpNeeded) * 100;
                  const barColor = getBgColor(stat);

                  return (
                    <div key={skill.id} className="bg-gray-900 border border-gray-700 p-3 rounded-lg shadow-sm">
                      <div className="flex justify-between items-start mb-2">
                        <div className="font-bold text-gray-100">{skill.name}</div>
                        <div className="flex items-center gap-1 text-xs font-bold text-gold bg-gold/10 px-2 py-1 rounded border border-gold/20">
                          <Star size={10} /> Rank {skill.level}
                        </div>
                      </div>
                      
                      <div className="h-2 bg-black rounded-full overflow-hidden border border-gray-700 mb-1">
                        <div 
                          className={`h-full ${barColor} shadow-[0_0_5px_currentColor] transition-all duration-500`} 
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                      <div className="text-[10px] text-gray-400 text-right font-mono">
                        {skill.xp} / {xpNeeded} XP
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
        
        {userStats.subSkills.length === 0 && (
          <div className="col-span-full text-center py-20 border border-dashed border-gray-700 rounded-xl text-gray-400">
            <p>No skills learned yet. Go to a Stat Page and add a specialization.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SkillsMastery;