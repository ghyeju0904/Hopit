import React from 'react';
import { View, StyleSheet } from 'react-native';
import {
  colors,
  spacing,
  borderRadius,
  componentThemes
} from '../theme/tokens';

/**
 * HOP 픽셀 아트 카드
 *
 * Props:
 * - variant: 'default' | 'success' | 'warning'
 * - tone: 미리 정의된 배경 톤 (예: 'celebration', 'mapArea')
 * - children
 */
const HopCard = ({
  variant = 'default',
  background,
  style,
  contentStyle,
  children
}) => {
  const theme = componentThemes.card[variant] || componentThemes.card.default;

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: background || theme.bg,
          borderColor: theme.border
        },
        style
      ]}
    >
      <View style={[styles.content, contentStyle]}>{children}</View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderWidth: 2,
    borderRadius: borderRadius.sm,
    marginVertical: spacing.xs,
    // 픽셀 스타일 하드 그림자
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 0,
    elevation: 2
  },
  content: {
    padding: spacing.md
  }
});

export default HopCard;
