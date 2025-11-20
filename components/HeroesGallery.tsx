
import React, { useState } from 'react';
import { Hero, UserStats, StatType, HeroSkill } from '../types';
import { ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Legend } from 'recharts';
import { User, Crown, TrendingUp, Plus, Star, Check, Quote, ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';

interface Props {
  heroes: Hero[];
  userStats: UserStats;
  onSummonHero: () => void;
  onAdoptSkill: (skillName: string, type: string) => void;
}

const HeroesGallery: React.FC<Props> = ({ heroes, userStats, onSummonHero, onAdoptSkill }) => {
  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gold font-mono uppercase tracking-widest">Hall of Heroes</h2>
          <p className="text-sm text-gray-400 mt-1">The Pantheon of those who came before. Bridge the gap between you and them.</p>
        </div>
        <button 
          onClick={onSummonHero}
          className="flex items-center gap-2 px-4 py-2 bg-void border border-gold text-gold hover:bg-gold hover:text-black transition-all rounded font-mono text-sm font-bold shadow-lg shadow-gold/10"
        >
          <Plus size={16} />
          Summon New Hero
        </button>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        {heroes.map((hero) => (
          <HeroCard 
            key={hero.id} 
            hero={hero} 
            userStats={userStats} 
            onAdoptSkill={onAdoptSkill}
          />
        ))}
      </div>
    </div>
  );
};

interface HeroCardProps {
  hero: Hero;
  userStats: UserStats;
  onAdoptSkill: (skillName: string, type: string) => void;
}

const HeroCard: React.FC<HeroCardProps> = ({ hero, userStats, onAdoptSkill }) => {
  const [quoteIndex, setQuoteIndex] = useState(0);

  const data = [
    { subject: 'STR', User: userStats.attributes[StatType.STR], Hero: hero.stats[StatType.STR] },
    { subject: 'DEX', User: userStats.attributes[StatType.DEX], Hero: hero.stats[StatType.DEX] },
    { subject: 'CON', User: userStats.attributes[StatType.CON], Hero: hero.stats[StatType.CON] },
    { subject: 'INT', User: userStats.attributes[StatType.INT], Hero: hero.stats[StatType.INT] },
    { subject: 'CHA', User: userStats.attributes[StatType.CHA], Hero: hero.stats[StatType.CHA] },
  ];

  // Calculate dynamic max for the chart domain to accommodate legendary stats (e.g. 300)
  const heroMaxStat = Math.max(...Object.values(hero.stats));
  const chartDomainMax = Math.max(heroMaxStat, 100);

  // Calculate total stat gap
  const userTotal = Object.values(userStats.attributes).reduce((a, b) => a + b, 0);
  const heroTotal = Object.values(hero.stats).reduce((a, b) => a + b, 0);
  const percentMatch = Math.min(100, Math.round((userTotal / heroTotal) * 100));
  
  // Level Gap Estimation - Scale target level based on max stat
  const targetLevel = Math.max(heroMaxStat, 50); 
  const levelGap = Math.max(0, targetLevel - userStats.level);

  const quotes = hero.quotes && hero.quotes.length > 0 ? hero.quotes : ["Fate guides the willing, but drags the unwilling."];
  const currentQuote = quotes[quoteIndex];

  const nextQuote = () => setQuoteIndex((prev) => (prev + 1) % quotes.length);
  const prevQuote = () => setQuoteIndex((prev) => (prev - 1 + quotes.length) % quotes.length);

  return (
    <div className="bg-void-light border border-gray-700 rounded-xl overflow-hidden shadow-xl hover:border-gold/50 transition-all duration-500 group flex flex-col md:flex-row">
      
      {/* Info Section */}
      <div className="p-6 flex-1 flex flex-col">
        <div className="flex justify-between items-start mb-4 gap-4">
          <div className="flex items-center gap-4">
             {/* Hero Image */}
             <div className="w-16 h-16 md:w-20 md:h-20 rounded-lg overflow-hidden border-2 border-gold/50 shadow-lg flex-shrink-0">
                <img 
                  src={hero.imageUrl || `https://image.pollinations.ai/prompt/painting%20of%20${hero.name}%20historical%20portrait`} 
                  alt={hero.name}
                  className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500"
                  onError={(e) => { (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${hero.name}&background=random` }}
                />
             </div>
             <div>
                <h3 className="text-2xl font-bold text-white font-serif leading-tight">{hero.name}</h3>
                <p className="text-gold text-xs font-mono uppercase tracking-widest font-bold">{hero.title}</p>
             </div>
          </div>
          <div className="bg-gray-800 p-2 rounded-full text-gray-400 group-hover:text-gold transition-colors flex-shrink-0">
            <Crown size={20} />
          </div>
        </div>
        
        <p className="text-gray-300 text-sm italic leading-relaxed mb-6 border-l-2 border-gray-700 pl-3">
          "{hero.description}"
        </p>
        
        {/* Quote Section - Enhanced Carousel */}
        <div className="mb-6">
           <h4 className="text-[10px] text-gray-400 uppercase tracking-widest mb-2 font-bold flex items-center gap-2">
             <Quote size={12} className="text-gold" />
             Wisdom of the Ages
           </h4>
           <div className="bg-gradient-to-b from-gray-900 to-black border border-gray-700 rounded-lg relative flex flex-col min-h-[120px] shadow-inner group/quote">
             {/* Decorative quotes background */}
             <div className="absolute top-3 left-4 text-gray-800 opacity-30">
               <Quote size={32} className="transform rotate-180" />
             </div>
             
             <div className="flex-1 flex items-center justify-center p-6 px-12 relative z-10">
                <p className="text-lg text-gray-100 font-serif italic text-center leading-relaxed drop-shadow-md transition-all duration-300 animate-fade-in">
                  "{currentQuote}"
                </p>
             </div>
             
             {quotes.length > 1 && (
               <>
                  <button 
                    onClick={prevQuote}
                    className="absolute left-0 top-0 bottom-0 px-3 text-gray-600 hover:text-gold hover:bg-white/5 transition-all rounded-l-lg z-20"
                    title="Previous Quote"
                  >
                    <ChevronLeft size={24} />
                  </button>
                  <button 
                    onClick={nextQuote}
                    className="absolute right-0 top-0 bottom-0 px-3 text-gray-600 hover:text-gold hover:bg-white/5 transition-all rounded-r-lg z-20"
                    title="Next Quote"
                  >
                    <ChevronRight size={24} />
                  </button>
                  <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-2 z-20">
                    {quotes.map((_, idx) => (
                      <button 
                        key={idx}
                        onClick={() => setQuoteIndex(idx)} 
                        className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${idx === quoteIndex ? 'bg-gold scale-125 shadow-[0_0_5px_#facc15]' : 'bg-gray-700 hover:bg-gray-500'}`}
                      />
                    ))}
                  </div>
               </>
             )}
          </div>
        </div>

        {/* Skills Section */}
        {hero.skills && hero.skills.length > 0 && (
          <div className="mb-6">
            <h4 className="text-[10px] text-gray-400 uppercase tracking-widest mb-2 font-bold">Signature Skills</h4>
            <div className="flex flex-wrap gap-2">
              {hero.skills.map((skill, idx) => {
                const hasSkill = userStats.subSkills.some(s => s.name === skill.name);
                return (
                  <button
                    key={idx}
                    onClick={() => !hasSkill && onAdoptSkill(skill.name, skill.type)}
                    disabled={hasSkill}
                    className={`flex items-center gap-1.5 px-3 py-2 rounded text-xs font-mono border transition-all group/btn ${
                      hasSkill 
                        ? 'bg-green-900/20 border-green-500/30 text-green-400 cursor-default' 
                        : 'bg-gray-800 border-gray-600 text-gray-200 hover:border-gold hover:text-gold hover:bg-gray-700 hover:shadow-[0_0_10px_rgba(250,204,21,0.2)]'
                    }`}
                    title={hasSkill ? "Already Learned" : `Adopt Skill: ${skill.name} (${skill.type})`}
                  >
                    {hasSkill ? <Check size={14} /> : <Plus size={14} />}
                    <span className="font-bold">{skill.name}</span>
                    {!hasSkill && <span className="opacity-0 group-hover/btn:opacity-100 transition-opacity text-[10px] ml-1 text-gold">Learn</span>}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Stat Comparison Grid */}
        <div className="mb-6">
           <h4 className="text-[10px] text-gray-400 uppercase tracking-widest mb-2 font-bold">Stat Comparison</h4>
           <div className="grid grid-cols-5 gap-2">
            {Object.values(StatType).map((stat) => {
               const userVal = userStats.attributes[stat];
               const heroVal = hero.stats[stat];
               const diff = userVal - heroVal;
               const isEqual = diff === 0;
               const isHigher = diff > 0;
               
               return (
                 <div key={stat} className={`rounded p-2 border flex flex-col items-center transition-colors ${
                   isHigher ? 'bg-green-900/10 border-green-900/30' : 
                   isEqual ? 'bg-gray-800 border-gray-700' :
                   'bg-red-900/10 border-red-900/30'
                 }`}>
                    <span className="text-[10px] text-gray-400 font-mono uppercase">{stat.substring(0,3)}</span>
                    <span className="text-sm font-bold text-white">{heroVal}</span>
                    <div className={`flex items-center text-[10px] font-bold font-mono ${
                      isHigher ? 'text-green-400' : isEqual ? 'text-gray-500' : 'text-red-400'
                    }`}>
                      {diff > 0 ? '+' : ''}{diff}
                    </div>
                 </div>
               );
            })}
           </div>
        </div>

        <div className="flex flex-wrap gap-2 mt-auto mb-6">
          {hero.tags.map(tag => (
            <span key={tag} className="text-[10px] px-2 py-1 rounded bg-gray-800 text-gray-300 border border-gray-600 uppercase tracking-wider font-mono">
              {tag}
            </span>
          ))}
        </div>

        <div className="mt-auto pt-4 border-t border-gray-700 grid grid-cols-3 gap-4">
             <div>
                <div className="text-[10px] text-gray-400 uppercase tracking-widest mb-1 font-bold">Sync</div>
                <div className="text-2xl font-bold font-mono text-white">{percentMatch}%</div>
             </div>
             <div>
               <div className="text-[10px] text-gray-400 uppercase tracking-widest mb-1 font-bold">Stat Gap</div>
               <div className="text-lg font-bold font-mono text-red-400">-{Math.max(0, heroTotal - userTotal)}</div>
             </div>
             <div className="text-right">
                <div className="text-[10px] text-gray-400 uppercase tracking-widest mb-1 text-gold font-bold">Req. Level</div>
                <div className="text-lg font-bold font-mono text-gold flex items-center justify-end gap-1">
                   {targetLevel}
                   {levelGap > 0 && <span className="text-xs text-red-400 opacity-80">(+{levelGap})</span>}
                </div>
             </div>
        </div>
        
        {/* Progress Bar for Sync */}
        <div className="w-full h-1 bg-gray-800 mt-4 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-gold-dim to-gold shadow-[0_0_10px_#fbbf24]" style={{ width: `${percentMatch}%` }}></div>
        </div>
      </div>

      {/* Chart Section */}
      <div className="bg-[#0a0f1c] p-4 w-full md:w-72 border-t md:border-t-0 md:border-l border-gray-700 relative flex flex-col justify-center">
        <div className="h-56 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart cx="50%" cy="50%" outerRadius="70%" data={data}>
              <PolarGrid stroke="#334155" />
              <PolarAngleAxis dataKey="subject" tick={{ fill: '#cbd5e1', fontSize: 10, fontWeight: 'bold' }} />
              <PolarRadiusAxis angle={30} domain={[0, chartDomainMax]} tick={false} axisLine={false} />
              <Radar name="You" dataKey="User" stroke="#818cf8" strokeWidth={2} fill="#818cf8" fillOpacity={0.4} />
              <Radar name="Hero" dataKey="Hero" stroke="#fbbf24" strokeWidth={2} fill="#fbbf24" fillOpacity={0.15} />
              <Legend wrapperStyle={{ fontSize: '10px', marginTop: '5px', color: '#94a3b8' }} />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default HeroesGallery;
