import { Platform } from 'react-native';

const DATABASE_NAME = 'rabbitVsTurtle.db';

// ── Web: localStorage 기반 인메모리 스토어 ──────────────────────────
const STORAGE_KEY = 'hopit_web_db';
let webStore = null;

function loadWebStore() {
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

// ── Native: SQLite ────────────────────────────────────────────────
let sqliteDb = null;

const CREATE_TABLES_SQL = `
  CREATE TABLE IF NOT EXISTS races (
    raceId TEXT PRIMARY KEY,
    startDate TEXT NOT NULL,
    endDate TEXT NOT NULL,
    weeklyGoal INTEGER NOT NULL,
    authMethodGPS BOOLEAN DEFAULT 1,
    authMethodPhoto BOOLEAN DEFAULT 1,
    status TEXT CHECK(status IN ('active','completed','abandoned')) DEFAULT 'active',
    finalResult TEXT CHECK(finalResult IN ('rabbit','turtle','tie','pending')) DEFAULT 'pending',
    completionRate REAL DEFAULT 0.0,
    createdAt TEXT NOT NULL,
    updatedAt TEXT NOT NULL
  );
  CREATE TABLE IF NOT EXISTS authentications (
    authId TEXT PRIMARY KEY,
    raceId TEXT NOT NULL REFERENCES races(raceId) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK(type IN ('gps','photo')),
    distance REAL, duration INTEGER,
    startLat REAL, startLng REAL, endLat REAL, endLng REAL,
    photoPath TEXT, photoTimestamp TEXT, memo TEXT,
    analysisData TEXT,
    timestamp TEXT NOT NULL, createdAt TEXT NOT NULL,
    isValid BOOLEAN DEFAULT 1, validatedAt TEXT
  );
  CREATE TABLE IF NOT EXISTS daily_progress (
    progressId TEXT PRIMARY KEY,
    raceId TEXT NOT NULL REFERENCES races(raceId) ON DELETE CASCADE,
    date TEXT NOT NULL,
    rabbitDistance REAL DEFAULT 0.0, rabbitCount INTEGER DEFAULT 0,
    turtleExpectedDistance REAL DEFAULT 0.0, turtleExpectedCount INTEGER DEFAULT 0,
    completionRate REAL DEFAULT 0.0,
    createdAt TEXT NOT NULL, updatedAt TEXT NOT NULL,
    UNIQUE(raceId, date)
  );
  CREATE INDEX IF NOT EXISTS idx_races_status ON races(status);
  CREATE INDEX IF NOT EXISTS idx_auth_raceId ON authentications(raceId);
  CREATE INDEX IF NOT EXISTS idx_auth_ts ON authentications(timestamp);
  CREATE INDEX IF NOT EXISTS idx_dp_raceId ON daily_progress(raceId);
  CREATE INDEX IF NOT EXISTS idx_dp_date ON daily_progress(date);
`;

// ── 공통 API ─────────────────────────────────────────────────────

export const initDatabase = async () => {
  if (Platform.OS === 'web') {
    webStore = loadWebStore();
    console.log('✅ Web DB initialized (localStorage)');
    return webStore;
  }

  // 네이티브: expo-sqlite 동적 로드 (웹 번들에 포함 방지)
  const SQLite = await import('expo-sqlite');
  sqliteDb = await SQLite.openDatabaseAsync(DATABASE_NAME);
  await sqliteDb.execAsync(CREATE_TABLES_SQL);
  // 기존 설치 마이그레이션: analysisData 컬럼 없으면 추가
  await sqliteDb.execAsync(
    'ALTER TABLE authentications ADD COLUMN analysisData TEXT;'
  ).catch(() => {});
  console.log('✅ SQLite DB initialized');
  return sqliteDb;
};

export const getDatabase = () => {
  if (Platform.OS === 'web') {
    if (!webStore) throw new Error('DB not initialized');
    return webStore;
  }
  if (!sqliteDb) throw new Error('DB not initialized');
  return sqliteDb;
};

export const resetDatabase = async () => {
  if (Platform.OS === 'web') {
    webStore = { races: [], authentications: [], daily_progress: [] };
    persistStore();
  } else {
    if (sqliteDb) {
      await sqliteDb.execAsync(`
        DROP TABLE IF EXISTS daily_progress;
        DROP TABLE IF EXISTS authentications;
        DROP TABLE IF EXISTS races;
      `);
    }
  }
  console.log('✅ DB reset');
};

export default null;
