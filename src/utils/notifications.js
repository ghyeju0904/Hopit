/**
 * HOP 알림 시스템
 *
 * expo-notifications 기반 로컬 알림 스케줄링.
 * 5가지 핵심 메시지 중 시간 기반 알림 2개를 처리:
 *   - 밤 10시: "토끼가 잠들기 전에 Hop 하세요 💤" (오늘 미인증 시)
 *   - 매일 오전 9시: "거북이가 따라오고 있어요 🐢" (뒤처져 있을 때)
 */

import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { copy } from '../constants/copy';

const CHANNEL_ID = 'hopit-default';

const TAG = {
  EVENING_REMINDER: 'evening-reminder',
  TURTLE_CATCHING: 'turtle-catching',
  STREAK: 'streak'
};

/**
 * 알림 권한 요청 + Android 채널 등록
 */
export const ensureNotificationPermissions = async () => {
  const settings = await Notifications.getPermissionsAsync();
  if (settings.status !== 'granted') {
    const req = await Notifications.requestPermissionsAsync();
    if (req.status !== 'granted') {
      return false;
    }
  }

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync(CHANNEL_ID, {
      name: 'HOP 알림',
      importance: Notifications.AndroidImportance.DEFAULT,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#7FB069'
    });
  }

  return true;
};

/**
 * 기존 동일 태그 알림 제거
 */
const cancelByTag = async (tag) => {
  const scheduled = await Notifications.getAllScheduledNotificationsAsync();
  for (const n of scheduled) {
    if (n.content?.data?.tag === tag) {
      await Notifications.cancelScheduledNotificationAsync(n.identifier);
    }
  }
};

/**
 * 매일 밤 10시 알림 ("토끼가 잠들기 전에 Hop 하세요 💤")
 */
export const scheduleEveningReminder = async () => {
  const ok = await ensureNotificationPermissions();
  if (!ok) return null;

  await cancelByTag(TAG.EVENING_REMINDER);

  return Notifications.scheduleNotificationAsync({
    content: {
      title: 'HOP',
      body: copy.home.rabbitSleeping.message,
      data: { tag: TAG.EVENING_REMINDER }
    },
    trigger: {
      hour: 22,
      minute: 0,
      repeats: true,
      channelId: CHANNEL_ID
    }
  });
};

/**
 * 매일 오전 9시 거북이 알림
 */
export const scheduleTurtleCatchingReminder = async () => {
  const ok = await ensureNotificationPermissions();
  if (!ok) return null;

  await cancelByTag(TAG.TURTLE_CATCHING);

  return Notifications.scheduleNotificationAsync({
    content: {
      title: 'HOP',
      body: copy.home.turtleCatching.message,
      data: { tag: TAG.TURTLE_CATCHING }
    },
    trigger: {
      hour: 9,
      minute: 0,
      repeats: true,
      channelId: CHANNEL_ID
    }
  });
};

/**
 * 연속 달성 즉시 알림 ("3일 연속 Hop 성공! 🔥")
 */
export const fireStreakNotification = async (days) => {
  const ok = await ensureNotificationPermissions();
  if (!ok) return null;

  return Notifications.scheduleNotificationAsync({
    content: {
      title: '🔥 ' + copy.result.streak.badge,
      body: copy.result.streak.message(days),
      data: { tag: TAG.STREAK, days }
    },
    trigger: null // 즉시
  });
};

/**
 * 모든 HOP 정기 알림 켜기 (앱 시작 시 호출)
 */
export const enableAllReminders = async () => {
  await scheduleEveningReminder();
  await scheduleTurtleCatchingReminder();
};

/**
 * 모든 HOP 정기 알림 끄기
 */
export const disableAllReminders = async () => {
  await cancelByTag(TAG.EVENING_REMINDER);
  await cancelByTag(TAG.TURTLE_CATCHING);
};
