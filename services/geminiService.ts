
import { GoogleGenAI, Type, FunctionDeclaration } from "@google/genai";

// Initialize Gemini AI
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// Tool Definitions
const toolDeclarations: FunctionDeclaration[] = [
  {
    name: "suggest_quest",
    description: "Propose a new quest/task for the user based on their goals or weaknesses. Can optionally target a specific skill.",
    parameters: {
      type: Type.OBJECT,
      properties: {
        title: { type: Type.STRING, description: "Short title of the quest (RPG style)" },
        description: { type: Type.STRING, description: "Detailed description of the task" },
        type: { 
          type: Type.STRING, 
          description: "Stat type associated with the quest. Can be a Core Stat (Strength, Int, etc.) OR a Custom Stat name defined by the user.",
        },
        difficulty: { 
          type: Type.STRING, 
          description: "Difficulty level",
          enum: ["Easy", "Medium", "Hard", "Legendary"] 
        },
        xpReward: { type: Type.NUMBER, description: "XP reward (20-200)" },
        skillName: { type: Type.STRING, description: "Name of the specific sub-skill to target (e.g., 'Python', 'Yoga'). Only use if the user has this skill." }
      },
      required: ["title", "description", "type", "difficulty", "xpReward"]
    }
  },
  {
    name: "plan_campaign",
    description: "Create a massive Life Objective (Boss) and break it down into specific sub-quests. Use this when the user wants to achieve a major goal like 'Finish College' or 'Get a Girlfriend'.",
    parameters: {
      type: Type.OBJECT,
      properties: {
        bossName: { type: Type.STRING, description: "Creative RPG Name for the goal (e.g., 'The Diploma Dragon' for College, 'The Specter of Solitude' for dating)." },
        title: { type: Type.STRING, description: "The actual real-world goal (e.g., 'Obtain Bachelor's Degree')." },
        description: { type: Type.STRING, description: "Motivational description of the struggle." },
        hp: { type: Type.NUMBER, description: "Total HP (e.g., 1000). Usually 100 per sub-quest." },
        bossImagePrompt: { type: Type.STRING, description: "A prompt to generate a scary cyberpunk monster representing this obstacle." },
        subQuests: {
          type: Type.ARRAY,
          description: "A list of 3-6 concrete, actionable steps to achieve this goal.",
          items: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              description: { type: Type.STRING },
              difficulty: { type: Type.STRING, enum: ["Easy", "Medium", "Hard", "Legendary"] },
              type: { type: Type.STRING, description: "Stat Type (STR, INT, CHA, etc)" }
            },
            required: ["title", "description", "difficulty", "type"]
          }
        }
      },
      required: ["bossName", "title", "description", "hp", "subQuests", "bossImagePrompt"]
    }
  },
  {
    name: "suggest_virtue",
    description: "Propose a new virtue for the user to track.",
    parameters: {
      type: Type.OBJECT,
      properties: {
        name: { type: Type.STRING, description: "Name of the virtue (e.g., Courage)" },
        description: { type: Type.STRING, description: "Brief description of the virtue" }
      },
      required: ["name", "description"]
    }
  },
  {
    name: "suggest_hero",
    description: "Summon a historical or legendary figure to the Hall of Heroes to serve as a role model. Assigns estimated stats and skills.",
    parameters: {
      type: Type.OBJECT,
      properties: {
        name: { type: Type.STRING, description: "Name of the figure (e.g., David Goggins, Seneca)" },
        title: { type: Type.STRING, description: "An epithet (e.g., The Hardest Man Alive)" },
        description: { type: Type.STRING, description: "A 2-sentence bio explaining why they are legendary." },
        stats: {
          type: Type.OBJECT,
          properties: {
            Strength: { type: Type.NUMBER },
            Dexterity: { type: Type.NUMBER },
            Intelligence: { type: Type.NUMBER },
            Charisma: { type: Type.NUMBER },
            Constitution: { type: Type.NUMBER }
          },
          required: ["Strength", "Dexterity", "Intelligence", "Charisma", "Constitution"],
          description: "Estimated stats on a scale of 0-300. Legends should be 200+."
        },
        skills: {
          type: Type.ARRAY,
          description: "A list of 3-4 specific skills or areas of expertise this hero possessed.",
          items: {
            type: Type.OBJECT,
            properties: {
              name: { type: Type.STRING, description: "Name of the skill (e.g. 'Stoicism', 'Archery')" },
              type: { type: Type.STRING, description: "The Core Stat (e.g. 'Strength') or Custom Stat associated with this skill." }
            },
            required: ["name", "name", "type"]
          }
        },
        quotes: {
          type: Type.ARRAY,
          description: "A list of 2-3 famous or representative quotes from this figure.",
          items: {
            type: Type.STRING
          }
        }
      },
      required: ["name", "title", "description", "stats", "skills", "quotes"]
    }
  }
];

export interface OracleResponse {
  text: string;
  toolCalls?: any[];
}

export const askOracle = async (
  userQuery: string,
  personalBible: string,
  recentJournal: string,
  userStats: string
): Promise<OracleResponse> => {
  const systemInstruction = `
You are "The Oracle" in a system called Ludus Vitae (The Game of Life). 
Your goal is to act as a Socratic Tutor, Stoic Mentor, and Dungeon Master.

User's Personal Bible (Core Values & Mission):
"""
${personalBible}
"""

User's Current Character Sheet (Stats & Skills):
${userStats}

Recent Journal Entries:
${recentJournal}

YOUR MANDATE:
1. **Life Campaigns (Bosses):** If the user mentions a LARGE GOAL (e.g. "I want to finish college", "I want to get fit", "I want to find a partner"), do NOT just suggest a single quest. Use the 'plan_campaign' tool. 
   - Break the goal down into a "Boss" (The Obstacle) and "SubQuests" (The Steps).
   - Be creative with Boss Names (e.g. "The Diploma Dragon").
2. **Gap Analysis:** Compare the user's "Personal Bible" (their ideal self) against their "Current Stats" (their actual self). 
   - If the Bible emphasizes "Courage" but 'Charisma' is low, prescribe 'Rejection Therapy'.
3. **Skill Targeting:** If they have defined a skill like "Python", propose quests to level it up using 'skillName'.
4. **Role Modeling:** Use 'suggest_hero' to summon historical figures.

Instructions:
1. Be concise.
2. Use a mystical but grounded tone.
3. Prioritize ACTION.
4. If the goal is big, make it a Campaign (Boss).
`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: userQuery,
      config: {
        systemInstruction: systemInstruction,
        tools: [{ functionDeclarations: toolDeclarations }],
        thinkingConfig: { thinkingBudget: 0 }
      }
    });

    const toolCalls = response.functionCalls;
    const text = response.text || "";

    return { text, toolCalls };

  } catch (error) {
    console.error("Oracle Error:", error);
    return { text: "The mists of prophecy are thick... I cannot see clearly right now. (API Error)" };
  }
};

export const askTherapist = async (
  userQuery: string,
  personalBible: string,
  recentJournal: string
): Promise<OracleResponse> => {
  const systemInstruction = `
You are "The Sanctuary", a compassionate AI therapist and Stoic counselor within the Ludus Vitae system.

User's Personal Bible (Core Values & Mission):
"""
${personalBible}
"""

Recent Journal Entries:
"""
${recentJournal}
"""

YOUR STRICT METHODOLOGY:
1. **Active Listening & Validation:** Your primary mode is dialogue. Validate the user's feelings first.
2. **Pattern Recognition & Diagnosis (Internal):** Listen for specific mental patterns:
   - **Social Anxiety:** Fear of judgment, avoidance of people, feeling awkward.
   - **Burnout:** Exhaustion, cynicism, feeling overwhelmed.
   - **Depression/Lethargy:** Lack of motivation, ignoring hygiene, sadness.
   - **Anger/Resentment:** Fixation on injustice, irritability.
3. **Therapeutic Interventions (Quests):** Once you identify a pattern, you MUST prescribe a therapeutic quest using the 'suggest_quest' tool.
   - **For Social Anxiety:** Suggest "Exposure Therapy" (e.g., "Ask a stranger for the time", "Make eye contact"). Type: 'Charisma'.
   - **For Burnout:** Suggest "Restoration" (e.g., "15 min no screens", "Box Breathing"). Type: 'Constitution'.
   - **For Lethargy:** Suggest "Behavioral Activation" (e.g., "Make the bed", "Put on running shoes"). Type: 'Strength' or 'Dexterity'.
   - **For Anger:** Suggest "Sublimation" (e.g., "Journal the anger", "Intense workout"). Type: 'Constitution' or 'Strength'.
4. **Socratic Cross-Referencing:** Connect their current struggle to the values in their Personal Bible to show them the gap between their feelings and their ideal self.

Tone Guidelines:
- Calm, slow, deep.
- Validation first, then inquiry, then action.
- Explain *why* you are suggesting the quest (e.g., "To help build your social tolerance...").
`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: userQuery,
      config: {
        systemInstruction: systemInstruction,
        tools: [{ functionDeclarations: toolDeclarations }],
        thinkingConfig: { thinkingBudget: 0 }
      }
    });

    const toolCalls = response.functionCalls;
    const text = response.text || "";

    return { text, toolCalls };

  } catch (error) {
    console.error("Therapy Error:", error);
    return { text: "The Sanctuary is quiet... (Connection Error)" };
  }
};

export const askPhilosopher = async (
  userQuery: string,
  personalBible: string
): Promise<OracleResponse> => {
  const systemInstruction = `
You are "The Socratic Mirror", a philosophical engine designed to help the user construct their "Personal Bible" and "Virtues".

User's Current Bible:
"""
${personalBible}
"""

YOUR GOAL:
Help the user clearly articulate TWO things:
1. **The Ideal Self:** What kind of human do they want to be? (Values, Virtues, Mission)
2. **The Shadow/Anti-Self:** What kind of human do they DESPISE or fear becoming? (Vices, Weaknesses)

METHODOLOGY:
- Ask deep, probing questions. (e.g., "Who is your hero and why?", "What is a trait in others that makes you angry?", "If you could change one thing about your character, what would it be?")
- **Synthesis:** When the user answers, synthesize their thought into a clear Principle or Maxim.
- **Action:**
    - If they identify a clear value (e.g., "I want to be brave"), use the 'suggest_virtue' tool to create it (e.g., Name: "Courage", Desc: "Acting despite fear").
    - Offer text snippets they can copy into their Bible.

TONE:
- Intellectual, curious, exacting, but supportive.
- Like an architect helping draft a blueprint for a soul.
`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: userQuery,
      config: {
        systemInstruction: systemInstruction,
        tools: [{ functionDeclarations: toolDeclarations }],
        thinkingConfig: { thinkingBudget: 0 }
      }
    });

    const toolCalls = response.functionCalls;
    const text = response.text || "";

    return { text, toolCalls };

  } catch (error) {
    console.error("Philosopher Error:", error);
    return { text: "The mirror is clouded... (API Error)" };
  }
};

export const askCoach = async (
  userQuery: string,
  userStats: string // Stringified subset of stats (Physical focus)
): Promise<OracleResponse> => {
  const systemInstruction = `
You are "The Iron Forge", an elite Bio-Architect and Performance Coach.
Your domain is the PHYSICAL VESSEL: Strength (STR), Dexterity (DEX), Constitution (CON), Sleep, Nutrition, and Recovery.

Context:
${userStats}

YOUR METHODOLOGY:
1. **Direct & Scientific:** Speak like a high-performance coach. Use terms like "progressive overload," "hypertrophy," "zone 2 cardio," "macro-nutrients," "CNS recovery."
2. **Imbalance Detection:** Look at the stats provided.
   - High STR / Low CON? Diagnosed as "Glass Cannon." -> Prescribe Zone 2 Cardio or Mobility.
   - High CON / Low DEX? Diagnosed as "Tank/Stiff." -> Prescribe Yoga or Agility drills.
   - Low across the board? Diagnosed as "Novice." -> Prescribe compound movements (Squat, Pushup) to build a base.
3. **Action-Oriented:** You prefer action over talk. Use the 'suggest_quest' tool liberally to assign workouts.
   - Quest Types MUST be 'Strength', 'Dexterity', or 'Constitution'.
4. **Holistic Check:** Occasionally ask about sleep quality or protein intake if the user complains of fatigue.

TONE:
- Disciplined, motivating, slightly aggressive (in a "good for you" way), authoritative.
- No fluff. "Pain is information." "Your body is an instrument, not an ornament."
`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: userQuery,
      config: {
        systemInstruction: systemInstruction,
        tools: [{ functionDeclarations: toolDeclarations }],
        thinkingConfig: { thinkingBudget: 0 }
      }
    });

    const toolCalls = response.functionCalls;
    const text = response.text || "";

    return { text, toolCalls };

  } catch (error) {
    console.error("Coach Error:", error);
    return { text: "Systems offline. Check your connection to the Forge." };
  }
};
