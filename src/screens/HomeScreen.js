import React, { useEffect, useState, useRef } from 'react';
import {
  View, StyleSheet, ImageBackground, Image,
  Animated, Dimensions, ScrollView, TouchableOpacity, Platform,
} from 'react-native';
import { HopButton, HopText } from '../components';
import { colors, spacing } from '../theme/tokens';
import { copy } from '../constants/copy';
import {
  getActiveRace,
  getAuthenticationCount,
  updateRaceStatus,
} from '../database/queries';
import {
  getDaysElapsed, getDaysRemaining, getTotalRaceDays,
  calculateGoalAuthentications, calculateCompletionRate,
  calculateTurtleProgress, isRaceExpired, determineWinner,
} from '../utils/calculations';

// ── 화면 크기 ───────────────────────────────────────────────────
const { width: SW, height: SH } = Dimensions.get('window');

// 트랙 이미지 원본 1536×1024
// 비율 유지 높이를 화면 높이 22% 이내로 제한 (375×812 기준 → ~178px)
const IMG_W = 1536;
const IMG_H = 1024;
const TRACK_H = Math.min(
  Math.round((SW / IMG_W) * IMG_H),
  Math.round(SH * 0.22),
);

// 트랙 범위 (원본 픽셀 → 비율)
// 간판 오른쪽 ~ 깃발 왼쪽
const X_START_R = 0.09;   // ~9%
const X_END_R   = 0.90;   // ~90%
const Y_FLOOR_R = 0.795;  // 캐릭터 발 위치 (~79.5% from top)

const TRACK_X_START = SW * X_START_R;
const TRACK_X_END   = SW * X_END_R;
const TRACK_FLOOR_Y = TRACK_H * Y_FLOOR_R;

// 캐릭터 표시 크기 (더 크게 표시)
const RABBIT_W = 72, RABBIT_H = 34;
const TURTLE_W = 54, TURTLE_H = 34;

// ── 컴포넌트 ────────────────────────────────────────────────────
const HomeScreen = ({ navigation }) => {
  const [race, setRace]   = useState(null);
  const [stats, setStats] = useState(null);

  const rabbitAnim  = useRef(new Animated.Value(0)).current;
  const turtleAnim  = useRef(new Animated.Value(0)).current;
  const bouncAnim   = useRef(new Animated.Value(0)).current;

  // 토끼 달리기 바운스
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(bouncAnim, { toValue: -5, duration: 200, useNativeDriver: true }),
        Animated.timing(bouncAnim, { toValue:  0, duration: 200, useNativeDriver: true }),
        Animated.delay(700),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, []);

  // 진행률 → 캐릭터 위치 애니메이션
  useEffect(() => {
    if (!stats) return;
    Animated.spring(rabbitAnim, {
      toValue: Math.min(stats.completionRate / 100, 1),
      tension: 40, friction: 8, useNativeDriver: false,
    }).start();
    Animated.spring(turtleAnim, {
      toValue: Math.min(stats.turtleRate / 100, 1),
      tension: 25, friction: 10, useNativeDriver: false,
    }).start();
  }, [stats?.completionRate, stats?.turtleRate]);

  const loadRaceData = async () => {
    try {
      const activeRace = await getActiveRace();
      if (!activeRace) { setRace(null); setStats(null); return; }

      const authCount      = await getAuthenticationCount(activeRace.raceId);
      const totalDays      = getTotalRaceDays(activeRace.startDate, activeRace.endDate);
      const daysElapsed    = getDaysElapsed(activeRace.startDate);
      const daysRemaining  = getDaysRemaining(activeRace.endDate);
      const goalAuths      = calculateGoalAuthentications(activeRace.weeklyGoal, totalDays);
      const completionRate = calculateCompletionRate(authCount, goalAuths);
      const turtleProgress = calculateTurtleProgress(daysElapsed, activeRace.weeklyGoal);
      const turtleRate     = goalAuths > 0 ? (turtleProgress / goalAuths) * 100 : 0;

      if (isRaceExpired(activeRace.endDate) && activeRace.status === 'active') {
        const winner = determineWinner(completionRate);
        await updateRaceStatus(activeRace.raceId, 'completed', winner, completionRate);
        navigation.navigate('Result', { raceId: activeRace.raceId });
        return;
      }

      setRace(activeRace);
      setStats({ totalAuths: authCount, goalAuths, completionRate,
                 daysElapsed, daysRemaining, totalDays,
                 turtleProgress, turtleRate,
                 isBehind: completionRate < turtleRate });
    } catch (err) {
      console.error('HomeScreen:', err);
    }
  };

  useEffect(() => {
    loadRaceData();
    const id = setInterval(loadRaceData, 30000);
    return () => clearInterval(id);
  }, []);

  // 경주 X 픽셀 위치 (Animated)
  const rabbitLeft = rabbitAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [TRACK_X_START, TRACK_X_END - RABBIT_W],
  });
  const turtleLeft = turtleAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [TRACK_X_START, TRACK_X_END - TURTLE_W],
  });

  // ── 경주 없음 ──────────────────────────────────────────────────
  if (!race || !stats) {
    return (
      <View style={styles.root}>
        <View style={styles.trackWrapper}>
          <ImageBackground
            source={require('../../assets/track.png')}
            style={styles.trackImg}
            resizeMode="stretch"
          />
        </View>
        <View style={styles.emptyPanel}>
          <HopText variant="h2" weight="bold" tone="dark" style={styles.emptyTitle}>
            🐰 경주를 시작해보세요!
          </HopText>
          <HopText variant="body" tone="light" style={styles.emptyDesc}>
            {copy.home.empty.subtitle}
          </HopText>
          <HopButton
            title={copy.home.empty.button}
            variant="primary"
            onPress={() => navigation.navigate('InitialSettings')}
          />
        </View>
      </View>
    );
  }

  const isWinning = stats.completionRate >= stats.turtleRate;
  const rabbitPct = Math.round(stats.completionRate);
  const turtlePct = Math.round(stats.turtleRate);

  // ── 경주 진행 중 ───────────────────────────────────────────────
  return (
    <View style={styles.root}>

      {/* ① 트랙 영역 */}
      <View style={styles.trackWrapper}>
        <ImageBackground
          source={require('../../assets/track.png')}
          style={styles.trackImg}
          resizeMode="stretch"
        >
          {/* 토끼 (사용자) */}
          <Animated.View
            style={[
              styles.charAbs,
              {
                left: rabbitLeft,
                top: TRACK_FLOOR_Y - RABBIT_H,
                transform: [{ translateY: bouncAnim }],
              },
            ]}
          >
            <Image
              source={require('../../assets/rabbit.png')}
              style={{ width: RABBIT_W, height: RABBIT_H }}
              resizeMode="contain"
            />
          </Animated.View>

          {/* 거북이 (기준 속도) */}
          <Animated.View
            style={[
              styles.charAbs,
              { left: turtleLeft, top: TRACK_FLOOR_Y - TURTLE_H },
            ]}
          >
            <Image
              source={require('../../assets/turtle.png')}
              style={{ width: TURTLE_W, height: TURTLE_H }}
              resizeMode="contain"
            />
          </Animated.View>

          {/* 상태 뱃지 */}
          <View style={styles.badge}>
            <HopText variant="caption" style={styles.badgeText}>
              {isWinning ? '🐰 앞서고 있어요!' : '🐢 따라오고 있어요!'}
            </HopText>
          </View>
        </ImageBackground>
      </View>

      {/* ② 정보 패널 */}
      <ScrollView
        style={styles.panel}
        contentContainerStyle={styles.panelInner}
        showsVerticalScrollIndicator={false}
      >
        {/* 진행률 카드 */}
        <View style={styles.rateCard}>
          {/* 토끼 */}
          <View style={styles.rateCol}>
            <HopText variant="caption" tone="light">🐰 내 진행률</HopText>
            <HopText variant="h1" weight="bold" style={{ color: colors.primary.warmSage }}>
              {rabbitPct}%
            </HopText>
            <HopText variant="caption" tone="light">
              {stats.totalAuths} / {stats.goalAuths}회
            </HopText>
          </View>

          {/* 구분선 */}
          <View style={styles.divider} />

          {/* VS */}
          <View style={styles.vsCol}>
            <HopText variant="h3" weight="bold" tone="light">VS</HopText>
          </View>

          <View style={styles.divider} />

          {/* 거북이 */}
          <View style={styles.rateCol}>
            <HopText variant="caption" tone="light">🐢 거북이</HopText>
            <HopText variant="h1" weight="bold" style={{ color: colors.primary.coolMoss }}>
              {turtlePct}%
            </HopText>
            <HopText variant="caption" tone="light">
              기대 {stats.turtleProgress}회
            </HopText>
          </View>
        </View>

        {/* 진행 바 */}
        <View style={styles.barRow}>
          <View style={styles.barTrack}>
            <Animated.View
              style={[
                styles.barFill,
                {
                  width: rabbitAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: ['0%', '100%'],
                  }),
                  backgroundColor: colors.primary.warmSage,
                },
              ]}
            />
          </View>
        </View>
        <View style={styles.barRow}>
          <View style={[styles.barTrack, { marginTop: 4 }]}>
            <Animated.View
              style={[
                styles.barFill,
                {
                  width: turtleAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: ['0%', '100%'],
                  }),
                  backgroundColor: colors.primary.coolMoss,
                },
              ]}
            />
          </View>
        </View>

        {/* 경고 */}
        {stats.isBehind && (
          <View style={styles.warnRow}>
            <HopText variant="bodySmall" style={{ color: colors.primary.carrotOrange }}>
              ⚠️ {copy.home.turtleCatching.message}
            </HopText>
          </View>
        )}

        {/* 날짜 요약 */}
        <View style={styles.dateRow}>
          <HopText variant="caption" tone="light">
            경과 {stats.daysElapsed}일
          </HopText>
          <HopText variant="caption" tone="light">
            남은 {stats.daysRemaining}일 / 총 {stats.totalDays}일
          </HopText>
        </View>

        {/* 버튼 */}
        <HopButton
          title={copy.home.button.authNow}
          variant="primary"
          onPress={() => navigation.navigate('Auth')}
          style={styles.hopBtn}
        />

        <View style={styles.secondRow}>
          <TouchableOpacity onPress={() => navigation.navigate('Stats')} style={styles.secondBtn}>
            <HopText variant="body" weight="semibold" tone="medium">📊 통계</HopText>
          </TouchableOpacity>
          <TouchableOpacity onPress={loadRaceData} style={styles.secondBtn}>
            <HopText variant="body" weight="semibold" tone="medium">↻ 새로고침</HopText>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

// ── 스타일 ───────────────────────────────────────────────────────
const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#F5F3F0',
  },

  // 트랙
  trackWrapper: {
    width: SW,
    height: TRACK_H,
    overflow: 'hidden',
  },
  trackImg: {
    width: SW,
    height: TRACK_H,
  },
  charAbs: {
    position: 'absolute',
  },
  badge: {
    position: 'absolute',
    top: 8,
    alignSelf: 'center',
    left: SW / 2 - 80,
    width: 160,
    backgroundColor: 'rgba(0,0,0,0.45)',
    borderRadius: 10,
    paddingVertical: 3,
    paddingHorizontal: 10,
    alignItems: 'center',
  },
  badgeText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },

  // 패널
  panel: {
    flex: 1,
  },
  panelInner: {
    padding: spacing.md,
    gap: spacing.sm,
    paddingBottom: spacing.xl,
  },

  // 진행률 카드
  rateCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E0DDD8',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
    alignItems: 'center',
  },
  rateCol: {
    flex: 3,
    alignItems: 'center',
    gap: 2,
  },
  vsCol: {
    flex: 1,
    alignItems: 'center',
  },
  divider: {
    width: 1,
    height: 52,
    backgroundColor: '#E0DDD8',
  },

  // 진행 바
  barRow: {
    paddingHorizontal: 2,
  },
  barTrack: {
    height: 8,
    borderRadius: 4,
    backgroundColor: '#E8DCC8',
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    borderRadius: 4,
  },

  // 경고
  warnRow: {
    backgroundColor: '#FFF4E8',
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: colors.primary.carrotOrange,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },

  // 날짜
  dateRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 2,
  },

  // 버튼
  hopBtn: {
    marginTop: spacing.xs,
  },
  secondRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: 4,
    paddingHorizontal: spacing.xs,
  },
  secondBtn: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E0DDD8',
  },

  // 빈 상태
  emptyPanel: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
    gap: spacing.md,
  },
  emptyTitle: {
    textAlign: 'center',
  },
  emptyDesc: {
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
});

export default HomeScreen;
