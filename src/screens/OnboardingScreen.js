import React from 'react';
import { View, StyleSheet } from 'react-native';
import {
  HopButton,
  HopCard,
  HopScreen,
  HopText,
  JumpingRabbit,
  TurtleSprite
} from '../components';
import { colors, spacing, typography } from '../theme/tokens';
import { copy } from '../constants/copy';

const OnboardingScreen = ({ navigation, onComplete }) => {
  const handleStart = async () => {
    if (onComplete) {
      await onComplete();
    }
    navigation.replace('InitialSettings');
  };

  return (
    <HopScreen contentContainerStyle={styles.container}>
      <View style={styles.content}>
        <View style={styles.heroRow}>
          <JumpingRabbit size={84} jumpHeight={14} />
          <View style={styles.heroSpacer} />
          <TurtleSprite size={84} />
        </View>

        <HopText variant="h1" tone="dark" weight="bold" style={styles.title}>
          {copy.onboarding.title}
        </HopText>
        <HopText variant="h3" tone="light" style={styles.subtitle}>
          {copy.onboarding.subtitle}
        </HopText>

        <HopCard
          variant="default"
          background={colors.secondary.warmBeige}
          style={styles.descriptionBox}
        >
          <HopText variant="body" tone="medium" style={styles.description}>
            {copy.onboarding.description}
          </HopText>
        </HopCard>

        <View style={styles.featuresBox}>
          <HopText variant="body" tone="medium" style={styles.featureItem}>
            {copy.onboarding.feature1}
          </HopText>
          <HopText variant="body" tone="medium" style={styles.featureItem}>
            {copy.onboarding.feature2}
          </HopText>
          <HopText variant="body" tone="medium" style={styles.featureItem}>
            {copy.onboarding.feature3}
          </HopText>
        </View>
      </View>

      <HopButton
        title={copy.onboarding.buttonStart}
        variant="primary"
        onPress={handleStart}
      />
    </HopScreen>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: 'space-between',
    paddingTop: spacing.xxl,
    paddingBottom: spacing.lg
  },
  content: {
    alignItems: 'center'
  },
  heroRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'center',
    marginBottom: spacing.lg
  },
  heroSpacer: {
    width: spacing.md
  },
  title: {
    fontSize: 28,
    textAlign: 'center',
    marginBottom: spacing.sm
  },
  subtitle: {
    textAlign: 'center',
    marginBottom: spacing.xl
  },
  descriptionBox: {
    width: '100%',
    marginBottom: spacing.lg,
    alignItems: 'center'
  },
  description: {
    lineHeight: typography.fontSize.body * 1.6,
    textAlign: 'center'
  },
  featuresBox: {
    width: '100%',
    paddingVertical: spacing.md
  },
  featureItem: {
    marginVertical: spacing.sm
  }
});

export default OnboardingScreen;
