import { Platform } from 'react-native';
import { getDatabase, persistStore } from './db';
import { v4 as uuidv4 } from 'uuid';

// ── 헬퍼: 웹(배열 스토어)과 네이티브(SQLite) 분기 ────────────────

const isWeb = Platform.OS === 'web';

// ========== RACES ==========

export const createRace = async (startDate, endDate, weeklyGoal, authMethods) => {
  const raceId = uuidv4();
  const now = new Date().toISOString();

  if (isWeb) {
    const store = getDatabase();
    store.races.push({
      raceId, startDate, endDate, weeklyGoal,
      authMethodGPS: authMethods.gps ? 1 : 0,
      authMethodPhoto: authMethods.photo ? 1 : 0,
      status: 'active', finalResult: 'pending', completionRate: 0,
      createdAt: now, updatedAt: now
    });
    persistStore();
  } else {
    const db = getDatabase();
    await db.runAsync(
      `INSERT INTO races (raceId,startDate,endDate,weeklyGoal,authMethodGPS,authMethodPhoto,createdAt,updatedAt)
       VALUES (?,?,?,?,?,?,?,?)`,
      [raceId, startDate, endDate, weeklyGoal, authMethods.gps ? 1 : 0, authMethods.photo ? 1 : 0, now, now]
    );
  }
  console.log(`✅ Race created: ${raceId}`);
  return raceId;
};

export const getActiveRace = async () => {
  if (isWeb) {
    const store = getDatabase();
    return store.races
      .filter(r => r.status === 'active')
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))[0] || null;
  }
  const db = getDatabase();
  return await db.getFirstAsync(
    `SELECT * FROM races WHERE status='active' ORDER BY createdAt DESC LIMIT 1`
  );
};

export const getRaceById = async (raceId) => {
  if (isWeb) {
    return getDatabase().races.find(r => r.raceId === raceId) || null;
  }
  const db = getDatabase();
  return await db.getFirstAsync(`SELECT * FROM races WHERE raceId=?`, [raceId]);
};

export const updateRaceStatus = async (raceId, status, finalResult = null, completionRate = 0) => {
  const now = new Date().toISOString();
  if (isWeb) {
    const race = getDatabase().races.find(r => r.raceId === raceId);
    if (race) { race.status = status; race.finalResult = finalResult; race.completionRate = completionRate; race.updatedAt = now; }
    persistStore();
  } else {
    const db = getDatabase();
    await db.runAsync(
      `UPDATE races SET status=?,finalResult=?,completionRate=?,updatedAt=? WHERE raceId=?`,
      [status, finalResult, completionRate, now, raceId]
    );
  }
  console.log(`✅ Race updated: ${raceId} → ${status}`);
};

export const getAllRaces = async () => {
  if (isWeb) {
    return [...getDatabase().races].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }
  const db = getDatabase();
  return await db.getAllAsync(`SELECT * FROM races ORDER BY createdAt DESC`);
};

// ========== AUTHENTICATIONS ==========

export const saveAuthentication = async (raceId, authData) => {
  const authId = uuidv4();
  const now = new Date().toISOString();
  const { type, distance, duration, startLat, startLng, endLat, endLng, photoPath, memo, analysisData } = authData;
  const analysisJson = analysisData ? JSON.stringify(analysisData) : null;

  if (isWeb) {
    getDatabase().authentications.push({
      authId, raceId, type,
      distance: distance || null, duration: duration || null,
      startLat: startLat || null, startLng: startLng || null,
      endLat: endLat || null, endLng: endLng || null,
      photoPath: photoPath || null, memo: memo || null,
      analysisData: analysisJson,
      timestamp: now, createdAt: now, isValid: 1
    });
    persistStore();
  } else {
    const db = getDatabase();
    await db.runAsync(
      `INSERT INTO authentications
        (authId,raceId,type,distance,duration,startLat,startLng,endLat,endLng,photoPath,memo,analysisData,timestamp,createdAt)
       VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
      [authId, raceId, type, distance || null, duration || null,
       startLat || null, startLng || null, endLat || null, endLng || null,
       photoPath || null, memo || null, analysisJson, now, now]
    );
  }
  console.log(`✅ Auth saved: ${authId} (${type})`);
  return authId;
};

export const getAuthenticationsByRaceId = async (raceId) => {
  if (isWeb) {
    return getDatabase().authentications
      .filter(a => a.raceId === raceId && a.isValid === 1)
      .sort((a, b) => b.timestamp.localeCompare(a.timestamp));
  }
  const db = getDatabase();
  return await db.getAllAsync(
    `SELECT * FROM authentications WHERE raceId=? AND isValid=1 ORDER BY timestamp DESC`, [raceId]
  );
};

export const getAuthenticationCount = async (raceId) => {
  if (isWeb) {
    return getDatabase().authentications.filter(a => a.raceId === raceId && a.isValid === 1).length;
  }
  const db = getDatabase();
  const row = await db.getFirstAsync(
    `SELECT COUNT(*) as count FROM authentications WHERE raceId=? AND isValid=1`, [raceId]
  );
  return row?.count || 0;
};

export const getWeeklyAuthCounts = async (raceId, isoDates) => {
  if (isWeb) {
    const auths = getDatabase().authentications.filter(a => a.raceId === raceId && a.isValid === 1);
    return isoDates.map(date => auths.filter(a => a.timestamp.slice(0, 10) === date).length);
  }
  const db = getDatabase();
  const counts = [];
  for (const date of isoDates) {
    const row = await db.getFirstAsync(
      `SELECT COUNT(*) as count FROM authentications WHERE raceId=? AND DATE(timestamp)=? AND isValid=1`,
      [raceId, date]
    );
    counts.push(row?.count || 0);
  }
  return counts;
};

export const getCurrentStreak = async (raceId) => {
  if (isWeb) {
    const auths = getDatabase().authentications.filter(a => a.raceId === raceId && a.isValid === 1);
    const days = new Set(auths.map(a => a.timestamp.slice(0, 10)));
    let streak = 0;
    const today = new Date(); today.setHours(0, 0, 0, 0);
    for (let i = 0; i < 365; i++) {
      const d = new Date(today); d.setDate(d.getDate() - i);
      const iso = d.toISOString().slice(0, 10);
      if (days.has(iso)) { streak++; } else if (i === 0) { continue; } else { break; }
    }
    return streak;
  }
  const db = getDatabase();
  let streak = 0;
  const today = new Date(); today.setHours(0, 0, 0, 0);
  for (let i = 0; i < 365; i++) {
    const d = new Date(today); d.setDate(d.getDate() - i);
    const iso = d.toISOString().slice(0, 10);
    const row = await db.getFirstAsync(
      `SELECT COUNT(*) as count FROM authentications WHERE raceId=? AND DATE(timestamp)=? AND isValid=1`,
      [raceId, iso]
    );
    if ((row?.count || 0) > 0) { streak++; } else if (i === 0) { continue; } else { break; }
  }
  return streak;
};

export const hasAuthenticationToday = async (raceId, date) => {
  if (isWeb) {
    return getDatabase().authentications
      .some(a => a.raceId === raceId && a.timestamp.slice(0, 10) === date && a.isValid === 1);
  }
  const db = getDatabase();
  const row = await db.getFirstAsync(
    `SELECT COUNT(*) as count FROM authentications WHERE raceId=? AND DATE(timestamp)=? AND isValid=1`,
    [raceId, date]
  );
  return (row?.count || 0) > 0;
};

// ========== DAILY PROGRESS ==========

export const updateDailyProgress = async (raceId, date, progressData) => {
  const now = new Date().toISOString();
  if (isWeb) {
    const store = getDatabase();
    const existing = store.daily_progress.find(p => p.raceId === raceId && p.date === date);
    if (existing) { Object.assign(existing, { ...progressData, updatedAt: now }); }
    else {
      store.daily_progress.push({
        progressId: uuidv4(), raceId, date,
        rabbitCount: progressData.rabbitCount || 0,
        rabbitDistance: progressData.rabbitDistance || 0,
        turtleExpectedCount: progressData.turtleExpectedCount || 0,
        turtleExpectedDistance: progressData.turtleExpectedDistance || 0,
        completionRate: progressData.completionRate || 0,
        createdAt: now, updatedAt: now
      });
    }
    persistStore();
    return;
  }

  const db = getDatabase();
  const { rabbitCount, rabbitDistance, turtleExpectedCount, turtleExpectedDistance, completionRate } = progressData;
  const existing = await db.getFirstAsync(
    `SELECT * FROM daily_progress WHERE raceId=? AND date=?`, [raceId, date]
  );
  if (existing) {
    await db.runAsync(
      `UPDATE daily_progress SET rabbitCount=?,rabbitDistance=?,turtleExpectedCount=?,turtleExpectedDistance=?,completionRate=?,updatedAt=? WHERE raceId=? AND date=?`,
      [rabbitCount, rabbitDistance, turtleExpectedCount, turtleExpectedDistance, completionRate, now, raceId, date]
    );
  } else {
    await db.runAsync(
      `INSERT INTO daily_progress (progressId,raceId,date,rabbitCount,rabbitDistance,turtleExpectedCount,turtleExpectedDistance,completionRate,createdAt,updatedAt) VALUES (?,?,?,?,?,?,?,?,?,?)`,
      [uuidv4(), raceId, date, rabbitCount, rabbitDistance, turtleExpectedCount, turtleExpectedDistance, completionRate, now, now]
    );
  }
};

export const getDailyProgress = async (raceId, date) => {
  if (isWeb) {
    return getDatabase().daily_progress.find(p => p.raceId === raceId && p.date === date) || null;
  }
  const db = getDatabase();
  return await db.getFirstAsync(`SELECT * FROM daily_progress WHERE raceId=? AND date=?`, [raceId, date]);
};

export const getRaceProgress = async (raceId) => {
  if (isWeb) {
    return getDatabase().daily_progress
      .filter(p => p.raceId === raceId)
      .sort((a, b) => a.date.localeCompare(b.date));
  }
  const db = getDatabase();
  return await db.getAllAsync(`SELECT * FROM daily_progress WHERE raceId=? ORDER BY date ASC`, [raceId]);
};

// ========== STATS ==========

export const getRaceStats = async (raceId) => {
  const race = await getRaceById(raceId);
  const totalAuthentications = await getAuthenticationCount(raceId);
  const progress = await getRaceProgress(raceId);
  const latestProgress = progress[progress.length - 1] || null;
  return { race, totalAuthentications, completionRate: latestProgress?.completionRate || 0, lastProgress: latestProgress };
};

// ========== DEV UTILITIES ==========

export const seedTestData = async ({ totalDays = 30, weeklyGoal = 5, authCount = 10 } = {}) => {
  const startDate = new Date();
  const endDate = new Date(Date.now() + totalDays * 24 * 60 * 60 * 1000);
  const raceId = await createRace(startDate.toISOString(), endDate.toISOString(), weeklyGoal, { gps: true, photo: true });

  for (let i = 0; i < authCount; i++) {
    const isGps = i % 2 === 0;
    await saveAuthentication(raceId, {
      type: isGps ? 'gps' : 'photo',
      distance: isGps ? +(3 + Math.random() * 2).toFixed(2) : null,
      duration: isGps ? Math.floor(1800 + Math.random() * 900) : null,
      photoPath: isGps ? null : 'seed-photo.jpg',
      memo: isGps ? null : '시드 데이터 인증샷'
    });
  }

  const today = new Date().toISOString().slice(0, 10);
  const goalAuths = Math.round((weeklyGoal / 7) * totalDays);
  const completionRate = Math.min(100, Math.round((authCount / goalAuths) * 100));
  await updateDailyProgress(raceId, today, {
    rabbitCount: authCount, rabbitDistance: authCount * 3.5,
    turtleExpectedCount: Math.floor(goalAuths / 2), turtleExpectedDistance: Math.floor(goalAuths / 2) * 3,
    completionRate
  });

  console.log(`🌱 Seed data: race=${raceId}, auths=${authCount}`);
  return raceId;
};

export const reseedDatabase = async (options) => {
  if (isWeb) {
    const store = getDatabase();
    store.races = []; store.authentications = []; store.daily_progress = [];
    persistStore();
  } else {
    const db = getDatabase();
    await db.runAsync('DELETE FROM authentications');
    await db.runAsync('DELETE FROM daily_progress');
    await db.runAsync('DELETE FROM races');
  }
  return await seedTestData(options);
};
