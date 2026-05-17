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
import { colors, spacing, hopTheme } from '../theme/tokens';
import { copy, getWinnerMessage } from '../constants/copy';
import { getRaceById } from '../database/queries';
import { determineWinner } from '../utils/calculations';

const ResultScreen = ({ route, navigation }) => {
  const { raceId } = route.params || {};
  const [race, setRace] = useState(null);
  const [winner, setWinner] = useState(null);

  useEffect(() => {
    const loadRace = async () => {
      if (raceId) {
        const raceData = await getRaceById(raceId);
        setRace(raceData);
        if (raceData?.completionRate !== undefined) {
          setWinner(determineWinner(raceData.completionRate));
        }
      }
    };
    loadRace();
  }, [raceId]);

  if (!race) {
    return (
      <HopScreen center>
        <HopText variant="body" tone="light" style={styles.emptyText}>
          {copy.result.empty.message}
        </HopText>
      </HopScreen>
    );
  }

  const completionRate = race.completionRate ?? 0;
  const winnerEmoji =
    winner === 'rabbit' ? '🐰' : winner === 'turtle' ? '🐢' : '🤝';

  // 우승자 톤 결정
  const winnerTone =
    winner === 'rabbit' ? 'rabbit' : winner === 'turtle' ? 'turtle' : 'carrot';
  const winnerVariant =
    winner === 'rabbit' ? 'rabbit' : winner === 'turtle' ? 'turtle' : 'rabbit';

  return (
    <HopScreen>
      {/* 축하 영역 */}
      <HopCard
        variant="default"
        background={hopTheme.backgrounds.celebration}
        contentStyle={styles.celebrationContent}
      >
        <HopText style={styles.confetti}>{copy.result.celebrate}</HopText>
        <HopText variant="h1" weight="bold" tone="dark" style={styles.celebrationTitle}>
          {copy.result.ended}
        </HopText>
      </HopCard>

      {/* 우승자 카드 */}
      <HopCard variant="success" contentStyle={styles.resultContent}>
        {winner === 'rabbit' ? (
          <JumpingRabbit size={88} jumpHeight={16} />
        ) : winner === 'turtle' ? (
          <TurtleSprite size={88} />
        ) : (
          <HopText style={styles.winnerEmoji}>{winnerEmoji}</HopText>
        )}
        <HopText
          variant="h2"
          weight="bold"
          tone={winnerTone}
          style={styles.winnerText}
        >
          {getWinnerMessage(completionRate)}
        </HopText>
        <HopText variant="bodySmall" tone="light" style={styles.finalRate}>
          최종 진행률: {completionRate.toFixed(1)}%
        </HopText>

        <HopProgressBar
          variant={winnerVariant}
          progress={Math.min(completionRate / 100, 1)}
          style={styles.progressBar}
        />
      </HopCard>

      {/* 연속 달성 배지 (3일 이상 가정) */}
      {completionRate >= 50 ? (
        <HopCard variant="warning" contentStyle={styles.streakContent}>
          <HopBadge
            tone="warning"
            icon="🔥"
            label={copy.result.streak.badge}
            style={styles.streakBadge}
          />
          <HopText variant="body" weight="semibold" tone="carrot" style={styles.streakText}>
            {copy.result.streak.message(3)}
          </HopText>
          <HopText variant="bodySmall" tone="light">
            {copy.result.streak.keep}
          </HopText>
        </HopCard>
      ) : null}

      {/* 최종 통계 */}
      <HopCard variant="default">
        <View style={styles.statRow}>
          <HopText variant="body" tone="dark">
            {copy.result.stats.rabbit}
          </HopText>
          <HopText variant="h3" weight="bold" tone="rabbit">
            {completionRate.toFixed(1)}%
          </HopText>
        </View>
        <View style={styles.divider} />
        <View style={styles.statRow}>
          <HopText variant="body" tone="dark">
            {copy.result.stats.turtle}
          </HopText>
          <HopText variant="h3" weight="bold" tone="turtle">
            50%
          </HopText>
        </View>
        <View style={styles.divider} />
        <HopText variant="caption" tone="light" style={styles.note}>
          {copy.result.stats.note}
        </HopText>
      </HopCard>

      <HopButton
        title={copy.result.button.newRace}
        variant="primary"
        onPress={() => navigation.navigate('InitialSettings')}
      />
      <HopButton
        title={copy.result.button.home}
        variant="secondary"
        onPress={() => navigation.navigate('MainTabs', { screen: 'Home' })}
      />
    </HopScreen>
  );
};

const styles = StyleSheet.create({
  emptyText: {
    textAlign: 'center'
  },
  celebrationContent: {
    alignItems: 'center',
    paddingVertical: spacing.lg
  },
  confetti: {
    fontSize: 48,
    marginBottom: spacing.md,
    textAlign: 'center'
  },
  celebrationTitle: {
    textAlign: 'center'
  },
  resultContent: {
    alignItems: 'center',
    paddingVertical: spacing.lg
  },
  winnerEmoji: {
    fontSize: 56,
    marginBottom: spacing.md,
    textAlign: 'center'
  },
  winnerText: {
    textAlign: 'center',
    marginBottom: spacing.sm
  },
  finalRate: {
    marginBottom: spacing.md
  },
  progressBar: {
    width: '100%',
    marginTop: spacing.sm
  },
  streakContent: {
    alignItems: 'center'
  },
  streakBadge: {
    marginBottom: spacing.sm
  },
  streakText: {
    textAlign: 'center',
    marginBottom: spacing.xs
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
  note: {
    marginTop: spacing.sm,
    paddingTop: spacing.sm,
    textAlign: 'center'
  }
});

export default ResultScreen;
