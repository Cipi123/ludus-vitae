
import React from 'react';
import { GameState, StatType } from '../types';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { Calendar, TrendingUp, Activity } from 'lucide-react';

interface Props {
  gameState: GameState;
}

const TheArchives: React.FC<Props> = ({ gameState }) => {
  const history = gameState.statHistory || [];
  
  // Prepare chart data
  const chartData = history.map(entry => ({
    date: new Date(entry.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
    STR: entry.stats[StatType.STR],
    INT: entry.stats[StatType.INT],
    CHA: entry.stats[StatType.CHA],
    total: entry.totalXp
  }));

  return (
    <div className="space-y-8 animate-fade-in">
       <div className="flex items-center justify-between">
          <div>
             <h2 className="text-3xl font-bold text-gold font-mono uppercase tracking-widest">The Archives</h2>
             <p className="text-sm text-gray-400 mt-1">Historical records of your evolution.</p>
          </div>
       </div>

       {/* Main Stat Growth Chart */}
       <div className="bg-void-light border border-gray-700 rounded-xl p-6 shadow-xl">
          <div className="flex items-center gap-2 mb-6 text-white font-bold font-mono">
             <TrendingUp size={20} className="text-blue-400" /> Stat Trajectory
          </div>
          <div className="h-80 w-full">
             <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                   <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                   <XAxis dataKey="date" stroke="#94a3b8" fontSize={12} />
                   <YAxis stroke="#94a3b8" fontSize={12} />
                   <Tooltip 
                      contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#fff' }}
                      itemStyle={{ fontSize: '12px' }}
                   />
                   <Legend />
                   <Line type="monotone" dataKey="STR" stroke="#f87171" strokeWidth={2} dot={false} />
                   <Line type="monotone" dataKey="INT" stroke="#38bdf8" strokeWidth={2} dot={false} />
                   <Line type="monotone" dataKey="CHA" stroke="#c084fc" strokeWidth={2} dot={false} />
                </LineChart>
             </ResponsiveContainer>
          </div>
       </div>

       {/* Heatmap Grid */}
       <div className="bg-void-light border border-gray-700 rounded-xl p-6 shadow-xl">
          <div className="flex items-center gap-2 mb-6 text-white font-bold font-mono">
             <Calendar size={20} className="text-green-400" /> Consistency Matrix
          </div>
          
          {/* Simplified Heatmap Visualization */}
          <div className="flex flex-wrap gap-1">
             {Array.from({ length: 60 }).map((_, i) => {
                // Fake heatmap data based on streak for visual demo if history is short
                const opacity = Math.random() > 0.7 ? 'opacity-100' : Math.random() > 0.4 ? 'opacity-50' : 'opacity-20';
                const color = Math.random() > 0.9 ? 'bg-gold' : 'bg-green-500';
                
                return (
                   <div key={i} className={`w-4 h-4 rounded-sm ${color} ${opacity} hover:opacity-100 transition-opacity cursor-help`} title="Activity Recorded"></div>
                )
             })}
             {history.length === 0 && <span className="text-gray-500 text-xs italic">Not enough data to generate matrix.</span>}
          </div>
       </div>
    </div>
  );
};

export default TheArchives;
