import React, { useEffect, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import {
  HopButton,
  HopCard,
  HopProgressBar,
  HopScreen,
  HopText,
  HopBadge,
  JumpingRabbit,
  TurtleSprite
} from '../components';
import { colors, spacing } from '../theme/tokens';
import { copy } from '../constants/copy';
import {
  getActiveRace,
  getAuthenticationCount,
  updateRaceStatus
} from '../database/queries';
import {
  getDaysElapsed,
  getDaysRemaining,
  getTotalRaceDays,
  calculateGoalAuthentications,
  calculateCompletionRate,
  calculateTurtleProgress,
  isRaceExpired,
  determineWinner
} from '../utils/calculations';

const HomeScreen = ({ navigation }) => {
  const [race, setRace] = useState(null);
  const [stats, setStats] = useState(null);

  const loadRaceData = async () => {
    try {
      const activeRace = await getActiveRace();

      if (activeRace) {
        const authCount = await getAuthenticationCount(activeRace.raceId);
        const totalDays = getTotalRaceDays(activeRace.startDate, activeRace.endDate);
        const daysElapsed = getDaysElapsed(activeRace.startDate);
        const daysRemaining = getDaysRemaining(activeRace.endDate);
        const goalAuths = calculateGoalAuthentications(activeRace.weeklyGoal, totalDays);
        const completionRate = calculateCompletionRate(authCount, goalAuths);
        const turtleProgress = calculateTurtleProgress(daysElapsed, activeRace.weeklyGoal);

        // 경주 만료 시 자동 종료 + ResultScreen 진입
        if (isRaceExpired(activeRace.endDate) && activeRace.status === 'active') {
          const winner = determineWinner(completionRate);
          await updateRaceStatus(
            activeRace.raceId,
            'completed',
            winner,
            completionRate
          );
          navigation.navigate('Result', { raceId: activeRace.raceId });
          return;
        }

        setRace(activeRace);
        setStats({
          totalAuths: authCount,
          goalAuths,
          completionRate,
          daysElapsed,
          daysRemaining,
          totalDays,
          turtleProgress,
          turtleRate: goalAuths > 0 ? (turtleProgress / goalAuths) * 100 : 0,
          isExpired: isRaceExpired(activeRace.endDate),
          isBehind: completionRate < (turtleProgress / Math.max(goalAuths, 1)) * 100
        });
      } else {
        setRace(null);
        setStats(null);
      }
    } catch (error) {
      console.error('Failed to load race data:', error);
    }
  };

  useEffect(() => {
    loadRaceData();
    const interval = setInterval(loadRaceData, 30000);
    return () => clearInterval(interval);
  }, []);

  // 빈 상태
  if (!race || !stats) {
    return (
      <HopScreen center>
        <View style={styles.emptyContainer}>
          <JumpingRabbit size={88} jumpHeight={14} />
          <HopText
            variant="h1"
            weight="bold"
            tone="dark"
            style={styles.emptyTitle}
          >
            {copy.home.empty.title}
          </HopText>
          <HopText variant="body" tone="light" style={styles.emptySubtitle}>
            {copy.home.empty.subtitle}
          </HopText>
          <HopButton
            title={copy.home.empty.button}
            variant="primary"
            onPress={() => navigation.navigate('InitialSettings')}
            style={styles.emptyButton}
          />
        </View>
      </HopScreen>
    );
  }

  return (
    <HopScreen>
      {/* 헤더 카드 */}
      <HopCard
        variant="default"
        background={colors.secondary.warmBeige}
      >
        <View style={styles.headerRow}>
          <View>
            <HopText variant="h2" tone="dark" weight="bold">
              🏁 {copy.home.header}
            </HopText>
            <HopText variant="bodySmall" tone="brown" style={styles.headerSub}>
              {copy.home.header}
              {' · '}
              {copy.time.daysRemaining(stats.daysRemaining)}
              {' '}
              ({stats.daysElapsed}/{stats.totalDays})
            </HopText>
          </View>
          <HopBadge
            tone="warning"
            icon="🔥"
            label={`${stats.daysElapsed}일`}
          />
        </View>
      </HopCard>

      {/* 거북이 따라오기 메시지 */}
      {stats.isBehind && (
        <HopCard variant="warning">
          <HopText variant="body" tone="turtle" weight="semibold">
            {copy.home.turtleCatching.message}
          </HopText>
          <HopText variant="bodySmall" tone="medium" style={{ marginTop: 4 }}>
            {copy.home.turtleCatching.cta}
          </HopText>
        </HopCard>
      )}

      {/* 토끼 프로그레스 */}
      <HopCard variant="success">
        <View style={styles.charRow}>
          <JumpingRabbit size={56} jumpHeight={10} />
          <View style={styles.charBarFlex}>
            <HopProgressBar
              variant="rabbit"
              progress={stats.completionRate / 100}
              label={`${copy.home.rabbit.label} ${copy.home.rabbit.sublabel}`}
              value={`${stats.completionRate}%`}
              detail={`${stats.totalAuths}/${stats.goalAuths}회 인증 완료`}
            />
          </View>
        </View>
      </HopCard>

      {/* 거북이 프로그레스 */}
      <HopCard variant="default">
        <View style={styles.charRow}>
          <TurtleSprite size={56} />
          <View style={styles.charBarFlex}>
            <HopProgressBar
              variant="turtle"
              progress={stats.turtleRate / 100}
              label={`${copy.home.turtle.label} ${copy.home.turtle.sublabel}`}
              value={`${Math.round(stats.turtleRate)}%`}
              detail={`${stats.turtleProgress}/${stats.goalAuths}회 기대치`}
            />
          </View>
        </View>
      </HopCard>

      {/* 통계 요약 */}
      <HopCard variant="default">
        <View style={styles.statsGrid}>
          <View style={styles.statItem}>
            <HopText variant="h1" tone="rabbit" weight="bold">
              {stats.totalAuths}
            </HopText>
            <HopText variant="caption" tone="light">
              {copy.home.card.stats}
            </HopText>
          </View>
          <View style={styles.statItem}>
            <HopText variant="h1" tone="dark" weight="bold">
              {stats.goalAuths}
            </HopText>
            <HopText variant="caption" tone="light">
              {copy.home.card.goal}
            </HopText>
          </View>
          <View style={styles.statItem}>
            <HopText variant="h1" tone="turtle" weight="bold">
              {stats.daysRemaining}
            </HopText>
            <HopText variant="caption" tone="light">
              남은 일수
            </HopText>
          </View>
        </View>
      </HopCard>

      {/* CTA */}
      <HopButton
        title={copy.home.button.authNow}
        variant="primary"
        onPress={() => navigation.navigate('Auth')}
        style={styles.mainButton}
      />
      <HopButton
        title={copy.home.button.stats}
        variant="secondary"
        onPress={() => navigation.navigate('Stats')}
      />

      <View style={styles.refreshRow}>
        <HopText
          variant="bodySmall"
          tone="brown"
          onPress={loadRaceData}
          style={styles.refreshText}
        >
          ↻ {copy.home.button.refresh}
        </HopText>
      </View>
    </HopScreen>
  );
};

const styles = StyleSheet.create({
  emptyContainer: {
    alignItems: 'center',
    paddingHorizontal: spacing.lg
  },
  charRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md
  },
  charBarFlex: {
    flex: 1
  },
  emptyTitle: {
    marginBottom: spacing.sm,
    textAlign: 'center'
  },
  emptySubtitle: {
    marginBottom: spacing.xl,
    textAlign: 'center'
  },
  emptyButton: {
    width: '80%'
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  headerSub: {
    marginTop: spacing.xs
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around'
  },
  statItem: {
    alignItems: 'center'
  },
  mainButton: {
    marginTop: spacing.md
  },
  refreshRow: {
    alignItems: 'center',
    marginVertical: spacing.md
  },
  refreshText: {
    textDecorationLine: 'underline'
  }
});

export default HomeScreen;
