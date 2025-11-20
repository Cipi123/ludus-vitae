
import React, { useEffect, useState } from 'react';
import { Crown, Star, Zap, Shield, ArrowUp, Check, Sparkles } from 'lucide-react';

interface Props {
  newLevel: number;
  onClose: () => void;
}

const AscensionModal: React.FC<Props> = ({ newLevel, onClose }) => {
  const [step, setStep] = useState(0);

  useEffect(() => {
    // Animation sequence
    const t1 = setTimeout(() => setStep(1), 100); // Fade in container
    const t2 = setTimeout(() => setStep(2), 600); // Reveal level
    const t3 = setTimeout(() => setStep(3), 1200); // Show stats
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, []);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
      {/* Backdrop with Blur */}
      <div className="absolute inset-0 bg-black/95 backdrop-blur-xl animate-fade-in transition-opacity duration-500"></div>
      
      {/* Main Container */}
      <div className={`relative z-10 w-full max-w-sm md:max-w-md transition-all duration-700 transform ${step >= 1 ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
        
        {/* Radiant Background Glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-gold/10 rounded-full blur-[80px] animate-pulse-slow"></div>

        <div className="bg-[#09090b] border-2 border-gold/50 rounded-3xl p-1 relative overflow-hidden shadow-[0_0_60px_rgba(250,204,21,0.15)]">
          <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-gold to-transparent opacity-50"></div>
          
          <div className="bg-[#0c0c0e] rounded-[20px] p-8 text-center border border-white/5 relative overflow-hidden">
            
            {/* Animated Rays */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[200%] h-full bg-[conic-gradient(from_0deg_at_50%_50%,transparent_0deg,rgba(250,204,21,0.05)_30deg,transparent_60deg)] animate-[spin_8s_linear_infinite] pointer-events-none"></div>

            {/* Icon */}
            <div className={`mx-auto w-20 h-20 bg-gradient-to-br from-gold to-amber-600 rounded-2xl rotate-3 flex items-center justify-center mb-8 shadow-xl shadow-gold/20 transition-all duration-700 ${step >= 2 ? 'scale-100 opacity-100' : 'scale-50 opacity-0'}`}>
               <Crown size={40} className="text-black drop-shadow-md" strokeWidth={2.5} />
            </div>

            <h2 className="text-gold font-mono text-xs uppercase tracking-[0.3em] font-bold mb-2">System Ascension</h2>
            
            <h1 className={`text-7xl font-black text-white mb-8 tracking-tighter font-sans transition-all duration-500 ${step >= 2 ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}>
              <span className="text-3xl align-top opacity-50 mr-1">LVL</span>{newLevel}
            </h1>

            {/* Rewards List */}
            <div className={`space-y-3 mb-8 text-left transition-all duration-700 ${step >= 3 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
              <div className="bg-white/5 p-4 rounded-xl border border-white/10 flex items-center justify-between group hover:bg-white/10 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-red-500/20 rounded-lg text-red-400"><Zap size={16} /></div>
                  <div>
                    <div className="text-xs text-gray-400 font-mono uppercase font-bold">Max Energy</div>
                    <div className="text-sm text-white font-bold">+10 HP</div>
                  </div>
                </div>
                <ArrowUp size={16} className="text-green-500" />
              </div>
              
              <div className="bg-white/5 p-4 rounded-xl border border-white/10 flex items-center justify-between group hover:bg-white/10 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-500/20 rounded-lg text-blue-400"><Shield size={16} /></div>
                  <div>
                    <div className="text-xs text-gray-400 font-mono uppercase font-bold">Status</div>
                    <div className="text-sm text-white font-bold">Attributes Refilled</div>
                  </div>
                </div>
                <Check size={16} className="text-gold" />
              </div>
            </div>

            <button 
              onClick={onClose}
              className="w-full py-4 bg-white text-black font-black text-sm uppercase tracking-widest rounded-xl hover:bg-gold hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg flex items-center justify-center gap-2 relative z-20"
            >
              <Sparkles size={16} /> Claim Power
            </button>

          </div>
        </div>
      </div>
    </div>
  );
};

export default AscensionModal;
