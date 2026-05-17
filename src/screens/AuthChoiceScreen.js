import React, { useEffect, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { HopButton, HopCard, HopScreen, HopText } from '../components';
import { spacing } from '../theme/tokens';
import { copy } from '../constants/copy';
import { getActiveRace } from '../database/queries';

const AuthChoiceScreen = ({ navigation }) => {
  const [race, setRace] = useState(null);

  useEffect(() => {
    const loadRace = async () => {
      const activeRace = await getActiveRace();
      setRace(activeRace);
    };
    loadRace();
  }, []);

  if (!race) {
    return (
      <HopScreen center>
        <HopText variant="body" tone="light" style={styles.emptyText}>
          {copy.authChoice.empty.message}
        </HopText>
      </HopScreen>
    );
  }

  return (
    <HopScreen center>
      <HopText
        variant="h1"
        tone="dark"
        weight="bold"
        style={styles.title}
      >
        {copy.authChoice.title}
      </HopText>

      {race.authMethodGPS ? (
        <HopCard variant="success" style={styles.card}>
          <HopText style={styles.cardEmoji}>{copy.authChoice.gps.emoji}</HopText>
          <HopText variant="h2" weight="bold" tone="dark" style={styles.cardTitle}>
            {copy.authChoice.gps.title}
          </HopText>
          <HopText variant="bodySmall" tone="light" style={styles.cardDesc}>
            {copy.authChoice.gps.description}
          </HopText>
          <HopText variant="caption" tone="light" style={styles.cardHint}>
            {copy.authChoice.gps.requirement}
          </HopText>
          <HopButton
            title={copy.authChoice.gps.button}
            variant="primary"
            onPress={() => navigation.navigate('GPS')}
            style={styles.cardButton}
          />
        </HopCard>
      ) : null}

      {race.authMethodPhoto ? (
        <HopCard variant="default" style={styles.card}>
          <HopText style={styles.cardEmoji}>{copy.authChoice.photo.emoji}</HopText>
          <HopText variant="h2" weight="bold" tone="dark" style={styles.cardTitle}>
            {copy.authChoice.photo.title}
          </HopText>
          <HopText variant="bodySmall" tone="light" style={styles.cardDesc}>
            {copy.authChoice.photo.description}
          </HopText>
          <HopText variant="caption" tone="light" style={styles.cardHint}>
            {copy.authChoice.photo.requirement}
          </HopText>
          <HopButton
            title={copy.authChoice.photo.button}
            variant="secondary"
            onPress={() => navigation.navigate('Photo')}
            style={styles.cardButton}
          />
        </HopCard>
      ) : null}
    </HopScreen>
  );
};

const styles = StyleSheet.create({
  emptyText: {
    textAlign: 'center'
  },
  title: {
    marginBottom: spacing.lg,
    textAlign: 'center'
  },
  card: {
    marginBottom: spacing.md
  },
  cardEmoji: {
    fontSize: 36,
    marginBottom: spacing.sm,
    textAlign: 'center'
  },
  cardTitle: {
    textAlign: 'center',
    marginBottom: spacing.xs
  },
  cardDesc: {
    textAlign: 'center',
    marginBottom: spacing.xs
  },
  cardHint: {
    textAlign: 'center',
    marginBottom: spacing.md
  },
  cardButton: {
    marginTop: spacing.xs
  }
});

export default AuthChoiceScreen;
