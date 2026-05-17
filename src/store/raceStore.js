import { create } from 'zustand';
import { getRaceById, getAuthenticationCount, getDailyProgress } from '../database/queries';

/**
 * 경주 상태 관리 (Zustand)
 */
export const useRaceStore = create((set, get) => ({
  // ========== 상태 ==========
  currentRaceId: null,
  currentRace: null,
  totalAuthentications: 0,
  completionRate: 0,
  dailyProgress: null,
  isLoading: false,
  error: null,

  // ========== 액션 ==========

  /**
   * 경주 로드
   */
  loadRace: async (raceId) => {
    set({ isLoading: true, error: null });
    try {
      const race = await getRaceById(raceId);
      const authCount = await getAuthenticationCount(raceId);
      const today = new Date().toISOString().split('T')[0];
      const progress = await getDailyProgress(raceId, today);

      set({
        currentRaceId: raceId,
        currentRace: race,
        totalAuthentications: authCount,
        completionRate: race?.completionRate || 0,
        dailyProgress: progress
      });

      return race;
    } catch (error) {
      console.error('❌ Load race failed:', error);
      set({ error: error.message });
      return null;
    } finally {
      set({ isLoading: false });
    }
  },

  /**
   * 현재 경주 초기화
   */
  clearRace: () => {
    set({
      currentRaceId: null,
      currentRace: null,
      totalAuthentications: 0,
      completionRate: 0,
      dailyProgress: null
    });
  },

  /**
   * 인증 횟수 업데이트
   */
  updateAuthCount: (count) => {
    set({ totalAuthentications: count });
  },

  /**
   * 완료율 업데이트
   */
  updateCompletionRate: (rate) => {
    set({ completionRate: rate });
  },

  /**
   * 일일 진행상황 업데이트
   */
  updateDailyProgress: (progress) => {
    set({ dailyProgress: progress });
  },

  /**
   * 경주 정보 업데이트 (상태 변경 등)
   */
  updateCurrentRace: (raceData) => {
    set((state) => ({
      currentRace: { ...state.currentRace, ...raceData }
    }));
  },

  /**
   * 에러 설정
   */
  setError: (error) => {
    set({ error });
  },

  /**
   * 로딩 상태 설정
   */
  setLoading: (isLoading) => {
    set({ isLoading });
  }
}));

/**
 * 계산 유틸리티 함수들
 */
export const calculateCompletionRate = (totalAuths, weeklyGoal, daysTotal) => {
  const goalCount = weeklyGoal * (daysTotal / 7);
  const rate = (totalAuths / goalCount) * 100;
  return Math.min(Math.round(rate), 100);
};

export const calculateTurtleProgress = (daysElapsed, weeklyGoal, daysTotal) => {
  const goalCount = weeklyGoal * (daysTotal / 7);
  const turtleCount = weeklyGoal * (daysElapsed / 7);
  return {
    count: Math.round(turtleCount),
    rate: Math.round((turtleCount / goalCount) * 100)
  };
};

export const determineWinner = (completionRate) => {
  if (completionRate < 50) return 'turtle';
  if (completionRate === 50) return 'tie';
  return 'rabbit';
};

/**
 * 날짜 유틸리티
 */
export const getDaysBetween = (startDate, endDate) => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diffTime = Math.abs(end - start);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays + 1; // 시작일 포함
};

export const getDaysElapsed = (startDate, today = new Date()) => {
  const start = new Date(startDate);
  const current = new Date(today);
  const diffTime = Math.abs(current - start);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
};

export const getTimeRemaining = (endDate) => {
  const end = new Date(endDate);
  const today = new Date();
  const diffTime = end - today;

  if (diffTime < 0) return { days: 0, hours: 0, expired: true };

  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  const diffHours = Math.floor((diffTime % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

  return {
    days: diffDays,
    hours: diffHours,
    expired: false
  };
};

export default useRaceStore;
