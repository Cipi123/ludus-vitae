
import React, { useState, useEffect } from 'react';
import { Sun, Shield, Calendar, Quote, ArrowRight, Gift, Check, Target, AlertTriangle, Info } from 'lucide-react';
import { audio } from '../services/audioService';

interface Props {
  onComplete: (mainQuest: string) => void;
  daysMissed: number;
  hpLoss: number;
}

const DaybreakProtocol: React.FC<Props> = ({ onComplete, daysMissed, hpLoss }) => {
  const [step, setStep] = useState(0);
  const [mainQuest, setMainQuest] = useState('');

  const quotes = [
    "When you arise in the morning think of what a privilege it is to be alive.",
    "The dawn is a new battlefield. Prepare yourself.",
    "Discipline is doing what you hate to do, but doing it like you love it.",
    "Conquer the morning, conquer the day."
  ];
  const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];

  useEffect(() => {
    const t = setTimeout(() => setStep(1), 500);
    return () => clearTimeout(t);
  }, []);

  const nextStep = () => {
    audio.play('click');
    setStep(prev => prev + 1);
  };

  const handleFinish = () => {
    audio.play('success');
    onComplete(mainQuest);
  };

  return (
    <div className="fixed inset-0 z-[200] bg-[#020617] flex flex-col items-center justify-center overflow-hidden font-sans">
       {/* Holographic Grid Background */}
       <div className="absolute inset-0 bg-[linear-gradient(0deg,transparent_24%,rgba(59,130,246,.05)_25%,rgba(59,130,246,.05)_26%,transparent_27%,transparent_74%,rgba(59,130,246,.05)_75%,rgba(59,130,246,.05)_76%,transparent_77%,transparent),linear-gradient(90deg,transparent_24%,rgba(59,130,246,.05)_25%,rgba(59,130,246,.05)_26%,transparent_27%,transparent_74%,rgba(59,130,246,.05)_75%,rgba(59,130,246,.05)_76%,transparent_77%,transparent)] bg-[length:40px_40px] pointer-events-none"></div>
       
       {/* Step 1: The Notification */}
       {step === 1 && (
         <div className="system-window p-10 max-w-md w-full text-center animate-fade-in relative z-20">
            <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-[#020617] px-4 text-gold font-bold tracking-widest border border-gold/40 rounded-full uppercase text-sm shadow-system">
              System Alert
            </div>
            <Info size={48} className="text-gold mx-auto mb-6 animate-pulse" />
            <h1 className="text-3xl font-bold text-white mb-2 tracking-wider uppercase">Player!</h1>
            <p className="text-blue-200 font-bold text-lg uppercase tracking-widest mb-8">
               You have a daily quest.
            </p>
            <button onClick={nextStep} className="w-full py-3 bg-gold/10 border border-gold hover:bg-gold/20 text-white font-bold tracking-[0.2em] transition-all uppercase">
               Accept
            </button>
         </div>
       )}

       {/* Step 2: Quest Info (Decay) */}
       {step === 2 && (
         <div className="system-window p-8 max-w-md w-full animate-slide-in relative z-20">
            <div className="border-b border-gold/30 pb-4 mb-6">
               <h2 className="text-xl font-bold text-gold uppercase tracking-widest text-center">Quest Info</h2>
               <div className="text-center text-xs text-gray-400 mt-1 uppercase tracking-wide">Daily Status Report</div>
            </div>
            
            <div className="space-y-6">
               <div className="flex justify-between items-center p-4 bg-blue-900/10 border border-blue-800/30">
                  <span className="text-gray-400 uppercase font-bold text-sm">Time Elapsed</span>
                  <span className={`font-mono font-bold text-lg ${daysMissed > 0 ? 'text-red-500' : 'text-green-400'}`}>
                     {daysMissed > 0 ? `${daysMissed} DAYS LOST` : 'OPTIMAL'}
                  </span>
               </div>
               
               <div className="flex justify-between items-center p-4 bg-blue-900/10 border border-blue-800/30">
                  <span className="text-gray-400 uppercase font-bold text-sm">Penalty Status</span>
                  <span className={`font-mono font-bold text-lg ${hpLoss > 0 ? 'text-red-500' : 'text-green-400'}`}>
                     {hpLoss > 0 ? `-${hpLoss} HP DAMAGE` : 'NONE'}
                  </span>
               </div>

               {hpLoss > 0 && (
                  <div className="text-red-400 text-xs text-center uppercase font-bold border border-red-500/30 p-2 bg-red-950/20">
                     Warning: Failure to complete daily tasks will result in further penalties.
                  </div>
               )}
            </div>

            <button onClick={nextStep} className="w-full mt-8 py-3 bg-transparent border border-gray-600 text-gray-300 hover:text-white hover:border-white font-bold tracking-[0.2em] uppercase transition-all">
               Confirm
            </button>
         </div>
       )}

       {/* Step 3: Rewards */}
       {step === 3 && (
         <div className="system-window p-8 max-w-md w-full animate-slide-in relative z-20 text-center">
             <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-[#020617] px-4 text-gold font-bold tracking-widest border border-gold/40 rounded-full uppercase text-sm shadow-system">
              Rewards
            </div>
            <div className="my-8 relative">
               <div className="absolute inset-0 bg-gold/20 blur-2xl rounded-full animate-pulse"></div>
               <Gift size={64} className="text-gold relative z-10 mx-auto" />
            </div>
            <div className="text-2xl font-mono text-white font-bold mb-2 uppercase tracking-widest">Login Bonus</div>
            <div className="text-gold font-bold text-4xl mb-8 text-glow">+50 Credits</div>
            
            <button onClick={nextStep} className="w-full py-3 bg-gold/20 border border-gold text-gold hover:bg-gold/30 font-bold tracking-[0.2em] uppercase transition-all">
               Collect
            </button>
         </div>
       )}

       {/* Step 4: The Objective */}
       {step === 4 && (
         <div className="system-window p-8 max-w-md w-full animate-slide-in relative z-20">
             <div className="border-b border-gold/30 pb-4 mb-6">
               <h2 className="text-xl font-bold text-gold uppercase tracking-widest text-center">Daily Quest</h2>
               <div className="text-center text-xs text-gray-400 mt-1 uppercase tracking-wide">Define Prime Directive</div>
            </div>

            <div className="mb-6 text-center">
               <Quote size={24} className="text-gray-600 mx-auto mb-2" />
               <p className="text-lg text-white italic font-light leading-relaxed">"{randomQuote}"</p>
            </div>
            
            <div className="space-y-2">
               <label className="text-blue-400 text-xs uppercase font-bold tracking-widest">Goal [Required]</label>
               <input 
                  type="text" 
                  value={mainQuest}
                  onChange={(e) => setMainQuest(e.target.value)}
                  placeholder="Enter main objective..."
                  className="w-full bg-blue-950/30 border border-blue-800 text-white p-4 focus:border-gold focus:outline-none font-mono text-sm shadow-inner"
                  autoFocus
               />
            </div>

            <button 
               onClick={handleFinish}
               disabled={!mainQuest.trim()}
               className="w-full mt-8 py-4 bg-gold text-black font-black tracking-[0.2em] uppercase hover:bg-blue-400 transition-all disabled:opacity-50 shadow-system-hover"
            >
               Start Game
            </button>
         </div>
       )}

    </div>
  );
};

export default DaybreakProtocol;
