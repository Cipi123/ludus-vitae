import { GameState } from '../types';
import { INITIAL_STATE } from '../constants';
import { openDB, DBSchema, IDBPDatabase } from 'idb';
import { saveToCloud } from './firebase';

const DB_NAME = 'LudusVitaeDB';
const STORE_NAME = 'saveData';
const KEY = 'currentSave';

interface LudusDB extends DBSchema {
  saveData: {
    key: string;
    value: GameState;
  };
}

let dbPromise: Promise<IDBPDatabase<LudusDB>> | null = null;
let currentUserUid: string | null = null;

export const setStorageUser = (uid: string | null) => {
  currentUserUid = uid;
};

const getDB = () => {
  if (!dbPromise) {
    dbPromise = openDB<LudusDB>(DB_NAME, 1, {
      upgrade(db) {
        db.createObjectStore(STORE_NAME);
      },
    });
  }
  return dbPromise;
};

export const saveGame = async (state: GameState): Promise<void> => {
  try {
    const db = await getDB();
    await db.put(STORE_NAME, state, KEY);
    
    // If user is logged in, sync to cloud
    if (currentUserUid) {
      // Fire and forget to not block UI
      saveToCloud(currentUserUid, state);
    }
  } catch (e) {
    console.error("Failed to save game state to DB", e);
  }
};

export const loadGame = async (): Promise<GameState> => {
  try {
    const db = await getDB();
    const saved = await db.get(STORE_NAME, KEY);
    
    if (saved) {
      return { 
        ...INITIAL_STATE, 
        ...saved,
        user: {
          ...INITIAL_STATE.user,
          ...saved.user,
        }
      };
    }
  } catch (e) {
    console.error("Failed to load game state from DB", e);
  }
  return INITIAL_STATE;
};

export const clearSave = async (): Promise<void> => {
  const db = await getDB();
  await db.delete(STORE_NAME, KEY);
  window.location.reload();
};

export const exportSaveData = async (): Promise<string> => {
  const state = await loadGame();
  return JSON.stringify(state, null, 2);
};

export const importSaveData = async (jsonString: string): Promise<boolean> => {
  try {
    const parsed = JSON.parse(jsonString);
    if (!parsed.user || !parsed.quests) {
      throw new Error("Invalid save file format");
    }
    await saveGame(parsed);
    return true;
  } catch (e) {
    console.error("Import failed", e);
    return false;
  }
};

export const getStorageUsage = async (): Promise<{ used: string; quota: string; percent: number }> => {
  if (navigator.storage && navigator.storage.estimate) {
    const estimate = await navigator.storage.estimate();
    const usedBytes = estimate.usage || 0;
    const quotaBytes = estimate.quota || 1; // Avoid div by zero
    return {
      used: (usedBytes / 1024 / 1024).toFixed(2), // MB
      quota: (quotaBytes / 1024 / 1024).toFixed(0), // MB
      percent: Math.round((usedBytes / quotaBytes) * 100)
    };
  }
  return { used: '0', quota: '0', percent: 0 };
};
