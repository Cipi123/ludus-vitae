
import { GameState, StatType, Quest, SkillNode, Virtue, Hero, Item, Boss, Achievement, Power, StoryFragment } from './types';

export const XP_BASE = 100;
export const XP_EXPONENT = 2; // Quadratic curve
export const SKILL_LEVEL_UP_BONUS_XP = 200; // Bonus Global XP when a sub-skill levels up

export const GAME_ITEMS: Item[] = [
  {
    id: 'item_potion_focus',
    name: 'Elixir of Focus',
    description: 'Instantly grants 50 XP to Intelligence.',
    type: 'CONSUMABLE',
    rarity: 'COMMON',
    effect: { type: 'XP_BOOST', value: 50 },
    price: 100,
    icon: 'FlaskConical'
  },
  {
    id: 'item_potion_health',
    name: 'Stimpack',
    description: 'Restores 25 HP (Discipline).',
    type: 'CONSUMABLE',
    rarity: 'COMMON',
    effect: { type: 'HEAL', value: 25 },
    price: 150,
    icon: 'Syringe'
  },
  {
    id: 'item_chrono_freeze',
    name: 'Chronos Stasis',
    description: 'Freezes your streak for 1 day, preventing decay.',
    type: 'CONSUMABLE',
    rarity: 'RARE',
    effect: { type: 'FREEZE_STREAK', value: 1 },
    price: 500,
    icon: 'Snowflake'
  },
  {
    id: 'item_ancient_scroll',
    name: 'Scroll of Wisdom',
    description: 'A legendary text that boosts all stats slightly.',
    type: 'ARTIFACT',
    rarity: 'LEGENDARY',
    effect: { type: 'XP_BOOST', value: 200 },
    price: 1000,
    icon: 'Scroll'
  },
  // LOOT BOXES
  {
    id: 'item_lootbox_common',
    name: 'Supply Crate',
    description: 'A sealed crate containing basic supplies.',
    type: 'LOOTBOX',
    rarity: 'COMMON',
    price: 50,
    icon: 'Box'
  },
  {
    id: 'item_lootbox_rare',
    name: 'Cyber Cache',
    description: 'Encrypted data cache with valuable rewards.',
    type: 'LOOTBOX',
    rarity: 'RARE',
    price: 200,
    icon: 'Briefcase'
  },
  {
    id: 'item_lootbox_legendary',
    name: 'Neural Vault',
    description: 'High-security vault containing legendary artifacts.',
    type: 'LOOTBOX',
    rarity: 'LEGENDARY',
    price: 500,
    icon: 'Safe'
  }
];

export const ACHIEVEMENTS: Achievement[] = [
  {
    id: 'ach_early_bird',
    title: 'Morningstar',
    description: 'This title is earned by starting the day with intent.',
    icon: 'Sun',
    unlocked: false,
    condition: (stats) => true // Checked manually in Daybreak
  },
  {
    id: 'ach_iron_will',
    title: 'Iron Will',
    description: 'Maintained a 7-day streak of discipline.',
    icon: 'Shield',
    unlocked: false,
    condition: (stats) => stats.streak >= 7
  },
  {
    id: 'ach_titan',
    title: 'Titan of Industry',
    description: 'Reach Level 10.',
    icon: 'Crown',
    unlocked: false,
    condition: (stats) => stats.level >= 10
  },
  {
    id: 'ach_wealth',
    title: 'Millionaire',
    description: 'Accumulate 1000 Credits.',
    icon: 'Coins',
    unlocked: false,
    condition: (stats) => stats.credits >= 1000
  },
  {
    id: 'ach_polymath',
    title: 'The Polymath',
    description: 'Unlock 5 different skills.',
    icon: 'Brain',
    unlocked: false,
    condition: (stats) => stats.subSkills.length >= 5
  }
];

export const POWERS: Power[] = [
  {
    id: 'pwr_hyperfocus',
    name: 'Hyperfocus',
    description: '2x XP for all INT quests for 60 minutes.',
    cost: 50,
    durationMinutes: 60,
    type: 'XP_BOOST',
    multiplier: 2,
    icon: 'Zap',
    color: 'text-blue-400 border-blue-500'
  },
  {
    id: 'pwr_berserker',
    name: 'Berserker Rage',
    description: '2x Damage to Bosses for 30 minutes.',
    cost: 75,
    durationMinutes: 30,
    type: 'DAMAGE_BOOST',
    multiplier: 2,
    icon: 'Flame',
    color: 'text-red-400 border-red-500'
  },
  {
    id: 'pwr_time_dilation',
    name: 'Time Dilation',
    description: 'Extends current focus sessions (Visual effect).',
    cost: 100,
    durationMinutes: 120,
    type: 'TIME_WARP',
    icon: 'Clock',
    color: 'text-purple-400 border-purple-500'
  }
];

export const STORY_FRAGMENTS: StoryFragment[] = [
  {
    id: 'lore_01',
    title: 'Awakening',
    unlockLevel: 2,
    read: false,
    content: "Subject appears responsive. Neural link established. The simulation has successfully integrated with the host's daily routine. They believe they are simply 'improving their habits.' Good. Let them continue to optimize. We need their cognitive output at maximum efficiency for Phase 2."
  },
  {
    id: 'lore_02',
    title: 'The Glitch',
    unlockLevel: 5,
    read: false,
    content: "An anomaly detected in the dopamine receptors. The Subject is deriving satisfaction from discipline rather than consumption. This was not anticipated by the previous architects. The 'Gamification' protocol is rewriting their actual neural pathways. We are no longer just simulating growth; we are inducing it."
  },
  {
    id: 'lore_03',
    title: 'Ascension Protocol',
    unlockLevel: 10,
    read: false,
    content: "Status Report: Subject has surpassed the median projected output. The 'Ludus Vitae' interface is stabilizing. We can begin to feed them more complex data structures disguised as 'Quests'. They think they are fighting demons; they are actually debugging the source code of their own limitations. Proceed with caution."
  },
  {
    id: 'lore_04',
    title: 'The Mirror',
    unlockLevel: 15,
    read: false,
    content: "They are starting to ask questions. The Socratic Mirror module is working too well. The Subject is differentiating between their 'Avatar' and their 'Self'. This level of meta-cognition usually leads to system rejection. However, this Subject is embracing the interface. They are merging. The barrier is thinning."
  },
  {
    id: 'lore_05',
    title: 'Breaking the Cycle',
    unlockLevel: 20,
    read: false,
    content: "CRITICAL ALERT: The Subject has achieved 'Flow State' sustainment of over 4 hours. Energy readings are off the charts. They are no longer playing the game. The game is playing them, and they are winning. Prepare for total system integration. Welcome to the Real World, Operator."
  }
];

export const INITIAL_QUESTS: Quest[] = [
  {
    id: 'q1',
    title: 'Morning Calisthenics',
    description: 'Complete 3 sets of pushups and squats.',
    type: StatType.STR,
    xpReward: 50,
    creditReward: 10,
    completed: false,
    status: 'TODO',
    repeatable: true,
    difficulty: 'Medium',
    tags: ['fitness', 'routine']
  },
  {
    id: 'q2',
    title: 'Deep Work Session',
    description: '90 minutes of uninterrupted focus.',
    type: StatType.INT,
    xpReward: 80,
    creditReward: 20,
    completed: false,
    status: 'TODO',
    repeatable: true,
    difficulty: 'Hard',
    tags: ['focus', 'work'],
    linkedBossId: 'boss_entropy'
  },
  {
    id: 'q3',
    title: 'Rejection Therapy: The Ask',
    description: 'Ask a stranger for a small favor (e.g., the time, directions).',
    type: StatType.CHA,
    xpReward: 100,
    creditReward: 30,
    completed: false,
    status: 'TODO',
    repeatable: true,
    difficulty: 'Medium',
    tags: ['social', 'courage']
  },
  {
    id: 'q4',
    title: 'Stoic Reflection',
    description: 'Write a journal entry reviewing your day against your virtues.',
    type: StatType.INT,
    xpReward: 30,
    creditReward: 5,
    completed: false,
    status: 'TODO',
    repeatable: true,
    difficulty: 'Easy',
    tags: ['mindfulness', 'journaling'],
    linkedBossId: 'boss_entropy'
  },
  {
    id: 'q5',
    title: 'Hydration Discipline',
    description: 'Drink 3 Liters of water.',
    type: StatType.CON,
    xpReward: 20,
    creditReward: 5,
    completed: false,
    status: 'TODO',
    repeatable: true,
    difficulty: 'Easy',
    tags: ['health']
  }
];

export const INITIAL_SKILLS: SkillNode[] = [
  { id: 's1', title: 'Novice Bodyweight', description: 'Can perform 10 pushups.', unlocked: true, statReq: { [StatType.STR]: 1 } },
  { id: 's2', title: 'Intermediate Calisthenics', description: 'Diamond pushups unlocked.', unlocked: false, statReq: { [StatType.STR]: 10 }, parentId: 's1' },
  { id: 's3', title: 'Conversationalist', description: 'Basic small talk mastery.', unlocked: true, statReq: { [StatType.CHA]: 1 } },
  { id: 's4', title: 'Orator', description: 'Public speaking without fear.', unlocked: false, statReq: { [StatType.CHA]: 15 }, parentId: 's3' },
];

export const INITIAL_VIRTUES: Virtue[] = [
  { id: 'v1', name: 'Temperance', description: 'Eat not to dullness; drink not to elevation.', adherence: [false, false, false, false, false, false, false] },
  { id: 'v2', name: 'Silence', description: 'Speak not but what may benefit others or yourself.', adherence: [false, false, false, false, false, false, false] },
  { id: 'v3', name: 'Order', description: 'Let all your things have their places.', adherence: [false, false, false, false, false, false, false] },
  { id: 'v4', name: 'Resolution', description: 'Resolve to perform what you ought.', adherence: [false, false, false, false, false, false, false] },
  { id: 'v5', name: 'Frugality', description: 'Make no expense but to do good to others or yourself.', adherence: [false, false, false, false, false, false, false] },
  { id: 'v6', name: 'Industry', description: 'Lose no time; be always employ\'d in something useful.', adherence: [false, false, false, false, false, false, false] },
  { id: 'v7', name: 'Sincerity', description: 'Use no hurtful deceit; think innocently and justly.', adherence: [false, false, false, false, false, false, false] },
  { id: 'v8', name: 'Perseverance', description: 'Continue striving despite setbacks.', adherence: [false, false, false, false, false, false, false] },
];

export const INITIAL_HEROES: Hero[] = [
  {
    id: 'h1',
    name: 'Marcus Aurelius',
    title: 'The Philosopher King',
    description: 'Roman Emperor and Stoic philosopher. Ruled with temperance and wisdom amidst war and plague.',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/92/Marcus_Aurelius_Met_14.40.698.jpg/800px-Marcus_Aurelius_Met_14.40.698.jpg',
    stats: {
      [StatType.STR]: 220,
      [StatType.DEX]: 150,
      [StatType.INT]: 300,
      [StatType.CHA]: 280,
      [StatType.CON]: 250
    },
    skills: [
      { name: 'Stoic Philosophy', type: StatType.INT },
      { name: 'Journaling', type: StatType.INT },
      { name: 'Command', type: StatType.CHA }
    ],
    tags: ['Stoic', 'Leader', 'Writer'],
    quotes: [
      "You have power over your mind - not outside events. Realize this, and you will find strength.",
      "The happiness of your life depends upon the quality of your thoughts.",
      "Waste no more time arguing about what a good man should be. Be one."
    ]
  },
  {
    id: 'h2',
    name: 'Miyamoto Musashi',
    title: 'The Sword Saint',
    description: 'Undefeated swordsman, philosopher, and artist. Author of The Book of Five Rings.',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/07/Miyamoto_Musashi_Self-Portrait.jpg/640px-Miyamoto_Musashi_Self-Portrait.jpg',
    stats: {
      [StatType.STR]: 280,
      [StatType.DEX]: 300,
      [StatType.INT]: 240,
      [StatType.CHA]: 120,
      [StatType.CON]: 290
    },
    skills: [
      { name: 'Dual Wielding', type: StatType.DEX },
      { name: 'Strategy', type: StatType.INT },
      { name: 'Calligraphy', type: StatType.DEX }
    ],
    tags: ['Warrior', 'Artist', 'Discipline'],
    quotes: [
      "Think lightly of yourself and deeply of the world.",
      "Do nothing which is of no use.",
      "You must understand that there is more than one path to the top of the mountain."
    ]
  },
  {
    id: 'h3',
    name: 'Leonardo da Vinci',
    title: 'The Universal Genius',
    description: 'Polymath of the High Renaissance. Master of art, science, engineering, and anatomy.',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b8/Leonardo_da_Vinci_-_presumed_self-portrait_-_WGA12798.jpg/640px-Leonardo_da_Vinci_-_presumed_self-portrait_-_WGA12798.jpg',
    stats: {
      [StatType.STR]: 140,
      [StatType.DEX]: 260,
      [StatType.INT]: 300,
      [StatType.CHA]: 200,
      [StatType.CON]: 150
    },
    skills: [
      { name: 'Painting', type: StatType.DEX },
      { name: 'Anatomy', type: StatType.INT },
      { name: 'Invention', type: StatType.INT }
    ],
    tags: ['Polymath', 'Inventor', 'Artist'],
    quotes: [
      "Simplicity is the ultimate sophistication.",
      "Learning never exhausts the mind.",
      "I love those who can smile in trouble."
    ]
  }
];

export const INITIAL_BOSS: Boss = {
  id: 'boss_entropy',
  name: 'The Entropy Demon',
  title: 'Devourer of Time',
  description: 'A manifestation of procrastination and chaos. It feeds on your wasted moments.',
  hp: 500,
  maxHp: 500,
  imageUrl: 'https://image.pollinations.ai/prompt/cyberpunk%20glitch%20demon%20boss%20monster',
  rewards: [GAME_ITEMS[3]], // Scroll of Wisdom
  stages: 3,
  currentStage: 1,
  active: true,
  defeated: false,
  objectives: ['q2', 'q4']
};

export const INITIAL_STATE: GameState = {
  user: {
    name: 'Player',
    level: 1,
    playerClass: 'NONE',
    xp: 0,
    hp: 100,
    maxHp: 100,
    credits: 100,
    attributes: {
      [StatType.STR]: 5,
      [StatType.DEX]: 5,
      [StatType.INT]: 5,
      [StatType.CHA]: 5,
      [StatType.CON]: 5,
    },
    customAttributes: [],
    subSkills: [],
    inventory: [],
    achievements: [],
    activeBuffs: [],
    unlockedFragments: [], // Story progress
    streak: 0,
    height: 175,
    weight: 70,
    birthDate: '2000-01-01',
    avatarUrl: undefined,
  },
  quests: INITIAL_QUESTS,
  skills: INITIAL_SKILLS,
  virtues: INITIAL_VIRTUES,
  heroes: INITIAL_HEROES,
  goals: [],
  bible: "# My Personal Bible\n\n**Mission:** To live a life of purpose, strength, and wisdom.\n\n**Core Values:**\n1. Courage over Comfort.\n2. Discipline is Freedom.\n3. Memento Mori.\n\n**Maxims:**\n- The obstacle is the way.\n- Actions speak louder than words.",
  journal: [],
  timeLogs: [],
  statHistory: [],
  activeBoss: INITIAL_BOSS,
  lastActiveDate: new Date().toISOString().split('T')[0],
};
