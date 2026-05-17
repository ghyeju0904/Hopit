import React from 'react';
import { Text, StyleSheet } from 'react-native';
import { colors, typography } from '../theme/tokens';

/**
 * HOP 픽셀 아트 텍스트 컴포넌트
 *
 * Props:
 * - variant: 'h1' | 'h2' | 'h3' | 'h4' | 'body' | 'bodySmall' | 'caption'
 * - tone: 'dark' | 'medium' | 'light' | 'rabbit' | 'turtle' | 'carrot' | 'success' | 'warning'
 * - weight: 'regular' | 'medium' | 'semibold' | 'bold'
 */
const TONE_MAP = {
  dark: colors.neutral.textDark,
  medium: colors.neutral.textMedium,
  light: colors.neutral.textLight,
  rabbit: colors.primary.warmSage,
  turtle: colors.primary.coolMoss,
  carrot: colors.primary.carrotOrange,
  brown: colors.primary.warmBrown,
  success: colors.success,
  warning: colors.warning,
  info: colors.info,
  error: colors.error,
  white: '#FFFFFF'
};

const HopText = ({
  variant = 'body',
  tone = 'medium',
  weight,
  style,
  children,
  ...props
}) => {
  const size = typography.fontSize[variant] || typography.fontSize.body;
  const color = TONE_MAP[tone] || TONE_MAP.medium;
  const fontWeight = weight ? String(typography.fontWeight[weight]) : undefined;

  return (
    <Text
      style={[
        styles.base,
        { fontSize: size, color },
        fontWeight ? { fontWeight } : null,
        style
      ]}
      {...props}
    >
      {children}
    </Text>
  );
};

const styles = StyleSheet.create({
  base: {
    fontFamily: undefined // 시스템 폰트 사용 (커스텀 폰트 추가 시 변경)
  }
});

export default HopText;
