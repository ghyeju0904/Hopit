import * as SQLite from 'expo-sqlite';

const DATABASE_NAME = 'rabbitVsTurtle.db';

let db = null;

/**
 * 데이터베이스 초기화
 */
export const initDatabase = async () => {
  try {
    db = await SQLite.openDatabaseAsync(DATABASE_NAME);

    // 테이블 생성
    await db.execAsync(`
      -- races 테이블: 경주 정보
      CREATE TABLE IF NOT EXISTS races (
        raceId TEXT PRIMARY KEY,
        startDate TEXT NOT NULL,
        endDate TEXT NOT NULL,
        weeklyGoal INTEGER NOT NULL,
        authMethodGPS BOOLEAN DEFAULT 1,
        authMethodPhoto BOOLEAN DEFAULT 1,
        status TEXT CHECK(status IN ('active', 'completed', 'abandoned')) DEFAULT 'active',
        finalResult TEXT CHECK(finalResult IN ('rabbit', 'turtle', 'tie', 'pending')) DEFAULT 'pending',
        completionRate REAL DEFAULT 0.0,
        createdAt TEXT NOT NULL,
        updatedAt TEXT NOT NULL
      );

      -- authentications 테이블: 인증 기록
      CREATE TABLE IF NOT EXISTS authentications (
        authId TEXT PRIMARY KEY,
        raceId TEXT NOT NULL REFERENCES races(raceId) ON DELETE CASCADE,
        type TEXT NOT NULL CHECK(type IN ('gps', 'photo')),

        -- GPS 데이터
        distance REAL,
        duration INTEGER,
        startLat REAL,
        startLng REAL,
        endLat REAL,
        endLng REAL,

        -- 사진 데이터
        photoPath TEXT,
        photoTimestamp TEXT,
        memo TEXT,

        -- 메타데이터
        timestamp TEXT NOT NULL,
        createdAt TEXT NOT NULL,
        isValid BOOLEAN DEFAULT 1,
        validatedAt TEXT
      );

      -- daily_progress 테이블: 일일 진행상황
      CREATE TABLE IF NOT EXISTS daily_progress (
        progressId TEXT PRIMARY KEY,
        raceId TEXT NOT NULL REFERENCES races(raceId) ON DELETE CASCADE,
        date TEXT NOT NULL,

        rabbitDistance REAL DEFAULT 0.0,
        rabbitCount INTEGER DEFAULT 0,

        turtleExpectedDistance REAL DEFAULT 0.0,
        turtleExpectedCount INTEGER DEFAULT 0,

        completionRate REAL DEFAULT 0.0,

        createdAt TEXT NOT NULL,
        updatedAt TEXT NOT NULL,

        UNIQUE(raceId, date)
      );

      -- 인덱스 생성
      CREATE INDEX IF NOT EXISTS idx_races_status ON races(status);
      CREATE INDEX IF NOT EXISTS idx_authentications_raceId ON authentications(raceId);
      CREATE INDEX IF NOT EXISTS idx_authentications_timestamp ON authentications(timestamp);
      CREATE INDEX IF NOT EXISTS idx_daily_progress_raceId ON daily_progress(raceId);
      CREATE INDEX IF NOT EXISTS idx_daily_progress_date ON daily_progress(date);
    `);

    console.log('✅ Database initialized successfully');
    return db;
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    throw error;
  }
};

/**
 * 데이터베이스 인스턴스 반환
 */
export const getDatabase = () => {
  if (!db) {
    throw new Error('Database not initialized. Call initDatabase() first.');
  }
  return db;
};

/**
 * 데이터베이스 초기화 (테스트용)
 */
export const resetDatabase = async () => {
  try {
    if (db) {
      await db.execAsync(`
        DROP TABLE IF EXISTS daily_progress;
        DROP TABLE IF EXISTS authentications;
        DROP TABLE IF EXISTS races;
      `);
      console.log('✅ Database reset successfully');
    }
  } catch (error) {
    console.error('❌ Database reset failed:', error);
  }
};

export default db;
