import { getDatabase } from './db';
import { v4 as uuidv4 } from 'uuid';

/**
 * ========== RACES QUERIES ==========
 */

/**
 * 새로운 경주 생성
 */
export const createRace = async (startDate, endDate, weeklyGoal, authMethods) => {
  try {
    const db = getDatabase();
    const raceId = uuidv4();
    const now = new Date().toISOString();

    await db.runAsync(
      `INSERT INTO races
        (raceId, startDate, endDate, weeklyGoal, authMethodGPS, authMethodPhoto, createdAt, updatedAt)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        raceId,
        startDate,
        endDate,
        weeklyGoal,
        authMethods.gps ? 1 : 0,
        authMethods.photo ? 1 : 0,
        now,
        now
      ]
    );

    console.log(`✅ Race created: ${raceId}`);
    return raceId;
  } catch (error) {
    console.error('❌ Create race failed:', error);
    throw error;
  }
};

/**
 * 현재 활성 경주 조회
 */
export const getActiveRace = async () => {
  try {
    const db = getDatabase();
    const result = await db.getFirstAsync(
      `SELECT * FROM races WHERE status = 'active' ORDER BY createdAt DESC LIMIT 1`
    );
    return result;
  } catch (error) {
    console.error('❌ Get active race failed:', error);
    return null;
  }
};

/**
 * 경주 ID로 경주 정보 조회
 */
export const getRaceById = async (raceId) => {
  try {
    const db = getDatabase();
    const result = await db.getFirstAsync(
      `SELECT * FROM races WHERE raceId = ?`,
      [raceId]
    );
    return result;
  } catch (error) {
    console.error('❌ Get race by ID failed:', error);
    return null;
  }
};

/**
 * 경주 상태 업데이트
 */
export const updateRaceStatus = async (raceId, status, finalResult = null, completionRate = 0) => {
  try {
    const db = getDatabase();
    const now = new Date().toISOString();

    await db.runAsync(
      `UPDATE races
       SET status = ?, finalResult = ?, completionRate = ?, updatedAt = ?
       WHERE raceId = ?`,
      [status, finalResult, completionRate, now, raceId]
    );

    console.log(`✅ Race status updated: ${raceId} → ${status}`);
  } catch (error) {
    console.error('❌ Update race status failed:', error);
    throw error;
  }
};

/**
 * ========== AUTHENTICATIONS QUERIES ==========
 */

/**
 * 새로운 인증 기록 저장
 */
export const saveAuthentication = async (raceId, authData) => {
  try {
    const db = getDatabase();
    const authId = uuidv4();
    const now = new Date().toISOString();

    const { type, distance, duration, startLat, startLng, endLat, endLng, photoPath, memo } = authData;

    await db.runAsync(
      `INSERT INTO authentications
        (authId, raceId, type, distance, duration, startLat, startLng, endLat, endLng, photoPath, memo, timestamp, createdAt)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        authId,
        raceId,
        type,
        distance || null,
        duration || null,
        startLat || null,
        startLng || null,
        endLat || null,
        endLng || null,
        photoPath || null,
        memo || null,
        now,
        now
      ]
    );

    console.log(`✅ Authentication saved: ${authId} (${type})`);
    return authId;
  } catch (error) {
    console.error('❌ Save authentication failed:', error);
    throw error;
  }
};

/**
 * 경주별 모든 인증 기록 조회
 */
export const getAuthenticationsByRaceId = async (raceId) => {
  try {
    const db = getDatabase();
    const results = await db.getAllAsync(
      `SELECT * FROM authentications WHERE raceId = ? AND isValid = 1 ORDER BY timestamp DESC`,
      [raceId]
    );
    return results;
  } catch (error) {
    console.error('❌ Get authentications failed:', error);
    return [];
  }
};

/**
 * 경주별 인증 횟수
 */
export const getAuthenticationCount = async (raceId) => {
  try {
    const db = getDatabase();
    const result = await db.getFirstAsync(
      `SELECT COUNT(*) as count FROM authentications WHERE raceId = ? AND isValid = 1`,
      [raceId]
    );
    return result?.count || 0;
  } catch (error) {
    console.error('❌ Get authentication count failed:', error);
    return 0;
  }
};

/**
 * 주간 인증 카운트 (요일별)
 *
 * @param {string} raceId
 * @param {string[]} isoDates - YYYY-MM-DD 형식 7개
 * @returns {Promise<number[]>} 각 날짜별 인증 횟수
 */
export const getWeeklyAuthCounts = async (raceId, isoDates) => {
  try {
    const db = getDatabase();
    const counts = [];
    for (const date of isoDates) {
      const row = await db.getFirstAsync(
        `SELECT COUNT(*) as count FROM authentications
         WHERE raceId = ? AND DATE(timestamp) = ? AND isValid = 1`,
        [raceId, date]
      );
      counts.push(row?.count || 0);
    }
    return counts;
  } catch (error) {
    console.error('❌ Get weekly auth counts failed:', error);
    return isoDates.map(() => 0);
  }
};

/**
 * 연속 인증 일수 (오늘 기준 역방향)
 */
export const getCurrentStreak = async (raceId) => {
  try {
    const db = getDatabase();
    let streak = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let i = 0; i < 365; i++) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const iso = d.toISOString().slice(0, 10);
      const row = await db.getFirstAsync(
        `SELECT COUNT(*) as count FROM authentications
         WHERE raceId = ? AND DATE(timestamp) = ? AND isValid = 1`,
        [raceId, iso]
      );
      if ((row?.count || 0) > 0) {
        streak += 1;
      } else if (i === 0) {
        // 오늘 미인증이어도 어제부터 연속이면 카운트
        continue;
      } else {
        break;
      }
    }
    return streak;
  } catch (error) {
    console.error('❌ Get current streak failed:', error);
    return 0;
  }
};

/**
 * 특정 날짜 인증 여부 확인
 */
export const hasAuthenticationToday = async (raceId, date) => {
  try {
    const db = getDatabase();
    const result = await db.getFirstAsync(
      `SELECT COUNT(*) as count FROM authentications
       WHERE raceId = ? AND DATE(timestamp) = ? AND isValid = 1`,
      [raceId, date]
    );
    return result?.count > 0;
  } catch (error) {
    console.error('❌ Check daily authentication failed:', error);
    return false;
  }
};

/**
 * ========== DAILY PROGRESS QUERIES ==========
 */

/**
 * 일일 진행상황 업데이트
 */
export const updateDailyProgress = async (raceId, date, progressData) => {
  try {
    const db = getDatabase();
    const progressId = uuidv4();
    const now = new Date().toISOString();

    const { rabbitCount, rabbitDistance, turtleExpectedCount, turtleExpectedDistance, completionRate } = progressData;

    // 기존 데이터 확인
    const existing = await db.getFirstAsync(
      `SELECT * FROM daily_progress WHERE raceId = ? AND date = ?`,
      [raceId, date]
    );

    if (existing) {
      // 업데이트
      await db.runAsync(
        `UPDATE daily_progress
         SET rabbitCount = ?, rabbitDistance = ?, turtleExpectedCount = ?, turtleExpectedDistance = ?, completionRate = ?, updatedAt = ?
         WHERE raceId = ? AND date = ?`,
        [rabbitCount, rabbitDistance, turtleExpectedCount, turtleExpectedDistance, completionRate, now, raceId, date]
      );
    } else {
      // 삽입
      await db.runAsync(
        `INSERT INTO daily_progress
          (progressId, raceId, date, rabbitCount, rabbitDistance, turtleExpectedCount, turtleExpectedDistance, completionRate, createdAt, updatedAt)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [progressId, raceId, date, rabbitCount, rabbitDistance, turtleExpectedCount, turtleExpectedDistance, completionRate, now, now]
      );
    }

    console.log(`✅ Daily progress updated: ${raceId} on ${date}`);
  } catch (error) {
    console.error('❌ Update daily progress failed:', error);
    throw error;
  }
};

/**
 * 일일 진행상황 조회
 */
export const getDailyProgress = async (raceId, date) => {
  try {
    const db = getDatabase();
    const result = await db.getFirstAsync(
      `SELECT * FROM daily_progress WHERE raceId = ? AND date = ?`,
      [raceId, date]
    );
    return result;
  } catch (error) {
    console.error('❌ Get daily progress failed:', error);
    return null;
  }
};

/**
 * 경주 기간 전체 진행상황 조회
 */
export const getRaceProgress = async (raceId) => {
  try {
    const db = getDatabase();
    const results = await db.getAllAsync(
      `SELECT * FROM daily_progress WHERE raceId = ? ORDER BY date ASC`,
      [raceId]
    );
    return results;
  } catch (error) {
    console.error('❌ Get race progress failed:', error);
    return [];
  }
};

/**
 * ========== UTILITY QUERIES ==========
 */

/**
 * 경주 통계 (축약)
 */
export const getRaceStats = async (raceId) => {
  try {
    const db = getDatabase();

    const race = await getRaceById(raceId);
    const authCount = await getAuthenticationCount(raceId);
    const latestProgress = await db.getFirstAsync(
      `SELECT * FROM daily_progress WHERE raceId = ? ORDER BY date DESC LIMIT 1`,
      [raceId]
    );

    return {
      race,
      totalAuthentications: authCount,
      completionRate: latestProgress?.completionRate || 0,
      lastProgress: latestProgress
    };
  } catch (error) {
    console.error('❌ Get race stats failed:', error);
    return null;
  }
};

/**
 * 모든 경주 조회
 */
export const getAllRaces = async () => {
  try {
    const db = getDatabase();
    const results = await db.getAllAsync(
      `SELECT * FROM races ORDER BY createdAt DESC`
    );
    return results;
  } catch (error) {
    console.error('❌ Get all races failed:', error);
    return [];
  }
};

/**
 * ========== TEST / DEV UTILITIES ==========
 *
 * 개발 중 빠르게 데이터를 채워볼 수 있도록 만든 시드 함수.
 * 프로덕션 빌드에서는 호출하지 마세요.
 */

/**
 * 30일짜리 경주 + 인증 기록 + 일일 진행상황을 함께 생성.
 *
 * @param {Object} options
 * @param {number} options.totalDays     경주 길이 (기본 30일)
 * @param {number} options.weeklyGoal    주간 목표 (기본 5)
 * @param {number} options.authCount     생성할 인증 개수 (기본 10)
 * @returns {Promise<string>} 생성된 raceId
 */
export const seedTestData = async ({
  totalDays = 30,
  weeklyGoal = 5,
  authCount = 10
} = {}) => {
  try {
    const startDate = new Date();
    const endDate = new Date(Date.now() + totalDays * 24 * 60 * 60 * 1000);

    const raceId = await createRace(
      startDate.toISOString(),
      endDate.toISOString(),
      weeklyGoal,
      { gps: true, photo: true }
    );

    // 인증 기록: GPS/사진 번갈아 가며 생성
    for (let i = 0; i < authCount; i++) {
      const isGps = i % 2 === 0;
      await saveAuthentication(raceId, {
        type: isGps ? 'gps' : 'photo',
        distance: isGps ? +(3 + Math.random() * 2).toFixed(2) : null,
        duration: isGps ? Math.floor(1800 + Math.random() * 900) : null,
        photoPath: isGps ? null : 'file:///dev/null/seed-photo.jpg',
        memo: isGps ? null : '시드 데이터 인증샷'
      });
    }

    // 진행상황 시드 (오늘 날짜만)
    const today = new Date().toISOString().slice(0, 10);
    const goalAuths = Math.round((weeklyGoal / 7) * totalDays);
    const completionRate = Math.min(100, Math.round((authCount / goalAuths) * 100));

    await updateDailyProgress(raceId, today, {
      rabbitCount: authCount,
      rabbitDistance: authCount * 3.5,
      turtleExpectedCount: Math.floor(goalAuths / 2),
      turtleExpectedDistance: Math.floor(goalAuths / 2) * 3,
      completionRate
    });

    console.log(`🌱 Seed test data created: race=${raceId}, auths=${authCount}`);
    return raceId;
  } catch (error) {
    console.error('❌ Seed test data failed:', error);
    throw error;
  }
};

/**
 * 모든 데이터를 지우고 다시 시드.
 * SQLite를 직접 만지는 위험이 있어 개발용으로만 사용.
 */
export const reseedDatabase = async (options) => {
  try {
    const db = getDatabase();
    await db.runAsync('DELETE FROM authentications');
    await db.runAsync('DELETE FROM daily_progress');
    await db.runAsync('DELETE FROM races');
    console.log('🧹 All race data cleared');
    return await seedTestData(options);
  } catch (error) {
    console.error('❌ Reseed database failed:', error);
    throw error;
  }
};
