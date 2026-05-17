import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import {
  colors,
  spacing,
  typography,
  borderRadius,
  hopTheme,
  componentThemes
} from '../theme/tokens';

/**
 * HOP 픽셀 아트 프로그레스 바
 *
 * Props:
 * - progress: 0~1 사이의 값
 * - variant: 'rabbit' | 'turtle' (색상 결정)
 * - label: 좌측 라벨 (예: "🐰 토끼")
 * - value: 우측 값 (예: "67%")
 * - detail: 하단 상세 (예: "10/15회 인증")
 */
const HopProgressBar = ({
  progress = 0,
  variant = 'rabbit',
  label,
  value,
  detail,
  style
}) => {
  const clamped = Math.max(0, Math.min(1, progress));
  const theme = componentThemes.progressBar[variant] || componentThemes.progressBar.rabbit;

  return (
    <View style={[styles.wrapper, style]}>
      {(label || value) && (
        <View style={styles.header}>
          {label ? <Text style={styles.label}>{label}</Text> : <View />}
          {value ? (
            <Text style={[styles.value, { color: theme.fill }]}>{value}</Text>
          ) : null}
        </View>
      )}

      <View
        style={[
          styles.track,
          {
            backgroundColor: theme.track,
            borderColor: theme.border
          }
        ]}
      >
        <View
          style={[
            styles.fill,
            {
              width: `${clamped * 100}%`,
              backgroundColor: theme.fill
            }
          ]}
        />
      </View>

      {detail ? <Text style={styles.detail}>{detail}</Text> : null}
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    width: '100%',
    marginVertical: spacing.xs
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs
  },
  label: {
    fontSize: typography.fontSize.h4,
    fontWeight: String(typography.fontWeight.semibold),
    color: colors.neutral.textDark
  },
  value: {
    fontSize: typography.fontSize.h3,
    fontWeight: String(typography.fontWeight.bold)
  },
  track: {
    height: 14,
    borderRadius: borderRadius.xs,
    borderWidth: 1,
    overflow: 'hidden'
  },
  fill: {
    height: '100%',
    borderRadius: 0
  },
  detail: {
    marginTop: spacing.xs,
    fontSize: typography.fontSize.bodySmall,
    color: colors.neutral.textLight
  }
});

export default HopProgressBar;
