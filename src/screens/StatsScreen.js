import React, { useEffect, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { HopCard, HopProgressBar, HopScreen, HopText } from '../components';
import { colors, spacing, borderRadius } from '../theme/tokens';
import { copy } from '../constants/copy';
import {
  getActiveRace,
  getAuthenticationCount,
  getWeeklyAuthCounts
} from '../database/queries';
import {
  getTotalRaceDays,
  getDaysElapsed,
  calculateGoalAuthentications,
  calculateCompletionRate,
  getWeekDays
} from '../utils/calculations';

const StatsScreen = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStats = async () => {
      try {
        const race = await getActiveRace();
        if (!race) {
          setStats(null);
          return;
        }

        const authCount = await getAuthenticationCount(race.raceId);
        const totalDays = getTotalRaceDays(race.startDate, race.endDate);
        const daysElapsed = getDaysElapsed(race.startDate);
        const goalAuths = calculateGoalAuthentications(race.weeklyGoal, totalDays);
        const completionRate = calculateCompletionRate(authCount, goalAuths);
        const weekDays = getWeekDays();
        const counts = await getWeeklyAuthCounts(
          race.raceId,
          weekDays.map((d) => d.fullDate)
        );

        const weeklyData = {
          labels: weekDays.map((d) => d.day),
          values: counts
        };

        setStats({
          race,
          authCount,
          totalDays,
          daysElapsed,
          goalAuths,
          completionRate,
          weeklyData
        });
      } catch (error) {
        console.error('Failed to load stats:', error);
      } finally {
        setLoading(false);
      }
    };

    loadStats();
  }, []);

  if (loading) {
    return (
      <HopScreen center>
        <HopText variant="body" tone="light">
          {copy.common.loading}
        </HopText>
      </HopScreen>
    );
  }

  if (!stats) {
    return (
      <HopScreen center>
        <HopText variant="body" tone="light" style={styles.emptyText}>
          {copy.stats.empty.message}
        </HopText>
      </HopScreen>
    );
  }

  return (
    <HopScreen>
      <HopText variant="h1" weight="bold" tone="dark" style={styles.title}>
        {copy.stats.title}
      </HopText>

      {/* 전체 통계 */}
      <HopCard variant="default">
        <StatRow label={copy.stats.labels.totalAuth} value={`${stats.authCount}회`} />
        <Divider />
        <StatRow label={copy.stats.labels.goal} value={`${stats.goalAuths}회`} />
        <Divider />
        <StatRow
          label={copy.stats.labels.rate}
          value={`${stats.completionRate}%`}
          highlight
        />
        <Divider />
        <StatRow
          label={copy.stats.labels.elapsed}
          value={`${stats.daysElapsed}/${stats.totalDays}일`}
        />
      </HopCard>

      {/* 진행률 시각화 */}
      <HopCard variant="success">
        <HopProgressBar
          variant="rabbit"
          progress={stats.completionRate / 100}
          label="🐰 토끼"
          value={`${stats.completionRate}%`}
          detail={`목표 ${stats.goalAuths}회 중 ${stats.authCount}회`}
        />
      </HopCard>

      {/* 주간 차트 */}
      <HopCard variant="default">
        <HopText variant="h4" weight="semibold" tone="dark" style={styles.chartTitle}>
          {copy.stats.weeklyStats}
        </HopText>
        <View style={styles.weeklyChart}>
          {stats.weeklyData.labels.map((day, idx) => {
            const done = stats.weeklyData.values[idx] > 0;
            return (
              <View key={idx} style={styles.weeklyBar}>
                <View
                  style={[
                    styles.bar,
                    {
                      height: 12 + stats.weeklyData.values[idx] * 60,
                      backgroundColor: done
                        ? colors.primary.warmSage
                        : colors.secondary.neutralGray
                    }
                  ]}
                />
                <HopText variant="caption" tone="light" style={styles.weeklyLabel}>
                  {day}
                </HopText>
              </View>
            );
          })}
        </View>
      </HopCard>

      {/* 경주 정보 */}
      <HopCard variant="default">
        <HopText variant="h4" weight="semibold" tone="dark" style={styles.infoTitle}>
          {copy.stats.raceInfo.title}
        </HopText>
        <InfoRow
          label={copy.stats.raceInfo.period}
          value={`${new Date(stats.race.startDate).toLocaleDateString('ko-KR')} ~ ${new Date(stats.race.endDate).toLocaleDateString('ko-KR')}`}
        />
        <InfoRow
          label={copy.stats.raceInfo.weeklyGoal}
          value={`${stats.race.weeklyGoal}회`}
        />
        <InfoRow
          label={copy.stats.raceInfo.methods}
          value={[
            stats.race.authMethodGPS ? '📍 GPS' : null,
            stats.race.authMethodPhoto ? '📸 사진' : null
          ]
            .filter(Boolean)
            .join(', ')}
        />
      </HopCard>
    </HopScreen>
  );
};

const StatRow = ({ label, value, highlight = false }) => (
  <View style={styles.statRow}>
    <HopText variant="bodySmall" tone="light">
      {label}
    </HopText>
    <HopText
      variant="h3"
      weight="bold"
      tone={highlight ? 'rabbit' : 'dark'}
    >
      {value}
    </HopText>
  </View>
);

const InfoRow = ({ label, value }) => (
  <View style={styles.infoRow}>
    <HopText variant="bodySmall" tone="light">
      {label}
    </HopText>
    <HopText variant="bodySmall" tone="medium" weight="medium" style={styles.infoValue}>
      {value}
    </HopText>
  </View>
);

const Divider = () => <View style={styles.divider} />;

const styles = StyleSheet.create({
  emptyText: {
    textAlign: 'center'
  },
  title: {
    marginBottom: spacing.md,
    textAlign: 'center'
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm
  },
  divider: {
    height: 1,
    backgroundColor: colors.secondary.neutralGray
  },
  chartTitle: {
    marginBottom: spacing.md
  },
  weeklyChart: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'flex-end',
    height: 100
  },
  weeklyBar: {
    alignItems: 'center',
    flex: 1
  },
  bar: {
    width: 18,
    borderRadius: borderRadius.xs,
    marginBottom: spacing.xs
  },
  weeklyLabel: {
    marginTop: spacing.xs
  },
  infoTitle: {
    marginBottom: spacing.sm
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral.bgLight
  },
  infoValue: {
    flexShrink: 1,
    textAlign: 'right',
    marginLeft: spacing.sm
  }
});

export default StatsScreen;
