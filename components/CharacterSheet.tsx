
import React, { useState } from 'react';
import { ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';
import { UserStats, StatType, CustomAttribute } from '../types';
import { calculateXpForNextLevel, getRankTitle } from '../services/gameMechanics';
import { Shield, Zap, Brain, MessageCircle, Heart, ChevronRight, Plus, Sparkles, X, MessageSquare, Edit, RefreshCcw, Upload, User } from 'lucide-react';

interface Props {
  user: UserStats;
  onSelectStat: (stat: string) => void;
  onAddCustomStat: (name: string, color: string, bgColor: string) => void;
  onConsultStat: (stat: string) => void;
  onUpdateAvatar: (url: string) => void;
  onUpdateName: (name: string) => void;
}

const CharacterSheet: React.FC<Props> = ({ user, onSelectStat, onAddCustomStat, onConsultStat, onUpdateAvatar, onUpdateName }) => {
  const xpNeeded = calculateXpForNextLevel(user.level);
  const progress = (user.xp / xpNeeded) * 100;
  const rank = getRankTitle(user.level);
  
  const [isAddingStat, setIsAddingStat] = useState(false);
  const [newStatName, setNewStatName] = useState('');
  const [selectedColor, setSelectedColor] = useState(0);
  
  // Avatar/Name Picker State
  const [showAvatarPicker, setShowAvatarPicker] = useState(false);
  const [customAvatarUrl, setCustomAvatarUrl] = useState('');
  const [editName, setEditName] = useState(user.name);

  const colors = [
    { text: 'text-pink-500', bg: 'bg-pink-500' },
    { text: 'text-cyan-500', bg: 'bg-cyan-500' },
    { text: 'text-orange-500', bg: 'bg-orange-500' },
    { text: 'text-lime-500', bg: 'bg-lime-500' },
    { text: 'text-indigo-500', bg: 'bg-indigo-500' },
  ];

  const handleAddStat = () => {
    if (newStatName.trim()) {
      const color = colors[selectedColor];
      onAddCustomStat(newStatName.trim(), color.text, color.bg);
      setNewStatName('');
      setIsAddingStat(false);
    }
  };

  const handleNameUpdate = () => {
    if (editName.trim()) {
      onUpdateName(editName.trim());
    }
  };

  // File Upload Handler
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        onUpdateAvatar(reader.result as string);
        setShowAvatarPicker(false);
      };
      reader.readAsDataURL(file);
    }
  };

  // Presets using Pollinations
  const avatarPresets = [
     "cyberpunk%20samurai%20portrait",
     "futuristic%20netrunner%20hacker",
     "digital%20monk%20meditating",
     "bio-hacker%20scientist",
     "stoic%20philosopher%20scifi",
     "neon%20ninja%20assassin",
     "tactical%20spec%20ops%20soldier",
     "elite%20athlete%20cyborg"
  ];

  const generateRandomAvatar = () => {
     const randomSeed = Math.floor(Math.random() * 10000);
     onUpdateAvatar(`https://picsum.photos/seed/${randomSeed}/400`);
     setShowAvatarPicker(false);
  };

  // Combine core stats and custom stats for rendering
  const data = [
    { subject: 'STR', A: user.attributes[StatType.STR], fullMark: 100 },
    { subject: 'DEX', A: user.attributes[StatType.DEX], fullMark: 100 },
    { subject: 'CON', A: user.attributes[StatType.CON], fullMark: 100 },
    { subject: 'INT', A: user.attributes[StatType.INT], fullMark: 100 },
    { subject: 'CHA', A: user.attributes[StatType.CHA], fullMark: 100 },
    // Only include up to 3 custom stats in radar to prevent crowding, or all if mobile view adapts
    ...user.customAttributes.slice(0, 3).map(c => ({ subject: c.name.substring(0, 3).toUpperCase(), A: c.value, fullMark: 100 }))
  ];

  const currentAvatar = user.avatarUrl || `https://picsum.photos/seed/ludus${Math.floor(user.level / 5)}/400`;

  return (
    <div className="bg-void-light rounded-xl p-6 border border-gray-600 shadow-2xl relative">
      
      {/* Avatar Picker Modal */}
      {showAvatarPicker && (
         <div className="absolute inset-0 z-50 bg-black/95 backdrop-blur-md rounded-xl p-6 flex flex-col animate-fade-in">
            <div className="flex justify-between items-center mb-4">
               <h3 className="text-xl font-bold text-gold font-mono">NEURAL IDENTITY</h3>
               <button onClick={() => setShowAvatarPicker(false)} className="text-gray-400 hover:text-white"><X size={24}/></button>
            </div>
            
            <div className="flex-1 overflow-y-auto custom-scrollbar space-y-6">
               {/* Name Edit */}
               <div>
                  <label className="text-xs text-gray-500 uppercase font-bold block mb-2">Operative Name</label>
                  <div className="flex gap-2">
                     <input 
                        type="text" 
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        className="flex-1 bg-gray-900 border border-gray-700 rounded px-3 py-2 text-sm text-white focus:border-gold focus:outline-none font-mono"
                     />
                     <button 
                        onClick={handleNameUpdate}
                        className="px-4 py-2 bg-gray-800 border border-gray-600 text-gray-300 font-bold rounded hover:bg-gray-700 text-xs font-mono uppercase"
                     >
                        Save Name
                     </button>
                  </div>
               </div>

               {/* Preset Avatars */}
               <div>
                  <label className="text-xs text-gray-500 uppercase font-bold block mb-2">System Presets</label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                     {avatarPresets.map((prompt, idx) => (
                        <button 
                        key={idx}
                        onClick={() => {
                           onUpdateAvatar(`https://image.pollinations.ai/prompt/${prompt}`);
                           setShowAvatarPicker(false);
                        }}
                        className="aspect-square rounded-lg overflow-hidden border border-gray-700 hover:border-gold hover:scale-105 transition-all group relative"
                        >
                           <img 
                              src={`https://image.pollinations.ai/prompt/${prompt}`} 
                              className="w-full h-full object-cover opacity-70 group-hover:opacity-100 transition-opacity"
                              loading="lazy"
                           />
                           <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-[8px] text-center py-1 font-mono uppercase text-white">
                              {decodeURIComponent(prompt).replace(' portrait', '').slice(0, 15)}
                           </div>
                        </button>
                     ))}
                  </div>
               </div>
               
               <div className="space-y-4 border-t border-gray-700 pt-4">
                  {/* File Upload */}
                  <div>
                     <label className="text-xs text-gray-500 uppercase font-bold block mb-2">Local Upload</label>
                     <label className="w-full py-3 border border-dashed border-gray-600 rounded text-gray-400 hover:text-white hover:border-gold flex items-center justify-center gap-2 text-xs font-mono uppercase cursor-pointer transition-colors">
                        <Upload size={14} /> Select Image File
                        <input type="file" accept="image/*" className="hidden" onChange={handleFileUpload} />
                     </label>
                  </div>

                  {/* URL Input */}
                  <div>
                     <label className="text-xs text-gray-500 uppercase font-bold block mb-2">Custom Uplink (URL)</label>
                     <div className="flex gap-2">
                        <input 
                          type="text" 
                          value={customAvatarUrl}
                          onChange={(e) => setCustomAvatarUrl(e.target.value)}
                          placeholder="https://..."
                          className="flex-1 bg-gray-900 border border-gray-700 rounded px-3 py-2 text-sm text-white focus:border-gold focus:outline-none font-mono"
                        />
                        <button 
                          onClick={() => {
                             if(customAvatarUrl) {
                                onUpdateAvatar(customAvatarUrl);
                                setShowAvatarPicker(false);
                             }
                          }}
                          className="px-4 py-2 bg-gold text-black font-bold rounded hover:bg-yellow-400 text-xs font-mono uppercase"
                        >
                           Set URL
                        </button>
                     </div>
                  </div>
                  
                  <button 
                    onClick={generateRandomAvatar}
                    className="w-full py-3 border border-dashed border-gray-600 rounded text-gray-400 hover:text-white hover:border-gray-400 flex items-center justify-center gap-2 text-xs font-mono uppercase"
                  >
                     <RefreshCcw size={14} /> Randomize Signal
                  </button>
               </div>
            </div>
         </div>
      )}

      <div className="flex flex-col md:flex-row gap-8 items-start">
        
        {/* Avatar Section */}
        <div className="flex flex-col items-center md:sticky md:top-0 w-full md:w-auto">
          <div className="relative group mb-4 cursor-pointer" onClick={() => setShowAvatarPicker(true)}>
            <div className="w-32 h-32 md:w-48 md:h-48 rounded-full overflow-hidden border-4 border-gold shadow-gold/20 shadow-lg relative z-10 bg-black">
              <img 
                src={currentAvatar} 
                alt="Avatar" 
                className="w-full h-full object-cover group-hover:opacity-50 transition-all duration-300"
              />
              
              {/* Edit Overlay */}
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                 <div className="text-gold font-bold font-mono text-xs flex flex-col items-center gap-1 bg-black/60 p-2 rounded-lg backdrop-blur-sm">
                    <Edit size={20} />
                    <span>EDIT IDENTITY</span>
                 </div>
              </div>
            </div>
            <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 bg-void border border-gold text-gold px-3 py-1 rounded-full text-xs font-mono whitespace-nowrap z-20 pointer-events-none">
              Lvl {user.level} {rank}
            </div>
          </div>

          {/* Name Display */}
          <div className="text-center mb-4">
             <h2 className="text-xl font-bold text-white font-mono tracking-wider uppercase flex items-center justify-center gap-2 group cursor-pointer" onClick={() => setShowAvatarPicker(true)}>
                {user.name}
                <Edit size={12} className="text-gray-600 group-hover:text-gold opacity-0 group-hover:opacity-100 transition-opacity" />
             </h2>
             <p className="text-xs text-gray-500 font-mono uppercase">Class: {user.playerClass !== 'NONE' ? user.playerClass : 'Novice'}</p>
          </div>
          
          {/* Radar Chart - Mobile hidden */}
          <div className="w-48 h-48 hidden md:block opacity-90">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="80%" data={data}>
                <PolarGrid stroke="#64748b" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: '#cbd5e1', fontSize: 11, fontWeight: 'bold' }} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                <Radar name="User" dataKey="A" stroke="#fbbf24" strokeWidth={2} fill="#fbbf24" fillOpacity={0.4} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Stats Summary */}
        <div className="flex-1 w-full">
          <div className="flex justify-between items-end mb-2">
            <h2 className="text-2xl font-bold text-white font-mono">Character Stats</h2>
            <span className="text-xs text-gray-300 font-mono">XP: {user.xp} / {xpNeeded}</span>
          </div>
          
          {/* XP Bar */}
          <div className="w-full h-3 bg-gray-800 border border-gray-600 rounded-full overflow-hidden mb-6">
            <div 
              className="h-full bg-gradient-to-r from-gold-dim to-gold transition-all duration-1000 ease-out"
              style={{ width: `${Math.min(progress, 100)}%` }}
            />
          </div>

          {/* HP Bar (Discipline) - Enhanced Version */}
          <div className="flex items-center gap-3 mb-8 group/hp relative">
            <div className={`p-2 rounded-full bg-red-900/20 border border-red-500/30 text-red-500 shadow-[0_0_10px_rgba(239,68,68,0.4)] ${user.hp < 30 ? 'animate-pulse' : ''}`}>
               <Heart size={20} fill={user.hp < 30 ? "currentColor" : "none"} />
            </div>
            <div className="flex-1 relative">
               <div className="h-6 bg-black border border-gray-700 rounded-md overflow-hidden relative shadow-inner">
                 {/* Background Stripe Pattern */}
                 <div className="absolute inset-0 opacity-20 bg-[repeating-linear-gradient(45deg,transparent,transparent_10px,#374151_10px,#374151_20px)]"></div>
                 
                 <div 
                   className={`h-full transition-all duration-700 ease-out relative ${user.hp < 30 ? 'bg-red-600 shadow-[0_0_15px_red]' : 'bg-gradient-to-r from-red-900 to-red-600'}`}
                   style={{ width: `${(user.hp / user.maxHp) * 100}%` }}
                 >
                    <div className="absolute top-0 left-0 w-full h-[1px] bg-white/30"></div>
                 </div>
               </div>
               
               {/* Overlay Text */}
               <div className="absolute inset-0 flex items-center justify-between px-3">
                  <span className="text-[10px] font-bold font-mono uppercase tracking-widest text-white drop-shadow-md">Discipline</span>
                  <span className={`text-xs font-bold font-mono drop-shadow-md ${user.hp < 30 ? 'text-red-200 animate-pulse' : 'text-white'}`}>
                    {user.hp} / {user.maxHp}
                  </span>
               </div>
            </div>
          </div>

          {/* Attributes Groups */}
          <div className="grid grid-cols-1 gap-3">
            <StatSummaryCard 
              stat={StatType.STR} 
              value={user.attributes[StatType.STR]} 
              icon={<Shield size={20} />} 
              color="text-str"
              bgColor="bg-str"
              onClick={() => onSelectStat(StatType.STR)}
              onConsult={() => onConsultStat(StatType.STR)}
            />
            <StatSummaryCard 
              stat={StatType.DEX} 
              value={user.attributes[StatType.DEX]} 
              icon={<Zap size={20} />} 
              color="text-dex"
              bgColor="bg-dex"
              onClick={() => onSelectStat(StatType.DEX)}
              onConsult={() => onConsultStat(StatType.DEX)}
            />
            <StatSummaryCard 
              stat={StatType.INT} 
              value={user.attributes[StatType.INT]} 
              icon={<Brain size={20} />} 
              color="text-int"
              bgColor="bg-int"
              onClick={() => onSelectStat(StatType.INT)}
              onConsult={() => onConsultStat(StatType.INT)}
            />
            <StatSummaryCard 
              stat={StatType.CHA} 
              value={user.attributes[StatType.CHA]} 
              icon={<MessageCircle size={20} />} 
              color="text-cha"
              bgColor="bg-cha"
              onClick={() => onSelectStat(StatType.CHA)}
              onConsult={() => onConsultStat(StatType.CHA)}
            />
            <StatSummaryCard 
              stat={StatType.CON} 
              value={user.attributes[StatType.CON]} 
              icon={<Heart size={20} />} 
              color="text-white"
              bgColor="bg-gray-400"
              onClick={() => onSelectStat(StatType.CON)}
              onConsult={() => onConsultStat(StatType.CON)}
            />

            {/* Render Custom Stats */}
            {user.customAttributes.map(attr => (
              <StatSummaryCard 
                key={attr.id}
                stat={attr.name} 
                value={attr.value} 
                icon={<Sparkles size={20} />} 
                color={attr.color}
                bgColor={attr.bgColor}
                onClick={() => onSelectStat(attr.name)}
                onConsult={() => onConsultStat(attr.name)}
              />
            ))}

            {/* Add Custom Stat Button */}
            {isAddingStat ? (
              <div className="bg-gray-800 border border-gold rounded-lg p-3 animate-fade-in">
                 <div className="flex items-center gap-2 mb-3">
                    <input 
                      autoFocus
                      type="text"
                      value={newStatName}
                      onChange={(e) => setNewStatName(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleAddStat()}
                      placeholder="New Stat Name (e.g. Coding)"
                      className="flex-1 bg-gray-900 border border-gray-600 text-white text-sm rounded px-2 py-1 focus:border-gold focus:outline-none placeholder-gray-400"
                    />
                    <button onClick={handleAddStat} className="text-gold hover:text-white"><Plus size={16}/></button>
                    <button onClick={() => setIsAddingStat(false)} className="text-gray-400 hover:text-red-400"><X size={16}/></button>
                 </div>
                 <div className="flex gap-2 justify-center">
                    {colors.map((c, idx) => (
                      <button 
                        key={idx}
                        onClick={() => setSelectedColor(idx)}
                        className={`w-6 h-6 rounded-full ${c.bg} ${selectedColor === idx ? 'ring-2 ring-white scale-110' : 'opacity-60 hover:opacity-100'}`}
                      />
                    ))}
                 </div>
              </div>
            ) : (
              <button 
                onClick={() => setIsAddingStat(true)}
                className="flex items-center justify-center gap-2 p-3 border border-dashed border-gray-600 rounded-lg text-gray-400 hover:text-gold hover:border-gold hover:bg-gold/5 transition-all"
              >
                <Plus size={16} />
                <span className="text-sm font-mono">Add Custom Attribute</span>
              </button>
            )}

          </div>
        </div>
      </div>
    </div>
  );
};

const StatSummaryCard = ({ stat, value, icon, color, bgColor, onClick, onConsult }: { 
  stat: string, value: number, icon: React.ReactNode, color: string, bgColor: string, onClick: () => void, onConsult: () => void
}) => {
  return (
    <div className="relative flex items-center group/card">
      <button 
        onClick={onClick}
        className="flex-1 flex items-center justify-between p-4 bg-void border border-gray-700 rounded-lg hover:bg-gray-800 hover:border-gray-500 transition-all text-left relative overflow-hidden pr-16 shadow-sm"
      >
        {/* Hover highlight */}
        <div className={`absolute left-0 top-0 bottom-0 w-1 ${bgColor} opacity-70 group-hover/card:opacity-100 transition-opacity`} />
        
        <div className="flex items-center gap-4">
          <div className={`p-2 rounded-lg bg-white/10 ${color} group-hover/card:scale-110 transition-transform`}>
            {icon}
          </div>
          <div>
            <span className={`font-mono font-bold text-lg block leading-none ${color}`}>{stat}</span>
            <span className="text-[10px] text-gray-400 uppercase tracking-wider">Level {value}</span>
          </div>
        </div>
        
        <ChevronRight size={20} className="text-gray-600 group-hover/card:text-white transition-colors" />
      </button>

      {/* Dedicated Consult Button */}
      <button 
        onClick={(e) => { e.stopPropagation(); onConsult(); }}
        className="absolute right-2 p-2 text-gray-500 hover:text-purple-400 hover:bg-purple-900/30 rounded-full transition-all"
        title={`Consult Oracle about ${stat}`}
      >
        <MessageSquare size={18} />
      </button>
    </div>
  );
};

export default CharacterSheet;
