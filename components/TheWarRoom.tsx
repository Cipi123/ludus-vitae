
import React from 'react';
import { GameState, Quest, StatType } from '../types';
import { audio } from '../services/audioService';
import { ArrowRight, ArrowLeft, Check, Play, Square, Layout, LayoutList } from 'lucide-react';

interface Props {
  quests: Quest[];
  onUpdateStatus: (questId: string, status: 'TODO' | 'IN_PROGRESS' | 'DONE') => void;
  onComplete: (questId: string) => void;
}

const TheWarRoom: React.FC<Props> = ({ quests, onUpdateStatus, onComplete }) => {
  // Filter only uncompleted for TODO/ACTIVE, and recently completed for DONE
  const todo = quests.filter(q => !q.completed && (q.status === 'TODO' || !q.status));
  const active = quests.filter(q => !q.completed && q.status === 'IN_PROGRESS');
  const done = quests.filter(q => q.completed).slice(0, 10); // Show last 10

  const handleMove = (id: string, to: 'TODO' | 'IN_PROGRESS' | 'DONE') => {
    audio.play('click');
    if (to === 'DONE') {
      onComplete(id);
    } else {
      onUpdateStatus(id, to);
    }
  };

  const getStatColor = (type: string) => {
    switch (type) {
      case StatType.STR: return 'border-red-500 text-red-500';
      case StatType.DEX: return 'border-green-500 text-green-500';
      case StatType.INT: return 'border-blue-500 text-blue-500';
      case StatType.CHA: return 'border-purple-500 text-purple-500';
      case StatType.CON: return 'border-orange-500 text-orange-500';
      default: return 'border-gray-500 text-gray-500';
    }
  };

  return (
    <div className="h-full flex flex-col animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <div>
           <h2 className="text-3xl font-bold text-gold font-mono uppercase tracking-widest flex items-center gap-3">
             <Layout size={28} /> The War Room
           </h2>
           <p className="text-sm text-gray-400 mt-1">Tactical Operations Center. Manage your objectives.</p>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-6 overflow-hidden h-full pb-2">
        
        {/* TODO COLUMN */}
        <Column title="PENDING" count={todo.length} color="border-gray-600">
           {todo.map(q => (
             <KanbanCard key={q.id} quest={q} color={getStatColor(q.type)}>
                <button 
                  onClick={() => handleMove(q.id, 'IN_PROGRESS')}
                  className="w-full mt-3 py-2 bg-gray-800 hover:bg-blue-900/30 border border-gray-700 hover:border-blue-500 text-blue-400 rounded flex items-center justify-center gap-2 text-xs font-bold font-mono transition-all"
                >
                   ENGAGE <Play size={12} fill="currentColor" />
                </button>
             </KanbanCard>
           ))}
           {todo.length === 0 && <EmptyState />}
        </Column>

        {/* IN PROGRESS COLUMN */}
        <Column title="ACTIVE" count={active.length} color="border-blue-500">
           {active.map(q => (
             <KanbanCard key={q.id} quest={q} color={getStatColor(q.type)} isActive>
                <div className="flex gap-2 mt-3">
                   <button 
                     onClick={() => handleMove(q.id, 'TODO')}
                     className="flex-1 py-2 bg-gray-800 hover:bg-gray-700 border border-gray-700 text-gray-400 rounded flex items-center justify-center gap-2 text-xs font-bold font-mono"
                   >
                      <ArrowLeft size={12} /> ABORT
                   </button>
                   <button 
                     onClick={() => handleMove(q.id, 'DONE')}
                     className="flex-1 py-2 bg-blue-900/20 hover:bg-green-900/30 border border-blue-500 hover:border-green-500 text-green-400 rounded flex items-center justify-center gap-2 text-xs font-bold font-mono"
                   >
                      COMPLETE <Check size={12} />
                   </button>
                </div>
             </KanbanCard>
           ))}
           {active.length === 0 && <div className="text-center text-gray-600 text-xs font-mono mt-10">No active operations. Engage a task.</div>}
        </Column>

        {/* DONE COLUMN */}
        <Column title="LOGGED" count={done.length} color="border-green-600">
           {done.map(q => (
             <KanbanCard key={q.id} quest={q} color="border-gray-800 text-gray-600" isDone>
                <div className="mt-2 text-xs text-green-500 font-mono flex items-center justify-end gap-1">
                   <Check size={12} /> EXECUTED
                </div>
             </KanbanCard>
           ))}
        </Column>

      </div>
    </div>
  );
};

const Column = ({ title, count, color, children }: any) => (
  <div className="flex flex-col h-full bg-[#0c0c0e] rounded-xl border border-gray-800 overflow-hidden">
     <div className={`p-4 border-b border-gray-800 flex justify-between items-center bg-gray-900/50`}>
        <h3 className="font-bold text-gray-300 font-mono tracking-wider text-sm">{title}</h3>
        <span className="text-xs bg-black px-2 py-1 rounded text-gray-500 font-mono border border-gray-800">{count}</span>
     </div>
     <div className="flex-1 p-3 overflow-y-auto custom-scrollbar space-y-3 relative">
        {/* Scanline effect background */}
        <div className="absolute inset-0 bg-[linear-gradient(0deg,transparent_24%,rgba(255,255,255,.03)_25%,rgba(255,255,255,.03)_26%,transparent_27%,transparent_74%,rgba(255,255,255,.03)_75%,rgba(255,255,255,.03)_76%,transparent_77%,transparent),linear-gradient(90deg,transparent_24%,rgba(255,255,255,.03)_25%,rgba(255,255,255,.03)_26%,transparent_27%,transparent_74%,rgba(255,255,255,.03)_75%,rgba(255,255,255,.03)_76%,transparent_77%,transparent)] bg-[length:30px_30px] pointer-events-none"></div>
        <div className="relative z-10 space-y-3">
           {children}
        </div>
     </div>
  </div>
);

const KanbanCard = ({ quest, children, color, isActive, isDone }: any) => (
  <div className={`bg-black p-4 rounded-lg border shadow-lg transition-all ${isActive ? 'border-blue-500/50 shadow-blue-900/20' : isDone ? 'border-gray-800 opacity-60' : 'border-gray-700 hover:border-gray-500'}`}>
     <div className="flex justify-between items-start mb-2">
        <div className={`text-[10px] font-bold uppercase px-1.5 py-0.5 rounded border ${color.split(' ')[0]} ${color.split(' ')[1]} bg-opacity-10 bg-black`}>
           {quest.type.substring(0,3)}
        </div>
        <div className="text-[10px] text-gray-500 font-mono">{quest.difficulty}</div>
     </div>
     <h4 className={`font-bold text-sm mb-1 ${isDone ? 'text-gray-500 line-through' : 'text-gray-200'}`}>{quest.title}</h4>
     <p className="text-[10px] text-gray-500 line-clamp-2 leading-relaxed">{quest.description}</p>
     {children}
  </div>
);

const EmptyState = () => (
   <div className="text-center py-10 px-4 border-2 border-dashed border-gray-800 rounded-lg mt-4">
      <LayoutList size={24} className="text-gray-700 mx-auto mb-2" />
      <p className="text-xs text-gray-600">No pending tasks.</p>
      <p className="text-[10px] text-gray-700 mt-1">Add quests via the Dashboard or Oracle.</p>
   </div>
);

export default TheWarRoom;
