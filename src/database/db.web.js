// Web shim for expo-sqlite — uses localStorage as backing store

const STORAGE_KEY = 'hopit_web_db';

let webStore = null;

function loadStore() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return { races: [], authentications: [], daily_progress: [] };
}

export function persistStore() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(webStore));
  } catch {}
}

export const initDatabase = async () => {
  webStore = loadStore();
  console.log('✅ Web DB initialized (localStorage)');
  return webStore;
};

export const getDatabase = () => {
  if (!webStore) throw new Error('Database not initialized. Call initDatabase() first.');
  return webStore;
};

export const resetDatabase = async () => {
  webStore = { races: [], authentications: [], daily_progress: [] };
  persistStore();
  console.log('✅ Web DB reset');
};

export default null;
