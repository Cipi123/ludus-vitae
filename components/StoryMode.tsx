
import React, { useState } from 'react';
import { GameState, StoryFragment } from '../types';
import { STORY_FRAGMENTS } from '../constants';
import { Terminal, Lock, Unlock, FileText, Database } from 'lucide-react';
import { audio } from '../services/audioService';

interface Props {
  gameState: GameState;
}

const StoryMode: React.FC<Props> = ({ gameState }) => {
  const unlockedIds = gameState.user.unlockedFragments || [];
  const [selectedId, setSelectedId] = useState<string | null>(unlockedIds.length > 0 ? unlockedIds[unlockedIds.length - 1] : null);

  const selectedFragment = STORY_FRAGMENTS.find(f => f.id === selectedId);

  const handleSelect = (id: string) => {
     audio.play('click');
     setSelectedId(id);
  };

  return (
    <div className="h-full flex flex-col animate-fade-in">
       <div className="flex items-center justify-between mb-6">
          <div>
             <h2 className="text-3xl font-bold text-cyan-400 font-mono uppercase tracking-widest flex items-center gap-3">
               <Terminal size={28} /> System Core
             </h2>
             <p className="text-sm text-gray-400 mt-1">Decrypted memory fragments from the simulation.</p>
          </div>
          <div className="text-xs font-mono text-cyan-600 border border-cyan-900 px-3 py-1 rounded bg-cyan-950/30">
             ACCESS LEVEL: {gameState.user.level}
          </div>
       </div>

       <div className="flex-1 flex flex-col md:flex-row gap-6 overflow-hidden min-h-[500px] border border-cyan-900/50 rounded-xl bg-[#050a0f] relative">
          {/* CRT Scanline Effect */}
          <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] z-10 bg-[length:100%_2px,3px_100%] pointer-events-none"></div>

          {/* Sidebar List */}
          <div className="w-full md:w-1/3 border-r border-cyan-900/30 bg-black/50 flex flex-col relative z-20">
             <div className="p-4 border-b border-cyan-900/30 bg-cyan-950/10">
                <h3 className="text-xs font-bold text-cyan-500 uppercase tracking-widest flex items-center gap-2">
                   <Database size={14} /> Data Logs
                </h3>
             </div>
             <div className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-1">
                {STORY_FRAGMENTS.map((frag) => {
                   const isUnlocked = unlockedIds.includes(frag.id);
                   const isActive = selectedId === frag.id;
                   
                   return (
                      <button
                        key={frag.id}
                        onClick={() => isUnlocked && handleSelect(frag.id)}
                        disabled={!isUnlocked}
                        className={`w-full text-left p-3 rounded border transition-all flex items-center justify-between group ${
                           isActive 
                             ? 'bg-cyan-900/20 border-cyan-500/50 text-cyan-300' 
                             : isUnlocked 
                               ? 'bg-transparent border-transparent hover:bg-cyan-900/10 text-gray-400 hover:text-cyan-400' 
                               : 'opacity-40 cursor-not-allowed border-transparent text-gray-600'
                        }`}
                      >
                         <div className="flex items-center gap-3">
                            {isUnlocked ? <FileText size={14} /> : <Lock size={14} />}
                            <div className="flex flex-col">
                               <span className="text-xs font-mono font-bold uppercase">{frag.title}</span>
                               <span className="text-[9px] font-mono opacity-60">
                                  {isUnlocked ? `SEQ_ID: ${frag.id.split('_')[1]}` : `REQ. LVL ${frag.unlockLevel}`}
                               </span>
                            </div>
                         </div>
                         {isActive && <div className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-pulse"></div>}
                      </button>
                   )
                })}
             </div>
          </div>

          {/* Content Reader */}
          <div className="flex-1 p-8 relative z-20 overflow-y-auto custom-scrollbar flex flex-col justify-center">
             {selectedFragment ? (
                <div className="max-w-2xl mx-auto animate-fade-in">
                   <div className="mb-6 pb-4 border-b border-cyan-900/50">
                      <div className="text-xs font-mono text-cyan-600 mb-2">
                         // DECRYPTION COMPLETE
                         <br/>
                         // ORIGIN: SYSTEM_ARCHITECT
                      </div>
                      <h1 className="text-3xl font-bold text-cyan-400 font-mono uppercase tracking-tight text-glow">
                         {selectedFragment.title}
                      </h1>
                   </div>
                   <p className="font-mono text-cyan-100 leading-relaxed whitespace-pre-wrap text-sm md:text-base">
                      {selectedFragment.content}
                   </p>
                   <div className="mt-12 text-xs font-mono text-cyan-700 animate-pulse">
                      _ END OF TRANSMISSION
                   </div>
                </div>
             ) : (
                <div className="text-center text-cyan-900/50">
                   <Lock size={64} className="mx-auto mb-4 opacity-20" />
                   <p className="font-mono text-sm">SELECT A DATA FRAGMENT TO DECRYPT</p>
                </div>
             )}
          </div>
       </div>
    </div>
  );
};

export default StoryMode;
