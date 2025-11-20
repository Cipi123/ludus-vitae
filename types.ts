
export enum StatType {
  STR = 'Strength',
  DEX = 'Dexterity',
  INT = 'Intelligence',
  CHA = 'Charisma',
  CON = 'Constitution'
}

export interface CustomAttribute {
  id: string;
  name: string;
  value: number;
  color: string; 
  bgColor: string; 
}

export interface SubSkill {
  id: string;
  name: string;
  parentStat: string; 
  level: number;
  xp: number;
}

export interface Item {
  id: string;
  name: string;
  description: string;
  type: 'CONSUMABLE' | 'ARTIFACT' | 'COSMETIC' | 'LOOTBOX';
  rarity: 'COMMON' | 'RARE' | 'LEGENDARY';
  effect?: {
    type: 'HEAL' | 'XP_BOOST' | 'FREEZE_STREAK' | 'RESTORE_MANA';
    value: number;
  };
  price: number; 
  icon: string; 
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  condition: (stats: UserStats) => boolean;
  unlocked: boolean;
}

export interface Power {
  id: string;
  name: string;
  description: string;
  cost: number;
  durationMinutes: number;
  type: 'XP_BOOST' | 'DAMAGE_BOOST' | 'TIME_WARP';
  multiplier?: number;
  icon: string;
  color: string;
}

export interface ActiveBuff {
  powerId: string;
  startTime: number;
  endTime: number;
}

export interface StoryFragment {
  id: string;
  title: string;
  content: string;
  unlockLevel: number;
  read: boolean;
}

export type PlayerClass = 'NONE' | 'SHADOW_MONARCH' | 'ARCHITECT' | 'OPERATOR' | 'TITAN';

export interface UserStats {
  name: string; // Added name field
  level: number;
  playerClass: PlayerClass; 
  xp: number;
  hp: number;
  maxHp: number;
  credits: number;
  attributes: {
    [key in StatType]: number;
  };
  customAttributes: CustomAttribute[];
  subSkills: SubSkill[];
  inventory: Item[];
  achievements: string[];
  activeBuffs: ActiveBuff[];
  unlockedFragments: string[];
  streak: number;
  height: number;
  weight: number;
  birthDate?: string; 
  avatarUrl?: string; 
}

export interface Goal {
  id: string;
  targetType: 'STAT' | 'SKILL';
  targetId: string; 
  targetName: string; 
  targetLevel: number;
  completed: boolean;
}

export interface Quest {
  id: string;
  title: string;
  description: string;
  type: string; 
  skillId?: string; 
  skillName?: string; 
  linkedBossId?: string; 
  xpReward: number;
  creditReward: number; 
  completed: boolean;
  status: 'TODO' | 'IN_PROGRESS' | 'DONE'; 
  repeatable: boolean;
  difficulty: 'Easy' | 'Medium' | 'Hard' | 'Legendary';
  tags?: string[]; 
  isBossDamage?: boolean; 
}

export interface SkillNode {
  id: string;
  title: string;
  description: string;
  unlocked: boolean;
  statReq: Partial<Record<StatType, number>>;
  parentId?: string;
}

export interface Virtue {
  id: string;
  name: string;
  description: string;
  adherence: boolean[]; 
}

export interface JournalEntry {
  id: string;
  date: string;
  content: string;
  tags: string[];
  moodScore?: number; 
}

export interface TimeLog {
  id: string;
  timestamp: number; 
  durationMinutes: number;
  activity: string;
  category: 'FOCUS' | 'LEARNING' | 'WORK' | 'EXERCISE' | 'OTHER';
}

export interface HeroSkill {
  name: string;
  type: string; 
}

export interface Hero {
  id: string;
  name: string;
  title: string;
  description: string; 
  imageUrl?: string; 
  stats: {
    [key in StatType]: number; 
  };
  skills: HeroSkill[]; 
  tags: string[]; 
  quotes: string[]; 
}

export interface Boss {
  id: string;
  name: string;
  title: string; 
  description: string;
  hp: number;
  maxHp: number;
  imageUrl: string;
  rewards: Item[];
  stages: number; 
  currentStage: number;
  active: boolean;
  defeated: boolean;
  objectives: string[]; 
}

export interface StatSnapshot {
  date: string; 
  stats: { [key in StatType]: number };
  totalXp: number;
  credits: number;
}

export interface GameState {
  user: UserStats;
  quests: Quest[];
  skills: SkillNode[];
  virtues: Virtue[];
  heroes: Hero[];
  goals: Goal[];
  bible: string; 
  journal: JournalEntry[];
  timeLogs: TimeLog[]; 
  statHistory: StatSnapshot[];
  activeBoss: Boss | null;
  lastActiveDate: string;
}

export type LootResult = 'STANDARD' | 'CRITICAL' | 'JACKPOT';
