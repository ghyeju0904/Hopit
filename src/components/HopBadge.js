import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import {
  colors,
  spacing,
  typography,
  borderRadius
} from '../theme/tokens';

/**
 * HOP 픽셀 아트 배지
 *
 * Props:
 * - tone: 'success' | 'warning' | 'info' | 'winner'
 * - label: 텍스트
 * - icon: 이모지/선두 아이콘
 */
const TONE_MAP = {
  success: colors.success,
  warning: colors.warning,
  info: colors.info,
  winner: colors.primary.warmSage,
  error: colors.error,
  carrot: colors.primary.carrotOrange
};

const HopBadge = ({ tone = 'success', label, icon, style, textStyle }) => {
  const bg = TONE_MAP[tone] || TONE_MAP.success;

  return (
    <View style={[styles.badge, { backgroundColor: bg }, style]}>
      {icon ? <Text style={[styles.icon, textStyle]}>{icon} </Text> : null}
      {label ? <Text style={[styles.text, textStyle]}>{label}</Text> : null}
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm
  },
  icon: {
    fontSize: typography.fontSize.bodySmall,
    color: '#FFFFFF'
  },
  text: {
    fontSize: typography.fontSize.bodySmall,
    fontWeight: String(typography.fontWeight.bold),
    color: '#FFFFFF'
  }
});

export default HopBadge;
