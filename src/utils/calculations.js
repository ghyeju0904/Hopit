/**
 * 경주 관련 계산 함수들
 */

/**
 * 목표 인증 횟수 계산
 * @param {number} weeklyGoal - 주간 목표 (회)
 * @param {number} totalDays - 경주 기간 (일)
 * @returns {number} 목표 총 인증 횟수
 */
export const calculateGoalAuthentications = (weeklyGoal, totalDays) => {
  const weeks = totalDays / 7;
  return Math.round(weeklyGoal * weeks);
};

/**
 * 완료율 계산
 * @param {number} currentAuths - 현재 인증 횟수
 * @param {number} goalAuths - 목표 인증 횟수
 * @returns {number} 완료율 (0~100)
 */
export const calculateCompletionRate = (currentAuths, goalAuths) => {
  if (goalAuths === 0) return 0;
  const rate = (currentAuths / goalAuths) * 100;
  return Math.min(Math.round(rate), 100);
};

/**
 * 거북이 진행도 계산 (고정 속도)
 * @param {number} daysElapsed - 경과 일수
 * @param {number} weeklyGoal - 주간 목표
 * @returns {number} 거북이 기대 인증 횟수
 */
export const calculateTurtleProgress = (daysElapsed, weeklyGoal) => {
  const weeks = daysElapsed / 7;
  return Math.round(weeklyGoal * weeks);
};

/**
 * 우승자 판정
 * @param {number} completionRate - 토끼 완료율
 * @returns {string} 'rabbit' | 'turtle' | 'tie'
 */
export const determineWinner = (completionRate) => {
  if (completionRate < 50) return 'turtle';
  if (completionRate === 50) return 'tie';
  return 'rabbit';
};

/**
 * 경과 일수 계산
 * @param {string} startDate - ISO 8601 시작 날짜
 * @param {Date} [today=new Date()] - 기준 날짜
 * @returns {number} 경과 일수
 */
export const getDaysElapsed = (startDate, today = new Date()) => {
  const start = new Date(startDate);
  start.setHours(0, 0, 0, 0);

  const current = new Date(today);
  current.setHours(0, 0, 0, 0);

  const diffTime = current - start;
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

  return Math.max(0, diffDays + 1); // 시작일 포함, 음수 방지
};

/**
 * 남은 일수 계산
 * @param {string} endDate - ISO 8601 종료 날짜
 * @param {Date} [today=new Date()] - 기준 날짜
 * @returns {number} 남은 일수
 */
export const getDaysRemaining = (endDate, today = new Date()) => {
  const end = new Date(endDate);
  end.setHours(23, 59, 59, 999);

  const current = new Date(today);
  current.setHours(0, 0, 0, 0);

  const diffTime = end - current;
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

  return Math.max(0, diffDays + 1); // 종료일 포함
};

/**
 * 전체 경주 기간 계산
 * @param {string} startDate - ISO 8601 시작 날짜
 * @param {string} endDate - ISO 8601 종료 날짜
 * @returns {number} 전체 일수
 */
export const getTotalRaceDays = (startDate, endDate) => {
  const start = new Date(startDate);
  start.setHours(0, 0, 0, 0);

  const end = new Date(endDate);
  end.setHours(23, 59, 59, 999);

  const diffTime = end - start;
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

  return diffDays + 1; // 시작일 포함
};

/**
 * 경주 만료 여부 확인
 * @param {string} endDate - ISO 8601 종료 날짜
 * @param {Date} [today=new Date()] - 기준 날짜
 * @returns {boolean} 종료 여부
 */
export const isRaceExpired = (endDate, today = new Date()) => {
  const end = new Date(endDate);
  const current = new Date(today);
  return current > end;
};

/**
 * 프로그레스 바 위치 계산
 * @param {number} completionRate - 완료율 (0~100)
 * @param {number} maxWidth - 최대 너비 (px)
 * @returns {number} 프로그레스 바 너비
 */
export const getProgressBarWidth = (completionRate, maxWidth = 100) => {
  return (completionRate / 100) * maxWidth;
};

/**
 * 거리 검증 (GPS 인증)
 * @param {number} distance - 거리 (km)
 * @param {number} minimumDistance - 최소 거리 (기본값: 3km)
 * @returns {boolean} 유효 여부
 */
export const isValidDistance = (distance, minimumDistance = 3) => {
  return distance >= minimumDistance;
};

/**
 * 시간 형식 변환 (초 → HH:MM:SS)
 * @param {number} seconds - 초
 * @returns {string} 포맷된 시간
 */
export const formatDuration = (seconds) => {
  if (!seconds) return '00:00:00';

  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
};

/**
 * 거리 형식 변환 (숫자 → 문자열)
 * @param {number} km - 거리 (km)
 * @returns {string} 포맷된 거리
 */
export const formatDistance = (km) => {
  if (!km) return '0 km';
  return `${km.toFixed(2)} km`;
};

/**
 * 날짜 형식 변환
 * @param {string} isoDate - ISO 8601 날짜
 * @param {string} locale - 로케일 (기본값: 'ko-KR')
 * @returns {string} 포맷된 날짜
 */
export const formatDate = (isoDate, locale = 'ko-KR') => {
  const date = new Date(isoDate);
  return date.toLocaleDateString(locale, {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  });
};

/**
 * 날짜 범위 문자열
 * @param {string} startDate - 시작 날짜
 * @param {string} endDate - 종료 날짜
 * @param {string} locale - 로케일
 * @returns {string} "2026-05-11 ~ 2026-06-11"
 */
export const formatDateRange = (startDate, endDate, locale = 'ko-KR') => {
  return `${formatDate(startDate, locale)} ~ ${formatDate(endDate, locale)}`;
};

/**
 * 오늘 날짜를 ISO 문자열로 (시간 제외)
 * @returns {string} "2026-05-11"
 */
export const getTodayDateString = () => {
  return new Date().toISOString().split('T')[0];
};

/**
 * 주간 요일 배열
 * @param {Date} [baseDate=new Date()] - 기준 날짜
 * @returns {Array} [{day: '월', date: '05-11'}, ...]
 */
export const getWeekDays = (baseDate = new Date()) => {
  const days = ['일', '월', '화', '수', '목', '금', '토'];
  const result = [];

  // 지난 주 월요일부터 시작
  const curr = new Date(baseDate);
  const first = curr.getDate() - curr.getDay();

  for (let i = 0; i < 7; i++) {
    const date = new Date(curr.setDate(first + i));
    result.push({
      day: days[date.getDay()],
      date: `${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`,
      fullDate: date.toISOString().split('T')[0]
    });
  }

  return result;
};
