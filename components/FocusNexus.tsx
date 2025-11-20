
import React, { useState, useEffect, useRef } from 'react';
import { GameState, TimeLog } from '../types';
import { Play, Pause, RotateCcw, History, Hourglass, Skull, Calendar, Check, X, ChevronRight, Activity, Zap, Coffee, BookOpen } from 'lucide-react';

interface Props {
  gameState: GameState;
  onLogTime: (minutes: number, activity: string, category: string) => void;
  onUpdateBirthDate: (date: string) => void;
}

const FocusNexus: React.FC<Props> = ({ gameState, onLogTime, onUpdateBirthDate }) => {
  const [activeTab, setActiveTab] = useState<'TIMER' | 'MEMENTO' | 'HISTORY'>('TIMER');

  return (
    <div className="bg-void-light border border-gray-700 rounded-xl overflow-hidden shadow-2xl animate-fade-in min-h-[600px] flex flex-col relative">
      {/* Ambient Background Glow */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-gold to-transparent opacity-50"></div>

      {/* Header Navigation */}
      <div className="flex border-b border-gray-800 bg-black/40 backdrop-blur-md z-20">
        <NavButton 
          active={activeTab === 'TIMER'} 
          onClick={() => setActiveTab('TIMER')} 
          icon={<Hourglass size={14} />} 
          label="CHRONOMETER" 
          color="text-gold"
          borderColor="border-gold"
        />
        <NavButton 
          active={activeTab === 'MEMENTO'} 
          onClick={() => setActiveTab('MEMENTO')} 
          icon={<Skull size={14} />} 
          label="MEMENTO MORI" 
          color="text-white"
          borderColor="border-white"
        />
        <NavButton 
          active={activeTab === 'HISTORY'} 
          onClick={() => setActiveTab('HISTORY')} 
          icon={<History size={14} />} 
          label="LEDGER" 
          color="text-cyan-400"
          borderColor="border-cyan-400"
        />
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar bg-[#050505] relative">
        {/* Content Area */}
        {activeTab === 'TIMER' && <PomodoroTimer onLogTime={onLogTime} />}
        {activeTab === 'MEMENTO' && <MementoMori birthDate={gameState.user.birthDate} onUpdateBirthDate={onUpdateBirthDate} />}
        {activeTab === 'HISTORY' && <TimeHistory logs={gameState.timeLogs} />}
      </div>
    </div>
  );
};

const NavButton = ({ active, onClick, icon, label, color, borderColor }: any) => (
  <button 
    onClick={onClick}
    className={`flex-1 py-4 font-mono text-xs font-bold flex items-center justify-center gap-2 transition-all duration-300 relative overflow-hidden group ${
      active ? `bg-gray-900 ${color}` : 'text-gray-600 hover:text-gray-300 hover:bg-gray-900/50'
    }`}
  >
    {active && <div className={`absolute bottom-0 left-0 right-0 h-[2px] ${borderColor} shadow-[0_0_10px_currentColor]`}></div>}
    <span className={`transform transition-transform ${active ? 'scale-110' : 'group-hover:scale-105'}`}>{icon}</span>
    <span className="tracking-widest">{label}</span>
  </button>
);

// --- Sub-Component: Pomodoro Timer ---

const PomodoroTimer: React.FC<{ onLogTime: (min: number, act: string, cat: string) => void }> = ({ onLogTime }) => {
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isActive, setIsActive] = useState(false);
  const [mode, setMode] = useState<'FOCUS' | 'SHORT' | 'LONG'>('FOCUS');
  const [showLogModal, setShowLogModal] = useState(false);
  
  // Log Form State
  const [logActivity, setLogActivity] = useState('');
  const [logCategory, setLogCategory] = useState('FOCUS');

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const modes = {
    FOCUS: 25 * 60,
    SHORT: 5 * 60,
    LONG: 15 * 60
  };

  useEffect(() => {
    if (isActive && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && isActive) {
      setIsActive(false);
      if (timerRef.current) clearInterval(timerRef.current);
      if (mode === 'FOCUS') {
        const audio = new Audio('https://actions.google.com/sounds/v1/alarms/beep_short.ogg');
        audio.play().catch(e => console.log("Audio play failed", e));
        setShowLogModal(true);
      }
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [isActive, timeLeft, mode]);

  const toggleTimer = () => setIsActive(!isActive);
  
  const resetTimer = () => {
    setIsActive(false);
    setTimeLeft(modes[mode]);
  };

  const changeMode = (newMode: 'FOCUS' | 'SHORT' | 'LONG') => {
    setMode(newMode);
    setIsActive(false);
    setTimeLeft(modes[newMode]);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSaveLog = () => {
    if (logActivity.trim()) {
      onLogTime(modes.FOCUS / 60, logActivity, logCategory);
      setShowLogModal(false);
      setLogActivity('');
    }
  };

  // SVG Circle Calculations
  const radius = 140;
  const circumference = 2 * Math.PI * radius;
  const totalTime = modes[mode];
  const progress = ((totalTime - timeLeft) / totalTime) * 100;
  const strokeDashoffset = circumference - (progress / 100) * circumference;
  
  const getModeColor = () => {
    switch(mode) {
      case 'FOCUS': return '#facc15'; // Gold
      case 'SHORT': return '#4ade80'; // Green
      case 'LONG': return '#38bdf8'; // Blue
    }
  };

  const getModeGlow = () => {
    switch(mode) {
      case 'FOCUS': return 'shadow-[0_0_30px_rgba(250,204,21,0.3)]';
      case 'SHORT': return 'shadow-[0_0_30px_rgba(74,222,128,0.3)]';
      case 'LONG': return 'shadow-[0_0_30px_rgba(56,189,248,0.3)]';
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-full p-8 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-gray-900/50 via-transparent to-transparent pointer-events-none"></div>
      
      {/* SVG Timer Ring */}
      <div className="relative mb-10">
        <svg width="320" height="320" className="transform -rotate-90 drop-shadow-2xl">
          <defs>
             <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
               <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
               <feMerge>
                 <feMergeNode in="coloredBlur"/>
                 <feMergeNode in="SourceGraphic"/>
               </feMerge>
             </filter>
          </defs>
          {/* Track */}
          <circle
            cx="160"
            cy="160"
            r={radius}
            stroke="#1f2937"
            strokeWidth="8"
            fill="transparent"
          />
          {/* Progress */}
          <circle
            cx="160"
            cy="160"
            r={radius}
            stroke={getModeColor()}
            strokeWidth="8"
            fill="transparent"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            filter="url(#glow)"
            className="transition-all duration-1000 ease-linear"
          />
        </svg>

        {/* Center Content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <div className={`text-6xl md:text-7xl font-mono font-bold tabular-nums tracking-tighter transition-colors duration-500 ${mode === 'FOCUS' ? 'text-gold' : mode === 'SHORT' ? 'text-green-400' : 'text-cyan-400'}`} style={{ textShadow: `0 0 20px ${getModeColor()}40` }}>
            {formatTime(timeLeft)}
          </div>
          <div className="text-gray-500 font-mono text-xs uppercase tracking-[0.5em] mt-4 font-bold">
            {mode === 'FOCUS' ? 'Deep Work' : 'Recovery'}
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="flex gap-6 mb-12 z-10">
        <button 
          onClick={toggleTimer}
          className={`w-20 h-20 rounded-2xl flex items-center justify-center transition-all duration-200 ${
            isActive 
              ? 'bg-gray-800 text-gray-400 border border-gray-700 shadow-inner hover:bg-gray-700' 
              : `bg-gradient-to-br from-gray-800 to-black text-${mode === 'FOCUS' ? 'gold' : 'white'} border border-${mode === 'FOCUS' ? 'gold' : 'gray-600'} shadow-[0_0_15px_rgba(0,0,0,0.5)] hover:scale-105 hover:shadow-[0_0_25px_rgba(250,204,21,0.2)]`
          }`}
        >
          {isActive ? <Pause size={32} /> : <Play size={32} className="ml-1" fill="currentColor" />}
        </button>
        <button 
          onClick={resetTimer}
          className="w-20 h-20 rounded-2xl bg-black border border-gray-800 flex items-center justify-center text-gray-500 hover:text-white hover:border-gray-600 transition-all hover:scale-105"
        >
          <RotateCcw size={24} />
        </button>
      </div>

      {/* Mode Switcher */}
      <div className="flex p-1.5 bg-black rounded-xl border border-gray-800 shadow-lg z-10">
        {(['FOCUS', 'SHORT', 'LONG'] as const).map((m) => (
          <button
            key={m}
            onClick={() => changeMode(m)}
            className={`px-6 py-2 rounded-lg text-xs font-bold font-mono transition-all duration-300 ${
              mode === m 
                ? `bg-gray-800 text-white shadow-lg ${m === 'FOCUS' ? 'shadow-gold/10 border border-gold/20' : 'border border-gray-700'}` 
                : 'text-gray-600 hover:text-gray-300'
            }`}
          >
            {m === 'SHORT' ? 'SHORT' : m === 'LONG' ? 'LONG' : 'FOCUS'}
          </button>
        ))}
      </div>

      {/* Log Modal */}
      {showLogModal && (
        <div className="absolute inset-0 bg-black/95 backdrop-blur-md z-50 flex items-center justify-center p-6 animate-fade-in">
          <div className="bg-void-light border border-gold/30 rounded-2xl p-8 w-full max-w-sm shadow-[0_0_50px_rgba(250,204,21,0.1)] relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-gold to-transparent"></div>
            
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-gold/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-gold/30 text-gold">
                <Check size={32} />
              </div>
              <h3 className="text-2xl font-bold text-white font-mono">Session Complete</h3>
              <p className="text-gray-500 text-xs uppercase tracking-wider mt-2">Focus Acquired</p>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="text-[10px] text-gray-500 uppercase font-bold block mb-1.5 tracking-wider">Activity</label>
                <input 
                  autoFocus
                  type="text" 
                  value={logActivity}
                  onChange={(e) => setLogActivity(e.target.value)}
                  placeholder="Project Alpha..."
                  className="w-full bg-black/50 border border-gray-700 rounded-lg p-3 text-white focus:border-gold focus:ring-1 focus:ring-gold/50 focus:outline-none font-mono text-sm transition-all"
                />
              </div>
              <div>
                <label className="text-[10px] text-gray-500 uppercase font-bold block mb-1.5 tracking-wider">Category</label>
                <div className="grid grid-cols-2 gap-2">
                   {['FOCUS', 'LEARNING', 'WORK', 'EXERCISE'].map(cat => (
                     <button
                       key={cat}
                       onClick={() => setLogCategory(cat)}
                       className={`p-2 rounded border text-[10px] font-bold font-mono transition-all ${
                         logCategory === cat ? 'bg-gold/20 border-gold text-gold' : 'bg-gray-900 border-gray-800 text-gray-500 hover:border-gray-600'
                       }`}
                     >
                       {cat}
                     </button>
                   ))}
                </div>
              </div>
              <div className="flex gap-3 mt-8">
                <button 
                  onClick={handleSaveLog}
                  disabled={!logActivity.trim()}
                  className="flex-1 bg-gold text-black font-bold py-3 rounded-lg hover:bg-yellow-400 transition-all disabled:opacity-50 shadow-[0_0_20px_rgba(250,204,21,0.2)]"
                >
                  LOG
                </button>
                <button 
                  onClick={() => setShowLogModal(false)}
                  className="px-4 bg-gray-800 text-gray-400 font-bold py-3 rounded-lg hover:text-white hover:bg-gray-700 transition-colors"
                >
                  SKIP
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// --- Sub-Component: Memento Mori ---

const MementoMori: React.FC<{ birthDate?: string, onUpdateBirthDate: (date: string) => void }> = ({ birthDate, onUpdateBirthDate }) => {
  const [editDate, setEditDate] = useState(birthDate || '2000-01-01');
  const [isEditing, setIsEditing] = useState(!birthDate || birthDate === '2000-01-01');
  
  const LIFE_YEARS = 80;
  const TOTAL_WEEKS = LIFE_YEARS * 52;
  
  const now = new Date();
  const birth = new Date(editDate);
  const diffTime = Math.abs(now.getTime() - birth.getTime());
  const weeksLived = Math.ceil(diffTime / (1000 * 60 * 60 * 24 * 7));
  const weeksLeft = TOTAL_WEEKS - weeksLived;
  const percentageLived = ((weeksLived / TOTAL_WEEKS) * 100).toFixed(1);

  const handleSave = () => {
    onUpdateBirthDate(editDate);
    setIsEditing(false);
  };

  // Render grid in chunks of years (rows)
  const years = Array.from({ length: LIFE_YEARS }, (_, i) => i);

  return (
    <div className="p-6 md:p-12 max-w-5xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-8">
        <div>
          <h2 className="text-4xl font-bold text-white font-mono mb-3 tracking-tight">MEMENTO MORI</h2>
          <p className="text-gray-500 text-sm max-w-md font-light italic leading-relaxed border-l-2 border-gray-800 pl-4">
            "It is not that we have a short time to live, but that we waste a lot of it." <br/>— Seneca
          </p>
        </div>
        
        <div className="flex flex-col items-end gap-4">
           <div className="flex gap-8">
              <div className="text-right">
                 <div className="text-3xl font-bold font-mono text-white">{weeksLived.toLocaleString()}</div>
                 <div className="text-[10px] text-gray-600 uppercase tracking-widest font-bold">Weeks Spent</div>
              </div>
              <div className="text-right">
                 <div className="text-3xl font-bold font-mono text-gold text-glow">{weeksLeft.toLocaleString()}</div>
                 <div className="text-[10px] text-gold/50 uppercase tracking-widest font-bold">Weeks Left</div>
              </div>
           </div>
           
           {isEditing ? (
              <div className="flex items-center gap-2 bg-gray-900 p-2 rounded border border-gray-700 shadow-lg animate-fade-in">
                 <span className="text-xs text-gray-500 font-mono">DOB:</span>
                 <input 
                   type="date" 
                   value={editDate}
                   onChange={(e) => setEditDate(e.target.value)}
                   className="bg-black text-white border border-gray-700 rounded px-2 py-1 text-xs font-mono focus:border-gold focus:outline-none"
                 />
                 <button onClick={handleSave} className="p-1.5 bg-gold rounded text-black hover:bg-yellow-400"><Check size={12} /></button>
              </div>
           ) : (
              <button 
                onClick={() => setIsEditing(true)}
                className="text-xs text-gray-600 hover:text-white transition-colors font-mono flex items-center gap-1"
              >
                 EDIT BIRTHDATE <ChevronRight size={10} />
              </button>
           )}
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex justify-between text-xs font-mono text-gray-500 mb-2">
           <span>LIFE PROGRESS</span>
           <span>{percentageLived}%</span>
        </div>
        <div className="h-2 w-full bg-gray-900 rounded-full overflow-hidden border border-gray-800">
           <div className="h-full bg-gradient-to-r from-gray-700 via-gray-500 to-white" style={{ width: `${percentageLived}%` }}></div>
        </div>
      </div>

      {/* The Grid */}
      <div className="bg-[#0a0a0a] p-8 rounded-2xl border border-gray-800 shadow-2xl overflow-hidden relative">
         {/* Grid Overlay Gradient */}
         <div className="absolute top-0 left-0 w-full h-8 bg-gradient-to-b from-[#0a0a0a] to-transparent z-10 pointer-events-none"></div>
         <div className="absolute bottom-0 left-0 w-full h-8 bg-gradient-to-t from-[#0a0a0a] to-transparent z-10 pointer-events-none"></div>
         
         <div className="grid grid-cols-[auto_1fr] gap-4 overflow-x-auto custom-scrollbar pb-2">
           <div className="flex flex-col gap-[3px] pt-[2px]">
             {years.filter(y => y % 5 === 0).map(y => (
               <div key={y} className="h-[8px] text-[9px] font-mono text-gray-700 leading-none flex items-center justify-end pr-2" style={{ marginBottom: '19px' }}>
                 {y}
               </div>
             ))}
           </div>
           
           <div className="flex flex-col gap-[3px]">
             {years.map((yearIdx) => {
               const yearStartWeek = yearIdx * 52;
               const weeksInYear = Array.from({length: 52});
               
               return (
                 <div key={yearIdx} className="flex gap-[2px] h-[8px]">
                   {weeksInYear.map((_, weekIdx) => {
                     const absoluteWeek = yearStartWeek + weekIdx;
                     let status = 'future';
                     if (absoluteWeek < weeksLived) status = 'lived';
                     if (absoluteWeek === weeksLived) status = 'current';
                     
                     return (
                       <div 
                         key={weekIdx} 
                         title={`Age ${yearIdx}, Week ${weekIdx + 1}`}
                         className={`w-[6px] md:w-[8px] h-full rounded-[1px] transition-all duration-300 ${
                           status === 'lived' ? 'bg-gray-800' : 
                           status === 'current' ? 'bg-gold shadow-[0_0_8px_#facc15] z-10 scale-125' : 
                           'bg-[#1a1a1a] hover:bg-gray-700'
                         }`} 
                       />
                     );
                   })}
                 </div>
               )
             })}
           </div>
         </div>
      </div>
      
      <div className="flex justify-center gap-8 mt-8 text-[10px] text-gray-500 font-mono uppercase tracking-widest">
          <div className="flex items-center gap-2"><div className="w-3 h-3 bg-gray-800 rounded-[1px]"></div> Past</div>
          <div className="flex items-center gap-2"><div className="w-3 h-3 bg-gold rounded-[1px] shadow-[0_0_5px_#facc15]"></div> Present</div>
          <div className="flex items-center gap-2"><div className="w-3 h-3 bg-[#1a1a1a] border border-gray-800 rounded-[1px]"></div> Future</div>
      </div>
    </div>
  );
};

// --- Sub-Component: Time History ---

const TimeHistory: React.FC<{ logs: TimeLog[] }> = ({ logs }) => {
  const sortedLogs = [...logs].sort((a, b) => b.timestamp - a.timestamp);
  
  // Calculate Stats
  const totalMinutes = sortedLogs.reduce((acc, l) => acc + l.durationMinutes, 0);
  const hours = Math.floor(totalMinutes / 60);
  const sessions = sortedLogs.length;
  
  // Group by Date
  const groupedLogs: { [date: string]: TimeLog[] } = {};
  sortedLogs.forEach(log => {
    const date = new Date(log.timestamp).toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' });
    if (!groupedLogs[date]) groupedLogs[date] = [];
    groupedLogs[date].push(log);
  });

  const getCategoryIcon = (cat: string) => {
    switch(cat) {
      case 'FOCUS': return <Zap size={14} className="text-gold" />;
      case 'LEARNING': return <BookOpen size={14} className="text-cyan-400" />;
      case 'WORK': return <Activity size={14} className="text-purple-400" />;
      case 'EXERCISE': return <Activity size={14} className="text-red-400" />;
      default: return <Coffee size={14} className="text-gray-400" />;
    }
  };

  return (
    <div className="p-8 max-w-3xl mx-auto">
       <div className="grid grid-cols-2 gap-4 mb-10">
         <div className="bg-gray-900/50 border border-gray-800 p-6 rounded-2xl backdrop-blur-sm">
            <div className="text-xs text-gray-500 uppercase font-bold tracking-wider mb-2">Total Focus</div>
            <div className="text-3xl font-mono font-bold text-white">{hours}<span className="text-lg text-gray-600 ml-1">hrs</span> {(totalMinutes % 60)}<span className="text-lg text-gray-600 ml-1">min</span></div>
         </div>
         <div className="bg-gray-900/50 border border-gray-800 p-6 rounded-2xl backdrop-blur-sm">
            <div className="text-xs text-gray-500 uppercase font-bold tracking-wider mb-2">Sessions</div>
            <div className="text-3xl font-mono font-bold text-white">{sessions}</div>
         </div>
       </div>

       <div className="space-y-8">
          {Object.entries(groupedLogs).map(([date, dayLogs]) => (
            <div key={date} className="animate-fade-in">
               <div className="flex items-center gap-4 mb-4">
                  <div className="h-[1px] bg-gray-800 flex-1"></div>
                  <span className="text-xs font-bold font-mono text-gray-500 uppercase tracking-widest">{date}</span>
                  <div className="h-[1px] bg-gray-800 flex-1"></div>
               </div>
               
               <div className="space-y-3">
                 {dayLogs.map(log => (
                   <div key={log.id} className="bg-black border border-gray-800 hover:border-gray-600 rounded-xl p-4 flex justify-between items-center group transition-all">
                      <div className="flex items-center gap-4">
                         <div className="w-10 h-10 rounded-full bg-gray-900 flex items-center justify-center border border-gray-800 group-hover:border-gray-600 transition-colors">
                            {getCategoryIcon(log.category)}
                         </div>
                         <div>
                            <div className="font-bold text-gray-200 text-sm group-hover:text-white">{log.activity}</div>
                            <div className="text-[10px] text-gray-500 uppercase tracking-wide font-bold mt-0.5">{log.category}</div>
                         </div>
                      </div>
                      <div className="text-right">
                         <div className="font-mono font-bold text-gold">{log.durationMinutes}m</div>
                         <div className="text-[10px] text-gray-600 font-mono">{new Date(log.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</div>
                      </div>
                   </div>
                 ))}
               </div>
            </div>
          ))}
          
          {sortedLogs.length === 0 && (
            <div className="text-center py-20">
               <div className="w-20 h-20 bg-gray-900 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-700">
                  <History size={32} />
               </div>
               <p className="text-gray-500 font-mono">The Ledger is empty.</p>
               <button onClick={() => {}} className="text-gold text-sm mt-2 hover:underline">Start a Session</button>
            </div>
          )}
       </div>
    </div>
  );
};

export default FocusNexus;
