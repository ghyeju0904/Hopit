// Web shim for queries — same API as queries.js, backed by localStorage via db.web.js

import { getDatabase, persistStore } from './db';
import { v4 as uuidv4 } from 'uuid';

// ========== RACES ==========

export const createRace = async (startDate, endDate, weeklyGoal, authMethods) => {
  const store = getDatabase();
  const raceId = uuidv4();
  const now = new Date().toISOString();

  store.races.push({
    raceId,
    startDate,
    endDate,
    weeklyGoal,
    authMethodGPS: authMethods.gps ? 1 : 0,
    authMethodPhoto: authMethods.photo ? 1 : 0,
    status: 'active',
    finalResult: 'pending',
    completionRate: 0,
    createdAt: now,
    updatedAt: now
  });
  persistStore();
  console.log(`✅ Race created: ${raceId}`);
  return raceId;
};

export const getActiveRace = async () => {
  const store = getDatabase();
  return store.races
    .filter(r => r.status === 'active')
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))[0] || null;
};

export const getRaceById = async (raceId) => {
  return getDatabase().races.find(r => r.raceId === raceId) || null;
};

export const updateRaceStatus = async (raceId, status, finalResult = null, completionRate = 0) => {
  const store = getDatabase();
  const race = store.races.find(r => r.raceId === raceId);
  if (race) {
    race.status = status;
    race.finalResult = finalResult;
    race.completionRate = completionRate;
    race.updatedAt = new Date().toISOString();
    persistStore();
    console.log(`✅ Race status updated: ${raceId} → ${status}`);
  }
};

export const getAllRaces = async () => {
  return [...getDatabase().races].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
};

// ========== AUTHENTICATIONS ==========

export const saveAuthentication = async (raceId, authData) => {
  const store = getDatabase();
  const authId = uuidv4();
  const now = new Date().toISOString();

  store.authentications.push({
    authId,
    raceId,
    type: authData.type,
    distance: authData.distance || null,
    duration: authData.duration || null,
    startLat: authData.startLat || null,
    startLng: authData.startLng || null,
    endLat: authData.endLat || null,
    endLng: authData.endLng || null,
    photoPath: authData.photoPath || null,
    memo: authData.memo || null,
    timestamp: now,
    createdAt: now,
    isValid: 1
  });
  persistStore();
  console.log(`✅ Authentication saved: ${authId} (${authData.type})`);
  return authId;
};

export const getAuthenticationsByRaceId = async (raceId) => {
  return getDatabase().authentications
    .filter(a => a.raceId === raceId && a.isValid === 1)
    .sort((a, b) => b.timestamp.localeCompare(a.timestamp));
};

export const getAuthenticationCount = async (raceId) => {
  return getDatabase().authentications.filter(a => a.raceId === raceId && a.isValid === 1).length;
};

export const getWeeklyAuthCounts = async (raceId, isoDates) => {
  const auths = getDatabase().authentications.filter(a => a.raceId === raceId && a.isValid === 1);
  return isoDates.map(date =>
    auths.filter(a => a.timestamp.slice(0, 10) === date).length
  );
};

export const getCurrentStreak = async (raceId) => {
  const auths = getDatabase().authentications.filter(a => a.raceId === raceId && a.isValid === 1);
  const daysWithAuth = new Set(auths.map(a => a.timestamp.slice(0, 10)));

  let streak = 0;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  for (let i = 0; i < 365; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const iso = d.toISOString().slice(0, 10);
    if (daysWithAuth.has(iso)) {
      streak += 1;
    } else if (i === 0) {
      continue;
    } else {
      break;
    }
  }
  return streak;
};

export const hasAuthenticationToday = async (raceId, date) => {
  return getDatabase().authentications
    .some(a => a.raceId === raceId && a.timestamp.slice(0, 10) === date && a.isValid === 1);
};

// ========== DAILY PROGRESS ==========

export const updateDailyProgress = async (raceId, date, progressData) => {
  const store = getDatabase();
  const now = new Date().toISOString();
  const existing = store.daily_progress.find(p => p.raceId === raceId && p.date === date);

  if (existing) {
    Object.assign(existing, { ...progressData, updatedAt: now });
  } else {
    store.daily_progress.push({
      progressId: uuidv4(),
      raceId,
      date,
      rabbitCount: progressData.rabbitCount || 0,
      rabbitDistance: progressData.rabbitDistance || 0,
      turtleExpectedCount: progressData.turtleExpectedCount || 0,
      turtleExpectedDistance: progressData.turtleExpectedDistance || 0,
      completionRate: progressData.completionRate || 0,
      createdAt: now,
      updatedAt: now
    });
  }
  persistStore();
};

export const getDailyProgress = async (raceId, date) => {
  return getDatabase().daily_progress.find(p => p.raceId === raceId && p.date === date) || null;
};

export const getRaceProgress = async (raceId) => {
  return getDatabase().daily_progress
    .filter(p => p.raceId === raceId)
    .sort((a, b) => a.date.localeCompare(b.date));
};

// ========== STATS ==========

export const getRaceStats = async (raceId) => {
  const race = await getRaceById(raceId);
  const totalAuthentications = await getAuthenticationCount(raceId);
  const progress = await getRaceProgress(raceId);
  const latestProgress = progress[progress.length - 1] || null;

  return {
    race,
    totalAuthentications,
    completionRate: latestProgress?.completionRate || 0,
    lastProgress: latestProgress
  };
};

// ========== DEV UTILITIES ==========

export const seedTestData = async ({ totalDays = 30, weeklyGoal = 5, authCount = 10 } = {}) => {
  const startDate = new Date();
  const endDate = new Date(Date.now() + totalDays * 24 * 60 * 60 * 1000);

  const raceId = await createRace(
    startDate.toISOString(),
    endDate.toISOString(),
    weeklyGoal,
    { gps: true, photo: true }
  );

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
    rabbitCount: authCount,
    rabbitDistance: authCount * 3.5,
    turtleExpectedCount: Math.floor(goalAuths / 2),
    turtleExpectedDistance: Math.floor(goalAuths / 2) * 3,
    completionRate
  });

  console.log(`🌱 Seed data created: race=${raceId}, auths=${authCount}`);
  return raceId;
};

export const reseedDatabase = async (options) => {
  const store = getDatabase();
  store.races = [];
  store.authentications = [];
  store.daily_progress = [];
  persistStore();
  return await seedTestData(options);
};
