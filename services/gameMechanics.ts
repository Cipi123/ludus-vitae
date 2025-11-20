
import { XP_BASE, XP_EXPONENT, GAME_ITEMS, ACHIEVEMENTS, STORY_FRAGMENTS } from '../constants';
import { LootResult, GameState, Item, Achievement, UserStats, StoryFragment } from '../types';

export const calculateXpForNextLevel = (currentLevel: number): number => {
  return Math.floor(XP_BASE * Math.pow(currentLevel, XP_EXPONENT));
};

export const checkLevelUp = (currentXp: number, currentLevel: number): boolean => {
  const required = calculateXpForNextLevel(currentLevel);
  return currentXp >= required;
};

export const calculateSkillXpForNextLevel = (currentLevel: number): number => {
  return 100 * currentLevel;
};

export const checkSkillLevelUp = (currentXp: number, currentLevel: number): boolean => {
  return currentXp >= calculateSkillXpForNextLevel(currentLevel);
};

export const rollLoot = (): { result: LootResult; multiplier: number; message: string; item?: Item } => {
  const roll = Math.random();
  
  if (roll > 0.95) {
    const legendaryItems = GAME_ITEMS.filter(i => i.rarity === 'LEGENDARY');
    const item = legendaryItems.length > 0 ? legendaryItems[Math.floor(Math.random() * legendaryItems.length)] : undefined;
    return { result: 'JACKPOT', multiplier: 5, message: 'LEGENDARY SUCCESS! You found a Rare Artifact.', item };
  } else if (roll > 0.85) {
     const rareItems = GAME_ITEMS.filter(i => i.rarity === 'RARE' || i.rarity === 'COMMON');
     const item = rareItems.length > 0 ? rareItems[Math.floor(Math.random() * rareItems.length)] : undefined;
     return { result: 'CRITICAL', multiplier: 2, message: 'CRITICAL SUCCESS! Item Found.', item };
  } else if (roll > 0.6) {
    return { result: 'CRITICAL', multiplier: 2, message: 'CRITICAL SUCCESS! Double XP gained.' };
  } else {
    return { result: 'STANDARD', multiplier: 1, message: 'Task Complete.' };
  }
};

export const openLootBox = (box: Item): Item => {
  const pool = GAME_ITEMS.filter(i => i.type !== 'LOOTBOX');
  const legendary = pool.filter(i => i.rarity === 'LEGENDARY');
  const rare = pool.filter(i => i.rarity === 'RARE');
  const common = pool.filter(i => i.rarity === 'COMMON');

  let roll = Math.random();

  if (box.rarity === 'LEGENDARY') {
    return roll > 0.2 && legendary.length ? legendary[Math.floor(Math.random() * legendary.length)] : rare[Math.floor(Math.random() * rare.length)];
  } else if (box.rarity === 'RARE') {
    if (roll > 0.95 && legendary.length) return legendary[Math.floor(Math.random() * legendary.length)];
    if (roll > 0.45 && rare.length) return rare[Math.floor(Math.random() * rare.length)];
    return common[Math.floor(Math.random() * common.length)];
  } else {
    if (roll > 0.99 && legendary.length) return legendary[Math.floor(Math.random() * legendary.length)];
    if (roll > 0.90 && rare.length) return rare[Math.floor(Math.random() * rare.length)];
    return common[Math.floor(Math.random() * common.length)];
  }
};

export const getRankTitle = (level: number): string => {
  if (level < 5) return "Novice";
  if (level < 10) return "Apprentice";
  if (level < 20) return "Journeyman";
  if (level < 50) return "Adept";
  if (level < 80) return "Master";
  return "Grandmaster";
};

export const processDailyDecay = (state: GameState): { newState: GameState; daysMissed: number; hpLoss: number; levelLost: boolean; isNewDay: boolean } => {
  const today = new Date().toISOString().split('T')[0];
  const lastActive = state.lastActiveDate;

  // Snapshot stats for history if it's a new day
  let updatedHistory = [...state.statHistory];
  let isNewDay = false;

  if (lastActive !== today) {
      isNewDay = true;
      updatedHistory.push({
          date: lastActive,
          stats: state.user.attributes,
          totalXp: state.user.xp,
          credits: state.user.credits
      });
      if (updatedHistory.length > 365) updatedHistory.shift();
  }

  if (lastActive === today) {
    return { newState: state, daysMissed: 0, hpLoss: 0, levelLost: false, isNewDay: false };
  }

  const oneDay = 24 * 60 * 60 * 1000;
  const diffDays = Math.round(Math.abs((new Date(today).getTime() - new Date(lastActive).getTime()) / oneDay));

  let newState = { ...state, lastActiveDate: today, statHistory: updatedHistory };
  let hpLoss = 0;
  let daysMissed = 0;
  let levelLost = false;

  if (diffDays > 1) {
    daysMissed = diffDays - 1;
    hpLoss = daysMissed * 10; 
    
    newState.user.hp = Math.max(0, newState.user.hp - hpLoss);
    newState.user.streak = 0; 

    if (newState.user.hp === 0 && newState.user.level > 1) {
      newState.user.level -= 1;
      newState.user.xp = 0; 
      newState.user.hp = 50; 
      levelLost = true;
    } else if (newState.user.hp === 0) {
      newState.user.hp = 10;
    }
  }

  return { newState, daysMissed, hpLoss, levelLost, isNewDay };
};

export const applyItemEffect = (state: GameState, item: Item): GameState => {
   const newUser = { 
     ...state.user,
     inventory: [...state.user.inventory],
     attributes: { ...state.user.attributes } 
   };
   
   if (item.effect) {
       switch (item.effect.type) {
           case 'HEAL':
               newUser.hp = Math.min(newUser.maxHp, newUser.hp + item.effect.value);
               break;
           case 'XP_BOOST':
               newUser.xp += item.effect.value;
               break;
           case 'FREEZE_STREAK':
               break;
       }
   }
   
   const index = newUser.inventory.findIndex(i => i.id === item.id);
   if (index > -1) {
       newUser.inventory.splice(index, 1);
   }
   
   return { ...state, user: newUser };
};

export const checkAchievements = (state: GameState): Achievement[] => {
  const unlockedIds = state.user.achievements || [];
  const newUnlocks: Achievement[] = [];

  ACHIEVEMENTS.forEach(ach => {
    if (!unlockedIds.includes(ach.id)) {
      if (ach.condition(state.user)) {
        newUnlocks.push(ach);
      }
    }
  });

  return newUnlocks;
};

export const calculateActiveBuffs = (user: UserStats) => {
  const now = Date.now();
  // Filter expired
  const active = user.activeBuffs?.filter(b => b.endTime > now) || [];
  return active;
};

export const checkStoryUnlocks = (state: GameState): StoryFragment[] => {
  const currentLevel = state.user.level;
  const unlockedIds = state.user.unlockedFragments || [];
  const newUnlocks: StoryFragment[] = [];

  STORY_FRAGMENTS.forEach(frag => {
    if (!unlockedIds.includes(frag.id) && currentLevel >= frag.unlockLevel) {
      newUnlocks.push(frag);
    }
  });

  return newUnlocks;
};
