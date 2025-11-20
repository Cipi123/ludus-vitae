
import React, { useEffect, useState, useCallback } from 'react';
import { GameState, StatType, Quest, Virtue, SubSkill, Hero, Goal, CustomAttribute, LootResult, TimeLog, Item, Boss, Power } from './types';
import { INITIAL_STATE, SKILL_LEVEL_UP_BONUS_XP, POWERS } from './constants';
import { loadGame, saveGame, exportSaveData, importSaveData, clearSave, getStorageUsage, setStorageUser } from './services/storageService';
import { calculateXpForNextLevel, checkLevelUp, rollLoot, calculateSkillXpForNextLevel, checkSkillLevelUp, processDailyDecay, applyItemEffect, openLootBox, checkAchievements, calculateActiveBuffs, checkStoryUnlocks } from './services/gameMechanics';
import { signInWithGoogle, logOut, subscribeToAuth, loadFromCloud } from './services/firebase';
import { audio } from './services/audioService';

// Component Imports
import CharacterSheet from './components/CharacterSheet';
import StatDetail from './components/StatDetail';
import QuestCard from './components/QuestCard';
import Oracle from './components/Oracle';
import Sanctuary from './components/Sanctuary';
import BibleEditor from './components/BibleEditor';
import VirtueGrid from './components/VirtueGrid';
import HeroesGallery from './components/HeroesGallery';
import SkillsMastery from './components/SkillsMastery';
import BioArchitect from './components/BioArchitect';
import FocusNexus from './components/FocusNexus';
import TheArmory from './components/TheArmory';
import TheCampaign from './components/TheCampaign';
import TheArchives from './components/TheArchives';
import AscensionModal from './components/AscensionModal';
import DaybreakProtocol from './components/DaybreakProtocol';
import FeatsAndPowers from './components/FeatsAndPowers';
import TheWarRoom from './components/TheWarRoom';
import StoryMode from './components/StoryMode';
import { Menu, X, LayoutDashboard, Scroll, Sword, Book, Activity, User, Settings, Sparkles, Trophy, Skull, Heart, Download, Upload, Trash2, Flame, Hourglass, Database, HardDrive, Save, Cloud, CloudLightning, LogOut, LogIn, Check, ShoppingBag, PieChart, Zap, Layout, Terminal } from 'lucide-react';

enum Tab {
  DASHBOARD = 'Dashboard',
  QUESTS = 'Quests',
  WAR_ROOM = 'War Room',
  STORY = 'System Core',
  ARMORY = 'The Armory',
  CAMPAIGN = 'Campaign',
  ARCHIVES = 'Archives',
  POWERS = 'Feats & Powers',
  BIBLE = 'Bible',
  ORACLE = 'Oracle',
  SANCTUARY = 'Sanctuary',
  COACH = 'Iron Forge',
  HEROES = 'Heroes',
  SKILLS = 'Skills',
  FOCUS = 'Focus Nexus'
}

const App: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>(INITIAL_STATE);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<Tab>(Tab.DASHBOARD);
  const [selectedStat, setSelectedStat] = useState<string | null>(null);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'level-up' | 'death' | 'skill-up' } | null>(null);
  const [oracleInitialInput, setOracleInitialInput] = useState<string>('');
  
  // New System States
  const [showAscension, setShowAscension] = useState(false);
  const [ascendedLevel, setAscendedLevel] = useState(0);
  const [showDaybreak, setShowDaybreak] = useState(false);
  const [daybreakStats, setDaybreakStats] = useState({ daysMissed: 0, hpLoss: 0 });
  
  // Database Stats & Auth
  const [dbInfo, setDbInfo] = useState({ used: '0', quota: '0', percent: 0 });
  const [lastSaved, setLastSaved] = useState<Date>(new Date());
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    const unsubscribe = subscribeToAuth(async (user) => {
      setCurrentUser(user);
      if (user) {
        setStorageUser(user.uid);
        showNotification(`Welcome back, ${user.displayName}`, 'success');
      } else {
        setStorageUser(null);
      }
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const initGame = async () => {
      setIsLoading(true);
      try {
        const loaded = await loadGame();
        
        // Migration Logic
        if (!loaded.user.achievements) loaded.user.achievements = [];
        if (!loaded.user.activeBuffs) loaded.user.activeBuffs = [];
        if (!loaded.user.unlockedFragments) loaded.user.unlockedFragments = [];
        if (!loaded.user.inventory) loaded.user.inventory = [];
        if (loaded.user.credits === undefined) loaded.user.credits = 0;
        if (!loaded.activeBoss && INITIAL_STATE.activeBoss) loaded.activeBoss = INITIAL_STATE.activeBoss;
        if (!loaded.statHistory) loaded.statHistory = [];
        
        // Fix Name if missing
        if (!loaded.user.name) loaded.user.name = 'Player';

        // Data fixes
        if (loaded.quests) {
            loaded.quests = loaded.quests.map(q => ({
               ...q, 
               status: q.status || (q.completed ? 'DONE' : 'TODO') 
            }));
        }

        if (loaded.virtues) {
          loaded.virtues = loaded.virtues.map((v: any, idx: number) => ({ ...v, id: v.id || `virtue-migrated-${Date.now()}-${idx}` }));
        }
        
        const { newState, daysMissed, hpLoss, levelLost, isNewDay } = processDailyDecay(loaded);
        setGameState(newState);
        await saveGame(newState);
        
        // Trigger Daybreak if new day
        if (isNewDay) {
            setDaybreakStats({ daysMissed, hpLoss });
            setShowDaybreak(true);
        } else if (daysMissed > 0) {
           if (levelLost) showNotification(`You missed ${daysMissed} days. LEVEL LOST.`, 'death');
           else showNotification(`You missed ${daysMissed} days. Took ${hpLoss} HP damage.`, 'death');
        }

        getStorageUsage().then(setDbInfo);
      } catch (e) {
        console.error("Initialization error", e);
      } finally {
        setIsLoading(false);
      }
    };
    initGame();
  }, []);

  // Auto-save & Achievement/Story Check
  useEffect(() => {
    if (!isLoading) {
      const timer = setTimeout(() => {
        saveGame(gameState).then(() => { setLastSaved(new Date()); });
      }, 1000);

      // Check Achievements
      const newUnlocks = checkAchievements(gameState);
      if (newUnlocks.length > 0) {
         newUnlocks.forEach(ach => {
            showNotification(`ACHIEVEMENT UNLOCKED: ${ach.title}`, 'level-up');
            audio.play('levelUp');
         });
         setGameState(prev => ({
            ...prev,
            user: {
               ...prev.user,
               achievements: [...prev.user.achievements, ...newUnlocks.map(a => a.id)]
            }
         }));
      }
      
      // Check Story
      const storyUnlocks = checkStoryUnlocks(gameState);
      if (storyUnlocks.length > 0) {
         storyUnlocks.forEach(s => {
            showNotification(`SYSTEM DECRYPTED: ${s.title}`, 'success');
            audio.play('success');
         });
         setGameState(prev => ({
            ...prev,
            user: {
               ...prev.user,
               unlockedFragments: [...prev.user.unlockedFragments, ...storyUnlocks.map(s => s.id)]
            }
         }));
      }

      return () => clearTimeout(timer);
    }
  }, [gameState, isLoading]);

  const showNotification = (message: string, type: 'success' | 'level-up' | 'death' | 'skill-up') => {
    setNotification({ message, type });
    if (type === 'death') audio.play('error');
    else if (type === 'skill-up') audio.play('success');
    else if (type === 'level-up') audio.play('levelUp');
    setTimeout(() => setNotification(null), 4000);
  };

  const handleNav = (tab: Tab) => {
    audio.play('click');
    setActiveTab(tab);
    setSelectedStat(null);
    setShowMobileMenu(false);
  };

  const handleLogin = async () => {
    const user = await signInWithGoogle();
    if (user) {
      const cloudData = await loadFromCloud(user.uid);
      if (cloudData) {
          // Simple merge strategy: Cloud overwrites local if found for now
          // In a real app, you'd ask the user or check timestamps
          if (confirm("Cloud save found. Load it? (This overwrites local progress)")) {
             setGameState(cloudData);
             await saveGame(cloudData);
             showNotification("System Sync Complete", 'success');
          }
      }
    }
  };

  const handleLogout = async () => { 
      await logOut(); 
      setCurrentUser(null);
      setStorageUser(null);
      showNotification("System Disconnected", 'success'); 
  };

  const handleDaybreakComplete = (mainQuestTitle: string) => {
     setShowDaybreak(false);
     const mainQuest: Quest = {
        id: `q-daily-${Date.now()}`,
        title: `PRIME DIRECTIVE: ${mainQuestTitle}`,
        description: "Your one non-negotiable task for the day.",
        type: StatType.INT, 
        difficulty: 'Hard',
        xpReward: 100,
        creditReward: 50,
        completed: false,
        status: 'TODO',
        repeatable: false,
        tags: ['daily', 'priority']
     };
     setGameState(prev => ({
        ...prev,
        user: { ...prev.user, credits: prev.user.credits + 50 }, 
        quests: [mainQuest, ...prev.quests]
     }));
     showNotification("Protocol Complete. +50 Credits.", 'success');
  };

  const handleActivatePower = (power: Power) => {
      if (gameState.user.credits < power.cost) {
         showNotification("Insufficient Credits", "death");
         return;
      }
      setGameState(prev => ({
         ...prev,
         user: {
            ...prev.user,
            credits: prev.user.credits - power.cost,
            activeBuffs: [
               ...prev.user.activeBuffs, 
               { powerId: power.id, startTime: Date.now(), endTime: Date.now() + (power.durationMinutes * 60000) }
            ]
         }
      }));
      audio.play('levelUp'); 
      showNotification(`${power.name} ACTIVATED!`, 'success');
  };
  
  const handleQuestStatusUpdate = (questId: string, status: 'TODO' | 'IN_PROGRESS' | 'DONE') => {
     setGameState(prev => ({
        ...prev,
        quests: prev.quests.map(q => q.id === questId ? { ...q, status } : q)
     }));
  };

  // Quest Logic Updated with Buffs
  const handleQuestComplete = useCallback((questId: string) => {
    setGameState(prev => {
      const quest = prev.quests.find(q => q.id === questId);
      if (!quest) return prev;

      const loot = rollLoot();
      let xpBase = quest.xpReward * loot.multiplier;
      
      // Check Active Buffs
      const activeBuffs = calculateActiveBuffs(prev.user);
      const xpBoost = activeBuffs.find(b => POWERS.find(p => p.id === b.powerId)?.type === 'XP_BOOST');
      
      if (xpBoost) {
         const power = POWERS.find(p => p.id === xpBoost.powerId);
         if (power?.multiplier) xpBase *= power.multiplier;
      }

      let xpGain = Math.floor(xpBase);
      let message = loot.message;
      if (xpBoost) message += " (Boosted!)";

      let newCredits = prev.user.credits + (quest.creditReward || 10);
      let newInventory = [...prev.user.inventory];
      if (loot.item) { newInventory.push(loot.item); message = `Acquired: ${loot.item.name}`; }
      
      // Boss Logic
      let updatedBoss = prev.activeBoss ? { ...prev.activeBoss } : null;
      if (updatedBoss && updatedBoss.active && (quest.linkedBossId === updatedBoss.id || quest.isBossDamage)) {
         let damage = quest.difficulty === 'Legendary' ? 100 : 50;
         
         // Berserker Buff
         const damageBoost = activeBuffs.find(b => POWERS.find(p => p.id === b.powerId)?.type === 'DAMAGE_BOOST');
         if (damageBoost) damage *= 2;

         updatedBoss.hp = Math.max(0, updatedBoss.hp - damage);
         if (updatedBoss.hp === 0) {
            updatedBoss.defeated = true; updatedBoss.active = false;
            message = `CAMPAIGN COMPLETE! ${updatedBoss.name} Defeated!`;
            xpGain += 1000; newCredits += 500;
         } else { message = `Progress Made: ${updatedBoss.name} (-${damage} HP)`; }
      }
      
      // Skill Logic
      let updatedSubSkills = [...prev.user.subSkills];
      let skillLeveledUp = false;
      let skillName = "";
      let skillLevelUps = 0;
      let skillIndex = -1;
      if (quest.skillId) skillIndex = updatedSubSkills.findIndex(s => s.id === quest.skillId);
      if (skillIndex === -1 && quest.skillName) skillIndex = updatedSubSkills.findIndex(s => s.name === quest.skillName);
      if (skillIndex !== -1) {
          const skill = { ...updatedSubSkills[skillIndex] };
          skill.xp += quest.xpReward; 
          let skillXpNeeded = calculateSkillXpForNextLevel(skill.level);
          while (skill.xp >= skillXpNeeded) {
              skill.level += 1; skill.xp = skill.xp - skillXpNeeded; skillLevelUps++;
              skillXpNeeded = calculateSkillXpForNextLevel(skill.level);
          }
          if (skillLevelUps > 0) {
              skillLeveledUp = true; skillName = skill.name;
              const totalBonus = SKILL_LEVEL_UP_BONUS_XP * skillLevelUps;
              xpGain += totalBonus;
              if(!updatedBoss?.defeated) message = `Skill Rank Up! +${totalBonus} XP Bonus!`;
          }
          updatedSubSkills[skillIndex] = skill;
      }

      let newXp = prev.user.xp + xpGain;
      let newLevel = prev.user.level;
      let leveledUp = false;
      while (checkLevelUp(newXp, newLevel)) {
        const xpNeededForCurrent = calculateXpForNextLevel(newLevel);
        newXp = newXp - xpNeededForCurrent;
        newLevel++;
        leveledUp = true;
      }
      
      if (leveledUp) {
          setAscendedLevel(newLevel);
          setShowAscension(true);
          audio.play('levelUp');
      } else {
          if (updatedBoss?.defeated) showNotification(`VICTORY! ${updatedBoss.name} has fallen!`, 'level-up');
          else if (skillLeveledUp) showNotification(`${skillName} reached Rank ${updatedSubSkills.find(s => s.name === skillName)?.level}!`, 'skill-up');
          else {
             showNotification(message, loot.result === 'JACKPOT' ? 'level-up' : 'success');
             audio.play('complete');
          }
      }

      return {
        ...prev,
        user: {
          ...prev.user, xp: newXp, level: newLevel, credits: newCredits, attributes: prev.user.attributes, 
          subSkills: updatedSubSkills, inventory: newInventory, streak: prev.user.streak + 1, 
          hp: Math.min(prev.user.maxHp, prev.user.hp + 5) 
        },
        activeBoss: updatedBoss,
        quests: prev.quests.map(q => q.id === questId ? { ...q, completed: true, status: 'DONE' } : q)
      };
    });
  }, []);

  const handleBuyItem = (item: Item) => { setGameState(prev => prev.user.credits >= item.price ? { ...prev, user: { ...prev.user, credits: prev.user.credits - item.price, inventory: [...prev.user.inventory, item] } } : prev); };
  const handleUseItem = (item: Item) => { if(item.type==='LOOTBOX'){const r=openLootBox(item); setGameState(prev=>{const inv=[...prev.user.inventory];inv.splice(inv.findIndex(i=>i.id===item.id),1);inv.push(r);return{...prev,user:{...prev.user,inventory:inv}}}); showNotification(`Opened ${item.name}`, 'success');} else if(item.type==='CONSUMABLE'){setGameState(prev=>applyItemEffect(prev,item));} };
  const handleAddVirtue = (v: Virtue) => setGameState(prev => ({ ...prev, virtues: [...prev.virtues, { ...v, id: v.id || `v-${Date.now()}` }] }));
  const handleUpdateVirtue = (v: Virtue) => setGameState(prev => ({ ...prev, virtues: prev.virtues.map(old => old.id === v.id ? v : old) }));
  const handleDeleteVirtue = (id: string) => setGameState(prev => ({ ...prev, virtues: prev.virtues.filter(v => v.id !== id) }));
  const handleToggleVirtue = (id: string, i: number) => setGameState(prev => ({ ...prev, virtues: prev.virtues.map(v => v.id === id ? { ...v, adherence: v.adherence.map((b, idx) => idx === i ? !b : b) } : v) }));
  const handleSaveBible = (c: string) => { setGameState(prev => ({ ...prev, bible: c })); showNotification('Bible Saved', 'success'); };
  const handleAddSkill = (s: string, n: string) => setGameState(prev => ({ ...prev, user: { ...prev.user, subSkills: [...prev.user.subSkills, { id: `s-${Date.now()}`, name: n, parentStat: s, level: 1, xp: 0 }] } }));
  const handleDeleteSkill = (id: string) => setGameState(prev => ({ ...prev, user: { ...prev.user, subSkills: prev.user.subSkills.filter(s => s.id !== id) } }));
  const handleAdoptSkill = (n: string, t: string) => { if(!gameState.user.subSkills.some(s=>s.name.toLowerCase()===n.toLowerCase())) handleAddSkill(t, n); };
  const handleAddHero = (h: Hero) => setGameState(prev => ({ ...prev, heroes: [...prev.heroes, h] }));
  const handleConsultStat = (s: string) => { setOracleInitialInput(`How do I improve my ${s}?`); setActiveTab(Tab.ORACLE); setSelectedStat(null); };
  const handleSummonHero = () => { setOracleInitialInput("Summon a legendary hero."); setActiveTab(Tab.ORACLE); };
  const handleAddGoal = (g: Goal) => setGameState(prev => ({ ...prev, goals: [...prev.goals, g] }));
  const handleAddCustomAttribute = (n: string, c: string, b: string) => setGameState(prev => ({ ...prev, user: { ...prev.user, customAttributes: [...prev.user.customAttributes, { id: `attr-${Date.now()}`, name: n, value: 1, color: c, bgColor: b }] } }));
  const handleUpdateBiometrics = (h: number, w: number) => setGameState(prev => ({ ...prev, user: { ...prev.user, height: h, weight: w } }));
  const handleUpdateAvatar = (u: string) => setGameState(prev => ({ ...prev, user: { ...prev.user, avatarUrl: u } }));
  const handleUpdateName = (n: string) => setGameState(prev => ({ ...prev, user: { ...prev.user, name: n } }));
  const handleUpdateBirthDate = (d: string) => setGameState(prev => ({ ...prev, user: { ...prev.user, birthDate: d } }));
  const handleAddManualVirtue = () => handleAddVirtue({ id: `v-${Date.now()}`, name: 'New Virtue', description: '...', adherence: Array(7).fill(false) });
  const handleAddQuest = (quest: Quest) => { setGameState(prev => ({ ...prev, quests: [quest, ...prev.quests] })); showNotification('New Quest Accepted', 'success'); };
  const handleCreateCampaign = (boss: Boss, subQuests: Quest[]) => { setGameState(prev => ({ ...prev, activeBoss: boss, quests: [...subQuests, ...prev.quests] })); showNotification("CAMPAIGN INITIALIZED", 'level-up'); };
  const handleForceSave = async () => { await saveGame(gameState); setLastSaved(new Date()); showNotification("Database Synced", 'success'); };
  const handleReset = async () => { if (confirm("Are you sure? This will delete your local data.")) { await clearSave(); } };
  const handleExport = async () => { const data = await exportSaveData(); const blob = new Blob([data], { type: 'application/json' }); const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = 'ludus_save.json'; a.click(); };
  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => { const file = e.target.files?.[0]; if (!file) return; const reader = new FileReader(); reader.onload = async (ev) => { const json = ev.target?.result as string; if (await importSaveData(json)) { setGameState(await loadGame()); showNotification("Restored", 'success'); }}; reader.readAsText(file); };

  const handleLogTime = (m: number, a: string, c: string) => {
      const newLog: TimeLog = { id: `log-${Date.now()}`, timestamp: Date.now(), durationMinutes: m, activity: a, category: c as any };
      const xpAward = Math.ceil(m * 0.8);
      setGameState(prev => {
          let newXp = prev.user.xp + xpAward;
          // XP Check stub
          return { ...prev, timeLogs: [...prev.timeLogs, newLog], user: { ...prev.user, xp: newXp } };
      });
      showNotification(`Logged: +${xpAward} XP`, 'success');
  };

  const NavItem = ({ tab, icon, label }: { tab: Tab; icon: React.ReactNode; label: string }) => (
    <button onClick={() => handleNav(tab)} className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all w-full text-left font-mono ${activeTab === tab ? 'bg-gold text-black font-bold shadow-gold/20 shadow-lg' : 'text-gray-400 hover:bg-white/5 hover:text-white'}`}>{icon}<span>{label}</span></button>
  );

  if (isLoading) return <div className="min-h-screen bg-void flex items-center justify-center text-gold animate-pulse">INITIALIZING...</div>;

  return (
    <div className="min-h-screen bg-void text-gray-200 flex font-sans selection:bg-gold selection:text-black overflow-hidden">
      {showDaybreak && <DaybreakProtocol daysMissed={daybreakStats.daysMissed} hpLoss={daybreakStats.hpLoss} onComplete={handleDaybreakComplete} />}
      {showAscension && <AscensionModal newLevel={ascendedLevel} onClose={() => setShowAscension(false)} />}

      <aside className="hidden lg:flex flex-col w-64 bg-void-light/90 backdrop-blur-xl border-r border-gray-700 p-6 fixed h-full z-20 shadow-2xl">
        <div className="flex items-center gap-3 mb-10 px-2 text-2xl font-bold tracking-tighter text-white">LUDUS<span className="text-gold">VITAE</span></div>
        
        {currentUser && (
          <div className="mb-6 px-3 py-2 bg-gray-900 rounded-lg border border-green-500/30 flex items-center gap-3">
             <div className="w-8 h-8 rounded-full bg-green-900 text-green-400 flex items-center justify-center font-bold border border-green-500/50">
               {currentUser.photoURL ? <img src={currentUser.photoURL} className="w-full h-full rounded-full" /> : <User size={16} />}
             </div>
             <div className="overflow-hidden">
               <div className="text-[10px] text-gray-500 uppercase font-bold">Logged In</div>
               <div className="text-xs text-white truncate w-32 font-mono">{currentUser.displayName}</div>
             </div>
          </div>
        )}

        <nav className="space-y-2 flex-1 overflow-y-auto custom-scrollbar">
          <NavItem tab={Tab.DASHBOARD} icon={<LayoutDashboard size={20} />} label="Dashboard" />
          <NavItem tab={Tab.WAR_ROOM} icon={<Layout size={20} />} label="War Room" />
          <NavItem tab={Tab.QUESTS} icon={<Scroll size={20} />} label="Quest Log" />
          <NavItem tab={Tab.ARMORY} icon={<ShoppingBag size={20} />} label="The Armory" />
          <NavItem tab={Tab.POWERS} icon={<Zap size={20} />} label="Feats & Powers" />
          <NavItem tab={Tab.CAMPAIGN} icon={<Sword size={20} />} label="Campaign" />
          <NavItem tab={Tab.SKILLS} icon={<Activity size={20} />} label="Skills" />
          <NavItem tab={Tab.HEROES} icon={<Trophy size={20} />} label="Hall of Heroes" />
          <NavItem tab={Tab.FOCUS} icon={<Hourglass size={20} />} label="Focus Nexus" />
          <div className="my-4 border-t border-gray-700 mx-2"></div>
          <NavItem tab={Tab.ARCHIVES} icon={<PieChart size={20} />} label="The Archives" />
          <NavItem tab={Tab.STORY} icon={<Terminal size={20} />} label="System Core" />
          <NavItem tab={Tab.BIBLE} icon={<Book size={20} />} label="Personal Bible" />
          <NavItem tab={Tab.SANCTUARY} icon={<Heart size={20} />} label="The Sanctuary" />
          <NavItem tab={Tab.COACH} icon={<Flame size={20} />} label="The Iron Forge" />
          <NavItem tab={Tab.ORACLE} icon={<Sparkles size={20} />} label="The Oracle" />
        </nav>
        <button onClick={() => setShowSettings(true)} className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-400 hover:text-white w-full font-mono text-sm mt-4"><Settings size={18} /><span>System</span></button>
      </aside>

      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 bg-void-light/95 backdrop-blur-md border-b border-gray-700 p-4 z-50 flex justify-between items-center shadow-lg">
        <div className="font-bold text-white">LUDUS<span className="text-gold">VITAE</span></div>
        <button onClick={() => setShowMobileMenu(!showMobileMenu)}><Menu size={24} className="text-white"/></button>
      </div>
      
      {/* Mobile Menu */}
      {showMobileMenu && (
        <div className="lg:hidden fixed inset-0 bg-void z-40 pt-20 px-6 overflow-y-auto">
          <nav className="space-y-2">
             <NavItem tab={Tab.DASHBOARD} icon={<LayoutDashboard size={20} />} label="Dashboard" />
             <NavItem tab={Tab.WAR_ROOM} icon={<Layout size={20} />} label="War Room" />
             <NavItem tab={Tab.QUESTS} icon={<Scroll size={20} />} label="Quest Log" />
             <NavItem tab={Tab.ARMORY} icon={<ShoppingBag size={20} />} label="The Armory" />
             <NavItem tab={Tab.POWERS} icon={<Zap size={20} />} label="Feats & Powers" />
             <NavItem tab={Tab.CAMPAIGN} icon={<Sword size={20} />} label="Campaign" />
             <NavItem tab={Tab.HEROES} icon={<Trophy size={20} />} label="Hall of Heroes" />
             <NavItem tab={Tab.SKILLS} icon={<Activity size={20} />} label="Skills" />
             <NavItem tab={Tab.FOCUS} icon={<Hourglass size={20} />} label="Focus Nexus" />
             <NavItem tab={Tab.ARCHIVES} icon={<PieChart size={20} />} label="The Archives" />
             <NavItem tab={Tab.STORY} icon={<Terminal size={20} />} label="System Core" />
             <button onClick={() => {setShowSettings(true); setShowMobileMenu(false)}} className="flex items-center gap-3 px-4 py-3 rounded-lg transition-all w-full text-left font-mono text-gray-400"><Settings size={20} /><span>System</span></button>
          </nav>
        </div>
      )}

      {/* Settings Modal */}
      {showSettings && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-fade-in">
           <div className="bg-void-light border border-gray-700 rounded-2xl p-8 w-full max-w-md relative shadow-2xl max-h-[90vh] overflow-y-auto">
             <button onClick={() => setShowSettings(false)} className="absolute top-4 right-4 text-gray-400 hover:text-white"><X size={20}/></button>
             <h2 className="text-2xl font-bold text-white font-mono mb-6 flex items-center gap-2">
               <Settings className="text-gold" /> System Config
             </h2>
             <div className="space-y-6">
                
                {/* Cloud Uplink Section */}
                <div className="bg-gray-900/50 p-4 rounded-xl border border-gray-700">
                   <div className="flex items-center gap-2 mb-3 text-xs font-bold text-gray-500 uppercase tracking-widest">
                      <Cloud size={12} className="text-blue-400" /> Cloud Uplink
                   </div>
                   {currentUser ? (
                     <div className="space-y-3">
                        <div className="flex items-center gap-3 bg-black/30 p-2 rounded-lg border border-gray-700">
                           {currentUser.photoURL ? <img src={currentUser.photoURL} className="w-8 h-8 rounded-full border border-blue-500"/> : <User size={24} />}
                           <div className="overflow-hidden">
                             <div className="text-[9px] text-green-500 font-bold uppercase">Connected</div>
                             <span className="text-xs text-white font-mono truncate block w-full">{currentUser.displayName}</span>
                           </div>
                        </div>
                        <button onClick={handleLogout} className="w-full bg-red-900/20 text-red-400 border border-red-900/50 py-2 rounded font-mono text-xs hover:bg-red-900/40 flex items-center justify-center gap-2 font-bold uppercase transition-all">
                          <LogOut size={12} /> Disconnect
                        </button>
                     </div>
                   ) : (
                     <button onClick={handleLogin} className="w-full bg-blue-600 hover:bg-blue-500 text-white py-3 rounded font-mono text-xs font-bold flex items-center justify-center gap-2 uppercase tracking-wider shadow-[0_0_15px_rgba(37,99,235,0.4)] transition-all">
                        <LogIn size={14} /> Connect Google
                     </button>
                   )}
                </div>

                {/* Storage & Backup */}
                <div className="bg-gray-900/50 p-4 rounded-xl border border-gray-700">
                   <div className="flex items-center gap-2 mb-3 text-xs font-bold text-gray-500 uppercase tracking-widest"><Database size={12} className="text-cyan-400" /> Local Storage</div>
                   <div className="flex justify-between items-center mb-2">
                     <span className="text-gray-400 text-xs font-mono">Used: {dbInfo.used} MB</span>
                     <span className="text-gray-400 text-xs font-mono">Last Sync: {lastSaved.toLocaleTimeString()}</span>
                   </div>
                   <button onClick={handleForceSave} className="w-full bg-gray-800 hover:bg-gray-700 text-white py-2 rounded font-mono text-xs border border-gray-600 mb-3 flex items-center justify-center gap-2">
                      <Save size={12} /> Force Save
                   </button>
                   
                   <div className="flex gap-2">
                      <button onClick={handleExport} className="flex-1 bg-gray-800 hover:bg-gray-700 text-gray-300 py-2 rounded font-mono text-[10px] border border-gray-600 flex items-center justify-center gap-1">
                         <Download size={10} /> Export
                      </button>
                      <label className="flex-1 bg-gray-800 hover:bg-gray-700 text-gray-300 py-2 rounded font-mono text-[10px] border border-gray-600 flex items-center justify-center gap-1 cursor-pointer">
                         <Upload size={10} /> Import
                         <input type="file" className="hidden" onChange={handleImport}/>
                      </label>
                   </div>
                </div>

                {/* Danger Zone */}
                <div className="pt-2">
                  <button onClick={handleReset} className="w-full text-red-500 py-2 rounded font-mono text-[10px] hover:bg-red-900/10 transition-colors flex items-center justify-center gap-2 uppercase tracking-wider opacity-60 hover:opacity-100">
                    <Trash2 size={12} /> Factory Reset System
                  </button>
                </div>
             </div>
           </div>
        </div>
      )}

      <main className="flex-1 lg:ml-64 p-3 lg:p-8 pt-20 lg:pt-8 max-w-7xl mx-auto w-full overflow-y-auto h-screen custom-scrollbar">
        {notification && !showAscension && !showDaybreak && (
          <div className={`fixed top-6 right-6 z-[90] pl-4 pr-6 py-4 rounded-xl shadow-2xl border backdrop-blur-md animate-slide-in flex items-center gap-4 min-w-[300px] ${
            notification.type === 'death' ? 'bg-red-950/80 border-red-500 text-red-200 shadow-red-900/50' :
            notification.type === 'level-up' ? 'bg-purple-950/80 border-purple-400 text-purple-100 shadow-purple-900/50' :
            notification.type === 'skill-up' ? 'bg-blue-950/80 border-cyan-400 text-cyan-100 shadow-cyan-900/50' :
            'bg-zinc-900/90 border-gold text-gold shadow-yellow-900/30'
          }`}>
             <div className={`p-2 rounded-full ${notification.type === 'death' ? 'bg-red-500/20 text-red-500' : 'bg-gold/20 text-gold'}`}>
               {notification.type === 'death' ? <Skull size={24} /> : <Sparkles size={24} />}
             </div>
             <div>
               <div className="font-black font-mono uppercase tracking-widest text-[10px] opacity-70 mb-0.5">SYSTEM ALERT</div>
               <div className="font-bold text-sm leading-tight">{notification.message}</div>
             </div>
          </div>
        )}
        
        {selectedStat ? (
            <StatDetail stat={selectedStat} user={gameState.user} quests={gameState.quests} goals={gameState.goals} onBack={() => setSelectedStat(null)} onAddSkill={handleAddSkill} onDeleteSkill={handleDeleteSkill} onRequestQuest={handleConsultStat} onAddGoal={handleAddGoal} />
        ) : activeTab === Tab.DASHBOARD ? (
            <div className="space-y-6 animate-fade-in pb-24">
              <CharacterSheet user={gameState.user} onSelectStat={setSelectedStat} onAddCustomStat={handleAddCustomAttribute} onConsultStat={handleConsultStat} onUpdateAvatar={handleUpdateAvatar} onUpdateName={handleUpdateName} />
              <div className="glass rounded-xl p-4 md:p-6 shadow-xl border border-gray-700">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-bold text-white font-mono">Active Quests</h2>
                  <button onClick={() => handleNav(Tab.QUESTS)} className="text-sm text-gold hover:underline font-bold">View All</button>
                </div>
                <div className="flex flex-col gap-4">
                  {gameState.quests.filter(q => !q.completed).slice(0, 4).map(q => (
                    <QuestCard key={q.id} quest={q} onComplete={handleQuestComplete} />
                  ))}
                </div>
              </div>
            </div>
        ) : activeTab === Tab.WAR_ROOM ? (
             <TheWarRoom quests={gameState.quests} onUpdateStatus={handleQuestStatusUpdate} onComplete={handleQuestComplete} />
        ) : activeTab === Tab.STORY ? (
             <StoryMode gameState={gameState} />
        ) : activeTab === Tab.QUESTS ? (
             <div className="animate-fade-in pb-24"><div className="flex flex-col gap-4 max-w-3xl mx-auto">{gameState.quests.map(q => <QuestCard key={q.id} quest={q} onComplete={handleQuestComplete} />)}</div></div>
        ) : activeTab === Tab.ARMORY ? (
             <TheArmory gameState={gameState} onBuyItem={handleBuyItem} onUseItem={handleUseItem} />
        ) : activeTab === Tab.POWERS ? (
             <FeatsAndPowers gameState={gameState} onActivatePower={handleActivatePower} />
        ) : activeTab === Tab.CAMPAIGN ? (
             <TheCampaign boss={gameState.activeBoss} quests={gameState.quests} onCompleteQuest={handleQuestComplete} onAddObjective={handleAddQuest} />
        ) : activeTab === Tab.ARCHIVES ? (
             <TheArchives gameState={gameState} />
        ) : activeTab === Tab.BIBLE ? (
             <div className="flex flex-col gap-8 animate-fade-in pb-24"><BibleEditor content={gameState.bible} onSave={handleSaveBible} onAddVirtue={handleAddVirtue}/><VirtueGrid virtues={gameState.virtues} onToggle={handleToggleVirtue} onUpdate={handleUpdateVirtue} onDelete={handleDeleteVirtue} onAdd={handleAddManualVirtue}/></div>
        ) : activeTab === Tab.ORACLE ? (
             <div className="animate-fade-in pb-24"><Oracle gameState={gameState} onAddQuest={handleAddQuest} onAddVirtue={handleAddVirtue} onAddHero={handleAddHero} onPlanCampaign={handleCreateCampaign} initialInput={oracleInitialInput}/></div>
        ) : activeTab === Tab.SANCTUARY ? (
             <div className="animate-fade-in pb-24"><Sanctuary gameState={gameState} onAddQuest={handleAddQuest} /></div>
        ) : activeTab === Tab.COACH ? (
             <div className="animate-fade-in pb-24"><BioArchitect gameState={gameState} onAddQuest={handleAddQuest} onUpdateBiometrics={handleUpdateBiometrics}/></div>
        ) : activeTab === Tab.HEROES ? (
             <HeroesGallery heroes={gameState.heroes} userStats={gameState.user} onSummonHero={handleSummonHero} onAdoptSkill={handleAdoptSkill}/>
        ) : activeTab === Tab.SKILLS ? (
             <SkillsMastery userStats={gameState.user} />
        ) : (
             <FocusNexus gameState={gameState} onLogTime={handleLogTime} onUpdateBirthDate={handleUpdateBirthDate}/>
        )}
      </main>
    </div>
  );
};

export default App;
