
import React from 'react';
import { GameState, Power, ActiveBuff } from '../types';
import { ACHIEVEMENTS, POWERS } from '../constants';
import { Zap, Clock, Flame, Lock, Check, Crown, Shield, Brain, Coins, Sun } from 'lucide-react';

interface Props {
  gameState: GameState;
  onActivatePower: (power: Power) => void;
}

const FeatsAndPowers: React.FC<Props> = ({ gameState, onActivatePower }) => {
  const unlockedAchievements = gameState.user.achievements || [];
  const currentCredits = gameState.user.credits;

  const isBuffActive = (powerId: string) => {
     const now = Date.now();
     return gameState.user.activeBuffs?.some(b => b.powerId === powerId && b.endTime > now);
  };

  const getBuffTimeLeft = (powerId: string) => {
     const buff = gameState.user.activeBuffs?.find(b => b.powerId === powerId && b.endTime > Date.now());
     if (!buff) return 0;
     return Math.ceil((buff.endTime - Date.now()) / 60000);
  };

  const getIcon = (name: string) => {
     switch(name) {
        case 'Sun': return <Sun size={20} />;
        case 'Shield': return <Shield size={20} />;
        case 'Crown': return <Crown size={20} />;
        case 'Coins': return <Coins size={20} />;
        case 'Brain': return <Brain size={20} />;
        case 'Zap': return <Zap size={20} />;
        case 'Flame': return <Flame size={20} />;
        case 'Clock': return <Clock size={20} />;
        default: return <Zap size={20} />;
     }
  };

  return (
    <div className="space-y-10 animate-fade-in pb-24">
       
       {/* POWERS SECTION */}
       <section>
          <h2 className="text-2xl font-bold text-white font-mono mb-6 flex items-center gap-2">
             <Zap className="text-gold" /> ACTIVE POWERS
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
             {POWERS.map(power => {
                const active = isBuffActive(power.id);
                const timeLeft = getBuffTimeLeft(power.id);
                const canAfford = currentCredits >= power.cost;

                return (
                   <div key={power.id} className={`border rounded-xl p-5 relative overflow-hidden transition-all ${active ? 'bg-gray-900 border-gold shadow-[0_0_20px_rgba(250,204,21,0.1)]' : 'bg-gray-900/50 border-gray-700'}`}>
                      {active && (
                         <div className="absolute top-0 right-0 bg-gold text-black text-[10px] font-bold px-2 py-1 rounded-bl-lg font-mono animate-pulse">
                            ACTIVE: {timeLeft}m
                         </div>
                      )}
                      <div className={`flex items-center gap-3 mb-3 ${power.color.split(' ')[0]}`}>
                         {getIcon(power.icon)}
                         <h3 className="font-bold font-mono">{power.name}</h3>
                      </div>
                      <p className="text-xs text-gray-400 mb-4 h-8">{power.description}</p>
                      
                      <button
                        onClick={() => onActivatePower(power)}
                        disabled={active || !canAfford}
                        className={`w-full py-2 rounded font-mono text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                           active 
                             ? 'bg-gray-800 text-gray-500 cursor-default'
                             : canAfford 
                               ? 'bg-white text-black hover:bg-gold' 
                               : 'bg-gray-800 text-gray-600 cursor-not-allowed'
                        }`}
                      >
                         {active ? 'ENGAGED' : `ACTIVATE (${power.cost} CR)`}
                      </button>
                   </div>
                )
             })}
          </div>
       </section>

       {/* ACHIEVEMENTS SECTION */}
       <section>
          <div className="flex items-center justify-between mb-6">
             <h2 className="text-2xl font-bold text-white font-mono flex items-center gap-2">
                <Crown className="text-purple-400" /> FEATS & TITLES
             </h2>
             <div className="text-xs text-gray-500 font-mono">
                {unlockedAchievements.length} / {ACHIEVEMENTS.length} UNLOCKED
             </div>
          </div>
          
          <div className="grid grid-cols-1 gap-3">
             {ACHIEVEMENTS.map(ach => {
                const unlocked = unlockedAchievements.includes(ach.id);
                
                return (
                   <div key={ach.id} className={`flex items-center gap-4 p-4 rounded-xl border transition-all ${
                      unlocked 
                         ? 'bg-purple-900/10 border-purple-500/30 shadow-lg' 
                         : 'bg-gray-900/30 border-gray-800 opacity-60 grayscale'
                   }`}>
                      <div className={`p-3 rounded-full ${unlocked ? 'bg-purple-500/20 text-purple-400' : 'bg-gray-800 text-gray-600'}`}>
                         {unlocked ? getIcon(ach.icon) : <Lock size={20} />}
                      </div>
                      <div>
                         <h3 className={`font-bold font-mono ${unlocked ? 'text-white' : 'text-gray-500'}`}>{ach.title}</h3>
                         <p className="text-xs text-gray-400">{ach.description}</p>
                      </div>
                      {unlocked && (
                         <div className="ml-auto">
                            <Check size={20} className="text-purple-500" />
                         </div>
                      )}
                   </div>
                )
             })}
          </div>
       </section>

    </div>
  );
};

export default FeatsAndPowers;
